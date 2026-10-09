import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { HelpCircle } from "lucide-react";

export function ShowcaseFaq() {
  const faqs = [
    {
      q: "How does the biometric fingerprint agreement protect me legally?",
      a: "Every transaction at Metro Motors captures an encrypted 500 DPI optical thumbprint for both the Seller and Buyer. This biometric hash is embedded into an immutable sale deed and registered RTO delivery gate pass, guaranteeing that the previous owner cannot dispute the sale and legal liability transfers immediately upon vehicle handover.",
    },
    {
      q: "How long does the RTO RC smartcard ownership transfer take?",
      a: "Because all vehicles in our inventory have pre-cleared NOC and verified hypothecation cancellation certificates, the official RTO smartcard title transfer typically completes within 10 to 14 working days. You receive real-time SMS status updates and digital Parivahan acknowledgement receipts.",
    },
    {
      q: "What does the 120-point mechanical inspection cover?",
      a: "Our master mechanics perform cylinder compression tests, fork seal inspection, valve clearance checks, battery load test, brake pad thickness measurements, and an on-road dynamometer run. Any vehicle with structural chassis welding, flood damage, or engine rebuild tampering is permanently disqualified.",
    },
    {
      q: "Can I sell or exchange my current motorcycle on the spot?",
      a: "Yes! Bring your current vehicle to our Bangalore showroom. We provide a transparent 15-minute diagnostic evaluation using real-time market auction data. You can either walk away with immediate bank transfer proceeds or roll the value into any vehicle from our certified fleet.",
    },
    {
      q: "What warranty and after-sales support do you provide?",
      a: "Every Metro Motors certified vehicle includes a 6-month / 6,000 km engine and transmission mechanical warranty, plus 1 year of Pan-India 24/7 Roadside Assistance (flat tire, fuel delivery, towing). You also receive a dedicated service liaison for all future scheduled checkups.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <MotionReveal className="text-center mb-12">
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
        >
          SHADCN ACCORDION
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
          Everything you need to know about certified pre-owned acquisition, legal title transfers,
          and showroom protections.
        </p>
      </MotionReveal>

      <MotionReveal delay={0.2}>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 bg-white dark:bg-neutral-900/60 shadow-sm"
            >
              <AccordionTrigger className="text-left font-bold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pb-5 border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MotionReveal>
    </section>
  );
}

export default ShowcaseFaq;
