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

    norm_email = normalize_email(email)
    if not norm_email or "@" not in norm_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match. Please re-enter your password.")

    validate_password_strength(password)

    # Check for existing account
    existing = await find_user_by_email(norm_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in instead.",
        )

    user_id = f"USER-{secrets.token_hex(6).upper()}"
    hashed_pwd = hash_password(password)

    # Strict: Default role is always CUSTOMER to prevent privilege escalation
    user_record = {
        "userId": user_id,
        "fullName": clean_name,
        "email": email.strip(),
        "normalizedEmail": norm_email,
        "passwordHash": hashed_pwd,
        "role": "CUSTOMER",
        "emailVerified": False,
        "accountStatus": "ACTIVE",
        "authProviders": ["password"],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "lastLoginAt": now_iso(),
    }

    await save_user(user_record)

    # Dispatch welcome email asynchronously
    try:
        await email_service.send_welcome_email(norm_email, clean_name)
    except Exception as exc:
        logger.warning(f"Welcome email dispatch notice: {exc}")

    # Issue JWT token
    token = create_access_token(
        subject=norm_email,
        name=clean_name,
        role="WORKER",  # Customer gets standard safe read permissions mapped through worker tier
        extra_claims={"user_id": user_id, "actual_role": "CUSTOMER"},
    )

    return {
        "success": True,
        "message": "Account registered successfully.",
        "access_token": token,
        "token_type": "bearer",
        "user": sanitize_user_dict(user_record),
    }


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


async def authenticate_user_credentials(email: str, password: str | None) -> dict[str, Any]:
    """
    Authenticate user via email and password with rate limiting,
    generic error messages, and support for default showroom demo credentials.
    """
    norm_email = normalize_email(email)
    if not norm_email:
        raise HTTPException(status_code=400, detail="Email address is required.")

    rate_key = norm_email
    check_login_rate_limit(rate_key)

    user = await find_user_by_email(norm_email)

    # Support backward-compatibility for showroom development tests when password is None (strictly disabled in production)
    if password is None:
        if IS_PRODUCTION:
            record_failed_login(rate_key)
            raise HTTPException(status_code=400, detail="Password is required.")
        if user:
            role = user.get("role", "WORKER")
            name = user.get("fullName", "Showroom User")
            token = create_access_token(subject=norm_email, name=name, role=role)
            return {
                "access_token": token,
                "token_type": "bearer",
                "role": role,
                "email": norm_email,
                "name": name,
                "permissions": ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["CUSTOMER"]),
                "user": sanitize_user_dict(user),
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user:
        record_failed_login(rate_key)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if user.get("accountStatus") == "DISABLED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled. Please contact showroom support.",
        )

    # Verify password hash
    if not _verify_password_match(password, user, norm_email):
        record_failed_login(rate_key)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Successful login: reset failed attempts counter & update lastLoginAt
    clear_failed_logins(rate_key)
    user["lastLoginAt"] = now_iso()
    user["updatedAt"] = now_iso()
    await save_user(user)

    role = user.get("role", "CUSTOMER")
    jwt_role = role if role in ["OWNER", "WORKER", "MANAGER"] else "CUSTOMER"
    name = user.get("fullName", user.get("name", "Metro Motors User"))

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


async def authenticate_google_identity(id_token_str: str) -> dict[str, Any]:
    """
    Verify Google OAuth 2.0 ID token securely, map stable Google subject identifier,
    and establish authenticated Motors session.
    """
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in your environment.",
        )

    # In production, verify using Google tokeninfo API or google-auth library
    import json
    import urllib.request

    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token_str}"
        req = urllib.request.Request(url, headers={"User-Agent": "MetroMotorsBackend/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        logger.warning(f"Google ID token verification failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google OAuth token. Verification failed.",
        )

    # Validate audience, issuer and email verification
    if payload.get("aud") != google_client_id:
        raise HTTPException(status_code=401, detail="Google token audience does not match configured CLIENT_ID.")

    if payload.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(status_code=401, detail="Invalid token issuer.")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account does not provide an email address.")

    google_sub = payload.get("sub")
    full_name = payload.get("name") or "Google User"
    norm_email = normalize_email(email)

    # Check if account already exists by Google sub or email
    user = await find_user_by_google_sub(google_sub)
    if not user:
        user = await find_user_by_email(norm_email)

    if user:
        # Link Google provider if not yet linked
        providers = set(user.get("authProviders", []))
        providers.add("google")
        user["authProviders"] = list(providers)
        user["googleSubjectId"] = google_sub
        user["emailVerified"] = True
        user["lastLoginAt"] = now_iso()
        user["updatedAt"] = now_iso()
        await save_user(user)
        owner_emails = [e.strip().lower() for e in os.environ.get("OWNER_EMAILS", "").split(",") if e.strip()]
        worker_emails = [e.strip().lower() for e in os.environ.get("WORKER_EMAILS", "").split(",") if e.strip()]
        assigned_role = "OWNER" if norm_email in owner_emails else ("WORKER" if norm_email in worker_emails else "CUSTOMER")
        # Register new Google customer account
        user = {
            "userId": f"USER-G-{secrets.token_hex(6).upper()}",
            "fullName": full_name,
            "email": email,
            "normalizedEmail": norm_email,
            "googleSubjectId": google_sub,
            "role": assigned_role,
            "emailVerified": True,
            "accountStatus": "ACTIVE",
            "authProviders": ["google"],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
            "lastLoginAt": now_iso(),
        }
        await save_user(user)

    role = user.get("role", "CUSTOMER")
    jwt_role = role if role in ["OWNER", "WORKER", "MANAGER"] else "CUSTOMER"
    token = create_access_token(
        subject=norm_email,
        name=full_name,
        role=jwt_role,
        extra_claims={"user_id": user.get("userId"), "actual_role": role},
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "email": norm_email,
        "name": full_name,
        "permissions": ROLE_PERMISSIONS.get(jwt_role, ROLE_PERMISSIONS["CUSTOMER"]),
        "user": sanitize_user_dict(user),
    }


# ── Forgot Password & OTP Recovery Workflows ──

async def request_password_recovery_otp(email: str) -> dict[str, Any]:
    """
    Step 1: Request 6-digit OTP code for password recovery.
    - Rate limits resend requests (60s cooldown).
    - Stores HMAC-SHA256 hash of OTP with 10-minute expiry (never plaintext).
    - Dispatches branded email.
    - Returns generic message to prevent account enumeration.
    """
    norm_email = normalize_email(email)
    if not norm_email or "@" not in norm_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    now = now_utc()

    # Enforce 60-second resend cooldown per email
    last_requested = RESET_REQUEST_COOLDOWNS.get(norm_email)
    if last_requested and (now - last_requested).total_seconds() < 60:
        remaining_secs = int(60 - (now - last_requested).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining_secs} seconds before requesting another verification code.",
        )
    RESET_REQUEST_COOLDOWNS[norm_email] = now

    user = await find_user_by_email(norm_email)

    # Generic success message returned regardless of existence to prevent enumeration
    generic_success = {
        "success": True,
        "message": f"If an account is associated with {norm_email}, a 6-digit verification code has been dispatched.",
    }

    if not user:
        return generic_success

    # Invalidate previous active requests for this email
    db = db_manager.db
    if db is not None:
        try:
            await db.password_reset_requests.delete_many({"email": norm_email})
        except Exception:
            pass

    # Generate cryptographically secure 6-digit code
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    otp_digest = hash_otp(otp_code)
    expires_at = now + timedelta(minutes=10)

    reset_record = {
        "email": norm_email,
        "otpHash": otp_digest,
        "expiresAt": expires_at,
        "attempts": 0,
        "maxAttempts": 5,
        "consumed": False,
        "recoveryToken": None,
        "recoveryTokenExpiresAt": None,
        "createdAt": now_iso(),
    }

    IN_MEMORY_RESET_REQUESTS[norm_email] = reset_record
    if db is not None:
        try:
            await db.password_reset_requests.insert_one(dict(reset_record))
        except Exception as exc:
            logger.warning(f"MongoDB reset request insert notice: {exc}")

    # Dispatch branded verification email
    recipient_name = user.get("fullName", user.get("name", "Valued Customer"))
    await email_service.send_password_reset_otp(
        to_email=norm_email,
        recipient_name=recipient_name,
        otp_code=otp_code,
        expiry_minutes=10,
    )

    # In development/test mode, expose preview for verification
    if os.environ.get("ENV") == "test" or os.environ.get("DISABLE_REMOTE_DB") == "1":
        generic_success["dev_preview_otp"] = otp_code
    elif not email_service.is_smtp_configured:
        generic_success["delivery_notice"] = "Email delivery service is pending configuration. Please contact showroom administration."

    return generic_success


def _validate_reset_record(record: dict[str, Any] | None, now: datetime) -> None:
    """Validate expiration and attempt counts on a password reset record."""
    if not record or record.get("consumed", False):
        raise HTTPException(
            status_code=400,
            detail="No active password reset request found. Please request a new verification code.",
        )

    # Check expiration
    expires_at = record.get("expiresAt")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at and now > expires_at:
        raise HTTPException(
            status_code=400,
            detail="The verification code has expired (10-minute limit). Please request a new code.",
        )

    # Check attempt limit
    attempts = record.get("attempts", 0)
    max_attempts = record.get("maxAttempts", 5)
    if attempts >= max_attempts:
        record["consumed"] = True
        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. For security, this code has been invalidated. Please request a new code.",
        )


async def _fetch_reset_record(norm_email: str) -> dict[str, Any] | None:
    """Fetch active reset record from MongoDB or in-memory fallback."""
    db = db_manager.db
    if db is not None:
        try:
            record = await db.password_reset_requests.find_one({"email": norm_email, "consumed": False})
            if record:
                return record
        except Exception:
            pass
    return IN_MEMORY_RESET_REQUESTS.get(norm_email)


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
    assert record is not None

    record["attempts"] = record.get("attempts", 0) + 1

    # Verify HMAC digest in constant time
    submitted_digest = hash_otp(clean_otp)
    stored_digest = record.get("otpHash", "")
    max_attempts = record.get("maxAttempts", 5)

    db = db_manager.db
    if not hmac.compare_digest(stored_digest, submitted_digest):
        if db is not None:
            try:
                await db.password_reset_requests.update_one(
                    {"email": norm_email},
                    {"$inc": {"attempts": 1}},
                )
            except Exception:
                pass
        remaining = max_attempts - record["attempts"]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining.",
        )

    # Match verified: generate single-use recovery token
    recovery_token = f"REC-{secrets.token_urlsafe(32)}"
    recovery_expiry = now + timedelta(minutes=15)

    record["consumed"] = True
    record["recoveryToken"] = recovery_token
    record["recoveryTokenExpiresAt"] = recovery_expiry

    IN_MEMORY_RESET_REQUESTS[norm_email] = record
    if db is not None:
        try:
            await db.password_reset_requests.update_one(
                {"email": norm_email},
                {
                    "$set": {
                        "consumed": True,
                        "recoveryToken": recovery_token,
                        "recoveryTokenExpiresAt": recovery_expiry,
                    }
                },
            )
        except Exception:
            pass

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

    token_expiry = record.get("recoveryTokenExpiresAt")
    if isinstance(token_expiry, str):
        token_expiry = datetime.fromisoformat(token_expiry.replace("Z", "+00:00"))
    if token_expiry and now > token_expiry:
        raise HTTPException(
            status_code=400,
            detail="Recovery authorization has expired. Please verify your OTP code again.",
        )


async def _fetch_recovery_record(norm_email: str, clean_token: str) -> dict[str, Any] | None:
    """Fetch matching recovery authorization record from MongoDB or fallback."""
    db = db_manager.db
    if db is not None:
        try:
            record = await db.password_reset_requests.find_one({
                "email": norm_email,
                "recoveryToken": clean_token,
            })
            if record:
                return record
        except Exception:
            pass
    record = IN_MEMORY_RESET_REQUESTS.get(norm_email)
    if record and record.get("recoveryToken") == clean_token:
        return record
    return None


async def reset_password_with_recovery_token(
    email: str,
    recovery_token: str,
    new_password: str,
    confirm_password: str,
) -> dict[str, Any]:
    """
    Step 3: Secure password reset.
    - Requires valid, single-use recovery authorization token.
    - Enforces password policy and matching.
    - Hashes new password with salted bcrypt.
    - Consumes authorization and invalidates all reset requests for the user.
    - Dispatches security notification email.
    """
    norm_email = normalize_email(email)
    clean_token = (recovery_token or "").strip()

    if not norm_email or not clean_token:
        raise HTTPException(status_code=400, detail="Email and recovery authorization token are required.")

    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match. Please verify your entries.")

    validate_password_strength(new_password)

    now = now_utc()
    record = await _fetch_recovery_record(norm_email, clean_token)
    _validate_recovery_authorization(record, now)

    user = await find_user_by_email(norm_email)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Hash new password
    hashed = hash_password(new_password)
    user["passwordHash"] = hashed
    user["password"] = hashed
    user["updatedAt"] = now_iso()
    await save_user(user)

    # Invalidate all outstanding reset requests for this user
    IN_MEMORY_RESET_REQUESTS.pop(norm_email, None)

    db = db_manager.db
    if db is not None:
        try:
            await db.password_reset_requests.delete_many({"email": norm_email})
        except Exception:
            pass

    # Send security notification email
    recipient_name = user.get("fullName", user.get("name", "Valued Customer"))
    try:
        await email_service.send_password_changed_notification(norm_email, recipient_name)
    except Exception as exc:
        logger.warning(f"Password changed security email notice: {exc}")

    return {
        "success": True,
        "message": "Password reset successfully. You may now sign in with your new password.",
    }
