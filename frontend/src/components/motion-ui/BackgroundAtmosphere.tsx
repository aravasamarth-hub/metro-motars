import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface BackgroundAtmosphereProps {
  className?: string;
  variant?: "hero" | "subtle" | "grid";
}

export const BackgroundAtmosphere = memo(function BackgroundAtmosphere({
  className = "",
  variant = "hero",
}: BackgroundAtmosphereProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className
      )}
      style={{ contain: "strict", transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes mmAuroraShift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate3d(30px, -20px, 0) scale(1.08); opacity: 0.65; }
        }
        .mm-aurora-blob-1 {
          animation: mmAuroraShift 16s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .mm-aurora-blob-2 {
          animation: mmAuroraShift 20s ease-in-out 3s infinite reverse;
          will-change: transform, opacity;
        }
      `}</style>

      {/* 1. Subtle Precision Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* 2. Amber Showroom Aurora Light Pool (Top Right) */}
      <div
        className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-[110px] pointer-events-none mm-aurora-blob-1"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.08) 50%, transparent 70%)",
        }}
      />

      {/* 3. Cyan Titanium Aurora Light Pool (Bottom Left) */}
      <div
        className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none mm-aurora-blob-2"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(14, 165, 233, 0.04) 55%, transparent 75%)",
        }}
      />

      {/* 4. Vignette for smooth contrast balance */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50/80 dark:to-[#060911]/80" />
    </div>
  );
});

export default BackgroundAtmosphere;
