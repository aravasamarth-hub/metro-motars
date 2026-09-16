import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { generateBill, getDealWorkspace } from "@/metroApi";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const day = value => (value ? String(value).slice(0, 10).split("-").reverse().join(" / ") : "—");
const PAID = ["paid", "completed", "settled"];
const has = (payment, terms) => terms.some(term => (payment.payment_type || "").toLowerCase().includes(term));

const vehicleFields = [["Vehicle Name", "vehicle_name"], ["Make", "make"], ["Model", "model"], ["Year", "year_of_manufacture"], ["Color", "color"], ["Engine Number", "engine_number"], ["Chassis Number", "chassis_number"], ["Vehicle Number", "vehicle_number"], ["Registration Number", "registration_number"], ["Insurance", "insurance"], ["Vehicle Status", "vehicle_status"]];
const personFields = [["Name", "name"], ["Phone", "phone"], ["Address", "address"], ["ID details", "id_details"]];

const ReadOnly = ({ label, value }) => <span className="read-field"><i>{label}</i><b>{value || "—"}</b></span>;

function PersonCard({ title, person, testid }) {
  return <section className="content-section" data-testid={testid}>
    <div className="section-title"><h2>{title}</h2></div>
    {person ? <><div className="read-grid">{personFields.map(([label, key]) => <ReadOnly key={key} label={label} value={person[key]}/>)}</div>
      {person.photo && <img className="read-photo" src={person.photo} alt={`${title} document`} loading="lazy"/>}</> : <p className="empty-note">Not recorded.</p>}
  </section>;
}

export default function DealView() {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { getDealWorkspace(dealId).then(setWorkspace).catch(error => setMessage(error.message)); }, [dealId]);

  const createBill = async (billType) => {
    try { const bill = await generateBill(dealId, billType); setMessage(`${bill.bill_type} bill ${bill.bill_number} saved under ${dealId}. Open Bills to preview or print.`); }
    catch (error) { setMessage(error.message); }
  };

  if (!workspace) return <><div className="page-header"><div><div className="eyebrow">Deal record</div><h1 data-testid="page-title">Deal {dealId}</h1></div></div>{message ? <div className="workflow-message" data-testid="deal-view-error">{message}</div> : <p className="empty-note">Loading deal...</p>}</>;

  const { deal, vehicle, seller, buyer, witnesses = [], payments = [], documents = [], bills = [] } = workspace;
  const paid = payments.filter(payment => PAID.includes((payment.payment_status || "").toLowerCase()));
  const totalPaid = paid.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pending = payments.filter(payment => !PAID.includes((payment.payment_status || "").toLowerCase())).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const spent = paid.filter(payment => has(payment, ["purchase", "buy", "seller", "intermediate"])).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const earned = paid.filter(payment => has(payment, ["sale", "sell", "buyer", "revenue", "income"])).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const commission = paid.filter(payment => has(payment, ["commission"])).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return <>
    <div className="deal-top">
      <button className="back-link" onClick={() => navigate("/deals")} data-testid="deal-view-back"><ArrowLeft size={17}/> Back</button>
      <div><div className="eyebrow">Deal record · read only</div><h1 data-testid="page-title">{deal.deal_id}</h1></div>
      <div className="deal-actions">
        <button className="button button-secondary" onClick={() => navigate(`/new-deal/${deal.deal_id}`)} data-testid="deal-view-edit"><Pencil size={16}/> Edit Deal</button>
        <button className="button button-secondary" onClick={() => createBill("Seller → Intermediate")} data-testid="deal-view-bill-intermediate"><FileText size={16}/> Seller → Intermediate</button>
        <button className="button button-primary" onClick={() => createBill("Seller → Buyer")} data-testid="deal-view-bill-buyer"><FileText size={16}/> Seller → Buyer</button>
      </div>
    </div>
    {message && <div className="workflow-message" data-testid="deal-view-message">{message}</div>}
    <div className="read-summary" data-testid="deal-view-summary">
      <ReadOnly label="Status" value={deal.status}/><ReadOnly label="Deal type" value={deal.deal_type}/>
      <ReadOnly label="Total paid" value={money(totalPaid)}/><ReadOnly label="Pending amount" value={money(pending)}/>
      <ReadOnly label="Purchase / spent" value={money(spent)}/><ReadOnly label="Sale / earned" value={money(earned)}/>
      <ReadOnly label="Commission / margin" value={`${money(commission)} / ${money(earned - spent)}`}/>
      <ReadOnly label="Created" value={day(deal.created_date)}/><ReadOnly label="Updated" value={day(deal.updated_date)}/>
    </div>
    <section className="content-section" data-testid="deal-view-vehicle">
      <div className="section-title"><h2>Vehicle</h2></div>
      <div className="read-grid">{vehicleFields.map(([label, key]) => <ReadOnly key={key} label={label} value={vehicle?.[key]}/>)}</div>
    </section>
    <div className="read-columns"><PersonCard title="Seller" person={seller} testid="deal-view-seller"/><PersonCard title="Buyer" person={buyer} testid="deal-view-buyer"/></div>
    <section className="content-section" data-testid="deal-view-witnesses">
      <div className="section-title"><h2>Witnesses</h2></div>
      {witnesses.length ? witnesses.map((witness, index) => <div className="read-grid read-row" key={witness.witness_id || index}>{personFields.map(([label, key]) => <ReadOnly key={key} label={`${label} ${index + 1}`} value={witness[key]}/>)}</div>) : <p className="empty-note">No witnesses recorded.</p>}
    </section>
    <section className="table-shell" data-testid="deal-view-payments">
      <div className="table-heading"><b>Payment history <span>{payments.length}</span></b><span>{money(totalPaid)} received · {money(pending)} pending</span></div>
      <div className="table-scroll"><table><thead><tr>{["Date", "Person", "Type", "Status", "Notes", "Amount"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{payments.length ? payments.map(payment => <tr key={payment.payment_id}><td>{day(payment.payment_date)}</td><td>{payment.person}</td><td>{payment.payment_type}</td><td><span className={`status-pill ${PAID.includes((payment.payment_status || "").toLowerCase()) ? "green" : "gold"}`}>{payment.payment_status}</span></td><td>{payment.notes || "—"}</td><td><b>{money(payment.amount)}</b></td></tr>) : <tr><td colSpan={6}>No payments recorded.</td></tr>}</tbody></table></div>
    </section>
    <section className="content-section" data-testid="deal-view-documents">
      <div className="section-title"><h2>Photos & documents <span className="status-pill gold">{documents.length}</span></h2></div>
      <div className="document-grid">{documents.map(document => <div className="document-card" key={document.document_id}>{document.mime_type?.startsWith("image/") ? <img src={document.file_reference} loading="lazy" alt={document.file_name || document.category}/> : <div className="document-icon"><FileText size={24}/></div>}<b>{document.file_name || document.category}</b><span>{document.category}</span></div>)}
        {!documents.length && <p className="empty-note">No files linked to this deal.</p>}</div>
    </section>
    <section className="content-section" data-testid="deal-view-bills">
      <div className="section-title"><h2>Generated bills</h2><button className="text-button" onClick={() => navigate("/bills")} data-testid="deal-view-open-bills">Open Bills</button></div>
      {bills.length ? <div className="read-grid">{bills.map(bill => <ReadOnly key={bill.bill_id} label={bill.bill_type} value={`${bill.bill_number} · ${money(bill.price)}`}/>)}</div> : <p className="empty-note">No bills generated yet.</p>}
    </section>
  </>;
}
