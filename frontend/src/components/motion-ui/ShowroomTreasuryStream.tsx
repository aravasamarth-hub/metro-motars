import React from "react";
import { ArrowDownRight, Wallet, ArrowUpRight, ShieldCheck, TrendingUp } from "lucide-react";
import { BorderBeam } from "./BorderBeam";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ShowroomTreasuryStreamProps {
  inflow?: number;
  outflow?: number;
  margin?: number;
  className?: string;
}

export function ShowroomTreasuryStream({
  inflow = 9140000,
  outflow = 8455000,
  margin = 685000,
  className = "",
}: ShowroomTreasuryStreamProps) {
  const yieldPercent = ((margin / (inflow || 1)) * 100).toFixed(1);

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl p-4 sm:p-6 shadow-xl shadow-neutral-200/40 dark:shadow-neutral-950/40 overflow-hidden",
        className
      )}
      data-testid="anime-cashflow-flow"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
              Liquidity Stream
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-950 dark:text-white mt-0.5 tracking-tight">
            Real-Time Showroom Liquidity &amp; Margin Trajectory
          </h3>
        </div>

        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full self-start sm:self-auto border border-emerald-500/20">
          <ShieldCheck size={14} />
          Settled via IndexedDB
        </span>
      </div>

      {/* 3 Connected Liquidity Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-stretch">
        {/* Node 1: Buyer Inflow */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] dark:bg-emerald-500/5 flex items-center justify-between shadow-sm relative overflow-hidden"
        >
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownRight size={14} />
              Buyer Inflow
            </span>
            <div className="text-xl font-black text-neutral-950 dark:text-white mt-1">
              ₹ {(inflow / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
              Cash, UPI &amp; Bank RTGS
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/25 shrink-0">
            IN
          </div>
        </motion.div>

        {/* Node 2: Central Vault / Dealer Margin */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent text-center relative shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <BorderBeam size={140} duration={9} colorFrom="#f59e0b" colorTo="#fbbf24" />

          <div>
            <div className="inline-flex p-2 rounded-xl bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30 mb-1.5">
              <Wallet size={18} />
            </div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Showroom Gross Margin
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              +₹ {(margin / 100000).toFixed(2)} L
            </div>
          </div>
          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-center gap-1">
            <TrendingUp size={12} className="text-amber-500" />
            <span>{yieldPercent}% Dealer Yield</span>
          </div>
        </motion.div>

        {/* Node 3: Procurement & Refurb Outflow */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-xl border border-sky-500/25 bg-sky-500/[0.04] dark:bg-sky-500/5 flex items-center justify-between shadow-sm relative overflow-hidden"
        >
          <div>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <ArrowUpRight size={14} />
              Procurement &amp; Refurb
            </span>
            <div className="text-xl font-black text-neutral-950 dark:text-white mt-1">
              ₹ {(outflow / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
              Seller Payouts &amp; Dyno Tune
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-xs border border-sky-500/25 shrink-0">
            OUT
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ShowroomTreasuryStream;
