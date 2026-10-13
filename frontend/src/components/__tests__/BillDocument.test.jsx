import React from "react";
import BillDocument from "../BillDocument";
import SellerBillDocument from "../SellerBillDocument";
import BuyerBillDocument from "../BuyerBillDocument";

describe("BillDocument Routing Logic", () => {
  const sampleSellerDeal = {
    id: "deal-seller-1",
    bill_number: "MM-26-0001",
    seller: { name: "Ramesh Sharma", phone: "9876543210" },
    vehicle: { vehicle_name: "Royal Enfield Classic 350", registration_number: "KA01AB1234" },
    payments: { purchase_price: 150000, paid_to_seller: 150000 },
  };

  const sampleBuyerDeal = {
    id: "deal-buyer-1",
    buyer_bill_number: "BB-26-0001",
    buyer: { name: "Anand Kumar", phone: "9845012345" },
    vehicle: { vehicle_name: "Yamaha MT-15", registration_number: "KA04XY9999" },
    payments: { selling_price: 140000, received_from_buyer: 140000 },
  };

  test("returns null if doc and deal are empty", () => {
    expect(BillDocument({})).toBeNull();
  });

  test("renders SellerBillDocument by default for seller deals", () => {
    const element = BillDocument({ deal: sampleSellerDeal });
    expect(element.type).toBe(SellerBillDocument);
    expect(element.props.deal).toBe(sampleSellerDeal);
  });

  test("renders BuyerBillDocument when deal has buyer_bill_number", () => {
    const element = BillDocument({ deal: sampleBuyerDeal });
    expect(element.type).toBe(BuyerBillDocument);
    expect(element.props.deal).toBe(sampleBuyerDeal);
  });

  test("renders BuyerBillDocument when doc has bill_type containing Buyer", () => {
    const doc = {
      bill: { bill_type: "Seller → Buyer", bill_number: "BB-002" },
      deal: sampleSellerDeal,
    };
    const element = BillDocument({ doc });
    expect(element.type).toBe(BuyerBillDocument);
  });
});
