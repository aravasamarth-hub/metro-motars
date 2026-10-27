import React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "motion/react";

interface VelocityMarqueeProps {
  items: string[];
  direction?: "left" | "right";
  speed?: number; // duration in seconds
  className?: string;
}

export function VelocityMarquee({
  items,
  direction = "left",
  speed = 35,
  className = "",
}: VelocityMarqueeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden whitespace-nowrap py-3 select-none pointer-events-auto group",
        className
      )}
    >
      <style>{`
        @keyframes mmMarqueeLeft {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes mmMarqueeRight {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .mm-marquee-track {
          display: inline-flex;
          width: max-content;
          will-change: transform;
        }
        .mm-marquee-left {
          animation: mmMarqueeLeft var(--marquee-speed, 35s) linear infinite;
        }
        .mm-marquee-right {
          animation: mmMarqueeRight var(--marquee-speed, 35s) linear infinite;
        }
        .group:hover .mm-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Edge gradient masks for seamless fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-neutral-50 dark:from-[#060911] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-neutral-50 dark:from-[#060911] to-transparent z-10" />

      <div
        className={cn(
          "mm-marquee-track",
          shouldReduceMotion
            ? ""
            : direction === "left"
            ? "mm-marquee-left"
            : "mm-marquee-right"
        )}
        style={{ "--marquee-speed": `${speed}s` } as React.CSSProperties}
      >
        {/* Render twice for seamless infinite loop */}
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-3 mx-4 text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-sm shadow-amber-400 inline-block" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VelocityMarquee;
