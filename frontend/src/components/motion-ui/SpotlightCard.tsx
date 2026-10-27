import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(245, 158, 11, 0.12)",
  borderColor = "rgba(245, 158, 11, 0.25)",
  style,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/80 p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-950/50",
        className
      )}
      style={{
        transform: "translateZ(0)",
        ...style,
      }}
      {...props}
    >
      {/* 1. Dynamic cursor spotlight radial aura */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />

      {/* 2. Interactive illuminated border on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] border transition-opacity duration-300 z-0"
        style={{
          opacity,
          borderColor,
        }}
      />

      {/* 3. Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default SpotlightCard;
