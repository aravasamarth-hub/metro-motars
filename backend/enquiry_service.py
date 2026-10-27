"""
Reliable Customer Enquiry Delivery Service for Metro Motors (Without MongoDB)
Persists customer purchase leads durably to local JSON Lines storage, enforces
strict field allowlisting, input validation, rate limiting, and optional notification delivery.
"""

import hashlib
import json
import logging
import os
import re
import smtplib
import time
import uuid
from datetime import UTC, datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from threading import Lock

from pydantic import BaseModel, ConfigDict, Field, field_validator

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"
ENQUIRIES_FILE = DATA_DIR / "enquiries.jsonl"
file_lock = Lock()

# Rate limiting storage: {identifier: [timestamps]}
RATE_LIMIT_WINDOW_SECONDS = 900  # 15 minutes
MAX_REQUESTS_PER_WINDOW = 5
rate_limit_store: dict[str, list[float]] = {}
rate_limit_lock = Lock()


class CustomerEnquiryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=2, max_length=80, description="Full customer name")
    phone: str = Field(..., min_length=10, max_length=15, description="10-digit Indian mobile number")
    preferred_method: str = Field(default="WhatsApp", description="Preferred contact method")
    vehicle_id: str = Field(..., min_length=1, max_length=100, description="Public vehicle reference ID")
    vehicle_title: str | None = Field(default="Motorcycle Enquiry", max_length=120)
    message: str | None = Field(default="", max_length=500, description="Customer questions or test ride request")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters.")
        # Reject control characters or script tags
        if re.search(r"[\<\>\{\}\;]", clean):
            raise ValueError("Name contains invalid characters.")
        return clean

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = re.sub(r"[\s\-\+\(\)]", "", v)
        # Handle country code +91 or 91 prefix
        if clean.startswith("91") and len(clean) == 12:
            clean = clean[2:]
        if not re.match(r"^[6-9]\d{9}$", clean):
            raise ValueError("Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")
        return clean

    @field_validator("preferred_method")
    @classmethod
    def validate_preferred_method(cls, v: str) -> str:
        if v not in ("WhatsApp", "Phone Call"):
            return "WhatsApp"
        return v

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str | None) -> str:
        if not v:
            return ""
        clean = v.strip()
        return clean[:500]


def check_rate_limit(client_ip: str, phone: str) -> tuple[bool, int]:
    """
    Checks rate limiting per client IP and phone number.
    Returns (is_allowed, retry_after_seconds).
    """
    now = time.time()
    # Mask identifier using sha256 to avoid storing raw client IPs
    key = hashlib.sha256(f"{client_ip}:{phone}".encode()).hexdigest()[:16]

    with rate_limit_lock:
        timestamps = rate_limit_store.get(key, [])
        # Prune old timestamps
        valid_timestamps = [ts for ts in timestamps if now - ts < RATE_LIMIT_WINDOW_SECONDS]

        if len(valid_timestamps) >= MAX_REQUESTS_PER_WINDOW:
            oldest = valid_timestamps[0]
            retry_after = int(RATE_LIMIT_WINDOW_SECONDS - (now - oldest))
            rate_limit_store[key] = valid_timestamps
            return False, max(retry_after, 1)

        valid_timestamps.append(now)
        rate_limit_store[key] = valid_timestamps
        return True, 0


def ensure_storage_dir():
    """Ensure data directory and permissions exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def persist_enquiry(record: dict) -> bool:
    """
    Durably appends the enquiry record to disk in JSON Lines format.
    Thread-safe and atomic per line.
    """
    ensure_storage_dir()
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with file_lock, open(ENQUIRIES_FILE, "a", encoding="utf-8") as f:
        f.write(line)
    return True


def list_saved_enquiries(limit: int = 100) -> list[dict]:
    """Reads saved enquiries from disk for audit or staff review."""
    if not ENQUIRIES_FILE.exists():
        return []
    records = []
    with file_lock:
        try:
            with open(ENQUIRIES_FILE, encoding="utf-8") as f:
                for line in f:
                    stripped = line.strip()
                    if stripped:
                        try:
                            records.append(json.loads(stripped))
                        except Exception:
                            continue
        except Exception as e:
            logger.error(f"Error reading enquiries file: {e}")
            return []
    records.reverse()
    return records[:limit]


def send_email_notification(record: dict) -> tuple[bool, str]:
    """
    Dispatches transactional notification if SMTP is configured.
    Safely handles disabled state, misconfiguration, and timeouts.
    """
    enabled = os.environ.get("ENQUIRY_NOTIFICATIONS_ENABLED", "0").strip() == "1"
    if not enabled:
        return False, "disabled"

    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_port = int(os.environ.get("SMTP_PORT", "587").strip() or "587")
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_pass = os.environ.get("SMTP_PASS", "").strip()
    recipient = os.environ.get("SHOWROOM_NOTIFICATION_EMAIL", "sales@metromotors.in").strip()

    if not smtp_host or not smtp_user:
        return False, "unconfigured"

    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = recipient
        msg["Subject"] = f"[Metro Motors Lead] New Enquiry for {record.get('vehicle_title', 'Vehicle')}"

        body = (
            f"New purchase enquiry registered on Metro Motors Marketplace:\n\n"
            f"Reference ID: {record['enquiry_id']}\n"
            f"Customer Name: {record['name']}\n"
            f"Phone (WhatsApp): {record['phone']}\n"
            f"Preferred Contact: {record['preferred_method']}\n"
            f"Vehicle: {record.get('vehicle_title')} (Ref: {record['vehicle_id']})\n"
            f"Date: {record['created_at']}\n"
            f"Message: {record.get('message') or 'None'}\n\n"
            f"--\nMetro Motors Automated Lead Dispatcher"
        )
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(smtp_host, smtp_port, timeout=8) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        logger.info(f"Notification email dispatched for enquiry {record['enquiry_id']}")
        return True, "delivered"
    except Exception as e:
        logger.warning(f"Notification email dispatch failed for {record['enquiry_id']}: {e}")
        return False, "delivery_failed"


def process_enquiry_submission(payload: CustomerEnquiryCreate, client_ip: str = "127.0.0.1") -> dict:
    """
    Processes, persists, and attempts dispatch of a customer enquiry.
    Guarantees that an enquiry is durably persisted even if email dispatch fails.
    """
    enquiry_id = f"ENQ-{uuid.uuid4().hex[:10].upper()}"
    created_at = datetime.now(UTC).isoformat()

    record = {
        "enquiry_id": enquiry_id,
        "name": payload.name,
        "phone": payload.phone,
        "preferred_method": payload.preferred_method,
        "vehicle_id": payload.vehicle_id,
        "vehicle_title": payload.vehicle_title,
        "message": payload.message,
        "created_at": created_at,
        "ip_hash": hashlib.sha256(client_ip.encode()).hexdigest()[:12],
    }

    # 1. Persist durably to file storage
    persist_enquiry(record)

    # 2. Attempt notification delivery if provider is configured
    notified, delivery_state = send_email_notification(record)

    return {
        "success": True,
        "enquiry_id": enquiry_id,
        "status": "ACCEPTED",
        "persistence": "DURABLE_QUEUE",
        "notification": delivery_state,
        "message": (
            "Your enquiry has been received and registered with our showroom team. "
            "Our specialist will contact you shortly."
        ),
    }
