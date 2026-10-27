import React from "react";
import { ShowroomDealPipeline } from "../motion-ui/ShowroomDealPipeline";

interface AnimeDealJourneyProps {
  currentStage?: number;
  className?: string;
  onStageClick?: (stage: number) => void;
}

export function AnimeDealJourney(props: AnimeDealJourneyProps) {
  return <ShowroomDealPipeline {...props} />;
}

export default AnimeDealJourney;
