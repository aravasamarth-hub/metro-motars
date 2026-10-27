import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { SHOWROOM_CONTACT } from "@/data/customerEnquiry";

export function CertificationSection() {
  const checkItems = [
    {
      title: "Engine & Transmission Testing",
      desc: "Full cylinder compression test, cold start idling analysis, clutch engagement check, and smooth gearbox operation.",
    },
    {
      title: "Chassis & Frame Alignment",
      desc: "Laser/dyno straightness verification ensuring zero structural bending, accidental damage, or hidden stress fractures.",
    },
    {
      title: "Braking & Safety Systems",
      desc: "Rotor wear measurement, brake pad thickness audit, hydraulic fluid flush, and ABS sensor diagnostic calibration.",
    },
    {
      title: "Electrical & Battery Health",
      desc: "Alternator charging rate, battery health check under load, starter relay, LED headlamp throw, and digital console verification.",
    },
    {
      title: "Legal Title & RTO Verification",
      desc: "100% verified Parivahan registry check confirming zero active hypothecation/loans, zero challans, and authentic registration.",
    },
    {
      title: "Suspension & Tyres",
      desc: "Fork seals and stanchion inspection, rear monoshock rebound test, and minimum 60% tread life verified on all wheels.",
    },
  ];

  return (
    <section id="standards" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck size={14} /> Quality &amp; Trust
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          The 120-Point Showroom Certification
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Every motorcycle in our inventory undergoes a thorough multi-point mechanical and legal audit before being approved for sale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checkItems.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm mb-4">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              {item.title}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutShowroomSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 font-bold text-xs uppercase tracking-wider mb-3">
            <Sparkles size={13} /> Bangalore&apos;s Motorcycling Atelier
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
            About Metro Motors
          </h2>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <p>
              Founded in Bangalore, <strong>Metro Motors</strong> was established with a singular mission: to make buying and owning a pre-owned performance motorcycle completely transparent, reliable, and hassle-free.
            </p>
            <p>
              Unlike informal classifieds or unverified street brokers, every motorcycle in our flagship Indiranagar showroom has a verified history, authentic ownership documents, and an exhaustive 120-point mechanical evaluation.
            </p>
            <p>
              From test rides to seamless RTO ownership transfers, our team manages the entire process so you can ride away with absolute peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-6 text-center">
            <div>
              <div className="text-2xl font-black text-amber-500">100%</div>
              <span className="text-[11px] text-neutral-500 font-medium">Verified History</span>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">RTO</div>
              <span className="text-[11px] text-neutral-500 font-medium">Transfer Assistance</span>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-500">Zero</div>
              <span className="text-[11px] text-neutral-500 font-medium">Hidden Broker Fees</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 aspect-[4/3] shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80"
            alt="Metro Motors Showroom Atelier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
            <div className="text-white">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Flagship Showroom
              </span>
              <p className="text-sm font-semibold text-neutral-200">
                100ft Road, Indiranagar, Bengaluru
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactShowroomSection() {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          Visit Our Showroom
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Drop by to inspect any motorcycle in person or take a test drive. Our team is available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            Showroom Location
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {SHOWROOM_CONTACT.address}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Phone size={24} />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            Direct Phone &amp; WhatsApp
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
            Call our team directly for availability:
          </p>
          <a
            href={`tel:${SHOWROOM_CONTACT.rawPhone}`}
            className="text-sm font-black text-amber-500 hover:text-amber-600 block"
          >
            {SHOWROOM_CONTACT.phone}
          </a>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Clock size={24} />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            Showroom Hours
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {SHOWROOM_CONTACT.businessHours}
          </p>
        </div>
      </div>
    </section>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-950/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-amber-500/40 text-amber-500 font-black flex items-center justify-center text-xs">
            MM
          </div>
          <div>
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              Metro Motors Bengaluru
            </span>
            <span className="text-[11px] text-neutral-500 block">
              Certified Pre-Owned Motorcycles
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-neutral-500">
          <a href="#browse-bikes" className="hover:text-amber-500 transition-colors">
            Inventory
          </a>
          <a href="#standards" className="hover:text-amber-500 transition-colors">
            120-Point Check
          </a>
          <a href="#about" className="hover:text-amber-500 transition-colors">
            About
          </a>
          <a href="#contact" className="hover:text-amber-500 transition-colors">
            Contact
          </a>
        </div>

        <div className="text-[11px] text-neutral-400">
          © {new Date().getFullYear()} Metro Motors. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
