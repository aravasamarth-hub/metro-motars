import React, { memo } from "react";
import { Gauge, Fuel, Cog, Zap, MapPin, MessageSquare } from "lucide-react";
import { MOTORCYCLE_PLACEHOLDER_SVG } from "@/data/publicInventory";
import { formatPrice, formatKm, formatCc, vehicleTypeLabel } from "./marketplaceUtils";

function VehicleCard({ bike, onSelect, onEnquire, priority = false }) {
  const spec = [
    { icon: Gauge, value: formatKm(bike.odometerKm) },
    { icon: Zap, value: formatCc(bike.engineCc) },
    { icon: bike.transmission ? Cog : Fuel, value: bike.transmission || bike.fuelType || "—" },
  ];

  return (
    <article
      className="mm-card mm-vcard group flex flex-col overflow-hidden"
      data-testid={`vehicle-card-${bike.id}`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(bike)}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-900 text-left"
        aria-label={`View details for ${bike.title}`}
        data-testid={`vehicle-card-image-${bike.id}`}
      >
        <img
          src={bike.primaryPhoto || MOTORCYCLE_PLACEHOLDER_SVG}
          alt={bike.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = MOTORCYCLE_PLACEHOLDER_SVG;
          }}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="mm-badge bg-white/95 text-neutral-900 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {bike.status}
          </span>
          {bike.vehicleType && (
            <span className="mm-badge bg-black/55 text-white backdrop-blur">{vehicleTypeLabel(bike.vehicleType)}</span>
          )}
        </div>
        {bike.year && (
          <span className="mm-badge absolute right-3 top-3 bg-black/55 text-white backdrop-blur">{bike.year}</span>
        )}
        <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white/85">{bike.condition}</span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">
          {bike.brand}
        </p>
        <h3 className="mm-display mt-1 text-[17px] leading-snug text-neutral-950 dark:text-white">
          <button
            type="button"
            onClick={() => onSelect?.(bike)}
            className="line-clamp-1 w-full text-left transition-colors hover:text-[color:var(--mm-gold-lo)] dark:hover:text-[color:var(--mm-gold)]"
            title={bike.title}
            data-testid={`vehicle-card-view-${bike.id}`}
          >
            {bike.title}
          </button>
        </h3>
        <p className="mt-0.5 line-clamp-1 min-h-[18px] text-[13px] text-neutral-500 dark:text-neutral-400">
          {bike.variant || bike.model}
        </p>

        <ul className="mt-4 grid grid-cols-3 gap-2 border-y border-black/[0.06] py-3 dark:border-white/[0.07]">
          {spec.map(({ icon: Icon, value }, i) => (
            <li key={i} className="flex min-w-0 items-center gap-1.5 text-[12px] text-neutral-600 dark:text-neutral-300">
              <Icon size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
              <span className="truncate">{value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-neutral-500 dark:text-neutral-400">
          <MapPin size={13} aria-hidden="true" />
          <span className="truncate">Bengaluru showroom · Reg. {bike.registrationLocation}</span>
        </div>

        <div className="mt-auto pt-5">
          <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Selling price</span>
          <div className="mt-0.5 flex items-center justify-between gap-3">
            <span className="mm-display min-w-0 truncate text-[21px] text-neutral-950 dark:text-white" data-testid="vehicle-card-price">
              {formatPrice(bike.sellingPrice)}
            </span>
            <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEnquire?.(bike)}
              className="mm-btn mm-btn-primary mm-btn-sm"
              data-testid={`vehicle-card-enquire-${bike.id}`}
            >
              <MessageSquare size={14} aria-hidden="true" />
              <span>Enquire</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(VehicleCard);
