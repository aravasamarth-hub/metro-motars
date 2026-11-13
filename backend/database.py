"""
Metro Motors — Enterprise MongoDB Atlas Database Manager
Handles singleton connection pooling, health checks, index creation,
and resilient failover when remote Atlas credentials are unconfigured or offline.
"""

import logging
import os
import re
from typing import Any, Optional

import pymongo
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, PyMongoError

logger = logging.getLogger("metro_motors.database")

# Environment Variable Resolution
MONGODB_URI = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME") or os.environ.get("DB_NAME", "metro_motors")
DISABLE_REMOTE_DB = os.environ.get("DISABLE_REMOTE_DB", "0") == "1"


def sanitize_uri(uri: str) -> str:
    """Mask credentials in MongoDB connection string for safe diagnostic logging."""
    if not uri:
        return "<EMPTY_URI>"
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:***@", uri)



ASC = pymongo.ASCENDING

# Core showroom entities keyed by a UUID business id.
_ENTITY_ID_FIELDS = [
    ("deals", "deal_id"),
    ("vehicles", "vehicle_id"),
    ("sellers", "seller_id"),
    ("buyers", "buyer_id"),
    ("witnesses", "witness_id"),
    ("payments", "payment_id"),
    ("documents", "document_id"),
    ("bills", "bill_id"),
]


def _user_index_specs() -> list[tuple]:
    return [
        ("users", [("normalizedEmail", ASC)], {"unique": True, "name": "idx_users_normalized_email_unique"}),
        ("users", [("email", ASC)], {"name": "idx_users_email"}),
        ("users", [("googleSubjectId", ASC)], {"sparse": True, "name": "idx_users_google_sub"}),
        ("users", [("role", ASC)], {"name": "idx_users_role"}),
    ]


def _password_reset_index_specs() -> list[tuple]:
    coll = "password_reset_requests"
    return [
        (coll, [("email", ASC)], {"name": "idx_pwd_reset_email"}),
        (coll, [("recoveryToken", ASC)], {"sparse": True, "name": "idx_pwd_reset_recovery_token"}),
        (coll, [("expiresAt", ASC)], {"expireAfterSeconds": 0, "name": "idx_pwd_reset_ttl_expires"}),
    ]


def _showroom_index_specs() -> list[tuple]:
    specs = [
        (coll, [(field, ASC)], {"unique": True, "name": f"idx_{coll}_{field}_unique"})
        for coll, field in _ENTITY_ID_FIELDS
    ]
    specs += [
        ("bills", [("bill_number", ASC)], {"unique": True, "name": "idx_bills_bill_number_unique"}),
        (
            "bills",
            [("deal_id", ASC), ("bill_type", ASC)],
            {"unique": True, "name": "idx_bills_deal_id_bill_type_unique"},
        ),
        (
            "deals",
            [("idempotency_key", ASC)],
            {"unique": True, "sparse": True, "name": "idx_deals_idempotency_key_unique"},
        ),
        # counters._id is unique by definition in MongoDB; an explicit unique _id index is
        # rejected by the server, so it is intentionally not declared here.
    ]
    return specs


def _index_specs() -> list[tuple]:
    """All (collection, keys, options) index declarations, grouped by entity."""
    return _user_index_specs() + _password_reset_index_specs() + _showroom_index_specs()

class DatabaseManager:
    """
    Manages lifecycle of AsyncIOMotorClient with resilient connection pooling,
    automatic index initialization, and graceful fallback when offline.
    """

    _instance: Optional["DatabaseManager"] = None
    _client: AsyncIOMotorClient | None = None
    _db: AsyncIOMotorDatabase | None = None
    _is_connected: bool = False
    _last_error: str | None = None
    _connection_attempted: bool = False

    def __new__(cls) -> "DatabaseManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def client(self) -> AsyncIOMotorClient | None:
        return self._client

    @property
    def db(self) -> AsyncIOMotorDatabase | None:
        return self._db

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    def get_status(self) -> dict[str, Any]:
        """Return diagnostic health status without exposing sensitive credentials."""
        return {
            "connected": self._is_connected,
            "database_name": MONGODB_DB_NAME,
            "sanitized_uri": sanitize_uri(MONGODB_URI),
            "remote_db_disabled": DISABLE_REMOTE_DB,
            "last_error": self._last_error,
        }

    async def connect(self) -> AsyncIOMotorDatabase | None:
        """Initialize and verify connection to MongoDB Atlas."""
        if DISABLE_REMOTE_DB:
            logger.info("MongoDB Atlas disabled via DISABLE_REMOTE_DB=1 flag.")
            self._is_connected = False
            return None

        if self._client is not None and self._is_connected:
            return self._db

        try:
            logger.info(f"Connecting to MongoDB database '{MONGODB_DB_NAME}' via {sanitize_uri(MONGODB_URI)}...")
            self._client = AsyncIOMotorClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000,
                maxPoolSize=50,
                minPoolSize=5,
            )
            # Perform diagnostic ping
            await self._client.admin.command("ping")
            self._db = self._client[MONGODB_DB_NAME]
            self._is_connected = True
            self._last_error = None
            logger.info(f"Successfully connected to MongoDB Atlas database '{MONGODB_DB_NAME}'.")
            return self._db
        except (ConnectionFailure, PyMongoError, Exception) as exc:
            self._is_connected = False
            self._last_error = str(exc)
            logger.warning(
                f"MongoDB Atlas connection unverified ({self._last_error}). "
                "Operating with resilient fallback; application will remain responsive."
            )
            return None

    async def ensure_indexes(self) -> None:
        """Create required indexes and unique constraints on collections.

        Each index is created independently so one failure never skips the rest.
        """
        if not self._is_connected or self._db is None:
            return

        failures = 0
        for collection_name, keys, options in _index_specs():
            try:
                await self._db[collection_name].create_index(keys, **options)
            except Exception as exc:
                failures += 1
                logger.warning(f"Index {options.get('name')} on {collection_name} deferred: {exc}")

        if failures == 0:
            logger.info("MongoDB Atlas database indexes verified successfully.")

    async def close(self) -> None:
        """Close connection pool cleanly upon application shutdown."""
        if self._client is not None:
            self._client.close()
            self._client = None
            self._db = None
            self._is_connected = False
            logger.info("MongoDB Atlas database connection closed cleanly.")


# Global singleton instance
db_manager = DatabaseManager()


def get_database() -> AsyncIOMotorDatabase | None:
    """Retrieve active database instance or None if operating in offline fallback."""
    return db_manager.db
