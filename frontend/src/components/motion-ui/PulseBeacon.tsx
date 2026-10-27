import React from "react";
import { cn } from "@/lib/utils";

interface PulseBeaconProps {
  color?: "gold" | "emerald" | "sky" | "amber" | "rose";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const COLOR_MAP = {
  gold: {
    core: "bg-amber-400 shadow-amber-400/50",
    ring: "rgba(245, 158, 11, 0.4)",
    text: "text-amber-500 dark:text-amber-400",
  },
  emerald: {
    core: "bg-emerald-400 shadow-emerald-400/50",
    ring: "rgba(16, 185, 129, 0.4)",
    text: "text-emerald-500 dark:text-emerald-400",
  },
  sky: {
    core: "bg-sky-400 shadow-sky-400/50",
    ring: "rgba(56, 189, 248, 0.4)",
    text: "text-sky-500 dark:text-sky-400",
  },
  amber: {
    core: "bg-amber-500 shadow-amber-500/50",
    ring: "rgba(217, 119, 6, 0.4)",
    text: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    core: "bg-rose-400 shadow-rose-400/50",
    ring: "rgba(244, 63, 94, 0.4)",
    text: "text-rose-500 dark:text-rose-400",
  },
};

const SIZE_MAP = {
  sm: { core: "w-2 h-2", ring: "w-4 h-4", text: "text-xs" },
  md: { core: "w-2.5 h-2.5", ring: "w-6 h-6", text: "text-xs font-semibold" },
  lg: { core: "w-3 h-3", ring: "w-8 h-8", text: "text-sm font-bold" },
};

export function PulseBeacon({
  color = "gold",
  size = "md",
  label,
  className = "",
}: PulseBeaconProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.gold;
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <style>{`
        @keyframes mmBeaconExpand {
          0% { transform: scale(0.65); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .mm-beacon-ring {
          animation: mmBeaconExpand 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          will-change: transform, opacity;
        }
      `}</style>
      <span className="relative flex items-center justify-center shrink-0" style={{ transform: "translateZ(0)" }}>
        <span
          className={cn("absolute rounded-full pointer-events-none mm-beacon-ring", s.ring)}
          style={{ border: `1.5px solid ${c.ring}` }}
        />
        <span className={cn("relative rounded-full shadow-md", s.core, c.core)} />
      </span>
      {label && <span className={cn(s.text, c.text)}>{label}</span>}
    </span>
  );
}

export default PulseBeacon;
