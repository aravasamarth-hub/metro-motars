import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BrandInventory {
  brand: string;
  count: number;
  avgDaysToSell: number;
  color: string;
}

const INVENTORY_DATA: BrandInventory[] = [
  { brand: "Royal Enfield", count: 14, avgDaysToSell: 6, color: "#f59e0b" },
  { brand: "KTM Duke", count: 9, avgDaysToSell: 4, color: "#fb923c" },
  { brand: "Yamaha", count: 8, avgDaysToSell: 7, color: "#38bdf8" },
  { brand: "Honda", count: 6, avgDaysToSell: 5, color: "#ef4444" },
  { brand: "Kawasaki", count: 3, avgDaysToSell: 11, color: "#10b981" },
  { brand: "BMW Motorrad", count: 2, avgDaysToSell: 14, color: "#818cf8" },
];

export function InventoryDistributionBarChart() {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold tracking-tight">Active Fleet by Brand</CardTitle>
            <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/10 text-xs">
              Bklit Charts
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Current vehicle count and average showroom turnaround time
          </CardDescription>
        </div>
        <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
          42 In Stock
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={INVENTORY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="brand"
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
                    const d = payload[0].payload as BrandInventory;
                    return (
                      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 p-3 shadow-xl backdrop-blur-md text-xs">
                        <p className="font-bold text-neutral-900 dark:text-white">{d.brand}</p>
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
                {INVENTORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
          <span>Fastest Mover: <strong className="text-neutral-900 dark:text-white">KTM Duke (4 Days)</strong></span>
          <span className="text-[11px] text-neutral-400">Inventory Turnover: 6.8 Days avg</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default InventoryDistributionBarChart;
