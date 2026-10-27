import {
  toPublicVehicleListing,
  maskRegistration,
  extractPublicPhotos,
  getInventorySummary,
} from "@/data/publicInventory";
import {
  validateEnquiryForm,
  submitPurchaseEnquiry,
  getWhatsAppEnquiryUrl,
} from "@/data/customerEnquiry";
import { dealRepository } from "@/data/dealRepository";

jest.mock("@/data/dealRepository");

describe("Public Motorcycle Marketplace & Privacy Protection", () => {
  const confidentialDeal = {
    id: "deal-confidential-01",
    status: "In Stock",
    kind: "deal",
    vehicle: {
      vehicle_name: "Royal Enfield Hunter 350 Dapper Ash",
      make: "Royal Enfield",
      model: "Hunter 350",
      year: "2023",
      engine_cc: "349",
      odometer: "14200",
      registration_number: "KA-05-MH-2024",
      color: "Dapper Ash",
      fuel_type: "Petrol",
    },
    // CONFIDENTIAL INTERNAL RECORDS - MUST NEVER BE IN PUBLIC LISTING
    seller: {
      name: "Sandeep R. Kulkarni",
      phone: "9845123456",
      pan_number: "ABCPK9812M",
      id_number: "XXXX-XXXX-6521",
    },
    buyer: {
      name: "Private Buyer Name",
      phone: "9988776655",
    },
    agent: {
      name: "Agent Ramesh",
      total_amount: "2500",
    },
    payments: {
      purchase_price: "135000", // PRIVATE
      selling_price: "154000",   // PUBLIC
      paid_to_seller: "135000",  // PRIVATE
    },
    commission: 19000,           // PRIVATE
    photos: {
      "vehicle-1": { name: "front.jpg", url: "https://example.com/front.jpg" },
      "seller-2": { name: "aadhaar_front.jpg", url: "https://example.com/aadhaar.jpg" },
      "buyer-1": { name: "buyer_photo.jpg", url: "https://example.com/buyer.jpg" },
    },
    notes: "Internal staff note: gross margin ₹19,000.",
  };

  test("toPublicVehicleListing completely strips private financial and seller data", () => {
    const publicBike = toPublicVehicleListing(confidentialDeal);

    expect(publicBike).toBeDefined();
    expect(publicBike.id).toBe("deal-confidential-01");
    expect(publicBike.title).toBe("Royal Enfield Hunter 350 Dapper Ash");
    expect(publicBike.sellingPrice).toBe(154000);

    // CRITICAL PRIVACY CHECKS: Confidential fields must NOT exist on public listing
    expect(publicBike.purchase_price).toBeUndefined();
    expect(publicBike.paid_to_seller).toBeUndefined();
    expect(publicBike.commission).toBeUndefined();
    expect(publicBike.seller).toBeUndefined();
    expect(publicBike.buyer).toBeUndefined();
    expect(publicBike.agent).toBeUndefined();

    // Verify registration number is masked
    expect(publicBike.registrationLocation).toBe("KA-05-****");
  });

  test("extractPublicPhotos picks only vehicle photos and excludes seller/buyer ID documents", () => {
    const photos = extractPublicPhotos(confidentialDeal.photos);

    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe("vehicle-1");
    expect(photos.some((p) => p.id.includes("seller") || p.id.includes("buyer"))).toBe(false);
  });

  test("excludes Sold, Reserved, Draft, Archived, Cancelled deals and vehicles with sold_date from public inventory", () => {
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Sold" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Completed" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Archived" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Reserved" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Draft" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Cancelled" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, status: "Inactive" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, vehicle_status: "reserved" })).toBeNull();
    expect(toPublicVehicleListing({ ...confidentialDeal, vehicle: { ...confidentialDeal.vehicle, sold_date: "2026-10-20" } })).toBeNull();
  });

  test("recursively verifies that synthetic secrets and prohibited keys never appear in public listing", () => {
    const syntheticConfidentialDeal = {
      id: "deal-secret-999",
      status: "Available",
      vehicle: {
        vehicle_name: "Super Meteor 650 Celestial",
        make: "Royal Enfield",
        model: "Super Meteor 650",
        year: 2024,
        engine_cc: 648,
        odometer: 3200,
        registration_number: "KA-01-AB-1234",
        color: "Celestial Blue",
      },
      seller: {
        name: "SYNTHETIC_CONFIDENTIAL_SELLER_NAME",
        phone: "SYNTHETIC_SELLER_PHONE_9988776655",
        pan: "SYNTHETIC_PAN_XYZ12345",
      },
      buyer: {
        name: "SYNTHETIC_CONFIDENTIAL_BUYER_NAME",
        phone: "SYNTHETIC_BUYER_PHONE_9123456780",
      },
      agent: {
        name: "SYNTHETIC_AGENT_NAME",
        commission: "SYNTHETIC_COMMISSION_5000",
      },
      payments: {
        purchase_price: "SYNTHETIC_PURCHASE_PRICE_290000",
        paid_to_seller: "SYNTHETIC_PAID_TO_SELLER_290000",
        selling_price: 350000,
      },
      commission: 60000,
      internal_notes: "SYNTHETIC_STAFF_SECRET_NOTE_MARGIN_60000",
      notes: "SYNTHETIC_DEAL_NOTES_DO_NOT_EXPOSE",
    };

    const publicListing = toPublicVehicleListing(syntheticConfidentialDeal);
    expect(publicListing).not.toBeNull();

    // Check JSON serialization
    const serialized = JSON.stringify(publicListing);

    // List of synthetic secrets that must NEVER leak
    const syntheticSecrets = [
      "SYNTHETIC_CONFIDENTIAL_SELLER_NAME",
      "SYNTHETIC_SELLER_PHONE_9988776655",
      "SYNTHETIC_PAN_XYZ12345",
      "SYNTHETIC_CONFIDENTIAL_BUYER_NAME",
      "SYNTHETIC_BUYER_PHONE_9123456780",
      "SYNTHETIC_AGENT_NAME",
      "SYNTHETIC_COMMISSION_5000",
      "SYNTHETIC_PURCHASE_PRICE_290000",
      "SYNTHETIC_PAID_TO_SELLER_290000",
      "SYNTHETIC_STAFF_SECRET_NOTE_MARGIN_60000",
      "SYNTHETIC_DEAL_NOTES_DO_NOT_EXPOSE",
    ];

    for (const secret of syntheticSecrets) {
      expect(serialized).not.toContain(secret);
    }

    // List of forbidden property keys
    const prohibitedKeys = [
      "purchase_price",
      "paid_to_seller",
      "commission",
      "seller",
      "buyer",
      "agent",
      "internal_notes",
      "notes",
    ];

    for (const key of prohibitedKeys) {
      expect(publicListing[key]).toBeUndefined();
    }
  });

  test("masks registration plates properly", () => {
    expect(maskRegistration("KA-01-EQ-9999")).toBe("KA-01-****");
    expect(maskRegistration("MH-02-AB-1234")).toBe("MH-02-****");
    expect(maskRegistration(null)).toBe("Karnataka Registered");
  });

  test("getInventorySummary calculates real available count and brand breakdown", async () => {
    dealRepository.list.mockResolvedValue([
      confidentialDeal,
      {
        ...confidentialDeal,
        id: "deal-02",
        status: "Available",
        vehicle: { make: "KTM", model: "Duke 390", year: "2024" },
      },
      {
        ...confidentialDeal,
        id: "deal-03",
        status: "Sold", // Must be excluded
      },
      {
        ...confidentialDeal,
        id: "deal-04",
        status: "Reserved", // Must be excluded
      },
    ]);

    const summary = await getInventorySummary();
    expect(summary.totalAvailable).toBe(2);
    expect(summary.byBrand["Royal Enfield"]).toBe(1);
    expect(summary.byBrand["KTM"]).toBe(1);
    expect(summary.byBrand["Reserved"]).toBeUndefined();
  });
});

describe("Customer Purchase Enquiries & Contact Actions", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("validates enquiry form name and phone format", () => {
    const valid = validateEnquiryForm({ name: "Aakash Sharma", phone: "9880012345" });
    expect(Object.keys(valid)).toHaveLength(0);

    const invalidName = validateEnquiryForm({ name: "", phone: "9880012345" });
    expect(invalidName.name).toContain("full name");

    const invalidPhone = validateEnquiryForm({ name: "Aakash", phone: "1234" });
    expect(invalidPhone.phone).toContain("10-digit Indian mobile number");
  });

  test("submits enquiry to backend server successfully when server responds 201", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
      json: async () => ({
        success: true,
        enquiry_id: "ENQ-TEST-1234",
        status: "ACCEPTED",
        persistence: "DURABLE_QUEUE",
        message: "Your purchase enquiry has been registered with our showroom team.",
      }),
    });

    const result = await submitPurchaseEnquiry({
      name: "Rohit Verma",
      phone: "9845012345",
      preferredMethod: "WhatsApp",
      vehicleId: "deal-101",
      vehicleTitle: "Royal Enfield Himalayan 450",
      vehiclePrice: 317000,
    });

    expect(result.success).toBe(true);
    expect(result.isServerDelivered).toBe(true);
    expect(result.enquiryId).toBe("ENQ-TEST-1234");
    expect(result.message).toContain("registered with our showroom team");

    const stored = JSON.parse(localStorage.getItem("metro_customer_enquiries"));
    expect(stored).toHaveLength(1);
    expect(stored[0].serverStatus).toBe("Delivered");
  });

  test("falls back gracefully to offline storage when server is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network connection failed"));

    const result = await submitPurchaseEnquiry({
      name: "Suresh Rao",
      phone: "9845099999",
      preferredMethod: "Phone Call",
      vehicleId: "deal-102",
      vehicleTitle: "KTM 390 Duke",
    });

    expect(result.success).toBe(true);
    expect(result.isServerDelivered).toBe(false);
    expect(result.isLocalOnly).toBe(true);
    expect(result.isFallback).toBe(true);
    expect(result.message).toContain("offline");

    const stored = JSON.parse(localStorage.getItem("metro_customer_enquiries"));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Suresh Rao");
  });

  test("handles rate limiting from server truthfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 429,
      json: async () => ({
        detail: "Too many enquiry requests. Please wait 300 seconds before trying again.",
      }),
    });

    await expect(
      submitPurchaseEnquiry({
        name: "Abusive Sender",
        phone: "9845012345",
        vehicleId: "deal-101",
      })
    ).rejects.toThrow("Too many enquiry requests");
  });

  test("generates pre-filled WhatsApp link with vehicle details", () => {
    const vehicle = {
      id: "V-99",
      year: 2024,
      title: "KTM 390 Duke",
      sellingPrice: 268000,
    };
    const url = getWhatsAppEnquiryUrl(vehicle);

    expect(url).toContain("https://wa.me/919880012345?text=");
    expect(url).toContain("KTM%20390%20Duke");
    expect(url).toContain("2%2C68%2C000");
  });
});
