import { useEffect, useRef } from "react";
import { animate, createTimeline } from "animejs";

/**
 * Custom hook to drive the "How It Works" 4-step automotive roadmap using Anime.js v4.
 * Draws the SVG chassis road path from step 1 to 4 with precision dashoffset timing.
 * Fully cleans up on unmount to prevent memory leaks.
 */
export function useAnimeRoadmap() {
  const pathRef = useRef<SVGPathElement>(null);
  const stepNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<any>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = "0";
      }
      return;
    }

    const path = pathRef.current;
    if (!path) return;

    const pathLength = path.getTotalLength ? path.getTotalLength() : 1000;
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Anime.js v4 createTimeline
    const tl = createTimeline({
      loop: true,
      loopDelay: 2500,
      alternate: false,
    });

    timelineRef.current = tl;

    // 1. Draw SVG roadmap stroke
    tl.add(path, {
      strokeDashoffset: [pathLength, 0],
      duration: 2200,
      ease: "easeInOutQuad",
    });

    // 2. Pulse step node indicators in sequence as line passes them
    stepNodesRef.current.forEach((node, index) => {
      if (node) {
        tl.add(
          node,
          {
            scale: [1, 1.25, 1],
            opacity: [0.7, 1, 0.9],
            duration: 450,
            ease: "easeOutBack",
          },
          index * 480 + 300
        );
      }
    });

    // Clean up Anime.js timeline on unmount
    return () => {
      if (timelineRef.current && typeof timelineRef.current.pause === "function") {
        timelineRef.current.pause();
      }
    };
  }, []);

  return { pathRef, stepNodesRef };
}
