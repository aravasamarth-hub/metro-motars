import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, CalendarDays, Coins, Sparkles } from "lucide-react";

export interface AgentChartItem {
  name: string;
  deals?: number;
  amountPaid: number; // in Thousands (₹k)
  amountBalance: number; // in Thousands (₹k)
  daysTaken: number; // in Days
  rawPaid?: number; // exact ₹
  rawBalance?: number; // exact ₹
  totalAmount?: number; // exact ₹
  payoutStatus?: "settled" | "pending";
  commission?: number; // backward compatibility
}

const DEFAULT_AGENT_DATA: AgentChartItem[] = [
  { name: "Manjunath (Jayanagar)", deals: 2, amountPaid: 1.5, amountBalance: 1.3, daysTaken: 2, payoutStatus: "pending" },
  { name: "Anand RTO Consult", deals: 3, amountPaid: 2.0, amountBalance: 0, daysTaken: 3, payoutStatus: "settled" },
  { name: "Ramesh Babu (Indiranagar)", deals: 4, amountPaid: 2.0, amountBalance: 1.5, daysTaken: 4, payoutStatus: "pending" },
  { name: "Ramesh Babu (Electronic City)", deals: 2, amountPaid: 2.2, amountBalance: 0, daysTaken: 5, payoutStatus: "settled" },
  { name: "Shivakumar (Koramangala)", deals: 5, amountPaid: 6.5, amountBalance: 0, daysTaken: 7, payoutStatus: "settled" },
  { name: "Ramesh Babu (RTO Consultant)", deals: 1, amountPaid: 1.5, amountBalance: 1.0, daysTaken: 3, payoutStatus: "pending" },
];

export function AgentCommissionChart({ data = DEFAULT_AGENT_DATA }: { data?: AgentChartItem[] }) {
  const [activeMetric, setActiveMetric] = useState<"all" | "paid" | "balance" | "days">("all");

  // Normalize data with backward compatibility
  const normalizedData = (data.length ? data : DEFAULT_AGENT_DATA).map((item) => {
    const amountPaid =
      item.amountPaid !== undefined
        ? item.amountPaid
        : item.payoutStatus === "settled"
        ? item.commission || 2.0
        : Number(((item.commission || 2.5) * 0.6).toFixed(1));

    const amountBalance =
      item.amountBalance !== undefined
        ? item.amountBalance
        : item.payoutStatus === "settled"
        ? 0
        : Number(((item.commission || 2.5) * 0.4).toFixed(1));

    const daysTaken =
      item.daysTaken !== undefined
        ? item.daysTaken
        : Math.max(2, Math.min(8, (item.deals || 1) * 2 + 1));

    // Formatted display name for X axis: cleaner and aesthetic
    const cleaned = item.name
      .replace(/\s+RTO\s+Services/i, "")
      .replace(/\s+Consultant/i, "")
      .replace(/\s+Consult/i, "");
    const shortName = cleaned.length > 22 ? `${cleaned.slice(0, 20)}…` : cleaned;

    return {
      ...item,
      shortName,
      amountPaid,
      amountBalance,
      daysTaken,
      deals: item.deals || 1,
    };
  });


  // Calculate live summary metrics across visible agents
  const totalPaidSum = normalizedData.reduce((acc, d) => acc + d.amountPaid, 0);
  const totalBalanceSum = normalizedData.reduce((acc, d) => acc + d.amountBalance, 0);
  const avgDaysTaken = (
    normalizedData.reduce((acc, d) => acc + d.daysTaken, 0) / (normalizedData.length || 1)
  ).toFixed(1);

  return (
    <Card className="border-neutral-800 bg-neutral-900/90 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Top subtle golden shimmer border */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500/20 via-amber-400/50 to-sky-500/20" />

      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <CardTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Agent Performance & Commission Breakdown</span>
            </CardTitle>
            <Badge
              variant="outline"
              className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[11px] font-semibold px-2 py-0.5 shadow-sm flex items-center gap-1"
            >
              <Sparkles size={11} className="text-amber-400" />
              Performance Telemetry
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Trio-candle analytics: <strong className="text-emerald-400">Amount Paid (Green)</strong>,{" "}
            <strong className="text-yellow-400">Balance Pending (Yellow)</strong>, and{" "}
            <strong className="text-sky-400">Turnaround Duration (Blue)</strong>.
          </CardDescription>
        </div>

        {/* 3 Metric Pills with glowing indicator dots & live totals */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* 1. Amount Paid (Green) */}
          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "paid" ? "all" : "paid")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              activeMetric === "paid" || activeMetric === "all"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10"
                : "bg-neutral-800/40 border-neutral-800 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold">Paid:</span>
            <span className="font-bold text-white font-mono">₹{totalPaidSum.toFixed(1)}k</span>
          </button>

          {/* 2. Amount Balance (Yellow) */}
          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "balance" ? "all" : "balance")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              activeMetric === "balance" || activeMetric === "all"
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-sm shadow-yellow-500/10"
                : "bg-neutral-800/40 border-neutral-800 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50 inline-block" />
            <span className="font-semibold">Balance:</span>
            <span className="font-bold text-white font-mono">₹{totalBalanceSum.toFixed(1)}k</span>
          </button>

          {/* 3. Time Taken in Days (Blue) */}
          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === "days" ? "all" : "days")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              activeMetric === "days" || activeMetric === "all"
                ? "bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-sm shadow-sky-500/10"
                : "bg-neutral-800/40 border-neutral-800 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 inline-block" />
            <span className="font-semibold">Avg Days:</span>
            <span className="font-bold text-white font-mono">{avgDaysTaken}d</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={normalizedData}
              margin={{ top: 18, right: 28, left: -10, bottom: 25 }}
              barCategoryGap="28%"
              barGap={5}
            >
              <defs>
                {/* 1. Green Gradient for Amount Paid */}
                <linearGradient id="paidGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.8} />
                </linearGradient>

                {/* 2. Yellow Gradient for Amount Balance */}
                <linearGradient id="balanceYellowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde047" stopOpacity={0.98} />
                  <stop offset="60%" stopColor="#facc15" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity={0.85} />
                </linearGradient>

                {/* 3. Blue Gradient for Time Taken in Days */}
                <linearGradient id="daysBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.95} />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.8} />
                </linearGradient>

                {/* Glow Filter for Hover */}
                <filter id="candleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <CartesianGrid
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="shortName"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                interval={0}
                angle={-10}
                textAnchor="end"
                dy={6}
              />

              {/* Left Y Axis: Currency Amount (₹k) */}
              <YAxis
                yAxisId="amount"
                orientation="left"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={(val) => `₹${val}k`}
              />

              {/* Right Y Axis: Turnaround Duration (Days) */}
              <YAxis
                yAxisId="days"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#38bdf8", fontSize: 10 }}
                tickFormatter={(val) => `${Math.round(val)}d`}
                allowDecimals={false}
                domain={[0, "auto"]}
              />

              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.03)", radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as typeof normalizedData[0];
                    const isZeroBalance = d.amountBalance === 0;

                    return (
                      <div className="bg-neutral-950/95 border border-neutral-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white text-xs min-w-[260px] animate-in fade-in zoom-in-95 duration-150">
                        {/* Header: Agent Name and Deals Count */}
                        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-2.5 mb-3">
                          <div>
                            <div className="font-extrabold text-white text-sm tracking-tight">
                              {d.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {d.deals} vehicle handover{d.deals > 1 ? "s" : ""}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              isZeroBalance
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]"
                                : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-[10px]"
                            }
                          >
                            {isZeroBalance ? "✓ Paid in Full" : "Pending Balance"}
                          </Badge>
                        </div>

                        {/* 3 Divided Candle Metrics */}
                        <div className="space-y-2">
                          {/* 1. Amount Paid (Green) */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <Coins size={14} className="text-emerald-400" />
                              Amount Paid
                            </span>
                            <span className="font-extrabold text-emerald-300 font-mono text-sm">
                              ₹{(d.amountPaid * 1000).toLocaleString()}
                            </span>
                          </div>

                          {/* 2. Amount Balance (Yellow) */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                              <Clock size={14} className="text-yellow-400" />
                              Amount Balance
                            </span>
                            <span className="font-extrabold text-yellow-300 font-mono text-sm">
                              ₹{(d.amountBalance * 1000).toLocaleString()}
                            </span>
                          </div>

                          {/* 3. Time Taken in Days (Blue) */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                              <CalendarDays size={14} className="text-sky-400" />
                              Time Taken
                            </span>
                            <span className="font-extrabold text-sky-300 font-mono text-sm">
                              {d.daysTaken} Days
                            </span>
                          </div>
                        </div>

                        {/* Footer Status Hint */}
                        <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                          <span>Total Brokerage:</span>
                          <strong className="text-white font-mono">
                            ₹{((d.amountPaid + d.amountBalance) * 1000).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* 1. Candle Part 1: Amount Paid (Green) */}
              {(activeMetric === "all" || activeMetric === "paid") && (
                <Bar
                  yAxisId="amount"
                  dataKey="amountPaid"
                  name="Amount Paid"
                  fill="url(#paidGreenGrad)"
                  radius={[5, 5, 1, 1]}
                  maxBarSize={15}
                  minPointSize={2}
                  animationDuration={700}
                />
              )}

              {/* 2. Candle Part 2: Amount Balance (Yellow) */}
              {(activeMetric === "all" || activeMetric === "balance") && (
                <Bar
                  yAxisId="amount"
                  dataKey="amountBalance"
                  name="Amount Balance"
                  fill="url(#balanceYellowGrad)"
                  radius={[5, 5, 1, 1]}
                  maxBarSize={15}
                  minPointSize={2}
                  animationDuration={850}
                />
              )}

              {/* 3. Candle Part 3: Time Taken in Days (Blue) */}
              {(activeMetric === "all" || activeMetric === "days") && (
                <Bar
                  yAxisId="days"
                  dataKey="daysTaken"
                  name="Time Taken (Days)"
                  fill="url(#daysBlueGrad)"
                  radius={[5, 5, 1, 1]}
                  maxBarSize={15}
                  minPointSize={2}
                  animationDuration={1000}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Aesthetic Insight Ribbon */}
        <div className="mt-2.5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Fastest Liaison:</span>
              <strong className="text-white">
                {normalizedData.reduce((prev, curr) => (prev.daysTaken < curr.daysTaken ? prev : curr), normalizedData[0])?.name.split(" ")[0]} (
                {Math.min(...normalizedData.map((d) => d.daysTaken))}d)
              </strong>
            </span>
            <span className="hidden sm:inline text-neutral-700">•</span>
            <span className="hidden sm:flex items-center gap-1 text-sky-400">
              <CalendarDays size={13} />
              <span>Showroom Avg: <strong>{avgDaysTaken} Days Turnaround</strong></span>
            </span>
          </div>

          <div className="text-[11px] text-neutral-500">
            Total Liaisons Mapped: <strong className="text-neutral-300">{normalizedData.length} Agents</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentCommissionChart;
