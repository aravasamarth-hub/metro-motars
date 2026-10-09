import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  vehicle: string;
  comment: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Vikram Malhotra",
    role: "Architect & Moto Enthusiast",
    vehicle: "Royal Enfield Hunter 350 Dapper Ash",
    comment:
      "The vehicle history was 100% transparent. Seeing the optical thumbprint matched on the sale agreement with zero paperwork delays was unlike any traditional dealer experience in Bangalore.",
    rating: 5,
    avatar: "VM",
  },
  {
    name: "Ananya Sen",
    role: "Senior Product Designer",
    vehicle: "KTM Duke 390 Gen 3",
    comment:
      "Metro Motors gave me complete mechanical inspection logs — brake pad thickness, oil flush proof, and dyno checks. Drove it off the showroom floor within 45 minutes of test ride.",
    rating: 5,
    avatar: "AS",
  },
  {
    name: "Dr. Rohan Kulkarni",
    role: "Cardiologist",
    vehicle: "Kawasaki Ninja 650",
    comment:
      "Sold my previous motorcycle and upgraded to a pre-owned Ninja here. The valuation was higher than online aggregators, and the sale proceeds hit my bank account instantly.",
    rating: 5,
    avatar: "RK",
  },
  {
    name: "Suresh Gowda",
    role: "Tech Entrepreneur",
    vehicle: "BMW G310 GS Adventure",
    comment:
      "Clean RTO NOC transfer and verified single-owner documentation. The team at Metro Motors treats pre-owned delivery with true luxury showroom hospitality.",
    rating: 5,
    avatar: "SG",
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = () => setCurrentIndex((idx) => (idx === 0 ? TESTIMONIALS.length - 1 : idx - 1));
  const next = () => setCurrentIndex((idx) => (idx === TESTIMONIALS.length - 1 ? 0 : idx + 1));

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={containerRef}>
      <div className="overflow-hidden px-2 py-4">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-2xl p-6 md:p-8 rounded-3xl relative overflow-hidden">
            <Quote
              className="absolute right-6 top-6 text-amber-500/10 dark:text-amber-500/10 pointer-events-none"
              size={120}
            />
            <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-amber-500/40 shadow-lg shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white font-extrabold text-xl">
                  {TESTIMONIALS[currentIndex].avatar}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2 text-amber-500">
                  {[...Array(TESTIMONIALS[currentIndex].rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="text-base md:text-lg italic text-neutral-800 dark:text-neutral-200 leading-relaxed mb-4">
                  "{TESTIMONIALS[currentIndex].comment}"
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h4 className="font-bold text-neutral-950 dark:text-white text-base">
                      {TESTIMONIALS[currentIndex].name}
                    </h4>
                    <p className="text-xs text-neutral-500">{TESTIMONIALS[currentIndex].role}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block w-fit mt-1 sm:mt-0">
                    {TESTIMONIALS[currentIndex].vehicle}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous Testimonial"
          className="h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:border-amber-500/50 hover:text-amber-500 transition-colors shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 px-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                currentIndex === i ? "w-6 bg-amber-500" : "w-2 bg-neutral-300 dark:bg-neutral-700"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          aria-label="Next Testimonial"
          className="h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:border-amber-500/50 hover:text-amber-500 transition-colors shadow-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default TestimonialCarousel;
