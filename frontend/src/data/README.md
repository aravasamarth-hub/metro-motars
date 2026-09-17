# Frontend-only deal architecture

The active application uses **browser-local records only**. No Supabase client,
FastAPI endpoint, authentication, or cloud storage is invoked by the active routes.
Legacy API client and legacy Bills/Finances components are retained but not routed.

## Boundaries
- `features/deals/dealModel.js`: serializable domain model, defaults, validation,
  commission and date formatting. UI uses string input values; commission is numeric.
- `features/deals/fieldConfig.js`: shared field definitions and 32 named photo slots.
- `data/dealRepository.js`: async UI contract `list`, `get`, `nextBillNumber`, `save`,
  `remove`; performs validation and emits changes for dashboard/list refresh.
- `data/browserDealAdapter.js`: native browser IndexedDB implementation. Records and
  photo Blobs are local to this browser and origin. No external database exists.
- `features/deals/useDealWizard.js`: navigation, edits, validation and saving state.
- Five wizard steps: vehicle, seller (with Seller witness), buyer (with Buyer
  witness), payments, review. `witnesses[0]` and `witnesses[1]` and their original
  photo keys are retained, so saved records require no migration after relocation.

## Required fields
Vehicle name is the only required field for every stock status. Other details,
including partial party/witness/dealership records and all pricing, are optional.
Optional values still undergo format/range checks when supplied; payment comparisons
are only enforced when the corresponding purchase/selling price is supplied.

## Bill numbering
`MM-YY-NNNN`, e.g. `MM-26-0001`. The header is a **preview**, not a reservation.
The year-specific sequence and the record commit in one browser transaction so
parallel saves cannot duplicate numbers. Editing preserves the original number
and created date; deletion does not rewind the sequence. New years start at 0001.

## Photos
10 vehicle + 10 seller + 10 buyer + 1 per witness = 32 fixed slots. JPG/PNG/WebP,
10 MB per image maximum; browser-decodable files only. Each value is
`{name, type, size, blob}`. PhotoPreview also accepts `{url}` for a later adapter.
Uploads here mean **local selection**, not cloud transfer. Object URLs are revoked
when previews unmount. Files persist only on Save Deal; failed saves keep the form.

## Future adapter (not implemented)
A Supabase adapter should implement the same contract, map form values to server
types, allocate bill numbers atomically server-side, and convert selected photo
Blobs to storage references/authorized URLs. Server-side validation, authorization,
private-object access, and row-level policies belong in that future phase. The step
components should not need replacing. Local browser records are not secure shared
storage or a production ledger and are not automatically migrated to a future server.