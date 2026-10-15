import React, { useEffect, useRef, useState } from "react";
import { animate, createTimeline } from "animejs";
import { Bike, ShieldCheck, Warehouse, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface AnimeDealJourneyProps {
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
    badge: "Step 01",
  },
  {
    step: 2,
    title: "120-Point Inspection",
    subtitle: "Chassis, Engine, Electricals & Dyno Test",
    icon: ShieldCheck,
    badge: "Step 02",
  },
  {
    step: 3,
    title: "Fleet In-Stock",
    subtitle: "Live in Showroom & IndexedDB Catalog",
    icon: Warehouse,
    badge: "Step 03",
  },
  {
    step: 4,
    title: "Buyer Booking",
    subtitle: "Sale Agreement, Token & Finance Milestones",
    icon: Sparkles,
    badge: "Step 04",
  },
  {
    step: 5,
    title: "RTO Transfer & Delivery",
    subtitle: "RC Smart Card Dispatch & Key Handover",
    icon: CheckCircle2,
    badge: "Step 05",
  },
];

export function AnimeDealJourney({
  currentStage = 3,
  className = "",
  onStageClick,
}: AnimeDealJourneyProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<any>(null);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (pathRef.current) pathRef.current.style.strokeDashoffset = "0";
      return;
    }

    const path = pathRef.current;
    const glowPath = glowPathRef.current;
    if (!path) return;

    const totalLen = path.getTotalLength ? path.getTotalLength() : 1200;
    path.style.strokeDasharray = `${totalLen}`;
    path.style.strokeDashoffset = `${totalLen}`;

    if (glowPath) {
      glowPath.style.strokeDasharray = `${totalLen}`;
      glowPath.style.strokeDashoffset = `${totalLen}`;
    }

    const tl = createTimeline({
      loop: true,
      loopDelay: 2000,
      alternate: false,
    });
    timelineRef.current = tl;

    // 1. Draw SVG roadmap stroke
    tl.add(path, {
      strokeDashoffset: [totalLen, 0],
      duration: 2400,
      ease: "inOutQuad",
    });

    if (glowPath) {
      tl.add(
        glowPath,
        {
          strokeDashoffset: [totalLen, 0],
          duration: 2400,
          ease: "inOutQuad",
        },
        0
      );
    }

    // 2. Pulse step nodes in sequence as laser path passes
    nodesRef.current.forEach((node, i) => {
      if (node) {
        tl.add(
          node,
          {
            scale: [1, 1.2, 1],
            borderColor: ["rgba(245, 158, 11, 0.2)", "rgba(245, 158, 11, 0.9)", "rgba(245, 158, 11, 0.4)"],
            duration: 400,
            ease: "outBack",
          },
          i * 450 + 200
        );
      }
    });

    return () => {
      if (timelineRef.current && typeof timelineRef.current.pause === "function") {
        timelineRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={`relative rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 shadow-md shadow-neutral-200/50 dark:shadow-xl p-5 overflow-hidden ${className}`}>
      {/* Background Anime Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
              Anime.js v4 · Automotive Lifecycle Pipeline
            </span>
          </div>
          <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
            5-Stage Showroom Deal & RTO Verification Engine
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
          <span>Active Phase:</span>
          <span className="text-amber-500">Stage {currentStage} of 5</span>
        </div>
      </div>

      {/* SVG Connecting laser line track */}
      <div className="relative py-2">
        <div className="absolute top-[38px] left-6 right-6 h-1 hidden md:block">
          <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 24">
            <defs>
              <linearGradient id="animeDealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="35%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {/* Base track */}
            <path
              d="M 20 12 L 980 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-200 dark:text-neutral-800"
            />
            {/* Active Anime.js laser path */}
            <path
              ref={pathRef}
              d="M 20 12 L 980 12"
              fill="none"
              stroke="url(#animeDealGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Glowing blur path */}
            <path
              ref={glowPathRef}
              d="M 20 12 L 980 12"
              fill="none"
              stroke="url(#animeDealGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              className="opacity-40 blur-[3px]"
            />
          </svg>
        </div>

        {/* 5 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = st.step < currentStage;
            const isCurrent = st.step === currentStage;
            const isPending = st.step > currentStage;

            return (
              <div
                key={st.step}
                ref={(el) => { nodesRef.current[idx] = el; }}
                onClick={() => onStageClick && onStageClick(st.step)}
                onMouseEnter={() => setActiveHover(st.step)}
                onMouseLeave={() => setActiveHover(null)}
                className={`flex flex-col items-center md:items-start text-center md:text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/50 shadow-md shadow-amber-500/10"
                    : isCompleted
                    ? "bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-300 dark:hover:border-emerald-500/50"
                    : "bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                {/* Node icon circle */}
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isCurrent
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/30 font-bold"
                        : isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? "bg-amber-100 dark:bg-amber-400/20 text-amber-700 dark:text-amber-500"
                        : isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-500"
                    }`}
                  >
                    {st.badge}
                  </span>
                </div>

                <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100 leading-tight">
                  {st.title}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-snug">
                  {st.subtitle}
                </div>

                <div className="mt-3 pt-2 w-full border-t border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between text-[10px] font-semibold">
                  <span
                    className={
                      isCurrent
                        ? "text-amber-600 dark:text-amber-500 font-bold"
                        : isCompleted
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-neutral-500 dark:text-neutral-400"
                    }
                  >
                    {isCurrent ? "● Active Step" : isCompleted ? "✓ Completed" : "○ Scheduled"}
                  </span>
                  <ArrowRight size={11} className="text-neutral-400 opacity-60" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AnimeDealJourney;
