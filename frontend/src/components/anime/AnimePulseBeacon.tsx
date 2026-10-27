import React from "react";
import { PulseBeacon } from "../motion-ui/PulseBeacon";

interface AnimePulseBeaconProps {
  color?: "gold" | "emerald" | "sky" | "amber" | "rose";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function AnimePulseBeacon(props: AnimePulseBeaconProps) {
  return <PulseBeacon {...props} />;
}

export default AnimePulseBeacon;
