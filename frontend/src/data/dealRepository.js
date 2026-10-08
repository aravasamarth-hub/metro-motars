import { browserDealAdapter } from "./browserDealAdapter";
import { commission, validateDeal } from "@/features/deals/dealModel";

// UI-facing asynchronous contract. A future Supabase adapter implements these
// methods; presentation components never import a storage SDK or API client.
const adapter = browserDealAdapter;
const notify = () => window.dispatchEvent(new Event("metro-deals-changed"));

export const dealRepository = {
  list: () => adapter.list(),
  get: id => adapter.get(id),
  nextBillNumber: () => adapter.nextBillNumber(),
  async save(deal) {
    const errors = validateDeal(deal);
    if (errors.length) throw new Error(errors[0].message);
    const vehicle = {
      ...deal.vehicle,
      vehicle_number: deal.vehicle.registration_number || deal.vehicle.vehicle_number || "",
    };
    const result = await adapter.save({ ...deal, vehicle, commission: commission(deal.payments) });
    notify();
    return result;
  },
  async remove(id) {
    await adapter.remove(id);
    notify();
  },
  async resetDemoData() {
    const result = await adapter.resetDemoData();
    notify();
    return result;
  },
  async clearAllData() {
    const result = await adapter.clearAllData();
    notify();
    return result;
  },
};