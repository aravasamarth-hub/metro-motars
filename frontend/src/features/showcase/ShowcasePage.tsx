import React from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ShowcaseNavbar } from "@/components/sections/ShowcaseNavbar";
import { ShowcaseHero } from "@/components/sections/ShowcaseHero";
import { ShowcaseFleet } from "@/components/sections/ShowcaseFleet";
import { ShowcaseAnalytics } from "@/components/sections/ShowcaseAnalytics";
import { ShowcaseRoadmap } from "@/components/sections/ShowcaseRoadmap";
import { TestimonialCarousel } from "@/components/motion/TestimonialCarousel";
import { ShowcasePlans } from "@/components/sections/ShowcasePlans";
import { ShowcaseFaq } from "@/components/sections/ShowcaseFaq";
import { ShowcaseBooking } from "@/components/sections/ShowcaseBooking";
import { ShowcaseFooter } from "@/components/sections/ShowcaseFooter";
import { Badge } from "@/components/ui/badge";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { Toaster } from "@/components/ui/sonner";

interface ShowcasePageProps {
  dark: boolean;
  setDark: (val: boolean) => void;
}

export function ShowcasePage({ dark, setDark }: ShowcasePageProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className={`min-h-screen bg-white dark:bg-[#060911] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950 transition-colors duration-300`}>
      {/* 1. Global Motion Scroll Progress Bar at very top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Global Toast Provider */}
      <Toaster position="top-right" richColors />

      {/* 2. Responsive Navbar (shadcn + Motion) */}
      <ShowcaseNavbar dark={dark} setDark={setDark} />

      <main>
        {/* 3. Hero Section (KokonutUI BackgroundPaths + Anime.js v4 Timeline + Motion CTA) */}
        <ShowcaseHero />

        {/* 4. Fleet Showcase (shadcn + KokonutUI SpotlightCard + Motion Reveal) */}
        <ShowcaseFleet />

        {/* 5. Stats & Telemetry (Bklit Area & Bar Charts + Gauge + Motion Counters) */}
        <ShowcaseAnalytics />

        {/* 6. How It Works (Anime.js v4 SVG Roadmap Line Drawing) */}
        <ShowcaseRoadmap />

        {/* 7. VIP Testimonials (Motion Gesture Drag/Snap Carousel + shadcn Avatar) */}
        <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <MotionReveal className="text-center max-w-2xl mx-auto mb-12">
            <Badge
              variant="outline"
              className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
            >
              MOTION CAROUSEL & SHADCN AVATAR
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
              Verified Patron Testimonials
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
              Real feedback from owners who bought, sold, and traded performance motorcycles at Metro Motors Bangalore.
            </p>
          </MotionReveal>
          <TestimonialCarousel />
        </section>

        {/* 8. Ownership Plans (shadcn Tabs + Motion Layout) */}
        <ShowcasePlans />

        {/* 9. FAQ Section (shadcn Accordion) */}
        <ShowcaseFaq />

        {/* 10. VIP Booking Form (shadcn Form + Sonner Toast + KokonutUI ParticleButton) */}
        <ShowcaseBooking />
      </main>

      {/* 11. Footer (shadcn + Motion Micro-interactions) */}
      <ShowcaseFooter />
    </div>
  );
}

export default ShowcasePage;
