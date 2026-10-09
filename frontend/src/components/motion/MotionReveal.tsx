import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  duration?: number;
}

export function MotionReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  duration = 0.65,
}: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (shouldReduceMotion) return { opacity: 1 };
    switch (direction) {
      case "up":
        return { opacity: 0, y: 32 };
      case "down":
        return { opacity: 0, y: -32 };
      case "left":
        return { opacity: 0, x: 32 };
      case "right":
        return { opacity: 0, x: -32 };
      case "none":
        return { opacity: 0 };
    }
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default MotionReveal;
