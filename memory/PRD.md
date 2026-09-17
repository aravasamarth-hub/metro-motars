# Metro Motors — Product Requirements Document

## Original problem statement
Build Metro Motors from scratch as a responsive motorcycle resale showroom web app.
Original UI direction: professional dark navy/blue-gray theme, gold accents,
DM Sans / Manrope typography, responsive sidebar, Light/Dark toggle. Navigation:
Dashboard, Deals, Bills, New Deal, Finances, Follow-ups, Settings.

## Current approved scope — 2026-09-17
Latest user directive (source of truth, supersedes previous backlog):
> Yes, continue with the frontend UI first, but follow these constraints exactly:
> Do NOT redesign the existing Metro Motors dark blue + gold theme or sidebar.
> Build the complete 6-step New Deal wizard with all fields, 10 vehicle photos,
> 10 seller photos, 10 buyer photos, 2 witness photos, notes, and Save Deal.
> Use browser-local/mock data only for now, but structure the code so it can later
> connect to Supabase without rewriting the UI.
> Add automatic bill number generation (MM-26-0001) in the mock logic.
> Add automatic commission calculation: Commission = Selling Price − Purchase Price.
> Add RC status (Pending / Completed).
> Simplify the Dashboard to only: Today's Deals, Bikes in Stock, Pending RC Transfers.
> Keep the Deals page search and filters.
> Do not implement real authentication, cloud storage, translations, or backend yet.
> Focus on completing the UI architecture cleanly in this phase.

**Critical constraints**
- All active routes are browser-local/mock only. No API calls or external database.
- Do not modify backend, MongoDB schema, Supabase, authentication, cloud storage,
  or translations without new user approval.
- Preserve the existing theme, sidebar, and navigation order.
- User language: English.

## Personas
- Showroom owner: creates purchases/sales, tracks stock and RC transfers.
- Showroom staff: captures vehicle, parties, witnesses, pricing and photo records.
- Role restrictions and authentication are future work, not implemented.

## Current architecture
- React 19 / React Router / Tailwind / existing Shadcn primitives.
- `src/App.js`: unchanged sidebar/theme shell and active browser-local routes.
- `src/App.css` and `src/index.css`: existing design retained.
- `src/features/deals/deals.css`: scoped responsive wizard/list/detail styles.
- `src/features/deals/dealModel.js`: canonical domain model, validation,
  local-date formatting, commission calculation.
- `src/features/deals/fieldConfig.js`: shared field definitions and fixed photo slots.
- `src/data/dealRepository.js`: UI-facing async list/get/nextBillNumber/save/remove.
- `src/data/browserDealAdapter.js`: native browser IndexedDB storage of deal records,
  image Blobs and atomic year-specific sequences. Browser storage, NOT an external DB.
- `src/data/README.md`: adapter contract, photo model, future Supabase boundary.
- `src/features/deals/useDealWizard.js`: step navigation, form state, validation, save.
- Small step components: `VehicleStep`, `PersonStep`, `WitnessStep`, `PaymentStep`,
  `ReviewStep`; shared `DealField`, `PhotoSlots`, `DealSummary`, `DealsTable`, `LocalUI`.
- Existing FastAPI/MongoDB backend and `metroApi.js` remain untouched and dormant
  from the active UI. Environment variables and services are unchanged.
- Legacy `FunctionalBills`, `FunctionalFinances`, and `BillDocument` are retained
  but not routed. Active Bills/Finances use `LocalPreviewPages.jsx` to avoid mixing
  local preview records with live financial records.

## Implemented — 2026-09-17 frontend-local upgrade
### Six-step New Deal
1. **Vehicle:** stock status; RC Pending/Completed; vehicle name, make/model/variant,
   year, color, vehicle/registration numbers and date, engine/chassis numbers,
   engine capacity, fuel, transmission, odometer; ownership, condition, bought/sold
   dates, keys, service history; tax/fitness validity, insurance status/policy/expiry,
   PUC expiry, hypothecation, financier, NOC; 10 vehicle photo slots.
2. **Seller:** name, father/spouse, mobile/alternate, email/address/city/state/PIN,
   ID type/number and PAN; dealer toggle, dealership name/GST/address; 10 photos.
3. **Buyer:** same fields and dealer toggle; 10 photos. Buyer optional In Stock,
   required for Sold deals.
4. **Witnesses:** two optional witnesses, each name, phone, address, ID and one photo.
5. **Payments:** purchase/selling prices, paid to seller/received from buyer,
   method/date/reference/notes; live commission and seller/buyer balances.
6. **Notes & Save:** summary with edit shortcuts, stock/RC status, notes and Save Deal.

### Local workflow behavior
- Required-field and mobile/email/year/date/amount validation, including Sold rules.
- Forward step navigation validates preceding steps; previous navigation retains state.
- Seller required; partial optional parties/witnesses require name and phone.
- Purchase price required; selling price required for Sold; negative commissions
  supported and visibly flagged; price omission displays dash, not false profit.
- Photo support: 32 named slots, local JPG/PNG/WebP selection, preview modal,
  replace/remove; max 10 MB each and decode validation; invalid choices do not
  overwrite the current photo. Object URLs revoked on preview unmount.
- Save atomically persists all form fields and photo Blobs locally; reload/edit
  retains files. No photo reaches a server.
- Bill format `MM-YY-NNNN` (e.g. MM-26-0001), year-specific monotonically increasing
  sequence. Header is a preview; final number allocated atomically on Save.
- Concurrent tabs get unique sequential numbers; edits preserve number/created date;
  deletion never rewinds/reuses a bill number.
- Save navigates to full read-only local Deal Details; supports editing and deletion.
- Discard confirmation for Cancel/back-to-deals/sidebar navigation; beforeunload
  warning for unsaved browser refresh. Unfinished forms are not autosaved.
- Fixed intermittent delete dialog timing/null-ID issue with captured target,
  null guard, and immediate in-flight lock; repeated-click regression passed.

### Dashboard / Deals
- Exactly three Dashboard metrics: Today's Deals, Bikes in Stock, Pending RC Transfers.
- Metric deep links open matching Deals filters; latest ten saved deals in Recent Deals.
- Deals columns: Bill No, Vehicle, Seller, Buyer, Status (stock + RC), Commission,
  Created Date, Actions.
- Search across bill/vehicle/registration/make/model/parties/phones/dealership names.
- Independent Stock (All/In Stock/Sold) and RC (All/Pending/Completed) filters,
  combined filtering, reset, empty states, View/Edit/Delete confirmation.
- Responsive tables become labeled row grids on smaller screens; no page overflow.

### Other routes / intentional limitations
- Bills: local saved bill references only. Official document generation, printing
  and PDF are explicitly paused in this UI phase (legacy functionality preserved in code).
- Finances: read-only browser-local pricing/payment totals, no live finance calls.
- Follow-ups and Settings remain existing placeholder UI; no auth/employee UI added.
- Global browser-local preview indicator. No artificial sample deals seeded by default.
- Browser data is origin/device-specific, not a secure shared ledger, not backed up;
  clearing site storage removes it. Previously saved backend data is not imported.
- No translations, real authentication, permissions or cloud storage implemented.

## Verification
- Optimized frontend build compiled successfully.
- Initial wizard smoke screenshot: `/app/test_reports/wizard-smoke.jpg`.
- `/app/test_reports/iteration_6.json`: core six-step/save/detail/search/filter/delete
  flows, exactly three metrics, all seven routes without `/api` calls, responsive
  layouts at 320/768/1024/1440; one intermittent deletion issue subsequently fixed.
- Main-agent browser regression: create -> save -> cancel delete -> double-confirm
  delete; passed without null-ID error.
- `/app/test_reports/iteration_7.json`: all 32 photo selections/previews/replacements/
  removals/invalid files/save/reload; bill concurrency/edit/non-reuse; commission
  positive/zero/negative/decimal; RC/stock persistence; photo-filled responsive
  layouts at 320/768/1024/1440. Final focused tests 100% passed, no issues.
- Testing agent changed test reports/fixtures only; no application code changes.
- Test data cleaned from the test browser. No auth accounts or credentials created.
- Backend testing intentionally skipped because no backend changes were made.

## Prior work retained — 2026-09-16
- Built original seven-screen dashboard experience with responsive dark/light themes.
- Built MongoDB CRUD for deals/vehicles/sellers/buyers/witnesses/payments/documents/bills,
  relationship validation, linked workspace save/edit, duplicate vehicle checks.
- Previously connected Dashboard/Deals/Bills/Finances to FastAPI; implemented full
  read-only deal detail, cascade deletion and printable A4 bill documents.
- Fixed critical buyer-bill privacy leak by restricting buyer-facing payment lines
  and totals to sale data; intermediate internal bill keeps confidential breakdown.
- Prior backend and buyer-bill regression reports: iteration_4.json, iteration_5.json.
- Those live flows are not active in the new local UI phase; do not reconnect them
  automatically. Backend logic remains available for a later approved integration.

## Prioritized roadmap
### P0 — Current scope
- Implementation and verification complete; no known unresolved core defects.
- Await user review of the complete frontend-only experience.

### P1 — Only after user feedback
- Refine exact domain fields/photo labels if the owner requests changes.
- Optional draft autosave/recovery and local backup/export to protect unfinished work.

### P2 — Deferred; explicit approval required
- Implement a Supabase adapter/server validation without changing step components;
  decide migration of local records and retained backend records separately.
- Secure photo/object storage with authorized private file access.
- Real authentication, owner/employee permissions and Employees settings.
- English/Kannada/Hindi translations and navbar switch.
- Re-enable official bills/printing/PDF against an approved data source, preserving
  the previously verified buyer-bill privacy safeguards.
- Real Follow-ups, financial reports and reminders.

## Next action items
1. User reviews wizard, photo slots, operational Dashboard and Deals UI.
2. Keep all persistence browser-local until expressly authorized otherwise.
3. Suggested next enhancement: autosave unfinished deal drafts.