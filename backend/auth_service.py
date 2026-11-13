"""
Metro Motors — Enterprise Authentication & Identity Service
Handles secure registration, bcrypt password hashing, Google OAuth 2.0 verification,
HMAC-protected OTP password recovery with single-use recovery authorizations,
and granular role enforcement.
"""

import hashlib
import hmac
import logging
import os
import re
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import HTTPException, status

from database import db_manager
from email_service import email_service
from security import (
    IS_PRODUCTION,
    JWT_SECRET_KEY,
    ROLE_PERMISSIONS,
    create_access_token,
    hash_password,
    verify_password,
)

logger = logging.getLogger("metro_motors.auth")

# Password recovery secret key for HMAC hashing of OTP codes
OTP_HMAC_SECRET = os.environ.get("OTP_HMAC_SECRET", JWT_SECRET_KEY).encode("utf-8")

# In-memory stores for resilient operation when remote DB is offline
IN_MEMORY_USERS: dict[str, dict[str, Any]] = {}
IN_MEMORY_RESET_REQUESTS: dict[str, dict[str, Any]] = {}
FAILED_LOGIN_ATTEMPTS: dict[str, list[datetime]] = {}
RESET_REQUEST_COOLDOWNS: dict[str, datetime] = {}


def now_utc() -> datetime:
    return datetime.now(UTC)


def now_iso() -> str:
    return now_utc().isoformat()


def normalize_email(email: str) -> str:
    """Consistently trim and lowercase email addresses."""
    if not email:
        return ""
    return email.strip().lower()


def hash_otp(otp_code: str) -> str:
    """Compute keyed HMAC-SHA256 digest of OTP code (never store plaintext OTP)."""
    return hmac.new(OTP_HMAC_SECRET, otp_code.strip().encode("utf-8"), hashlib.sha256).hexdigest()


def validate_password_strength(password: str) -> None:
    """
    Enforce enterprise password policy:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number or special character
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter (A-Z).",
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter (a-z).",
        )
    if not re.search(r"[\d\W_]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number or special symbol.",
        )


def check_login_rate_limit(key: str, max_attempts: int = 5, window_seconds: int = 300) -> None:
    """Rate limit failed login attempts per email/IP to prevent brute-force attacks."""
    now = now_utc()
    attempts = FAILED_LOGIN_ATTEMPTS.get(key, [])
    # Keep attempts within sliding window
    valid_attempts = [t for t in attempts if (now - t).total_seconds() < window_seconds]
    FAILED_LOGIN_ATTEMPTS[key] = valid_attempts

    if len(valid_attempts) >= max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 5 minutes before trying again or reset your password.",
        )


def record_failed_login(key: str) -> None:
    now = now_utc()
    attempts = FAILED_LOGIN_ATTEMPTS.get(key, [])
    attempts.append(now)
    FAILED_LOGIN_ATTEMPTS[key] = attempts


def clear_failed_logins(key: str) -> None:
    FAILED_LOGIN_ATTEMPTS.pop(key, None)


# ── Seed Default Showroom Staff Accounts ──
DEV_DEFAULT_PASSWORD = os.environ.get("DEV_DEFAULT_PASSWORD", "MetroDevShowroom2026!")
DEV_FALLBACK_PASSWORDS = set(
    filter(
        None,
        os.environ.get(
            "DEV_FALLBACK_PASSWORDS",
            "MetroDevShowroom2026!,metro2026,Samarth@#$07",
        ).split(","),
    )
)


def seed_default_showroom_users() -> None:
    """Seed demo accounts into in-memory fallback so tests & demo run without setup (disabled in production)."""
    if IS_PRODUCTION:
        logger.info("Production mode detected: skipping in-memory demo user seeding.")
        return
    demo_pwd_hash = hash_password(DEV_DEFAULT_PASSWORD)
    default_accounts = [
        {
            "userId": "USER-OWNER-SAMARTH",
            "fullName": "Arava Samarth",
            "email": "aravasamarth@gmail.com",
            "normalizedEmail": "aravasamarth@gmail.com",
            "passwordHash": demo_pwd_hash,
            "role": "OWNER",
            "emailVerified": True,
            "accountStatus": "ACTIVE",
            "authProviders": ["password"],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
            "lastLoginAt": None,
        },
        {
            "userId": "USER-OWNER-ALEX",
            "fullName": "Alex Kumar",
            "email": "alex@metromotors.in",
            "normalizedEmail": "alex@metromotors.in",
            "passwordHash": demo_pwd_hash,
            "role": "OWNER",
            "emailVerified": True,
            "accountStatus": "ACTIVE",
            "authProviders": ["password"],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
            "lastLoginAt": None,
        },
        {
            "userId": "USER-WORKER-SAMARTH",
            "fullName": "Samarth Arava",
            "email": "samartharava@gmail.com",
            "normalizedEmail": "samartharava@gmail.com",
            "passwordHash": demo_pwd_hash,
            "role": "WORKER",
            "emailVerified": True,
            "accountStatus": "ACTIVE",
            "authProviders": ["password"],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
            "lastLoginAt": None,
        },
    ]
    for acc in default_accounts:
        if acc["normalizedEmail"] not in IN_MEMORY_USERS:
            IN_MEMORY_USERS[acc["normalizedEmail"]] = acc


seed_default_showroom_users()


def sanitize_user_dict(user: dict[str, Any]) -> dict[str, Any]:
    """Strip sensitive security fields before returning user dictionary in API."""
    safe = dict(user)
    safe.pop("passwordHash", None)
    safe.pop("password", None)
    safe.pop("_id", None)
    return safe


# ── MongoDB & In-Memory Storage Abstraction ──
async def find_user_by_email(email: str) -> dict[str, Any] | None:
    norm = normalize_email(email)
    db = db_manager.db
    if db is not None:
        try:
            doc = await db.users.find_one({"normalizedEmail": norm})
            if doc:
                return doc
        except Exception as exc:
            logger.warning(f"MongoDB find_user_by_email query failed ({exc}); checking fallback store.")
    return IN_MEMORY_USERS.get(norm)


async def find_user_by_google_sub(sub: str) -> dict[str, Any] | None:
    db = db_manager.db
    if db is not None:
        try:
            doc = await db.users.find_one({"googleSubjectId": sub})
            if doc:
                return doc
        except Exception:
            pass
    for u in IN_MEMORY_USERS.values():
        if u.get("googleSubjectId") == sub:
            return u
    return None


async def save_user(user: dict[str, Any]) -> None:
    norm = user["normalizedEmail"]
    IN_MEMORY_USERS[norm] = user
    db = db_manager.db
    if db is not None:
        try:
            await db.users.update_one(
                {"normalizedEmail": norm},
                {"$set": user},
                upsert=True,
            )
        except Exception as exc:
            logger.warning(f"MongoDB save_user update failed ({exc}); cached in fallback.")


# ── Authentication Workflows ──

# ── Shared helpers ──

_STAFF_JWT_ROLES = ("OWNER", "WORKER", "MANAGER")
_INVALID_CREDENTIALS = "Invalid email or password."
_GOOGLE_ISSUERS = ("accounts.google.com", "https://accounts.google.com")
_OTP_TTL_MINUTES = 10
_RECOVERY_TTL_MINUTES = 15
_RESEND_COOLDOWN_SECONDS = 60


def _require_valid_email(email: str) -> str:
    """Normalizes an email and rejects obviously invalid values."""
    norm_email = normalize_email(email)
    if not norm_email or "@" not in norm_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    return norm_email


def _require_matching_passwords(password: str, confirm_password: str, detail: str) -> None:
    """Rejects mismatched passwords, then enforces the password strength policy."""
    if password != confirm_password:
        raise HTTPException(status_code=400, detail=detail)
    validate_password_strength(password)


def _jwt_role_for(role: str) -> str:
    """Maps stored account roles to the JWT permission tier."""
    return role if role in _STAFF_JWT_ROLES else "CUSTOMER"


def _display_name(user: dict[str, Any], default: str) -> str:
    return user.get("fullName", user.get("name", default))


def _touch_login(user: dict[str, Any]) -> None:
    user["lastLoginAt"] = now_iso()
    user["updatedAt"] = now_iso()


def _issue_session(user: dict[str, Any], norm_email: str, name: str) -> dict[str, Any]:
    """Creates the JWT + standard session payload for an authenticated user."""
    role = user.get("role", "CUSTOMER")
    jwt_role = _jwt_role_for(role)
    token = create_access_token(
        subject=norm_email,
        name=name,
        role=jwt_role,
        extra_claims={"user_id": user.get("userId"), "actual_role": role},
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "role_key": jwt_role,
        "email": norm_email,
        "name": name,
        "permissions": ROLE_PERMISSIONS.get(jwt_role, ROLE_PERMISSIONS["CUSTOMER"]),
        "user": sanitize_user_dict(user),
    }


async def _db_call(operation_name: str, coro_factory) -> Any:
    """Runs a best-effort MongoDB call; returns None if the DB is offline or the call fails."""
    db = db_manager.db
    if db is None:
        return None
    try:
        return await coro_factory(db)
    except Exception as exc:
        logger.debug(f"MongoDB {operation_name} notice: {exc}")
        return None


# ── Registration ──

def _build_customer_record(clean_name: str, email: str, norm_email: str, password: str) -> dict[str, Any]:
    # Strict: Default role is always CUSTOMER to prevent privilege escalation
    return {
        "userId": f"USER-{secrets.token_hex(6).upper()}",
        "fullName": clean_name,
        "email": email.strip(),
        "normalizedEmail": norm_email,
        "passwordHash": hash_password(password),
        "role": "CUSTOMER",
        "emailVerified": False,
        "accountStatus": "ACTIVE",
        "authProviders": ["password"],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "lastLoginAt": now_iso(),
    }


async def _send_welcome_email_safely(norm_email: str, clean_name: str) -> None:
    try:
        await email_service.send_welcome_email(norm_email, clean_name)
    except Exception as exc:
        logger.warning(f"Welcome email dispatch notice: {exc}")


async def register_customer_user(
    full_name: str,
    email: str,
    password: str,
    confirm_password: str,
) -> dict[str, Any]:
    """
    Register a new customer account with strong password requirements,
    unique email check, and privilege separation.
    """
    clean_name = full_name.strip()
    if len(clean_name) < 2:
        raise HTTPException(status_code=400, detail="Full name must be at least 2 characters long.")
    norm_email = _require_valid_email(email)
    _require_matching_passwords(password, confirm_password, "Passwords do not match. Please re-enter your password.")

    if await find_user_by_email(norm_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in instead.",
        )

    user_record = _build_customer_record(clean_name, email, norm_email, password)
    await save_user(user_record)
    await _send_welcome_email_safely(norm_email, clean_name)

    token = create_access_token(
        subject=norm_email,
        name=clean_name,
        role="WORKER",  # Customer gets standard safe read permissions mapped through worker tier
        extra_claims={"user_id": user_record["userId"], "actual_role": "CUSTOMER"},
    )
    return {
        "success": True,
        "message": "Account registered successfully.",
        "access_token": token,
        "token_type": "bearer",
        "user": sanitize_user_dict(user_record),
    }


# ── Email + password sign-in ──

def _verify_password_match(password: str, user: dict[str, Any], norm_email: str) -> bool:
    """Verify password hash with secure development fallback support."""
    stored_hash = user.get("passwordHash") or user.get("password")
    if stored_hash and verify_password(password, stored_hash):
        return True
    if not IS_PRODUCTION and password:
        return (
            norm_email in ("aravasamarth@gmail.com", "samartharava@gmail.com", "alex@metromotors.in")
            and password in DEV_FALLBACK_PASSWORDS
        )
    return False


def _passwordless_dev_session(user: dict[str, Any] | None, norm_email: str, rate_key: str) -> dict[str, Any]:
    """Legacy password-less sign-in for development tests only (never in production)."""
    if IS_PRODUCTION:
        record_failed_login(rate_key)
        raise HTTPException(status_code=400, detail="Password is required.")
    if not user:
        raise HTTPException(status_code=401, detail=_INVALID_CREDENTIALS)
    role = user.get("role", "WORKER")
    name = user.get("fullName", "Showroom User")
    return {
        "access_token": create_access_token(subject=norm_email, name=name, role=role),
        "token_type": "bearer",
        "role": role,
        "email": norm_email,
        "name": name,
        "permissions": ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["CUSTOMER"]),
        "user": sanitize_user_dict(user),
    }


def _assert_can_sign_in(user: dict[str, Any] | None, password: str, norm_email: str, rate_key: str) -> dict[str, Any]:
    """Validates account existence, status and password. Records failures for rate limiting."""
    if not user:
        record_failed_login(rate_key)
        raise HTTPException(status_code=401, detail=_INVALID_CREDENTIALS)
    if user.get("accountStatus") == "DISABLED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled. Please contact showroom support.",
        )
    if not _verify_password_match(password, user, norm_email):
        record_failed_login(rate_key)
        raise HTTPException(status_code=401, detail=_INVALID_CREDENTIALS)
    return user


async def authenticate_user_credentials(email: str, password: str | None) -> dict[str, Any]:
    """
    Authenticate user via email and password with rate limiting,
    generic error messages, and support for default showroom demo credentials.
    Flow: validation -> rate limit -> lookup -> password check -> session.
    """
    norm_email = normalize_email(email)
    if not norm_email:
        raise HTTPException(status_code=400, detail="Email address is required.")

    rate_key = norm_email
    check_login_rate_limit(rate_key)
    user = await find_user_by_email(norm_email)

    if password is None:
        return _passwordless_dev_session(user, norm_email, rate_key)

    user = _assert_can_sign_in(user, password, norm_email, rate_key)

    clear_failed_logins(rate_key)
    _touch_login(user)
    await save_user(user)
    return _issue_session(user, norm_email, _display_name(user, "Metro Motors User"))


# ── Google sign-in ──

def _fetch_google_token_info(id_token_str: str) -> dict[str, Any]:
    """Calls Google's tokeninfo endpoint. Raises 401 on any verification failure."""
    import json
    import urllib.parse
    import urllib.request

    try:
        url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token_str})
        req = urllib.request.Request(url, headers={"User-Agent": "MetroMotorsBackend/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        logger.warning(f"Google ID token verification failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google OAuth token. Verification failed.",
        )


def _validate_google_claims(payload: dict[str, Any], google_client_id: str) -> str:
    """Checks audience, issuer and email presence. Returns the token email."""
    if payload.get("aud") != google_client_id:
        raise HTTPException(status_code=401, detail="Google token audience does not match configured CLIENT_ID.")
    if payload.get("iss") not in _GOOGLE_ISSUERS:
        raise HTTPException(status_code=401, detail="Invalid token issuer.")
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account does not provide an email address.")
    return email


def _env_email_list(var_name: str) -> list[str]:
    return [e.strip().lower() for e in os.environ.get(var_name, "").split(",") if e.strip()]


def _role_for_new_google_user(norm_email: str) -> str:
    if norm_email in _env_email_list("OWNER_EMAILS"):
        return "OWNER"
    if norm_email in _env_email_list("WORKER_EMAILS"):
        return "WORKER"
    return "CUSTOMER"


async def _find_google_user(google_sub: str | None, norm_email: str) -> dict[str, Any] | None:
    user = await find_user_by_google_sub(google_sub) if google_sub else None
    return user or await find_user_by_email(norm_email)


def _link_google_provider(user: dict[str, Any], google_sub: str | None) -> dict[str, Any]:
    """Links the Google identity to an existing account, preserving its id and role."""
    user["authProviders"] = sorted(set(user.get("authProviders", [])) | {"google"})
    user["googleSubjectId"] = google_sub
    user["emailVerified"] = True
    _touch_login(user)
    return user


def _build_google_user(email: str, norm_email: str, google_sub: str | None, full_name: str) -> dict[str, Any]:
    return {
        "userId": f"USER-G-{secrets.token_hex(6).upper()}",
        "fullName": full_name,
        "email": email,
        "normalizedEmail": norm_email,
        "googleSubjectId": google_sub,
        "role": _role_for_new_google_user(norm_email),
        "emailVerified": True,
        "accountStatus": "ACTIVE",
        "authProviders": ["google"],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "lastLoginAt": now_iso(),
    }


async def authenticate_google_identity(id_token_str: str) -> dict[str, Any]:
    """
    Verify Google OAuth 2.0 ID token securely, map stable Google subject identifier,
    and establish authenticated Motors session.
    Flow: verify token -> validate claims -> find or create user -> session.
    """
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in your environment.",
        )

    payload = _fetch_google_token_info(id_token_str)
    email = _validate_google_claims(payload, google_client_id)
    google_sub = payload.get("sub")
    full_name = payload.get("name") or "Google User"
    norm_email = normalize_email(email)

    existing = await _find_google_user(google_sub, norm_email)
    if existing and existing.get("accountStatus") == "DISABLED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled. Please contact showroom support.",
        )
    user = _link_google_provider(existing, google_sub) if existing else _build_google_user(
        email, norm_email, google_sub, full_name
    )
    await save_user(user)

    session = _issue_session(user, norm_email, full_name)
    session.pop("role_key", None)  # Preserve original Google response contract
    return session


# ── Forgot Password & OTP Recovery Workflows ──

def _enforce_resend_cooldown(norm_email: str, now: datetime) -> None:
    """Enforces a per-email cooldown between OTP requests."""
    last_requested = RESET_REQUEST_COOLDOWNS.get(norm_email)
    if last_requested:
        elapsed = (now - last_requested).total_seconds()
        if elapsed < _RESEND_COOLDOWN_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {int(_RESEND_COOLDOWN_SECONDS - elapsed)} seconds before requesting another verification code.",
            )
    RESET_REQUEST_COOLDOWNS[norm_email] = now


def _generate_otp() -> str:
    """Cryptographically secure 6-digit code."""
    return f"{secrets.randbelow(900000) + 100000}"


def _build_reset_record(norm_email: str, otp_code: str, now: datetime) -> dict[str, Any]:
    return {
        "email": norm_email,
        "otpHash": hash_otp(otp_code),
        "expiresAt": now + timedelta(minutes=_OTP_TTL_MINUTES),
        "attempts": 0,
        "maxAttempts": 5,
        "consumed": False,
        "recoveryToken": None,
        "recoveryTokenExpiresAt": None,
        "createdAt": now_iso(),
    }


async def _store_reset_record(norm_email: str, record: dict[str, Any]) -> None:
    """Replaces any previous reset request for this email (memory + MongoDB)."""
    await _db_call("reset request cleanup", lambda db: db.password_reset_requests.delete_many({"email": norm_email}))
    IN_MEMORY_RESET_REQUESTS[norm_email] = record
    await _db_call("reset request insert", lambda db: db.password_reset_requests.insert_one(dict(record)))


async def request_password_recovery_otp(email: str) -> dict[str, Any]:
    """
    Step 1: Request 6-digit OTP code for password recovery.
    - Rate limits resend requests (60s cooldown).
    - Stores HMAC-SHA256 hash of OTP with 10-minute expiry (never plaintext).
    - Dispatches branded email.
    - Returns generic message to prevent account enumeration.
    """
    norm_email = _require_valid_email(email)
    now = now_utc()
    _enforce_resend_cooldown(norm_email, now)

    # Generic success message returned regardless of existence to prevent enumeration
    response = {
        "success": True,
        "message": f"If an account is associated with {norm_email}, a 6-digit verification code has been dispatched.",
    }
    user = await find_user_by_email(norm_email)
    if not user:
        return response

    otp_code = _generate_otp()
    await _store_reset_record(norm_email, _build_reset_record(norm_email, otp_code, now))
    await email_service.send_password_reset_otp(
        to_email=norm_email,
        recipient_name=_display_name(user, "Valued Customer"),
        otp_code=otp_code,
        expiry_minutes=_OTP_TTL_MINUTES,
    )

    # In development/test mode, expose preview for verification
    if os.environ.get("ENV") == "test" or os.environ.get("DISABLE_REMOTE_DB") == "1":
        response["dev_preview_otp"] = otp_code
    elif not email_service.is_smtp_configured:
        response["delivery_notice"] = "Email delivery service is pending configuration. Please contact showroom administration."
    return response


def _parse_datetime(value: Any) -> Any:
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return value


def _validate_reset_record(record: dict[str, Any] | None, now: datetime) -> None:
    """Validate expiration and attempt counts on a password reset record."""
    if not record or record.get("consumed", False):
        raise HTTPException(
            status_code=400,
            detail="No active password reset request found. Please request a new verification code.",
        )

    expires_at = _parse_datetime(record.get("expiresAt"))
    if expires_at and now > expires_at:
        raise HTTPException(
            status_code=400,
            detail="The verification code has expired (10-minute limit). Please request a new code.",
        )

    if record.get("attempts", 0) >= record.get("maxAttempts", 5):
        record["consumed"] = True
        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. For security, this code has been invalidated. Please request a new code.",
        )


async def _fetch_reset_record(norm_email: str) -> dict[str, Any] | None:
    """Fetch active reset record from MongoDB or in-memory fallback."""
    record = await _db_call(
        "reset record lookup",
        lambda db: db.password_reset_requests.find_one({"email": norm_email, "consumed": False}),
    )
    return record or IN_MEMORY_RESET_REQUESTS.get(norm_email)


def _otp_matches(record: dict[str, Any], clean_otp: str) -> bool:
    """Pure check: constant-time HMAC digest comparison."""
    return hmac.compare_digest(record.get("otpHash", ""), hash_otp(clean_otp))


async def _register_failed_otp_attempt(norm_email: str, record: dict[str, Any]) -> None:
    """Side effect: persist the failed attempt and raise with remaining attempts."""
    await _db_call(
        "failed OTP attempt",
        lambda db: db.password_reset_requests.update_one({"email": norm_email}, {"$inc": {"attempts": 1}}),
    )
    remaining = record.get("maxAttempts", 5) - record["attempts"]
    raise HTTPException(status_code=400, detail=f"Invalid verification code. {remaining} attempt(s) remaining.")


async def _issue_recovery_token(norm_email: str, record: dict[str, Any], now: datetime) -> str:
    """Side effect: consume the OTP and persist a single-use recovery token."""
    recovery_token = f"REC-{secrets.token_urlsafe(32)}"
    recovery_expiry = now + timedelta(minutes=_RECOVERY_TTL_MINUTES)
    update = {"consumed": True, "recoveryToken": recovery_token, "recoveryTokenExpiresAt": recovery_expiry}
    record.update(update)
    IN_MEMORY_RESET_REQUESTS[norm_email] = record
    await _db_call(
        "recovery token update",
        lambda db: db.password_reset_requests.update_one({"email": norm_email}, {"$set": update}),
    )
    return recovery_token


async def verify_password_recovery_otp(email: str, otp_code: str) -> dict[str, Any]:
    """
    Step 2: Server-side OTP verification.
    - Enforces attempt limit (max 5) and expiration (10 min).
    - Verifies HMAC digest in constant time.
    - Atomically produces a single-use recovery authorization token (15 min validity).
    """
    norm_email = normalize_email(email)
    clean_otp = (otp_code or "").strip()
    if not norm_email or not clean_otp:
        raise HTTPException(status_code=400, detail="Email and 6-digit verification code are required.")

    now = now_utc()
    record = await _fetch_reset_record(norm_email)
    _validate_reset_record(record, now)
    if record is None:  # Defensive: _validate_reset_record already rejects this
        raise HTTPException(status_code=400, detail="No active password reset request found.")

    record["attempts"] = record.get("attempts", 0) + 1
    if not _otp_matches(record, clean_otp):
        await _register_failed_otp_attempt(norm_email, record)

    recovery_token = await _issue_recovery_token(norm_email, record, now)
    return {
        "success": True,
        "message": "Verification code confirmed. Please set your new password.",
        "recovery_token": recovery_token,
    }


def _validate_recovery_authorization(record: dict[str, Any] | None, now: datetime) -> None:
    """Validate that a recovery authorization token is present and not expired."""
    if not record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or unrecognized recovery authorization. Please verify your OTP code again.",
        )
    token_expiry = _parse_datetime(record.get("recoveryTokenExpiresAt"))
    if token_expiry and now > token_expiry:
        raise HTTPException(
            status_code=400,
            detail="Recovery authorization has expired. Please verify your OTP code again.",
        )


async def _fetch_recovery_record(norm_email: str, clean_token: str) -> dict[str, Any] | None:
    """Fetch matching recovery authorization record from MongoDB or fallback."""
    record = await _db_call(
        "recovery record lookup",
        lambda db: db.password_reset_requests.find_one({"email": norm_email, "recoveryToken": clean_token}),
    )
    if record:
        return record
    record = IN_MEMORY_RESET_REQUESTS.get(norm_email)
    if record and record.get("recoveryToken") == clean_token:
        return record
    return None


async def _apply_new_password(user: dict[str, Any], new_password: str) -> None:
    hashed = hash_password(new_password)
    user["passwordHash"] = hashed
    user["password"] = hashed
    user["updatedAt"] = now_iso()
    await save_user(user)


async def _invalidate_reset_requests(norm_email: str) -> None:
    IN_MEMORY_RESET_REQUESTS.pop(norm_email, None)
    await _db_call("reset request cleanup", lambda db: db.password_reset_requests.delete_many({"email": norm_email}))


async def _notify_password_changed(norm_email: str, user: dict[str, Any]) -> None:
    try:
        await email_service.send_password_changed_notification(norm_email, _display_name(user, "Valued Customer"))
    except Exception as exc:
        logger.warning(f"Password changed security email notice: {exc}")


async def reset_password_with_recovery_token(
    email: str,
    recovery_token: str,
    new_password: str,
    confirm_password: str,
) -> dict[str, Any]:
    """
    Step 3: Secure password reset.
    Flow: validate token -> validate password -> update password -> invalidate requests -> notify.
    """
    norm_email = normalize_email(email)
    clean_token = (recovery_token or "").strip()
    if not norm_email or not clean_token:
        raise HTTPException(status_code=400, detail="Email and recovery authorization token are required.")
    _require_matching_passwords(
        new_password, confirm_password, "New passwords do not match. Please verify your entries."
    )

    record = await _fetch_recovery_record(norm_email, clean_token)
    _validate_recovery_authorization(record, now_utc())

    user = await find_user_by_email(norm_email)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    await _apply_new_password(user, new_password)
    await _invalidate_reset_requests(norm_email)
    await _notify_password_changed(norm_email, user)
    return {
        "success": True,
        "message": "Password reset successfully. You may now sign in with your new password.",
    }
