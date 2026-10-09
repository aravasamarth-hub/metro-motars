import { useEffect, useRef } from "react";
import { animate, createTimeline } from "animejs";

/**
 * Hook to run an Anime.js v4 cinematic title sequence on hero mount.
 * Staggers the brand tagline and draws subtle metallic luster across the title.
 * Automatically cleans up on unmount.
 */
export function useAnimeHeroTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const timelineRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const badge = badgeRef.current;
    const headline = headlineRef.current;
    const subtitle = subtitleRef.current;

    if (!headline) return;

    // Build timeline using Anime.js v4
    const tl = createTimeline({
      defaults: {
        ease: "easeOutExpo",
      },
    });

    timelineRef.current = tl;

    if (badge) {
      tl.add(badge, {
        opacity: [0, 1],
        translateY: [-16, 0],
        duration: 800,
      });
    }

    tl.add(
      headline,
      {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 1000,
      },
      "-=500"
    );

    if (subtitle) {
      tl.add(
        subtitle,
        {
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 900,
        },
        "-=600"
      );
    }

    return () => {
      if (timelineRef.current && typeof timelineRef.current.pause === "function") {
        timelineRef.current.pause();
      }
    };
  }, []);

  return { containerRef, badgeRef, headlineRef, subtitleRef };
}
