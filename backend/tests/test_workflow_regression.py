"""Regression coverage for the connected deal workflow and generated bill boundaries."""

import os
import uuid

import requests


BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


def test_workflow_reuses_vehicle_and_keeps_bill_fields_scoped():
    root = f"{BASE_URL}/api"
    tag = uuid.uuid4().hex[:10].upper()
    payload = {
        "vehicle": {
            "vehicle_name": f"TEST Workflow {tag}", "make": "Honda", "model": "CB350",
            "year_of_manufacture": 2024, "color": "Black", "engine_number": f"ENG-{tag}",
            "chassis_number": f"CH-{tag}", "vehicle_number": f"VH-{tag}",
            "registration_number": f"REG-{tag}", "insurance": "Active",
        },
        "seller": {"name": f"TEST Seller {tag}", "phone": f"91{tag[:8]}", "address": "A", "id_details": "S"},
        "buyer": {"name": f"TEST Buyer {tag}", "phone": f"92{tag[:8]}", "address": "B", "id_details": "B"},
        "witnesses": [],
        "payments": [
            {"person": "Buyer", "payment_type": "Sale", "amount": 2500, "payment_date": "2025-06-24", "payment_status": "Paid"},
            {"person": "Seller", "payment_type": "Purchase", "amount": 1500, "payment_date": "2025-06-24", "payment_status": "Paid"},
        ],
    }
    created = []
    try:
        first = requests.post(f"{root}/workflow/deals", json=payload)
        assert first.status_code == 201, first.text
        first_data = first.json(); created.append(first_data["deal"]["deal_id"])
        second = requests.post(f"{root}/workflow/deals", json=payload)
        assert second.status_code == 201, second.text
        second_data = second.json(); created.append(second_data["deal"]["deal_id"])
        vehicles = requests.get(f"{root}/vehicles").json()
        matches = [item for item in vehicles if item.get("chassis_number") == payload["vehicle"]["chassis_number"]]
        assert len(matches) == 1

        deal_id = first_data["deal"]["deal_id"]
        intermediate = requests.post(f"{root}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Intermediate"})
        buyer_bill = requests.post(f"{root}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Buyer"})
        assert intermediate.status_code == buyer_bill.status_code == 201
        assert buyer_bill.json()["deal_id"] == deal_id
        assert "purchase_price" not in buyer_bill.json() and "margin" not in buyer_bill.json()
        created.extend([intermediate.json()["bill_id"], buyer_bill.json()["bill_id"]])
    finally:
        for entity_id in created:
            if entity_id.startswith("DEAL-"):
                workspace = requests.get(f"{root}/deals/{entity_id}/workspace")
                if workspace.status_code == 200:
                    for child in workspace.json()["witnesses"]:
                        requests.delete(f"{root}/witnesses/{child['witness_id']}")
                    for child in workspace.json()["payments"]:
                        requests.delete(f"{root}/payments/{child['payment_id']}")
                    for child in workspace.json()["documents"]:
                        requests.delete(f"{root}/documents/{child['document_id']}")
                    for child in workspace.json()["bills"]:
                        requests.delete(f"{root}/bills/{child['bill_id']}")
                requests.delete(f"{root}/deals/{entity_id}")