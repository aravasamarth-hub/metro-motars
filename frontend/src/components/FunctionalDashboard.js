import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Bike, BriefcaseBusiness, ClipboardList, Plus } from "lucide-react";
import { useDeals } from "@/features/deals/useDeals";
import { DealsTable } from "@/features/deals/DealsTable";
import { localDay } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

export default function FunctionalDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { deals, loading, error } = useDeals();
  const metrics = [
    { label: t("dashboard.todays_deals", "Today's Deals"), value: deals.filter(d => localDay(new Date(d.created_at)) === localDay()).length, icon: BriefcaseBusiness, id: "todays-deals", link: "/deals?period=today" },
    { label: t("dashboard.bikes_in_stock", "Bikes in Stock"), value: deals.filter(d => d.status === "In Stock").length, icon: Bike, id: "bikes-in-stock", link: "/deals?status=In+Stock" },
    { label: t("dashboard.pending_rc", "Pending RC Transfers"), value: deals.filter(d => d.rc_status === "Pending").length, icon: ClipboardList, id: "pending-rc-transfers", link: "/deals?rc=Pending" },
  ];
  return <div className="local-page"><div className="page-header"><div><div className="eyebrow">{t("dashboard.eyebrow", "Showroom overview")}</div><h1 data-testid="page-title">{t("dashboard.title", "Dashboard")}</h1></div><button className="button button-primary" onClick={() => navigate("/new-deal")} data-testid="dashboard-new-deal-button"><Plus size={17}/> {t("nav.new_deal", "New Deal")}</button></div>
    {error && <div className="workflow-message" role="alert" data-testid="dashboard-error">{error}</div>}
    <div className="metric-grid local-dashboard-metrics">{metrics.map(({ label, value, icon: Icon, id, link }, i) => <button key={id} className={`metric-card local-metric ${i === 0 ? "metric-accent" : ""}`} onClick={() => navigate(link)} data-testid={`metric-${id}`}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={19}/></span></div><strong data-testid={`metric-${id}-value`}>{loading ? "…" : value}</strong><span className="metric-arrow"><ArrowUpRight size={17}/></span></button>)}</div>
    <DealsTable deals={deals.slice(0, 10)} prefix="recent-deal" title={t("dashboard.recent_deals", "Recent Deals")} loading={loading} action={<button className="text-button" onClick={() => navigate("/deals")} data-testid="dashboard-view-all">{t("dashboard.view_all", "View all")} <ArrowUpRight size={15}/></button>}/>
  </div>;
}