import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, LogIn, Shield, Bike, PhoneCall, Sparkles } from "lucide-react";

interface ShowcaseNavbarProps {
  dark: boolean;
  setDark: (val: boolean) => void;
}

export function ShowcaseNavbar({ dark, setDark }: ShowcaseNavbarProps) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 40);
  });

  const navLinks = [
    { label: "Fleet", href: "#fleet" },
    { label: "Live Analytics", href: "#analytics" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Plans", href: "#plans" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#booking" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 py-3 shadow-lg shadow-neutral-900/5"
          : "bg-transparent py-5"
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-950 border border-amber-500/40 flex items-center justify-center font-black text-amber-500 shadow-md group-hover:scale-105 transition-transform">
            MM
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wider text-neutral-950 dark:text-white leading-tight flex items-center gap-1.5">
              METRO <span className="text-amber-500">MOTORS</span>
            </div>
            <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
              Luxury Reselling Showroom
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Menu (shadcn) */}
        <div className="hidden lg:flex items-center gap-1">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navLinks.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    {item.label}
                  </a>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Actions Bar */}
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

          {/* Showroom Internal Portal Link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/deals")}
            className="hidden sm:inline-flex text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-amber-500"
          >
            <Bike size={14} className="mr-1.5 text-amber-500" />
            Live Deals
          </Button>

          {/* Login Terminal Button */}
          <Button
            size="sm"
            onClick={() => navigate("/login")}
            className="text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 shadow-md shadow-amber-500/20"
          >
            <LogIn size={14} className="mr-1.5" />
            Showroom Console
          </Button>

          {/* Mobile Sheet Drawer (shadcn) */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2" aria-label="Open mobile menu">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-neutral-200 dark:border-neutral-800">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xs">
                      MM
                    </div>
                    <span>Metro Motors</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3">
                  {navLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => scrollToSection(e, item.href)}
                      className="text-sm font-semibold p-2.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold justify-start"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/deals");
                      }}
                    >
                      <Bike size={15} className="mr-2 text-amber-500" />
                      Browse Deals Console
                    </Button>
                    <Button
                      className="w-full text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-600 justify-start"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn size={15} className="mr-2" />
                      Showroom Terminal Login
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default ShowcaseNavbar;
