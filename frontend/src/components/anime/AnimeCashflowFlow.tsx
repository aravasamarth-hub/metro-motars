import React, { useEffect, useRef } from "react";
import { animate, createTimeline } from "animejs";
import { ArrowDownRight, Wallet, ArrowUpRight, TrendingUp, ShieldCheck } from "lucide-react";

interface AnimeCashflowFlowProps {
  inflow?: number;
  outflow?: number;
  margin?: number;
  className?: string;
}

export function AnimeCashflowFlow({
  inflow = 9140000,
  outflow = 8455000,
  margin = 685000,
  className = "",
}: AnimeCashflowFlowProps) {
  const laserInRef = useRef<SVGPathElement>(null);
  const laserOutRef = useRef<SVGPathElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pIn = laserInRef.current;
    const pOut = laserOutRef.current;
    const vault = vaultRef.current;
    if (!pIn || !pOut || !vault) return;

    const inLen = pIn.getTotalLength ? pIn.getTotalLength() : 400;
    const outLen = pOut.getTotalLength ? pOut.getTotalLength() : 400;

    pIn.style.strokeDasharray = `${inLen}`;
    pIn.style.strokeDashoffset = `${inLen}`;
    pOut.style.strokeDasharray = `${outLen}`;
    pOut.style.strokeDashoffset = `${outLen}`;

    const tl = createTimeline({
      loop: true,
      loopDelay: 1500,
    });
    tlRef.current = tl;

    tl.add(pIn, {
      strokeDashoffset: [inLen, 0],
      duration: 1600,
      ease: "inOutSine",
    });

    tl.add(
      vault,
      {
        scale: [1, 1.08, 1],
        boxShadow: [
          "0 0 0 0 rgba(245, 158, 11, 0)",
          "0 0 25px 4px rgba(245, 158, 11, 0.4)",
          "0 0 0 0 rgba(245, 158, 11, 0)",
        ],
        duration: 800,
        ease: "outBack",
      },
      "-=400"
    );

    tl.add(
      pOut,
      {
        strokeDashoffset: [outLen, 0],
        duration: 1600,
        ease: "inOutSine",
      },
      "-=200"
    );

    return () => {
      if (tlRef.current && typeof tlRef.current.pause === "function") {
        tlRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      className={`relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xl ${className}`}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
            Anime.js v4 · Treasury Stream
          </span>
          <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Real-Time Showroom Liquidity Trajectory
          </h4>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <ShieldCheck size={14} />
          Settled via IndexedDB
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Source: Buyer Inflow */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <ArrowDownRight size={14} />
              Buyer Inflow
            </span>
            <div className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              ₹ {(inflow / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-neutral-400">Cash, UPI & Bank RTGS</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            IN
          </div>
        </div>

        {/* Central Hub: Metro Motors Vault */}
        <div
          ref={vaultRef}
          className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent text-center relative"
        >
          <div className="inline-flex p-2 rounded-xl bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30 mb-1">
            <Wallet size={20} />
          </div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            Showroom Gross Margin
          </div>
          <div className="text-xl font-extrabold text-amber-500 mt-0.5">
            +₹ {(margin / 100000).toFixed(2)} L
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {((margin / (inflow || 1)) * 100).toFixed(1)}% Dealer Yield
          </span>
        </div>

        {/* Destination: Seller Payouts */}
        <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
              <ArrowUpRight size={14} />
              Procurement & Refurb
            </span>
            <div className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100 mt-1">
              ₹ {(outflow / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-neutral-400">Seller Payments & Maintenance</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            OUT
          </div>
        </div>
      </div>

      {/* SVG Connecting Flow Paths */}
      <div className="hidden md:block mt-2">
        <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 16">
          <defs>
            <linearGradient id="inflowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="outflowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <path d="M 50 8 L 260 8" stroke="currentColor" strokeWidth="1.5" className="text-neutral-200 dark:text-neutral-800" />
          <path ref={laserInRef} d="M 50 8 L 260 8" stroke="url(#inflowGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 340 8 L 550 8" stroke="currentColor" strokeWidth="1.5" className="text-neutral-200 dark:text-neutral-800" />
          <path ref={laserOutRef} d="M 340 8 L 550 8" stroke="url(#outflowGrad)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default AnimeCashflowFlow;
