import React from "react";
import { useAnimeRoadmap } from "@/hooks/useAnimeRoadmap";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  FileCheck2,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export function ShowcaseRoadmap() {
  const { pathRef, stepNodesRef } = useAnimeRoadmap();

  const steps = [
    {
      num: "01",
      title: "120-Point Technical Check",
      desc: "Engine compression, brake shoe wear, LOF fluids flush, electrical harness, and dyno road testing.",
      icon: Wrench,
      accent: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      num: "02",
      title: "RTO & Legal Clearance",
      desc: "Verification of smartcard RC, hypothecation loan closure, tax validity, PUC, and police NOC certification.",
      icon: FileCheck2,
      accent: "text-cyan-500",
      bg: "bg-cyan-500/10 border-cyan-500/30",
    },
    {
      num: "03",
      title: "Biometric Legal Deed",
      desc: "Mantra 500 DPI optical thumbprint capture for Seller and Buyer, generating an immutable stamped agreement.",
      icon: Fingerprint,
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
    {
      num: "04",
      title: "45-Minute Key Handover",
      desc: "Immediate delivery gate pass, spare key bundle, warranty handbook, and secure bank escrow settlement.",
      icon: KeyRound,
      accent: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/30",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
        >
          ANIME.JS V4 SVG ROADMAP
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
          The 4-Step Verification Journey
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
          From multi-point dynamometer diagnostics to biometric deed certification, explore how
          every vehicle is cleared for the open road.
        </p>
      </div>

      {/* SVG Connecting Track Driven by Anime.js v4 */}
      <div className="relative">
        <div className="hidden lg:block absolute top-[68px] left-[10%] right-[10%] h-8 pointer-events-none z-0">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 1000 40"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Background static faint track */}
            <path
              d="M 20 20 Q 250 -10 500 20 T 980 20"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
              strokeDasharray="6 6"
              fill="none"
            />
            {/* Active Anime.js v4 animated laser path */}
            <path
              ref={pathRef}
              d="M 20 20 Q 250 -10 500 20 T 980 20"
              stroke="url(#animeRoadmapGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="animeRoadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 4 Inspection Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.num}
                className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors"
              >
                <CardContent className="p-6">
                  {/* Step Node indicator ref hooked to Anime.js v4 */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      ref={(el) => {
                        stepNodesRef.current[idx] = el;
                      }}
                      className={`w-14 h-14 rounded-2xl ${step.bg} ${step.accent} border flex items-center justify-center font-bold text-xl shadow-md transition-transform duration-300`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-black text-neutral-200 dark:text-neutral-800 group-hover:text-amber-500/20 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-neutral-950 dark:text-white mb-2 group-hover:text-amber-500 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ShowcaseRoadmap;
