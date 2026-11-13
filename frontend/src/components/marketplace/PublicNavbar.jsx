import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Phone, ArrowRight } from "lucide-react";
import { SHOWROOM_CONTACT } from "@/data/customerEnquiry";
import { smoothScrollTo, useOverlay } from "./marketplaceUtils";

const NAV_LINKS = [
  { label: "Inventory", href: "#browse-bikes" },
  { label: "Categories", href: "#categories" },
  { label: "120-Point Check", href: "#standards" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function PublicNavbar({ dark, setDark, totalBikes = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useOverlay(mobileMenuOpen, () => setMobileMenuOpen(false));

  const go = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    smoothScrollTo(href);
  };

  // Over the dark hero the bar stays light-on-dark until the user scrolls.
  const solid = isScrolled || mobileMenuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-black/[0.06] bg-[rgba(245,244,240,0.85)] text-neutral-900 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[rgba(7,8,10,0.8)] dark:text-white"
          : "border-b border-transparent bg-transparent text-white"
      }`}
      data-testid="public-navbar"
    >
      <div className="mm-container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <a href="#hero" onClick={(e) => go(e, "#hero")} className="flex items-center gap-3" data-testid="navbar-brand">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[color:var(--mm-gold)] text-[13px] font-extrabold tracking-tight text-[#120f08]">
            MM
          </span>
          <span className="leading-none">
            <span className="mm-display block text-[15px] tracking-[0.08em]">
              METRO <span className="text-[color:var(--mm-gold)]">MOTORS</span>
            </span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 xl:block">
              Certified Pre-Owned · Bengaluru
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              className="relative whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] font-medium opacity-80 transition-opacity hover:opacity-100"
              data-testid={`nav-link-${item.href.slice(1)}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="mm-icon-btn"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="public-theme-toggle"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href={`tel:${SHOWROOM_CONTACT.rawPhone}`}
            className="hidden items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] font-medium opacity-85 hover:opacity-100 xl:inline-flex"
            data-testid="navbar-call-link"
          >
            <Phone size={15} className="text-[color:var(--mm-gold)]" />
            <span>{SHOWROOM_CONTACT.phone}</span>
          </a>
          <a
            href="#browse-bikes"
            onClick={(e) => go(e, "#browse-bikes")}
            className="mm-btn mm-btn-primary mm-btn-sm hidden sm:inline-flex"
            data-testid="navbar-browse-cta"
          >
            Browse {totalBikes > 0 ? `${totalBikes} vehicles` : "inventory"}
            <ArrowRight size={14} />
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="mm-icon-btn lg:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="mm-backdrop h-[calc(100dvh-64px)] overflow-y-auto border-t border-black/[0.06] bg-[color:var(--mm-paper)] px-5 pb-8 pt-4 text-neutral-900 dark:border-white/[0.06] dark:bg-[color:var(--mm-ink-950)] dark:text-white lg:hidden"
          data-testid="mobile-menu"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Pre-Owned Showroom</p>
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => go(e, item.href)}
                className="mm-display flex items-center justify-between border-b border-black/[0.06] py-4 text-[22px] dark:border-white/[0.07]"
              >
                {item.label}
                <ArrowRight size={18} className="opacity-40" />
              </a>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <a href="#browse-bikes" onClick={(e) => go(e, "#browse-bikes")} className="mm-btn mm-btn-primary mm-btn-lg w-full">
              Browse all {totalBikes} vehicles
            </a>
            <a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="mm-btn mm-btn-outline mm-btn-lg w-full">
              <Phone size={16} className="text-[color:var(--mm-gold)]" />
              Call Showroom ({SHOWROOM_CONTACT.phone})
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
