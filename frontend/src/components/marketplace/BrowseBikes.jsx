import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Sparkles,
  RotateCcw,
  Bike,
  MessageSquare,
  Eye,
} from "lucide-react";
import { MOTORCYCLE_PLACEHOLDER_SVG } from "@/data/publicInventory";

export default function BrowseBikes({
  inventory = [],
  onSelectVehicle,
  onEnquireVehicle,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [sortBy, setSortBy] = useState("featured");

  // Derive unique brands and years from actual inventory
  const brands = useMemo(() => {
    const list = Array.from(new Set(inventory.map((b) => b.brand).filter(Boolean)));
    return list.sort();
  }, [inventory]);

  const years = useMemo(() => {
    const list = Array.from(new Set(inventory.map((b) => b.year).filter(Boolean)));
    return list.sort((a, b) => b - a);
  }, [inventory]);

  // Filter and sort
  const filteredBikes = useMemo(() => {
    let result = [...inventory];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.brand.toLowerCase().includes(q) ||
          b.model.toLowerCase().includes(q) ||
          String(b.year).includes(q) ||
          b.color?.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== "ALL") {
      result = result.filter((b) => b.brand === selectedBrand);
    }

    // Year filter
    if (selectedYear !== "ALL") {
      result = result.filter((b) => String(b.year) === selectedYear);
    }

    // Max Price filter
    if (maxPrice !== "ALL") {
      const limit = Number(maxPrice);
      result = result.filter((b) => b.sellingPrice <= limit);
    }

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === "year_desc") {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === "mileage_asc") {
      result.sort((a, b) => (a.odometerKm || 0) - (b.odometerKm || 0));
    }

    return result;
  }, [inventory, searchQuery, selectedBrand, maxPrice, selectedYear, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("ALL");
    setMaxPrice("ALL");
    setSelectedYear("ALL");
    setSortBy("featured");
  };

  return (
    <section id="browse-bikes" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header with Real Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Verified Pre-Owned Marketplace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
            Available Motorcycle Inventory
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Browse our inspected, certified two-wheelers available for immediate delivery in Bangalore.
          </p>
        </div>

        {/* Live Inventory Counter Badge */}
        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white block">
              {inventory.length} {inventory.length === 1 ? "Motorcycle" : "Motorcycles"} In Stock
            </span>
            <span className="text-[10px] text-neutral-500">Live Showroom Inventory</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, make, variant..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">Any Budget</option>
              <option value="150000">Under ₹1.5 Lakh</option>
              <option value="250000">Under ₹2.5 Lakh</option>
              <option value="350000">Under ₹3.5 Lakh</option>
              <option value="600000">Under ₹6.0 Lakh</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest First</option>
              <option value="mileage_asc">Lowest Mileage</option>
            </select>
          </div>
        </div>

        {/* Brand Quick-Pills & Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-neutral-400 mr-1 uppercase">Brands:</span>
            <button
              onClick={() => setSelectedBrand("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedBrand === "ALL"
                  ? "bg-amber-500 text-neutral-950 font-bold"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-amber-500"
              }`}
            >
              All
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedBrand === b
                    ? "bg-amber-500 text-neutral-950 font-bold"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-amber-500"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {(searchQuery || selectedBrand !== "ALL" || maxPrice !== "ALL" || selectedYear !== "ALL" || sortBy !== "featured") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 font-semibold"
            >
              <RotateCcw size={12} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Motorcycle Cards */}
      {filteredBikes.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Bike size={32} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            No motorcycles match your filters
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
            Try adjusting your budget or search terms, or reset filters to view all available showroom bikes.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold shadow-md hover:bg-amber-600 transition-colors"
          >
            Show All Motorcycles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBikes.map((bike) => (
            <div
              key={bike.id}
              className="group relative flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300"
            >
              {/* Image Container */}
              <div
                className="relative aspect-[16/10] bg-neutral-950 overflow-hidden cursor-pointer"
                onClick={() => onSelectVehicle(bike)}
              >
                <img
                  src={bike.primaryPhoto || MOTORCYCLE_PLACEHOLDER_SVG}
                  alt={bike.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = MOTORCYCLE_PLACEHOLDER_SVG;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-neutral-950 uppercase tracking-wider shadow-sm">
                    {bike.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {bike.condition}
                  </span>
                </div>

                <div className="absolute top-3.5 right-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900/80 text-amber-400 backdrop-blur-md">
                    {bike.year}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1">
                    {bike.brand}
                  </div>
                  <h3
                    onClick={() => onSelectVehicle(bike)}
                    className="text-lg font-black text-neutral-900 dark:text-white leading-snug cursor-pointer group-hover:text-amber-500 transition-colors line-clamp-1"
                  >
                    {bike.title}
                  </h3>

                  {/* Specification Badges */}
                  <div className="grid grid-cols-3 gap-2 py-3.5 my-3 border-y border-neutral-100 dark:border-neutral-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-medium">Engine</span>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {bike.engineCc} cc
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-medium">Mileage</span>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {bike.odometerKm?.toLocaleString("en-IN")} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-medium">Reg. RTO</span>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {bike.registrationLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and Action Buttons */}
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        Selling Price
                      </span>
                      <span className="text-2xl font-black text-amber-500">
                        ₹{bike.sellingPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-500 font-bold">
                      ✓ RTO Transfer Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectVehicle(bike)}
                      className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={14} className="text-neutral-400" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEnquireVehicle(bike)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span>Enquire</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
