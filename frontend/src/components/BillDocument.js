import React from "react";
import SellerBillDocument from "./SellerBillDocument";
import BuyerBillDocument from "./BuyerBillDocument";

export default function BillDocument({ doc, deal }) {
  if (!doc && !deal) return null;
  const targetDeal = deal || doc?.deal || doc;
  const billType = doc?.bill?.bill_type || targetDeal?.bill_type || "";
  const isBuyer =
    billType.includes("Buyer") ||
    targetDeal?.type === "buyer" ||
    Boolean(targetDeal?.buyer_bill_number && !targetDeal?.seller_bill_number);

  if (isBuyer) {
    return <BuyerBillDocument deal={targetDeal} />;
  }
  return <SellerBillDocument deal={targetDeal} />;
}
