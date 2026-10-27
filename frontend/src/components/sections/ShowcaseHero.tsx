import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BackgroundAtmosphere } from "@/components/motion-ui/BackgroundAtmosphere";
import { BlurText } from "@/components/motion-ui/BlurText";
import { ShimmerButton } from "@/components/motion-ui/ShimmerButton";
import { VelocityMarquee } from "@/components/motion-ui/VelocityMarquee";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Gauge,
  CheckCircle2,
} from "lucide-react";

const MARQUEE_ITEMS = [
  "120-Point Dyno Certified",
  "Mantra 500 DPI Biometric Deeds",
  "Instant Parivahan RTO NOC",
  "Zero Hypothecation Risk",
  "45-Minute Showroom Handover",
  "HDFC & IDFC Paperless EMI",
  "Curated Bangalore Fleet",
];

export function ShowcaseHero() {
  const navigate = useNavigate();

  const handleScrollToBooking = () => {
    const el = document.querySelector("#booking");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToFleet = () => {
    const el = document.querySelector("#fleet");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-12 bg-neutral-50 dark:bg-[#060911]">
      {/* 1. Aceternity + React Bits: Atmospheric Subtle Aurora & Dot Grid */}
      <BackgroundAtmosphere />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center my-auto">
        {/* 2. Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 rounded-full border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs tracking-wider shadow-sm backdrop-blur-md"
          >
            <Sparkles size={13} className="text-amber-500 mr-1 inline-block" />
            <span>EXECUTIVE FLEET &amp; RESELLING ATELIER · BANGALORE</span>
          </Badge>
        </motion.div>

        {/* 3. React Bits: BlurText Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.12] mb-6 max-w-4xl mx-auto">
          <BlurText
            text="Curated Luxury Motoring, Biometrically Secured."
            delay={0.15}
            highlightWords={["Biometrically", "Secured."]}
            highlightClass="text-amber-500 dark:text-amber-400 font-black"
          />
        </h1>

        {/* 4. Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Bangalore&apos;s premier reselling showroom. 120-point certified Royal Enfield, KTM, and
          Kawasaki fleet with instant optical thumbprint legal deeds and zero ownership friction.
        </motion.p>

        {/* 5. Magic UI: ShimmerButton CTA & Actions */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45, ease: "easeOut" }}
        >
          <ShimmerButton
            onClick={handleScrollToBooking}
            className="px-7 py-3 text-sm rounded-xl font-black shadow-xl shadow-amber-500/25"
          >
            <span>Book VIP Test Drive</span>
            <ArrowRight size={16} />
          </ShimmerButton>

          <Button
            variant="outline"
            size="lg"
            onClick={handleScrollToFleet}
            className="px-6 py-3 text-sm font-bold rounded-xl border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 backdrop-blur-md shadow-sm"
          >
            Explore 42 Fleet Vehicles
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/login")}
            className="px-4 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-amber-500"
          >
            Dealer Terminal Login →
          </Button>
        </motion.div>

        {/* 6. Motion: Trust Pillars */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto pt-6 border-t border-neutral-200/80 dark:border-neutral-800/80 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">120-Point Check</div>
              <p className="text-[10px] text-neutral-500">Dyno &amp; Chassis Certified</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Fingerprint size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Biometric Deed</div>
              <p className="text-[10px] text-neutral-500">Mantra 500 DPI Thumbprint</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
              <Gauge size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">45-Min Handover</div>
              <p className="text-[10px] text-neutral-500">Instant RTO NOC &amp; Keys</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Clean Titles</div>
              <p className="text-[10px] text-neutral-500">Zero Hypothecation Risk</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 7. Magic UI: Velocity Marquee Ticker */}
      <div className="w-full mt-10 relative z-10 border-y border-neutral-200/60 dark:border-neutral-800/60 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-md">
        <VelocityMarquee items={MARQUEE_ITEMS} speed={28} />
      </div>
    </section>
  );
}

export default ShowcaseHero;
