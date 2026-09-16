import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, FilePlus2, Pencil, Printer, Search, X } from "lucide-react";
import { generateBill, getBillDocument, listBills, listDealsOverview, updateBill } from "@/metroApi";
import BillDocument from "@/components/BillDocument";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const BILL_TYPES = ["Seller → Intermediate", "Seller → Buyer"];

export default function FunctionalBills() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [picker, setPicker] = useState(false);
  const [deals, setDeals] = useState([]);
  const [dealQuery, setDealQuery] = useState("");
  const [billType, setBillType] = useState(BILL_TYPES[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { listBills().then(setItems).catch(errorValue => setError(errorValue.message)); }, []);
  useEffect(() => { if (picker && !deals.length) listDealsOverview().then(setDeals).catch(errorValue => setError(errorValue.message)); }, [picker, deals.length]);
  useEffect(() => {
    if (!printing || !preview) return;
    const timer = setTimeout(() => { window.print(); setPrinting(false); }, 350);
    return () => clearTimeout(timer);
  }, [printing, preview]);

  const visible = items.filter(item => Object.values(item).join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const visibleDeals = useMemo(() => deals.filter(row => [row.deal_id, row.vehicle_name, row.vehicle_number, row.registration_number, row.seller_name, row.buyer_name].join(" ").toLowerCase().includes(dealQuery.trim().toLowerCase())), [deals, dealQuery]);

  const openBill = async (bill, shouldPrint = false) => {
    try { const doc = await getBillDocument(bill.bill_id); setPreview(doc); setPrinting(shouldPrint); }
    catch (errorValue) { setError(errorValue.message); }
  };

  const generateForDeal = async (dealId) => {
    setBusy(true); setError("");
    try {
      const bill = await generateBill(dealId, billType);
      setItems(await listBills());
      setPicker(false);
      await openBill(bill);
    } catch (errorValue) { setError(errorValue.message); } finally { setBusy(false); }
  };

  const saveEdit = async () => {
    try {
      const updated = await updateBill(editing.bill_id, { price: Number(editing.price), customer: editing.customer, vehicle: editing.vehicle });
      setItems(current => current.map(item => (item.bill_id === updated.bill_id ? updated : item)));
      setEditing(null);
    } catch (errorValue) { setError(errorValue.message); }
  };

  return <>
    <div className="page-header no-print"><div><div className="eyebrow">Billing & records</div><h1 data-testid="page-title">Customer Bills</h1><p>Generated from saved deals. Existing bills stay unchanged until explicitly edited.</p></div>
      <button className="button button-primary" onClick={() => setPicker(true)} data-testid="generate-bill-button"><FilePlus2 size={17}/> Generate Bill</button></div>
    {error && <div className="workflow-message no-print" data-testid="bills-error">{error}</div>}
    <div className="toolbar no-print"><div className="search-field"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search bills, customer or vehicle..." data-testid="bills-search-input"/>{query && <button onClick={() => setQuery("")} aria-label="Clear search" data-testid="bills-clear-search"><X size={14}/></button>}</div></div>
    <div className="table-shell no-print">
      <div className="table-heading"><b>Recent bills <span data-testid="bills-count">{visible.length}</span></b><span>All amounts in INR</span></div>
      <div className="table-scroll"><table><thead><tr>{["Bill No", "Deal", "Type", "Customer", "Vehicle", "Price", "Created", "Actions"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{visible.map(item => <tr key={item.bill_id} data-testid={`bill-row-${item.bill_id}`}>
          <td><b className="link-text">{item.bill_number}</b></td><td>{item.deal_id}</td><td>{item.bill_type}</td><td>{item.customer}</td><td>{item.vehicle}</td><td><b>{money(item.price)}</b></td><td>{item.created_date?.slice(0, 10)}</td>
          <td><div className="row-actions">
            <button onClick={() => openBill(item)} aria-label="View bill" data-testid={`bill-view-${item.bill_id}`}><ArrowUpRight size={15}/></button>
            <button onClick={() => setEditing({ ...item })} aria-label="Edit bill" data-testid={`bill-edit-${item.bill_id}`}><Pencil size={15}/></button>
            <button onClick={() => openBill(item, true)} aria-label="Print bill" data-testid={`bill-print-${item.bill_id}`}><Printer size={15}/></button>
          </div></td></tr>)}
        {!visible.length && <tr><td colSpan={8} data-testid="bills-empty">No bills yet. Use Generate Bill to create one from a saved deal.</td></tr>}</tbody>
      </table></div>
    </div>

    {picker && <div className="bill-preview-backdrop no-print" role="dialog" data-testid="deal-picker-modal"><section className="bill-preview">
      <div className="section-title"><div><div className="eyebrow">Generate bill</div><h2>Select a saved deal</h2></div><button className="icon-button" onClick={() => setPicker(false)} aria-label="Close deal picker" data-testid="close-deal-picker"><X size={18}/></button></div>
      <div className="toolbar"><div className="search-field"><Search size={16}/><input value={dealQuery} onChange={event => setDealQuery(event.target.value)} placeholder="Search deal ID, vehicle number, seller or buyer..." data-testid="deal-picker-search"/></div></div>
      <label className="form-field"><span>Bill type</span><select value={billType} onChange={event => setBillType(event.target.value)} data-testid="deal-picker-bill-type">{BILL_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
      <div className="deal-picker-list" data-testid="deal-picker-list">{visibleDeals.map(row => <button className="deal-picker-row" key={row.deal_id} disabled={busy} onClick={() => generateForDeal(row.deal_id)} data-testid={`deal-picker-${row.deal_id}`}>
        <b>{row.deal_id}</b><span>{row.vehicle_name} · {row.vehicle_number}</span><span>Seller: {row.seller_name || "—"} · Buyer: {row.buyer_name || "—"}</span>
      </button>)}
      {!visibleDeals.length && <p className="empty-note" data-testid="deal-picker-empty">No saved deals match. Create one from New Deal.</p>}</div>
      <button className="button button-secondary" onClick={() => navigate("/new-deal")} data-testid="deal-picker-new-deal">New Deal</button>
    </section></div>}

    {editing && <div className="bill-preview-backdrop no-print" role="dialog" data-testid="bill-edit-modal"><section className="bill-preview">
      <div className="section-title"><div><div className="eyebrow">{editing.bill_type}</div><h2>{editing.bill_number}</h2></div><button className="icon-button" onClick={() => setEditing(null)} aria-label="Close bill editor" data-testid="close-bill-edit"><X size={18}/></button></div>
      <label className="form-field"><span>Customer</span><input value={editing.customer || ""} onChange={event => setEditing({ ...editing, customer: event.target.value })} data-testid="edit-bill-customer"/></label>
      <label className="form-field"><span>Vehicle</span><input value={editing.vehicle || ""} onChange={event => setEditing({ ...editing, vehicle: event.target.value })} data-testid="edit-bill-vehicle"/></label>
      <label className="form-field"><span>Price</span><input type="number" value={editing.price} onChange={event => setEditing({ ...editing, price: event.target.value })} data-testid="edit-bill-price"/></label>
      <button className="button button-primary" onClick={saveEdit} data-testid="save-bill-edit">Save bill</button>
    </section></div>}

    {preview && <div className="bill-preview-backdrop bill-doc-backdrop" role="dialog" data-testid="bill-preview-modal">
      <div className="bill-preview-shell">
        <div className="bill-preview-bar no-print">
          <span>{preview.bill.bill_type} · {preview.bill.bill_number}</span>
          <div className="deal-actions">
            <button className="button button-secondary" onClick={() => window.print()} data-testid="bill-print-action"><Printer size={15}/> Print</button>
            <button className="button button-primary" onClick={() => window.print()} data-testid="generate-bill-pdf"><Printer size={15}/> Save as PDF</button>
            <button className="icon-button" onClick={() => setPreview(null)} aria-label="Close bill preview" data-testid="close-bill-preview"><X size={18}/></button>
          </div>
        </div>
        <div className="bill-print-area" id="print-area"><BillDocument doc={preview}/></div>
      </div>
    </div>}
  </>;
}
