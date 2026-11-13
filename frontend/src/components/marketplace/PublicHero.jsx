import React, { useState } from "react";
import { ArrowRight, Search, ShieldCheck, FileCheck2, BadgeCheck } from "lucide-react";
import { HERO_IMAGE, smoothScrollTo, BUDGET_OPTIONS, vehicleTypeLabel } from "./marketplaceUtils";

export default function PublicHero({ totalAvailable = 0, brands = [], types = [], onQuickSearch }) {
  const [brand, setBrand] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [budget, setBudget] = useState("ALL");

  const submit = (e) => {
    e.preventDefault();
    onQuickSearch?.({ brand, type, budget });
    smoothScrollTo("#browse-bikes");
  };

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-[color:var(--mm-ink-950)] text-white" data-testid="public-hero">
      <div className="absolute inset-0 -z-10">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="mm-hero-img h-full w-full object-cover object-[65%_center] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080a] via-[#07080a]/75 to-[#07080a]/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07080a] to-transparent" />
      </div>

      <div className="mm-container flex min-h-[640px] flex-col justify-end pb-10 pt-32 sm:min-h-[700px] lg:min-h-[760px] lg:pb-14">
        <div className="max-w-2xl">
          <p className="mm-eyebrow mm-anim-up !text-[color:var(--mm-gold)]">Indiranagar · Bengaluru</p>
          <h1 className="mm-display mm-anim-up mm-anim-delay-1 mt-5 text-[42px] leading-[1.02] sm:text-6xl lg:text-[76px]">
            Find Your Next Ride.
            <span className="block text-white/55">Ride With Confidence.</span>
          </h1>
          <p className="mm-anim-up mm-anim-delay-2 mt-6 max-w-xl text-[16px] leading-relaxed text-white/70 sm:text-lg">
            Hand-picked pre-owned motorcycles, scooters and cars — inspected, document-verified and
            priced transparently by our showroom team.
          </p>
          <div className="mm-anim-up mm-anim-delay-3 mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => smoothScrollTo("#browse-bikes")} className="mm-btn mm-btn-primary mm-btn-lg" data-testid="hero-browse-button">
              Browse {totalAvailable > 0 ? `${totalAvailable} vehicles` : "inventory"}
              <ArrowRight size={17} />
            </button>
            <button type="button" onClick={() => smoothScrollTo("#contact")} className="mm-btn mm-btn-glass mm-btn-lg" data-testid="hero-contact-button">
              Contact Showroom
            </button>
          </div>
        </div>

        {/* Quick search */}
        <form
          onSubmit={submit}
          className="mm-anim-up mm-anim-delay-3 mt-12 grid gap-2 rounded-[20px] border border-white/10 bg-white/[0.06] p-2 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
          aria-label="Quick vehicle search"
          data-testid="hero-quick-search"
        >
          <label className="rounded-[14px] bg-black/30 px-4 py-2.5">
            <span className="block text-[11px] font-medium text-white/50">Brand</span>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full cursor-pointer bg-transparent text-[15px] font-medium text-white outline-none [&>option]:text-neutral-900" data-testid="hero-brand-select">
              <option value="ALL">All brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label className="rounded-[14px] bg-black/30 px-4 py-2.5">
            <span className="block text-[11px] font-medium text-white/50">Vehicle type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full cursor-pointer bg-transparent text-[15px] font-medium text-white outline-none [&>option]:text-neutral-900" data-testid="hero-type-select">
              <option value="ALL">All types</option>
              {types.map((t) => <option key={t} value={t}>{vehicleTypeLabel(t)}</option>)}
            </select>
          </label>
          <label className="rounded-[14px] bg-black/30 px-4 py-2.5">
            <span className="block text-[11px] font-medium text-white/50">Budget</span>
            <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full cursor-pointer bg-transparent text-[15px] font-medium text-white outline-none [&>option]:text-neutral-900" data-testid="hero-budget-select">
              {BUDGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <button type="submit" className="mm-btn mm-btn-primary min-h-[56px] rounded-[14px] px-7" data-testid="hero-search-submit">
            <Search size={17} /> Search
          </button>
        </form>

        {/* Live summary */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-7 sm:grid-cols-4">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Available in stock</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="mm-display text-3xl" data-testid="hero-stock-count">{totalAvailable}</span>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live Count
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Brands in stock</dt>
            <dd className="mm-display mt-1 text-3xl">{brands.length}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45"><ShieldCheck size={13} /> Inspection</dt>
            <dd className="mm-display mt-1 text-3xl text-[color:var(--mm-gold)]">120-Point</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45"><FileCheck2 size={13} /> Paperwork</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-[15px] font-semibold"><BadgeCheck size={17} className="text-[color:var(--mm-gold)]" /> RTO transfer support</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
