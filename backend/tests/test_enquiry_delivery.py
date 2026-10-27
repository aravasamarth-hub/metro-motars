import json

import pytest
from starlette.testclient import TestClient

from enquiry_service import ENQUIRIES_FILE, rate_limit_store
from security import create_access_token
from server import app


@pytest.fixture(autouse=True)
def clean_enquiry_state():
    """Clear rate limiting and test entries between tests."""
    rate_limit_store.clear()
    yield
    rate_limit_store.clear()


def test_public_enquiry_submission_success():
    client = TestClient(app)
    payload = {
        "name": "Arjun Singhania",
        "phone": "9845012345",
        "preferred_method": "WhatsApp",
        "vehicle_id": "deal-himalayan-450",
        "vehicle_title": "Royal Enfield Himalayan 450 Summit",
        "message": "Looking to inspect the bike this Saturday morning.",
    }

    res = client.post("/api/public/enquiries", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["status"] == "ACCEPTED"
    assert data["persistence"] == "DURABLE_QUEUE"
    assert data["enquiry_id"].startswith("ENQ-")

    # Verify durable JSON Lines persistence
    assert ENQUIRIES_FILE.exists()
    with open(ENQUIRIES_FILE, encoding="utf-8") as f:
        lines = f.readlines()
    last_record = json.loads(lines[-1])
    assert last_record["enquiry_id"] == data["enquiry_id"]
    assert last_record["name"] == "Arjun Singhania"
    assert last_record["phone"] == "9845012345"
    assert last_record["vehicle_id"] == "deal-himalayan-450"


def test_public_enquiry_rejects_extra_fields():
    client = TestClient(app)
    payload = {
        "name": "Test User",
        "phone": "9845012345",
        "preferred_method": "WhatsApp",
        "vehicle_id": "V-1",
        "admin_discount": 5000,  # Unexpected extra field
    }

    res = client.post("/api/public/enquiries", json=payload)
    assert res.status_code == 422


def test_public_enquiry_rejects_malformed_phone():
    client = TestClient(app)
    # Too short
    res1 = client.post("/api/public/enquiries", json={
        "name": "Test User",
        "phone": "12345",
        "vehicle_id": "V-1",
    })
    assert res1.status_code == 422

    # Doesn't start with 6-9
    res2 = client.post("/api/public/enquiries", json={
        "name": "Test User",
        "phone": "2234567890",
        "vehicle_id": "V-1",
    })
    assert res2.status_code == 422


def test_public_enquiry_rate_limiting():
    client = TestClient(app)
    payload = {
        "name": "Rate Limited User",
        "phone": "9900112233",
        "vehicle_id": "V-1",
    }

    # Submit up to the maximum allowed (5)
    for _ in range(5):
        res = client.post("/api/public/enquiries", json=payload)
        assert res.status_code == 201

    # 6th request should trigger 429 Too Many Requests
    blocked_res = client.post("/api/public/enquiries", json=payload)
    assert blocked_res.status_code == 429
    assert "Too many enquiry requests" in blocked_res.json()["detail"]
    assert "Retry-After" in blocked_res.headers


def test_staff_enquiries_log_access_control():
    client = TestClient(app)

    # Anonymous access to staff enquiries log must be rejected
    anon_res = client.get("/api/public/enquiries")
    assert anon_res.status_code == 401

    # Worker role should be denied (Owner/Manager required)
    worker_token = create_access_token(subject="worker@metromotors.in", name="Showroom Worker", role="WORKER")
    worker_res = client.get(
        "/api/public/enquiries",
        headers={"Authorization": f"Bearer {worker_token}"},
    )
    assert worker_res.status_code == 403

    # Owner access allowed
    owner_token = create_access_token(subject="alex@metromotors.in", name="Alex Kumar", role="OWNER")
    owner_res = client.get(
        "/api/public/enquiries",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_res.status_code == 200
    assert isinstance(owner_res.json(), list)


def test_public_showroom_info_endpoint():
    client = TestClient(app)
    res = client.get("/api/public/showroom-info")
    assert res.status_code == 200
    data = res.json()
    assert "showroom_name" in data
    assert "phone" in data
    assert "raw_phone" in data
    assert "address" in data
    assert "hours" in data
    assert "whatsapp_url" in data
    assert data["whatsapp_url"].startswith("https://wa.me/")
