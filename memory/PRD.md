# Metro Motors — Product Requirements Document

## Original problem statement
Build Metro Motors from scratch as a responsive motorcycle resale showroom web app.
Original UI direction: professional dark navy/blue-gray theme, gold accents,
DM Sans / Manrope typography, responsive sidebar, Light/Dark toggle. Navigation:
Dashboard, Deals, Bills, New Deal, Finances, Follow-ups, Settings.

## Current approved scope — 2026-09-17
Base UI-phase directive (subject to the latest changes below):
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

### Latest approved visual change — 2026-09-17
> add the witness 1 in Seller make it as Seller witness and add the witness 2
> in buyer make it as buyer witness keep the same options in it

- Removed the separate Witnesses navigation step as requested in the visual edit.
- Current wizard has **five steps**: Vehicle, Seller, Buyer, Payments, Notes & Save.
- Seller witness retains Witness 1's name/mobile/address/ID fields and one photo.
- Buyer witness retains Witness 2's identical fields and one photo.
- Data shape/IDs and optional behavior remain unchanged; 32 total photo slots.

**Critical constraints**
- All active routes are browser-local/mock only. No API calls or external database.
- Do not modify backend, MongoDB schema, Supabase, authentication, cloud storage,
  or translations without new user approval.
- Preserve the existing theme, sidebar, and navigation order.
- User language: English.

### Latest required-field change — 2026-09-17
> only Vehicle name is required fields

- **Vehicle name is the sole required field across all five steps**, for In Stock
  and Sold deals. Empty/whitespace name shows `Vehicle name is required.`
- All other vehicle, seller/buyer, witness, dealership, date and payment fields
  are optional, including partially entered party/witness records.
- Format/range validation still applies when optional values are entered.
- Removed all other required markers and conditional Sold/dealer requirements.

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
- Small step components: `VehicleStep`, `PersonStep` (with `WitnessSection`), `PaymentStep`,
  `ReviewStep`; shared `DealField`, `PhotoSlots`, `DealSummary`, `DealsTable`, `LocalUI`.
- Existing FastAPI/MongoDB backend and `metroApi.js` remain untouched and dormant
  from the active UI. Environment variables and services are unchanged.
- Legacy `FunctionalBills`, `FunctionalFinances`, and `BillDocument` are retained
  but not routed. Active Bills/Finances use `LocalPreviewPages.jsx` to avoid mixing
  local preview records with live financial records.

## Implemented — 2026-09-17 frontend-local upgrade
### Five-step New Deal (revised by latest visual change)
1. **Vehicle:** stock status; RC Pending/Completed; vehicle name, make/model/variant,
   year, color, vehicle/registration numbers and date, engine/chassis numbers,
   engine capacity, fuel, transmission, odometer; ownership, condition, bought/sold
   dates, keys, service history; tax/fitness validity, insurance status/policy/expiry,
   PUC expiry, hypothecation, financier, NOC; 10 vehicle photo slots.
2. **Seller:** name, father/spouse, mobile/alternate, email/address/city/state/PIN,
   ID type/number and PAN; dealer toggle, dealership name/GST/address; 10 photos.
   Includes optional **Seller witness** with name, phone, address, ID and one photo.
3. **Buyer:** same optional fields and dealer toggle; 10 photos. Optional for both
   In Stock and Sold deals. Includes optional **Buyer witness** with the same fields
   and one photo.
4. **Payments:** purchase/selling prices, paid to seller/received from buyer,
   method/date/reference/notes; live commission and seller/buyer balances.
5. **Notes & Save:** summary with edit shortcuts, stock/RC status, notes and Save Deal.

### Witness relocation — 2026-09-17
- Seller step edits `witnesses[0]`; Buyer step edits `witnesses[1]`.
- Existing photo keys `witness-1-1` and `witness-2-1` retained; no storage migration.
- Witness validation now runs on its respective party step; payments on step four.
- Review summary has separate Seller witness/Buyer witness rows and correct edit
  shortcuts; Deal Details groups each witness under the corresponding party.
- Navigation/progress/footer updated to five steps; original theme/sidebar unchanged.

### Local workflow behavior
- Only Vehicle name required; format checks for provided mobile/email/year/date/amount values.
- Forward step navigation validates preceding steps; previous navigation retains state.
- All other fields optional; partial parties/witnesses/dealer records do not create
  additional required fields, regardless of stock status.
- Purchase and selling prices optional; negative commissions supported and visibly
  flagged when both prices supplied; price omission displays dash, not false profit.
- Paid/received versus price comparisons run only when that price is provided;
  supplying a paid/received amount alone does not force a price entry.
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
- `/app/test_reports/iteration_8.json`: five-step witness relocation regression,
  per-party validation, empty-witness optional behavior, payment validation,
  distinct witness details/photos through save/reload/edit, summary shortcuts,
  desktop/320px layouts and no API calls. All tests passed; no fixes outstanding.
- `/app/test_reports/iteration_9.json`: sole required Vehicle name / exact error,
  name-only save/reload In Stock and Sold, partial optional people/dealers/witnesses,
  optional field format checks, guarded payment comparisons and missing-price
  commission dash. All focused tests passed; no product defects; test records cleaned.

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
1. User reviews name-only deal creation; additional details can be filled later.
2. Keep all persistence browser-local until expressly authorized otherwise.
3. Suggested next enhancement: autosave unfinished deal drafts.