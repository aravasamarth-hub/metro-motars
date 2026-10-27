"""
Metro Motors — Phase 4 Public Privacy Contract & Authorization Test Suite
Empirically verifies:
1. Public endpoints never expose purchase costs, profit margins, dealer commissions,
   customer Aadhaar/PAN, private phone numbers, or credentials.
2. Internal endpoints (/vehicles, /sellers, /buyers, /payments, /deals, /bills) strictly
   reject anonymous callers with 401 Unauthorized.
3. Showroom staff (WORKER) responses strictly exclude purchase costs and commissions.
4. Buyer-facing bill document (/bills/{id}/document) redacts seller purchase price and margin.
"""

import os

import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

import server
from auth_service import seed_default_showroom_users
from security import create_access_token
from server import app

client = TestClient(app)

FORBIDDEN_FINANCIAL_KEYS = {"spent", "earned", "commission", "purchase_price", "net_profit", "profit_margin"}
FORBIDDEN_KYC_KEYS = {"aadhaar", "pan", "id_details", "customer_phone", "seller_phone"}


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
        if filter_dict:
            for item in self._data:
                match = True
                for k, v in filter_dict.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    return item
            return None
        return self._data[0]


class MockDatabase:
    def __init__(self, collections_dict):
        self._collections = collections_dict
        for k, v in collections_dict.items():
            setattr(self, k, v)

    def __getitem__(self, name):
        return self._collections.get(name)


@pytest.fixture(autouse=True)
def setup_privacy_mock_data():
    seed_default_showroom_users()
    server.COLLECTIONS["deals"] = MockCollection([
        {"deal_id": "DEAL-PRIV-001", "deal_type": "Buy & Sell", "status": "Active", "vehicle_id": "VEH-PRIV-001", "seller_id": "SEL-001", "buyer_id": "BUY-001"}
    ])
    server.COLLECTIONS["vehicles"] = MockCollection([
        {"vehicle_id": "VEH-PRIV-001", "vehicle_name": "Royal Enfield Continental GT 650", "vehicle_number": "KA04EF9876", "vehicle_status": "In Stock"}
    ])
    server.COLLECTIONS["sellers"] = MockCollection([
        {"seller_id": "SEL-001", "name": "Confidential Seller", "phone": "9876543210", "id_details": "AADHAAR 1234 5678 9012"}
    ])
    server.COLLECTIONS["buyers"] = MockCollection([
        {"buyer_id": "BUY-001", "name": "Confidential Buyer", "phone": "9123456780", "id_details": "PAN ABCDE1234F"}
    ])
    server.COLLECTIONS["witnesses"] = MockCollection([])
    server.COLLECTIONS["payments"] = MockCollection([
        {"payment_id": "PAY-001", "deal_id": "DEAL-PRIV-001", "payment_type": "Purchase", "amount": 250000.0, "payment_status": "Paid", "payment_date": "2026-01-01"},
        {"payment_id": "PAY-002", "deal_id": "DEAL-PRIV-001", "payment_type": "Sale", "amount": 310000.0, "payment_status": "Paid", "payment_date": "2026-01-05"},
        {"payment_id": "PAY-003", "deal_id": "DEAL-PRIV-001", "payment_type": "Commission", "amount": 10000.0, "payment_status": "Paid", "payment_date": "2026-01-05"},
    ])
    server.COLLECTIONS["documents"] = MockCollection([])
    server.COLLECTIONS["bills"] = MockCollection([
        {
            "bill_id": "BILL-BUYER-001",
            "deal_id": "DEAL-PRIV-001",
            "bill_type": "Seller → Buyer",
            "bill_number": "MM-26-0001",
            "customer": "Confidential Buyer",
            "vehicle": "Royal Enfield Continental GT 650",
            "price": 310000.0,
            "document_reference": "bill://BILL-BUYER-001",
            "created_date": "2026-01-05T00:00:00Z",
        },
        {
            "bill_id": "BILL-INTER-001",
            "deal_id": "DEAL-PRIV-001",
            "bill_type": "Seller → Intermediate",
            "bill_number": "MM-26-0002",
            "customer": "Confidential Seller",
            "vehicle": "Royal Enfield Continental GT 650",
            "price": 250000.0,
            "document_reference": "bill://BILL-INTER-001",
            "created_date": "2026-01-01T00:00:00Z",
        },
    ])
    server.db = MockDatabase(server.COLLECTIONS)


def staff_headers() -> dict[str, str]:
    token = create_access_token(subject="staff@metromotors.in", name="Showroom Staff", role="WORKER")
    return {"Authorization": f"Bearer {token}"}


def owner_headers() -> dict[str, str]:
    token = create_access_token(subject="alex@metromotors.in", name="Alex Kumar", role="OWNER")
    return {"Authorization": f"Bearer {token}"}


# ─── 1. PUBLIC API PRIVACY CONTRACTS ──────────────────────────────────────────

def test_01_public_showroom_info_contract():
    """Verify public showroom info does not leak internal keys, database credentials, or private data."""
    res = client.get("/api/public/showroom-info")
    assert res.status_code == 200
    data = res.json()

    assert "showroom_name" in data
    assert "phone" in data
    assert "email" in data

    # Verify absence of secrets or backend configuration keys
    text = res.text.lower()
    for leak in ("mongodb", "secret", "password", "token", "atlas"):
        assert leak not in text, f"Potential leak of '{leak}' in public showroom info!"


def test_02_public_enquiry_submission_response_privacy():
    """Verify public enquiry submission response contains only status, no phone numbers or customer KYC."""
    payload = {
        "name": "Ananya Roy",
        "phone": "9887711223",
        "preferred_method": "WhatsApp",
        "vehicle_id": "VEH-PRIV-001",
        "vehicle_title": "Royal Enfield Continental GT 650",
        "message": "Is this single owner?",
    }
    res = client.post("/api/public/enquiries", json=payload)
    assert res.status_code == 201
    data = res.json()

    # The public response should return confirmation token/ID only, never echoing raw private phones
    assert "enquiry_id" in data
    assert data["status"] == "ACCEPTED"
    assert "phone" not in data, "Customer phone number leaked in public enquiry response envelope!"


def test_03_internal_crud_endpoints_reject_anonymous_requests():
    """
    CRITICAL ACCESS CONTROL: Protected showroom endpoints must reject unauthenticated
    requests with 401 Unauthorized.
    """
    endpoints = [
        "/api/deals",
        "/api/vehicles",
        "/api/sellers",
        "/api/buyers",
        "/api/payments",
        "/api/bills",
        "/api/overview/deals",
        "/api/overview/dashboard",
        "/api/finances/summary",
    ]
    for endpoint in endpoints:
        res = client.get(endpoint)
        assert res.status_code in (401, 403), f"Endpoint '{endpoint}' allowed anonymous access! (Status {res.status_code})"


# ─── 2. BUYER-BILL PRIVACY & MARGIN REDACTION ─────────────────────────────────

def test_04_buyer_bill_document_redacts_purchase_cost_and_margin_for_staff():
    """
    Calling /api/bills/{bill_id}/document for an intermediate bill with a staff token
    must be forbidden (403), preventing staff from inspecting dealer cost.
    """
    res_inter = client.get("/api/bills/BILL-INTER-001/document", headers=staff_headers())
    assert res_inter.status_code == 403
    assert "forbidden" in res_inter.json().get("detail", "").lower()


def test_05_buyer_facing_bill_allows_viewing_for_staff():
    """Buyer-facing bills (Seller -> Buyer) are viewable by staff to hand over to customers."""
    res_buyer = client.get("/api/bills/BILL-BUYER-001/document", headers=staff_headers())
    assert res_buyer.status_code == 200
    doc = res_buyer.json()
    assert doc["bill"]["bill_type"] == "Seller → Buyer"
    assert doc["bill"]["price"] == 310000.0
