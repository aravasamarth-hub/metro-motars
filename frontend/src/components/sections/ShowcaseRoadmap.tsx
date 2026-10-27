import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import {
  Wrench,
  FileCheck2,
  Fingerprint,
  KeyRound,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "120-Point Technical Check",
    desc: "Engine compression, brake shoe wear, LOF fluids flush, electrical harness, and dyno road testing.",
    icon: Wrench,
    accent: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/25",
    pillBg: "bg-amber-500",
  },
  {
    num: "02",
    title: "RTO & Legal Clearance",
    desc: "Verification of smartcard RC, hypothecation loan closure, tax validity, PUC, and police NOC certification.",
    icon: FileCheck2,
    accent: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/25",
    pillBg: "bg-cyan-500",
  },
  {
    num: "03",
    title: "Biometric Legal Deed",
    desc: "Mantra 500 DPI optical thumbprint capture for Seller and Buyer, generating an immutable stamped agreement.",
    icon: Fingerprint,
    accent: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    pillBg: "bg-emerald-500",
  },
  {
    num: "04",
    title: "45-Minute Key Handover",
    desc: "Immediate delivery gate pass, spare key bundle, warranty handbook, and secure bank escrow settlement.",
    icon: KeyRound,
    accent: "text-indigo-500",
    bg: "bg-indigo-500/10 border-indigo-500/25",
    pillBg: "bg-indigo-500",
  },
];

export function ShowcaseRoadmap() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
        >
          VERIFICATION ROADMAP
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
          The 4-Step Certification Journey
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
          From multi-point dynamometer diagnostics to biometric deed certification, explore how
          every vehicle is cleared for the open road.
        </p>
      </div>

      {/* 4 Inspection Step Cards with Motion Stagger & Hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col justify-between border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    {/* Step Node indicator & Number */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl ${step.bg} ${step.accent} border flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className="text-3xl font-black text-neutral-200 dark:text-neutral-800 group-hover:text-amber-500/20 transition-colors font-mono">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-neutral-950 dark:text-white mb-2 group-hover:text-amber-500 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                      Phase {step.num} Cleared
                    </span>
                    <ArrowRight size={13} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default ShowcaseRoadmap;
