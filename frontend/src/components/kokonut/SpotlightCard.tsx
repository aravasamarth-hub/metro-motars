import React from "react";
import { SpotlightCard as ModernSpotlightCard } from "../motion-ui/SpotlightCard";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export function SpotlightCard(props: SpotlightCardProps) {
  return <ModernSpotlightCard {...props} />;
}

export default SpotlightCard;
