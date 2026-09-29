import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Bike, Pencil, Trash2 } from "lucide-react";
import { commission, displayDate, money } from "./dealModel";
import { StatusBadges } from "./LocalUI";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const DealsTable = ({ deals, prefix = "deal", onDelete, loading, title, action }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tableTitle = title || t("deals.all_deals", "All deals");
  const cols = [
    { key: "bill_no", label: t("table.col_bill_no", "Bill No") },
    { key: "vehicle", label: t("table.col_vehicle", "Vehicle") },
    { key: "seller", label: t("table.col_seller", "Seller") },
    { key: "buyer", label: t("table.col_buyer", "Buyer") },
    { key: "status", label: t("table.col_status", "Status") },
    { key: "commission", label: t("table.col_commission", "Commission") },
    { key: "created_date", label: t("table.col_created_date", "Created Date") },
    { key: "actions", label: t("table.col_actions", "Actions") },
  ];

  return <section className="table-shell local-table-shell"><div className="table-heading"><b>{tableTitle} <span data-testid={`${prefix}-count`}>{deals.length}</span></b>{action}</div>
    <table className="local-deals-table" data-testid={`${prefix}-table`}><thead><tr>{cols.map(col => <th key={col.key}>{col.label}</th>)}</tr></thead><tbody>
      {deals.map(deal => <tr key={deal.id} data-testid={`${prefix}-row-${deal.id}`}>
        <td data-label={cols[0].label}><button className="bill-number-link" onClick={() => navigate(`/deals/${deal.id}`)} data-testid={`${prefix}-bill-${deal.id}`}>{deal.bill_number}</button></td>
        <td data-label={cols[1].label}><div className="table-vehicle"><div className="table-bike"><Bike size={16}/></div><div><b data-testid={`${prefix}-vehicle-${deal.id}`}>{deal.vehicle.vehicle_name}</b><small data-testid={`${prefix}-registration-${deal.id}`}>{deal.vehicle.vehicle_number}</small></div></div></td>
        <td data-label={cols[2].label} data-testid={`${prefix}-seller-${deal.id}`}>{deal.seller.name || "—"}</td>
        <td data-label={cols[3].label} data-testid={`${prefix}-buyer-${deal.id}`}>{deal.buyer.name || t("status.not_assigned", "Not assigned")}</td>
        <td data-label={cols[4].label}><StatusBadges deal={deal} prefix={`${prefix}-${deal.id}`}/></td>
        <td data-label={cols[5].label} className="gold-text" data-testid={`${prefix}-commission-${deal.id}`}>{money(commission(deal.payments))}</td>
        <td data-label={cols[6].label} data-testid={`${prefix}-created-${deal.id}`}>{displayDate(deal.created_at, language)}</td>
        <td data-label={cols[7].label}><div className="row-actions"><button onClick={() => navigate(`/deals/${deal.id}`)} title={t("table.view_deal", "View deal")} aria-label={`View ${deal.bill_number}`} data-testid={`${prefix}-view-${deal.id}`}><ArrowUpRight size={16}/></button><button onClick={() => navigate(`/new-deal/${deal.id}`)} title={t("table.edit_deal", "Edit deal")} aria-label={`Edit ${deal.bill_number}`} data-testid={`${prefix}-edit-${deal.id}`}><Pencil size={15}/></button>{onDelete && <button onClick={() => onDelete(deal)} title={t("table.delete_deal", "Delete deal")} aria-label={`Delete ${deal.bill_number}`} data-testid={`${prefix}-delete-${deal.id}`}><Trash2 size={15}/></button>}</div></td>
      </tr>)}
    </tbody></table>
    {!deals.length && <div className="local-empty" data-testid={`${prefix}-empty`}><Bike size={30}/><h2>{loading ? t("table.loading", "Loading deals…") : t("table.no_deals", "No deals in this view")}</h2>{!loading && <p>{t("table.empty_hint", "Saved deals will appear here.")}</p>}</div>}
  </section>;
};