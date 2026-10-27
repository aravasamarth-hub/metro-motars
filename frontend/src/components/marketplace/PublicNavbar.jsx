import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Bike, Phone } from "lucide-react";
import { SHOWROOM_CONTACT } from "@/data/customerEnquiry";

export default function PublicNavbar({ dark, setDark, totalBikes = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Browse Bikes", href: "#browse-bikes" },
    { label: "120-Point Certification", href: "#standards" },
    { label: "About Us", href: "#about" },
    { label: "Contact & Location", href: "#contact" },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Lockup */}
        <a href="#hero" onClick={(e) => handleNavClick(e, "#hero")} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-neutral-950 border border-amber-500/40 flex items-center justify-center font-black text-amber-500 shadow-md group-hover:scale-105 transition-transform">
            MM
          </div>
          <div>
            <div className="font-black text-base tracking-wider text-neutral-950 dark:text-white leading-tight flex items-center gap-1.5">
              METRO <span className="text-amber-500">MOTORS</span>
            </div>
            <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
              Pre-Owned Two-Wheeler Showroom
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-xs font-semibold px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* Quick Call Link */}
          <a
            href={`tel:${SHOWROOM_CONTACT.rawPhone}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-amber-500"
          >
            <Phone size={14} className="text-amber-500" />
            <span>Call Showroom</span>
          </a>

          {/* Browse Available Bikes CTA Button */}
          <a
            href="#browse-bikes"
            onClick={(e) => handleNavClick(e, "#browse-bikes")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Bike size={15} />
            <span>Browse {totalBikes > 0 ? `${totalBikes} Bikes` : "Available Bikes"}</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-200 dark:border-neutral-800 px-5 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-bold p-2.5 rounded-xl text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
            <a
              href="#browse-bikes"
              onClick={(e) => handleNavClick(e, "#browse-bikes")}
              className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 text-xs font-black flex items-center justify-center gap-2 shadow-md"
            >
              <Bike size={16} />
              <span>Browse All {totalBikes} Bikes</span>
            </a>
            <a
              href={`tel:${SHOWROOM_CONTACT.rawPhone}`}
              className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Phone size={15} className="text-amber-500" />
              <span>Call Showroom ({SHOWROOM_CONTACT.phone})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
