import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Bike, ChevronDown, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { deleteDeal, listDealsOverview } from "@/metroApi";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const day = value => (value ? String(value).slice(0, 10).split("-").reverse().join(" / ") : "—");
const tone = status => (["completed", "sold"].includes(status.toLowerCase()) ? "green" : status.toLowerCase() === "reserved" ? "blue" : "gold");

export default function FunctionalDeals() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All status");
  const [type, setType] = useState("All types");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => listDealsOverview().then(setRows).catch(error => setMessage(error.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const statuses = useMemo(() => ["All status", ...new Set(rows.map(row => row.status).filter(Boolean))], [rows]);
  const types = useMemo(() => ["All types", ...new Set(rows.map(row => row.deal_type).filter(Boolean))], [rows]);
  const visible = rows.filter(row => {
    const haystack = [row.deal_id, row.vehicle_name, row.vehicle_number, row.registration_number, row.seller_name, row.seller_phone, row.buyer_name, row.buyer_phone].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) && (status === "All status" || row.status === status) && (type === "All types" || row.deal_type === type);
  });

  const remove = async (dealId) => {
    if (!window.confirm(`Delete ${dealId} and all its linked witnesses, payments, files and bills?`)) return;
    try { await deleteDeal(dealId); setRows(current => current.filter(row => row.deal_id !== dealId)); setMessage(`${dealId} deleted`); }
    catch (error) { setMessage(error.message); }
  };

  return <>
    <div className="page-header"><div><div className="eyebrow">Deal management</div><h1 data-testid="page-title">Deals</h1><p>Every saved purchase, sale and showroom opportunity.</p></div>
      <button className="button button-primary" onClick={() => navigate("/new-deal")} data-testid="deals-new-deal-button"><Plus size={17}/> New Deal</button></div>
    {message && <div className="workflow-message" data-testid="deals-message">{message}</div>}
    <div className="toolbar">
      <div className="search-field"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search deal ID, vehicle, registration, seller or buyer..." data-testid="deals-search-input"/>{query && <button onClick={() => setQuery("")} aria-label="Clear search" data-testid="deals-clear-search"><X size={14}/></button>}</div>
      <label className="select-field"><span>Status</span><select value={status} onChange={event => setStatus(event.target.value)} data-testid="status-filter">{statuses.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={14}/></label>
      <label className="select-field"><span>Type</span><select value={type} onChange={event => setType(event.target.value)} data-testid="type-filter">{types.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={14}/></label>
    </div>
    <div className="table-shell">
      <div className="table-heading"><b>All deals <span data-testid="deals-count">{visible.length}</span></b><span>Totals calculated from payment records</span></div>
      <div className="table-scroll"><table><thead><tr>{["Deal", "Vehicle", "Parties", "Type", "Status", "Total Paid", "Pending", "Spent", "Earned", "Commission", "Created", "Actions"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{visible.map(row => <tr key={row.deal_id} data-testid={`deal-row-${row.deal_id}`}>
          <td><b className="link-text">{row.deal_id}</b></td>
          <td><div className="table-vehicle"><div className="table-bike"><Bike size={15}/></div><div><b>{row.vehicle_name || "—"}</b><small>{row.vehicle_number}</small></div></div></td>
          <td><div className="table-parties"><span>S: {row.seller_name || "—"}</span><span>B: {row.buyer_name || "—"}</span></div></td>
          <td>{row.deal_type}</td>
          <td><span className={`status-pill ${tone(row.status || "")}`}>{row.status}</span></td>
          <td>{money(row.total_paid)}</td>
          <td>{money(row.pending_amount)}</td>
          <td>{money(row.spent)}</td>
          <td>{money(row.earned)}</td>
          <td className="gold-text">{money(row.commission)}</td>
          <td>{day(row.created_date)}</td>
          <td><div className="row-actions">
            <button onClick={() => navigate(`/deals/${row.deal_id}`)} aria-label="View deal" data-testid={`deal-view-${row.deal_id}`}><ArrowUpRight size={15}/></button>
            <button onClick={() => navigate(`/new-deal/${row.deal_id}`)} aria-label="Edit deal" data-testid={`deal-edit-${row.deal_id}`}><Pencil size={15}/></button>
            <button onClick={() => remove(row.deal_id)} aria-label="Delete deal" data-testid={`deal-delete-${row.deal_id}`}><Trash2 size={15}/></button>
          </div></td>
        </tr>)}
        {!visible.length && <tr><td colSpan={12} data-testid="deals-empty">{loading ? "Loading deals..." : "No deals match this view yet. Create one from New Deal."}</td></tr>}</tbody>
      </table></div>
    </div>
  </>;
}
