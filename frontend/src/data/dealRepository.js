import { browserDealAdapter } from "./browserDealAdapter";
import { commission, validateDeal } from "@/features/deals/dealModel";

// UI-facing asynchronous contract. A future Supabase adapter implements these
// five methods; presentation components never import a storage SDK or API client.
const adapter = browserDealAdapter;
const notify = () => window.dispatchEvent(new Event("metro-deals-changed"));
export const dealRepository = {
  list: () => adapter.list(),
  get: id => adapter.get(id),
  nextBillNumber: () => adapter.nextBillNumber(),
  async save(deal) {
    const errors = validateDeal(deal);
    if (errors.length) throw new Error(errors[0].message);
    const result = await adapter.save({ ...deal, commission: commission(deal.payments) });
    notify(); return result;
  },
  async remove(id) { await adapter.remove(id); notify(); },
};