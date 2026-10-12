import { convertToIndianWords } from "../../utils/numberToWords";

// Unit test suite for Seller Bill calculations and data extraction logic
describe("Seller Bill — Vehicle Purchase Receipt Logic & Calculations", () => {
  const calculateSellerBillFinancials = (payments = {}) => {
    const rawPurchase = payments.purchase_price ?? "";
    const rawPaid = payments.paid_to_seller ?? "";

    const purchaseNum = rawPurchase !== "" && !isNaN(Number(rawPurchase)) ? Number(rawPurchase) : 0;
    const paidNum = rawPaid !== "" && !isNaN(Number(rawPaid)) ? Number(rawPaid) : 0;
    const balanceNum = Math.max(0, purchaseNum - paidNum);

    let paymentStatus = "Pending";
    if (purchaseNum > 0 && paidNum >= purchaseNum) {
      paymentStatus = "Paid";
    } else if (paidNum > 0 && paidNum < purchaseNum) {
      paymentStatus = "Partially Paid";
    } else if (purchaseNum === 0 && paidNum > 0) {
      paymentStatus = "Advance Paid";
    }

    const advanceWords = paidNum > 0 ? convertToIndianWords(paidNum) : "Zero Rupees Only";

    return {
      purchaseNum,
      paidNum,
      balanceNum,
      paymentStatus,
      advanceWords,
    };
  };

  test("calculates balance payable accurately: Balance = Purchase Amount - Advance Paid", () => {
    const result = calculateSellerBillFinancials({
      purchase_price: "165000",
      paid_to_seller: "50000",
    });

    expect(result.purchaseNum).toBe(165000);
    expect(result.paidNum).toBe(50000);
    expect(result.balanceNum).toBe(115000);
    expect(result.paymentStatus).toBe("Partially Paid");
    expect(result.advanceWords).toContain("Fifty Thousand Rupees Only");
  });

  test("accurately assigns Paid status when full purchase price is settled", () => {
    const result = calculateSellerBillFinancials({
      purchase_price: "150000",
      paid_to_seller: "150000",
    });

    expect(result.balanceNum).toBe(0);
    expect(result.paymentStatus).toBe("Paid");
  });

  test("accurately assigns Pending status when advance paid is zero", () => {
    const result = calculateSellerBillFinancials({
      purchase_price: "150000",
      paid_to_seller: "0",
    });

    expect(result.balanceNum).toBe(150000);
    expect(result.paymentStatus).toBe("Pending");
    expect(result.advanceWords).toBe("Zero Rupees Only");
  });

  test("extracts only seller purchase information and does not use buyer selling price", () => {
    const deal = {
      id: "deal-001",
      bill_number: "Bill-001",
      seller: {
        name: "Vikram R. Shetty",
        phone: "9845123987",
        id_number: "XXXX-XXXX-4512",
        city: "Bengaluru",
      },
      buyer: {
        name: "Aditya Mohan",
        phone: "9880112233",
      },
      vehicle: {
        vehicle_name: "Royal Enfield Classic 350",
        vehicle_number: "KA-03-JJ-4521",
        engine_number: "RE350J23K98411",
        chassis_number: "ME3J3S5K0PA984112",
      },
      payments: {
        purchase_price: "162000",
        selling_price: "185000",
        paid_to_seller: "162000",
        received_from_buyer: "185000",
      },
    };

    const fin = calculateSellerBillFinancials(deal.payments);

    // The purchase price for the seller must be 1,62,000, NOT the buyer selling price 1,85,000
    expect(fin.purchaseNum).toBe(162000);
    expect(fin.purchaseNum).not.toBe(Number(deal.payments.selling_price));
    expect(fin.paidNum).toBe(162000);
    expect(fin.balanceNum).toBe(0);
    expect(fin.paymentStatus).toBe("Paid");
  });

  test("handles missing or sparse fields gracefully without inventing fake values", () => {
    const sparseDeal = {
      seller: {},
      vehicle: {},
      payments: {},
    };

    const fin = calculateSellerBillFinancials(sparseDeal.payments);

    expect(fin.purchaseNum).toBe(0);
    expect(fin.paidNum).toBe(0);
    expect(fin.balanceNum).toBe(0);
    expect(fin.paymentStatus).toBe("Pending");
  });
});
