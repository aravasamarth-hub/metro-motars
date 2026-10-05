import { useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";
import { dealRepository } from "@/data/dealRepository";
import { useDeals } from "@/features/deals/useDeals";
import { DealsTable } from "@/features/deals/DealsTable";
import { ConfirmDialog } from "@/features/deals/LocalUI";
import { areVehicleAndSellerComplete, localDay } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";
import BillModal from "@/components/BillModal";

export default function FunctionalDeals() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { deals, loading, error } = useDeals();
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [billDeal, setBillDeal] = useState(null);
  const [message, setMessage] = useState("");
  const removing = useRef(false);

  const status = params.get("status") || "All";
  const rc = params.get("rc") || "All";
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
    return (
      text.includes(query.trim().toLowerCase()) &&
      (status === "All" || status === deal.status) &&
      matchesRc &&
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
    <div className="local-page deals-page-luxury">
      {/* Luxury Showroom Fleet Header */}
      <div className="page-header deals-luxury-header">
        <div>
          <div className="eyebrow deals-eyebrow">
            <span className="eyebrow-beacon" />
            <span>{t("deals.eyebrow", "SHOWROOM FLEET INVENTORY & SALES REGISTRY")}</span>
          </div>
          <h1 data-testid="page-title" className="deals-hero-title">
            {t("deals.title", "Deals")}
          </h1>
          <p className="deals-hero-subtitle">
            Complete vehicle sales ledger, party profiles, and document transfer pipeline
          </p>
        </div>

        <button
          type="button"
          className="button button-primary dashboard-cta-new-deal"
          onClick={() => navigate("/new-deal")}
          data-testid="deals-new-deal-button"
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>{t("nav.new_deal", "New Deal")}</span>
        </button>
      </div>

      {(message || error) && (
        <div className="workflow-message" role="status" data-testid="deals-message">
          {error || message}
        </div>
      )}

      {/* Quick-Stats Micro Strip */}
      <div className="deals-fleet-micro-strip">
        <button
          type="button"
          className={`deals-micro-pill ${status === "All" && rc === "All" && !today ? "active" : ""}`}
          onClick={() => setParams({})}
        >
          <Layers size={13} />
          <span>All Deals ({deals.length})</span>
        </button>

        <button
          type="button"
          className={`deals-micro-pill ${status === "In Stock" ? "active" : ""}`}
          onClick={() => filter("status", "In Stock")}
        >
          <Bike size={13} className="text-blue-400" />
          <span>In Stock ({inStockCount})</span>
        </button>

        <button
          type="button"
          className={`deals-micro-pill ${rc === "Pending" ? "active" : ""}`}
          onClick={() => filter("rc", "Pending")}
        >
          <Clock size={13} className="text-amber-400" />
          <span>RC Pending ({pendingRcCount})</span>
        </button>

        <button
          type="button"
          className={`deals-micro-pill ${status === "Sold" ? "active" : ""}`}
          onClick={() => filter("status", "Sold")}
        >
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Sold Fleet ({soldCount})</span>
        </button>

        {todaysCount > 0 && (
          <button
            type="button"
            className={`deals-micro-pill ${today ? "active" : ""}`}
            onClick={() => filter("period", "today")}
          >
            <Sparkles size={13} className="text-yellow-400" />
            <span>Today's Deals ({todaysCount})</span>
          </button>
        )}
      </div>

      {/* Luxury Search & Filter Toolbar */}
      <div className="toolbar deals-luxury-toolbar">
        <div className="search-field deals-luxury-search">
          <Search size={17} className="search-icon" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("deals.search_placeholder", "Search bill no, vehicle, seller or buyer…")}
            aria-label={t("deals.search_placeholder", "Search deals")}
            data-testid="deals-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              data-testid="deals-clear-search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <label className="select-field deals-luxury-select">
          <span>{t("deals.stock_label", "Stock")}</span>
          <select
            value={status}
            onChange={(e) => filter("status", e.target.value)}
            data-testid="status-filter"
          >
            <option value="All">{t("deals.all_deals", "All deals")}</option>
            <option value="In Stock">{t("status.in_stock", "In Stock")}</option>
            <option value="Out of Stock">{t("status.out_of_stock", "Out of Stock")}</option>
            <option value="Sold">{t("status.sold", "Sold")}</option>
          </select>
          <ChevronDown size={14} />
        </label>

        <label className="select-field deals-luxury-select">
          <span>{t("deals.rc_label", "Status")}</span>
          <select
            value={rc}
            onChange={(e) => filter("rc", e.target.value)}
            data-testid="rc-filter"
          >
            <option value="All">{t("deals.all_transfers", "All status")}</option>
            <option value="Details Pending">{t("status.details_pending", "Details Pending")}</option>
            <option value="Pending">{t("status.rc_pending", "RC Pending")}</option>
            <option value="Transferred">{t("status.rc_transferred", "RC Transferred")}</option>
          </select>
          <ChevronDown size={14} />
        </label>

        {(query || status !== "All" || rc !== "All" || today) && (
          <button
            type="button"
            className="button button-secondary deals-reset-btn"
            onClick={() => {
              setQuery("");
              setParams({});
            }}
            data-testid="deals-reset-filters"
          >
            <X size={14} />
            <span>
              {t("deals.reset", "Reset")}
              {today ? ` · ${t("deals.today_filter", "Today")}` : ""}
            </span>
          </button>
        )}
      </div>

      <div className="dashboard-table-wrapper">
        <DealsTable
          deals={visible}
          onDelete={setDeleting}
          onGenerateBill={setBillDeal}
          loading={loading}
        />
      </div>

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

      <BillModal deal={billDeal} isOpen={!!billDeal} onClose={() => setBillDeal(null)} />
    </div>
  );
}