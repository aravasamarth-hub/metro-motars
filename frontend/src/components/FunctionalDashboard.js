import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Bike, BriefcaseBusiness, Check, ClipboardList, Plus, WalletCards } from "lucide-react";
import { getDashboard } from "@/metroApi";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const day = value => (value ? String(value).slice(0, 10).split("-").reverse().join(" / ") : "—");

function Metric({ label, value, note, icon: Icon, accent, testid, onClick }) {
  return <div className={`metric-card ${accent ? "metric-accent" : ""} ${onClick ? "metric-clickable" : ""}`} onClick={onClick} data-testid={testid}>
    <div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17}/></span></div><strong>{value}</strong><small>{note}</small>
  </div>;
}

export default function FunctionalDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ todays_stock: 0, bikes_in_stock: 0, total_deals: 0, new_deals: 0, deals_closed: 0, net_finances: 0, pending_dues: 0, recently_sold: [], bikes_for_sale: [] });
  const [error, setError] = useState("");
  useEffect(() => { getDashboard().then(setData).catch(errorValue => setError(errorValue.message)); }, []);

  return <>
    <div className="page-header"><div><div className="eyebrow">Showroom overview</div><h1 data-testid="page-title">Good morning, Alex</h1><p>Live numbers from your saved deals, vehicles and payments.</p></div>
      <button className="button button-primary" onClick={() => navigate("/new-deal")} data-testid="dashboard-new-deal-button"><Plus size={17}/> New Deal</button></div>
    {error && <div className="workflow-message" data-testid="dashboard-error">{error}</div>}
    <div className="metric-grid dashboard-metrics">
      <Metric label="Today's Stock" value={data.todays_stock} note="Vehicles added today" icon={Bike} accent testid="metric-todays-stock"/>
      <Metric label="Bikes in Stock" value={data.bikes_in_stock} note="Available for sale" icon={ClipboardList} testid="metric-bikes-in-stock"/>
      <Metric label="Total Deals" value={data.total_deals} note="All saved deals" icon={BriefcaseBusiness} testid="metric-total-deals" onClick={() => navigate("/deals")}/>
      <Metric label="New Deal" value={data.new_deals} note="Drafts awaiting completion" icon={Plus} testid="metric-new-deal" onClick={() => navigate("/new-deal")}/>
      <Metric label="Deals Closed" value={data.deals_closed} note="Completed transactions" icon={Check} testid="metric-deals-closed"/>
      <Metric label="Net Finances" value={money(data.net_finances)} note={`${money(data.pending_dues)} pending dues`} icon={WalletCards} testid="metric-net-finances" onClick={() => navigate("/finances")}/>
    </div>
    <div className="dashboard-grid">
      <section className="content-section">
        <div className="section-title"><h2>Successfully Sold</h2><button className="text-button" onClick={() => navigate("/deals")} data-testid="view-all-sold-button">View all <ArrowUpRight size={15}/></button></div>
        <div className="sold-list" data-testid="dashboard-sold-list">{data.recently_sold.length ? data.recently_sold.map(row => <button className="sold-row sold-row-button" key={row.deal_id} onClick={() => navigate(`/deals/${row.deal_id}`)} data-testid={`dashboard-sold-${row.deal_id}`}>
          <div className="table-bike"><Bike size={15}/></div>
          <div className="sold-info"><b>{row.vehicle_name || "Vehicle"}</b><span>{row.vehicle_number} · {row.deal_id}</span></div>
          <div className="sold-customer"><b>{row.buyer_name || "—"}</b><span>{day(row.updated_date || row.created_date)}</span></div>
          <div className="sold-price"><b>{money(row.earned)}</b><span className="status-pill">{row.status}</span></div>
        </button>) : <p className="empty-note" data-testid="dashboard-sold-empty">No completed deals yet.</p>}</div>
      </section>
      <section className="content-section">
        <div className="section-title"><h2>Bikes for Sale</h2><button className="text-button" onClick={() => navigate("/deals")} data-testid="view-inventory-button">View inventory <ArrowUpRight size={15}/></button></div>
        <div className="stock-list" data-testid="dashboard-stock-list">{data.bikes_for_sale.length ? data.bikes_for_sale.map(vehicle => <div className="inventory-mini" key={vehicle.vehicle_id} data-testid={`dashboard-stock-${vehicle.vehicle_id}`}>
          <div className="mini-bike"><Bike size={19}/></div>
          <div><b>{vehicle.vehicle_name}</b><span>{vehicle.year_of_manufacture} · {vehicle.vehicle_number}</span></div>
          <span className="status-pill gold">{vehicle.vehicle_status || "In Stock"}</span>
        </div>) : <p className="empty-note" data-testid="dashboard-stock-empty">No vehicles in stock yet.</p>}</div>
      </section>
    </div>
  </>;
}
