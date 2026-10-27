import React, { memo } from "react";
import { BackgroundAtmosphere } from "../motion-ui/BackgroundAtmosphere";

export const FloatingPaths = memo(function FloatingPaths({
  position = 1,
}: {
  position?: number;
}) {
  return <BackgroundAtmosphere />;
});

export default FloatingPaths;
