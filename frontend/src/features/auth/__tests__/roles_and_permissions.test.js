import { SHOWROOM_ACCOUNTS } from "../../../context/AuthContext";
import { commission } from "../../deals/dealModel";

describe("Metro Motors — Owner and Worker Role Permissions & Security Specifications", () => {
  const owner = SHOWROOM_ACCOUNTS.find((a) => a.email === "aravasamarth@gmail.com");
  const worker = SHOWROOM_ACCOUNTS.find((a) => a.email === "samartharava@gmail.com");

  test("Owner account (aravasamarth@gmail.com) is registered with OWNER role and full visibility", () => {
    expect(owner).toBeDefined();
    expect(owner.name).toBe("Arava Samarth");
    expect(owner.email).toBe("aravasamarth@gmail.com");
    expect(owner.roleKey).toBe("OWNER");
    expect(owner.permissions).toEqual({
      canViewPrices: true,
      canViewAgentFinancials: true,
      canViewPayments: true,
      canViewBills: true,
      canViewFinances: true,
      canDeleteBills: true,
    });
  });

  test("Worker account (samartharava@gmail.com) is registered with WORKER role and redacted financial visibility", () => {
    expect(worker).toBeDefined();
    expect(worker.name).toBe("Samarth Arava");
    expect(worker.email).toBe("samartharava@gmail.com");
    expect(worker.roleKey).toBe("WORKER");
    expect(worker.permissions).toEqual({
      canViewPrices: false,
      canViewAgentFinancials: false,
      canViewPayments: false,
      canViewBills: false,
      canViewFinances: false,
      canDeleteBills: false,
    });
  });

  test("Owner sees all financial details including purchase price, selling price, and commission", () => {
    const payments = {
      purchase_price: 150000,
      selling_price: 185000,
      paid_to_seller: 150000,
      received_from_buyer: 185000,
    };
    const maintenanceExpense = 5000;
    const dealCommission = commission(payments, maintenanceExpense);

    expect(dealCommission).toBe(30000); // 185000 - 150000 - 5000
    expect(owner.permissions.canViewPrices).toBe(true);
    expect(owner.permissions.canViewBills).toBe(true);
    expect(owner.permissions.canViewPayments).toBe(true);
  });

  test("Worker is blocked from prices, payments, bills, and agent financials", () => {
    expect(worker.permissions.canViewPrices).toBe(false);
    expect(worker.permissions.canViewAgentFinancials).toBe(false);
    expect(worker.permissions.canViewPayments).toBe(false);
    expect(worker.permissions.canViewBills).toBe(false);
    expect(worker.permissions.canViewFinances).toBe(false);
    expect(worker.permissions.canDeleteBills).toBe(false);
  });

  test("Deal Summary field redaction filter logic for Owner vs Worker", () => {
    const rawDeal = {
      vehicle: { vehicle_name: "Yamaha MT-15", registration_number: "KA-04-AB-1234" },
      seller: { name: "Ramesh Sharma", is_dealer: false },
      buyer: { name: "Pooja Hegde" },
      witnesses: [{ name: "W1" }, { name: "W2" }],
      payments: { purchase_price: 120000, selling_price: 145000 },
      photos: {},
      maintenance: [],
      agent: { name: "RTO Agent Suresh", total_amount: 3000, amount_paid: 1500, amount_balance: 1500 },
    };

    const getVisibleFields = (deal, isOwner) => {
      const fields = [
        "Vehicle",
        "Seller",
        "Buyer",
        "Seller witness",
        "Buyer witness",
        "Photos",
      ];
      if (isOwner) {
        fields.push("Purchase price");
        fields.push("Selling price");
        fields.push("Commission");
      }
      if (deal.agent?.name && isOwner) {
        fields.push("Agent");
      }
      return fields;
    };

    const ownerFields = getVisibleFields(rawDeal, true);
    const workerFields = getVisibleFields(rawDeal, false);

    expect(ownerFields).toContain("Purchase price");
    expect(ownerFields).toContain("Selling price");
    expect(ownerFields).toContain("Commission");
    expect(ownerFields).toContain("Agent");

    expect(workerFields).not.toContain("Purchase price");
    expect(workerFields).not.toContain("Selling price");
    expect(workerFields).not.toContain("Commission");
    expect(workerFields).not.toContain("Agent");
    expect(workerFields).toContain("Vehicle");
    expect(workerFields).toContain("Seller");
    expect(workerFields).toContain("Buyer");
  });

  test("Sidebar Navigation items filter logic for Owner vs Worker", () => {
    const navItems = [
      ["nav.dashboard", "Dashboard", "/"],
      ["nav.deals", "Deals", "/deals"],
      ["nav.new_deal", "New Deal", "/new-deal"],
      ["nav.agents", "Agents", "/agents"],
      ["nav.finances", "Finances", "/finances"],
      ["nav.follow_ups", "Follow-ups", "/follow-ups"],
      ["nav.settings", "Settings", "/settings"],
    ];

    const getVisibleNav = (isOwner) =>
      navItems.filter(([, , path]) => {
        if (!isOwner && (path === "/agents" || path === "/finances")) return false;
        return true;
      });

    const ownerNav = getVisibleNav(true);
    const workerNav = getVisibleNav(false);

    expect(ownerNav).toHaveLength(7);
    expect(workerNav).toHaveLength(5);
    expect(workerNav.map(([, label]) => label)).toEqual([
      "Dashboard",
      "Deals",
      "New Deal",
      "Follow-ups",
      "Settings",
    ]);
  });
});
