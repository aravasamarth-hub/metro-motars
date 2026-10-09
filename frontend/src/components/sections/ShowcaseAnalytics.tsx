import React from "react";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { MotionCounter } from "@/components/motion/MotionCounter";
import { FleetValuationAreaChart } from "@/components/bklit/FleetValuationAreaChart";
import { InventoryDistributionBarChart } from "@/components/bklit/InventoryDistributionBarChart";
import { InspectionRadialGauge } from "@/components/bklit/InspectionRadialGauge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Database, ShieldCheck, Clock, CircleDollarSign } from "lucide-react";

export function ShowcaseAnalytics() {
  return (
    <section id="analytics" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-neutral-100/50 dark:bg-neutral-900/30 rounded-3xl my-8 border border-neutral-200/60 dark:border-neutral-800/60">
      <MotionReveal className="text-center max-w-3xl mx-auto mb-16">
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
        >
          LIVE SHOWROOM TELEMETRY & DATA VISUALIZATION
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
          Bklit Analytics & Deal Economics
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
          Transparent metrics powered by Bklit composable charts and cloud-indexed inventory data.
          Track fleet valuation, turnover velocity, and mechanical audit benchmarks in real time.
        </p>
      </MotionReveal>

      {/* 4 Key Metrics Bar with Motion Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MotionReveal delay={0.1}>
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                <CircleDollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  Live Fleet Value
                </p>
                <div className="text-2xl font-black text-neutral-950 dark:text-white">
                  <MotionCounter to={1.84} decimals={2} prefix="₹" suffix=" Cr" duration={1.8} />
                </div>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp size={11} /> +14.8% this month
                </span>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <Database size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  Active In Stock
                </p>
                <div className="text-2xl font-black text-neutral-950 dark:text-white">
                  <MotionCounter to={42} suffix=" Vehicles" duration={1.4} />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium mt-0.5 block">
                  6 Fast Movers Today
                </span>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>

        <MotionReveal delay={0.3}>
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  Inspection Rating
                </p>
                <div className="text-2xl font-black text-neutral-950 dark:text-white">
                  <MotionCounter to={98.6} decimals={1} suffix="%" duration={1.6} />
                </div>
                <span className="text-[10px] text-emerald-500 font-bold mt-0.5 block">
                  120 Points Verified
                </span>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>

        <MotionReveal delay={0.4}>
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  Avg Delivery Time
                </p>
                <div className="text-2xl font-black text-neutral-950 dark:text-white">
                  <MotionCounter to={45} suffix=" Mins" duration={1.5} />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium mt-0.5 block">
                  Deed & Key Handover
                </span>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>
      </div>

      {/* Bklit Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Fleet Valuation Area Chart (Takes 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <MotionReveal delay={0.2} direction="left">
            <FleetValuationAreaChart />
          </MotionReveal>
        </div>

        {/* Chart 2: Inspection Radial Gauge (Takes 1 column on desktop) */}
        <div>
          <MotionReveal delay={0.3} direction="right">
            <InspectionRadialGauge />
          </MotionReveal>
        </div>

        {/* Chart 3: Brand Distribution Bar Chart (Full width on bottom) */}
        <div className="lg:col-span-3">
          <MotionReveal delay={0.4} direction="up">
            <InventoryDistributionBarChart />
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}

export default ShowcaseAnalytics;
