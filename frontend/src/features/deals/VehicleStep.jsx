import { Car, Gauge, Fuel, ShieldCheck, Cog, Award, Sparkles } from "lucide-react";
import { FieldGrid } from "./DealField";
import { vehicleGroups } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
import { useLanguage } from "@/features/i18n/LanguageContext";

const groupTitleMap = {
  "Vehicle details": "section.vehicle_details",
  "Ownership & condition": "section.ownership_condition",
  "Documents & validity": "section.documents_validity",
};

const QUICK_CHIPS = [
  {
    key: "fuel_type",
    label: "Fuel Type",
    options: ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"],
  },
  {
    key: "transmission",
    label: "Transmission",
    options: ["Manual", "Automatic"],
  },
  {
    key: "ownership",
    label: "Ownership",
    options: ["First Owner", "Second Owner", "Third Owner", "Fourth Owner or More"],
  },
  {
    key: "condition",
    label: "Condition",
    options: ["Excellent", "Good", "Fair", "Needs Repair"],
  },
];

export const VehicleStep = ({ deal, update, updateSection, setPhoto, errors }) => {
  const { t } = useLanguage();
  const v = deal?.vehicle || {};

  // Form dynamic display title
  const vehicleDisplayName =
    [v.mfg_month, v.year, v.make, v.model].filter(Boolean).join(" ") ||
    v.vehicle_name ||
    t("vehicle.unspecified", "Showroom Vehicle Unit");

  const plateNumber = v.registration_number || v.vehicle_number || "REG NUMBER";
  const odoDisplay = v.odometer ? `${Number(v.odometer).toLocaleString()} km` : "-- km";

  return (
    <div className="vehicle-step-container" data-testid="vehicle-step-container">
      {/* Live Automotive Specification HUD */}
      <div className="vehicle-hud-container" data-testid="vehicle-hud-card">
        <div className="vehicle-hud-card">
          <div className="vehicle-hud-top">
            <div className="vehicle-hud-title-wrap">
              <div className="vehicle-hud-eyebrow">
                <Car size={14} />
                <span>{t("vehicle.hud_spec", "Live Vehicle Specification HUD")}</span>
              </div>
              <div className="vehicle-hud-model" data-testid="vehicle-hud-display-name">
                {vehicleDisplayName}
              </div>
            </div>

            {/* Stamped Indian Number Plate Graphic */}
            <div className="vehicle-hud-plate" title="Vehicle Registration Plate">
              <div className="hud-plate-blue-band">
                <span>IND</span>
              </div>
              <span className="hud-plate-number" data-testid="vehicle-hud-plate">
                {plateNumber}
              </span>
            </div>
          </div>

          {/* 4 Core Metric Capsules */}
          <div className="vehicle-hud-grid">
            <div className="hud-metric-pill">
              <div className="hud-metric-icon">
                <Fuel size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.fuel", "Fuel")}</span>
                <span className="hud-metric-val">{v.fuel_type || "Petrol"}</span>
              </div>
            </div>

            <div className="hud-metric-pill">
              <div className="hud-metric-icon">
                <Cog size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.transmission", "Gearbox")}</span>
                <span className="hud-metric-val">{v.transmission || "Manual"}</span>
              </div>
            </div>

            <div className="hud-metric-pill">
              <div className="hud-metric-icon">
                <Gauge size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.odometer", "Odometer")}</span>
                <span className="hud-metric-val">{odoDisplay}</span>
              </div>
            </div>

            <div className="hud-metric-pill">
              <div className="hud-metric-icon">
                <Award size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.ownership", "Ownership")}</span>
                <span className="hud-metric-val">{v.ownership || "First Owner"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick-Select Chips */}
      <div className="vehicle-chips-section">
        {QUICK_CHIPS.map((group) => (
          <div className="vehicle-chips-group" key={group.key}>
            <div className="chips-group-header">
              <Sparkles size={12} className="text-amber-400" />
              <span>{group.label}</span>
            </div>
            <div className="chips-row">
              {group.options.map((opt) => {
                const isSelected = v[group.key] === opt;
                return (
                  <button
                    type="button"
                    key={opt}
                    className={`quick-chip ${isSelected ? "active" : ""}`}
                    onClick={() => updateSection("vehicle", group.key, opt)}
                    data-testid={`quick-chip-${group.key}-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle main photo on top with stock and RC transfer buttons beside it */}
      <PhotoSlots
        group="vehicle"
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="portrait"
        stockStatus={deal.status}
        onStockStatusChange={(val) => update("status", val)}
        rcStatus={deal.rc_status}
        onRcStatusChange={(val) => update("rc_status", val)}
      />

      {/* Vehicle field groups */}
      {vehicleGroups.map((group) => (
        <section className="wizard-group" key={group.title}>
          <div className="section-title">
            <h2>{t(groupTitleMap[group.title] || group.title, group.title)}</h2>
          </div>
          <FieldGrid
            fields={group.fields}
            prefix="vehicle"
            value={deal.vehicle}
            errors={errors}
            onChange={(key, value) => updateSection("vehicle", key, value)}
          />
        </section>
      ))}

      {/* Additional photos & documents at bottom */}
      <PhotoSlots
        group="vehicle"
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="docs"
      />
    </div>
  );
};