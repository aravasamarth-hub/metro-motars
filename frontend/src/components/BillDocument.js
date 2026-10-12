import React from "react";
import SellerBillDocument from "./SellerBillDocument";

export default function BillDocument({ doc, deal }) {
  if (!doc && !deal) return null;
  return <SellerBillDocument deal={deal || doc?.deal || doc} />;
}
