---
name: metro-quality-workflow
description: Production-grade quality, testing, security, and verification gate for Metro Motors development.
risk: none
source: local-project-workflow
date_added: 2026-10-28
tags: ["quality", "testing", "security", "fastapi", "react", "offline-first"]
---

# Metro Motors Quality & Verification Workflow

This workflow enforces the software quality, security, and empirical testing protocol for all changes made to the Metro Motors codebase.

---

## 1. The Pre-Edit Impact Protocol

Before modifying any code in `backend/` or `frontend/`:
1. **Understand Intent**: Clarify exact requirements and constraints before writing code.
2. **Dependency Mapping**:
   - Check which endpoints in `backend/server.py` or frontend components in `frontend/src/` are affected.
   - Trace shared schemas in `backend/database.py` and API service calls in `frontend/src/services/`.
3. **Security & Privacy Audit**:
   - Does this change touch customer PII (phone, email, KYC docs)?
   - Does this change affect JWT authentication (`auth_service.py`) or Role-Based Access Control?
   - Ensure customer records are never returned to unauthorized users.
4. **Offline-First Preservation**:
   - Verify that changes do not break local `backend/data/*.jsonl` storage when MongoDB Atlas is offline.

---

## 2. Reviewable Change Execution

- Keep changes atomic and minimal.
- Never refactor unrelated files during a specific feature or bugfix task.
- Preserve existing comments, docstrings, and error handlers.

---

## 3. The 6-Step Verification Gate

After completing any code edit, execute the empirical verification suite:

### Step 1: Backend Static Analysis & Ruff Linting
```bash
ruff check backend/
```

### Step 2: Backend Pytest Suite
```bash
$env:PYTHONPATH="backend"; python -m pytest backend/tests -v
```

### Step 3: Frontend TypeScript Type Checking
```bash
cd frontend && npx tsc --noEmit
```

### Step 4: Frontend Jest Test Suite
```bash
cd frontend && npm test -- --watchAll=false
```

### Step 5: Git Diff Sanity Check
```bash
git diff --stat
```
Verify that no unintended files, secrets, or temporary logs are staged.

### Step 6: Evidence Classification
Every deliverable report must classify findings into:
- **Verified by Automated Tests**: Exact command output, number of tests passed.
- **Verified Manually in Browser**: Visual behavior confirmed in Chrome without console errors.
- **Verified with Mocks**: Tested against local mock payloads.
- **Verified against External Service**: Only when credentials are explicitly configured.
- **Blocked / Deferred**: Documented in `DEFERRED.md` (e.g. live email, Cloudflare R2, Atlas).

---

## 4. Forbidden Actions & Safeguards

- NEVER run destructive commands (`DROP TABLE`, file deletions in `data/`).
- NEVER commit credentials, tokens, or private customer records.
- NEVER disable tests or type checks to make CI green.
- NEVER force-push or commit to `main` without review.
