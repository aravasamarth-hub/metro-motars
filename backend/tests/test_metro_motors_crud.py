"""Regression coverage for Metro Motors entity CRUD and deal relationships."""

import os
import uuid

import pytest
import requests


BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def vehicle_payload(tag):
    return {
        "vehicle_name": f"TEST Bike {tag}", "make": "TEST Honda", "model": "TEST CB350",
        "year_of_manufacture": 2023, "color": "Black", "engine_number": f"ENG-{tag}",
        "chassis_number": f"CH-{tag}", "vehicle_number": f"VH-{tag}",
        "registration_number": f"REG-{tag}", "insurance": "Active", "vehicle_status": "In Stock",
    }


def person_payload(tag):
    return {"name": f"TEST Person {tag}", "phone": "9999999999", "address": "TEST Address", "id_details": "TEST-ID"}


def assert_mongo_safe(data):
    assert "_id" not in data
    for key in ("vehicle_id", "seller_id", "buyer_id", "deal_id", "witness_id", "payment_id", "document_id", "bill_id"):
        if key in data:
            assert isinstance(data[key], str)


def test_full_crud_relationship_lifecycle(api_client):
    """Cover health, parent CRUD, child CRUD, relationship validation, and protected deletion."""
    tag = uuid.uuid4().hex[:8].upper()
    created = []
    root = f"{BASE_URL}/api"

    health = api_client.get(f"{root}/")
    assert health.status_code == 200
    assert health.json()["message"] == "Metro Motors API"

    try:
        vehicle_response = api_client.post(f"{root}/vehicles", json=vehicle_payload(tag))
        assert vehicle_response.status_code == 201
        vehicle = vehicle_response.json(); created.append(("vehicles", vehicle["vehicle_id"]))
        assert_mongo_safe(vehicle)
        assert api_client.get(f"{root}/vehicles/{vehicle['vehicle_id']}").json()["vehicle_name"].startswith("TEST")
        updated_vehicle = api_client.put(f"{root}/vehicles/{vehicle['vehicle_id']}", json={"color": "Blue"})
        assert updated_vehicle.status_code == 200 and updated_vehicle.json()["color"] == "Blue"

        seller_response = api_client.post(f"{root}/sellers", json=person_payload(tag + "S"))
        buyer_response = api_client.post(f"{root}/buyers", json=person_payload(tag + "B"))
        assert seller_response.status_code == buyer_response.status_code == 201
        seller = seller_response.json(); buyer = buyer_response.json()
        created += [("sellers", seller["seller_id"]), ("buyers", buyer["buyer_id"])]

        invalid_deal = api_client.post(f"{root}/deals", json={"deal_type": "Buy", "status": "Draft", "vehicle_id": "missing", "seller_id": seller["seller_id"], "buyer_id": buyer["buyer_id"]})
        assert invalid_deal.status_code == 404
        deal_response = api_client.post(f"{root}/deals", json={"deal_type": "Buy", "status": "Draft", "vehicle_id": vehicle["vehicle_id"], "seller_id": seller["seller_id"], "buyer_id": buyer["buyer_id"]})
        assert deal_response.status_code == 201
        deal = deal_response.json(); deal_id = deal["deal_id"]; created.append(("deals", deal_id))
        assert_mongo_safe(deal)
        assert deal["created_date"] == deal["updated_date"]
        fetched = api_client.get(f"{root}/deals/{deal_id}").json()
        assert fetched["deal_id"] == deal_id
        updated = api_client.put(f"{root}/deals/{deal_id}", json={"status": "Completed"})
        assert updated.status_code == 200 and updated.json()["deal_id"] == deal_id and updated.json()["status"] == "Completed"

        child_specs = [
            ("witnesses", {**person_payload(tag + "W"), "deal_id": deal_id}, "witness_id"),
            ("payments", {"deal_id": deal_id, "person": "Buyer", "payment_type": "Cash", "amount": 1000, "payment_date": "2025-06-24", "payment_status": "Paid"}, "payment_id"),
            ("documents", {"deal_id": deal_id, "category": "Identity", "file_reference": f"file-{tag}"}, "document_id"),
            ("bills", {"deal_id": deal_id, "bill_type": "Sale", "bill_number": f"TEST-BILL-{tag}", "customer": "TEST Customer", "vehicle": "TEST Bike", "price": 1000}, "bill_id"),
        ]
        for collection, payload, id_field in child_specs:
            response = api_client.post(f"{root}/{collection}", json=payload)
            assert response.status_code == 201, response.text
            child = response.json(); created.append((collection, child[id_field]))
            assert child["deal_id"] == deal_id
            assert_mongo_safe(child)
            assert api_client.get(f"{root}/{collection}/{child[id_field]}").json()[id_field] == child[id_field]
            assert api_client.put(f"{root}/{collection}/{child[id_field]}", json={}).status_code == 200

        invalid_child = api_client.post(f"{root}/documents", json={"deal_id": "missing", "category": "X", "file_reference": "Y"})
        assert invalid_child.status_code == 404
        blocked = api_client.delete(f"{root}/deals/{deal_id}")
        assert blocked.status_code == 409
    finally:
        for collection, entity_id in reversed(created):
            api_client.delete(f"{root}/{collection}/{entity_id}")
