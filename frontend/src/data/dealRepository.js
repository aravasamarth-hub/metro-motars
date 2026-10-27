import { browserDealAdapter } from "./browserDealAdapter";
import { apiDealAdapter } from "./apiDealAdapter";
import { getStorageMode, STORAGE_MODES, isRemoteConfigured, getStorageModeInfo } from "./storageMode";
import { commission, calculateMaintenanceTotal, validateDeal } from "@/features/deals/dealModel";

// Select the active storage adapter based on explicit storage mode.
// CRITICAL: When remote mode is selected, operations will NEVER silently fall back
// to browserDealAdapter on failure.
function getActiveAdapter() {
  const mode = getStorageMode();
  if (mode === STORAGE_MODES.REMOTE && isRemoteConfigured()) {
    return apiDealAdapter;
  }
  return browserDealAdapter;
}

const notify = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("metro-deals-changed"));
  }
};

export const dealRepository = {
  getStorageMode: () => getStorageMode(),
  getStorageModeInfo: () => getStorageModeInfo(),
  list: () => getActiveAdapter().list(),
  get: id => getActiveAdapter().get(id),
  nextBillNumber: () => getActiveAdapter().nextBillNumber(),
  async save(deal) {
    const errors = validateDeal(deal);
    if (errors.length) throw new Error(errors[0].message);
    const vehicle = {
      ...deal.vehicle,
      vehicle_number: deal.vehicle.registration_number || deal.vehicle.vehicle_number || "",
    };
    const adapter = getActiveAdapter();
    const result = await adapter.save({
      ...deal,
      vehicle,
      commission: commission(deal.payments, calculateMaintenanceTotal(deal.maintenance)),
    });
    notify();
    return result;
  },
  async remove(id) {
    await getActiveAdapter().remove(id);
    notify();
  },
  async resetDemoData() {
    const result = await getActiveAdapter().resetDemoData();
    notify();
    return result;
  },
  async clearAllData() {
    const result = await getActiveAdapter().clearAllData();
    notify();
    return result;
  },
};