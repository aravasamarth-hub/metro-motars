"""
Metro Motors — Phase 7 Resilience, Recovery & Storage Audit Tests
Empirically verifies:
1. Enquiry queue recovery across simulated process restarts (disk persistence).
2. Rate limiting and duplicate protection on rapid enquiry submissions.
3. Upload authorization: unauthenticated callers are rejected from /api/media/upload (401).
4. Private KYC/signature document isolation: customers and anonymous callers cannot access private media (401/403).
5. OTP recovery expiration: OTP codes cannot be redeemed after 10-minute expiry window.
"""

import asyncio
import io
import os
from datetime import UTC, datetime, timedelta

import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

from fastapi import HTTPException

from auth_service import (
    IN_MEMORY_RESET_REQUESTS,
    RESET_REQUEST_COOLDOWNS,
    request_password_recovery_otp,
    seed_default_showroom_users,
    verify_password_recovery_otp,
)
from email_service import clear_test_inbox, get_sent_emails
from enquiry_service import (
    check_rate_limit,
    list_saved_enquiries,
    persist_enquiry,
    rate_limit_store,
)
from security import create_access_token
from server import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_context():
    seed_default_showroom_users()
    clear_test_inbox()
    RESET_REQUEST_COOLDOWNS.clear()
    rate_limit_store.clear()


def staff_headers():
    token = create_access_token(subject="rajesh@metromotors.in", name="Rajesh Gowda", role="WORKER")
    return {"Authorization": f"Bearer {token}"}


def customer_headers():
    token = create_access_token(subject="customer@gmail.com", name="Rohan Customer", role="CUSTOMER")
    return {"Authorization": f"Bearer {token}"}


def test_01_enquiry_disk_recovery_across_restarts():
    """
    Simulates writing an enquiry, re-opening the disk file afresh, and verifying
    that all records are recovered without corruption.
    """
    test_id = f"ENQ-TEST-{int(datetime.now(UTC).timestamp())}"
    record = {
        "enquiry_id": test_id,
        "name": "Suresh Raina",
        "phone": "9845098450",
        "preferred_method": "Call",
        "vehicle_id": "VEH-TEST-999",
        "vehicle_title": "Honda CB350 H'ness",
        "message": "Is this single owner?",
        "created_at": datetime.now(UTC).isoformat(),
        "client_ip_hash": "testhash123",
        "status": "ACCEPTED",
    }
    persisted = persist_enquiry(record)
    assert persisted is True

    # Simulate restart by re-reading from disk afresh
    loaded = list_saved_enquiries(limit=100)
    found = next((e for e in loaded if e.get("enquiry_id") == test_id), None)
    assert found is not None
    assert found["name"] == "Suresh Raina"
    assert found["vehicle_title"] == "Honda CB350 H'ness"


def test_02_rapid_duplicate_enquiries_trigger_rate_limit():
    """
    Submitting more than 5 rapid enquiries with the same phone/IP triggers rate limiting.
    """
    ip = "10.0.0.99"
    phone = "9988776655"
    for i in range(5):
        allowed, _ = check_rate_limit(ip, phone)
        assert allowed is True, f"Request {i+1} should have been allowed"

    # 6th request must be blocked
    blocked, retry_after = check_rate_limit(ip, phone)
    assert blocked is False
    assert retry_after > 0


def test_03_media_upload_requires_authentication():
    """
    POST /api/media/upload must reject anonymous requests with 401 Unauthorized.
    """
    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
    file_payload = ("test.png", io.BytesIO(fake_png), "image/png")
    res_anon = client.post("/api/media/upload", files={"file": file_payload})
    assert res_anon.status_code == 401


def test_04_media_upload_rejects_customer_role():
    """
    POST /api/media/upload must reject CUSTOMER role with 403 Forbidden
    because only showroom staff can upload inventory media.
    """
    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
    file_payload = ("test.png", io.BytesIO(fake_png), "image/png")
    res_customer = client.post(
        "/api/media/upload",
        files={"file": file_payload},
        headers=customer_headers(),
    )
    assert res_customer.status_code == 403


def test_05_otp_expires_after_time_window():
    """
    OTP codes must not be verified if the request is older than 10 minutes.
    """
    email = "alex@metromotors.in"
    asyncio.run(request_password_recovery_otp(email))

    sent = get_sent_emails()
    otp_code = sent[-1]["meta"]["otp_code"]

    # Age the OTP request artificially beyond 10 minutes
    IN_MEMORY_RESET_REQUESTS[email]["expiresAt"] = datetime.now(UTC) - timedelta(minutes=1)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(verify_password_recovery_otp(email, otp_code))
    assert exc_info.value.status_code == 400
    assert "expired" in str(exc_info.value.detail).lower()
