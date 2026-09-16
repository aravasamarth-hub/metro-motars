from datetime import datetime, timezone
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional, Type
import logging
import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Metro Motors API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"


class RecordResponse(BaseModel):
    """Mongo-safe response envelope allowing each entity's explicit fields."""

    model_config = ConfigDict(extra="allow")


class DealCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_type: str
    status: str
    vehicle_id: str
    seller_id: Optional[str] = None
    buyer_id: Optional[str] = None


class DealUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_type: Optional[str] = None
    status: Optional[str] = None
    vehicle_id: Optional[str] = None
    seller_id: Optional[str] = None
    buyer_id: Optional[str] = None


class VehicleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    vehicle_name: str
    make: str
    model: str
    year_of_manufacture: int
    color: str
    engine_number: str
    chassis_number: str
    vehicle_number: str
    registration_number: str
    insurance: str
    vehicle_status: str = "In Stock"


class VehicleUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    vehicle_name: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    color: Optional[str] = None
    engine_number: Optional[str] = None
    chassis_number: Optional[str] = None
    vehicle_number: Optional[str] = None
    registration_number: Optional[str] = None
    insurance: Optional[str] = None
    vehicle_status: Optional[str] = None


class PersonCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    phone: str
    address: str
    id_details: str
    photo: Optional[str] = None


class PersonUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    id_details: Optional[str] = None
    photo: Optional[str] = None


class WitnessCreate(PersonCreate):
    deal_id: str


class WitnessUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    id_details: Optional[str] = None
    photo: Optional[str] = None


class PaymentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str
    person: str
    payment_type: str
    amount: float = Field(gt=0)
    payment_date: str
    payment_status: str
    notes: Optional[str] = None


class PaymentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: Optional[str] = None
    person: Optional[str] = None
    payment_type: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    payment_date: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class DocumentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str
    category: str
    file_reference: str
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    document_kind: str = "file"


class DocumentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: Optional[str] = None
    category: Optional[str] = None
    file_reference: Optional[str] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    document_kind: Optional[str] = None


class BillCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str
    bill_type: str
    bill_number: str
    customer: str
    vehicle: str
    price: float = Field(ge=0)
    document_reference: Optional[str] = None


class BillUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: Optional[str] = None
    bill_type: Optional[str] = None
    bill_number: Optional[str] = None
    customer: Optional[str] = None
    vehicle: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    document_reference: Optional[str] = None


class WorkflowPayment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    person: str
    payment_type: str
    amount: float = Field(gt=0)
    payment_date: str
    payment_status: str
    notes: Optional[str] = None


class DealWorkflowPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: Optional[str] = None
    deal_type: str = "Buy & Sell"
    status: str = "Draft"
    vehicle: VehicleCreate
    seller: PersonCreate
    buyer: PersonCreate
    witnesses: List[PersonCreate] = Field(default_factory=list)
    payments: List[WorkflowPayment] = Field(default_factory=list)


class BillGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    bill_type: str


class FinanceSummaryResponse(BaseModel):
    total_revenue: float
    this_month: float
    pending_dues: float
    total_commission: float
    net_profit: float
    monthly_revenue: List[Dict[str, Any]]
    revenue_breakdown: Dict[str, float]
    revenue_trend: List[Dict[str, Any]]


COLLECTIONS = {
    "deals": db.deals,
    "vehicles": db.vehicles,
    "sellers": db.sellers,
    "buyers": db.buyers,
    "witnesses": db.witnesses,
    "payments": db.payments,
    "documents": db.documents,
    "bills": db.bills,
}


async def find_one(collection_name: str, field: str, value: str) -> Optional[Dict[str, Any]]:
    return await COLLECTIONS[collection_name].find_one({field: value}, {"_id": 0})


async def require_entity(collection_name: str, field: str, value: str) -> Dict[str, Any]:
    entity = await find_one(collection_name, field, value)
    if not entity:
        raise HTTPException(status_code=404, detail=f"{collection_name[:-1].title()} {value} not found")
    return entity


async def validate_deal_links(data: Dict[str, Any]) -> None:
    await require_entity("vehicles", "vehicle_id", data["vehicle_id"])
    if data.get("seller_id"):
        await require_entity("sellers", "seller_id", data["seller_id"])
    if data.get("buyer_id"):
        await require_entity("buyers", "buyer_id", data["buyer_id"])


async def validate_child_deal(data: Dict[str, Any]) -> None:
    await require_entity("deals", "deal_id", data["deal_id"])


async def find_or_create_person(collection_name: str, id_field: str, prefix: str, person: Dict[str, Any]) -> Dict[str, Any]:
    existing = await COLLECTIONS[collection_name].find_one({"phone": person["phone"]}, {"_id": 0})
    if existing:
        await COLLECTIONS[collection_name].update_one({id_field: existing[id_field]}, {"$set": {**person, "updated_date": now_iso()}})
        return await find_one(collection_name, id_field, existing[id_field])
    entity_id = new_id(prefix)
    now = now_iso()
    document = {id_field: entity_id, **person, "created_date": now, "updated_date": now}
    await COLLECTIONS[collection_name].insert_one(document.copy())
    return await find_one(collection_name, id_field, entity_id)


async def find_or_create_vehicle(vehicle: Dict[str, Any]) -> Dict[str, Any]:
    existing = await db.vehicles.find_one({"$or": [{"chassis_number": vehicle["chassis_number"]}, {"vehicle_number": vehicle["vehicle_number"]}]}, {"_id": 0})
    if existing:
        await db.vehicles.update_one({"vehicle_id": existing["vehicle_id"]}, {"$set": {**vehicle, "updated_date": now_iso()}})
        return await find_one("vehicles", "vehicle_id", existing["vehicle_id"])
    vehicle_id = new_id("VEH")
    now = now_iso()
    document = {"vehicle_id": vehicle_id, **vehicle, "created_date": now, "updated_date": now}
    await db.vehicles.insert_one(document.copy())
    return await find_one("vehicles", "vehicle_id", vehicle_id)


async def get_workspace(deal_id: str) -> Dict[str, Any]:
    deal = await require_entity("deals", "deal_id", deal_id)
    vehicle = await require_entity("vehicles", "vehicle_id", deal["vehicle_id"])
    seller = await find_one("sellers", "seller_id", deal.get("seller_id")) if deal.get("seller_id") else None
    buyer = await find_one("buyers", "buyer_id", deal.get("buyer_id")) if deal.get("buyer_id") else None
    witnesses = await db.witnesses.find({"deal_id": deal_id}, {"_id": 0}).sort("created_date", 1).to_list(100)
    payments = await db.payments.find({"deal_id": deal_id}, {"_id": 0}).sort("payment_date", 1).to_list(500)
    documents = await db.documents.find({"deal_id": deal_id}, {"_id": 0}).sort("created_date", 1).to_list(500)
    bills = await db.bills.find({"deal_id": deal_id}, {"_id": 0}).sort("created_date", 1).to_list(100)
    return {"deal": deal, "vehicle": vehicle, "seller": seller, "buyer": buyer, "witnesses": witnesses, "payments": payments, "documents": documents, "bills": bills}


async def list_entities(collection_name: str) -> List[Dict[str, Any]]:
    return await COLLECTIONS[collection_name].find({}, {"_id": 0}).sort("created_date", -1).to_list(1000)


def register_simple_crud(
    path: str,
    collection_name: str,
    id_field: str,
    id_prefix: str,
    create_model: Type[BaseModel],
    update_model: Type[BaseModel],
    validator=None,
) -> None:
    collection = COLLECTIONS[collection_name]

    async def create(payload: create_model):
        data = payload.model_dump(exclude_none=True)
        if validator:
            await validator(data)
        entity_id = new_id(id_prefix)
        now = now_iso()
        document = {id_field: entity_id, **data, "created_date": now, "updated_date": now}
        await collection.insert_one(document.copy())
        return await find_one(collection_name, id_field, entity_id)

    async def list_all():
        return await list_entities(collection_name)

    async def get_one(entity_id: str):
        return await require_entity(collection_name, id_field, entity_id)

    async def update(entity_id: str, payload: update_model):
        current = await require_entity(collection_name, id_field, entity_id)
        data = payload.model_dump(exclude_none=True)
        if validator:
            await validator({**current, **data})
        if not data:
            return current
        data["updated_date"] = now_iso()
        await collection.update_one({id_field: entity_id}, {"$set": data})
        return await find_one(collection_name, id_field, entity_id)

    async def delete(entity_id: str):
        await require_entity(collection_name, id_field, entity_id)
        await collection.delete_one({id_field: entity_id})
        return {"deleted": True, id_field: entity_id}

    api_router.add_api_route(f"/{path}", create, methods=["POST"], response_model=RecordResponse, status_code=201)
    api_router.add_api_route(f"/{path}", list_all, methods=["GET"], response_model=List[RecordResponse])
    api_router.add_api_route(f"/{path}/{{entity_id}}", get_one, methods=["GET"], response_model=RecordResponse)
    api_router.add_api_route(f"/{path}/{{entity_id}}", update, methods=["PUT"], response_model=RecordResponse)
    api_router.add_api_route(f"/{path}/{{entity_id}}", delete, methods=["DELETE"])


@api_router.get("/")
async def root():
    return {"message": "Metro Motors API", "database": "connected"}


@api_router.post("/deals", response_model=RecordResponse, status_code=201)
async def create_deal(payload: DealCreate):
    data = payload.model_dump()
    await validate_deal_links(data)
    now = now_iso()
    document = {"deal_id": new_id("DEAL"), **data, "created_date": now, "updated_date": now}
    await db.deals.insert_one(document.copy())
    return await find_one("deals", "deal_id", document["deal_id"])


@api_router.get("/deals", response_model=List[RecordResponse])
async def list_deals():
    return await list_entities("deals")


@api_router.get("/deals/{deal_id}", response_model=RecordResponse)
async def get_deal(deal_id: str):
    return await require_entity("deals", "deal_id", deal_id)


@api_router.put("/deals/{deal_id}", response_model=RecordResponse)
async def update_deal(deal_id: str, payload: DealUpdate):
    current = await require_entity("deals", "deal_id", deal_id)
    data = payload.model_dump(exclude_none=True)
    merged = {**current, **data}
    await validate_deal_links(merged)
    if data:
        data["updated_date"] = now_iso()
        await db.deals.update_one({"deal_id": deal_id}, {"$set": data})
    return await require_entity("deals", "deal_id", deal_id)


@api_router.delete("/deals/{deal_id}")
async def delete_deal(deal_id: str):
    await require_entity("deals", "deal_id", deal_id)
    child_counts = await asyncio.gather(*(COLLECTIONS[name].count_documents({"deal_id": deal_id}) for name in ("witnesses", "payments", "documents", "bills")))
    if any(child_counts):
        raise HTTPException(status_code=409, detail="Delete related witnesses, payments, documents, and bills before deleting this deal")
    await db.deals.delete_one({"deal_id": deal_id})
    return {"deleted": True, "deal_id": deal_id}


@api_router.post("/workflow/deals", response_model=Dict[str, Any], status_code=201)
async def save_deal_workflow(payload: DealWorkflowPayload):
    vehicle = await find_or_create_vehicle(payload.vehicle.model_dump())
    seller = await find_or_create_person("sellers", "seller_id", "SELLER", payload.seller.model_dump(exclude_none=True))
    buyer = await find_or_create_person("buyers", "buyer_id", "BUYER", payload.buyer.model_dump(exclude_none=True))
    now = now_iso()
    deal_id = payload.deal_id or new_id("DEAL")
    deal_data = {"deal_type": payload.deal_type, "status": payload.status, "vehicle_id": vehicle["vehicle_id"], "seller_id": seller["seller_id"], "buyer_id": buyer["buyer_id"], "updated_date": now}
    existing = await find_one("deals", "deal_id", deal_id)
    if existing:
        await db.deals.update_one({"deal_id": deal_id}, {"$set": deal_data})
    else:
        await db.deals.insert_one({"deal_id": deal_id, **deal_data, "created_date": now}.copy())

    await db.witnesses.delete_many({"deal_id": deal_id})
    for witness in payload.witnesses:
        witness_doc = {"witness_id": new_id("WITNESS"), "deal_id": deal_id, **witness.model_dump(exclude_none=True), "created_date": now, "updated_date": now}
        await db.witnesses.insert_one(witness_doc.copy())
    await db.payments.delete_many({"deal_id": deal_id})
    for payment in payload.payments:
        payment_doc = {"payment_id": new_id("PAY"), "deal_id": deal_id, **payment.model_dump(exclude_none=True), "created_date": now, "updated_date": now}
        await db.payments.insert_one(payment_doc.copy())
    return await get_workspace(deal_id)


@api_router.get("/deals/{deal_id}/workspace", response_model=Dict[str, Any])
async def read_deal_workspace(deal_id: str):
    return await get_workspace(deal_id)


@api_router.post("/deals/{deal_id}/bills/generate", response_model=RecordResponse, status_code=201)
async def generate_bill(deal_id: str, payload: BillGenerateRequest):
    workspace = await get_workspace(deal_id)
    allowed_types = {"Seller → Intermediate", "Seller → Buyer"}
    if payload.bill_type not in allowed_types:
        raise HTTPException(status_code=422, detail=f"bill_type must be one of: {', '.join(sorted(allowed_types))}")
    existing = await db.bills.find_one({"deal_id": deal_id, "bill_type": payload.bill_type}, {"_id": 0})
    if existing:
        return existing
    payments = workspace["payments"]
    buyer = workspace.get("buyer") or {}
    seller = workspace.get("seller") or {}
    if payload.bill_type == "Seller → Intermediate":
        customer = seller.get("name", "Seller")
        relevant_terms = ("purchase", "buy", "seller", "intermediate")
    else:
        customer = buyer.get("name", "Buyer")
        relevant_terms = ("sale", "sell", "buyer", "revenue", "income")
    selected = [payment for payment in payments if any(term in payment.get("payment_type", "").lower() for term in relevant_terms) or payment.get("person") == customer]
    price = round(sum(float(payment.get("amount", 0)) for payment in selected if payment.get("payment_status", "").lower() in {"paid", "completed", "settled"}), 2)
    bill_id = new_id("BILL")
    document = {"bill_id": bill_id, "deal_id": deal_id, "bill_type": payload.bill_type, "bill_number": f"MM-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{bill_id[-6:]}", "customer": customer, "vehicle": workspace["vehicle"]["vehicle_name"], "price": price, "document_reference": f"bill://{bill_id}", "created_date": now_iso(), "updated_date": now_iso()}
    await db.bills.insert_one(document.copy())
    return await find_one("bills", "bill_id", bill_id)


@api_router.get("/finances/summary", response_model=FinanceSummaryResponse)
async def finances_summary():
    payments = await db.payments.find({}, {"_id": 0}).to_list(5000)
    now = datetime.now(timezone.utc)
    revenue = purchase = commission = pending = this_month = 0.0
    monthly: Dict[str, float] = {}
    for payment in payments:
        amount = float(payment.get("amount", 0))
        payment_type = payment.get("payment_type", "").lower()
        payment_status = payment.get("payment_status", "").lower()
        is_paid = payment_status in {"paid", "completed", "settled"}
        if not is_paid:
            pending += amount
        if any(term in payment_type for term in ("sale", "sell", "buyer", "revenue", "income")) and is_paid:
            revenue += amount
            try:
                payment_date = datetime.fromisoformat(payment["payment_date"].replace("Z", "+00:00"))
                if payment_date.year == now.year and payment_date.month == now.month:
                    this_month += amount
                month_key = payment_date.strftime("%b %Y")
                monthly[month_key] = monthly.get(month_key, 0) + amount
            except (KeyError, ValueError):
                pass
        if any(term in payment_type for term in ("purchase", "buy", "seller", "intermediate")) and is_paid:
            purchase += amount
        if "commission" in payment_type and is_paid:
            commission += amount
    ordered_months = sorted(monthly.items(), key=lambda item: datetime.strptime(item[0], "%b %Y"))[-12:]
    trend = [{"month": month, "value": round(value, 2)} for month, value in ordered_months]
    return {"total_revenue": round(revenue, 2), "this_month": round(this_month, 2), "pending_dues": round(pending, 2), "total_commission": round(commission, 2), "net_profit": round(revenue - purchase + commission, 2), "monthly_revenue": trend, "revenue_breakdown": {"sales": round(revenue, 2), "purchase_cost": round(purchase, 2), "commission": round(commission, 2)}, "revenue_trend": trend}


register_simple_crud("vehicles", "vehicles", "vehicle_id", "VEH", VehicleCreate, VehicleUpdate)
register_simple_crud("sellers", "sellers", "seller_id", "SELLER", PersonCreate, PersonUpdate)
register_simple_crud("buyers", "buyers", "buyer_id", "BUYER", PersonCreate, PersonUpdate)
register_simple_crud("witnesses", "witnesses", "witness_id", "WITNESS", WitnessCreate, WitnessUpdate, validate_child_deal)
register_simple_crud("payments", "payments", "payment_id", "PAY", PaymentCreate, PaymentUpdate, validate_child_deal)
register_simple_crud("documents", "documents", "document_id", "DOC", DocumentCreate, DocumentUpdate, validate_child_deal)
register_simple_crud("bills", "bills", "bill_id", "BILL", BillCreate, BillUpdate, validate_child_deal)


@app.on_event("startup")
async def create_indexes():
    for collection_name, id_field in (("deals", "deal_id"), ("vehicles", "vehicle_id"), ("sellers", "seller_id"), ("buyers", "buyer_id"), ("witnesses", "witness_id"), ("payments", "payment_id"), ("documents", "document_id"), ("bills", "bill_id")):
        await COLLECTIONS[collection_name].create_index(id_field, unique=True)
    await db.bills.create_index("bill_number", unique=True)


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","), allow_methods=["*"], allow_headers=["*"])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()