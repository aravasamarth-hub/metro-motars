import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bike, ShieldCheck, Warehouse, Sparkles, CheckCircle2, ArrowRight, Zap, Check } from "lucide-react";
import { BorderBeam } from "./BorderBeam";
import { cn } from "@/lib/utils";

interface ShowroomDealPipelineProps {
  currentStage?: number; // 1 to 5
  className?: string;
  onStageClick?: (stage: number) => void;
}

const STAGES = [
  {
    step: 1,
    title: "Procurement & NOC",
    subtitle: "Seller Form 28/29/30 & Bank Clearance",
    icon: Bike,
    badge: "01",
  },
  {
    step: 2,
    title: "120-Point Inspection",
    subtitle: "Chassis, Engine, Dyno & Electronics",
    icon: ShieldCheck,
    badge: "02",
  },
  {
    step: 3,
    title: "Fleet In-Stock",
    subtitle: "Live in Showroom & IndexedDB Catalog",
    icon: Warehouse,
    badge: "03",
  },
  {
    step: 4,
    title: "Buyer Booking",
    subtitle: "Sale Agreement, Token & Loan Clearance",
    icon: Sparkles,
    badge: "04",
  },
  {
    step: 5,
    title: "RTO Transfer & Delivery",
    subtitle: "RC Smartcard Dispatch & Key Handover",
    icon: CheckCircle2,
    badge: "05",
  },
];

export function ShowroomDealPipeline({
  currentStage = 3,
  className = "",
  onStageClick,
}: ShowroomDealPipelineProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const progressPercent = Math.min(100, Math.max(0, ((currentStage - 0.5) / 5) * 100));

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl p-4 sm:p-6 shadow-xl shadow-neutral-200/40 dark:shadow-neutral-950/40 overflow-hidden",
        className
      )}
      data-testid="anime-deal-journey"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 font-mono">
              Lifecycle Pipeline
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-950 dark:text-white mt-0.5 tracking-tight">
            5-Stage Showroom Deal &amp; RTO Verification
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-sm">
          <Zap size={14} className="text-amber-500" />
          <span>Active Phase:</span>
          <span className="font-extrabold text-amber-600 dark:text-amber-400">Stage {currentStage} of 5</span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="relative mb-5 px-1">
        <div className="w-full h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 relative overflow-hidden">
          <motion.div
            initial={shouldReduceMotion ? { width: `${progressPercent}%` } : { width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500"
          />
        </div>
      </div>

      {/* Mobile Swipe Cue */}
      <div className="flex md:hidden items-center justify-between text-[11px] text-neutral-400 mb-2.5 px-0.5">
        <span className="font-semibold text-neutral-500 dark:text-neutral-400">Showroom Milestones</span>
        <span className="text-amber-500 font-medium text-[10px]">Swipe &rarr;</span>
      </div>

      {/* 5 Stages Grid / Mobile Reel */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-3 pb-2 md:pb-0 scrollbar-none snap-x snap-mandatory">
        {STAGES.map((st) => {
          const Icon = st.icon;
          const isCompleted = st.step < currentStage;
          const isCurrent = st.step === currentStage;

          return (
            <motion.div
              key={st.step}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStageClick?.(st.step)}
              onMouseEnter={() => setHoveredStage(st.step)}
              onMouseLeave={() => setHoveredStage(null)}
              className={cn(
                "relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer min-w-[210px] md:min-w-0 snap-start shrink-0 md:shrink overflow-hidden",
                isCurrent
                  ? "bg-amber-500/[0.07] dark:bg-amber-500/10 border-amber-400/80 dark:border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30"
                  : isCompleted
                  ? "bg-emerald-500/[0.04] dark:bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-white/60 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700"
              )}
            >
              {/* Border Beam on Current Stage */}
              {isCurrent && <BorderBeam size={120} duration={8} colorFrom="#f59e0b" colorTo="#fbbf24" />}

              <div>
                {/* Node Header */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                      isCurrent
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-black shadow-amber-500/30"
                        : isCompleted
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                      isCurrent
                        ? "bg-amber-100 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40"
                        : isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    Step {st.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h4 className="font-extrabold text-xs text-neutral-950 dark:text-white leading-tight">
                  {st.title}
                </h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-snug">
                  {st.subtitle}
                </p>
              </div>

              {/* Status Footer */}
              <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] font-bold">
                <span
                  className={
                    isCurrent
                      ? "text-amber-600 dark:text-amber-400 flex items-center gap-1"
                      : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                      : "text-neutral-500 dark:text-neutral-400"
                  }
                >
                  {isCurrent ? "⚡ Active Phase" : isCompleted ? "✓ Completed" : "○ Scheduled"}
                </span>
                <ArrowRight size={11} className="text-neutral-400 opacity-60" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ShowroomDealPipeline;
