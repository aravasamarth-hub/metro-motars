import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useDeals } from "./useDeals";
import { commission, money } from "./dealModel";
// Legacy API-backed pages remain in components/. These browser-only views avoid
// mixing new local records with live billing or finance records during the UI phase.
export const LocalBills = () => {
  const { deals, loading, error } = useDeals();
  const navigate = useNavigate();
  return <div className="local-page"><div className="page-header"><div><div className="eyebrow">Billing & records</div><h1 data-testid="page-title">Customer Bills</h1></div></div><p className="workflow-message" data-testid="local-bills-notice">Local bill references only. Document generation and printing are paused in this UI phase.</p>{error && <p role="alert" data-testid="local-bills-error">{error}</p>}<div className="local-bill-list">{deals.map(deal => <button key={deal.id} className="local-bill-row" onClick={() => navigate(`/deals/${deal.id}`)} data-testid={`local-bill-${deal.id}`}><b>{deal.bill_number}</b><span>{deal.vehicle.vehicle_name}</span><span>{deal.buyer.name || "In stock"}</span><ArrowUpRight size={17}/></button>)}{!deals.length && <div className="local-empty" data-testid="local-bills-empty">{loading ? "Loading…" : "No saved bill references yet."}</div>}</div></div>;
};
export const LocalFinances = () => {
  const { deals, loading, error } = useDeals();
  const sum = key => deals.reduce((total, d) => total + Number(d.payments[key] || 0), 0);
  const rows = [["Purchase total", sum("purchase_price")], ["Selling total", sum("selling_price")], ["Paid to sellers", sum("paid_to_seller")], ["Received from buyers", sum("received_from_buyer")], ["Commission", deals.reduce((total, d) => total + (commission(d.payments) || 0), 0)]];
  return <div className="local-page"><div className="page-header"><div><div className="eyebrow">Financial overview</div><h1 data-testid="page-title">Finances</h1></div></div><p className="workflow-message" data-testid="local-finances-notice">Preview totals from this browser’s saved deals only.</p>{error && <p role="alert" data-testid="local-finances-error">{error}</p>}<dl className="deal-summary-grid">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd data-testid={`local-finance-${label.toLowerCase().replaceAll(" ", "-")}`}>{loading ? "…" : money(value)}</dd></div>)}</dl></div>;
};