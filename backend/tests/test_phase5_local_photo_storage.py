"""
Metro Motors — Phase 5 Local Photo Storage Test Suite
Empirically verifies:
1. Max file size validation (10 MB limit).
2. MIME and magic number file signature validation.
3. Safe server-generated filenames preventing path traversal.
4. Segregated access control: private signatures and KYC documents require authentication.
5. Cloudflare R2 provider stub safely reports unconfigured status.
"""

import io
import os

import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

from security import create_access_token
from server import app
from storage_service import (
    MAX_FILE_SIZE_BYTES,
    CloudflareR2StorageDriver,
    validate_file_content,
)

client = TestClient(app)

# Valid synthetic JPEG header (starts with \xff\xd8\xff)
VALID_JPEG_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + (b"\x00" * 100)
# Valid synthetic PNG header (starts with \x89PNG\r\n\x1a\n)
VALID_PNG_BYTES = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + (b"\x00" * 100)
# Fake image file: claims image/jpeg but contains plain ASCII text
CORRUPT_FAKE_JPEG = b"Hello I am just a plain text file pretending to be an image!"


def staff_headers() -> dict[str, str]:
    token = create_access_token(subject="staff@metromotors.in", name="Showroom Staff", role="WORKER")
    return {"Authorization": f"Bearer {token}"}


# ─── 1. FILE CONTENT & MAGIC SIGNATURE VALIDATION ──────────────────────────────

def test_01_valid_jpeg_and_png_are_accepted():
    """Verify genuinely signed JPEG and PNG byte sequences pass validation."""
    ok_jpg, err_jpg = validate_file_content(VALID_JPEG_BYTES, "image/jpeg")
    assert ok_jpg is True
    assert err_jpg is None

    ok_png, err_png = validate_file_content(VALID_PNG_BYTES, "image/png")
    assert ok_png is True
    assert err_png is None


def test_02_oversized_file_is_rejected():
    """Verify files exceeding 10 MB are rejected."""
    oversized_bytes = VALID_JPEG_BYTES + (b"\x00" * (MAX_FILE_SIZE_BYTES + 1024))
    is_valid, error = validate_file_content(oversized_bytes, "image/jpeg")
    assert is_valid is False
    assert "exceeds maximum allowed limit" in error


def test_03_fake_mismatched_magic_signature_is_rejected():
    """Verify text file claiming to be image/jpeg is rejected due to magic signature mismatch."""
    is_valid, error = validate_file_content(CORRUPT_FAKE_JPEG, "image/jpeg")
    assert is_valid is False
    assert "signature does not match claimed MIME type" in error


def test_04_disallowed_mime_types_are_rejected():
    """Verify non-image formats (PDF, executable, text) are strictly rejected."""
    pdf_bytes = b"%PDF-1.4 header contents..."
    is_valid, error = validate_file_content(pdf_bytes, "application/pdf")
    assert is_valid is False
    assert "Unsupported MIME type" in error


# ─── 2. SAFE STORAGE & PATH TRAVERSAL DEFENSE ─────────────────────────────────

def test_05_upload_generates_safe_random_filename_and_prevents_traversal():
    """
    Submitting a filename with path traversal characters (../../etc/passwd) must be
    completely neutralized and stored under a generated UUID name.
    """
    file_payload = ("../../malicious_name.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")
    res = client.post(
        "/api/media/upload",
        files={"file": file_payload},
        data={"is_private": "false"},
        headers=staff_headers(),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["filename"].endswith(".jpg")
    assert ".." not in data["filename"]
    assert "malicious" not in data["filename"]
    assert data["url"].startswith("/api/media/public/")


def test_06_private_media_requires_authentication():
    """
    Private files (such as signatures and customer Aadhaar/PAN cards) must reject
    anonymous requests with 401 Unauthorized.
    """
    # 1. Upload a private signature
    sig_payload = ("customer_signature.png", io.BytesIO(VALID_PNG_BYTES), "image/png")
    res_upload = client.post(
        "/api/media/upload",
        files={"file": sig_payload},
        data={"is_private": "true"},
        headers=staff_headers(),
    )
    assert res_upload.status_code == 200
    private_filename = res_upload.json()["filename"]

    # 2. Anonymous request to /api/media/private/<filename> must be 401
    res_anon = client.get(f"/api/media/private/{private_filename}")
    assert res_anon.status_code == 401

    # 3. Authenticated showroom staff request succeeds
    res_auth = client.get(f"/api/media/private/{private_filename}", headers=staff_headers())
    assert res_auth.status_code == 200

    # 4. Customer role request must be rejected with 403 Forbidden
    customer_token = create_access_token(subject="user@gmail.com", name="Google Customer", role="CUSTOMER")
    res_customer = client.get(f"/api/media/private/{private_filename}", headers={"Authorization": f"Bearer {customer_token}"})
    assert res_customer.status_code == 403


def test_07_cloudflare_r2_provider_reports_deferred():
    """Verify that Cloudflare R2 provider is unconfigured by default per project scope."""
    r2 = CloudflareR2StorageDriver()
    assert r2.is_configured is False
    with pytest.raises(NotImplementedError) as exc_info:
        import asyncio
        asyncio.run(r2.save_file(VALID_JPEG_BYTES, "test.jpg", "image/jpeg"))
    assert "deferred per project scope" in str(exc_info.value)
