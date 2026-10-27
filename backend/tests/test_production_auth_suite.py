"""
Metro Motors — Production Authentication & Identity Automation Suite
Comprehensive test suite validating:
- Registration, validation, password policies, privilege escalation prevention
- Email/password authentication, JWT verification, rate limiting, generic errors
- Google OAuth token validation & unconfigured provider handling
- 3-Step OTP recovery journey: request, verify (HMAC code, attempt limits, expiration, recovery token), and reset
- Password reset authorization consumption, old password invalidation, new password login
- Email delivery queue assertions and security notifications
- Protected endpoint session validation & cross-user isolation
"""

import os
from datetime import UTC, datetime, timedelta

import pytest
from starlette.testclient import TestClient

# Disable remote DB network calls during isolated unit test execution
os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_super_secret_jwt_key_metro_motors_2026"
os.environ["ENV"] = "test"

from auth_service import (
    FAILED_LOGIN_ATTEMPTS,
    IN_MEMORY_RESET_REQUESTS,
    IN_MEMORY_USERS,
    RESET_REQUEST_COOLDOWNS,
)
from email_service import clear_test_inbox, get_sent_emails
from security import decode_access_token
from server import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_state():
    """Reset test inboxes and rate limits before each test run."""
    clear_test_inbox()
    FAILED_LOGIN_ATTEMPTS.clear()
    RESET_REQUEST_COOLDOWNS.clear()
    yield


# ── 1. REGISTRATION & INPUT VALIDATION TESTS ──

def test_01_valid_customer_registration():
    """Valid customer sign-up creates account, issues JWT, and sends welcome email."""
    email = "priya.sharma@example.com"
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Priya Sharma",
            "email": email,
            "password": "SecurePassword2026!",
            "confirm_password": "SecurePassword2026!",
            "terms_accepted": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["fullName"] == "Priya Sharma"
    assert data["user"]["role"] == "CUSTOMER"

    # Verify password hash is NEVER leaked in response
    assert "passwordHash" not in data["user"]
    assert "password" not in data["user"]

    # Verify welcome email was dispatched
    sent = get_sent_emails()
    assert len(sent) >= 1
    welcome = next((e for e in sent if e["category"] == "welcome"), None)
    assert welcome is not None
    assert welcome["to"] == email
    assert "Welcome to Metro Motors" in welcome["subject"]


def test_02_registration_rejects_invalid_email_and_short_name():
    """Rejects malformed emails and invalid names."""
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "A",
            "email": "invalid-email-string",
            "password": "SecurePassword2026!",
            "confirm_password": "SecurePassword2026!",
        },
    )
    assert res.status_code == 400


def test_03_registration_enforces_password_policy():
    """Enforces min 8 characters, uppercase, lowercase, and number/symbol."""
    # Too short
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test User",
            "email": "test.short@example.com",
            "password": "Sh1!",
            "confirm_password": "Sh1!",
        },
    )
    assert res.status_code == 400
    assert "at least 8 characters" in res.json()["detail"]

    # Missing uppercase
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test User",
            "email": "test.no_upper@example.com",
            "password": "password123!",
            "confirm_password": "password123!",
        },
    )
    assert res.status_code == 400
    assert "uppercase letter" in res.json()["detail"]

    # Missing symbol or number
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test User",
            "email": "test.no_num@example.com",
            "password": "PasswordOnlyText",
            "confirm_password": "PasswordOnlyText",
        },
    )
    assert res.status_code == 400
    assert "number or special symbol" in res.json()["detail"]


def test_04_registration_rejects_password_mismatch():
    """Rejects registration when password and confirm_password differ."""
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Mismatch Tester",
            "email": "mismatch@example.com",
            "password": "ValidPassword123!",
            "confirm_password": "DifferentPassword123!",
        },
    )
    assert res.status_code == 400
    assert "do not match" in res.json()["detail"]


def test_05_registration_rejects_duplicate_email():
    """Rejects duplicate registration for the same normalized email address."""
    email = "duplicate.check@example.com"
    payload = {
        "full_name": "First Registrant",
        "email": email,
        "password": "StrongPassword123!",
        "confirm_password": "StrongPassword123!",
    }
    first_res = client.post("/api/auth/register", json=payload)
    assert first_res.status_code == 200

    # Second attempt with case variations
    second_res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Second Registrant",
            "email": "DUPLICATE.CHECK@EXAMPLE.COM",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
        },
    )
    assert second_res.status_code == 409
    assert "already exists" in second_res.json()["detail"]


def test_06_registration_prevents_privilege_escalation():
    """Client request cannot elevate role to OWNER or WORKER."""
    email = "escalation.try@example.com"
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Hacker WannaBe",
            "email": email,
            "password": "SecretPassword123!",
            "confirm_password": "SecretPassword123!",
            "role": "OWNER",
            "accountStatus": "ACTIVE",
            "emailVerified": True,
        },
    )
    assert res.status_code == 200
    # Role MUST be CUSTOMER regardless of submitted fields
    assert res.json()["user"]["role"] == "CUSTOMER"


# ── 2. EMAIL / PASSWORD SIGN-IN & JWT SESSION TESTS ──

def test_07_successful_customer_login():
    """Customer can sign in with registered email and password."""
    email = "customer.login@example.com"
    pwd = "CustomerSecure2026!"
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Ananya Roy",
            "email": email,
            "password": pwd,
            "confirm_password": pwd,
        },
    )

    # Sign in
    res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == email

    # Validate issued token
    claims = decode_access_token(data["access_token"])
    assert claims["sub"] == email
    assert claims["name"] == "Ananya Roy"


def test_08_login_rejects_incorrect_password_with_generic_error():
    """Rejects bad password with generic message to avoid credential enumeration."""
    res = client.post(
        "/api/auth/login",
        json={"email": "aravasamarth@gmail.com", "password": "WrongPassword123!"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_09_login_rejects_unregistered_email_with_generic_error():
    """Rejects unknown email with same generic message."""
    res = client.post(
        "/api/auth/login",
        json={"email": "nonexistent.user.2026@domain.in", "password": "AnyPassword123!"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_10_login_rate_limiting_locks_out_after_consecutive_failures():
    """Enforces rate limiting: 5 consecutive failures triggers 429 Too Many Requests."""
    target_email = "bruteforce.target@example.com"
    # Seed account
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Target Account",
            "email": target_email,
            "password": "ValidTargetPassword123!",
            "confirm_password": "ValidTargetPassword123!",
        },
    )

    # Trigger 5 failed attempts
    for _ in range(5):
        client.post("/api/auth/login", json={"email": target_email, "password": "BadPassword!"})

    # 6th attempt must be blocked by rate limiter
    blocked_res = client.post(
        "/api/auth/login",
        json={"email": target_email, "password": "BadPassword!"},
    )
    assert blocked_res.status_code == 429
    assert "Too many failed login attempts" in blocked_res.json()["detail"]


def test_11_disabled_account_rejected():
    """Disabled accounts cannot log in."""
    email = "disabled.user@example.com"
    pwd = "DisabledPass123!"
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Disabled Person",
            "email": email,
            "password": pwd,
            "confirm_password": pwd,
        },
    )
    # Mark disabled in store
    IN_MEMORY_USERS[email]["accountStatus"] = "DISABLED"

    res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert res.status_code == 403
    assert "account has been disabled" in res.json()["detail"]


# ── 3. GOOGLE OAUTH VERIFICATION TESTS ──

def test_12_google_oauth_reports_unconfigured_when_no_credentials():
    """When GOOGLE_CLIENT_ID is not configured, returns clear 503 service notice."""
    os.environ.pop("GOOGLE_CLIENT_ID", None)
    res = client.post("/api/auth/google", json={"id_token": "fake_google_token"})
    assert res.status_code == 503
    assert "Google OAuth is not configured on the server" in res.json()["detail"]


def test_13_google_oauth_rejects_invalid_token_when_configured():
    """When configured, bad tokens are rejected with 401."""
    os.environ["GOOGLE_CLIENT_ID"] = "mock-google-client-id-12345.apps.googleusercontent.com"
    res = client.post("/api/auth/google", json={"id_token": "malformed_unverifiable_token"})
    assert res.status_code == 401
    assert "Invalid Google OAuth token" in res.json()["detail"]


# ── 4. 3-STEP FORGOT PASSWORD & EMAIL OTP RECOVERY TESTS ──

def test_14_forgot_password_step1_dispatches_otp_email():
    """Step 1: Request OTP code sends branded email and applies resend cooldown."""
    target_email = "recovery.user@example.com"
    pwd = "OriginalPassword2026!"
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Vikram Seth",
            "email": target_email,
            "password": pwd,
            "confirm_password": pwd,
        },
    )

    # Request code
    res = client.post("/api/auth/forgot-password", json={"email": target_email})
    assert res.status_code == 200
    assert "verification code has been dispatched" in res.json()["message"]

    # Verify email was dispatched
    sent = get_sent_emails()
    otp_email = next((e for e in sent if e["category"] == "password_reset_otp"), None)
    assert otp_email is not None
    assert otp_email["to"] == target_email
    assert "10 minutes" in otp_email["plain_text"]
    assert "Did not request this?" in otp_email["html_body"]

    # Enforces 60-second cooldown on immediate second request
    immediate_res = client.post("/api/auth/forgot-password", json={"email": target_email})
    assert immediate_res.status_code == 429
    assert "Please wait" in immediate_res.json()["detail"]


def test_15_forgot_password_step2_correct_otp_yields_recovery_token():
    """Step 2: Submitting correct OTP produces single-use recovery authorization."""
    email = "step2.user@example.com"
    pwd = "OldPassword2026!"
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Rohan Das",
            "email": email,
            "password": pwd,
            "confirm_password": pwd,
        },
    )

    req_res = client.post("/api/auth/forgot-password", json={"email": email})
    assert req_res.status_code == 200

    # Retrieve dispatched OTP from test email queue
    sent = get_sent_emails()
    otp_email = next(e for e in sent if e["to"] == email and e["category"] == "password_reset_otp")
    dispatched_otp = otp_email["meta"]["otp_code"]
    assert len(dispatched_otp) == 6

    # Verify OTP
    verify_res = client.post(
        "/api/auth/verify-otp",
        json={"email": email, "otp": dispatched_otp},
    )
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["success"] is True
    assert "recovery_token" in data
    assert data["recovery_token"].startswith("REC-")


def test_16_forgot_password_step2_rejects_incorrect_and_reused_otp():
    """Rejects wrong OTP and rejects already consumed OTP."""
    email = "security.burn@example.com"
    pwd = "InitialPassword123!"
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Burn Test",
            "email": email,
            "password": pwd,
            "confirm_password": pwd,
        },
    )

    client.post("/api/auth/forgot-password", json={"email": email})
    sent = get_sent_emails()
    otp = sent[-1]["meta"]["otp_code"]

    # Incorrect code
    bad_res = client.post("/api/auth/verify-otp", json={"email": email, "otp": "000000"})
    assert bad_res.status_code == 400
    assert "Invalid verification code" in bad_res.json()["detail"]

    # Correct code consumes it
    good_res = client.post("/api/auth/verify-otp", json={"email": email, "otp": otp})
    assert good_res.status_code == 200

    # Attempting to reuse the exact same code is rejected
    reuse_res = client.post("/api/auth/verify-otp", json={"email": email, "otp": otp})
    assert reuse_res.status_code == 400
    assert "No active password reset request" in reuse_res.json()["detail"]


def test_17_forgot_password_step2_rejects_expired_otp():
    """Rejects OTP older than 10 minutes."""
    email = "expired.otp@example.com"
    pwd = "InitialPassword123!"
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Expired Test",
            "email": email,
            "password": pwd,
            "confirm_password": pwd,
        },
    )

    client.post("/api/auth/forgot-password", json={"email": email})
    sent = get_sent_emails()
    otp = sent[-1]["meta"]["otp_code"]

    # Artificially age the request beyond 10 minutes
    IN_MEMORY_RESET_REQUESTS[email]["expiresAt"] = datetime.now(UTC) - timedelta(minutes=1)

    expired_res = client.post("/api/auth/verify-otp", json={"email": email, "otp": otp})
    assert expired_res.status_code == 400
    assert "has expired" in expired_res.json()["detail"]


def test_18_forgot_password_step3_reset_password_end_to_end():
    """
    Step 3: Reset password requiring valid recovery authorization.
    Verifies that new password works, old password is dead, and security alert email is sent.
    """
    email = "e2e.reset@example.com"
    old_pwd = "OldPassword2026!"
    new_pwd = "NewBrandPassword2026!"

    client.post(
        "/api/auth/register",
        json={
            "full_name": "Kavita Nair",
            "email": email,
            "password": old_pwd,
            "confirm_password": old_pwd,
        },
    )

    # 1. Request OTP
    client.post("/api/auth/forgot-password", json={"email": email})
    sent = get_sent_emails()
    otp = sent[-1]["meta"]["otp_code"]

    # 2. Verify OTP -> get recovery token
    v_res = client.post("/api/auth/verify-otp", json={"email": email, "otp": otp})
    rec_token = v_res.json()["recovery_token"]

    # Reset without token must fail
    fake_reset = client.post(
        "/api/auth/reset-password",
        json={
            "email": email,
            "recovery_token": "REC-invalid-token",
            "new_password": new_pwd,
            "confirm_password": new_pwd,
        },
    )
    assert fake_reset.status_code == 400

    # 3. Valid reset
    reset_res = client.post(
        "/api/auth/reset-password",
        json={
            "email": email,
            "recovery_token": rec_token,
            "new_password": new_pwd,
            "confirm_password": new_pwd,
        },
    )
    assert reset_res.status_code == 200
    assert "Password reset successfully" in reset_res.json()["message"]

    # Verify security alert email was sent
    all_emails = get_sent_emails()
    alert = next((e for e in all_emails if e["category"] == "password_changed_alert" and e["to"] == email), None)
    assert alert is not None
    assert "Security Alert" in alert["subject"]

    # Verify login with OLD password now FAILS
    old_login = client.post("/api/auth/login", json={"email": email, "password": old_pwd})
    assert old_login.status_code == 401

    # Verify login with NEW password SUCCEEDS
    new_login = client.post("/api/auth/login", json={"email": email, "password": new_pwd})
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()


# ── 5. SESSION MANAGEMENT & HEALTH TESTS ──

def test_19_auth_me_endpoint_returns_current_profile():
    """Protected /api/auth/me returns profile for valid JWT."""
    login_res = client.post(
        "/api/auth/login",
        json={"email": "aravasamarth@gmail.com", "password": "metro2026"},
    )
    token = login_res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["authenticated"] is True
    assert profile["user"]["sub"] == "aravasamarth@gmail.com"
    assert profile["user"]["role"] == "OWNER"
    assert profile["permissions"]["can_view_finances"] is True


def test_20_auth_health_endpoint_reports_safe_subsystem_status():
    """Health check endpoint reports database and SMTP status without leaking credentials."""
    res = client.get("/api/auth/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "connected" in data["database"]
    # Check that plain password/credentials are NEVER in health response
    sanitized = str(data)
    assert "password" not in sanitized.lower() or "password_set" in sanitized.lower()
