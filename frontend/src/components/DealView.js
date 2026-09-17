import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Pencil } from "lucide-react";
import { dealRepository } from "@/data/dealRepository";
import { DealSummary } from "@/features/deals/DealSummary";
import { StatusBadges } from "@/features/deals/LocalUI";
import { dealerFields, paymentFields, personFields, vehicleGroups, witnessFields } from "@/features/deals/fieldConfig";
import { PhotoSlots } from "@/features/deals/PhotoSlots";
import { displayDate } from "@/features/deals/dealModel";
const ReadGroup = ({ title, fields, value, prefix }) => <section className="wizard-group"><div className="section-title"><h2>{title}</h2></div><dl className="local-read-grid">{fields.map(f => <div key={f.key}><dt>{f.label}</dt><dd data-testid={`read-${prefix}-${f.key.replaceAll("_", "-")}`}>{value[f.key] || "—"}</dd></div>)}</dl></section>;
export default function DealView() {
  const { dealId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; setDeal(null); setError(""); dealRepository.get(dealId).then(value => { if (!active) return; if (!value) setError("This deal is not saved in this browser."); else setDeal(value); }).catch(e => active && setError(e.message)); return () => { active = false; }; }, [dealId]);
  return <div className="local-page"><button className="back-link wizard-back" onClick={() => navigate("/deals")} data-testid="deal-view-back"><ArrowLeft size={16}/> Deals</button><div className="page-header"><div><div className="eyebrow">Deal record</div><h1 data-testid="page-title">{deal?.bill_number || "Deal details"}</h1></div>{deal && <button className="button button-primary" onClick={() => navigate(`/new-deal/${deal.id}`)} data-testid="deal-view-edit"><Pencil size={16}/> Edit Deal</button>}</div>
    {error ? <div className="workflow-message" role="alert" data-testid="deal-view-error">{error}</div> : !deal ? <p role="status" data-testid="deal-view-loading">Loading deal…</p> : <>
      {state?.saved && <div className="local-success" role="status" data-testid="deal-saved-message"><CheckCircle2 size={18}/>{state.saved} saved on this browser. No data was sent to a server.</div>}
      <div className="local-record-meta"><StatusBadges deal={deal} prefix="detail"/><span data-testid="deal-created-date">Created {displayDate(deal.created_at)}</span></div>
      <DealSummary deal={deal}/>
      {vehicleGroups.map(group => <ReadGroup key={group.title} title={group.title} fields={group.fields} value={deal.vehicle} prefix="vehicle"/>)}
      <PhotoSlots group="vehicle" photos={deal.photos} readOnly/>
      {["seller", "buyer"].map((group, i) => <div key={group}><ReadGroup title={group === "seller" ? "Seller" : "Buyer"} fields={deal[group].is_dealer ? [...personFields, ...dealerFields] : personFields} value={deal[group]} prefix={group}/><PhotoSlots group={group} photos={deal.photos} readOnly/><ReadGroup title={group === "seller" ? "Seller witness" : "Buyer witness"} fields={witnessFields} value={deal.witnesses[i]} prefix={`witness-${i + 1}`}/><PhotoSlots group={`witness-${i + 1}`} photos={deal.photos} readOnly/></div>)}
      <ReadGroup title="Payments" fields={paymentFields} value={deal.payments} prefix="payments"/>
      <section className="wizard-group"><div className="section-title"><h2>Notes & remarks</h2></div><p className="local-notes" data-testid="deal-view-notes">{deal.notes || "No notes recorded."}</p></section>
    </>}
  </div>;
}