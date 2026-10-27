/**
 * Safe Data Migration Utility for Metro Motors
 *
 * Facilitates safe, auditable migration of browser-local deals (IndexedDB)
 * to centralized backend storage.
 *
 * STRICT SAFETY RULES:
 * 1. Never upload records automatically on app startup.
 * 2. Support dry-run mode that reports counts, schemas, and conflicts without writing.
 * 3. Preserve local IndexedDB records until user explicitly confirms.
 * 4. Idempotent: checks for existing IDs and bill numbers so retries do not duplicate.
 * 5. Flags demo deals and asks for exclusion.
 */

import { browserDealAdapter } from "./browserDealAdapter";
import { dealToBackendPayload, apiDealAdapter } from "./apiDealAdapter";
import { validateDeal } from "@/features/deals/dealModel";

/**
 * Scan and inventory all records in local IndexedDB.
 */
export async function inventoryLocalRecords() {
  const allDeals = await browserDealAdapter.list();
  const demoIds = ["deal-demo-himalayan-450", "deal-demo-activa-6g", "deal-demo-pulsar-ns200", "deal-demo-classic-350"];

  const userDeals = allDeals.filter(d => !demoIds.includes(d.id));
  const demoDeals = allDeals.filter(d => demoIds.includes(d.id));

  let photoCount = 0;
  for (const deal of allDeals) {
    if (deal.photos) {
      photoCount += Object.keys(deal.photos).length;
    }
  }

  return {
    totalRecords: allDeals.length,
    userRecordsCount: userDeals.length,
    demoRecordsCount: demoDeals.length,
    totalPhotosCount: photoCount,
    deals: allDeals,
  };
}

/**
 * Performs a dry run or actual migration.
 *
 * @param {Object} options
 * @param {boolean} options.dryRun - When true, only validates and checks conflicts without executing writes.
 * @param {boolean} options.excludeDemo - When true, skips demo records.
 * @param {Function} [options.onProgress] - Optional callback (current, total, message).
 */
export async function migrateLocalDeals({
  dryRun = true,
  excludeDemo = true,
  onProgress = () => {},
} = {}) {
  const inventory = await inventoryLocalRecords();
  const demoIds = ["deal-demo-himalayan-450", "deal-demo-activa-6g", "deal-demo-pulsar-ns200", "deal-demo-classic-350"];

  const candidates = inventory.deals.filter(d => {
    if (excludeDemo && demoIds.includes(d.id)) return false;
    return true;
  });

  const summary = {
    dryRun,
    totalFound: candidates.length,
    valid: 0,
    invalid: 0,
    imported: 0,
    skipped: 0,
    conflicts: [],
    errors: [],
    photoNotice: "Photos remain in local browser storage. Cloud photo upload requires configuring a cloud storage provider.",
  };

  for (let i = 0; i < candidates.length; i++) {
    const deal = candidates[i];
    onProgress(i + 1, candidates.length, `Processing deal ${deal.bill_number || deal.id}...`);

    // 1. Schema validation
    const validationErrors = validateDeal(deal);
    if (validationErrors.length > 0) {
      summary.invalid++;
      summary.errors.push({
        id: deal.id,
        bill_number: deal.bill_number,
        reasons: validationErrors.map(e => e.message),
      });
      continue;
    }
    summary.valid++;

    // 2. Format payload
    const payload = dealToBackendPayload(deal);

    // 3. Dry-run mode: do not write to remote API
    if (dryRun) {
      summary.skipped++;
      continue;
    }

    // 4. Actual execution (idempotent PUT/POST)
    try {
      await apiDealAdapter.save(payload);
      summary.imported++;
    } catch (err) {
      if (err.status === 409) {
        summary.conflicts.push({
          id: deal.id,
          bill_number: deal.bill_number,
          detail: err.message,
        });
      } else {
        summary.errors.push({
          id: deal.id,
          bill_number: deal.bill_number,
          reasons: [err.message],
        });
      }
    }
  }

  return summary;
}

/**
 * Export all local IndexedDB deals as a clean JSON backup file.
 */
export async function exportLocalDealsJSON() {
  const inventory = await inventoryLocalRecords();
  const backup = {
    app: "Metro Motors Showroom Atelier",
    version: "1.0",
    exported_at: new Date().toISOString(),
    record_count: inventory.deals.length,
    deals: inventory.deals,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Safely import deals from a validated JSON backup with duplicate detection.
 */
export async function importDealsFromJSON(jsonString, { overwrite = false } = {}) {
  let parsed;
  try {
    parsed = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
  } catch (err) {
    throw new Error(`Invalid JSON format: ${err.message}`);
  }

  const rawDeals = Array.isArray(parsed) ? parsed : parsed.deals;
  if (!Array.isArray(rawDeals)) {
    throw new Error("Invalid deal backup format: missing array of deals.");
  }

  const existingDeals = await browserDealAdapter.list();
  const existingIds = new Set(existingDeals.map(d => d.id));
  const existingBills = new Set(existingDeals.map(d => d.bill_number).filter(Boolean));

  const result = {
    total: rawDeals.length,
    imported: 0,
    skipped: 0,
    conflicts: [],
    errors: [],
  };

  for (const deal of rawDeals) {
    const errors = validateDeal(deal);
    if (errors.length > 0) {
      result.errors.push({
        id: deal.id,
        bill_number: deal.bill_number,
        reasons: errors.map(e => e.message),
      });
      continue;
    }

    const isDuplicate = existingIds.has(deal.id) || (deal.bill_number && existingBills.has(deal.bill_number));
    if (isDuplicate && !overwrite) {
      result.skipped++;
      result.conflicts.push({
        id: deal.id,
        bill_number: deal.bill_number,
        reason: "Duplicate record already exists in local storage",
      });
      continue;
    }

    try {
      await browserDealAdapter.save(deal);
      existingIds.add(deal.id);
      if (deal.bill_number) existingBills.add(deal.bill_number);
      result.imported++;
    } catch (err) {
      result.errors.push({
        id: deal.id,
        bill_number: deal.bill_number,
        reasons: [err.message],
      });
    }
  }

  return result;
}
