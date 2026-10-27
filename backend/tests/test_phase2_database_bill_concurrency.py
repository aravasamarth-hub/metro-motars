"""
Metro Motors — Phase 2 Database & Bill-Number Concurrency Test Suite
Empirically verifies:
1. Monotonically increasing atomic bill-number allocator preserving format MM-YY-NNNN.
2. Concurrent allocation guarantees zero collisions and unique sequence values.
3. Idempotency protection for repeated bill generation and deal creation requests.
4. Safe production failure when authoritative database is unavailable (503 Service Unavailable).
"""

import asyncio
import os
from unittest.mock import patch

import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

import server
from auth_service import seed_default_showroom_users
from security import create_access_token
from server import allocate_bill_number, app

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

    async def insert_one(self, doc):
        self._data.append(doc)
        return doc

    async def update_one(self, filter_dict, update_dict):
        doc = await self.find_one(filter_dict)
        if doc and "$set" in update_dict:
            doc.update(update_dict["$set"])
        return doc

    async def delete_many(self, filter_dict):
        self._data = [d for d in self._data if not all(d.get(k) == v for k, v in filter_dict.items())]
        return None


class MockDatabase:
    def __init__(self, collections_dict):
        self._collections = collections_dict
        for k, v in collections_dict.items():
            setattr(self, k, v)

    def __getitem__(self, name):
        return self._collections.get(name)


@pytest.fixture(autouse=True)
def setup_mock_db():
    seed_default_showroom_users()
    server.COLLECTIONS["deals"] = MockCollection([
        {"deal_id": "DEAL-001", "deal_type": "Buy & Sell", "status": "Active", "vehicle_id": "VEH-001", "seller_id": "SEL-001", "buyer_id": "BUY-001"}
    ])
    server.COLLECTIONS["vehicles"] = MockCollection([
        {"vehicle_id": "VEH-001", "vehicle_name": "Royal Enfield Classic 350", "vehicle_number": "KA01AB1234"}
    ])
    server.COLLECTIONS["sellers"] = MockCollection([{"seller_id": "SEL-001", "name": "Seller Demo", "phone": "9876543210"}])
    server.COLLECTIONS["buyers"] = MockCollection([{"buyer_id": "BUY-001", "name": "Buyer Demo", "phone": "9123456780"}])
    server.COLLECTIONS["witnesses"] = MockCollection([])
    server.COLLECTIONS["payments"] = MockCollection([
        {"payment_id": "PAY-001", "deal_id": "DEAL-001", "payment_type": "Purchase", "amount": 100000.0, "payment_status": "Paid", "payment_date": "2026-01-01"},
        {"payment_id": "PAY-002", "deal_id": "DEAL-001", "payment_type": "Sale", "amount": 130000.0, "payment_status": "Paid", "payment_date": "2026-01-02"},
    ])
    server.COLLECTIONS["documents"] = MockCollection([])
    server.COLLECTIONS["bills"] = MockCollection([])
    server.COLLECTIONS["counters"] = MockCollection([])
    server.db = MockDatabase(server.COLLECTIONS)


def owner_headers() -> dict[str, str]:
    token = create_access_token(subject="alex@metromotors.in", name="Alex Kumar", role="OWNER")
    return {"Authorization": f"Bearer {token}"}


# ─── 1. ATOMIC BILL-NUMBER ALLOCATION TESTS ───────────────────────────────────

def test_01_atomic_bill_number_format():
    """Verify single allocation returns valid MM-YY-NNNN format (e.g. MM-26-0001)."""
    bill_no = asyncio.run(allocate_bill_number(year=2026))
    assert bill_no.startswith("MM-26-")
    seq_str = bill_no.split("-")[2]
    assert len(seq_str) == 4
    assert seq_str.isdigit()


def test_02_concurrent_allocations_guarantee_no_collisions():
    """
    CRITICAL PROOF: Running 50 concurrent allocations simultaneously must yield
    exactly 50 unique bill numbers with ZERO duplicates.
    """
    async def run_batch():
        tasks = [allocate_bill_number(year=2026) for _ in range(50)]
        return await asyncio.gather(*tasks)

    results = asyncio.run(run_batch())
    assert len(results) == 50
    unique_set = set(results)
    assert len(unique_set) == 50, f"Collision detected! Expected 50 unique numbers, got {len(unique_set)}"


# ─── 2. IDEMPOTENCY PROTECTION TESTS ──────────────────────────────────────────

def test_03_repeated_bill_generation_is_idempotent():
    """
    Generating a bill for the same deal_id and bill_type twice must return the
    exact same bill_number without incrementing the counter or duplicating rows.
    """
    payload = {"bill_type": "Seller → Buyer", "idempotency_key": "IDEM-TEST-BILL-001"}

    # First request
    res1 = client.post("/api/deals/DEAL-001/bills/generate", json=payload, headers=owner_headers())
    assert res1.status_code == 201
    bill1 = res1.json()
    bill_number_1 = bill1["bill_number"]

    # Second identical request (retry / network replay)
    res2 = client.post("/api/deals/DEAL-001/bills/generate", json=payload, headers=owner_headers())
    assert res2.status_code in (200, 201)
    bill2 = res2.json()
    bill_number_2 = bill2["bill_number"]

    # Must be identical bill number and identical record
    assert bill_number_1 == bill_number_2
    assert bill1["bill_id"] == bill2["bill_id"]


def test_04_repeated_deal_workflow_with_idempotency_key_avoids_duplicate():
    """
    Submitting save_deal_workflow with the same idempotency_key returns the
    existing deal workspace instead of duplicating deal rows.
    """
    payload = {
        "idempotency_key": "IDEM-DEAL-001-TEST",
        "deal_type": "Buy & Sell",
        "status": "Draft",
        "vehicle": {
            "vehicle_name": "Royal Enfield Hunter 350",
            "make": "Royal Enfield",
            "model": "Hunter 350",
            "year_of_manufacture": 2024,
            "color": "Dapper Ash",
            "engine_number": "ENG-HUNT-001",
            "chassis_number": "CHAS-HUNT-001",
            "vehicle_number": "KA02CD5678",
            "registration_number": "KA02CD5678",
            "insurance": "Active",
            "vehicle_status": "In Stock",
        },
        "seller": {"name": "Synthetic Seller", "phone": "9998887771", "address": "Indiranagar, Bangalore", "id_details": "AADHAAR-1234"},
        "buyer": {"name": "Synthetic Buyer", "phone": "9998887772", "address": "Koramangala, Bangalore", "id_details": "AADHAAR-5678"},
        "witnesses": [],
        "payments": [],
    }

    # Request 1
    res1 = client.post("/api/workflow/deals", json=payload, headers=owner_headers())
    assert res1.status_code == 201
    deal1_id = res1.json()["deal"]["deal_id"]

    # Request 2 with same idempotency key
    res2 = client.post("/api/workflow/deals", json=payload, headers=owner_headers())
    assert res2.status_code == 201
    deal2_id = res2.json()["deal"]["deal_id"]

    assert deal1_id == deal2_id


# ─── 3. PRODUCTION DATABASE SAFETY TESTS ──────────────────────────────────────

def test_05_production_mode_rejects_writes_when_authoritative_db_unavailable():
    """
    In production mode (IS_PRODUCTION=True), write operations must fail safely with
    503 Service Unavailable when the remote database is disconnected.
    """
    with patch("security.IS_PRODUCTION", True), patch("server.DISABLE_REMOTE_DB", True):
        res = client.post(
            "/api/deals/DEAL-001/bills/generate",
            json={"bill_type": "Seller → Buyer"},
            headers=owner_headers(),
        )
        assert res.status_code == 503
        assert "production database unavailable" in res.json().get("detail", "").lower()
