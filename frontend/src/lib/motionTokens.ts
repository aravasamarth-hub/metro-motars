/**
 * METRO MOTORS — UNIFIED MOTION TOKENS & SYSTEM CONFIGURATION
 * Designed for luxury automotive digital experiences (Porsche, Aston Martin, Linear).
 * Standardized across React Bits, Magic UI, Aceternity UI, and Motion for React.
 */

export const MOTION_EASINGS = {
  // Ultra-smooth decelerate for entrances & modals
  luxuryDecel: [0.16, 1, 0.3, 1] as const,
  // Smooth subtle ease for everyday UI interactions
  smoothOut: [0.22, 1, 0.36, 1] as const,
  // Snappy response for buttons and tab switches
  snappy: [0.32, 0.72, 0, 1] as const,
  // Gentle in-out for ambient loops
  ambient: [0.45, 0.05, 0.55, 0.95] as const,
};

export const MOTION_DURATIONS = {
  instant: 0.12,
  fast: 0.22,
  normal: 0.38,
  slow: 0.65,
  cinematic: 0.95,
};

export const MOTION_VARIANTS = {
  fadeInUp: {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.luxuryDecel },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: MOTION_DURATIONS.normal, ease: MOTION_EASINGS.smoothOut },
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  },
  cardHover: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -3,
      scale: 1.01,
      transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.smoothOut },
    },
    tap: {
      scale: 0.98,
      transition: { duration: MOTION_DURATIONS.instant },
    },
  },
};
