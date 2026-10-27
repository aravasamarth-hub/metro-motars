import React, { useState } from "react";
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
  Sparkles,
  Award,
} from "lucide-react";
import { SHOWROOM_CONTACT, getWhatsAppEnquiryUrl } from "@/data/customerEnquiry";
import { MOTORCYCLE_PLACEHOLDER_SVG } from "@/data/publicInventory";

export default function VehicleDetailModal({ vehicle, isOpen, onClose, onOpenEnquiry }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!isOpen || !vehicle) return null;

  const photos = vehicle.photos && vehicle.photos.length > 0
    ? vehicle.photos
    : [{ id: "fallback", url: vehicle.primaryPhoto || MOTORCYCLE_PLACEHOLDER_SVG }];

  const currentPhoto = photos[activePhotoIndex]?.url || photos[0]?.url;
  const whatsappUrl = getWhatsAppEnquiryUrl(vehicle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl text-neutral-900 dark:text-neutral-100 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
              {vehicle.status}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Ref ID: {vehicle.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close details"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Top Title & Price Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                {vehicle.brand} · {vehicle.year}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white">
                {vehicle.title}
              </h2>
              {vehicle.variant && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {vehicle.variant}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Showroom Selling Price
              </span>
              <span className="text-3xl sm:text-4xl font-black text-amber-500">
                ₹{vehicle.sellingPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-emerald-500 font-bold block mt-0.5">
                All RTO Transfer &amp; Certification Included
              </span>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-md">
              <img
                src={currentPhoto}
                alt={vehicle.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = MOTORCYCLE_PLACEHOLDER_SVG;
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                  <Award size={14} className="text-amber-400" />
                  {vehicle.condition}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {photos.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-20 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activePhotoIndex === idx
                        ? "border-amber-500 scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={p.url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = MOTORCYCLE_PLACEHOLDER_SVG;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-4">
              Verified Technical Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                  <Calendar size={14} className="text-amber-500" /> Year
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {vehicle.year}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                  <Gauge size={14} className="text-amber-500" /> Odometer
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {vehicle.odometerKm?.toLocaleString("en-IN")} km
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                  <Zap size={14} className="text-amber-500" /> Engine
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {vehicle.engineCc} cc
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                  <Fuel size={14} className="text-amber-500" /> Fuel
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {vehicle.fuelType}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                  <Palette size={14} className="text-amber-500" /> Color
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {vehicle.color}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                  <MapPin size={14} className="text-amber-500" /> Registration
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {vehicle.registrationLocation}
                </div>
              </div>
            </div>
          </div>

          {/* 120-Point Verification Checklist */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-amber-500" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                120-Point Mechanical &amp; Title Verification Guarantee
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {vehicle.inspectionSummary.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                Vehicle Overview
              </h4>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-500 block">Showroom Location</span>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {SHOWROOM_CONTACT.address}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${SHOWROOM_CONTACT.rawPhone}`}
                className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone size={14} className="text-amber-500" />
                <span>Call Showroom</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEnquiry(vehicle);
                }}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Sparkles size={14} />
                <span>Contact to Purchase</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
