import {
  calculateBuyerBillFinancials,
  maskAadhaar,
  formatINR,
} from "../BuyerBillDocument";

describe("Buyer Bill — Vehicle Sale Receipt Unit Tests", () => {
  const mockDeal = {
    id: "deal-101",
    bill_number: "MM-2026-B001",
    created_at: "2026-03-15T10:30:00Z",
    deliveryDate: "2026-03-20",
    seller: {
      name: "Ramesh Gowda",
      phone: "9845112233",
      purchase_price: 150000, // Private seller purchase amount - MUST NEVER BE SHOWN
    },
    buyer: {
      name: "Anand Kumar",
      father_name: "Rajappa K",
      phone: "9876543210",
      alternate_phone: "9876500000",
      email: "anand.kumar@example.com",
      address: "#42, 3rd Main, MCC 'B' Block",
      city: "Davangere",
      state: "Karnataka",
      pincode: "577004",
      id_number: "1234 5678 9012",
      pan_number: "ABCDE1234F",
    },
    vehicle: {
      vehicle_name: "Royal Enfield Classic 350",
      make: "Royal Enfield",
      model: "Classic 350 Dark Stealth",
      year: "2023",
      mfg_month: "05",
      registration_number: "KA-17-EX-2456",
      registration_date: "12/06/2023",
      engine_number: "J3-568910",
      chassis_number: "ME3J356891012345",
      tax: "LTT Paid",
      insurance: "Valid up to 11/06/2027",
      fitness: "Valid up to 2038",
      noc: "Clear / Obtained",
    },
    payments: {
      purchase_price: 150000, // Seller purchase price (confidential)
      selling_price: 195000, // Buyer selling price
      discount: 5000,
      additional_charges: 2500,
      received_from_buyer: 100000,
      payment_method: "Bank Transfer / NEFT",
      transaction_reference: "NEFT-MM-987654",
    },
    witnesses: [
      { name: "Seller Witness", phone: "9000000001" },
      { name: "Suresh Patil", phone: "9880112233", address: "Vidyanagar, Davangere", id_number: "9876 5432 1098" },
    ],
  };

  test("calculates financials correctly: Final Invoice = Selling Price - Discount + Additional Charges", () => {
    const fin = calculateBuyerBillFinancials(mockDeal.payments);

    expect(fin.sellingPrice).toBe(195000);
    expect(fin.discount).toBe(5000);
    expect(fin.additionalCharges).toBe(2500);
    // 195,000 - 5,000 + 2,500 = 192,500
    expect(fin.finalInvoiceAmount).toBe(192500);
    expect(fin.totalReceived).toBe(100000);
    // 192,500 - 100,000 = 92,500
    expect(fin.remainingBalance).toBe(92500);
    expect(fin.paymentStatus).toBe("Partially Paid");
    expect(fin.amountInWords).toContain("One Lakh Ninety Two Thousand Five Hundred Rupees Only");
  });

  test("marks status as Paid when received equals or exceeds final invoice amount", () => {
    const payments = {
      selling_price: 200000,
      discount: 0,
      additional_charges: 0,
      received_from_buyer: 200000,
    };
    const fin = calculateBuyerBillFinancials(payments);

    expect(fin.finalInvoiceAmount).toBe(200000);
    expect(fin.remainingBalance).toBe(0);
    expect(fin.paymentStatus).toBe("Paid");
  });

  test("marks status as Pending when zero payments have been received", () => {
    const payments = {
      selling_price: 200000,
      discount: 10000,
      additional_charges: 0,
      received_from_buyer: 0,
    };
    const fin = calculateBuyerBillFinancials(payments);

    expect(fin.finalInvoiceAmount).toBe(190000);
    expect(fin.remainingBalance).toBe(190000);
    expect(fin.paymentStatus).toBe("Pending");
  });

  test("handles advance_amount or received_from_buyer interchangeably without double counting", () => {
    const paymentsWithAdvance = {
      selling_price: 150000,
      discount: 0,
      additional_charges: 0,
      advance_amount: 50000,
    };
    const fin = calculateBuyerBillFinancials(paymentsWithAdvance);

    expect(fin.totalReceived).toBe(50000);
    expect(fin.remainingBalance).toBe(100000);
    expect(fin.paymentStatus).toBe("Partially Paid");
  });

  test("masks Aadhaar correctly for privacy protection", () => {
    expect(maskAadhaar("1234 5678 9012")).toBe("•••• •••• 9012");
    expect(maskAadhaar("123456789012")).toBe("•••• •••• 9012");
    expect(maskAadhaar("")).toBe("—");
    expect(maskAadhaar(undefined)).toBe("—");
  });

  test("formats currency in Indian Rupees format", () => {
    expect(formatINR(192500)).toBe("₹1,92,500.00");
    expect(formatINR(0)).toBe("₹0.00");
    expect(formatINR(5000.5)).toBe("₹5,000.50");
  });

  test("verifies that calculateBuyerBillFinancials uses selling_price and never purchase_price", () => {
    const dualPricePayments = {
      purchase_price: 120000, // Seller purchase price
      selling_price: 185000,  // Buyer sale price
      received_from_buyer: 85000,
    };
    const fin = calculateBuyerBillFinancials(dualPricePayments);

    expect(fin.sellingPrice).toBe(185000);
    expect(fin.finalInvoiceAmount).toBe(185000);
    expect(fin.remainingBalance).toBe(100000);
    expect(fin.amountInWords).toContain("One Lakh Eighty Five Thousand Rupees Only");
  });
});
