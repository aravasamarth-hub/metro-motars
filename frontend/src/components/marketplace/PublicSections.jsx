import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Shield,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Bike,
  CarFront,
  Gauge,
  Cog,
  Zap,
  BatteryCharging,
  FileCheck2,
  CircleDot,
  Search,
  CalendarCheck,
  KeyRound,
  MessageSquare,
  Mail,
} from "lucide-react";
import { SHOWROOM_CONTACT, getWhatsAppEnquiryUrl } from "@/data/customerEnquiry";
import VehicleCard from "./VehicleCard";
import { ABOUT_IMAGE, vehicleTypeLabel, smoothScrollTo } from "./marketplaceUtils";

function SectionHeader({ eyebrow, title, copy, action, center = false }) {
  return (
    <div className={`flex flex-col gap-5 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="mm-eyebrow">{eyebrow}</p>}
        <h2 className="mm-display mt-3 text-3xl text-neutral-950 dark:text-white sm:text-[44px] sm:leading-[1.05]">{title}</h2>
        {copy && <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">{copy}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Popular brands (derived from real stock) ---------- */
export function BrandsSection({ byBrand = {}, onPickBrand }) {
  const brands = Object.entries(byBrand).sort((a, b) => b[1] - a[1]);
  if (brands.length === 0) return null;
  return (
    <section className="border-y border-black/[0.06] bg-white/60 py-8 dark:border-white/[0.06] dark:bg-white/[0.02]" aria-label="Popular brands" data-testid="brands-section">
      <div className="mm-container flex flex-col gap-4 md:flex-row md:items-center">
        <p className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Popular brands</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:px-0">
          {brands.map(([brand, count]) => (
            <button
              key={brand}
              type="button"
              onClick={() => onPickBrand?.(brand)}
              className="mm-chip !min-h-[40px] !px-4"
              data-testid={`brand-chip-${brand}`}
            >
              <span className="font-semibold">{brand}</span>
              <span className="text-neutral-400">{count}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Categories (vehicle_type) ---------- */
const TYPE_META = {
  "2 Wheeler with Gear": { icon: Bike, copy: "Commuters, cruisers & performance bikes" },
  "2 Wheeler without Gear": { icon: Gauge, copy: "Gearless scooters for easy city riding" },
  "4 Wheeler Car": { icon: CarFront, copy: "Hatchbacks, sedans & SUVs" },
};

export function CategoriesSection({ byType = {}, onPickType }) {
  const types = Object.keys(TYPE_META).map((t) => ({ type: t, count: byType[t] || 0, ...TYPE_META[t] }));
  return (
    <section id="categories" className="mm-section !pb-0" data-testid="categories-section">
      <div className="mm-container">
        <SectionHeader eyebrow="Shop by category" title="What are you looking for?" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {types.map(({ type, count, icon: Icon, copy }) => (
            <button
              key={type}
              type="button"
              onClick={() => onPickType?.(type)}
              disabled={count === 0}
              className="mm-card mm-vcard group flex items-center gap-5 p-6 text-left disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              data-testid={`category-tile-${vehicleTypeLabel(type).toLowerCase()}`}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-neutral-950 text-[color:var(--mm-gold)] dark:bg-white/[0.06]">
                <Icon size={26} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="mm-display block text-lg text-neutral-950 dark:text-white">{vehicleTypeLabel(type)}</span>
                <span className="mt-0.5 block text-[13px] text-neutral-500 dark:text-neutral-400">{copy}</span>
                <span className="mt-2 block text-[12px] font-semibold text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">
                  {count > 0 ? `${count} in stock` : "None in stock right now"}
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Horizontal rail (Featured / Recently added) ---------- */
export function VehicleRail({ id, eyebrow, title, copy, vehicles = [], onSelect, onEnquire, testId }) {
  if (vehicles.length === 0) return null;
  return (
    <section id={id} className="mm-section !pb-0" data-testid={testId}>
      <div className="mm-container">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          copy={copy}
          action={
            <button type="button" onClick={() => smoothScrollTo("#browse-bikes")} className="mm-btn mm-btn-outline shrink-0 self-start md:self-auto">
              View all inventory <ArrowRight size={15} />
            </button>
          }
        />
        <div className="mm-rail mt-10">
          {vehicles.map((bike) => (
            <VehicleCard key={bike.id} bike={bike} onSelect={onSelect} onEnquire={onEnquire} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust / certification ---------- */
const CHECKS = [
  { icon: Cog, title: "Engine & Transmission Testing", desc: "Compression, cold-start idle, clutch engagement and smooth gearbox operation." },
  { icon: CircleDot, title: "Chassis & Frame Alignment", desc: "Straightness checks for structural bending, accident damage or stress fractures." },
  { icon: ShieldCheck, title: "Braking & Safety Systems", desc: "Rotor and pad wear, hydraulic fluid condition and ABS sensor diagnostics." },
  { icon: BatteryCharging, title: "Electrical & Battery Health", desc: "Charging rate, battery under load, starter relay, lighting and console checks." },
  { icon: FileCheck2, title: "Legal Title & RTO Verification", desc: "Registry check for active hypothecation, pending challans and authentic registration." },
  { icon: Zap, title: "Suspension & Tyres", desc: "Fork seals, rear shock rebound and tread life verified on every wheel." },
];

export function CertificationSection() {
  return (
    <section id="standards" className="mm-section" data-testid="certification-section">
      <div className="mm-container">
        <div className="overflow-hidden rounded-[28px] bg-[color:var(--mm-ink-900)] text-white">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div>
              <p className="mm-eyebrow !text-[color:var(--mm-gold)]">Quality &amp; Trust</p>
              <h2 className="mm-display mt-3 text-3xl sm:text-[44px] sm:leading-[1.05]">The 120-Point Showroom Certification</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
                Every vehicle undergoes a thorough mechanical and legal audit before it is approved for sale — so what you see is exactly what you ride home.
              </p>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div><div className="mm-display text-2xl text-[color:var(--mm-gold)]">120</div><p className="mt-1 text-[12px] text-white/55">Inspection points</p></div>
                <div><div className="mm-display text-2xl">RTO</div><p className="mt-1 text-[12px] text-white/55">Transfer assistance</p></div>
                <div><div className="mm-display text-2xl">Zero</div><p className="mt-1 text-[12px] text-white/55">Hidden broker fees</p></div>
              </div>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-[20px] bg-white/[0.07] sm:grid-cols-2">
              {CHECKS.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="bg-[color:var(--mm-ink-900)] p-6">
                  <Icon size={20} className="text-[color:var(--mm-gold)]" strokeWidth={1.7} />
                  <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Buying process ---------- */
const STEPS = [
  { icon: Search, title: "Browse & shortlist", desc: "Explore verified listings with clear pricing and specifications." },
  { icon: CalendarCheck, title: "Inspect & test ride", desc: "Visit the showroom to see the vehicle in person and ride it." },
  { icon: FileCheck2, title: "Paperwork handled", desc: "We prepare sale documents and support the RTO transfer." },
  { icon: KeyRound, title: "Ride home", desc: "Collect your keys with full documents and peace of mind." },
];

export function ProcessSection() {
  return (
    <section className="mm-section !pt-0" data-testid="process-section">
      <div className="mm-container">
        <SectionHeader eyebrow="How it works" title="Buying made simple" />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className="mm-card p-6">
              <div className="flex items-center justify-between">
                <Icon size={22} className="text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]" strokeWidth={1.7} />
                <span className="mm-display text-[13px] text-neutral-400">0{i + 1}</span>
              </div>
              <h3 className="mm-display mt-6 text-[17px] text-neutral-950 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- About ---------- */
export function AboutShowroomSection() {
  return (
    <section id="about" className="mm-section !pt-0" data-testid="about-section">
      <div className="mm-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-neutral-900">
          <img src={ABOUT_IMAGE} alt="Pre-owned motorcycle at the Metro Motors showroom" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--mm-gold)]">Flagship Showroom</p>
            <p className="mt-1 text-[14px] font-medium text-white/85">100ft Road, Indiranagar, Bengaluru</p>
          </div>
        </div>
        <div>
          <p className="mm-eyebrow">Bengaluru&apos;s pre-owned specialists</p>
          <h2 className="mm-display mt-3 text-3xl text-neutral-950 dark:text-white sm:text-[44px] sm:leading-[1.05]">About Metro Motors</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>
              <strong className="text-neutral-900 dark:text-white">Metro Motors</strong> was founded to make buying a pre-owned vehicle transparent, reliable and hassle-free.
            </p>
            <p>
              Unlike informal classifieds, every vehicle in our Indiranagar showroom has a verified history, authentic ownership documents and a 120-point evaluation.
            </p>
            <p>From test rides to RTO ownership transfer, our team manages the process so you can ride away with peace of mind.</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-black/[0.08] pt-6 dark:border-white/[0.08]">
            <div><div className="mm-display text-2xl text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">100%</div><p className="mt-1 text-[12px] text-neutral-500">Verified History</p></div>
            <div><div className="mm-display text-2xl text-neutral-950 dark:text-white">RTO</div><p className="mt-1 text-[12px] text-neutral-500">Transfer Assistance</p></div>
            <div><div className="mm-display text-2xl text-neutral-950 dark:text-white">7 days</div><p className="mt-1 text-[12px] text-neutral-500">Open Every Week</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
export function ContactShowroomSection() {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOWROOM_CONTACT.address)}`;
  return (
    <section id="contact" className="mm-section !pt-0" data-testid="contact-section">
      <div className="mm-container">
        <div className="mm-card grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:p-12">
          <div>
            <p className="mm-eyebrow">Contact &amp; Location</p>
            <h2 className="mm-display mt-3 text-3xl text-neutral-950 dark:text-white sm:text-[40px] sm:leading-[1.05]">Visit Our Showroom</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              Drop by to inspect any vehicle in person or book a test ride. Our team is available 7 days a week.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={getWhatsAppEnquiryUrl(null)} target="_blank" rel="noopener noreferrer" className="mm-btn mm-btn-whatsapp" data-testid="contact-whatsapp-link">
                <MessageSquare size={16} /> WhatsApp
              </a>
              <a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="mm-btn mm-btn-dark" data-testid="contact-call-link">
                <Phone size={16} /> Call now
              </a>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="rounded-[18px] border border-black/[0.07] p-5 dark:border-white/[0.07] sm:col-span-2">
              <MapPin size={19} className="text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]" />
              <h3 className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-white">Showroom Location</h3>
              <p className="mt-1 text-[14px] text-neutral-600 dark:text-neutral-400">{SHOWROOM_CONTACT.address}</p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--mm-gold-lo)] hover:underline dark:text-[color:var(--mm-gold)]" data-testid="contact-directions-link">
                Get directions <ArrowRight size={13} />
              </a>
            </li>
            <li className="rounded-[18px] border border-black/[0.07] p-5 dark:border-white/[0.07]">
              <Phone size={19} className="text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]" />
              <h3 className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-white">Direct Phone &amp; WhatsApp</h3>
              <a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="mt-1 block text-[14px] font-semibold text-neutral-900 hover:underline dark:text-white">{SHOWROOM_CONTACT.phone}</a>
              <a href={`mailto:${SHOWROOM_CONTACT.email}`} className="mt-1 flex items-center gap-1.5 text-[13px] text-neutral-500 hover:underline"><Mail size={13} /> {SHOWROOM_CONTACT.email}</a>
            </li>
            <li className="rounded-[18px] border border-black/[0.07] p-5 dark:border-white/[0.07]">
              <Clock size={19} className="text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]" />
              <h3 className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-white">Showroom Hours</h3>
              <p className="mt-1 text-[14px] text-neutral-600 dark:text-neutral-400">{SHOWROOM_CONTACT.businessHours}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function PublicFooter() {
  const links = [
    ["#browse-bikes", "Inventory"],
    ["#categories", "Categories"],
    ["#standards", "120-Point Check"],
    ["#about", "About"],
    ["#contact", "Contact"],
  ];
  return (
    <footer className="bg-[color:var(--mm-ink-950)] text-white" data-testid="public-footer">
      <div className="mm-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[color:var(--mm-gold)] text-[13px] font-extrabold text-[#120f08]">MM</span>
            <span className="mm-display text-[15px] tracking-[0.08em]">METRO <span className="text-[color:var(--mm-gold)]">MOTORS</span></span>
          </div>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/55">
            Metro Motors Bengaluru — certified pre-owned motorcycles, scooters and cars with transparent pricing.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Explore</p>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/70">
            {links.map(([href, label]) => (
              <li key={href}><a href={href} className="transition-colors hover:text-white">{label}</a></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Showroom</p>
          <ul className="mt-4 grid gap-2.5 text-[14px] text-white/70">
            <li>{SHOWROOM_CONTACT.address}</li>
            <li><a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="hover:text-white">{SHOWROOM_CONTACT.phone}</a></li>
            <li>{SHOWROOM_CONTACT.businessHours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.07]">
        <div className="mm-container flex flex-col items-center justify-between gap-4 py-6 text-[12px] text-white/45 sm:flex-row">
          <span>© {new Date().getFullYear()} Metro Motors. All rights reserved.</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-medium text-white/70 transition-colors hover:border-[color:var(--mm-gold)] hover:text-white"
            data-testid="footer-admin-login-link"
          >
            <Shield size={12} />
            <span>Admin Login</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
