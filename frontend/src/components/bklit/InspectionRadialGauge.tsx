import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export function InspectionRadialGauge({ score = 98.6 }: { score?: number }) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight">Showroom Quality Index</CardTitle>
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs">
            Bklit Gauge
          </Badge>
        </div>
        <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
          Composite score across 120-point mechanical & legal inspection
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-neutral-200 dark:text-neutral-800"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="url(#bklitGaugeGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
            <defs>
              <linearGradient id="bklitGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              {score}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <ShieldCheck size={13} /> Certified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-300">Clean RC & NOC</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-300">Biometric Match</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-300">Engine LOF Tuned</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-300">Zero Chassis Acc.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InspectionRadialGauge;
