import React from "react";
import {
  ArrowRight,
  Sparkles,
  Bike,
} from "lucide-react";

export default function PublicHero({ totalAvailable = 0, brands = [] }) {
  const handleScrollToBrowse = () => {
    const el = document.querySelector("#browse-bikes");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
      {/* Background radial gradient & ambient glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles size={14} className="text-amber-500" />
          <span>Curated Two-Wheeler Showroom · Indiranagar, Bangalore</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-neutral-950 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
          Find Your Next Ride.{" "}
          <span className="text-amber-500 underline decoration-amber-500/30 decoration-wavy underline-offset-8">
            Ride With Confidence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Explore quality pre-owned motorcycles with transparent pricing, detailed vehicle
          specifications, and direct assistance from our showroom team.
        </p>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <button
            onClick={handleScrollToBrowse}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
          >
            <Bike size={18} />
            <span>Browse {totalAvailable > 0 ? `${totalAvailable} Motorcycles` : "Motorcycles"}</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleScrollToContact}
            className="px-7 py-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold text-sm shadow-sm backdrop-blur-md transition-all hover:scale-105"
          >
            <span>Contact Showroom</span>
          </button>
        </div>

        {/* Real Inventory Summary Bar */}
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800/90 backdrop-blur-xl rounded-3xl p-5 shadow-lg shadow-neutral-950/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800">
            {/* Total Available */}
            <div className="px-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                Available In Stock
              </span>
              <div className="text-2xl font-black text-neutral-950 dark:text-white flex items-baseline gap-1.5">
                <span>{totalAvailable}</span>
                <span className="text-xs font-semibold text-emerald-500">Live Count</span>
              </div>
              <span className="text-[11px] text-neutral-500">Inspected &amp; Ready</span>
            </div>

            {/* Brands Count */}
            <div className="px-3 pt-3 sm:pt-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                Curated Brands
              </span>
              <div className="text-2xl font-black text-neutral-950 dark:text-white">
                {brands.length || 3}+
              </div>
              <span className="text-[11px] text-neutral-500">Top Manufacturers</span>
            </div>

            {/* Inspection */}
            <div className="px-3 pt-3 sm:pt-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                Inspection Standard
              </span>
              <div className="text-2xl font-black text-amber-500">
                120-Point
              </div>
              <span className="text-[11px] text-neutral-500">Mechanical Verification</span>
            </div>

            {/* Location & Title */}
            <div className="px-3 pt-3 sm:pt-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                Ownership Title
              </span>
              <div className="text-2xl font-black text-emerald-500">
                100% Clean
              </div>
              <span className="text-[11px] text-neutral-500">Zero Hypothecation Risk</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
