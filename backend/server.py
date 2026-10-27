import asyncio
import logging
import os
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

from auth_service import (
    authenticate_google_identity,
    authenticate_user_credentials,
    find_user_by_email,
    register_customer_user,
    request_password_recovery_otp,
    reset_password_with_recovery_token,
    verify_password_recovery_otp,
)
from database import db_manager
from email_service import email_service
from enquiry_service import (
    CustomerEnquiryCreate,
    check_rate_limit,
    list_saved_enquiries,
    process_enquiry_submission,
)
from security import (
    get_current_user,
    hash_password,
    require_permission,
    require_role,
)
from storage_service import SecurityError, get_storage_provider

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

DISABLE_REMOTE_DB = os.environ.get("DISABLE_REMOTE_DB", "0") == "1"
mongo_url = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=4000, connectTimeoutMS=4000) if not DISABLE_REMOTE_DB else None
db = client[os.environ.get("MONGODB_DB_NAME") or os.environ.get("DB_NAME", "metro_motors")] if client is not None else None

app = FastAPI(title="Metro Motors API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

DEAL_ID = "deal_id"
VEHICLE_ID = "vehicle_id"
SELLER_ID = "seller_id"
BUYER_ID = "buyer_id"
CREATED_DATE = "created_date"
UPDATED_DATE = "updated_date"
CAN_VIEW_FINANCES = "can_view_finances"
BILL_TYPE_SELLER_BUYER = "Seller → Buyer"
BILL_TYPE_SELLER_INTERMEDIATE = "Seller → Intermediate"


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


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
    seller_id: str | None = None
    buyer_id: str | None = None


class DealUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_type: str | None = None
    status: str | None = None
    vehicle_id: str | None = None
    seller_id: str | None = None
    buyer_id: str | None = None


class VehicleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    vehicle_type: str | None = "4 Wheeler Car"
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

    vehicle_type: str | None = None
    vehicle_name: str | None = None
    make: str | None = None
    model: str | None = None
    year_of_manufacture: int | None = None
    color: str | None = None
    engine_number: str | None = None
    chassis_number: str | None = None
    vehicle_number: str | None = None
    registration_number: str | None = None
    insurance: str | None = None
    vehicle_status: str | None = None


class PersonCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    phone: str
    address: str
    id_details: str
    photo: str | None = None


class PersonUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    phone: str | None = None
    address: str | None = None
    id_details: str | None = None
    photo: str | None = None


class WitnessCreate(PersonCreate):
    deal_id: str


class WitnessUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str | None = None
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    id_details: str | None = None
    photo: str | None = None


class PaymentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str
    person: str
    payment_type: str
    amount: float = Field(gt=0)
    payment_date: str
    payment_status: str
    notes: str | None = None


class PaymentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str | None = None
    person: str | None = None
    payment_type: str | None = None
    amount: float | None = Field(default=None, gt=0)
    payment_date: str | None = None
    payment_status: str | None = None
    notes: str | None = None


class DocumentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str
    category: str
    file_reference: str
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None
    document_kind: str = "file"


class DocumentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str | None = None
    category: str | None = None
    file_reference: str | None = None
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None
    document_kind: str | None = None


class BillCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str
    bill_type: str
    bill_number: str
    customer: str
    vehicle: str
    price: float = Field(ge=0)
    document_reference: str | None = None


class BillUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str | None = None
    bill_type: str | None = None
    bill_number: str | None = None
    customer: str | None = None
    vehicle: str | None = None
    price: float | None = Field(default=None, ge=0)
    document_reference: str | None = None


class WorkflowPayment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    person: str
    payment_type: str
    amount: float = Field(gt=0)
    payment_date: str
    payment_status: str
    notes: str | None = None


class DealWorkflowPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: str | None = None
    idempotency_key: str | None = None
    deal_type: str = "Buy & Sell"
    status: str = "Draft"
    vehicle: VehicleCreate
    seller: PersonCreate
    buyer: PersonCreate
    witnesses: list[PersonCreate] = Field(default_factory=list)
    payments: list[WorkflowPayment] = Field(default_factory=list)


class BillGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    bill_type: str
    idempotency_key: str | None = None


class FinanceSummaryResponse(BaseModel):
    total_revenue: float
    this_month: float
    pending_dues: float
    total_commission: float
    net_profit: float
    monthly_revenue: list[dict[str, Any]]
    revenue_breakdown: dict[str, float]
    revenue_trend: list[dict[str, Any]]


SALE_TERMS = ("sale", "sell", "buyer", "revenue", "income")
PURCHASE_TERMS = ("purchase", "buy", "seller", "intermediate")
PAID_STATUSES = {"paid", "completed", "settled"}

ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]


def two_digit_words(value: int) -> str:
    if value < 20:
        return ONES[value]
    return (TENS[value // 10] + (" " + ONES[value % 10] if value % 10 else "")).strip()


def amount_in_words(amount: float) -> str:
    rupees = int(round(float(amount or 0)))
    if rupees == 0:
        return "Zero Rupees Only"
    parts: list[str] = []
    for divisor, label in ((10000000, "Crore"), (100000, "Lakh"), (1000, "Thousand"), (100, "Hundred")):
        chunk, rupees = divmod(rupees, divisor)
        if chunk:
            parts.append(f"{two_digit_words(chunk)} {label}")
    if rupees:
        parts.append(two_digit_words(rupees))
    return " ".join(parts) + " Rupees Only"


def matches(payment: dict[str, Any], terms) -> bool:
    return any(term in payment.get("payment_type", "").lower() for term in terms)


def is_paid(payment: dict[str, Any]) -> bool:
    return payment.get("payment_status", "").lower() in PAID_STATUSES


def bill_payment_lines(payments: list[dict[str, Any]], buyer_facing: bool, customer_name: str) -> list[dict[str, Any]]:
    """Buyer-facing bills only ever carry sale receipts, never purchase or commission records."""
    selected = []
    for payment in payments:
        payment_type = (payment.get("payment_type") or "").lower()
        if buyer_facing:
            if "commission" in payment_type or "margin" in payment_type or "purchase" in payment_type:
                continue
            if matches(payment, SALE_TERMS) or payment.get("person") == customer_name:
                selected.append(payment)
        elif matches(payment, PURCHASE_TERMS) or payment.get("person") == customer_name:
            selected.append(payment)
    return selected


def deal_totals(payments: list[dict[str, Any]]) -> dict[str, float]:
    totals = {"total_paid": 0.0, "pending_amount": 0.0, "spent": 0.0, "earned": 0.0, "commission": 0.0}
    for payment in payments:
        amount = float(payment.get("amount", 0) or 0)
        if is_paid(payment):
            totals["total_paid"] += amount
            if matches(payment, PURCHASE_TERMS):
                totals["spent"] += amount
            if matches(payment, SALE_TERMS):
                totals["earned"] += amount
            if "commission" in payment.get("payment_type", "").lower():
                totals["commission"] += amount
        else:
            totals["pending_amount"] += amount
    return {key: round(value, 2) for key, value in totals.items()}


COLLECTIONS = {
    name: db[name] if db is not None else None
    for name in ("deals", "vehicles", "sellers", "buyers", "witnesses", "payments", "documents", "bills")
}


async def find_one(collection_name: str, field: str, value: str) -> dict[str, Any] | None:
    return await COLLECTIONS[collection_name].find_one({field: value}, {"_id": 0})


async def require_entity(collection_name: str, field: str, value: str) -> dict[str, Any]:
    entity = await find_one(collection_name, field, value)
    if not entity:
        raise HTTPException(status_code=404, detail=f"{collection_name[:-1].title()} {value} not found")
    return entity


async def validate_deal_links(data: dict[str, Any]) -> None:
    await require_entity("vehicles", "vehicle_id", data["vehicle_id"])
    if data.get("seller_id"):
        await require_entity("sellers", "seller_id", data["seller_id"])
    if data.get("buyer_id"):
        await require_entity("buyers", "buyer_id", data["buyer_id"])


async def validate_child_deal(data: dict[str, Any]) -> None:
    await require_entity("deals", "deal_id", data["deal_id"])


async def find_or_create_person(collection_name: str, id_field: str, prefix: str, person: dict[str, Any]) -> dict[str, Any]:
    existing = await COLLECTIONS[collection_name].find_one({"phone": person["phone"]}, {"_id": 0})
    if existing:
        await COLLECTIONS[collection_name].update_one({id_field: existing[id_field]}, {"$set": {**person, "updated_date": now_iso()}})
        return await find_one(collection_name, id_field, existing[id_field])
    entity_id = new_id(prefix)
    now = now_iso()
    document = {id_field: entity_id, **person, "created_date": now, "updated_date": now}
    await COLLECTIONS[collection_name].insert_one(document.copy())
    return await find_one(collection_name, id_field, entity_id)


async def find_or_create_vehicle(vehicle: dict[str, Any]) -> dict[str, Any]:
    existing = await db.vehicles.find_one({"$or": [{"chassis_number": vehicle["chassis_number"]}, {"vehicle_number": vehicle["vehicle_number"]}]}, {"_id": 0})
    if existing:
        await db.vehicles.update_one({"vehicle_id": existing["vehicle_id"]}, {"$set": {**vehicle, "updated_date": now_iso()}})
        return await find_one("vehicles", "vehicle_id", existing["vehicle_id"])
    vehicle_id = new_id("VEH")
    now = now_iso()
    document = {"vehicle_id": vehicle_id, **vehicle, "created_date": now, "updated_date": now}
    await db.vehicles.insert_one(document.copy())
    return await find_one("vehicles", "vehicle_id", vehicle_id)


async def get_workspace(deal_id: str) -> dict[str, Any]:
    deal = await require_entity("deals", "deal_id", deal_id)
    vehicle = await require_entity("vehicles", "vehicle_id", deal["vehicle_id"])
    seller = await find_one("sellers", "seller_id", deal.get("seller_id")) if deal.get("seller_id") else None
    buyer = await find_one("buyers", "buyer_id", deal.get("buyer_id")) if deal.get("buyer_id") else None
    witnesses = await db.witnesses.find({"deal_id": deal_id}, {"_id": 0}).sort("created_date", 1).to_list(100)
    payments = await db.payments.find({"deal_id": deal_id}, {"_id": 0}).sort("payment_date", 1).to_list(500)
    documents = await db.documents.find({"deal_id": deal_id}, {"_id": 0}).sort("created_date", 1).to_list(500)
    bills = await db.bills.find({"deal_id": deal_id}, {"_id": 0}).sort("created_date", 1).to_list(100)
    return {"deal": deal, "vehicle": vehicle, "seller": seller, "buyer": buyer, "witnesses": witnesses, "payments": payments, "documents": documents, "bills": bills}


async def list_entities(collection_name: str) -> list[dict[str, Any]]:
    return await COLLECTIONS[collection_name].find({}, {"_id": 0}).sort("created_date", -1).to_list(1000)


def register_simple_crud(
    path: str,
    collection_name: str,
    id_field: str,
    id_prefix: str,
    create_model: type[BaseModel],
    update_model: type[BaseModel],
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

    read_deps = [Depends(require_role("OWNER", "MANAGER", "WORKER"))]
    if collection_name == "payments":
        read_deps = [Depends(require_permission("can_view_payments"))]
    elif collection_name == "bills":
        read_deps = [Depends(require_permission("can_view_bills"))]
    elif collection_name == "vehicles":
        read_deps = [Depends(require_permission("can_view_inventory"))]

    api_router.add_api_route(f"/{path}", create, methods=["POST"], response_model=RecordResponse, status_code=201, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
    api_router.add_api_route(f"/{path}", list_all, methods=["GET"], response_model=list[RecordResponse], dependencies=read_deps)
    api_router.add_api_route(f"/{path}/{{entity_id}}", get_one, methods=["GET"], response_model=RecordResponse, dependencies=read_deps)
    api_router.add_api_route(f"/{path}/{{entity_id}}", update, methods=["PUT"], response_model=RecordResponse, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
    api_router.add_api_route(f"/{path}/{{entity_id}}", delete, methods=["DELETE"], dependencies=[Depends(require_permission("can_delete_bills"))])


@api_router.get("/")
def root():
    return {"message": "Metro Motors API", "database": "configured" if not DISABLE_REMOTE_DB and db is not None else "pending_configuration"}


@api_router.get("/public/showroom-info")
def public_showroom_info():
    """Returns verified public contact information and configuration status without secrets."""
    phone = os.environ.get("SHOWROOM_PHONE", "+91 98800 12345")
    raw_phone = os.environ.get("SHOWROOM_RAW_PHONE", "919880012345")
    address = os.environ.get("SHOWROOM_ADDRESS", "100ft Road, Indiranagar, Bengaluru, Karnataka 560038")
    hours = os.environ.get("SHOWROOM_HOURS", "Mon – Sun: 9:30 AM – 8:30 PM")
    email = os.environ.get("SHOWROOM_EMAIL", "sales@metromotors.in")
    is_verified = bool(os.environ.get("SHOWROOM_DETAILS_VERIFIED", "0") == "1")

    return {
        "showroom_name": "Metro Motors Bengaluru",
        "phone": phone,
        "raw_phone": raw_phone,
        "address": address,
        "hours": hours,
        "email": email,
        "is_verified": is_verified,
        "whatsapp_url": f"https://wa.me/{raw_phone}",
    }


@api_router.post("/public/enquiries", status_code=201)
def submit_public_enquiry(payload: CustomerEnquiryCreate, request: Request):
    """
    Public customer enquiry submission.
    Rate limited per IP/phone, persisted durably to local disk without requiring MongoDB.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    is_allowed, retry_after = check_rate_limit(client_ip, payload.phone)
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Too many enquiry requests. Please wait {retry_after} seconds before trying again, or call the showroom directly.",
            headers={"Retry-After": str(retry_after)},
        )

    result = process_enquiry_submission(payload, client_ip)
    return result


@api_router.get("/public/enquiries", dependencies=[Depends(require_role("OWNER", "MANAGER"))])
def get_enquiries_log(limit: int = 50):
    """Staff-only audit view for received public enquiries."""
    return list_saved_enquiries(limit=limit)


@api_router.post("/deals", response_model=RecordResponse, status_code=201, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def create_deal(payload: DealCreate):
    data = payload.model_dump()
    await validate_deal_links(data)
    now = now_iso()
    document = {"deal_id": new_id("DEAL"), **data, "created_date": now, "updated_date": now}
    await db.deals.insert_one(document.copy())
    return await find_one("deals", "deal_id", document["deal_id"])


@api_router.get("/deals", response_model=list[RecordResponse], dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def list_deals():
    return await list_entities("deals")


@api_router.get("/deals/{deal_id}", response_model=RecordResponse, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def get_deal(deal_id: str):
    return await require_entity("deals", "deal_id", deal_id)


@api_router.put("/deals/{deal_id}", response_model=RecordResponse, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def update_deal(deal_id: str, payload: DealUpdate):
    current = await require_entity("deals", "deal_id", deal_id)
    data = payload.model_dump(exclude_none=True)
    merged = {**current, **data}
    await validate_deal_links(merged)
    if data:
        data["updated_date"] = now_iso()
        await db.deals.update_one({"deal_id": deal_id}, {"$set": data})
    return await require_entity("deals", "deal_id", deal_id)


@api_router.delete("/deals/{deal_id}", dependencies=[Depends(require_role("OWNER"))])
async def delete_deal(deal_id: str, cascade: bool = False):
    await require_entity("deals", "deal_id", deal_id)
    if cascade:
        for name in ("witnesses", "payments", "documents", "bills"):
            await COLLECTIONS[name].delete_many({"deal_id": deal_id})
        await db.deals.delete_one({"deal_id": deal_id})
        return {"deleted": True, "deal_id": deal_id, "cascade": True}
    child_counts = await asyncio.gather(*(COLLECTIONS[name].count_documents({"deal_id": deal_id}) for name in ("witnesses", "payments", "documents", "bills")))
    if any(child_counts):
        raise HTTPException(status_code=409, detail="Delete related witnesses, payments, documents, and bills before deleting this deal")
    await db.deals.delete_one({"deal_id": deal_id})
    return {"deleted": True, "deal_id": deal_id}


_BILL_COUNTER_LOCK = asyncio.Lock()
_IN_MEMORY_BILL_COUNTERS: dict[str, int] = {}


async def allocate_bill_number(year: int | None = None) -> str:
    """
    Atomically allocates a monotonically increasing bill number in format MM-YY-NNNN.
    E.g. MM-26-0001, MM-26-0002.
    Uses MongoDB find_one_and_update with $inc on counters collection when database is active.
    Uses asyncio.Lock in-memory synchronized counter for local test/offline mode.
    """
    target_year = year if year is not None else datetime.now(UTC).year
    yy_str = f"{target_year % 100:02d}"
    counter_id = f"bills_{yy_str}"

    if db is not None and not DISABLE_REMOTE_DB:
        try:
            from pymongo import ReturnDocument

            result = await db.counters.find_one_and_update(
                {"_id": counter_id},
                {"$inc": {"seq": 1}},
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
            if result and "seq" in result:
                seq = result["seq"]
                return f"MM-{yy_str}-{seq:04d}"
        except Exception as exc:
            logger.warning(f"MongoDB atomic counter notice: {exc}")

    async with _BILL_COUNTER_LOCK:
        current_seq = _IN_MEMORY_BILL_COUNTERS.get(counter_id, 0) + 1
        _IN_MEMORY_BILL_COUNTERS[counter_id] = current_seq
        return f"MM-{yy_str}-{current_seq:04d}"


def assert_production_db_available():
    from security import IS_PRODUCTION
    if IS_PRODUCTION and (DISABLE_REMOTE_DB or db is None):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authoritative production database unavailable. Writes rejected to protect financial integrity.",
        )


@api_router.post("/workflow/deals", response_model=dict[str, Any], status_code=201, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def save_deal_workflow(payload: DealWorkflowPayload):
    assert_production_db_available()
    if payload.idempotency_key:
        existing_idempotent = await db.deals.find_one({"idempotency_key": payload.idempotency_key}, {"_id": 0})
        if existing_idempotent:
            return await get_workspace(existing_idempotent["deal_id"])

    vehicle = await find_or_create_vehicle(payload.vehicle.model_dump())
    seller = await find_or_create_person("sellers", "seller_id", "SELLER", payload.seller.model_dump(exclude_none=True))
    buyer = await find_or_create_person("buyers", "buyer_id", "BUYER", payload.buyer.model_dump(exclude_none=True))
    now = now_iso()
    deal_id = payload.deal_id or new_id("DEAL")
    deal_data = {
        "deal_type": payload.deal_type,
        "status": payload.status,
        "vehicle_id": vehicle["vehicle_id"],
        "seller_id": seller["seller_id"],
        "buyer_id": buyer["buyer_id"],
        "updated_date": now,
    }
    if payload.idempotency_key:
        deal_data["idempotency_key"] = payload.idempotency_key

    try:
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
    except Exception as exc:
        if payload.idempotency_key:
            existing_idem = await db.deals.find_one({"idempotency_key": payload.idempotency_key}, {"_id": 0})
            if existing_idem:
                return await get_workspace(existing_idem["deal_id"])
        logger.error(f"Deal persistence failed: {exc}")
        raise HTTPException(status_code=500, detail="Failed to save deal workflow. Write aborted safely.")
    return await get_workspace(deal_id)


@api_router.get("/deals/{deal_id}/workspace", response_model=dict[str, Any], dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def read_deal_workspace(deal_id: str, current_user: dict[str, Any] = Depends(get_current_user)):
    workspace = await get_workspace(deal_id)
    can_view_finances = current_user.get("permissions", {}).get(CAN_VIEW_FINANCES, False)
    can_view_prices = current_user.get("permissions", {}).get("can_view_prices", False)
    if can_view_finances or can_view_prices:
        return workspace

    # Redact purchase expenses and dealer commissions for staff/worker
    safe_workspace = dict(workspace)
    safe_workspace["payments"] = [
        p for p in workspace.get("payments", [])
        if not matches(p, PURCHASE_TERMS) and "commission" not in (p.get("payment_type") or "").lower()
    ]
    safe_workspace["bills"] = [
        b for b in workspace.get("bills", [])
        if b.get("bill_type") != "Seller → Intermediate"
    ]
    return safe_workspace


@api_router.post("/deals/{deal_id}/bills/generate", response_model=RecordResponse, status_code=201, dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def generate_bill(deal_id: str, payload: BillGenerateRequest):
    assert_production_db_available()
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
    else:
        customer = buyer.get("name", "Buyer")
    selected = bill_payment_lines(payments, payload.bill_type == "Seller → Buyer", customer)
    price = round(sum(float(payment.get("amount", 0)) for payment in selected if payment.get("payment_status", "").lower() in {"paid", "completed", "settled"}), 2)
    bill_id = new_id("BILL")
    bill_number = await allocate_bill_number()
    document = {
        "bill_id": bill_id,
        "deal_id": deal_id,
        "bill_type": payload.bill_type,
        "bill_number": bill_number,
        "customer": customer,
        "vehicle": workspace["vehicle"]["vehicle_name"],
        "price": price,
        "document_reference": f"bill://{bill_id}",
        "created_date": now_iso(),
        "updated_date": now_iso(),
    }
    if payload.idempotency_key:
        document["idempotency_key"] = payload.idempotency_key

    try:
        await db.bills.insert_one(document.copy())
    except Exception as exc:
        # Check if a concurrent request already inserted this bill
        existing_now = await db.bills.find_one({"deal_id": deal_id, "bill_type": payload.bill_type}, {"_id": 0})
        if existing_now:
            return existing_now
        if payload.idempotency_key:
            existing_idem = await db.bills.find_one({"idempotency_key": payload.idempotency_key}, {"_id": 0})
            if existing_idem:
                return existing_idem
        logger.error(f"Bill persistence failed: {exc}")
        raise HTTPException(status_code=500, detail="Failed to persist bill safely. Write aborted.")
    return await find_one("bills", "bill_id", bill_id)


@api_router.post("/media/upload", dependencies=[Depends(require_role("OWNER", "MANAGER", "WORKER"))])
async def upload_media(
    file: UploadFile = File(...),
    is_private: bool = Form(False),
):
    provider = get_storage_provider()
    file_bytes = await file.read()
    try:
        metadata = await provider.save_file(
            file_bytes=file_bytes,
            original_filename=file.filename or "upload.jpg",
            content_type=file.content_type or "image/jpeg",
            is_private=is_private,
        )
        return metadata
    except (ValueError, SecurityError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@api_router.get("/media/public/{filename}")
def get_public_media(filename: str):
    provider = get_storage_provider()
    path = provider.get_file_path(filename, is_private=False)
    if not path or not path.is_file():
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(path)


@api_router.get("/media/private/{filename}")
def get_private_media(
    filename: str,
    current_user: dict[str, Any] = Depends(require_role("OWNER", "MANAGER", "WORKER")),
):
    provider = get_storage_provider()
    path = provider.get_file_path(filename, is_private=True)
    if not path or not path.is_file():
        raise HTTPException(status_code=404, detail="Private media not found")
    return FileResponse(path)


async def build_deal_overview() -> list[dict[str, Any]]:
    deals, vehicles, sellers, buyers, payments = await asyncio.gather(
        db.deals.find({}, {"_id": 0}).sort("created_date", -1).to_list(2000),
        db.vehicles.find({}, {"_id": 0}).to_list(2000),
        db.sellers.find({}, {"_id": 0}).to_list(2000),
        db.buyers.find({}, {"_id": 0}).to_list(2000),
        db.payments.find({}, {"_id": 0}).to_list(10000),
    )
    vehicle_map = {item["vehicle_id"]: item for item in vehicles}
    seller_map = {item["seller_id"]: item for item in sellers}
    buyer_map = {item["buyer_id"]: item for item in buyers}
    payment_map: dict[str, list[dict[str, Any]]] = {}
    for payment in payments:
        payment_map.setdefault(payment.get("deal_id", ""), []).append(payment)
    rows = []
    for deal in deals:
        vehicle = vehicle_map.get(deal.get("vehicle_id"), {})
        seller = seller_map.get(deal.get("seller_id"), {})
        buyer = buyer_map.get(deal.get("buyer_id"), {})
        deal_payments = payment_map.get(deal["deal_id"], [])
        rows.append({
            "deal_id": deal["deal_id"],
            "deal_type": deal.get("deal_type", ""),
            "status": deal.get("status", ""),
            "created_date": deal.get("created_date", ""),
            "updated_date": deal.get("updated_date", ""),
            "vehicle_name": vehicle.get("vehicle_name", ""),
            "vehicle_number": vehicle.get("vehicle_number", ""),
            "registration_number": vehicle.get("registration_number", ""),
            "vehicle_status": vehicle.get("vehicle_status", ""),
            "seller_name": seller.get("name", ""),
            "seller_phone": seller.get("phone", ""),
            "buyer_name": buyer.get("name", ""),
            "buyer_phone": buyer.get("phone", ""),
            "payment_count": len(deal_payments),
            **deal_totals(deal_payments),
        })
    return rows


@api_router.get("/overview/deals", response_model=list[RecordResponse])
async def deals_overview(current_user: dict[str, Any] = Depends(get_current_user)):
    rows = await build_deal_overview()
    can_view_finances = current_user.get("permissions", {}).get(CAN_VIEW_FINANCES, False)
    can_view_prices = current_user.get("permissions", {}).get("can_view_prices", False)
    if can_view_finances or can_view_prices:
        return rows

    safe_rows = []
    for row in rows:
        safe_r = dict(row)
        safe_r.pop("spent", None)
        safe_r.pop("earned", None)
        safe_r.pop("commission", None)
        safe_rows.append(safe_r)
    return safe_rows


@api_router.get("/overview/dashboard", response_model=dict[str, Any])
async def dashboard_overview(current_user: dict[str, Any] = Depends(get_current_user)):
    rows = await build_deal_overview()
    vehicles = await db.vehicles.find({}, {"_id": 0}).sort("created_date", -1).to_list(2000)
    today = datetime.now(UTC).date().isoformat()
    available = [vehicle for vehicle in vehicles if vehicle.get("vehicle_status", "In Stock").lower() != "sold"]
    sold_rows = [row for row in rows if row["status"].lower() in {"completed", "sold"} or row["vehicle_status"].lower() == "sold"]

    can_view_finances = current_user.get("permissions", {}).get(CAN_VIEW_FINANCES, False)

    recently_sold_safe = []
    for row in sold_rows[:5]:
        if can_view_finances:
            recently_sold_safe.append(row)
        else:
            safe_r = dict(row)
            safe_r.pop("spent", None)
            safe_r.pop("earned", None)
            safe_r.pop("commission", None)
            recently_sold_safe.append(safe_r)

    return {
        "todays_stock": len([vehicle for vehicle in available if str(vehicle.get("created_date", "")).startswith(today)]),
        "bikes_in_stock": len(available),
        "total_deals": len(rows),
        "new_deals": len([row for row in rows if row["status"].lower() in {"draft", "new"}]),
        "deals_closed": len(sold_rows),
        "net_finances": round(sum(row["earned"] for row in rows) - sum(row["spent"] for row in rows) + sum(row["commission"] for row in rows), 2) if can_view_finances else None,
        "pending_dues": round(sum(row["pending_amount"] for row in rows), 2) if can_view_finances else None,
        "recently_sold": recently_sold_safe,
        "bikes_for_sale": available[:6],
    }


@api_router.get("/bills/{bill_id}/document", response_model=dict[str, Any])
async def bill_document(bill_id: str, current_user: dict[str, Any] = Depends(get_current_user)):
    bill = await require_entity("bills", "bill_id", bill_id)
    can_view_finances = current_user.get("permissions", {}).get(CAN_VIEW_FINANCES, False)
    buyer_facing = bill["bill_type"] == BILL_TYPE_SELLER_BUYER
    if not buyer_facing and not can_view_finances:
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Intermediate bill contains confidential dealer purchase financials."
        )
    workspace = await get_workspace(bill["deal_id"])
    vehicle = workspace["vehicle"]
    seller = workspace.get("seller") or {}
    buyer = workspace.get("buyer") or {}
    totals = deal_totals(workspace["payments"])
    if buyer_facing:
        lines = bill_payment_lines(workspace["payments"], True, buyer.get("name", ""))
        parties = {"from": {"role": "Seller", **{key: seller.get(key, "") for key in ("name", "phone", "address", "id_details")}}, "to": {"role": "Buyer", **{key: buyer.get(key, "") for key in ("name", "phone", "address", "id_details")}}}
    else:
        lines = bill_payment_lines(workspace["payments"], False, seller.get("name", ""))
        parties = {"from": {"role": "Seller", **{key: seller.get(key, "") for key in ("name", "phone", "address", "id_details")}}, "to": {"role": "Intermediate (Metro Motors)", "name": "Metro Motors", "phone": "", "address": "", "id_details": ""}}
    total = round(float(bill.get("price", 0) or 0), 2)
    document = {
        "bill": {key: value for key, value in bill.items() if key != "document_reference"},
        "deal": {"deal_id": workspace["deal"]["deal_id"], "deal_type": workspace["deal"].get("deal_type", ""), "status": workspace["deal"].get("status", "")},
        "vehicle": vehicle,
        "parties": parties,
        "witnesses": [{key: witness.get(key, "") for key in ("name", "phone", "address", "id_details")} for witness in workspace["witnesses"]],
        "payment_lines": [{"payment_date": line.get("payment_date", ""), "person": line.get("person", ""), "payment_type": line.get("payment_type", ""), "amount": float(line.get("amount", 0) or 0), "payment_status": line.get("payment_status", ""), "notes": line.get("notes", "")} for line in lines],
        "total_amount": total,
        "total_in_words": amount_in_words(total),
        "confidential": None if buyer_facing else {"purchase_total": totals["spent"], "sale_total": totals["earned"], "commission": totals["commission"], "margin": round(totals["earned"] - totals["spent"], 2)},
    }
    return document


def _accumulate_payment_finance(payment: dict[str, Any], now: datetime, state: dict[str, Any]) -> None:
    amount = float(payment.get("amount", 0))
    payment_type = payment.get("payment_type", "").lower()
    paid = is_paid(payment)
    if not paid:
        state["pending"] += amount
        return

    if any(term in payment_type for term in SALE_TERMS):
        state["revenue"] += amount
        try:
            payment_date = datetime.fromisoformat(payment["payment_date"].replace("Z", "+00:00"))
            if payment_date.year == now.year and payment_date.month == now.month:
                state["this_month"] += amount
            month_key = payment_date.strftime("%b %Y")
            state["monthly"][month_key] = state["monthly"].get(month_key, 0) + amount
        except (KeyError, ValueError):
            pass

    if any(term in payment_type for term in PURCHASE_TERMS):
        state["purchase"] += amount

    if "commission" in payment_type:
        state["commission"] += amount


@api_router.get("/finances/summary", response_model=FinanceSummaryResponse, dependencies=[Depends(require_permission(CAN_VIEW_FINANCES))])
async def finances_summary():
    payments = await db.payments.find({}, {"_id": 0}).to_list(5000)
    now = datetime.now(UTC)
    state: dict[str, Any] = {
        "revenue": 0.0,
        "purchase": 0.0,
        "commission": 0.0,
        "pending": 0.0,
        "this_month": 0.0,
        "monthly": {},
    }
    for payment in payments:
        _accumulate_payment_finance(payment, now, state)

    monthly = state["monthly"]
    ordered_months = sorted(monthly.items(), key=lambda item: datetime.strptime(item[0], "%b %Y"))[-12:]
    trend = [{"month": month, "value": round(value, 2)} for month, value in ordered_months]
    revenue = state["revenue"]
    purchase = state["purchase"]
    commission = state["commission"]
    pending = state["pending"]
    this_month = state["this_month"]
    return {
        "total_revenue": round(revenue, 2),
        "this_month": round(this_month, 2),
        "pending_dues": round(pending, 2),
        "total_commission": round(commission, 2),
        "net_profit": round(revenue - purchase + commission, 2),
        "monthly_revenue": trend,
        "revenue_breakdown": {
            "sales": round(revenue, 2),
            "purchase_cost": round(purchase, 2),
            "commission": round(commission, 2),
        },
        "revenue_trend": trend,
    }


@api_router.post("/download-pdf")
async def download_pdf_stream(request: Request):
    form = await request.form()
    uploaded_file = form.get("file")
    filename = form.get("filename", "Seller-Bill.pdf")
    if not str(filename).endswith(".pdf"):
        filename = f"{filename}.pdf"

    if uploaded_file and hasattr(uploaded_file, "read"):
        content = await uploaded_file.read()
    else:
        content = b""

    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "application/pdf",
        },
    )


class AuthRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: str
    terms_accepted: bool | None = True


class AuthLoginRequest(BaseModel):
    email: str
    password: str | None = None


class AuthGoogleRequest(BaseModel):
    id_token: str


class AuthForgotPasswordRequest(BaseModel):
    email: str


class AuthVerifyOtpRequest(BaseModel):
    email: str
    otp: str
    new_password: str | None = None  # Handled for legacy 1-step call if supplied


class AuthResetPasswordRequest(BaseModel):
    email: str
    recovery_token: str
    new_password: str
    confirm_password: str


class AuthSetPasswordRequest(BaseModel):
    email: str
    password: str


class AuthSendOtpRequest(BaseModel):
    email: str


@api_router.post("/auth/register")
async def auth_register(payload: AuthRegisterRequest):
    """Register customer account with strong password policy and unique email enforcement."""
    return await register_customer_user(
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
        confirm_password=payload.confirm_password,
    )


@api_router.post("/auth/login")
async def auth_login(payload: AuthLoginRequest):
    """Authenticate via email and password with rate limiting and signed JWT token."""
    return await authenticate_user_credentials(
        email=payload.email,
        password=payload.password,
    )


@api_router.post("/auth/google")
async def auth_google(payload: AuthGoogleRequest):
    """Authenticate or register user using verified Google OAuth 2.0 ID token."""
    return await authenticate_google_identity(id_token_str=payload.id_token)


@api_router.post("/auth/forgot-password")
async def auth_forgot_password(payload: AuthForgotPasswordRequest):
    """Step 1: Request 6-digit OTP code for password recovery with 60s cooldown."""
    return await request_password_recovery_otp(email=payload.email)


@api_router.post("/auth/verify-otp")
async def auth_verify_otp(payload: AuthVerifyOtpRequest):
    """
    Step 2: Server-side OTP verification.
    If new_password is provided (legacy call), completes reset immediately.
    Otherwise, returns single-use recovery authorization token for step 3.
    """
    if payload.new_password:
        verify_res = await verify_password_recovery_otp(email=payload.email, otp_code=payload.otp)
        recovery_token = verify_res["recovery_token"]
        return await reset_password_with_recovery_token(
            email=payload.email,
            recovery_token=recovery_token,
            new_password=payload.new_password,
            confirm_password=payload.new_password,
        )
    return await verify_password_recovery_otp(email=payload.email, otp_code=payload.otp)


@api_router.post("/auth/reset-password")
async def auth_reset_password(payload: AuthResetPasswordRequest):
    """Step 3: Secure password reset requiring server-issued single-use recovery token."""
    return await reset_password_with_recovery_token(
        email=payload.email,
        recovery_token=payload.recovery_token,
        new_password=payload.new_password,
        confirm_password=payload.confirm_password,
    )


@api_router.post("/auth/logout")
def auth_logout():
    """Client session termination endpoint."""
    return {"success": True, "message": "Successfully logged out."}


@api_router.get("/auth/me")
def auth_get_me(current_user: dict[str, Any] = Depends(get_current_user)):
    """Retrieve verified session profile and permission claims."""
    return {
        "authenticated": True,
        "user": current_user,
        "permissions": current_user.get("permissions", {}),
    }


@api_router.get("/auth/health")
def auth_health():
    """Diagnostic health status for database and email subsystems."""
    db_status = db_manager.get_status()
    return {
        "status": "healthy",
        "service": "Metro Motors Authentication Atelier",
        "database": db_status,
        "smtp_configured": email_service.is_smtp_configured,
        "google_oauth_configured": bool(os.environ.get("GOOGLE_CLIENT_ID")),
    }


# ── Legacy Endpoints (Maintained for Backward Compatibility) ──
@api_router.post("/auth/send-otp")
async def auth_send_otp(payload: AuthSendOtpRequest):
    """Legacy endpoint: maps to request_password_recovery_otp."""
    res = await request_password_recovery_otp(email=payload.email)
    preview = res.get("dev_preview_otp", "")
    return {
        "success": True,
        "message": f"Verification code sent to {payload.email}",
        "preview_otp": preview,
    }


@api_router.post("/auth/set-password")
async def auth_set_password(payload: AuthSetPasswordRequest):
    """Legacy endpoint: initial showroom password setup (strictly disabled in production)."""
    from security import IS_PRODUCTION
    if IS_PRODUCTION:
        raise HTTPException(status_code=404, detail="Endpoint not available in production.")

    email = payload.email.strip().lower()
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    owner_emails = [e.strip().lower() for e in os.environ.get("OWNER_EMAILS", "aravasamarth@gmail.com,alex@metromotors.in").split(",") if e.strip()]
    user = await find_user_by_email(email)
    role = user.get("role", "OWNER" if email in owner_emails else "WORKER") if user else ("OWNER" if email in owner_emails else "WORKER")
    name = user.get("fullName", email.split("@")[0].title()) if user else email.split("@")[0].title()

    hashed = hash_password(payload.password)
    user_doc = {
        "userId": user.get("userId") if user else f"USER-{uuid.uuid4().hex[:8].upper()}",
        "fullName": name,
        "email": email,
        "normalizedEmail": email,
        "passwordHash": hashed,
        "password": hashed,
        "role": role,
        "emailVerified": True,
        "accountStatus": "ACTIVE",
        "authProviders": ["password"],
        "updatedAt": now_iso(),
    }
    from auth_service import save_user
    await save_user(user_doc)
    return {"success": True, "message": f"Password successfully set for {email}", "role": role}


register_simple_crud("vehicles", "vehicles", "vehicle_id", "VEH", VehicleCreate, VehicleUpdate)
register_simple_crud("sellers", "sellers", "seller_id", "SELLER", PersonCreate, PersonUpdate)
register_simple_crud("buyers", "buyers", "buyer_id", "BUYER", PersonCreate, PersonUpdate)
register_simple_crud("witnesses", "witnesses", "witness_id", "WITNESS", WitnessCreate, WitnessUpdate, validate_child_deal)
register_simple_crud("payments", "payments", "payment_id", "PAY", PaymentCreate, PaymentUpdate, validate_child_deal)
register_simple_crud("documents", "documents", "document_id", "DOC", DocumentCreate, DocumentUpdate, validate_child_deal)
register_simple_crud("bills", "bills", "bill_id", "BILL", BillCreate, BillUpdate, validate_child_deal)


@app.on_event("startup")
async def startup_db_and_indexes():
    """Establish connection pool, validate production security configuration, and ensure indexes."""
    from database import DISABLE_REMOTE_DB, MONGODB_URI
    from security import IS_PRODUCTION, JWT_SECRET_KEY
    if IS_PRODUCTION:
        if JWT_SECRET_KEY in ("metro_motors_secure_jwt_secret_key_2026_dev", "test_secret_key_for_unit_tests_metro_motors_2026") or len(JWT_SECRET_KEY) < 32:
            raise RuntimeError("FATAL SECURITY CONFIGURATION ERROR: Insecure or default JWT_SECRET_KEY in production. Must be at least 32 characters.")
        if DISABLE_REMOTE_DB:
            raise RuntimeError("FATAL SECURITY CONFIGURATION ERROR: DISABLE_REMOTE_DB cannot be active in production.")
        if not MONGODB_URI or "localhost" in MONGODB_URI:
            raise RuntimeError("FATAL SECURITY CONFIGURATION ERROR: Authoritative remote MONGODB_URI required in production.")
    try:
        await db_manager.connect()
        await db_manager.ensure_indexes()
    except Exception as exc:
        logger.warning(f"Startup database initialization notice: {exc}")


app.include_router(api_router)

cors_env = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    """Cleanly close database connection pool upon application termination."""
    await db_manager.close()
    if client is not None:
        client.close()