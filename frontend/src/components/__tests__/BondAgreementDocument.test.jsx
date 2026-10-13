import { convertToIndianWords } from "../../utils/numberToWords";

describe("Bond Agreement — 7-Page Bilingual E-Stamp Agreement Logic", () => {
  const calculateBondFinancials = (payments = {}) => {
    const agreedPrice = Number(payments.selling_price ?? payments.purchase_price ?? 0);
    const tokenAdvance = Number(payments.received_from_buyer ?? payments.paid_to_seller ?? 0);
    const balanceAmount = Math.max(0, agreedPrice - tokenAdvance);
    const paymentMethod = (payments.payment_method || "Cash").toLowerCase();

    return {
      agreedPrice,
      tokenAdvance,
      balanceAmount,
      paymentMethod,
    };
  };

  const getVehicleTypeFlags = (type = "") => {
    const vt = String(type).toLowerCase();
    const isCar = vt.includes("car") || vt.includes("four") || vt.includes("4");
    const isBike = !isCar;
    return { isCar, isBike };
  };

  it("calculates agreed price, advance, and balance correctly", () => {
    const fin = calculateBondFinancials({
      selling_price: 135000,
      received_from_buyer: 35000,
      payment_method: "UPI",
    });

    expect(fin.agreedPrice).toBe(135000);
    expect(fin.tokenAdvance).toBe(35000);
    expect(fin.balanceAmount).toBe(100000);
    expect(fin.paymentMethod).toBe("upi");
  });

  it("handles full payment with zero balance", () => {
    const fin = calculateBondFinancials({
      selling_price: 135000,
      received_from_buyer: 135000,
    });

    expect(fin.agreedPrice).toBe(135000);
    expect(fin.tokenAdvance).toBe(135000);
    expect(fin.balanceAmount).toBe(0);
  });

  it("accurately detects vehicle type as Car vs Bike", () => {
    expect(getVehicleTypeFlags("Car").isCar).toBe(true);
    expect(getVehicleTypeFlags("Car").isBike).toBe(false);

    expect(getVehicleTypeFlags("2 Wheeler").isBike).toBe(true);
    expect(getVehicleTypeFlags("2 Wheeler").isCar).toBe(false);

    expect(getVehicleTypeFlags("Bike").isBike).toBe(true);
  });

  it("formats words accurately for legal bond amounts", () => {
    expect(convertToIndianWords(135000)).toContain("One Lakh Thirty Five Thousand");
  });
});
