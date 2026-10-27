import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  borderRadius?: string;
  background?: string;
  className?: string;
}

export function ShimmerButton({
  children,
  shimmerColor = "rgba(245, 158, 11, 0.45)",
  shimmerSize = "0.08em",
  shimmerDuration = "2.8s",
  borderRadius = "12px",
  background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  className,
  onClick,
  disabled,
  ...props
}: ShimmerButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        } as React.CSSProperties
      }
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-amber-400/30 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-neutral-950 transition-all duration-300 active:opacity-90 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-amber-500/20",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...(props as any)}
    >
      {/* 1. Rotating conic gradient border shimmer */}
      {!shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-full animate-[shimmer-spin_3s_linear_infinite]"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, var(--shimmer-color) 60deg, transparent 120deg)`,
          }}
        />
      )}

      {/* 2. Button Inner Fill */}
      <div
        className="absolute inset-[1px] -z-10 rounded-[inherit] transition-all duration-200"
        style={{ background: "var(--bg)" }}
      />

      {/* 3. Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-1.5 font-extrabold">
        {children}
      </span>
    </motion.button>
  );
}

export default ShimmerButton;
