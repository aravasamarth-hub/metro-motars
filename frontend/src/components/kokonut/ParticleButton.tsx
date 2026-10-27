import React from "react";
import { ShimmerButton } from "../motion-ui/ShimmerButton";

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onSuccess?: () => void;
  successDuration?: number;
  variant?: string;
  size?: string;
  className?: string;
  testid?: string;
}

export function ParticleButton({
  children,
  onClick,
  onSuccess,
  className = "",
  testid,
  ...props
}: Readonly<ParticleButtonProps>) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onSuccess?.();
  };

  return (
    <ShimmerButton
      className={className}
      onClick={handleClick}
      data-testid={testid || (props as any)["data-testid"]}
      {...(props as any)}
    >
      {children}
    </ShimmerButton>
  );
}

export default ParticleButton;
