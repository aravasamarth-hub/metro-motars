import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Bike, Pencil, Trash2 } from "lucide-react";
import { commission, displayDate, money } from "./dealModel";
import { StatusBadges } from "./LocalUI";
export const DealsTable = ({ deals, prefix = "deal", onDelete, loading, title = "All deals", action }) => {
  const navigate = useNavigate();
  const cols = ["Bill No", "Vehicle", "Seller", "Buyer", "Status", "Commission", "Created Date", "Actions"];
  return <section className="table-shell local-table-shell"><div className="table-heading"><b>{title} <span data-testid={`${prefix}-count`}>{deals.length}</span></b>{action}</div>
    <table className="local-deals-table" data-testid={`${prefix}-table`}><thead><tr>{cols.map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>
      {deals.map(deal => <tr key={deal.id} data-testid={`${prefix}-row-${deal.id}`}>
        <td data-label="Bill No"><button className="bill-number-link" onClick={() => navigate(`/deals/${deal.id}`)} data-testid={`${prefix}-bill-${deal.id}`}>{deal.bill_number}</button></td>
        <td data-label="Vehicle"><div className="table-vehicle"><div className="table-bike"><Bike size={16}/></div><div><b data-testid={`${prefix}-vehicle-${deal.id}`}>{deal.vehicle.vehicle_name}</b><small data-testid={`${prefix}-registration-${deal.id}`}>{deal.vehicle.vehicle_number}</small></div></div></td>
        <td data-label="Seller" data-testid={`${prefix}-seller-${deal.id}`}>{deal.seller.name || "—"}</td>
        <td data-label="Buyer" data-testid={`${prefix}-buyer-${deal.id}`}>{deal.buyer.name || "Not assigned"}</td>
        <td data-label="Status"><StatusBadges deal={deal} prefix={`${prefix}-${deal.id}`}/></td>
        <td data-label="Commission" className="gold-text" data-testid={`${prefix}-commission-${deal.id}`}>{money(commission(deal.payments))}</td>
        <td data-label="Created Date" data-testid={`${prefix}-created-${deal.id}`}>{displayDate(deal.created_at)}</td>
        <td data-label="Actions"><div className="row-actions"><button onClick={() => navigate(`/deals/${deal.id}`)} title="View deal" aria-label={`View ${deal.bill_number}`} data-testid={`${prefix}-view-${deal.id}`}><ArrowUpRight size={16}/></button><button onClick={() => navigate(`/new-deal/${deal.id}`)} title="Edit deal" aria-label={`Edit ${deal.bill_number}`} data-testid={`${prefix}-edit-${deal.id}`}><Pencil size={15}/></button>{onDelete && <button onClick={() => onDelete(deal)} title="Delete deal" aria-label={`Delete ${deal.bill_number}`} data-testid={`${prefix}-delete-${deal.id}`}><Trash2 size={15}/></button>}</div></td>
      </tr>)}
    </tbody></table>
    {!deals.length && <div className="local-empty" data-testid={`${prefix}-empty`}><Bike size={30}/><h2>{loading ? "Loading deals…" : "No deals in this view"}</h2>{!loading && <p>Saved deals will appear here.</p>}</div>}
  </section>;
};