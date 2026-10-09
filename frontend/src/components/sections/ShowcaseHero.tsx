import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { FloatingPaths } from "@/components/kokonut/BackgroundPaths";
import { ParticleButton } from "@/components/kokonut/ParticleButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnimeHeroTitle } from "@/hooks/useAnimeHeroTitle";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Gauge,
  CheckCircle2,
} from "lucide-react";

export function ShowcaseHero() {
  const navigate = useNavigate();
  const { containerRef, badgeRef, headlineRef, subtitleRef } = useAnimeHeroTitle();

  const handleScrollToBooking = () => {
    const el = document.querySelector("#booking");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToFleet = () => {
    const el = document.querySelector("#fleet");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-16 bg-neutral-50 dark:bg-[#060911]">
      {/* 1. KokonutUI: Ambient Floating Vector Paths Background */}
      <div className="absolute inset-0 z-0 opacity-80 dark:opacity-60">
        <FloatingPaths position={1} />
      </div>

      {/* Ambient Radial Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-transparent to-neutral-50/90 dark:to-[#060911]/90 z-1" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={containerRef}>
        {/* 2. Anime.js v4 Driven Eyebrow Badge */}
        <div ref={badgeRef} className="inline-flex items-center gap-2 mb-6">
          <Badge
            variant="outline"
            className="px-4 py-1.5 rounded-full border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs tracking-wide shadow-sm backdrop-blur-md"
          >
            <Sparkles size={13} className="text-amber-500 animate-pulse" />
            <span>ENTERPRISE FLEET & RESELLING PLATFORM · BANGALORE</span>
          </Badge>
        </div>

        {/* 2. Anime.js v4 Driven Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08] mb-6 max-w-4xl mx-auto"
        >
          Curated Luxury Motoring,{" "}
          <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            Biometrically Secured.
          </span>
        </h1>

        {/* 2. Anime.js v4 Driven Subtitle */}
        <p
          ref={subtitleRef}
          className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Bangalore's premier reselling showroom. 120-point certified Royal Enfield, KTM, and
          Kawasaki fleet with instant optical thumbprint legal deeds and zero ownership friction.
        </p>

        {/* 3. Motion + KokonutUI: CTA Actions */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
        >
          {/* KokonutUI: ParticleButton */}
          <ParticleButton
            onClick={handleScrollToBooking}
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-extrabold px-6 py-6 text-sm rounded-xl shadow-xl shadow-amber-500/25 border-none"
          >
            <span>Book VIP Test Drive</span>
            <ArrowRight size={16} className="ml-1.5" />
          </ParticleButton>

          {/* shadcn Button with Motion Hover */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleScrollToFleet}
            className="px-6 py-6 text-sm font-semibold rounded-xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 backdrop-blur-md"
          >
            Explore 42 Fleet Vehicles
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/login")}
            className="px-5 py-6 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-amber-500"
          >
            Dealer Terminal Login →
          </Button>
        </motion.div>

        {/* 3. Motion: Hero Quality Badges */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">120-Point Check</div>
              <p className="text-[10px] text-neutral-500">Dyno & Chassis Certified</p>
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
              <p className="text-[10px] text-neutral-500">Instant RTO NOC & Keys</p>
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
    </section>
  );
}

export default ShowcaseHero;
