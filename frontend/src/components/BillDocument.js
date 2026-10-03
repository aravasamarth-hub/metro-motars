import React from "react";
import SaleAgreementBill from "./SaleAgreementBill";

export default function BillDocument({ doc, deal }) {
  if (!doc && !deal) return null;
  return <SaleAgreementBill doc={doc} deal={deal || doc?.deal} />;
}
