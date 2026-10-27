import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface FollowUpResolutionGaugeProps {
  completed?: number;
  total?: number;
  urgentPending?: number;
}

export function FollowUpResolutionGauge({
  completed = 5,
  total = 8,
  urgentPending = 2,
}: FollowUpResolutionGaugeProps) {
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight">Resolution Efficiency</CardTitle>
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold">
            Task Resolution
          </Badge>
        </div>
        <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
          Weekly task clearance & party follow-up fulfillment index
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center pt-2 pb-5">
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className="text-neutral-200 dark:text-neutral-800"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#followupGaugeGrad)"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
            <defs>
              <linearGradient id="followupGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-neutral-950 dark:text-white">
              {score}%
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">Cleared</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
            <CheckCircle2 size={13} />
            <span>{completed} Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 font-semibold justify-end">
            <AlertTriangle size={13} />
            <span>{urgentPending} Urgent Left</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FollowUpResolutionGauge;
