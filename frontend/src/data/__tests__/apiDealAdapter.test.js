import {
  apiDealAdapter,
  dealToBackendPayload,
  backendRecordToDeal,
  ApiStorageError,
} from "../apiDealAdapter";
import {
  getStorageMode,
  setStorageMode,
  STORAGE_MODES,
  getStorageModeInfo,
} from "../storageMode";

describe("Storage Mode Selection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("defaults to local storage mode", () => {
    expect(getStorageMode()).toBe(STORAGE_MODES.LOCAL);
    const info = getStorageModeInfo();
    expect(info.mode).toBe(STORAGE_MODES.LOCAL);
    expect(info.isRemote).toBe(false);
  });

  test("explicitly sets remote storage mode", () => {
    setStorageMode(STORAGE_MODES.REMOTE);
    expect(getStorageMode()).toBe(STORAGE_MODES.REMOTE);
    const info = getStorageModeInfo();
    expect(info.mode).toBe(STORAGE_MODES.REMOTE);
    expect(info.isRemote).toBe(true);
  });

  test("rejects invalid storage mode", () => {
    expect(() => setStorageMode("cloud-direct")).toThrow("Invalid storage mode");
  });
});

describe("Schema Mapping Functions", () => {
  const sampleFrontendDeal = {
    id: "DEAL-001",
    deal_type: "Buy & Sell",
    status: "Completed",
    bill_number: "Bill-001",
    vehicle: {
      make: "Royal Enfield",
      model: "Himalayan 450",
      registration_number: "KA-01-EQ-9999",
      year: 2024,
    },
    buyer: {
      name: "Samarth",
      phone: "+91 98800 12345",
      address: "Bangalore",
    },
    seller: {
      name: "Rohit",
      phone: "+91 99999 88888",
      address: "Mysore",
    },
    agent: {
      name: "Agent Prakash",
      phone: "+91 91111 22222",
    },
    payments: {
      purchase_price: 250000,
      selling_price: 285000,
      agent_fee: 5000,
    },
    maintenance: [
      { id: "m1", title: "Full Service", cost: 3500 },
    ],
    commission: 26500,
    metadata: { source: "web-portal" },
  };

  test("dealToBackendPayload maps parties and preserves fields", () => {
    const payload = dealToBackendPayload(sampleFrontendDeal);

    expect(payload.id).toBe("DEAL-001");
    expect(payload.deal_type).toBe("Buy & Sell");
    expect(payload.vehicle.make).toBe("Royal Enfield");
    expect(payload.vehicle.model).toBe("Himalayan 450");
    expect(payload.parties).toHaveLength(3);

    const buyerParty = payload.parties.find(p => p.party_type === "BUYER");
    expect(buyerParty.name).toBe("Samarth");

    const sellerParty = payload.parties.find(p => p.party_type === "SELLER");
    expect(sellerParty.name).toBe("Rohit");

    const agentParty = payload.parties.find(p => p.party_type === "AGENT");
    expect(agentParty.name).toBe("Agent Prakash");

    expect(payload.payments.selling_price).toBe(285000);
    expect(payload.maintenance).toHaveLength(1);
    expect(payload.metadata.source).toBe("web-portal");
  });

  test("backendRecordToDeal converts parties back to top-level entities", () => {
    const backendRecord = {
      id: "REC-999",
      deal_type: "Sale",
      status: "Active",
      vehicle: { make: "Yamaha", model: "R3" },
      parties: [
        { name: "John Buyer", party_type: "BUYER", phone: "1234" },
        { name: "Jane Seller", party_type: "SELLER", phone: "5678" },
      ],
      payments: { selling_price: 400000 },
      maintenance: [],
      created_at: "2026-01-01T00:00:00Z",
    };

    const deal = backendRecordToDeal(backendRecord);
    expect(deal.id).toBe("REC-999");
    expect(deal.kind).toBe("deal");
    expect(deal.buyer).toBeDefined();
    expect(deal.buyer.name).toBe("John Buyer");
    expect(deal.seller).toBeDefined();
    expect(deal.seller.name).toBe("Jane Seller");
    expect(deal.agent).toBeNull();
  });
});

describe("API Adapter Operations and Error Handling", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("list() successfully returns mapped deals on 200", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => [
        {
          id: "DEAL-100",
          parties: [{ name: "Buyer A", party_type: "BUYER" }],
          vehicle: { make: "Honda" },
          created_at: "2026-03-01T10:00:00Z",
        },
      ],
    });

    const result = await apiDealAdapter.list();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("DEAL-100");
    expect(result[0].buyer.name).toBe("Buyer A");
    expect(result[0].kind).toBe("deal");
  });

  test("401 Unauthorized raises ApiStorageError with 401 code", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: { get: () => "application/json" },
      json: async () => ({ detail: "Token expired" }),
    });

    await expect(apiDealAdapter.list()).rejects.toThrow(ApiStorageError);
    await expect(apiDealAdapter.list()).rejects.toThrow("Authentication required or session expired");
  });

  test("403 Forbidden raises ApiStorageError with 403 code", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      headers: { get: () => "application/json" },
      json: async () => ({ detail: "Role WORKER cannot delete records" }),
    });

    await expect(apiDealAdapter.remove("DEAL-1")).rejects.toThrow("Permission denied: Role WORKER cannot delete records");
  });

  test("Network connection error raises ApiStorageError with status 0", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Failed to fetch"));

    await expect(apiDealAdapter.get("DEAL-1")).rejects.toThrow(
      "Cannot connect to Metro Motors backend server"
    );
  });

  test("resetDemoData and clearAllData throw safety errors in remote mode", async () => {
    await expect(apiDealAdapter.resetDemoData()).rejects.toThrow("disabled in Remote Storage mode");
    await expect(apiDealAdapter.clearAllData()).rejects.toThrow("disabled in Remote Storage mode");
  });
});
