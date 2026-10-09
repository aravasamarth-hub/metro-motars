import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Bike,
  ShieldCheck,
  Fingerprint,
  Database,
  ArrowUp,
  LogIn,
  Heart,
} from "lucide-react";

export function ShowcaseFooter() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/60 dark:bg-neutral-950/80 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-200 dark:border-neutral-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-950 border border-amber-500/40 flex items-center justify-center font-black text-amber-500 shadow-md">
                MM
              </div>
              <div>
                <div className="font-black text-base text-neutral-950 dark:text-white tracking-wider">
                  METRO <span className="text-amber-500">MOTORS</span>
                </div>
                <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
                  Bangalore Reselling Showroom
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              Curated pre-owned two-wheelers and performance automobiles. Certified with 120-point
              mechanical diagnostics, clean smartcard RC titles, and optical biometric deeds.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-neutral-500">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck size={14} /> 120-Pt Check
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Fingerprint size={14} /> Biometric Deed
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                <Database size={14} /> Cloud Vault
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Explore Fleet
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <a href="#fleet" className="hover:text-amber-500 transition-colors">
                  Royal Enfield Fleet
                </a>
              </li>
              <li>
                <a href="#fleet" className="hover:text-amber-500 transition-colors">
                  KTM Duke & RC
                </a>
              </li>
              <li>
                <a href="#fleet" className="hover:text-amber-500 transition-colors">
                  Kawasaki & Superbikes
                </a>
              </li>
              <li>
                <a href="#fleet" className="hover:text-amber-500 transition-colors">
                  Yamaha & Honda Premium
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-amber-500 transition-colors">
                  Live Valuation Index
                </a>
              </li>
            </ul>
          </div>

          {/* Ownership & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Buyer Assurance
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <a href="#how-it-works" className="hover:text-amber-500 transition-colors">
                  Verification Roadmap
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-amber-500 transition-colors">
                  Showroom Buyback Guarantee
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-amber-500 transition-colors">
                  EMI & Banking Partners
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-500 transition-colors">
                  RTO Transfer FAQs
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-amber-500 transition-colors">
                  Book Test Ride
                </a>
              </li>
            </ul>
          </div>

          {/* Internal Dealer Console */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Dealer Terminal
            </h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed mb-3">
              Staff, agents, and management login portal for deal processing and inventory ledger.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center gap-1.5 shadow-sm hover:bg-amber-500 hover:text-neutral-950 transition-colors"
            >
              <LogIn size={14} />
              <span>Showroom Login</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Metro Motors Enterprise. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-[11px]">
              Engineered with <Heart size={12} className="text-red-500 fill-red-500" /> for Bangalore Moto Culture
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:text-amber-500 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ShowcaseFooter;
