"""
Metro Motors — Backend Security & RBAC Test Suite
Validates that server-side authentication (JWT), password hashing (bcrypt),
and granular Role-Based Access Control (RBAC) are strictly enforced by FastAPI.

Run without requiring MongoDB Atlas by using FastAPI TestClient with mocked DB dependencies.
"""

import os
from datetime import timedelta

import pytest
from fastapi import HTTPException
from starlette.testclient import TestClient

# Ensure database index creation is skipped in test environment
os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"

from security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from server import app

client = TestClient(app)


def test_password_hashing_and_verification():
    """Verify bcrypt salt rounds and comparison logic."""
    raw_password = "SuperSecretPassword123!"
    hashed = hash_password(raw_password)

    assert hashed.startswith("$2b$12$")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("", hashed) is False


def test_jwt_token_creation_and_claims():
    """Verify signed JWT token claims, expiration, and issuer."""
    token = create_access_token(
        subject="alex@metromotors.in",
        name="Alex Kumar",
        role="OWNER",
    )
    claims = decode_access_token(token)

    assert claims["sub"] == "alex@metromotors.in"
    assert claims["name"] == "Alex Kumar"
    assert claims["role"] == "OWNER"
    assert claims["iss"] == "metro-motors-auth"
    assert claims["permissions"]["can_view_finances"] is True
    assert claims["permissions"]["can_delete_bills"] is True


def test_expired_jwt_token_rejected():
    """Verify that an expired JWT token is rejected with 401 Unauthorized."""
    expired_token = create_access_token(
        subject="expired@metromotors.in",
        name="Expired User",
        role="WORKER",
        expires_delta=timedelta(seconds=-10),  # expired 10 seconds ago
    )

    response = client.get(
        "/api/deals",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    assert "expired" in response.json().get("detail", "").lower()


def test_anonymous_access_denied_on_protected_endpoints():
    """Verify that protected endpoints reject anonymous requests with 401 Unauthorized."""
    # List deals
    res_deals = client.get("/api/deals")
    assert res_deals.status_code == 401
    assert "Authentication required" in res_deals.json().get("detail", "")

    # Create deal
    res_create = client.post("/api/deals", json={"deal_type": "Buy & Sell", "status": "Draft", "vehicle_id": "V1"})
    assert res_create.status_code == 401

    # Finances summary
    res_finances = client.get("/api/finances/summary")
    assert res_finances.status_code == 401

    # Simple CRUD endpoints (vehicles, sellers, bills)
    assert client.get("/api/vehicles").status_code == 401
    assert client.get("/api/sellers").status_code == 401
    assert client.get("/api/bills").status_code == 401


def test_malformed_and_invalid_token_rejected():
    """Verify that malformed or tampered tokens are rejected with 401."""
    res_garbage = client.get("/api/deals", headers={"Authorization": "Bearer this_is_garbage_token"})
    assert res_garbage.status_code == 401

    res_missing_bearer = client.get("/api/deals", headers={"Authorization": "Basic 123456"})
    assert res_missing_bearer.status_code == 401


def test_worker_role_denied_finances_and_deletion():
    """Verify that a WORKER role cannot access finance summaries or delete deals (403 Forbidden)."""
    worker_token = create_access_token(
        subject="worker@metromotors.in",
        name="Showroom Staff",
        role="WORKER",
    )
    worker_headers = {"Authorization": f"Bearer {worker_token}"}

    # Worker accessing /finances/summary must be 403 Forbidden
    res_finances = client.get("/api/finances/summary", headers=worker_headers)
    assert res_finances.status_code == 403
    assert "permission" in res_finances.json().get("detail", "").lower()

    # Worker attempting to delete a deal must be 403 Forbidden
    res_delete = client.delete("/api/deals/DEAL-TEST-001", headers=worker_headers)
    assert res_delete.status_code == 403
    assert "forbidden" in res_delete.json().get("detail", "").lower()


def test_owner_role_allowed_privileges():
    """Verify that an OWNER role has permission flags for finances and deletion."""
    owner_token = create_access_token(
        subject="owner@metromotors.in",
        name="Showroom Owner",
        role="OWNER",
    )
    claims = decode_access_token(owner_token)
    assert claims["permissions"]["can_view_finances"] is True
    assert claims["permissions"]["can_delete_deals"] is True
    assert claims["permissions"]["can_delete_bills"] is True


def test_auth_login_endpoint_issues_signed_jwt():
    """Verify /api/auth/login generates valid JWT access tokens for valid credentials."""
    res = client.post("/api/auth/login", json={"email": "alex@metromotors.in", "password": None})
    assert res.status_code == 200

    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "OWNER"
    assert data["permissions"]["can_view_finances"] is True

    # Validate that the issued token is verifiable by the security module
    token_claims = decode_access_token(data["access_token"])
    assert token_claims["sub"] == "alex@metromotors.in"
    assert token_claims["role"] == "OWNER"


def test_cors_preflight_and_explicit_origins():
    """Verify CORS preflight returns configured origin and methods."""
    res = client.options(
        "/api/deals",
        headers={
            "Origin": "http://localhost:3001",
            "Access-Control-Request-Method": "GET",
        },
    )
    # FastApi/Starlette CORS preflight response
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3001"


def test_agent_role_access_removed_and_forbidden():
    """Verify that AGENT role access is removed and rejected by security module."""
    # Attempting to issue a token with AGENT role must raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        create_access_token(
            subject="broker@agent.in",
            name="External Broker",
            role="AGENT",
        )
    assert exc_info.value.status_code == 403
    assert "AGENT access has been removed" in exc_info.value.detail

    # Forging an AGENT token with direct jwt encode must be rejected at get_current_user
    import jwt

    from security import JWT_ALGORITHM, JWT_SECRET_KEY
    forged_agent_token = jwt.encode(
        {
            "sub": "broker@agent.in",
            "name": "External Broker",
            "role": "AGENT",
            "exp": 9999999999,
            "iss": "metro-motors-auth",
        },
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )
    res = client.get("/api/deals", headers={"Authorization": f"Bearer {forged_agent_token}"})
    assert res.status_code == 403
    assert "AGENT access has been removed" in res.json().get("detail", "")
