import { useEffect } from "react";

/** Formats a rupee amount in Indian grouping, or a neutral label when unknown. */
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatKm(value) {
  const n = Number(value);
  if (value === null || value === undefined || !Number.isFinite(n)) return "—";
  return `${n.toLocaleString("en-IN")} km`;
}

export function formatCc(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `${n} cc` : "—";
}

/** Customer-facing names for the internal vehicle_type values. */
export const VEHICLE_TYPE_LABELS = {
  "2 Wheeler with Gear": "Motorcycles",
  "2 Wheeler without Gear": "Scooters",
  "4 Wheeler Car": "Cars",
};

export function vehicleTypeLabel(type) {
  return VEHICLE_TYPE_LABELS[type] || type || "Other";
}

/** "KA-03-****" -> "KA-03" (already-masked public value). */
export function registrationRegion(masked) {
  if (!masked) return "";
  return String(masked).split("-****")[0].replace(/\*+$/, "").replace(/-$/, "");
}

export const BUDGET_OPTIONS = [
  { value: "ALL", label: "Any budget" },
  { value: "100000", label: "Under ₹1 Lakh" },
  { value: "150000", label: "Under ₹1.5 Lakh" },
  { value: "250000", label: "Under ₹2.5 Lakh" },
  { value: "350000", label: "Under ₹3.5 Lakh" },
  { value: "600000", label: "Under ₹6 Lakh" },
  { value: "1500000", label: "Under ₹15 Lakh" },
];

export const KM_OPTIONS = [
  { value: "ALL", label: "Any distance" },
  { value: "5000", label: "Under 5,000 km" },
  { value: "15000", label: "Under 15,000 km" },
  { value: "30000", label: "Under 30,000 km" },
  { value: "60000", label: "Under 60,000 km" },
];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Recently added" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "year_desc", label: "Year: newest first" },
  { value: "mileage_asc", label: "Lowest mileage" },
];

export function smoothScrollTo(selector) {
  const el = typeof document !== "undefined" ? document.querySelector(selector) : null;
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** Locks page scroll and closes on Escape while an overlay is open. */
export function useOverlay(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);
}

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1656420731047-3eb41c9d1dee?crop=entropy&cs=srgb&fm=jpg&q=80&w=2000";
export const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1656420731892-a4ece094df5a?crop=entropy&cs=srgb&fm=jpg&q=80&w=1400";
