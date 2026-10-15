import React, { memo, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

interface Point {
  x: number;
  y: number;
}

interface PathData {
  id: string;
  d: string;
  opacity: number;
  width: number;
  duration: number;
  delay: number;
}

function generateAestheticPath(
  index: number,
  position: number,
  type: "primary" | "secondary" | "accent"
): string {
  const baseAmplitude = type === "primary" ? 140 : type === "secondary" ? 90 : 55;
  const phase = index * 0.22;
  const points: Point[] = [];
  const segments = type === "primary" ? 10 : type === "secondary" ? 8 : 6;

  const startX = 2400;
  const startY = 800;
  const endX = -2400;
  const endY = -800 + index * 28;

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const eased = 1 - Math.pow(1 - progress, 2);

    const baseX = startX + (endX - startX) * eased;
    const baseY = startY + (endY - startY) * eased;

    const amplitudeFactor = 1 - eased * 0.3;
    const wave1 =
      Math.sin(progress * Math.PI * 3 + phase) * (baseAmplitude * 0.7 * amplitudeFactor);
    const wave2 =
      Math.cos(progress * Math.PI * 4 + phase) * (baseAmplitude * 0.3 * amplitudeFactor);
    const wave3 =
      Math.sin(progress * Math.PI * 2 + phase) * (baseAmplitude * 0.2 * amplitudeFactor);

    points.push({
      x: baseX * position,
      y: baseY + wave1 + wave2 + wave3,
    });
  }

  const pathCommands = points.map((point: Point, i: number) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[i - 1];
    const tension = 0.4;
    const cp1x = prevPoint.x + (point.x - prevPoint.x) * tension;
    const cp1y = prevPoint.y;
    const cp2x = prevPoint.x + (point.x - prevPoint.x) * (1 - tension);
    const cp2y = point.y;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  });

  return pathCommands.join(" ");
}

const generateUniqueId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

export const FloatingPaths = memo(function FloatingPaths({
  position = 1,
}: {
  position?: number;
}) {
  const primaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: `mm-primary-${position}-${i}`,
        d: generateAestheticPath(i, position, "primary"),
        opacity: 0.18 + i * 0.04,
        width: 3.5 + i * 0.3,
        duration: 22,
        delay: 0,
      })),
    [position]
  );

  const secondaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: `mm-secondary-${position}-${i}`,
        d: generateAestheticPath(i, position, "secondary"),
        opacity: 0.14 + i * 0.03,
        width: 2.5 + i * 0.25,
        duration: 18,
        delay: 0,
      })),
    [position]
  );

  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ contain: "strict", transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes mmWaveDrift1 {
          0% { transform: translate3d(0, 0px, 0); }
          50% { transform: translate3d(0, -14px, 0); }
          100% { transform: translate3d(0, 0px, 0); }
        }
        @keyframes mmWaveDrift2 {
          0% { transform: translate3d(0, 0px, 0); }
          50% { transform: translate3d(0, -8px, 0); }
          100% { transform: translate3d(0, 0px, 0); }
        }
        .mm-gpu-wave-1 {
          animation: mmWaveDrift1 12s ease-in-out infinite;
          will-change: transform;
        }
        .mm-gpu-wave-2 {
          animation: mmWaveDrift2 9s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
      <svg
        className="h-full w-full text-slate-950/40 dark:text-white/40"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="-2400 -800 4800 1600"
      >
        <title>Metro Motors Showroom Ambient Vector Paths</title>
        <defs>
          <linearGradient id="metroGoldCyanGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.65)" />
            <stop offset="50%" stopColor="rgba(217, 119, 6, 0.45)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.55)" />
          </linearGradient>
        </defs>

        <g className={shouldReduceMotion ? "" : "mm-gpu-wave-1"}>
          {primaryPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="url(#metroGoldCyanGradient)"
              strokeLinecap="round"
              strokeWidth={path.width}
              style={{ opacity: path.opacity }}
            />
          ))}
        </g>

        <g className={shouldReduceMotion ? "" : "mm-gpu-wave-2"} style={{ opacity: 0.8 }}>
          {secondaryPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="url(#metroGoldCyanGradient)"
              strokeLinecap="round"
              strokeWidth={path.width}
              style={{ opacity: path.opacity }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
});

export default FloatingPaths;
