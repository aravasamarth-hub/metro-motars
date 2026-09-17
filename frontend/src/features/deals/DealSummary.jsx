import { Pencil } from "lucide-react";
import { commission, money } from "./dealModel";
import { DealField } from "./DealField";
export const DealSummary = ({ deal, edit }) => {
  const rows = [
    ["Vehicle", `${deal.vehicle.vehicle_name || "—"} · ${deal.vehicle.vehicle_number || "—"}`, 0],
    ["Seller", deal.seller.is_dealer ? `${deal.seller.name} · ${deal.seller.dealer_name}` : deal.seller.name || "—", 1],
    ["Buyer", deal.buyer.name || "Not assigned", 2],
    ["Seller witness", deal.witnesses[0].name || "Not recorded", 1],
    ["Buyer witness", deal.witnesses[1].name || "Not recorded", 2],
    ["Purchase price", money(deal.payments.purchase_price), 3], ["Selling price", money(deal.payments.selling_price), 3],
    ["Commission", money(commission(deal.payments)), 3], ["Photos", `${Object.values(deal.photos).filter(Boolean).length} / 32 attached`, 0],
  ];
  return <dl className="deal-summary-grid">{rows.map(([label, value, step]) => <div key={label}><dt>{label}</dt><dd data-testid={`summary-${label.toLowerCase().replaceAll(" ", "-")}`}>{value}{edit && <button type="button" className="icon-button" onClick={() => edit(step)} title={`Edit ${label}`} aria-label={`Edit ${label}`} data-testid={`summary-edit-${label.toLowerCase().replaceAll(" ", "-")}`}><Pencil size={13}/></button>}</dd></div>)}</dl>;
};
export const ReviewStep = ({ deal, update, edit }) => <>
  <section className="wizard-group"><div className="section-title"><h2>Deal summary</h2><span className="status-pill gold" data-testid="summary-bill-number">{deal.bill_number}</span></div><DealSummary deal={deal} edit={edit}/></section>
  <section className="wizard-group"><div className="form-grid wizard-fields">
    <DealField config={{ key: "status", label: "Stock status", type: "select", options: ["In Stock", "Sold"] }} prefix="review" value={deal.status} onChange={update}/>
    <DealField config={{ key: "rc_status", label: "RC transfer status", type: "select", options: ["Pending", "Completed"] }} prefix="review" value={deal.rc_status} onChange={update}/>
  </div></section>
  <section className="wizard-group"><DealField config={{ key: "notes", label: "Notes & remarks", type: "textarea" }} prefix="deal" value={deal.notes} onChange={update}/></section>
</>;