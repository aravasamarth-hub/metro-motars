import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { MOTION_EASINGS } from "@/lib/motionTokens";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export function BlurText({
  text,
  className = "",
  delay = 0.1,
  wordDelay = 0.045,
  highlightWords = [],
  highlightClass = "text-amber-500",
}: BlurTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => {
        const isHighlighted = highlightWords.some((hw) =>
          word.toLowerCase().includes(hw.toLowerCase())
        );

        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transitionEnd: {
                filter: "none",
              },
            }}
            transition={{
              duration: 0.5,
              delay: delay + i * wordDelay,
              ease: MOTION_EASINGS.luxuryDecel,
            }}
            style={{
              display: "inline-block",
              WebkitFontSmoothing: "antialiased",
            }}
            className={`inline-block mr-[0.28em] ${isHighlighted ? highlightClass : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}

export default BlurText;
