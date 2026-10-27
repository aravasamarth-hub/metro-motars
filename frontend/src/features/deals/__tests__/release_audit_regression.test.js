import {
  commission,
  grossCommission,
  calculateMaintenanceTotal,
  validateStep,
  emptyDeal,
} from "../dealModel";
import { photoSlots } from "../fieldConfig";
import { SHOWROOM_ACCOUNTS } from "../../../context/AuthContext";

describe("Metro Motors — Second-Stage Release Audit Regression Suite", () => {
  describe("1. Financial Calculations & Boundary Cases", () => {
    test("calculates gross margin and net commission with maintenance deduction", () => {
      const payments = { purchase_price: "200000", selling_price: "235000" };
      const maintenanceCost = 5000;

      const gross = grossCommission(payments);
      const net = commission(payments, maintenanceCost);

      expect(gross).toBe(35000);
      expect(net).toBe(30000); // 235000 - 200000 - 5000
    });

    test("handles zero profit and zero maintenance correctly", () => {
      const payments = { purchase_price: "150000", selling_price: "150000" };
      expect(grossCommission(payments)).toBe(0);
      expect(commission(payments, 0)).toBe(0);
    });

    test("handles negative commission when repair costs exceed margin", () => {
      const payments = { purchase_price: "100000", selling_price: "110000" };
      const maintenanceCost = 15000;
      expect(commission(payments, maintenanceCost)).toBe(-5000);
    });

    test("handles decimal currency precision correctly without IEEE-754 drift", () => {
      const payments = { purchase_price: "185000.50", selling_price: "215000.75" };
      const maintenanceCost = 9550.20;

      const net = commission(payments, maintenanceCost);
      // 215000.75 - 185000.50 = 30000.25 - 9550.20 = 20450.05
      expect(net).toBe(20450.05);
    });

    test("returns null for blank or missing purchase/selling prices", () => {
      expect(grossCommission({ purchase_price: "", selling_price: "200000" })).toBeNull();
      expect(grossCommission({ purchase_price: "200000", selling_price: "" })).toBeNull();
      expect(commission({ purchase_price: "", selling_price: "" })).toBeNull();
    });

    test("calculateMaintenanceTotal sums only enabled services", () => {
      const maintenance = {
        services: [
          { id: "lof", price: "850", enabled: true },
          { id: "fluids", price: "400", enabled: false },
          { id: "brakes", price: "650", enabled: true },
        ],
      };
      expect(calculateMaintenanceTotal(maintenance)).toBe(1500);
    });
  });

  describe("2. Step Validation Rules & Boundary Enforcement", () => {
    test("rejects negative numbers in payment step", () => {
      const deal = emptyDeal();
      deal.payments.purchase_price = "-5000";
      deal.payments.selling_price = "200000";

      const errors = validateStep(deal, 5);
      expect(errors["payments.purchase_price"]).toBe("Enter an amount between 0 and 999,999,999.");
    });

    test("rejects payment to seller exceeding purchase price", () => {
      const deal = emptyDeal();
      deal.payments.purchase_price = "100000";
      deal.payments.paid_to_seller = "150000";

      const errors = validateStep(deal, 5);
      expect(errors["payments.paid_to_seller"]).toBe("Cannot exceed the purchase price.");
    });

    test("rejects received from buyer exceeding selling price", () => {
      const deal = emptyDeal();
      deal.payments.selling_price = "200000";
      deal.payments.received_from_buyer = "250000";

      const errors = validateStep(deal, 5);
      expect(errors["payments.received_from_buyer"]).toBe("Cannot exceed the selling price.");
    });

    test("rejects sold date before bought date in vehicle step", () => {
      const deal = emptyDeal();
      deal.vehicle.vehicle_name = "Royal Enfield Himalayan";
      deal.vehicle.bought_date = "2026-05-10";
      deal.vehicle.sold_date = "2026-05-01";

      const errors = validateStep(deal, 0);
      expect(errors["vehicle.sold_date"]).toBe("Sold date cannot be before bought date.");
    });

    test("rejects invalid Indian phone numbers", () => {
      const deal = emptyDeal();
      deal.seller.phone = "12345"; // too short, doesn't start with 6-9
      const errors = validateStep(deal, 1);
      expect(errors["seller.phone"]).toBe("Enter a valid 10-digit Indian mobile number.");
    });
  });

  describe("3. Photo Slot Registry & Quota Integrity", () => {
    test("defines exact vehicle photo slots required by automotive inspection", () => {
      expect(photoSlots.vehicle).toEqual([
        "Front view",
        "Rear view",
        "Left side",
        "Right side",
        "Odometer",
        "Engine number",
        "Chassis number",
        "Insurance document",
      ]);
      expect(photoSlots.vehicle).toHaveLength(8);
    });

    test("defines comprehensive party verification document slots", () => {
      expect(photoSlots.seller).toContain("Aadhaar front");
      expect(photoSlots.seller).toContain("PAN card");
      expect(photoSlots.seller).toContain("RC front");
      expect(photoSlots.buyer).toContain("Buyer portrait");
    });
  });

  describe("4. Role-Based Permissions & Persona Security Matrix", () => {
    test("Owner has full unshielded access to financial figures and destructive actions", () => {
      const owner = SHOWROOM_ACCOUNTS.find((a) => a.roleKey === "OWNER");
      expect(owner).toBeDefined();
      expect(owner.permissions.canViewPrices).toBe(true);
      expect(owner.permissions.canViewAgentFinancials).toBe(true);
      expect(owner.permissions.canViewPayments).toBe(true);
      expect(owner.permissions.canViewBills).toBe(true);
      expect(owner.permissions.canViewFinances).toBe(true);
      expect(owner.permissions.canDeleteBills).toBe(true);
    });

    test("Worker account has all financial and destructive permissions shielded", () => {
      const worker = SHOWROOM_ACCOUNTS.find((a) => a.roleKey === "WORKER");
      expect(worker).toBeDefined();
      expect(worker.permissions.canViewPrices).toBe(false);
      expect(worker.permissions.canViewAgentFinancials).toBe(false);
      expect(worker.permissions.canViewPayments).toBe(false);
      expect(worker.permissions.canViewBills).toBe(false);
      expect(worker.permissions.canViewFinances).toBe(false);
      expect(worker.permissions.canDeleteBills).toBe(false);
    });
  });
});
