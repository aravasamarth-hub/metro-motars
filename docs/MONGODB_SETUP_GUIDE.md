# Metro Motors — MongoDB Central Database Setup Guide

> **STATUS**: Pending User Configuration  
> **CURRENT RUNTIME MODE**: Local Demo Storage (IndexedDB `metro-motors-ui-v1`) with real server-side JWT security and RBAC.  
> **SAFETY NOTICE**: No MongoDB Atlas credentials or connection strings have been accessed, modified, or stored in this repository.

---

## 1. Required Environment Variables

When configuring the production backend environment, set the following environment variables in `app/backend/.env` (or via your production secrets manager). **Never commit the `.env` file to version control.**

| Variable Name | Description | Example Format |
|---|---|---|
| `MONGO_URL` | MongoDB Atlas connection string | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | Target database name | `metro_motors_db` |
| `JWT_SECRET_KEY` | High-entropy secret for HMAC-SHA256 signing of JWT access tokens | 64-character hex string (e.g. generated via `openssl rand -hex 32`) |
| `CORS_ORIGINS` | Comma-separated list of trusted client origins | `https://app.metromotors.in,https://admin.metromotors.in` |
| `CLOUD_STORAGE_PROVIDER` | Photo storage provider (optional / future) | `s3`, `gcs`, `cloudinary`, or `local` |

---

## 2. Endpoints Requiring Database Access

The following FastAPI endpoints in `app/backend/server.py` require an active MongoDB connection:

1. **Authentication**:
   - `POST /api/auth/login` (checks `users` collection for credentials and issues JWT)
   - `POST /api/auth/set-password` (updates hashed password in `users` collection)
   - `POST /api/auth/send-otp` and `POST /api/auth/verify-otp` (manages OTP verification)
2. **Deals & Inventory**:
   - `GET /api/deals` (lists deals with role-filtered projections)
   - `GET /api/deals/{id}` (fetches single deal)
   - `POST /api/deals` (creates deal with server-side validation)
   - `PUT /api/deals/{id}` (updates deal)
   - `DELETE /api/deals/{id}` (soft/cascade deletion, requires OWNER role)
   - `GET /api/deals/next-bill-number` (atomically generates consecutive bill number)
3. **Workflow & Overview**:
   - `POST /api/workflow/deals` (atomic deal creation with associated parties and vehicle)
   - `GET /api/overview/deals` (deal summary list for showroom director)
   - `GET /api/overview/dashboard` (aggregated analytics excluding sold stock)
   - `GET /api/finances/summary` (financial audit totals, OWNER-only)
4. **Bills & Documents**:
   - `GET /api/bills` and `GET /api/bills/{id}/document` (buyer/seller bills)
   - `POST /api/deals/{id}/bills/generate` (idempotent bill issuance)

---

## 3. Database Indexes & Constraints

The application requires the following indexes in MongoDB:

```javascript
// Database: metro_motors_db

// 1. users collection
db.users.createIndex({ "email": 1 }, { unique: true });

// 2. deals collection
db.deals.createIndex({ "id": 1 }, { unique: true });
db.deals.createIndex({ "bill_number": 1 }, { unique: true, sparse: true });
db.deals.createIndex({ "status": 1, "deal_type": 1 });
db.deals.createIndex({ "vehicle.registration_number": 1 });
db.deals.createIndex({ "created_at": -1 });

// 3. vehicles collection
db.vehicles.createIndex({ "id": 1 }, { unique: true });
db.vehicles.createIndex({ "registration_number": 1 }, { unique: true, sparse: true });

// 4. parties collection (buyers, sellers, agents)
db.parties.createIndex({ "id": 1 }, { unique: true });
db.parties.createIndex({ "phone": 1 });

// 5. bills collection
db.bills.createIndex({ "id": 1 }, { unique: true });
db.bills.createIndex({ "bill_number": 1 }, { unique: true });
db.bills.createIndex({ "deal_id": 1 });

// 6. sequences collection (for atomic bill sequence generation)
db.sequences.createIndex({ "_id": 1 }, { unique: true });
```

---

## 4. Server-Issued Atomic Bill Numbering

To eliminate duplicate bill numbers across multiple browser tabs and devices:

1. MongoDB atomic increment:
   ```python
   seq_doc = await db.sequences.find_one_and_update(
       {"_id": "bill_number"},
       {"$inc": {"count": 1}},
       upsert=True,
       return_document=ReturnDocument.AFTER
   )
   bill_number = f"Bill-{str(seq_doc['count']).zfill(3)}"
   ```
2. The unique index on `deals.bill_number` and `bills.bill_number` guarantees zero collision even under high concurrency.

---

## 5. Safe Multi-Stage Connection & Migration Procedure

Follow this strict order when ready to connect MongoDB Atlas:

1. **Step 1: Staging/Isolated Cluster Verification**
   - Connect to an isolated test database (e.g. `metro_motors_test`).
   - Run `python -m pytest tests/` with `REACT_APP_BACKEND_URL` pointing to the test instance.
   - Verify all 23 backend tests pass.
2. **Step 2: Dry-Run Local Migration**
   - Use the dry-run migration utility (`dealMigration.js`) to scan IndexedDB records.
   - Validate each local deal schema against `validateDeal()`.
   - Check for conflicting bill numbers or duplicate vehicle registration numbers.
3. **Step 3: Idempotent Import**
   - Execute the migration utility. It imports records using `PUT /api/deals/{id}` so retrying does not create duplicate entries.
   - Review imported counts: `imported`, `skipped`, `conflicting`.
4. **Step 4: Centralized Persistence Verification**
   - Open two independent browser sessions (e.g. Chrome and Firefox).
   - Log into both using showroom credentials.
   - Create a deal in Session A and verify it appears in Session B after list refresh.
5. **Step 5: Switch Frontend Default Storage Mode**
   - Set `REACT_APP_DEFAULT_STORAGE_MODE=remote` in frontend environment configuration.

---

## 6. Verification Status Summary

| Capability | Local Mode (IndexedDB) | Remote Mode (MongoDB Atlas) |
|---|---|---|
| **Deal CRUD** | ✅ Fully Functional | ⏳ Unverified (Pending Atlas setup) |
| **Server JWT Auth & RBAC** | ✅ Fully Implemented | ⏳ Unverified against live Atlas users |
| **Local Bill Numbering** | ✅ Atomic per-device sequence | ⏳ Atomic server sequence ready in code |
| **Photo Storage** | ✅ Validated Blobs in IndexedDB | ⏳ Cloud provider pending credentials |
| **Bill & Bond Agreement PDFs**| ✅ Fully Functional | ✅ Fully Functional |
| **Financial Calculations** | ✅ Regression-tested & Verified | ✅ Regression-tested & Verified |
