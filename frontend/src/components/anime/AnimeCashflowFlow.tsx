import React from "react";
import { ShowroomTreasuryStream } from "../motion-ui/ShowroomTreasuryStream";

interface AnimeCashflowFlowProps {
  inflow?: number;
  outflow?: number;
  margin?: number;
  className?: string;
}

export function AnimeCashflowFlow(props: AnimeCashflowFlowProps) {
  return <ShowroomTreasuryStream {...props} />;
}

export default AnimeCashflowFlow;
