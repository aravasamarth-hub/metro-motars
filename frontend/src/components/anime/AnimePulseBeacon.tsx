import React, { useEffect, useRef } from "react";
import { animate, createTimeline } from "animejs";

interface AnimePulseBeaconProps {
  color?: "gold" | "emerald" | "sky" | "amber" | "rose";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const COLOR_MAP = {
  gold: {
    core: "bg-amber-400 shadow-amber-400/50",
    ring: "rgba(245, 158, 11, 0.45)",
    text: "text-amber-400",
  },
  emerald: {
    core: "bg-emerald-400 shadow-emerald-400/50",
    ring: "rgba(16, 185, 129, 0.45)",
    text: "text-emerald-400",
  },
  sky: {
    core: "bg-sky-400 shadow-sky-400/50",
    ring: "rgba(56, 189, 248, 0.45)",
    text: "text-sky-400",
  },
  amber: {
    core: "bg-amber-500 shadow-amber-500/50",
    ring: "rgba(217, 119, 6, 0.45)",
    text: "text-amber-500",
  },
  rose: {
    core: "bg-rose-400 shadow-rose-400/50",
    ring: "rgba(244, 63, 94, 0.45)",
    text: "text-rose-400",
  },
};

const SIZE_MAP = {
  sm: { core: "w-2 h-2", ring: "w-5 h-5", text: "text-xs" },
  md: { core: "w-2.5 h-2.5", ring: "w-7 h-7", text: "text-xs font-semibold" },
  lg: { core: "w-3.5 h-3.5", ring: "w-9 h-9", text: "text-sm font-bold" },
};

export function AnimePulseBeacon({
  color = "gold",
  size = "md",
  label,
  className = "",
}: AnimePulseBeaconProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.gold;
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <style>{`
        @keyframes mmBeaconCorePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.22); }
        }
        @keyframes mmBeaconRingPulse1 {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes mmBeaconRingPulse2 {
          0% { transform: scale(0.4); opacity: 0.75; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .mm-beacon-core {
          animation: mmBeaconCorePulse 1.8s ease-in-out infinite;
          will-change: transform;
        }
        .mm-beacon-ring-1 {
          animation: mmBeaconRingPulse1 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          will-change: transform, opacity;
        }
        .mm-beacon-ring-2 {
          animation: mmBeaconRingPulse2 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s infinite;
          will-change: transform, opacity;
        }
      `}</style>
      <span className="relative flex items-center justify-center" style={{ transform: "translateZ(0)" }}>
        <span
          className={`absolute rounded-full pointer-events-none mm-beacon-ring-1 ${s.ring}`}
          style={{ border: `1.5px solid ${c.ring}` }}
        />
        <span
          className={`absolute rounded-full pointer-events-none mm-beacon-ring-2 ${s.ring}`}
          style={{ border: `1px solid ${c.ring}` }}
        />
        <span
          className={`relative rounded-full shadow-lg mm-beacon-core ${s.core} ${c.core}`}
        />
      </span>
      {label && <span className={`${s.text} ${c.text}`}>{label}</span>}
    </span>
  );
}

export default AnimePulseBeacon;
