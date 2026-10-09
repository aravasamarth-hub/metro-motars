import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onSuccess?: () => void;
  successDuration?: number;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

function SuccessParticles({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particleColors = ["#f59e0b", "#fbbf24", "#38bdf8", "#0284c7", "#ffffff", "#d97706"];

  return (
    <AnimatePresence>
      {[...Array(12)].map((_, i) => (
        <motion.div
          animate={{
            scale: [0, 1.4, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 65 + 25)],
            y: [0, -Math.random() * 70 - 20],
            opacity: [1, 0.9, 0],
          }}
          className="fixed h-2 w-2 rounded-full pointer-events-none z-50 shadow-lg"
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          key={i}
          style={{
            left: centerX,
            top: centerY,
            backgroundColor: particleColors[i % particleColors.length],
            boxShadow: `0 0 10px ${particleColors[i % particleColors.length]}`,
          }}
          transition={{
            duration: 0.7,
            delay: i * 0.04,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

export function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 900,
  className,
  variant = "default",
  size = "default",
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowParticles(true);
    onClick?.(e);
    onSuccess?.();

    setTimeout(() => {
      setShowParticles(false);
    }, successDuration);
  };

  return (
    <>
      {showParticles && <SuccessParticles buttonRef={buttonRef} />}
      <Button
        className={cn(
          "relative overflow-hidden font-semibold transition-transform duration-150 active:scale-95 shadow-md",
          showParticles && "scale-98",
          className
        )}
        onClick={handleClick}
        ref={buttonRef}
        size={size}
        variant={variant}
        {...props}
      >
        {children}
      </Button>
    </>
  );
}

export default ParticleButton;
