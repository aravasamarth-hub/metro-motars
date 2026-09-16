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


class DocumentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deal_id: Optional[str] = None
    category: Optional[str] = None
    file_reference: Optional[str] = None


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