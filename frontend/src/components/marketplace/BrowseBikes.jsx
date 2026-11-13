import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, RotateCcw, Bike, Phone, MessageSquare } from "lucide-react";
import VehicleCard from "./VehicleCard";
import {
  BUDGET_OPTIONS,
  KM_OPTIONS,
  SORT_OPTIONS,
  vehicleTypeLabel,
  registrationRegion,
  useOverlay,
} from "./marketplaceUtils";
import { SHOWROOM_CONTACT, getWhatsAppEnquiryUrl } from "@/data/customerEnquiry";

const EMPTY_FILTERS = {
  q: "",
  brand: "ALL",
  type: "ALL",
  budget: "ALL",
  year: "ALL",
  fuel: "ALL",
  transmission: "ALL",
  km: "ALL",
  region: "ALL",
};
const PAGE_SIZE = 12;

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

function FilterSelect({ label, value, onChange, options, testId }) {
  return (
    <label className="block">
      <span className="mm-field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mm-select" data-testid={testId}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function FilterPanel({ filters, setFilter, options }) {
  return (
    <div className="space-y-5">
      <div>
        <span className="mm-field-label">Vehicle type</span>
        <div className="flex flex-wrap gap-2">
          {[{ value: "ALL", label: "All" }, ...options.types.map((t) => ({ value: t, label: vehicleTypeLabel(t) }))].map((o) => (
            <button
              key={o.value}
              type="button"
              className="mm-chip"
              aria-pressed={filters.type === o.value}
              onClick={() => setFilter("type", o.value)}
              data-testid={`filter-type-${o.value}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <FilterSelect
        label="Brand"
        value={filters.brand}
        onChange={(v) => setFilter("brand", v)}
        options={[{ value: "ALL", label: `All brands (${options.brands.length})` }, ...options.brands.map((b) => ({ value: b, label: b }))]}
        testId="filter-brand"
      />
      <FilterSelect label="Budget" value={filters.budget} onChange={(v) => setFilter("budget", v)} options={BUDGET_OPTIONS} testId="filter-budget" />
      <FilterSelect
        label="Model year"
        value={filters.year}
        onChange={(v) => setFilter("year", v)}
        options={[{ value: "ALL", label: "Any year" }, ...options.years.map((y) => ({ value: String(y), label: String(y) }))]}
        testId="filter-year"
      />
      <FilterSelect
        label="Fuel"
        value={filters.fuel}
        onChange={(v) => setFilter("fuel", v)}
        options={[{ value: "ALL", label: "Any fuel" }, ...options.fuels.map((f) => ({ value: f, label: f }))]}
        testId="filter-fuel"
      />
      <FilterSelect
        label="Transmission"
        value={filters.transmission}
        onChange={(v) => setFilter("transmission", v)}
        options={[{ value: "ALL", label: "Any transmission" }, ...options.transmissions.map((t) => ({ value: t, label: t }))]}
        testId="filter-transmission"
      />
      <FilterSelect label="Kilometres driven" value={filters.km} onChange={(v) => setFilter("km", v)} options={KM_OPTIONS} testId="filter-km" />
      <FilterSelect
        label="Registration (RTO)"
        value={filters.region}
        onChange={(v) => setFilter("region", v)}
        options={[{ value: "ALL", label: "Any registration" }, ...options.regions.map((r) => ({ value: r, label: r }))]}
        testId="filter-region"
      />
    </div>
  );
}

export function applyFilters(inventory, filters, sortBy) {
  let result = [...inventory];
  const q = filters.q.trim().toLowerCase();
  if (q) {
    result = result.filter((b) =>
      [b.title, b.brand, b.model, b.variant, b.color, b.year, b.fuelType]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }
  if (filters.brand !== "ALL") result = result.filter((b) => b.brand === filters.brand);
  if (filters.type !== "ALL") result = result.filter((b) => b.vehicleType === filters.type);
  if (filters.year !== "ALL") result = result.filter((b) => String(b.year) === filters.year);
  if (filters.fuel !== "ALL") result = result.filter((b) => b.fuelType === filters.fuel);
  if (filters.transmission !== "ALL") result = result.filter((b) => b.transmission === filters.transmission);
  if (filters.region !== "ALL") result = result.filter((b) => registrationRegion(b.registrationLocation) === filters.region);
  if (filters.budget !== "ALL") {
    const limit = Number(filters.budget);
    result = result.filter((b) => b.sellingPrice && b.sellingPrice <= limit);
  }
  if (filters.km !== "ALL") {
    const limit = Number(filters.km);
    result = result.filter((b) => b.odometerKm !== null && b.odometerKm !== undefined && b.odometerKm <= limit);
  }

  const price = (b) => b.sellingPrice || 0;
  if (sortBy === "price_asc") result.sort((a, b) => (price(a) || Infinity) - (price(b) || Infinity));
  else if (sortBy === "price_desc") result.sort((a, b) => price(b) - price(a));
  else if (sortBy === "year_desc") result.sort((a, b) => (b.year || 0) - (a.year || 0));
  else if (sortBy === "mileage_asc") result.sort((a, b) => (a.odometerKm ?? Infinity) - (b.odometerKm ?? Infinity));
  else if (sortBy === "newest") result.sort((a, b) => String(b.listedAt || "").localeCompare(String(a.listedAt || "")));
  return result;
}

export default function BrowseBikes({ inventory = [], onSelectVehicle, onEnquireVehicle, preset = null, loading = false }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  useOverlay(drawerOpen, closeDrawer);

  // Presets come from the hero quick-search, brand strip and category tiles.
  useEffect(() => {
    if (!preset) return;
    setFilters({ ...EMPTY_FILTERS, ...preset.filters });
    setVisible(PAGE_SIZE);
  }, [preset]);

  const options = useMemo(() => ({
    brands: uniq(inventory.map((b) => b.brand)).sort(),
    types: uniq(inventory.map((b) => b.vehicleType)).sort(),
    years: uniq(inventory.map((b) => b.year)).sort((a, b) => b - a),
    fuels: uniq(inventory.map((b) => b.fuelType)).sort(),
    transmissions: uniq(inventory.map((b) => b.transmission)).sort(),
    regions: uniq(inventory.map((b) => registrationRegion(b.registrationLocation))).sort(),
  }), [inventory]);

  const filteredBikes = useMemo(() => applyFilters(inventory, filters, sortBy), [inventory, filters, sortBy]);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setVisible(PAGE_SIZE);
  }, []);

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSortBy("featured");
    setVisible(PAGE_SIZE);
  };

  const chipLabel = {
    q: (v) => `“${v}”`,
    brand: (v) => v,
    type: (v) => vehicleTypeLabel(v),
    budget: (v) => BUDGET_OPTIONS.find((o) => o.value === v)?.label,
    year: (v) => `Year ${v}`,
    fuel: (v) => v,
    transmission: (v) => v,
    km: (v) => KM_OPTIONS.find((o) => o.value === v)?.label,
    region: (v) => `Reg. ${v}`,
  };
  const activeChips = Object.entries(filters).filter(([k, v]) => (k === "q" ? v.trim() : v !== "ALL"));
  const activeCount = activeChips.filter(([k]) => k !== "q").length;
  const hasActive = activeChips.length > 0 || sortBy !== "featured";
  const shown = filteredBikes.slice(0, visible);

  return (
    <section id="browse-bikes" className="mm-section" data-testid="browse-bikes-section">
      <div className="mm-container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mm-eyebrow">Verified Pre-Owned Marketplace</p>
            <h2 className="mm-display mt-3 text-3xl text-neutral-950 dark:text-white sm:text-[44px] sm:leading-[1.05]">
              Available Inventory
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              Every vehicle is inspected and document-checked at our Bengaluru showroom before it is listed.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-neutral-600 dark:text-neutral-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>
              <b className="font-semibold text-neutral-900 dark:text-white">{inventory.length}</b>{" "}
              {inventory.length === 1 ? "vehicle" : "vehicles"} in stock · live showroom inventory
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)]">
          {/* Desktop filter rail */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="mm-card sticky top-24 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="mm-display text-[15px] text-neutral-900 dark:text-white">Filters</h3>
                {activeCount > 0 && (
                  <button type="button" onClick={handleResetFilters} className="text-[12px] font-semibold text-[color:var(--mm-gold-lo)] hover:underline dark:text-[color:var(--mm-gold)]" data-testid="filters-clear-desktop">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel filters={filters} setFilter={setFilter} options={options} />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={filters.q}
                  onChange={(e) => setFilter("q", e.target.value)}
                  placeholder="Search make, model, variant, colour…"
                  className="mm-input !pl-10"
                  aria-label="Search inventory"
                  data-testid="inventory-search-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="mm-btn mm-btn-outline flex-1 lg:hidden"
                  data-testid="open-filters-button"
                >
                  <SlidersHorizontal size={16} /> Filters
                  {activeCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[color:var(--mm-gold)] px-1.5 text-[11px] font-bold text-[#120f08]">{activeCount}</span>
                  )}
                </button>
                <label className="flex-1 sm:w-[210px] sm:flex-none">
                  <span className="mm-sr-only">Sort by</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mm-select" data-testid="inventory-sort-select">
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* Active filters */}
            <div className="mt-4 flex min-h-[34px] flex-wrap items-center gap-2" data-testid="active-filters">
              <span className="mr-1 text-[13px] text-neutral-500 dark:text-neutral-400" data-testid="results-count">
                {loading ? "Loading…" : `${filteredBikes.length} ${filteredBikes.length === 1 ? "result" : "results"}`}
              </span>
              {activeChips.map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k, k === "q" ? "" : "ALL")}
                  className="mm-chip !min-h-[30px] !text-[12px]"
                  aria-label={`Remove filter ${chipLabel[k](v)}`}
                  data-testid={`active-filter-${k}`}
                >
                  {chipLabel[k](v)} <X size={12} />
                </button>
              ))}
              {hasActive && (
                <button type="button" onClick={handleResetFilters} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]" data-testid="reset-filters-button">
                  <RotateCcw size={12} /> Reset Filters
                </button>
              )}
            </div>

            {/* Results */}
            <div className="mt-5">
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="mm-card overflow-hidden">
                      <div className="mm-skeleton aspect-[4/3] !rounded-none" />
                      <div className="space-y-3 p-5">
                        <div className="mm-skeleton h-3 w-1/3" />
                        <div className="mm-skeleton h-5 w-3/4" />
                        <div className="mm-skeleton h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : inventory.length === 0 ? (
                <div className="mm-card px-6 py-16 text-center" data-testid="inventory-empty-state">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(217,164,65,0.15)] text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">
                    <Bike size={26} />
                  </div>
                  <h3 className="mm-display mt-5 text-xl text-neutral-900 dark:text-white">New arrivals are being inspected</h3>
                  <p className="mx-auto mt-2 max-w-md text-[14px] text-neutral-600 dark:text-neutral-400">
                    No vehicles are listed right now. Tell us what you are looking for and our team will reach out when a match arrives.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a href={getWhatsAppEnquiryUrl(null)} target="_blank" rel="noopener noreferrer" className="mm-btn mm-btn-whatsapp">
                      <MessageSquare size={16} /> WhatsApp us
                    </a>
                    <a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="mm-btn mm-btn-outline">
                      <Phone size={16} /> Call showroom
                    </a>
                  </div>
                </div>
              ) : filteredBikes.length === 0 ? (
                <div className="mm-card px-6 py-16 text-center" data-testid="filters-empty-state">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-white/5">
                    <Search size={24} />
                  </div>
                  <h3 className="mm-display mt-5 text-xl text-neutral-900 dark:text-white">No motorcycles match your filters</h3>
                  <p className="mx-auto mt-2 max-w-sm text-[14px] text-neutral-600 dark:text-neutral-400">
                    Try widening your budget or removing a filter to see more of the showroom.
                  </p>
                  <button type="button" onClick={handleResetFilters} className="mm-btn mm-btn-primary mt-6" data-testid="show-all-button">
                    Show All Motorcycles
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" data-testid="inventory-grid">
                    {shown.map((bike, i) => (
                      <VehicleCard key={bike.id} bike={bike} onSelect={onSelectVehicle} onEnquire={onEnquireVehicle} priority={i < 3} />
                    ))}
                  </div>
                  {filteredBikes.length > visible && (
                    <div className="mt-10 text-center">
                      <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="mm-btn mm-btn-outline mm-btn-lg" data-testid="load-more-button">
                        Show more ({filteredBikes.length - visible} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters" data-testid="filters-drawer">
          <button type="button" className="mm-backdrop absolute inset-0 bg-black/55" onClick={closeDrawer} aria-label="Close filters" />
          <div className="mm-sheet absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[24px] bg-[color:var(--mm-paper)] dark:bg-[color:var(--mm-ink-900)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.07]">
              <h3 className="mm-display text-lg text-neutral-900 dark:text-white">Filters</h3>
              <button type="button" onClick={closeDrawer} className="mm-icon-btn" aria-label="Close filters" data-testid="close-filters-button">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel filters={filters} setFilter={setFilter} options={options} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/[0.07]">
              <button type="button" onClick={handleResetFilters} className="mm-btn mm-btn-outline" data-testid="filters-clear-mobile">Clear all</button>
              <button type="button" onClick={closeDrawer} className="mm-btn mm-btn-primary" data-testid="filters-apply-mobile">
                Show {filteredBikes.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
