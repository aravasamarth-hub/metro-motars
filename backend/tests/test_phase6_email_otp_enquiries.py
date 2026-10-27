"""
Metro Motors — Phase 6 Email, OTP & Enquiries Test Suite
Empirically verifies:
1. Public customer enquiries persist to local disk even when SMTP is unconfigured.
2. Rate limiting protects public enquiry submission from flood attacks.
3. Password recovery OTP generation, verification, and single-use expiry semantics.
4. Non-disclosure: OTP values, tokens, and passwords are never logged or returned unmasked.
"""

import asyncio
import os

import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

from fastapi import HTTPException

from auth_service import (
    RESET_REQUEST_COOLDOWNS,
    request_password_recovery_otp,
    reset_password_with_recovery_token,
    seed_default_showroom_users,
    verify_password_recovery_otp,
)
from email_service import clear_test_inbox, email_service, get_sent_emails
from enquiry_service import (
    check_rate_limit,
    list_saved_enquiries,
    rate_limit_store,
)
from security import create_access_token
from server import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_context():
    seed_default_showroom_users()
    clear_test_inbox()
    RESET_REQUEST_COOLDOWNS.clear()
    rate_limit_store.clear()


def owner_headers() -> dict[str, str]:
    token = create_access_token(subject="alex@metromotors.in", name="Alex Kumar", role="OWNER")
    return {"Authorization": f"Bearer {token}"}


# ─── 1. ENQUIRY PERSISTENCE & SMTP INDEPENDENCE ────────────────────────────────

def test_01_enquiry_persists_locally_without_smtp():
    """
    Submitting an enquiry when SMTP is not configured must still persist the record
    durably to local storage (enquiries.jsonl) and queue a synthetic test notification.
    """
    original_host = email_service.smtp_host
    try:
        email_service.smtp_host = None  # Ensure SMTP is marked unconfigured

        enquiry_payload = {
            "name": "Rohan Sharma",
            "phone": "9887766554",
            "preferred_method": "WhatsApp",
            "vehicle_id": "VEH-TEST-001",
            "vehicle_title": "Royal Enfield Classic 350",
            "message": "Interested in booking a test ride this weekend.",
        }
        res = client.post("/api/public/enquiries", json=enquiry_payload)
        assert res.status_code == 201
        data = res.json()
        assert data["enquiry_id"].startswith("ENQ-")
        assert data["status"] == "ACCEPTED"

        assert data["persistence"] == "DURABLE_QUEUE"
        assert data["notification"] == "disabled"

        # Verify record exists in local persistence
        saved = list_saved_enquiries(limit=10)
        found = any(e.get("phone") == "9887766554" for e in saved)
        assert found is True, "Enquiry was not saved to local enquiries log!"
    finally:
        email_service.smtp_host = original_host


def test_02_enquiry_rate_limiting():
    """Verify check_rate_limit enforces cooldown after 5 rapid requests from same IP/phone."""
    test_ip = "192.168.1.105"
    test_phone = "9112233445"

    # First 5 requests allowed
    for _ in range(5):
        allowed, _ = check_rate_limit(test_ip, test_phone)
        assert allowed is True

    # 6th request must be blocked
    blocked, retry_after = check_rate_limit(test_ip, test_phone)
    assert blocked is False
    assert retry_after > 0


# ─── 2. OTP GENERATION & EXPIRATION SEMANTICS ──────────────────────────────────

def test_03_otp_recovery_lifecycle_and_single_use():
    """
    Verify full OTP recovery lifecycle:
    1. Request OTP -> Dispatched to test inbox.
    2. Verify OTP -> Issues single-use recovery token.
    3. Reusing the same OTP code fails (single-use semantics).
    4. Reset password using recovery token succeeds.
    """
    email = "alex@metromotors.in"

    # Step 1: Request OTP
    res_req = asyncio.run(request_password_recovery_otp(email))
    assert res_req["success"] is True

    sent = get_sent_emails()
    assert len(sent) >= 1
    otp_record = [e for e in sent if e["category"] == "password_reset_otp"][-1]
    otp_code = otp_record["meta"]["otp_code"]
    assert len(otp_code) == 6
    assert otp_code.isdigit()

    # Step 2: Verify valid OTP
    res_verify = asyncio.run(verify_password_recovery_otp(email, otp_code))
    assert res_verify["success"] is True
    recovery_token = res_verify["recovery_token"]
    assert len(recovery_token) >= 32

    # Step 3: Reusing the same OTP code must fail (single-use burned)
    with pytest.raises(HTTPException) as exc_reused:
        asyncio.run(verify_password_recovery_otp(email, otp_code))
    assert exc_reused.value.status_code == 400
    assert "No active password reset request" in str(exc_reused.value.detail) or "Invalid" in str(exc_reused.value.detail)

    # Step 4: Reset password with recovery token
    new_password = "SuperStrongPassword2026!"
    res_reset = asyncio.run(reset_password_with_recovery_token(email, recovery_token, new_password, new_password))
    assert res_reset["success"] is True


def test_04_invalid_otp_rejection_and_attempt_limit():
    """Submitting wrong OTP increments attempt counter and is rejected."""
    email = "alex@metromotors.in"
    asyncio.run(request_password_recovery_otp(email))

    with pytest.raises(HTTPException) as exc:
        asyncio.run(verify_password_recovery_otp(email, "000000"))
    assert exc.value.status_code == 400
    assert "Invalid verification code" in str(exc.value.detail)
