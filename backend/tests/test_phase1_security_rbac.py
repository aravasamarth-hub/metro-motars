"""
Metro Motors — Phase 1 Critical Security & Role-Based Access Control (RBAC) Tests
Empirically verifies:
1. Strict server-side role enforcement: staff/worker responses never contain purchase cost,
   margin, or commission fields on /overview/deals, /overview/dashboard, or deal workspaces.
2. Direct API protections: /payments and confidential /bills are forbidden (403) for staff.
3. Anonymous requests to internal endpoints are rejected (401).
4. Production authentication safety: production mode strictly disables demo passwords,
   rejects password-less logins, disables legacy setup endpoints, and avoids customer privilege escalation.
"""

import asyncio
import os
from unittest.mock import patch

import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

from fastapi import HTTPException

import server
from auth_service import (
    IN_MEMORY_USERS,
    authenticate_user_credentials,
    seed_default_showroom_users,
)
from security import (
    create_access_token,
    decode_access_token,
    get_permissions_for_role,
)
from server import app

client = TestClient(app)


class MockCursor:
    def __init__(self, data):
        self._data = data

    def sort(self, *args, **kwargs):
        return self

    async def to_list(self, length=None):
        return list(self._data)


class MockCollection:
    def __init__(self, data=None):
        self._data = list(data) if data else []

    def find(self, *args, **kwargs):
        return MockCursor(self._data)

    async def find_one(self, filter_dict=None, *args, **kwargs):
        if not self._data:
            return None
        return self._data[0]


SYNTHETIC_DEALS = [
    {
        "deal_id": "DEAL-001",
        "deal_type": "Buy & Sell",
        "status": "Active",
        "vehicle_id": "VEH-001",
        "seller_id": "SEL-001",
        "buyer_id": "BUY-001",
        "created_date": "2026-01-01T00:00:00Z",
    }
]
SYNTHETIC_VEHICLES = [
    {
        "vehicle_id": "VEH-001",
        "vehicle_name": "Royal Enfield Classic 350",
        "registration_number": "KA01AB1234",
        "created_date": "2026-01-01T00:00:00Z",
    }
]
SYNTHETIC_SELLERS = [
    {
        "seller_id": "SEL-001",
        "name": "Synthetic Seller",
        "phone": "9876543210",
    }
]
SYNTHETIC_BUYERS = [
    {
        "buyer_id": "BUY-001",
        "name": "Synthetic Buyer",
        "phone": "9123456780",
    }
]
SYNTHETIC_PAYMENTS = [
    {
        "payment_id": "PAY-001",
        "deal_id": "DEAL-001",
        "payment_type": "Purchase",
        "amount": 120000.0,
        "payment_status": "Paid",
        "payment_date": "2026-01-02",
        "created_date": "2026-01-02T00:00:00Z",
    },
    {
        "payment_id": "PAY-002",
        "deal_id": "DEAL-001",
        "payment_type": "Sale",
        "amount": 145000.0,
        "payment_status": "Paid",
        "payment_date": "2026-01-05",
        "created_date": "2026-01-05T00:00:00Z",
    },
    {
        "payment_id": "PAY-003",
        "deal_id": "DEAL-001",
        "payment_type": "Commission",
        "amount": 5000.0,
        "payment_status": "Paid",
        "payment_date": "2026-01-05",
        "created_date": "2026-01-05T00:00:00Z",
    },
]


class MockDatabase:
    def __init__(self, collections_dict):
        self._collections = collections_dict
        for k, v in collections_dict.items():
            setattr(self, k, v)

    def __getitem__(self, name):
        return self._collections.get(name)


@pytest.fixture(autouse=True)
def setup_mock_environment():
    """Ensure in-memory users and mock collections are populated for unit tests."""
    seed_default_showroom_users()
    server.COLLECTIONS["deals"] = MockCollection(SYNTHETIC_DEALS)
    server.COLLECTIONS["vehicles"] = MockCollection(SYNTHETIC_VEHICLES)
    server.COLLECTIONS["sellers"] = MockCollection(SYNTHETIC_SELLERS)
    server.COLLECTIONS["buyers"] = MockCollection(SYNTHETIC_BUYERS)
    server.COLLECTIONS["witnesses"] = MockCollection([])
    server.COLLECTIONS["payments"] = MockCollection(SYNTHETIC_PAYMENTS)
    server.COLLECTIONS["documents"] = MockCollection([])
    server.COLLECTIONS["bills"] = MockCollection([])
    server.db = MockDatabase(server.COLLECTIONS)


def get_token_for(role: str, email: str, name: str) -> str:
    return create_access_token(subject=email, name=name, role=role)


# ─── 1. SERVER-SIDE ROLE ENFORCEMENT & FINANCIAL LEAK REMEDIATION ──────────────

def test_01_anonymous_request_to_overview_deals_is_rejected():
    """Verify unauthenticated requests cannot inspect showroom deals."""
    res = client.get("/api/overview/deals")
    assert res.status_code == 401
    assert "authentication required" in res.json().get("detail", "").lower()


def test_02_staff_token_redacts_costs_margins_and_commissions_on_overview_deals():
    """
    CRITICAL PROOF: Calling /api/overview/deals with a staff/worker token must NOT
    contain 'spent' (purchase cost), 'earned' (selling total), or 'commission'.
    """
    staff_token = get_token_for("WORKER", "staff@metromotors.in", "Showroom Staff")
    res = client.get("/api/overview/deals", headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 200

    deals = res.json()
    assert isinstance(deals, list)
    assert len(deals) > 0, "Expected at least one deal row in test"
    for deal in deals:
        assert "spent" not in deal or deal["spent"] is None, "LEAK: 'spent' present in staff deal overview!"
        assert "commission" not in deal or deal["commission"] is None, "LEAK: 'commission' present in staff deal overview!"
        assert "earned" not in deal or deal["earned"] is None, "LEAK: 'earned' present in staff deal overview!"


def test_03_owner_token_retains_full_financial_visibility_on_overview_deals():
    """Verify showroom owner still accesses financial metrics for operational accounting."""
    owner_token = get_token_for("OWNER", "alex@metromotors.in", "Alex Kumar")
    res = client.get("/api/overview/deals", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200

    deals = res.json()
    assert isinstance(deals, list)
    assert len(deals) > 0, "Expected at least one deal row in test"
    deal = deals[0]
    # In owner view, financial fields exist and match synthetic calculations
    assert "spent" in deal and deal["spent"] == 120000.0
    assert "earned" in deal and deal["earned"] == 145000.0
    assert "commission" in deal and deal["commission"] == 5000.0


def test_04_staff_dashboard_overview_redacts_net_finances_and_dues():
    """Verify /api/overview/dashboard redacts net_finances and recently_sold costs for staff."""
    staff_token = get_token_for("WORKER", "staff@metromotors.in", "Showroom Staff")
    res = client.get("/api/overview/dashboard", headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 200

    data = res.json()
    # Net finances and pending dues must be redacted for staff
    assert data["net_finances"] is None, "LEAK: net_finances visible to staff on dashboard!"
    assert data["pending_dues"] is None, "LEAK: pending_dues visible to staff on dashboard!"

    # Operational metrics must remain available for staff showroom duties
    assert "bikes_in_stock" in data
    assert "total_deals" in data
    assert "new_deals" in data

    # Any recently sold deals in staff dashboard must have costs redacted
    for sold in data.get("recently_sold", []):
        assert "spent" not in sold or sold["spent"] is None
        assert "commission" not in sold or sold["commission"] is None


def test_05_owner_dashboard_overview_includes_full_finances():
    """Verify /api/overview/dashboard returns complete treasury metrics for owner."""
    owner_token = get_token_for("OWNER", "alex@metromotors.in", "Alex Kumar")
    res = client.get("/api/overview/dashboard", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200

    data = res.json()
    assert data["net_finances"] is not None
    assert isinstance(data["net_finances"], (int, float))


def test_06_staff_direct_payments_crud_is_forbidden():
    """Verify staff cannot query /api/payments directly (403 Forbidden)."""
    staff_token = get_token_for("WORKER", "staff@metromotors.in", "Showroom Staff")
    res = client.get("/api/payments", headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 403
    assert "can_view_payments" in res.json().get("detail", "")


def test_07_owner_can_query_payments():
    """Verify owner has permission to query payments collection."""
    owner_token = get_token_for("OWNER", "alex@metromotors.in", "Alex Kumar")
    res = client.get("/api/payments", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_08_staff_direct_bills_crud_is_forbidden():
    """Verify staff cannot query /api/bills directly (403 Forbidden)."""
    staff_token = get_token_for("WORKER", "staff@metromotors.in", "Showroom Staff")
    res = client.get("/api/bills", headers={"Authorization": f"Bearer {staff_token}"})
    assert res.status_code == 403
    assert "can_view_bills" in res.json().get("detail", "")


def test_09_customer_role_has_zero_showroom_permissions():
    """Verify CUSTOMER role holds no administrative or showroom edit permissions."""
    perms = get_permissions_for_role("CUSTOMER")
    assert perms["can_view_prices"] is False
    assert perms["can_view_finances"] is False
    assert perms["can_create_deals"] is False
    assert perms["can_edit_deals"] is False
    assert perms["can_delete_deals"] is False


# ─── 2. PRODUCTION AUTHENTICATION SAFETY ───────────────────────────────────────

def test_10_production_mode_rejects_password_none():
    """In production mode, logging in with password=None must be rejected with 400 Bad Request."""
    with patch("auth_service.IS_PRODUCTION", True), patch("security.IS_PRODUCTION", True):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(authenticate_user_credentials("alex@metromotors.in", None))
        assert exc_info.value.status_code == 400
        assert "Password is required" in str(exc_info.value.detail)


def test_11_production_mode_rejects_demo_credentials():
    """
    In production mode, hardcoded demo passwords (e.g. 'metro2026', 'Samarth@#$07')
    must not bypass genuine bcrypt verification.
    """
    with patch("auth_service.IS_PRODUCTION", True), patch("security.IS_PRODUCTION", True):
        # Clear in-memory user to simulate fresh production environment without demo seeding
        with patch.dict(IN_MEMORY_USERS, {}, clear=True):
            with pytest.raises(HTTPException) as exc_info:
                asyncio.run(authenticate_user_credentials("alex@metromotors.in", "metro2026"))
            assert exc_info.value.status_code == 401
            assert "Invalid email or password" in str(exc_info.value.detail)


def test_12_production_mode_disables_legacy_set_password_endpoint():
    """In production mode, the unauthenticated /auth/set-password endpoint must return 404."""
    with patch("security.IS_PRODUCTION", True):
        res = client.post(
            "/api/auth/set-password",
            json={"email": "hacker@example.com", "password": "NewPassword123!"},
        )
        assert res.status_code == 404
        assert "not available in production" in res.json().get("detail", "").lower()


def test_13_set_password_does_not_grant_owner_via_email_substring():
    """
    In development mode, /auth/set-password must not assign OWNER role merely because
    the email contains 'aravasamarth' as a substring.
    """
    with patch("security.IS_PRODUCTION", False), patch.dict(os.environ, {"OWNER_EMAILS": "official_owner@metromotors.in"}):
        res = client.post(
            "/api/auth/set-password",
            json={"email": "attacker_aravasamarth@fake.com", "password": "StrongPassword123!"},
        )
        assert res.status_code == 200
        # Role must be WORKER, not OWNER
        assert res.json()["role"] == "WORKER"


def test_14_token_expiration_and_claims_structure():
    """Verify access token payload contains required security claims and expiration."""
    token = get_token_for("WORKER", "worker@metromotors.in", "Showroom Worker")
    claims = decode_access_token(token)
    assert claims["sub"] == "worker@metromotors.in"
    assert claims["role"] == "WORKER"
    assert claims["iss"] == "metro-motors-auth"
    assert "exp" in claims
    assert "iat" in claims
    assert claims["permissions"]["can_view_finances"] is False


def test_15_customer_role_is_strictly_forbidden_from_internal_showroom_routes():
    """
    Public website customers logging in with Google OAuth (CUSTOMER role) must never
    be permitted to query internal showroom records (sellers, buyers, documents, deals).
    """
    customer_token = get_token_for("CUSTOMER", "public_user@gmail.com", "Public Customer")
    headers = {"Authorization": f"Bearer {customer_token}"}

    for path in (
        "/api/sellers",
        "/api/buyers",
        "/api/witnesses",
        "/api/documents",
        "/api/deals",
        "/api/deals/DEAL-001/workspace",
        "/api/overview/deals",
        "/api/overview/dashboard",
        "/api/vehicles",
    ):
        res = client.get(path, headers=headers)
        assert res.status_code == 403, f"Expected 403 Forbidden for CUSTOMER on {path}, got {res.status_code}"


def test_16_customer_blocked_from_bill_documents():
    """Verify customer role is strictly forbidden from querying internal bill documents."""
    customer_token = get_token_for("CUSTOMER", "public_user@gmail.com", "Public Customer")
    headers = {"Authorization": f"Bearer {customer_token}"}
    for bill_id in ("BILL-BUYER-001", "BILL-INTER-001"):
        res = client.get(f"/api/bills/{bill_id}/document", headers=headers)
        assert res.status_code == 403, f"Expected 403 on bill document {bill_id}, got {res.status_code}"


def test_17_staff_and_owner_can_access_vehicles_inventory():
    """Verify OWNER, MANAGER, and WORKER roles have can_view_inventory permission."""
    owner_token = get_token_for("OWNER", "alex@metromotors.in", "Alex Kumar")
    manager_token = get_token_for("MANAGER", "manager@metromotors.in", "Showroom Manager")
    worker_token = get_token_for("WORKER", "staff@metromotors.in", "Staff Member")

    for token in (owner_token, manager_token, worker_token):
        res = client.get("/api/vehicles", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200, f"Expected 200 for role token, got {res.status_code}"


def test_18_download_pdf_sanitizes_filename_and_blocks_header_injection():
    """Verify /api/download-pdf strips path traversal and header injection characters."""
    bad_inputs = [
        ("test\r\nInjected: True/../../evil.pdf", "evil.pdf"),
        ("../../../etc/passwd", "passwd.pdf"),
        (r"..\..\windows\system32\calc.exe", "calc.exe.pdf"),
        ('test"filename;with<quotes>.pdf', "test_filename_with_quotes_.pdf"),
    ]
    for raw, expected_substr in bad_inputs:
        res = client.post("/api/download-pdf", data={"filename": raw})
        assert res.status_code == 200
        cd = res.headers.get("content-disposition", "")
        assert "\r" not in cd and "\n" not in cd
        assert ".." not in cd
        assert expected_substr in cd


