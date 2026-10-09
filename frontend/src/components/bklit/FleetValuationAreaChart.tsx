import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface FleetDataPoint {
  month: string;
  valuation: number; // In Lakhs
  sales: number;     // In Lakhs
}

const DEFAULT_FLEET_DATA: FleetDataPoint[] = [
  { month: "Nov '25", valuation: 120, sales: 34 },
  { month: "Dec '25", valuation: 135, sales: 48 },
  { month: "Jan '26", valuation: 148, sales: 52 },
  { month: "Feb '26", valuation: 162, sales: 65 },
  { month: "Mar '26", valuation: 174, sales: 78 },
  { month: "Apr '26", valuation: 184.5, sales: 91 },
];

export function FleetValuationAreaChart({ data = DEFAULT_FLEET_DATA }: { data?: FleetDataPoint[] }) {
  const [activeSeries, setActiveSeries] = useState<"both" | "valuation" | "sales">("both");

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold tracking-tight">Fleet Valuation & Sales Velocity</CardTitle>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs">
              Bklit Charts
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time showroom valuation and monthly resale volume (in ₹ Lakhs)
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveSeries("both")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeSeries === "both"
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries("valuation")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeSeries === "valuation"
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            Valuation
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries("sales")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeSeries === "sales"
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            Volume
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bklitValuationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="bklitSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
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
                tickFormatter={(val) => `₹${val}L`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 p-3 shadow-xl backdrop-blur-md text-xs">
                        <p className="font-bold text-neutral-900 dark:text-white mb-1.5">{label}</p>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name === "valuation" ? "Fleet Valuation" : "Gross Resales"}
                            </span>
                            <span className="font-semibold text-neutral-950 dark:text-white">
                              ₹{entry.value} Lakhs
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(activeSeries === "both" || activeSeries === "valuation") && (
                <Area
                  type="monotone"
                  dataKey="valuation"
                  name="valuation"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#bklitValuationGrad)"
                />
              )}
              {(activeSeries === "both" || activeSeries === "sales") && (
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="sales"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#bklitSalesGrad)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="font-medium text-emerald-500">+14.8% growth</span>
            <span>vs previous quarter</span>
          </div>
          <span className="text-[11px] text-neutral-400">Indexed via MongoDB Vault</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default FleetValuationAreaChart;
