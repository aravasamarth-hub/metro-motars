import React, { useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ChevronDown,
  Plus,
  Search,
  X,
  Bike,
  ClipboardList,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  Filter,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";
import { dealRepository } from "@/data/dealRepository";
import { useDeals } from "@/features/deals/useDeals";
import { DealsTable } from "@/features/deals/DealsTable";
import { ConfirmDialog } from "@/features/deals/LocalUI";
import { areVehicleAndSellerComplete, localDay, VEHICLE_CATEGORIES } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";
import BillModal from "@/components/BillModal";

// 1. shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 2. KokonutUI
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev)
import { MotionCounter } from "@/components/motion/MotionCounter";
import { MotionReveal } from "@/components/motion/MotionReveal";

// 4. Anime.js v4
import AnimePulseBeacon from "@/components/anime/AnimePulseBeacon";

// 5. Bklit data visualizations
import { InventoryDistributionBarChart } from "@/components/bklit/InventoryDistributionBarChart";

export default function FunctionalDeals() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { deals, loading, error } = useDeals();
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [billDeal, setBillDeal] = useState(null);
  const [message, setMessage] = useState("");
  const [showBklitAnalytics, setShowBklitAnalytics] = useState(false);
  const removing = useRef(false);

  const status = params.get("status") || "All";
  const rc = params.get("rc") || "All";
  const category = params.get("category") || "All";
  const today = params.get("period") === "today";

  const filter = (key, value) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value === "All") next.delete(key);
      else next.set(key, value);
      return next;
    });

  const inStockCount = useMemo(
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
  const todaysCount = useMemo(
    () => deals.filter((d) => localDay(new Date(d.created_at)) === localDay()).length,
    [deals]
  );

  const visible = deals.filter((deal) => {
    const text = [
      deal.bill_number,
      deal.vehicle.vehicle_name,
      deal.vehicle.vehicle_number,
      deal.vehicle.registration_number,
      deal.vehicle.make,
      deal.vehicle.model,
      deal.seller.name,
      deal.seller.phone,
      deal.seller.dealer_name,
      deal.buyer.name,
      deal.buyer.phone,
      deal.buyer.dealer_name,
    ]
      .join(" ")
      .toLowerCase();
    const detailsOk = areVehicleAndSellerComplete(deal);
    const matchesRc =
      rc === "All"
        ? true
        : rc === "Details Pending"
        ? !detailsOk
        : rc === "Transferred" || rc === "Completed"
        ? detailsOk && (deal.rc_status === "Transferred" || deal.rc_status === "Completed")
        : rc === "Pending"
        ? detailsOk && (deal.rc_status === "Pending" || !deal.rc_status)
        : rc === deal.rc_status;
    const matchesCategory =
      category === "All"
        ? true
        : (deal.vehicle?.vehicle_type || "4 Wheeler Car") === category;
    return (
      text.includes(query.trim().toLowerCase()) &&
      (status === "All" || status === deal.status) &&
      matchesRc &&
      matchesCategory &&
      (!today || localDay(new Date(deal.created_at)) === localDay())
    );
  });

  const remove = async () => {
    const target = deleting;
    if (!target || removing.current) return;
    removing.current = true;
    try {
      await dealRepository.remove(target.id);
      setMessage(
        `${target.bill_number} ${t("deals.deleted_msg", "deleted from this browser.")}`
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      removing.current = false;
      setDeleting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="local-page deals-page-luxury"
    >
      {/* ── Luxury Showroom Fleet Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <AnimePulseBeacon color="gold" size="sm" label="SHOWROOM FLEET LEDGER" />
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
              IndexedDB Records
            </Badge>
          </div>
          <h1 data-testid="page-title" className="text-2xl sm:text-3xl font-extrabold text-white font-manrope">
            {t("deals.title", "Deals")}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Complete vehicle sales ledger, party profiles, and document transfer pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowBklitAnalytics(!showBklitAnalytics)}
            className="border-neutral-700 hover:border-amber-500/40 text-xs font-semibold gap-2"
          >
            <BarChart2 size={15} className="text-amber-400" />
            <span>{showBklitAnalytics ? "Hide Fleet Analytics" : "Bklit Brand Breakdown"}</span>
          </Button>

          {/* KokonutUI ParticleButton */}
          <ParticleButton
            onClick={() => navigate("/new-deal")}
            data-testid="deals-new-deal-button"
            className="luxury-particle-cta px-4 py-2 text-xs font-bold"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t("nav.new_deal", "New Deal")}</span>
          </ParticleButton>
        </div>
      </div>

      {(message || error) && (
        <div className="workflow-message" role="status" data-testid="deals-message">
          {error || message}
        </div>
      )}

      {/* ── Optional Bklit Fleet Distribution Drawer ── */}
      {showBklitAnalytics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <InventoryDistributionBarChart />
        </motion.div>
      )}

      {/* ── KokonutUI SpotlightCards for 4 Fleet Filters + Motion Counters ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          onClick={() => setParams({})}
          className={`p-4 cursor-pointer transition-all border ${
            status === "All" && rc === "All" && !today
              ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10"
              : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>All Deals</span>
            <Layers size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-manrope mt-2">
            <MotionCounter to={deals.length} />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Full Showroom Ledger</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.15)"
          onClick={() => filter("status", "In Stock")}
          className={`p-4 cursor-pointer transition-all border ${
            status === "In Stock"
              ? "border-sky-500/60 bg-sky-500/10 shadow-lg shadow-sky-500/10"
              : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>In Stock</span>
            <Bike size={15} className="text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-manrope mt-2">
            <MotionCounter to={inStockCount} />
          </div>
          <span className="text-[10px] text-sky-400 mt-1 block">Available For Sale</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          onClick={() => filter("rc", "Pending")}
          className={`p-4 cursor-pointer transition-all border ${
            rc === "Pending"
              ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10"
              : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>RC Pending</span>
            <Clock size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-manrope mt-2">
            <MotionCounter to={pendingRcCount} />
          </div>
          <span className="text-[10px] text-amber-400 mt-1 block">RTO Follow-up Required</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          onClick={() => filter("status", "Sold")}
          className={`p-4 cursor-pointer transition-all border ${
            status === "Sold"
              ? "border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
              : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Sold Fleet</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-manrope mt-2">
            <MotionCounter to={soldCount} />
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Keys Handed Over</span>
        </SpotlightCard>
      </div>

      {/* ── Fleet Segment Horizontal Filter Chips (8 Categories) ── */}
      <div className="category-filter-bar mb-3" data-testid="fleet-category-filter-bar">
        <button
          type="button"
          className={`category-filter-chip ${category === "All" ? "active" : ""}`}
          onClick={() => filter("category", "All")}
          data-testid="filter-cat-all"
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
              className={`category-filter-chip ${category === cat.label ? "active" : ""}`}
              onClick={() => filter("category", cat.label)}
              data-testid={`filter-cat-${cat.id}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="toolbar deals-luxury-toolbar mb-4 flex gap-3 flex-wrap items-center">
        <div className="search-field deals-luxury-search flex-1 min-w-[260px] bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 flex items-center gap-2 text-white">
          <Search size={16} className="text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("deals.search_placeholder", "Search bill no, vehicle, seller or buyer…")}
            aria-label={t("deals.search_placeholder", "Search deals")}
            data-testid="deals-search-input"
            className="bg-transparent border-0 outline-none text-xs w-full text-white placeholder-neutral-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              data-testid="deals-clear-search"
              className="text-neutral-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <label className="select-field deals-luxury-select bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
          <span className="text-neutral-400">{t("deals.stock_label", "Stock")}</span>
          <select
            value={status}
            onChange={(e) => filter("status", e.target.value)}
            data-testid="status-filter"
            className="bg-transparent text-white font-semibold outline-none cursor-pointer"
          >
            <option value="All" className="bg-neutral-900">{t("deals.all_deals", "All deals")}</option>
            <option value="In Stock" className="bg-neutral-900">{t("status.in_stock", "In Stock")}</option>
            <option value="Out of Stock" className="bg-neutral-900">{t("status.out_of_stock", "Out of Stock")}</option>
            <option value="Sold" className="bg-neutral-900">{t("status.sold", "Sold")}</option>
          </select>
          <ChevronDown size={14} className="text-neutral-400" />
        </label>

        <label className="select-field deals-luxury-select bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
          <span className="text-neutral-400">{t("deals.rc_label", "Status")}</span>
          <select
            value={rc}
            onChange={(e) => filter("rc", e.target.value)}
            data-testid="rc-filter"
            className="bg-transparent text-white font-semibold outline-none cursor-pointer"
          >
            <option value="All" className="bg-neutral-900">{t("deals.all_transfers", "All status")}</option>
            <option value="Details Pending" className="bg-neutral-900">{t("status.details_pending", "Details Pending")}</option>
            <option value="Pending" className="bg-neutral-900">{t("status.rc_pending", "RC Pending")}</option>
            <option value="Transferred" className="bg-neutral-900">{t("status.rc_transferred", "RC Transferred")}</option>
          </select>
          <ChevronDown size={14} className="text-neutral-400" />
        </label>

        {(query || status !== "All" || rc !== "All" || today) && (
          <button
            type="button"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors"
            onClick={() => {
              setQuery("");
              setParams({});
            }}
            data-testid="deals-reset-filters"
          >
            <X size={13} />
            <span>{t("deals.reset", "Reset")}</span>
          </button>
        )}
      </div>

      {/* ── Table Section with MotionReveal ── */}
      <MotionReveal className="dashboard-table-wrapper rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-xl overflow-hidden p-1 shadow-2xl">
        <DealsTable
          deals={visible}
          onDelete={setDeleting}
          onGenerateBill={setBillDeal}
          loading={loading}
        />
      </MotionReveal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`${t("deals.delete_title", "Delete")} ${deleting?.bill_number || "deal"}?`}
        description={t(
          "deals.delete_desc",
          "The deal and its attached photos will be removed from this browser. This cannot be undone."
        )}
        confirm={t("deals.delete_confirm", "Delete deal")}
        cancelText={t("dialog.cancel", "Cancel")}
        onConfirm={remove}
        testid="delete-deal"
      />

      <BillModal deal={billDeal} isOpen={!!billDeal} onClose={() => setBillDeal(null)} initialDocument="seller-bill" />
    </motion.div>
  );
}