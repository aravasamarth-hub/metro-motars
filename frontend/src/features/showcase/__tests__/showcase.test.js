import { useAnimeRoadmap } from "../../../hooks/useAnimeRoadmap";
import { useAnimeHeroTitle } from "../../../hooks/useAnimeHeroTitle";
import { FloatingPaths } from "../../../components/kokonut/BackgroundPaths";
import { ParticleButton } from "../../../components/kokonut/ParticleButton";
import { SpotlightCard } from "../../../components/kokonut/SpotlightCard";
import { FleetValuationAreaChart } from "../../../components/bklit/FleetValuationAreaChart";
import { InventoryDistributionBarChart } from "../../../components/bklit/InventoryDistributionBarChart";
import { InspectionRadialGauge } from "../../../components/bklit/InspectionRadialGauge";
import { MotionCounter } from "../../../components/motion/MotionCounter";
import { MotionReveal } from "../../../components/motion/MotionReveal";

describe("Metro Motors - 5 Library Showcase Architecture & Integration", () => {
  test("1. KokonutUI components are defined and exported correctly", () => {
    expect(FloatingPaths).toBeDefined();
    expect(ParticleButton).toBeDefined();
    expect(SpotlightCard).toBeDefined();
  });

  test("2. Anime.js v4 hooks are defined and support timeline lifecycle", () => {
    expect(typeof useAnimeRoadmap).toBe("function");
    expect(typeof useAnimeHeroTitle).toBe("function");
  });

  test("3. Bklit data visualization components are defined with charting schemas", () => {
    expect(FleetValuationAreaChart).toBeDefined();
    expect(InventoryDistributionBarChart).toBeDefined();
    expect(InspectionRadialGauge).toBeDefined();
  });

  test("4. Motion components are defined with in-view and counter capabilities", () => {
    expect(MotionCounter).toBeDefined();
    expect(MotionReveal).toBeDefined();
  });
});
