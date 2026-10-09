import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bike,
  BriefcaseBusiness,
  ClipboardList,
  Plus,
  TrendingUp,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useDeals } from "@/features/deals/useDeals";
import { DealsTable } from "@/features/deals/DealsTable";
import { localDay, money, commission, calculateMaintenanceTotal } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

export default function FunctionalDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { deals, loading, error } = useDeals();
  const [activeFilter, setActiveFilter] = useState("all");

  // Computed showroom analytics
  const todaysDealsCount = useMemo(
    () => deals.filter((d) => localDay(new Date(d.created_at)) === localDay()).length,
    [deals]
  );

  const bikesInStockCount = useMemo(
    () => deals.filter((d) => d.status === "In Stock").length,
    [deals]
  );

  const pendingRcCount = useMemo(
    () => deals.filter((d) => d.rc_status === "Pending").length,
    [deals]
  );

  const soldCount = useMemo(
    () => deals.filter((d) => d.status === "Sold" || d.status === "Out of Stock").length,
    [deals]
  );

  const totalTurnover = useMemo(() => {
    return deals.reduce((acc, d) => acc + (Number(d?.payments?.selling_price) || 0), 0);
  }, [deals]);

  const totalMargin = useMemo(() => {
    return deals.reduce((acc, d) => {
      const comm =
        d.commission != null
          ? d.commission
          : commission(d?.payments || {}, calculateMaintenanceTotal(d?.maintenance));
      return acc + (comm > 0 ? comm : 0);
    }, 0);
  }, [deals]);

  const stockRatio = deals.length ? Math.round((bikesInStockCount / deals.length) * 100) : 0;
  const soldRatio = deals.length ? Math.round((soldCount / deals.length) * 100) : 0;

  // Filtered deals for table
  const filteredDeals = useMemo(() => {
    if (activeFilter === "stock") return deals.filter((d) => d.status === "In Stock");
    if (activeFilter === "rc") return deals.filter((d) => d.rc_status === "Pending");
    if (activeFilter === "sold") return deals.filter((d) => d.status === "Sold" || d.status === "Out of Stock");
    return deals;
  }, [deals, activeFilter]);

  return (
    <div className="local-page dashboard-page-luxury">
      {/* Luxury Showroom Cockpit Header */}
      <div className="page-header dashboard-luxury-header">
        <div>
          <div className="eyebrow dashboard-eyebrow">
            <span className="eyebrow-beacon" />
            <span>{t("dashboard.eyebrow", "SHOWROOM OVERVIEW · REAL-TIME COCKPIT")}</span>
          </div>
          <h1 data-testid="page-title" className="dashboard-hero-title">
            {t("dashboard.title", "Dashboard")}
          </h1>
          <p className="dashboard-hero-subtitle">
            Executive Fleet Management, Deal Closures & RTO Documentation Hub
          </p>
        </div>

        <div className="dashboard-header-ctas" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="button button-secondary dashboard-cta-showcase"
            onClick={() => navigate("/showcase")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(56, 189, 248, 0.15))",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              color: "#f59e0b",
              fontWeight: "600",
              padding: "9px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            data-testid="dashboard-vip-showcase-button"
            title="Open 5-Library VIP Automotive Showcase Portal"
          >
            <Sparkles size={16} />
            <span>VIP Showcase</span>
          </button>
          <button
            type="button"
            className="button button-primary dashboard-cta-new-deal"
            onClick={() => navigate("/new-deal")}
            data-testid="dashboard-new-deal-button"
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>{t("nav.new_deal", "New Deal")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="workflow-message" role="alert" data-testid="dashboard-error">
          {error}
        </div>
      )}

      {/* VIP Showcase Portal Quick Access Banner */}
      <div
        className="showcase-banner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "linear-gradient(90deg, rgba(245, 158, 11, 0.08), rgba(56, 189, 248, 0.08))",
          border: "1px solid rgba(245, 158, 11, 0.22)",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", background: "rgba(245, 158, 11, 0.15)", borderRadius: "8px", color: "#f59e0b" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "inherit" }}>
              Metro Motors VIP Showcase Portal
            </div>
            <div style={{ fontSize: "12px", opacity: 0.75 }}>
              Public luxury client portal powered by shadcn/ui, KokonutUI, Motion, Anime.js v4 &amp; Bklit Charts.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/showcase")}
          style={{
            padding: "7px 16px",
            fontSize: "12px",
            fontWeight: 600,
            borderRadius: "6px",
            background: "#f59e0b",
            color: "#000",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          data-testid="dashboard-banner-showcase-btn"
        >
          <span>View Showcase</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* 4-Card Luxury Automotive Metric Cockpit */}
      <div className="metric-grid local-dashboard-metrics luxury-dashboard-metrics">
        {/* Card 1: Today's Deals (Gold Champagne) */}
        <button
          type="button"
          className="metric-card local-metric luxury-metric-card card-gold"
          onClick={() => navigate("/deals?period=today")}
          data-testid="metric-todays-deals"
        >
          <div className="metric-top">
            <span className="metric-label">{t("dashboard.todays_deals", "Today's Deals")}</span>
            <span className="metric-icon orb-gold">
              <BriefcaseBusiness size={20} />
            </span>
          </div>
          <strong data-testid="metric-todays-deals-value" className="metric-big-num">
            {loading ? "…" : todaysDealsCount}
          </strong>
          <div className="metric-footer-badge gold-chip">
            <Sparkles size={12} />
            <span>{todaysDealsCount > 0 ? `${todaysDealsCount} closed today` : "Showroom active"}</span>
          </div>
          <span className="metric-arrow">
            <ArrowUpRight size={17} />
          </span>
        </button>

        {/* Card 2: Bikes in Stock (Sapphire Indigo) */}
        <button
          type="button"
          className="metric-card local-metric luxury-metric-card card-blue"
          onClick={() => navigate("/deals?status=In+Stock")}
          data-testid="metric-bikes-in-stock"
        >
          <div className="metric-top">
            <span className="metric-label">{t("dashboard.bikes_in_stock", "Bikes in Stock")}</span>
            <span className="metric-icon orb-blue">
              <Bike size={20} />
            </span>
          </div>
          <strong data-testid="metric-bikes-in-stock-value" className="metric-big-num">
            {loading ? "…" : bikesInStockCount}
          </strong>
          <div className="metric-footer-badge blue-chip">
            <CheckCircle2 size={12} />
            <span>{`${stockRatio}% fleet available`}</span>
          </div>
          <span className="metric-arrow">
            <ArrowUpRight size={17} />
          </span>
        </button>

        {/* Card 3: Pending RC Transfers (Amber Sunset) */}
        <button
          type="button"
          className="metric-card local-metric luxury-metric-card card-amber"
          onClick={() => navigate("/deals?rc=Pending")}
          data-testid="metric-pending-rc-transfers"
        >
          <div className="metric-top">
            <span className="metric-label">{t("dashboard.pending_rc", "Pending RC Transfers")}</span>
            <span className="metric-icon orb-amber">
              <ClipboardList size={20} />
            </span>
          </div>
          <strong data-testid="metric-pending-rc-transfers-value" className="metric-big-num">
            {loading ? "…" : pendingRcCount}
          </strong>
          <div className="metric-footer-badge amber-chip">
            <Clock size={12} />
            <span>{pendingRcCount > 0 ? "RTO queue follow-up" : "All transfers clear"}</span>
          </div>
          <span className="metric-arrow">
            <ArrowUpRight size={17} />
          </span>
        </button>

        {/* Card 4: Fleet Valuation & Total Volume (Emerald Green) */}
        <button
          type="button"
          className="metric-card local-metric luxury-metric-card card-emerald"
          onClick={() => navigate("/finances")}
          data-testid="metric-showroom-volume"
        >
          <div className="metric-top">
            <span className="metric-label">Showroom Volume</span>
            <span className="metric-icon orb-emerald">
              <TrendingUp size={20} />
            </span>
          </div>
          <strong className="metric-big-num emerald-text">
            {loading ? "…" : money(totalTurnover)}
          </strong>
          <div className="metric-footer-badge emerald-chip">
            <TrendingUp size={12} />
            <span>{`+${money(totalMargin)} margin`}</span>
          </div>
          <span className="metric-arrow">
            <ArrowUpRight size={17} />
          </span>
        </button>
      </div>

      {/* Fleet Distribution & Quick-Filter Strip */}
      <div className="dashboard-fleet-bar-container">
        <div className="fleet-bar-header">
          <div className="fleet-bar-title">
            <Layers size={14} className="text-amber-400" />
            <span>Fleet Capacity Distribution</span>
          </div>
          <div className="fleet-bar-stats">
            <span className="fleet-stat in-stock-stat">● {bikesInStockCount} In Stock ({stockRatio}%)</span>
            <span className="fleet-stat sold-stat">● {soldCount} Sold ({soldRatio}%)</span>
            <span className="fleet-stat rc-stat">● {pendingRcCount} RC Pending</span>
          </div>
        </div>

        {/* Segmented Visual Progress Track */}
        <div className="fleet-distribution-track">
          <div
            className="fleet-segment segment-stock"
            style={{ width: `${Math.max(stockRatio, 5)}%` }}
            title={`In Stock: ${bikesInStockCount} units`}
          />
          <div
            className="fleet-segment segment-sold"
            style={{ width: `${Math.max(soldRatio, 5)}%` }}
            title={`Sold: ${soldCount} units`}
          />
          <div
            className="fleet-segment segment-rc"
            style={{ width: `${Math.max(deals.length ? (pendingRcCount / deals.length) * 100 : 0, 5)}%` }}
            title={`Pending RC: ${pendingRcCount} units`}
          />
        </div>

        {/* Interactive Filter Pills */}
        <div className="fleet-filter-pills">
          <button
            type="button"
            className={`fleet-filter-pill ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Deals ({deals.length})
          </button>
          <button
            type="button"
            className={`fleet-filter-pill ${activeFilter === "stock" ? "active" : ""}`}
            onClick={() => setActiveFilter("stock")}
          >
            In Stock ({bikesInStockCount})
          </button>
          <button
            type="button"
            className={`fleet-filter-pill ${activeFilter === "rc" ? "active" : ""}`}
            onClick={() => setActiveFilter("rc")}
          >
            RC Pending ({pendingRcCount})
          </button>
          <button
            type="button"
            className={`fleet-filter-pill ${activeFilter === "sold" ? "active" : ""}`}
            onClick={() => setActiveFilter("sold")}
          >
            Sold Fleet ({soldCount})
          </button>
        </div>
      </div>

      {/* Enhanced Recent Deals Table */}
      <div className="dashboard-table-wrapper">
        <DealsTable
          deals={filteredDeals.slice(0, 10)}
          prefix="recent-deal"
          title={t("dashboard.recent_deals", "Recent Deals")}
          loading={loading}
          showCommission={false}
          action={
            <button
              className="text-button luxury-view-all-btn"
              onClick={() => navigate("/deals")}
              data-testid="dashboard-view-all"
            >
              <span>{t("dashboard.view_all", "View all")}</span>
              <ArrowUpRight size={15} />
            </button>
          }
        />
      </div>
    </div>
  );
}