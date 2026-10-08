import {
  STEPS,
  DEFAULT_MAINTENANCE_SERVICES,
  calculateMaintenanceTotal,
  commission,
  grossCommission,
} from "../dealModel";

describe("Mechanical Maintenance & Refurbishment Cost Model", () => {
  test("STEPS array has 7 steps with Maintenance placed right beside Seller", () => {
    expect(STEPS).toHaveLength(7);
    expect(STEPS[0]).toBe("Vehicle");
    expect(STEPS[1]).toBe("Seller");
    expect(STEPS[2]).toBe("Maintenance");
    expect(STEPS[3]).toBe("Buyer");
    expect(STEPS[4]).toBe("Agent");
    expect(STEPS[5]).toBe("Payments");
    expect(STEPS[6]).toBe("Notes & Save");
  });

  test("DEFAULT_MAINTENANCE_SERVICES includes all required pre-defined services", () => {
    const serviceIds = DEFAULT_MAINTENANCE_SERVICES.map((s) => s.id);
    expect(serviceIds).toContain("lof");
    expect(serviceIds).toContain("fluids");
    expect(serviceIds).toContain("filters");
    expect(serviceIds).toContain("spark_plug");
    expect(serviceIds).toContain("belts_hoses");
    expect(serviceIds).toContain("tires");
    expect(serviceIds).toContain("brakes");
    expect(serviceIds).toContain("battery");

    const lofService = DEFAULT_MAINTENANCE_SERVICES.find((s) => s.id === "lof");
    expect(lofService.name).toBe("Lube, Oil, and Filter (LOF)");
  });

  test("calculateMaintenanceTotal correctly calculates enabled services expense", () => {
    const testMaintenance = {
      services: [
        { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
        { id: "spark_plug", name: "Spark Plug", price: "250", enabled: true },
        { id: "custom_buffing", name: "Silencer Buffing", price: "500", enabled: true, isCustom: true },
        { id: "tires", name: "Tires", price: "2200", enabled: false }, // disabled, should be excluded
      ],
    };

    const total = calculateMaintenanceTotal(testMaintenance);
    expect(total).toBe(1600); // 850 + 250 + 500 = 1600
  });

  test("commission accurately deducts maintenance cost from gross commission", () => {
    const payments = {
      purchase_price: "135000",
      selling_price: "154000",
    };
    const maintenanceExpense = 1600;

    const gross = grossCommission(payments);
    expect(gross).toBe(19000); // 154000 - 135000

    const net = commission(payments, maintenanceExpense);
    expect(net).toBe(17400); // 19000 - 1600
  });
});
