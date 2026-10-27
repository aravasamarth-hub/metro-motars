import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Bike,
  BriefcaseBusiness,
  ClipboardList,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useDeals } from "@/features/deals/useDeals";
import { DealsTable } from "@/features/deals/DealsTable";
import { localDay, commission, calculateMaintenanceTotal, VEHICLE_CATEGORIES } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";

// 1. shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// 2. KokonutUI components
import FloatingPaths from "@/components/kokonut/BackgroundPaths";
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev) components
import { MotionCounter } from "@/components/motion/MotionCounter";

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
  const { isOwner } = useAuth();
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

  // Computed pending agents analytics
  const pendingAgentsData = useMemo(() => {
    const groups = {};
    deals.forEach((deal) => {
      const agent = deal.agent;
      if (!agent || !agent.name || !agent.name.trim()) return;

      const name = agent.name.trim();
      if (!groups[name]) {
        groups[name] = { name, pending: 0, amountBalance: 0 };
      }

      const tot = Number(agent.total_amount) || 0;
      const paid = Number(agent.amount_paid) || 0;
      const bal =
        agent.amount_balance !== "" && agent.amount_balance != null
          ? Number(agent.amount_balance)
          : Math.max(0, tot - paid);

      const isCompleted =
        agent.status === "Completed" ||
        deal.rc_status === "Transferred" ||
        (agent.status !== "Pending" && bal === 0 && tot > 0) ||
        deal.status === "Sold";

      if (!isCompleted) {
        groups[name].pending += 1;
        groups[name].amountBalance += bal;
      }
    });

    const pendingList = Object.values(groups).filter((a) => a.pending > 0);
    const totalPendingTasks = pendingList.reduce((sum, a) => sum + a.pending, 0);
    const totalPendingBalance = pendingList.reduce((sum, a) => sum + a.amountBalance, 0);

    return {
      count: pendingList.length,
      tasks: totalPendingTasks,
      balance: totalPendingBalance,
    };
  }, [deals]);

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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
              {/* 4. Anime.js Live Showroom Pulse Beacon */}
              <AnimePulseBeacon color="gold" size="md" label="LIVE SHOWROOM ACTIVE" />

              {/* Status Badges */}
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] sm:text-[10px] tracking-wide">
                ENTERPRISE ATELIER
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px]">
                Vault Active
              </Badge>
            </div>

            <h1 data-testid="page-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-manrope">
              {t("dashboard.title", "Dashboard")}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Executive Fleet Cockpit · Real-time operational intelligence, deal verification &amp; treasury monitoring
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 sm:gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-lg shadow-amber-500/5 text-center"
              onClick={() => navigate("/showcase")}
              data-testid="dashboard-vip-showcase-button"
            >
              <Sparkles size={14} />
              <span>VIP Showcase</span>
            </button>

            {/* 2. KokonutUI ParticleButton */}
            <ParticleButton
              onClick={() => navigate("/new-deal")}
              data-testid="dashboard-new-deal-button"
              className="luxury-particle-cta px-4 sm:px-5 py-2.5 text-xs font-bold w-full sm:w-auto flex items-center justify-center"
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

      {/* ── 4-Card Luxury Automotive Metric Cockpit (2x2 Mobile Grid, 4-Col Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
        {/* Card 1: Today's Deals (Champagne Gold Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.18)"
          onClick={() => navigate("/deals?period=today")}
          className="p-3 sm:p-5 cursor-pointer hover:border-amber-500/50 transition-all border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-md shadow-neutral-200/50 dark:shadow-xl"
          data-testid="metric-todays-deals"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate mr-1">
              {t("dashboard.todays_deals", "Today's Deals")}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold flex-none">
              <BriefcaseBusiness size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-manrope mt-2 sm:mt-3 mb-1 sm:mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={todaysDealsCount} />}
            <span className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 font-normal">deals</span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1.5 sm:pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
            <span className="text-amber-500 flex items-center gap-1 font-medium text-[10px] sm:text-[11px] truncate">
              <Sparkles size={11} className="flex-none" />
              <span className="truncate">{todaysDealsCount > 0 ? `${todaysDealsCount} closed` : "Showroom ready"}</span>
            </span>
            <ArrowUpRight size={13} className="text-neutral-400 dark:text-neutral-500 flex-none hidden sm:block" />
          </div>
        </SpotlightCard>

        {/* Card 2: Bikes in Stock (Sapphire Indigo Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.18)"
          onClick={() => navigate("/deals?status=In+Stock")}
          className="p-3 sm:p-5 cursor-pointer hover:border-sky-500/50 transition-all border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-md shadow-neutral-200/50 dark:shadow-xl"
          data-testid="metric-bikes-in-stock"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate mr-1">
              {t("dashboard.bikes_in_stock", "Bikes in Stock")}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold flex-none">
              <Bike size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-manrope mt-2 sm:mt-3 mb-1 sm:mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={bikesInStockCount} />}
            <span className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 font-normal">units</span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1.5 sm:pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
            <span className="text-sky-500 flex items-center gap-1 font-medium text-[10px] sm:text-[11px] truncate">
              <CheckCircle2 size={11} className="flex-none" />
              <span className="truncate">{`${stockRatio}% fleet available`}</span>
            </span>
            <ArrowUpRight size={13} className="text-neutral-400 dark:text-neutral-500 flex-none hidden sm:block" />
          </div>
        </SpotlightCard>

        {/* Card 3: Pending RC Transfers (Amber Sunset Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(249, 115, 22, 0.18)"
          onClick={() => navigate("/deals?rc=Pending")}
          className="p-3 sm:p-5 cursor-pointer hover:border-amber-500/50 transition-all border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-md shadow-neutral-200/50 dark:shadow-xl"
          data-testid="metric-pending-rc-transfers"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate mr-1">
              {t("dashboard.pending_rc", "Pending RC")}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold flex-none">
              <ClipboardList size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-manrope mt-2 sm:mt-3 mb-1 sm:mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={pendingRcCount} />}
            <span className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 font-normal">in RTO</span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1.5 sm:pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
            <span className="text-amber-500 flex items-center gap-1 font-medium text-[10px] sm:text-[11px] truncate">
              <Clock size={11} className="flex-none" />
              <span className="truncate">{pendingRcCount > 0 ? "RTO queue" : "Clear"}</span>
            </span>
            <ArrowUpRight size={13} className="text-neutral-400 dark:text-neutral-500 flex-none hidden sm:block" />
          </div>
        </SpotlightCard>

        {/* Card 4: Pending Agents (Purple Spotlight) */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.18)"
          onClick={() => isOwner && navigate("/agents")}
          className={`p-3 sm:p-5 transition-all border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-md shadow-neutral-200/50 dark:shadow-xl ${
            isOwner ? "cursor-pointer hover:border-purple-500/50" : "cursor-default opacity-90"
          }`}
          data-testid="metric-pending-agents"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate mr-1">
              {t("dashboard.pending_agents", "Agents")}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold flex-none">
              <UserCheck size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-manrope mt-2 sm:mt-3 mb-1 sm:mb-2 flex items-baseline gap-1">
            {loading ? "…" : <MotionCounter to={pendingAgentsData.count} />}
            <span className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 font-normal">
              {pendingAgentsData.count === 1 ? "liaison" : "liaisons"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1.5 sm:pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium text-[10px] sm:text-[11px] truncate">
              <Clock size={11} className="flex-none" />
              <span className="truncate">
                {pendingAgentsData.tasks > 0
                  ? `${pendingAgentsData.tasks} tasks`
                  : "All clear"}
              </span>
            </span>
            {isOwner && <ArrowUpRight size={13} className="text-neutral-400 dark:text-neutral-500 flex-none hidden sm:block" />}
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
          <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950 text-neutral-600 dark:text-neutral-300 font-bold text-[11px] sm:text-xs rounded-lg px-2 sm:px-4 py-2 text-center truncate">
              Cockpit
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950 text-neutral-600 dark:text-neutral-300 font-bold text-[11px] sm:text-xs rounded-lg px-2 sm:px-4 py-2 text-center truncate">
              Charts
            </TabsTrigger>
            <TabsTrigger value="deals" className="data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950 text-neutral-600 dark:text-neutral-300 font-bold text-[11px] sm:text-xs rounded-lg px-2 sm:px-4 py-2 text-center truncate">
              Fleet ({filteredDeals.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Quick Filter:</span>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-transparent hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("stock")}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === "stock"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-transparent hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              In Stock
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("rc")}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === "rc"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-transparent hover:text-neutral-900 dark:hover:text-white"
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
              showCommission={isOwner}
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