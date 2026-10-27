import { inventoryLocalRecords, migrateLocalDeals } from "../dealMigration";
import { browserDealAdapter } from "../browserDealAdapter";
import { apiDealAdapter } from "../apiDealAdapter";

jest.mock("../browserDealAdapter");
jest.mock("../apiDealAdapter");

describe("Deal Migration Utility", () => {
  const mockDeals = [
    {
      id: "deal-demo-himalayan-450",
      bill_number: "Bill-001",
      deal_type: "Buy & Sell",
      status: "Completed",
      vehicle: { make: "Royal Enfield", model: "Himalayan 450", registration_number: "KA-01-EQ-9999" },
      payments: { purchase_price: 250000, selling_price: 285000 },
      buyer: { name: "Buyer 1", phone: "1234567890" },
      seller: { name: "Seller 1", phone: "9876543210" },
      photos: { front: { name: "front.jpg" } },
    },
    {
      id: "deal-user-001",
      bill_number: "Bill-002",
      deal_type: "Buy & Sell",
      status: "Completed",
      vehicle: { vehicle_name: "Honda Activa 6G", make: "Honda", model: "Activa 6G", registration_number: "KA-05-AB-1234" },
      payments: { purchase_price: 70000, selling_price: 82000 },
      buyer: { name: "Buyer 2", phone: "9880012345" },
      seller: { name: "Seller 2", phone: "9876543210" },
      photos: {},
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    browserDealAdapter.list.mockResolvedValue(mockDeals);
  });

  test("inventoryLocalRecords separates demo deals from user deals", async () => {
    const inv = await inventoryLocalRecords();
    expect(inv.totalRecords).toBe(2);
    expect(inv.demoRecordsCount).toBe(1);
    expect(inv.userRecordsCount).toBe(1);
    expect(inv.totalPhotosCount).toBe(1);
  });

  test("dryRun validates records and does not call apiDealAdapter.save", async () => {
    const summary = await migrateLocalDeals({ dryRun: true, excludeDemo: true });

    expect(summary.dryRun).toBe(true);
    expect(summary.totalFound).toBe(1); // Excluded demo deal
    expect(summary.valid).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.imported).toBe(0);
    expect(apiDealAdapter.save).not.toHaveBeenCalled();
  });

  test("real migration calls apiDealAdapter.save and tallies imported records", async () => {
    apiDealAdapter.save.mockResolvedValue({ id: "deal-user-001", bill_number: "Bill-002" });

    const summary = await migrateLocalDeals({ dryRun: false, excludeDemo: true });

    expect(summary.dryRun).toBe(false);
    expect(summary.imported).toBe(1);
    expect(apiDealAdapter.save).toHaveBeenCalledTimes(1);
  });

  test("exportLocalDealsJSON serializes valid deals into JSON string", async () => {
    const { exportLocalDealsJSON } = await import("../dealMigration");
    const jsonStr = await exportLocalDealsJSON();
    expect(typeof jsonStr).toBe("string");
    const parsed = JSON.parse(jsonStr);
    expect(parsed.app).toBe("Metro Motors Showroom Atelier");
    expect(parsed.record_count).toBe(2);
    expect(Array.isArray(parsed.deals)).toBe(true);
  });

  test("importDealsFromJSON detects duplicate records and imports valid deals", async () => {
    const { importDealsFromJSON } = await import("../dealMigration");
    browserDealAdapter.save = jest.fn().mockResolvedValue({});

    const importPayload = [
      // Duplicate deal (already in mockDeals: deal-user-001)
      mockDeals[1],
      // New deal
      {
        id: "deal-imported-003",
        bill_number: "MM-26-0003",
        deal_type: "Buy & Sell",
        status: "Draft",
        vehicle: { vehicle_name: "TVS Jupiter 125", registration_number: "KA-03-JJ-9999" },
        buyer: { name: "Buyer 3", phone: "9876543219" },
        seller: { name: "Seller 3", phone: "9123456789" },
      },
    ];

    const result = await importDealsFromJSON(JSON.stringify(importPayload), { overwrite: false });
    expect(result.total).toBe(2);
    expect(result.skipped).toBe(1); // Duplicate skipped
    expect(result.imported).toBe(1); // New deal saved
    expect(browserDealAdapter.save).toHaveBeenCalledTimes(1);
  });
});
