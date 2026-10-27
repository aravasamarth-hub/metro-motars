# Metro Motors AI Operating Rules

## Project Overview
Metro Motors is a dual-interface used motorcycle marketplace:
- Backend: FastAPI, Python 3.11, MongoDB Atlas / JSONL offline fallback.
- Frontend: React 18, Craco, TailwindCSS, Motion UI, Jest test suite.

## Development Rules
1. Test Gate: Run `python -m pytest backend/tests` and `npm test -- --watchAll=false` before commits.
2. Parallel Safety: Cursor and Antigravity must never edit the same files concurrently. Use git branches/worktrees.
3. Offline First: Maintain demo / offline data fallback when database connection is unavailable.
