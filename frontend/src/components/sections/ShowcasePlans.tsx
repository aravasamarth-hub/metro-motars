import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck, Zap, ArrowRight, Sparkles } from "lucide-react";

export function ShowcasePlans() {
  const [activeTab, setActiveTab] = useState("outright");

  const plans = [
    {
      id: "outright",
      badge: "MOST POPULAR",
      title: "Outright Certified Ownership",
      subtitle: "Direct purchase with zero debt and instant ownership deed.",
      pricing: "100% On-Road Value",
      tenure: "One-Time Settlement",
      features: [
        "Instant RTO smartcard title transfer with biometric deed",
        "120-Point mechanical certification and dyno test certificate",
        "6 Months / 6,000 km comprehensive engine & gearbox warranty",
        "Free 1-Year Pan-India 24/7 Roadside Assistance (RSA)",
        "Zero hidden documentation, transfer, or dealer processing fees",
      ],
      actionLabel: "Explore Certified Inventory",
    },
    {
      id: "emi",
      badge: "LOW DOWN PAYMENT",
      title: "Flexible Showroom EMI Financing",
      subtitle: "Drive home your dream machine with low monthly installments.",
      pricing: "From ₹2,499/mo",
      tenure: "12 to 48 Months Flexible Tenures",
      features: [
        "Up to 85% on-road financing through HDFC, IDFC, & ICICI",
        "Digital paperless loan sanction within 30 minutes",
        "Zero prepayment or foreclosure charges after 6 installments",
        "Integrated comprehensive zero-dep insurance included",
        "Dedicated banking liaison officer stationed in-showroom",
      ],
      actionLabel: "Check Instant Loan Eligibility",
    },
    {
      id: "buyback",
      badge: "VIP ASSURANCE",
      title: "Assured Showroom Buyback Guarantee",
      subtitle: "Lock in future resale value with guaranteed showroom redemption.",
      pricing: "Up to 70% Value Locked",
      tenure: "Valid for 12 to 18 Months",
      features: [
        "Guaranteed minimum 70% valuation buyback contract",
        "Priority exchange credit for showroom upgrades at any time",
        "Complementary quarterly multi-point health checkups",
        "Depreciation protection against market fluctuations",
        "Seamless trade-in evaluation completed within 15 minutes",
      ],
      actionLabel: "Inquire for Buyback Program",
    },
  ];

  const handleScrollToBooking = () => {
    const el = document.querySelector("#booking");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="plans" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
        >
          SHADCN TABS + MOTION LAYOUT
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
          Transparent Ownership Plans
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
          Whether you prefer direct title acquisition, low EMI financing, or our guaranteed buyback
          reserve, every plan is protected by certified RTO documentation.
        </p>

        {/* shadcn Tabs List */}
        <div className="mt-8 flex justify-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid grid-cols-3 bg-neutral-200/60 dark:bg-neutral-800/60 p-1.5 rounded-2xl">
              <TabsTrigger
                value="outright"
                className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950"
              >
                Outright
              </TabsTrigger>
              <TabsTrigger
                value="emi"
                className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950"
              >
                Showroom EMI
              </TabsTrigger>
              <TabsTrigger
                value="buyback"
                className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-neutral-950"
              >
                Buyback Lock
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Motion Layout Animated Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => {
          const isSelected = activeTab === p.id;
          return (
            <motion.div
              key={p.id}
              layout
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className={`h-full ${isSelected ? "md:-translate-y-2" : "opacity-90 md:opacity-75"}`}
            >
              <Card
                className={`h-full flex flex-col justify-between border-2 rounded-3xl transition-all duration-300 shadow-xl ${
                  isSelected
                    ? "border-amber-500 bg-white dark:bg-neutral-900 shadow-amber-500/10"
                    : "border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className={`text-[10px] font-extrabold ${
                        isSelected
                          ? "bg-amber-500 text-neutral-950"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {p.badge}
                    </Badge>
                    {isSelected && <Sparkles size={16} className="text-amber-500 animate-spin" />}
                  </div>

                  <CardTitle className="text-xl font-black text-neutral-950 dark:text-white">
                    {p.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 leading-relaxed">
                    {p.subtitle}
                  </CardDescription>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
                      {p.pricing}
                    </div>
                    <span className="text-xs font-semibold text-amber-500">{p.tenure}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <Button
                    onClick={handleScrollToBooking}
                    className={`w-full font-bold text-xs py-5 rounded-xl shadow-md ${
                      isSelected
                        ? "bg-amber-500 hover:bg-amber-600 text-neutral-950"
                        : "bg-neutral-900 dark:bg-neutral-800 text-white"
                    }`}
                  >
                    <span>{p.actionLabel}</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default ShowcasePlans;
