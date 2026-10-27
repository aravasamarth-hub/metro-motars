"""
Metro Motors — Storage Provider Abstraction & Safe Local Disk Driver
Provides secure, isolated file storage for vehicle photos, party signatures,
and KYC documents with strict validation:
1. File size limit (10 MB).
2. MIME and magic number (file signature) validation.
3. Safe server-generated filenames to prevent path traversal.
4. Private access segregation for customer signatures and identity documents.
5. Prepared Cloudflare R2 provider stub (clearly marked as deferred).
"""

import abc
import logging
import os
import re
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger("metro_motors.storage")

UPLOAD_BASE_DIR = Path(__file__).parent / "data" / "uploads"
PUBLIC_DIR = UPLOAD_BASE_DIR / "public"
PRIVATE_DIR = UPLOAD_BASE_DIR / "private"

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Magic number signatures for tamper-proof binary validation
MAGIC_SIGNATURES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
}

# Ensure storage directories exist
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
PRIVATE_DIR.mkdir(parents=True, exist_ok=True)


class SecurityError(PermissionError):
    """Raised when an operation violates security policies such as path traversal."""
    pass


class StorageProvider(abc.ABC):
    """Abstract interface for media storage operations."""

    @property
    @abc.abstractmethod
    def name(self) -> str:
        """Provider identifier."""
        pass

    @property
    @abc.abstractmethod
    def is_configured(self) -> bool:
        """Check if provider credentials and endpoints are valid."""
        pass

    @abc.abstractmethod
    async def save_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: str,
        is_private: bool = False,
    ) -> dict[str, Any]:
        """Validate and store file, returning metadata envelope."""
        pass

    @abc.abstractmethod
    def get_file_path(self, filename: str, is_private: bool = False) -> Path | None:
        """Retrieve local absolute path if available."""
        pass


def _validate_magic_signature(file_bytes: bytes, content_type: str) -> bool:
    """Check binary magic signatures including WebP offset constraints."""
    expected_magics = MAGIC_SIGNATURES.get(content_type, [])
    if not any(file_bytes.startswith(sig) for sig in expected_magics):
        return False
    if content_type == "image/webp":
        return len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP"
    return True


def validate_file_content(file_bytes: bytes, content_type: str) -> tuple[bool, str | None]:
    """
    Validate binary contents against size limits, MIME type, and magic bytes.
    """
    if not file_bytes:
        return False, "File is empty (0 bytes)."

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        size_mb = round(len(file_bytes) / (1024 * 1024), 2)
        return False, f"File size ({size_mb} MB) exceeds maximum allowed limit of 10 MB."

    if content_type not in ALLOWED_MIME_TYPES:
        return False, f"Unsupported MIME type '{content_type}'. Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}."

    if not _validate_magic_signature(file_bytes, content_type):
        return False, f"File content signature does not match claimed MIME type '{content_type}'."

    return True, None


class LocalDiskStorageDriver(StorageProvider):
    """Safe, isolated local-disk driver storing files in backend/data/uploads/."""

    @property
    def name(self) -> str:
        return "local_disk"

    @property
    def is_configured(self) -> bool:
        return True

    def _sanitize_extension(self, original_filename: str, content_type: str) -> str:
        """Derive safe file extension from verified MIME type."""
        ext_map = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }
        return ext_map.get(content_type, ".bin")

    async def save_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: str,
        is_private: bool = False,
    ) -> dict[str, Any]:
        # 1. Binary validation
        is_valid, error = validate_file_content(file_bytes, content_type)
        if not is_valid:
            raise ValueError(error)

        # 2. Generate random safe server filename to prevent path traversal
        ext = self._sanitize_extension(original_filename, content_type)
        safe_filename = f"{uuid.uuid4().hex[:16]}{ext}"

        target_dir = PRIVATE_DIR if is_private else PUBLIC_DIR
        dest_path = (target_dir / safe_filename).resolve()

        # 3. Path traversal safety check
        if not str(dest_path).startswith(str(target_dir.resolve())):
            raise SecurityError("Potential path traversal detected in file storage operation.")

        # 4. Write binary data
        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        media_id = f"MED-{uuid.uuid4().hex[:12].upper()}"
        relative_url = f"/api/media/private/{safe_filename}" if is_private else f"/api/media/public/{safe_filename}"

        return {
            "media_id": media_id,
            "filename": safe_filename,
            "original_filename": re.sub(r"[^\w\.-]", "_", original_filename)[:64],
            "content_type": content_type,
            "size_bytes": len(file_bytes),
            "is_private": is_private,
            "url": relative_url,
            "created_date": datetime.now(UTC).isoformat(),
        }

    def get_file_path(self, filename: str, is_private: bool = False) -> Path | None:
        # Strip path navigation characters
        safe_name = os.path.basename(filename)
        target_dir = PRIVATE_DIR if is_private else PUBLIC_DIR
        path = (target_dir / safe_name).resolve()

        if not str(path).startswith(str(target_dir.resolve())):
            return None

        if path.is_file():
            return path
        return None


class CloudflareR2StorageDriver(StorageProvider):
    """
    Prepared driver for Cloudflare R2 object storage.
    Currently DEFERRED until cloud credentials and bucket are provided.
    """

    @property
    def name(self) -> str:
        return "cloudflare_r2"

    @property
    def is_configured(self) -> bool:
        # Explicit feature flag: 0 by default until authorized
        return os.environ.get("ENABLE_R2_STORAGE", "0") == "1"

    async def save_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: str,
        is_private: bool = False,
    ) -> dict[str, Any]:
        if not self.is_configured:
            raise NotImplementedError(
                "Cloudflare R2 storage is deferred per project scope. "
                "Use local_disk storage driver."
            )
        raise NotImplementedError("Cloudflare R2 integration pending credentials.")

    def get_file_path(self, filename: str, is_private: bool = False) -> Path | None:
        return None


# Global active storage instance (Local Disk default)
local_storage = LocalDiskStorageDriver()
r2_storage = CloudflareR2StorageDriver()


def get_storage_provider() -> StorageProvider:
    """Return active storage driver."""
    if r2_storage.is_configured:
        return r2_storage
    return local_storage
