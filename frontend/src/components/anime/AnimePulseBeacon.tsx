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
  const ringRef1 = useRef<HTMLSpanElement>(null);
  const ringRef2 = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r1 = ringRef1.current;
    const r2 = ringRef2.current;
    const core = coreRef.current;
    if (!r1 || !r2 || !core) return;

    const tl = createTimeline({
      loop: true,
      loopDelay: 600,
    });
    tlRef.current = tl;

    tl.add(core, {
      scale: [1, 1.25, 1],
      duration: 1200,
      ease: "inOutSine",
    });

    tl.add(
      r1,
      {
        scale: [0.6, 2.2],
        opacity: [0.9, 0],
        duration: 1800,
        ease: "outQuad",
      },
      0
    );

    tl.add(
      r2,
      {
        scale: [0.4, 2.6],
        opacity: [0.75, 0],
        duration: 2100,
        ease: "outQuad",
      },
      400
    );

    return () => {
      if (tlRef.current && typeof tlRef.current.pause === "function") {
        tlRef.current.pause();
      }
    };
  }, []);

  const c = COLOR_MAP[color] || COLOR_MAP.gold;
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex items-center justify-center">
        <span
          ref={ringRef1}
          className={`absolute rounded-full pointer-events-none ${s.ring}`}
          style={{ border: `1.5px solid ${c.ring}` }}
        />
        <span
          ref={ringRef2}
          className={`absolute rounded-full pointer-events-none ${s.ring}`}
          style={{ border: `1px solid ${c.ring}` }}
        />
        <span
          ref={coreRef}
          className={`relative rounded-full shadow-lg ${s.core} ${c.core}`}
        />
      </span>
      {label && <span className={`${s.text} ${c.text}`}>{label}</span>}
    </span>
  );
}

export default AnimePulseBeacon;
