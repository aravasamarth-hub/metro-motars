import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SegmentInventory {
  name: string;
  icon?: string;
  count: number;
  avgDaysToSell: number;
  color: string;
}

const SEGMENT_DATA: SegmentInventory[] = [
  { name: "2W Geared", icon: "🏍️", count: 7, avgDaysToSell: 5, color: "#f59e0b" },
  { name: "2W Auto", icon: "🛵", count: 2, avgDaysToSell: 4, color: "#10b981" },
  { name: "4W Car", icon: "🚗", count: 2, avgDaysToSell: 9, color: "#38bdf8" },
];

const BRAND_DATA: SegmentInventory[] = [
  { name: "Royal Enfield", count: 14, avgDaysToSell: 6, color: "#f59e0b" },
  { name: "Mahindra", count: 8, avgDaysToSell: 8, color: "#dc2626" },
  { name: "Hyundai", count: 6, avgDaysToSell: 7, color: "#38bdf8" },
  { name: "Honda", count: 5, avgDaysToSell: 4, color: "#ef4444" },
  { name: "Ashok Leyland", count: 3, avgDaysToSell: 14, color: "#818cf8" },
  { name: "BharatBenz", count: 3, avgDaysToSell: 12, color: "#f97316" },
  { name: "Bajaj / Saarthi", count: 3, avgDaysToSell: 5, color: "#10b981" },
];

function getGradientId(color: string) {
  if (color === "#f59e0b") return "url(#invGoldGrad)";
  if (color === "#10b981") return "url(#invGreenGrad)";
  if (color === "#38bdf8") return "url(#invSkyGrad)";
  if (color === "#dc2626" || color === "#ef4444") return "url(#invRedGrad)";
  if (color === "#818cf8") return "url(#invIndigoGrad)";
  if (color === "#f97316") return "url(#invOrangeGrad)";
  return color;
}

export function InventoryDistributionBarChart() {
  const [viewMode, setViewMode] = useState<"segment" | "brand">("segment");
  const chartData = viewMode === "segment" ? SEGMENT_DATA : BRAND_DATA;

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold tracking-tight">
              {viewMode === "segment" ? "Fleet Breakdown by Vehicle Category" : "Active Fleet by Brand"}
            </CardTitle>
            <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold">
              Inventory Telemetry
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {viewMode === "segment"
              ? "Turnaround and inventory volume across all 3 vehicle segments"
              : "Current vehicle count and average showroom turnaround time"}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/50">
            <button
              type="button"
              onClick={() => setViewMode("segment")}
              className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === "segment"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              By Segment (3)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("brand")}
              className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === "brand"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              By Brand
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`h-[340px] w-full transition-all duration-300 ${viewMode === "segment" ? "max-w-lg mx-auto" : ""}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap={viewMode === "segment" ? "18%" : "15%"}
              barGap={4}
              maxBarSize={48}
              margin={{ top: 16, right: 16, left: -15, bottom: 8 }}
            >
              <defs>
                <linearGradient id="invGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde047" stopOpacity={0.98} />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#b45309" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="invGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="invSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="invRedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="invIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#818cf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="invOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#f97316" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.18)", strokeWidth: 1 }}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as SegmentInventory;
                    return (
                      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 p-3 shadow-xl backdrop-blur-md text-xs">
                        <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          {d.icon && <span>{d.icon}</span>}
                          <span>{d.name}</span>
                        </p>
                        <p className="text-neutral-500 mt-1">
                          In Stock: <strong className="text-neutral-950 dark:text-white">{d.count} Units</strong>
                        </p>
                        <p className="text-emerald-500 mt-0.5">
                          Avg Turnover: <strong>{d.avgDaysToSell} Days</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 2, 2]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getGradientId(entry.color)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 flex-wrap gap-2">
          <span>
            Fastest Liquidity: <strong className="text-neutral-900 dark:text-white">2W Scooters (4 Days)</strong>
          </span>
          <span className="text-[11px] text-neutral-400">Total Showroom Coverage: 3 Segments</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default InventoryDistributionBarChart;
