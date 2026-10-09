import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SpotlightCard } from "@/components/kokonut/SpotlightCard";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bike,
  Gauge,
  Calendar,
  Fuel,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface FleetVehicle {
  id: string;
  name: string;
  brand: string;
  year: number;
  price: string;
  originalPrice: string;
  odometer: string;
  fuel: string;
  color: string;
  imageTag: string;
  status: "Available" | "Reserved" | "Fast Mover";
  verifiedPoints: number;
}

const FEATURED_FLEET: FleetVehicle[] = [
  {
    id: "fleet-hunter-350",
    name: "Royal Enfield Hunter 350",
    brand: "Royal Enfield",
    year: 2023,
    price: "₹1,42,000",
    originalPrice: "₹1,75,000",
    odometer: "14,200 km",
    fuel: "Petrol (J-Series)",
    color: "Dapper Ash",
    imageTag: "Single Owner · Mint Condition",
    status: "Fast Mover",
    verifiedPoints: 120,
  },
  {
    id: "fleet-duke-390",
    name: "KTM 390 Duke ABS Gen-3",
    brand: "KTM",
    year: 2024,
    price: "₹2,68,000",
    originalPrice: "₹3,40,000",
    odometer: "6,800 km",
    fuel: "Petrol (LC4c)",
    color: "Electronic Orange",
    imageTag: "Under Factory Warranty · Quickshifter+",
    status: "Available",
    verifiedPoints: 120,
  },
  {
    id: "fleet-mt15",
    name: "Yamaha MT-15 V2 Deluxe",
    brand: "Yamaha",
    year: 2023,
    price: "₹1,28,000",
    originalPrice: "₹1,68,000",
    odometer: "11,400 km",
    fuel: "Petrol (VVA)",
    color: "Cyan Storm",
    imageTag: "Bluetooth Y-Connect · Dual Channel ABS",
    status: "Available",
    verifiedPoints: 120,
  },
  {
    id: "fleet-ninja-650",
    name: "Kawasaki Ninja 650 KRT",
    brand: "Kawasaki",
    year: 2022,
    price: "₹5,20,000",
    originalPrice: "₹7,12,000",
    odometer: "12,900 km",
    fuel: "Petrol (Twin)",
    color: "Lime Green",
    imageTag: "TFT Console · Showa Suspension",
    status: "Fast Mover",
    verifiedPoints: 120,
  },
  {
    id: "fleet-bmw-310",
    name: "BMW G 310 GS Adventure",
    brand: "BMW Motorrad",
    year: 2023,
    price: "₹2,75,000",
    originalPrice: "₹3,85,000",
    odometer: "8,900 km",
    fuel: "Petrol (Euro-5)",
    color: "Rallye Style",
    imageTag: "Crash Bars Included · Touring Screen",
    status: "Available",
    verifiedPoints: 120,
  },
  {
    id: "fleet-activa-6g",
    name: "Honda Activa 6G Premium",
    brand: "Honda",
    year: 2023,
    price: "₹69,000",
    originalPrice: "₹92,000",
    odometer: "9,100 km",
    fuel: "Petrol (eSP)",
    color: "Pearl Siren Blue",
    imageTag: "Serviced at Honda Official · New Battery",
    status: "Reserved",
    verifiedPoints: 120,
  },
];

export function ShowcaseFleet() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  const brands = ["All", "Royal Enfield", "KTM", "Yamaha", "Kawasaki", "BMW Motorrad", "Honda"];

  const filteredFleet =
    selectedBrand === "All"
      ? FEATURED_FLEET
      : FEATURED_FLEET.filter((v) => v.brand === selectedBrand);

  return (
    <section id="fleet" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <MotionReveal className="text-center max-w-3xl mx-auto mb-12">
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold"
        >
          CURATED FLEET INVENTORY
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight mb-4">
          Verified Pre-Owned Machines
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
          Every vehicle undergoes 120-point mechanical evaluation, fluid flushes, dyno tuning, and
          digital biometric title clearance before reaching our showroom floor.
        </p>

        {/* Brand Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-8">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedBrand === b
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 scale-105"
                  : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </MotionReveal>

      {/* Grid of KokonutUI Spotlight Cards with Motion Reveals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFleet.map((vehicle, idx) => (
          <MotionReveal key={vehicle.id} delay={idx * 0.08} direction="up">
            {/* KokonutUI Spotlight Card */}
            <SpotlightCard className="h-full flex flex-col justify-between group cursor-pointer border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-amber-500/50">
              <div>
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                    {vehicle.brand}
                  </span>
                  <Badge
                    className={`text-[10px] font-bold border ${
                      vehicle.status === "Fast Mover"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : vehicle.status === "Reserved"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    }`}
                  >
                    {vehicle.status}
                  </Badge>
                </div>

                {/* Vehicle Visual Header Icon & Name */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Bike size={20} className="text-amber-500 group-hover:rotate-6 transition-transform" />
                    <h3 className="text-lg font-extrabold text-neutral-950 dark:text-white group-hover:text-amber-500 transition-colors">
                      {vehicle.name}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <span>{vehicle.color}</span>
                    <span>·</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                      <ShieldCheck size={12} /> {vehicle.verifiedPoints}-Pt Certified
                    </span>
                  </p>
                </div>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-neutral-100 dark:border-neutral-800/80 text-center">
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-xl">
                    <Calendar size={13} className="mx-auto text-neutral-400 mb-0.5" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      {vehicle.year}
                    </span>
                    <span className="text-[9px] text-neutral-400">Model</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-xl">
                    <Gauge size={13} className="mx-auto text-neutral-400 mb-0.5" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      {vehicle.odometer}
                    </span>
                    <span className="text-[9px] text-neutral-400">Odometer</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-xl">
                    <Fuel size={13} className="mx-auto text-neutral-400 mb-0.5" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                      {vehicle.fuel.split(" ")[0]}
                    </span>
                    <span className="text-[9px] text-neutral-400">Powertrain</span>
                  </div>
                </div>

                {/* Perks note */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 mb-4">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  <span>{vehicle.imageTag}</span>
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="text-xs text-neutral-400 line-through">
                    {vehicle.originalPrice}
                  </div>
                  <div className="text-xl font-black text-neutral-950 dark:text-white">
                    {vehicle.price}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate("/deals")}
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold rounded-xl group/btn"
                >
                  <span>View Deed</span>
                  <ArrowUpRight size={14} className="ml-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </SpotlightCard>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}

export default ShowcaseFleet;
