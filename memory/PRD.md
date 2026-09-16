# Metro Motors — Product Requirements Document

## Original problem statement
Build Metro Motors from scratch as a responsive full-stack web app. For this stage, build UI only with placeholder data: a professional motorcycle resale showroom dashboard inspired by uploaded screenshots, using a dark navy/blue-gray theme, light sidebar, gold accents, rounded cards, clean typography, responsive desktop/mobile layouts, and a Light/Dark toggle. Include exactly these views in sidebar order: Dashboard, Deals, Bills, New Deal, Finances, Follow-ups, Settings. Stop after the UI is complete; do not build backend, database, authentication, billing logic, storage, or advanced functionality.

## Architecture decisions
- React 19 with React Router for seven lightweight client-side views.
- Reusable layout, metric, table, toolbar, status, form, and section components in `frontend/src/App.js`.
- CSS variables and responsive media queries in `frontend/src/App.css`; no backend calls or database dependencies for this UI phase.
- Lucide React icons for consistent controls and Google-hosted DM Sans / Manrope typography.
- Placeholder data is kept local to the UI and interactions are intentionally demo-only.

## User personas
- Showroom owner: needs a fast daily overview of stock, sales, revenue, and follow-ups.
- Showroom administrator: manages deals, customer bills, new deal details, and showroom preferences.

## Core requirements (static)
- Dashboard opens by default.
- Sidebar navigation matches the requested exact order and works on desktop and mobile.
- Header includes Metro Motors context, Light/Dark toggle, Owner badge, user area, and Logout.
- Seven requested screens include the exact major sections, tables, tabs, fields, actions, and placeholder data.
- Layout must remain readable at desktop and mobile widths without horizontal overflow.
- UI remains lightweight, responsive, and professional with reusable patterns.

## What's been implemented

### 2026-09-16
- Replaced the starter splash screen with the full Metro Motors dashboard experience.
- Added Dashboard, Deals, Customer Bills, New Deal, Finances, Follow-ups, and Settings routes.
- Added theme toggle, responsive mobile navigation, searchable Deals and Bills tables, deal deletion demo, New Deal tabs, revenue visualizations, and showroom settings panels.
- Added data-testid attributes to interactive and critical UI elements for reliable testing.
- Verified production build and browser flows at desktop and mobile sizes.
- Fixed shared table search so Deals and Bills rows filter and clear correctly.

### 2026-09-16 — Core data stage
- Added MongoDB collections and CRUD endpoints for deals, vehicles, sellers, buyers, witnesses, payments, documents, and bills.
- Added stable entity IDs, created/updated timestamps, unique indexes, Mongo-safe projections, and relationship validation.
- Deal creation now requires existing vehicle, seller, and buyer references; all child transaction records use the same deal ID.
- Added protected deal deletion so dependent witnesses, payments, documents, and bills cannot become orphaned.
- Verified the full parent/child create, read, update, delete lifecycle and confirmed the existing frontend remains unchanged.

### 2026-09-16 — Connected workflow stage
- Made the existing New Deal screen save and edit one connected workspace across Vehicle, Seller, Buyer, Witnesses, Payments, and Files.
- Added automatic deal IDs, vehicle reuse by chassis/vehicle number, categorized multi-file records, image previews, replacement, and deletion.
- Added generated Seller → Intermediate and Seller → Buyer bills under the same deal, with the buyer-facing bill scoped away from purchase/margin details.
- Connected Bills to live records with preview, edit, print/PDF browser action, and search.
- Connected Finances to recorded payment data for revenue, dues, commission, profit, monthly totals, breakdown, and trend.
- Completed independent end-to-end regression and cleaned temporary records.

## Prioritized backlog

### 2026-09-16 — Live workflow stage (this session)
- Deals page now lists only real saved deals with joined vehicle/seller/buyer plus Total Paid, Pending, Spent, Earned and Commission computed from payment records; search covers deal ID, vehicle, registration, seller and buyer name/phone; Status and Deal Type filters work; View / Edit / Delete (confirmed cascade delete) all use the same Deal ID.
- Dashboard metrics, "Successfully Sold" and "Bikes for Sale" now come from `/api/overview/dashboard`; clicking a sold row opens that deal.
- Added read-only Deal Details page at `/deals/:dealId` (status, totals, vehicle, seller, buyer, witnesses, payment history, documents, bills) with Back / Edit Deal / Generate Bill; New Deal's "View Deal" now navigates there instead of showing a toast.
- Added standalone A4 printable bill document (`BillDocument.js`) with Metro Motors header, bill number, date, Deal ID, vehicle details, parties, payment lines, total, total in words and signature blocks; print CSS prints only the bill.
- Bills page gained a "Generate Bill" deal picker (search saved deals, choose bill type, auto-filled preview) with Print / Save as PDF; generation stays idempotent per deal + bill type.
- Backend additions: `/api/overview/deals`, `/api/overview/dashboard`, `/api/bills/{bill_id}/document`, cascade delete on `/api/deals/{deal_id}?cascade=true`, Indian-format amount-in-words, shared `bill_payment_lines()` helper.
- Fixed a CRITICAL privacy leak: Seller → Buyer bills excluded commission/purchase/margin payments (verified backend + UI, iteration_5 report all green).

## Prioritized backlog

### P0 — Required for a future functional release
- Add real authentication and owner/admin permissions.
- Connect Follow-ups to real pending-payment records (still the only screen on placeholder data).

### P1 — Valuable next phase
- Add editable deal and bill detail views with validation.
- Add date-range and status filtering backed by live financial data.
- Add production object storage for large photo/document files instead of data-URL references.

### P2 — Nice-to-have enhancements
- Add printable/PDF bill output and exportable finance reports.
- Add reminders and communication shortcuts for follow-ups.
- Add dashboard trend comparisons and showroom performance goals.

## Next tasks
1. Connect Dashboard and Deals to the live collections without changing the visual language.
2. Move file references to production object storage when file volume requires it.
3. Add authentication and role-aware access before exposing customer records broadly.