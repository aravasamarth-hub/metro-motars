import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
  { name: "Bus", icon: "🚌", count: 1, avgDaysToSell: 14, color: "#818cf8" },
  { name: "Truck", icon: "🚛", count: 1, avgDaysToSell: 12, color: "#ef4444" },
  { name: "Auto", icon: "🛺", count: 1, avgDaysToSell: 6, color: "#eab308" },
  { name: "E-Rickshaw", icon: "⚡🛺", count: 1, avgDaysToSell: 4, color: "#06b6d4" },
  { name: "Tractor", icon: "🚜", count: 1, avgDaysToSell: 8, color: "#dc2626" },
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
            <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/10 text-xs">
              Bklit Charts
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {viewMode === "segment"
              ? "Turnaround and inventory volume across all 8 commercial & private segments"
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
              By Segment (8)
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
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
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
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 flex-wrap gap-2">
          <span>
            Fastest Liquidity: <strong className="text-neutral-900 dark:text-white">2W Scooters &amp; E-Rickshaws (4 Days)</strong>
          </span>
          <span className="text-[11px] text-neutral-400">Total Showroom Coverage: 8 Segments</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default InventoryDistributionBarChart;
