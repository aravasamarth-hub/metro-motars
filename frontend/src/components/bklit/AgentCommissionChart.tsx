import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentChartItem {
  name: string;
  deals: number;
  commission: number; // in Thousands
  payoutStatus: "settled" | "pending";
}

const DEFAULT_AGENT_DATA: AgentChartItem[] = [
  { name: "Ramesh Babu", deals: 4, commission: 28, payoutStatus: "pending" },
  { name: "Suresh Kumar", deals: 3, commission: 21, payoutStatus: "settled" },
  { name: "Vikas Patil", deals: 2, commission: 14, payoutStatus: "pending" },
  { name: "Anand Verma", deals: 2, commission: 12, payoutStatus: "settled" },
  { name: "Praveen Rao", deals: 1, commission: 8, payoutStatus: "settled" },
];

export function AgentCommissionChart({ data = DEFAULT_AGENT_DATA }: { data?: AgentChartItem[] }) {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold tracking-tight">Agent Commission & Volume</CardTitle>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-xs">
              Bklit Charts
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Total brokerage volume and payout distribution across verified showroom liaisons (₹ in Thousands)
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Settled
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Pending Balance
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tickFormatter={(val) => `₹${val}k`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as AgentChartItem;
                    return (
                      <div className="bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-white text-xs">
                        <div className="font-bold text-amber-400 text-sm">{d.name}</div>
                        <div className="mt-1 text-neutral-300">
                          Deals Brokered: <span className="font-bold text-white">{d.deals} vehicles</span>
                        </div>
                        <div className="text-neutral-300">
                          Total Commission: <span className="font-bold text-amber-400">₹{(d.commission * 1000).toLocaleString()}</span>
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-neutral-800 text-[10px]">
                          Status:{" "}
                          <span className={d.payoutStatus === "settled" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                            {d.payoutStatus === "settled" ? "✓ Fully Paid" : "⏳ Pending Clearance"}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="commission" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.payoutStatus === "settled" ? "#10b981" : "#f59e0b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentCommissionChart;
