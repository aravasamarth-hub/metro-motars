import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
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
  ShieldCheck,
  BarChart3,
  Flame,
} from "lucide-react";
import { useDeals } from "@/features/deals/useDeals";
import { DealsTable } from "@/features/deals/DealsTable";
import { localDay, money, commission, calculateMaintenanceTotal, VEHICLE_CATEGORIES } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

// 1. shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// 2. KokonutUI components
import FloatingPaths from "@/components/kokonut/BackgroundPaths";
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev) components
import { MotionCounter } from "@/components/motion/MotionCounter";
import { MotionReveal } from "@/components/motion/MotionReveal";

// 4. Anime.js v4 components
import AnimePulseBeacon from "@/components/anime/AnimePulseBeacon";
import AnimeDealJourney from "@/components/anime/AnimeDealJourney";

// 5. Bklit data visualizations
import { FleetValuationAreaChart } from "@/components/bklit/FleetValuationAreaChart";
import { InspectionRadialGauge } from "@/components/bklit/InspectionRadialGauge";
import { InventoryDistributionBarChart } from "@/components/bklit/InventoryDistributionBarChart";

export default function FunctionalDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { deals, loading, error } = useDeals();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dashboardTab, setDashboardTab] = useState("overview");

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
    let list = deals;
    if (activeFilter === "stock") list = list.filter((d) => d.status === "In Stock");
    else if (activeFilter === "rc") list = list.filter((d) => d.rc_status === "Pending");
    else if (activeFilter === "sold") list = list.filter((d) => d.status === "Sold" || d.status === "Out of Stock");

    if (selectedCategory !== "all") {
      list = list.filter((d) => (d.vehicle?.vehicle_type || "4 Wheeler Car") === selectedCategory);
    }
    return list;
  }, [deals, activeFilter, selectedCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="local-page dashboard-page-luxury"
    >
      {/* ── Luxury Showroom Cockpit Hero (With KokonutUI Ambient Floating Paths) ── */}
      <div className="luxury-hero-container relative">
        <FloatingPaths position={1} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {/* 4. Anime.js Live Showroom Pulse Beacon */}
              <AnimePulseBeacon color="gold" size="md" label="LIVE SHOWROOM ACTIVE" />

              {/* 1. shadcn/ui Badges */}
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                5 LIBRARIES INTEGRATED
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                IndexedDB Local Vault
              </Badge>
            </div>

            <h1 data-testid="page-title" className="text-3xl font-extrabold tracking-tight text-white font-manrope">
              {t("dashboard.title", "Dashboard")}
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Executive Fleet Cockpit · Powered by <span className="text-amber-400 font-semibold">shadcn/ui</span>,{" "}
              <span className="text-sky-400 font-semibold">KokonutUI</span>,{" "}
              <span className="text-indigo-400 font-semibold">Motion</span>,{" "}
              <span className="text-emerald-400 font-semibold">Anime.js v4</span> &amp;{" "}
              <span className="text-cyan-400 font-semibold">Bklit</span>
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-lg shadow-amber-500/5"
              onClick={() => navigate("/showcase")}
              data-testid="dashboard-vip-showcase-button"
            >
              <Sparkles size={15} />
              <span>VIP Showcase</span>
            </button>

            {/* 2. KokonutUI ParticleButton */}
            <ParticleButton
              onClick={() => navigate("/new-deal")}
              data-testid="dashboard-new-deal-button"
              className="luxury-particle-cta px-5 py-2.5 text-xs font-bold"
            >
              <Plus size={16} strokeWidth={2.6} />
              <span>{t("nav.new_deal", "New Deal")}</span>
            </ParticleButton>
          </div>
        </div>
      </div>

      {error && (
        <div className="workflow-message" role="alert" data-testid="dashboard-error">
          {error}
        </div>
      )}

      {/* ── 4-Card Luxury Automotive Metric Cockpit (KokonutUI SpotlightCard + Motion Counters) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Today's Deals (Champagne Gold Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.18)"
          onClick={() => navigate("/deals?period=today")}
          className="p-5 cursor-pointer hover:border-amber-500/50 transition-all border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="metric-todays-deals"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {t("dashboard.todays_deals", "Today's Deals")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <BriefcaseBusiness size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-manrope mt-3 mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={todaysDealsCount} />}
            <span className="text-xs text-neutral-500 font-normal">deals</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
            <span className="text-amber-400 flex items-center gap-1 font-medium text-[11px]">
              <Sparkles size={12} />
              {todaysDealsCount > 0 ? `${todaysDealsCount} closed today` : "Showroom ready"}
            </span>
            <ArrowUpRight size={15} className="text-neutral-500" />
          </div>
        </SpotlightCard>

        {/* Card 2: Bikes in Stock (Sapphire Indigo Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.18)"
          onClick={() => navigate("/deals?status=In+Stock")}
          className="p-5 cursor-pointer hover:border-sky-500/50 transition-all border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="metric-bikes-in-stock"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {t("dashboard.bikes_in_stock", "Bikes in Stock")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
              <Bike size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-manrope mt-3 mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={bikesInStockCount} />}
            <span className="text-xs text-neutral-500 font-normal">units</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
            <span className="text-sky-400 flex items-center gap-1 font-medium text-[11px]">
              <CheckCircle2 size={12} />
              {`${stockRatio}% fleet available`}
            </span>
            <ArrowUpRight size={15} className="text-neutral-500" />
          </div>
        </SpotlightCard>

        {/* Card 3: Pending RC Transfers (Amber Sunset Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(249, 115, 22, 0.18)"
          onClick={() => navigate("/deals?rc=Pending")}
          className="p-5 cursor-pointer hover:border-amber-500/50 transition-all border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="metric-pending-rc-transfers"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {t("dashboard.pending_rc", "Pending RC Transfers")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <ClipboardList size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-manrope mt-3 mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={pendingRcCount} />}
            <span className="text-xs text-neutral-500 font-normal">in RTO queue</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
            <span className="text-amber-500 flex items-center gap-1 font-medium text-[11px]">
              <Clock size={12} />
              {pendingRcCount > 0 ? "RTO transfer tracking" : "All transfers clear"}
            </span>
            <ArrowUpRight size={15} className="text-neutral-500" />
          </div>
        </SpotlightCard>

        {/* Card 4: Fleet Valuation & Volume (Emerald Green Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          onClick={() => navigate("/finances")}
          className="p-5 cursor-pointer hover:border-emerald-500/50 transition-all border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="metric-showroom-volume"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Showroom Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-manrope mt-3 mb-2 flex items-baseline gap-1">
            {loading ? "…" : money(totalTurnover)}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
            <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
              <TrendingUp size={12} />
              +{money(totalMargin)} margin
            </span>
            <ArrowUpRight size={15} className="text-neutral-500" />
          </div>
        </SpotlightCard>
      </div>

      {/* ── 4. Anime.js v4 Automotive Lifecycle Deal Pipeline ── */}
      <div className="mb-6">
        <AnimeDealJourney currentStage={3} onStageClick={(st) => navigate(`/deals`)} />
      </div>

      {/* ── Fleet Segment Horizontal Filter Chips (8 Categories) ── */}
      <div className="category-filter-bar mb-4" data-testid="dashboard-category-filter-bar">
        <button
          type="button"
          className={`category-filter-chip ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
          data-testid="dash-filter-all"
        >
          <span>All Segments</span>
          <span className="chip-count">{deals.length}</span>
        </button>
        {VEHICLE_CATEGORIES.map((cat) => {
          const count = deals.filter(
            (d) => (d.vehicle?.vehicle_type || "4 Wheeler Car") === cat.label
          ).length;
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-filter-chip ${selectedCategory === cat.label ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.label)}
              data-testid={`dash-filter-${cat.id}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── 1. shadcn/ui Tabs (Cockpit Views: Overview, Live Charts, Fleet Table) ── */}
      <Tabs defaultValue="overview" className="w-full mb-6" onValueChange={setDashboardTab}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList className="bg-neutral-900/80 border border-neutral-800 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950 font-bold text-xs rounded-lg px-4 py-2">
              Cockpit &amp; Analytics
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950 font-bold text-xs rounded-lg px-4 py-2">
              Bklit Charts Suite
            </TabsTrigger>
            <TabsTrigger value="deals" className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950 font-bold text-xs rounded-lg px-4 py-2">
              Fleet Table ({filteredDeals.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Quick Filter:</span>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === "all" ? "bg-amber-500 text-neutral-950" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("stock")}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === "stock" ? "bg-amber-500 text-neutral-950" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              In Stock
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("rc")}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === "rc" ? "bg-amber-500 text-neutral-950" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              RC Pending
            </button>
          </div>
        </div>

        {/* Tab 1: Overview (Combined Visuals + Recent Table) */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          {/* 5. Bklit Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FleetValuationAreaChart />
            </div>
            <div>
              <InspectionRadialGauge score={98.6} />
            </div>
          </div>

          {/* Deals Table */}
          <div className="dashboard-table-wrapper rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-xl overflow-hidden p-1">
            <DealsTable
              deals={filteredDeals.slice(0, 8)}
              prefix="recent-deal"
              title={t("dashboard.recent_deals", "Live Showroom Deals")}
              loading={loading}
              showCommission={false}
              action={
                <button
                  className="text-button text-amber-400 font-bold flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                  onClick={() => navigate("/deals")}
                  data-testid="dashboard-view-all"
                >
                  <span>{t("dashboard.view_all", "View all")}</span>
                  <ArrowUpRight size={15} />
                </button>
              }
            />
          </div>
        </TabsContent>

        {/* Tab 2: Full Bklit Charts Suite */}
        <TabsContent value="charts" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FleetValuationAreaChart />
            <InventoryDistributionBarChart />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InspectionRadialGauge score={98.6} />
            <SpotlightCard className="p-6 border-neutral-800 bg-neutral-900/80">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Fleet Turnaround Velocity
              </div>
              <div className="text-3xl font-extrabold text-white font-manrope">
                5.8 <span className="text-sm font-normal text-neutral-400">days avg</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                Fastest clearance: Royal Enfield (4 days) &amp; KTM Duke (3.5 days).
              </p>
            </SpotlightCard>
            <SpotlightCard className="p-6 border-neutral-800 bg-neutral-900/80">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Customer Satisfaction
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-manrope">
                4.9 <span className="text-sm font-normal text-neutral-400">/ 5.0</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                Across 140+ verified RTO RC card transfers and delivery milestones.
              </p>
            </SpotlightCard>
          </div>
        </TabsContent>

        {/* Tab 3: Fleet Table Only */}
        <TabsContent value="deals" className="mt-0">
          <div className="dashboard-table-wrapper rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-xl overflow-hidden p-1">
            <DealsTable
              deals={filteredDeals}
              prefix="recent-deal"
              title="All Showroom Deals"
              loading={loading}
              showCommission={true}
              action={
                <ParticleButton
                  onClick={() => navigate("/new-deal")}
                  className="luxury-particle-cta text-xs px-3 py-1.5"
                >
                  <Plus size={14} />
                  <span>Create Deal</span>
                </ParticleButton>
              }
            />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}