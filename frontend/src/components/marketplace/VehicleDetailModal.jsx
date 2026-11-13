import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Calendar,
  Gauge,
  Zap,
  Fuel,
  Palette,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Cog,
  UserRound,
  Award,
  ArrowRight,
} from "lucide-react";
import { SHOWROOM_CONTACT, getWhatsAppEnquiryUrl } from "@/data/customerEnquiry";
import { MOTORCYCLE_PLACEHOLDER_SVG } from "@/data/publicInventory";
import VehicleCard from "./VehicleCard";
import { formatPrice, formatKm, formatCc, vehicleTypeLabel, useOverlay } from "./marketplaceUtils";

const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = MOTORCYCLE_PLACEHOLDER_SVG;
};

export default function VehicleDetailModal({ vehicle, isOpen, onClose, onOpenEnquiry, inventory = [], onSelectVehicle }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const open = Boolean(isOpen && vehicle);
  useOverlay(open, onClose);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [vehicle?.id]);

  const photos = useMemo(() => {
    if (!vehicle) return [];
    return vehicle.photos && vehicle.photos.length > 0
      ? vehicle.photos
      : [{ id: "fallback", url: vehicle.primaryPhoto || MOTORCYCLE_PLACEHOLDER_SVG }];
  }, [vehicle]);

  const step = useCallback(
    (dir) => setActivePhotoIndex((i) => (i + dir + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (!open || photos.length < 2) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length, step]);

  const similar = useMemo(() => {
    if (!vehicle) return [];
    return inventory
      .filter((b) => b.id !== vehicle.id && (b.vehicleType === vehicle.vehicleType || b.brand === vehicle.brand))
      .slice(0, 3);
  }, [inventory, vehicle]);

  if (!open) return null;

  const currentPhoto = photos[activePhotoIndex]?.url || photos[0]?.url;
  const whatsappUrl = getWhatsAppEnquiryUrl(vehicle);

  const specs = [
    { icon: Calendar, label: "Year", value: vehicle.year || "—" },
    { icon: Gauge, label: "Odometer", value: formatKm(vehicle.odometerKm) },
    { icon: Zap, label: "Engine", value: formatCc(vehicle.engineCc) },
    { icon: Fuel, label: "Fuel", value: vehicle.fuelType || "—" },
    { icon: Cog, label: "Transmission", value: vehicle.transmission || "—" },
    { icon: UserRound, label: "Ownership", value: vehicle.ownership || "—" },
    { icon: Palette, label: "Color", value: vehicle.color || "—" },
    { icon: MapPin, label: "Registration", value: vehicle.registrationLocation },
  ];

  const enquire = () => {
    onClose();
    onOpenEnquiry(vehicle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={vehicle.title} data-testid="vehicle-detail-modal">
      <button type="button" className="mm-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close details" tabIndex={-1} />
      <div className="mm-sheet relative flex h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[24px] bg-[color:var(--mm-paper)] text-neutral-900 shadow-2xl dark:bg-[color:var(--mm-ink-900)] dark:text-neutral-100 md:h-auto md:max-h-[92vh] md:rounded-[24px]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-3.5 dark:border-white/[0.07] sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="mm-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {vehicle.status}
            </span>
            <span className="truncate text-[12px] text-neutral-500">Ref ID: {vehicle.id}</span>
          </div>
          <button type="button" onClick={onClose} className="mm-icon-btn" aria-label="Close details" data-testid="vehicle-detail-close">
            <X size={21} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-10 lg:p-8">
            {/* Left: gallery + details */}
            <div className="min-w-0 space-y-8">
              <div className="lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">
                  {vehicle.brand}{vehicle.year ? ` · ${vehicle.year}` : ""}
                </p>
                <p className="mm-display mt-1 text-[22px] leading-tight text-neutral-950 dark:text-white">{vehicle.title}</p>
              </div>
              <div>
                <div className="group relative aspect-[16/10] overflow-hidden rounded-[18px] bg-neutral-950">
                  <img key={currentPhoto} src={currentPhoto} alt={`${vehicle.title} — photo ${activePhotoIndex + 1}`} onError={onImgError} className="mm-backdrop h-full w-full object-cover" data-testid="vehicle-detail-main-image" />
                  <span className="mm-badge absolute left-4 top-4 bg-black/55 text-white backdrop-blur">
                    <Award size={13} className="text-[color:var(--mm-gold)]" /> {vehicle.condition}
                  </span>
                  {photos.length > 1 && (
                    <>
                      <button type="button" onClick={() => step(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-md transition hover:bg-white" aria-label="Previous photo" data-testid="gallery-prev">
                        <ChevronLeft size={20} />
                      </button>
                      <button type="button" onClick={() => step(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-md transition hover:bg-white" aria-label="Next photo" data-testid="gallery-next">
                        <ChevronRight size={20} />
                      </button>
                      <span className="mm-badge absolute bottom-4 right-4 bg-black/60 text-white" data-testid="gallery-counter">
                        {activePhotoIndex + 1} / {photos.length}
                      </span>
                    </>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                    {photos.map((p, idx) => (
                      <button
                        key={p.id || idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`h-16 w-24 shrink-0 overflow-hidden rounded-[10px] border-2 transition ${activePhotoIndex === idx ? "border-[color:var(--mm-gold)]" : "border-transparent opacity-60 hover:opacity-100"}`}
                        aria-label={`Show photo ${idx + 1}`}
                        aria-current={activePhotoIndex === idx}
                        data-testid={`gallery-thumb-${idx}`}
                      >
                        <img src={p.url} alt="" loading="lazy" onError={onImgError} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Verified Technical Specifications</h3>
                <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-black/[0.06] bg-black/[0.06] dark:border-white/[0.07] dark:bg-white/[0.07] sm:grid-cols-4">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white p-4 dark:bg-[color:var(--mm-ink-850)]">
                      <dt className="flex items-center gap-1.5 text-[12px] text-neutral-500"><Icon size={13} /> {label}</dt>
                      <dd className="mt-1 truncate text-[14px] font-semibold text-neutral-900 dark:text-white" title={String(value)}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-[16px] border border-[rgba(217,164,65,0.25)] bg-[rgba(217,164,65,0.06)] p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]" />
                  <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white">120-Point Mechanical &amp; Title Verification</h3>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(vehicle.inspectionSummary || []).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {vehicle.description && (
                <div>
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Vehicle Overview</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{vehicle.description}</p>
                </div>
              )}
            </div>

            {/* Right: sticky purchase panel */}
            <aside className="min-w-0">
              <div className="lg:sticky lg:top-0 space-y-4">
                <div className="mm-card p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">
                    {vehicle.brand}{vehicle.year ? ` · ${vehicle.year}` : ""}{vehicle.vehicleType ? ` · ${vehicleTypeLabel(vehicle.vehicleType)}` : ""}
                  </p>
                  <h2 className="mm-display mt-2 text-2xl leading-tight text-neutral-950 dark:text-white sm:text-[28px]">{vehicle.title}</h2>
                  {vehicle.variant && <p className="mt-1 text-[14px] text-neutral-500">{vehicle.variant}</p>}

                  <div className="mt-6 border-t border-black/[0.06] pt-5 dark:border-white/[0.07]">
                    <span className="block text-[12px] text-neutral-500">Showroom Selling Price</span>
                    <span className="mm-display mt-1 block text-[34px] leading-none text-neutral-950 dark:text-white" data-testid="vehicle-detail-price">{formatPrice(vehicle.sellingPrice)}</span>
                    <span className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={13} /> All RTO Transfer &amp; Certification Included
                    </span>
                  </div>

                  <div className="mt-6 grid gap-2.5">
                    <button type="button" onClick={enquire} className="mm-btn mm-btn-primary mm-btn-lg w-full" data-testid="vehicle-detail-enquire">
                      Contact to Purchase <ArrowRight size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mm-btn mm-btn-whatsapp" data-testid="vehicle-detail-whatsapp">
                        <MessageSquare size={16} /> WhatsApp
                      </a>
                      <a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="mm-btn mm-btn-outline" data-testid="vehicle-detail-call">
                        <Phone size={16} /> Call Showroom
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mm-card p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Showroom Location</p>
                  <p className="mt-2 text-[14px] font-semibold text-neutral-900 dark:text-white">{SHOWROOM_CONTACT.name}</p>
                  <p className="mt-0.5 text-[13px] text-neutral-600 dark:text-neutral-400">{SHOWROOM_CONTACT.address}</p>
                  <p className="mt-2 text-[12px] text-neutral-500">{SHOWROOM_CONTACT.businessHours}</p>
                </div>
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <div className="border-t border-black/[0.06] p-5 dark:border-white/[0.07] sm:p-6 lg:p-8" data-testid="similar-vehicles">
              <h3 className="mm-display text-xl text-neutral-950 dark:text-white">Similar vehicles</h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((b) => (
                  <VehicleCard key={b.id} bike={b} onSelect={onSelectVehicle} onEnquire={(x) => { onClose(); onOpenEnquiry(x); }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile sticky purchase bar */}
        <div className="flex items-center gap-3 border-t border-black/[0.06] bg-[color:var(--mm-paper)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-white/[0.07] dark:bg-[color:var(--mm-ink-900)] lg:hidden" data-testid="vehicle-detail-mobile-bar">
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] text-neutral-500">Selling price</span>
            <span className="mm-display block truncate text-[19px] text-neutral-950 dark:text-white">{formatPrice(vehicle.sellingPrice)}</span>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mm-btn mm-btn-whatsapp !px-3.5" aria-label="WhatsApp showroom">
            <MessageSquare size={17} />
          </a>
          <button type="button" onClick={enquire} className="mm-btn mm-btn-primary" data-testid="vehicle-detail-mobile-enquire">
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
}
