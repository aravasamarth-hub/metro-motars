import { Car, Gauge, Fuel, ShieldCheck, Cog, Award, ChevronDown, Edit3 } from "lucide-react";
import { FieldGrid } from "./DealField";
import { vehicleGroups } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { VEHICLE_CATEGORIES } from "@/features/deals/dealModel";

const groupTitleMap = {
  "Vehicle details": "section.vehicle_details",
  "Ownership & condition": "section.ownership_condition",
  "Documents & validity": "section.documents_validity",
};

const getCategoryIcon = (type) => {
  switch (type) {
    case "2 Wheeler with Gear": return "🏍️";
    case "2 Wheeler without Gear": return "🛵";
    case "4 Wheeler Car": return "🚗";
    default: return "🚗";
  }
};



export const VehicleStep = ({ deal, update, updateSection, setPhoto, errors }) => {
  const { t } = useLanguage();
  const v = deal?.vehicle || {};
  const currentCategory = v.vehicle_type || "4 Wheeler Car";

  // Form dynamic display title
  const vehicleDisplayName =
    [v.mfg_month, v.year, v.make, v.model].filter(Boolean).join(" ") ||
    v.vehicle_name ||
    t("vehicle.unspecified", "Showroom Vehicle Unit");

  const plateNumber = v.registration_number || v.vehicle_number || "";

  return (
    <div className="vehicle-step-container" data-testid="vehicle-step-container">
      {/* Live Automotive Specification HUD */}
      <div className="vehicle-hud-container" data-testid="vehicle-hud-card">
        <div className="vehicle-hud-card">
          <div className="vehicle-hud-top">
            <div className="vehicle-hud-title-wrap">
              <div className="vehicle-hud-eyebrow">
                <span className="text-base">{getCategoryIcon(currentCategory)}</span>
                <span>{currentCategory} · {t("vehicle.hud_spec", "Specification HUD")}</span>
                <span className="hud-interactive-badge" title="All values in this HUD are directly editable">
                  <Edit3 size={10} /> Live Edit
                </span>
              </div>
              <div className="vehicle-hud-model-row">
                <input
                  type="text"
                  className="vehicle-hud-model-input"
                  data-testid="vehicle-hud-display-name"
                  value={v.vehicle_name !== undefined ? v.vehicle_name : ([v.make, v.model].filter(Boolean).join(" "))}
                  onChange={(e) => updateSection("vehicle", "vehicle_name", e.target.value)}
                  placeholder={vehicleDisplayName || "Enter Vehicle Make & Model..."}
                  title="Click to edit vehicle name / model directly"
                />

                {/* Category selector beside the name styled like fuel */}
                <div className="hud-metric-pill editable hud-category-pill" title="Click to change Vehicle Category">
                  <div className="hud-metric-icon">
                    <span className="text-base leading-none">{getCategoryIcon(currentCategory)}</span>
                  </div>
                  <div className="hud-metric-details">
                    <span className="hud-metric-label">{t("field.vehicle_type", "Vehicle Category")}</span>
                    <div className="hud-metric-val-wrap">
                      <select
                        className="hud-metric-select"
                        data-testid="vehicle-hud-category-select"
                        value={currentCategory}
                        onChange={(e) => updateSection("vehicle", "vehicle_type", e.target.value)}
                      >
                        {VEHICLE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.label}>
                            {cat.icon} {t(`type.${cat.id.replace(/-/g, "_")}`, cat.label)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="hud-select-chevron" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stamped Indian Number Plate Graphic — Directly Editable */}
            <div className="vehicle-hud-plate" title="Click to edit Registration Number">
              <div className="hud-plate-blue-band">
                <span>IND</span>
              </div>
              <input
                type="text"
                className="hud-plate-input"
                data-testid="vehicle-hud-plate"
                value={plateNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  updateSection("vehicle", "registration_number", val);
                  updateSection("vehicle", "vehicle_number", val);
                }}
                placeholder="REG NUMBER"
                title="Type registration number (e.g. KA-17-EX-2456)"
              />
            </div>
          </div>

          {/* 5 Core Metric Capsules (Fuel, Gearbox, Odometer, Ownership, Condition) */}
          <div className="vehicle-hud-grid">
            {/* 1. Fuel */}
            <div className="hud-metric-pill editable" title="Click to change Fuel Type">
              <div className="hud-metric-icon">
                <Fuel size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.fuel", "Fuel")}</span>
                <div className="hud-metric-val-wrap">
                  <select
                    className="hud-metric-select"
                    value={v.fuel_type || "Petrol"}
                    onChange={(e) => updateSection("vehicle", "fuel_type", e.target.value)}
                  >
                    {["Petrol", "Diesel", "Electric", "CNG", "Hybrid"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="hud-select-chevron" />
                </div>
              </div>
            </div>

            {/* 2. Gearbox / Transmission */}
            <div className="hud-metric-pill editable" title="Click to change Gearbox / Transmission">
              <div className="hud-metric-icon">
                <Cog size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.transmission", "Gearbox")}</span>
                <div className="hud-metric-val-wrap">
                  <select
                    className="hud-metric-select"
                    value={v.transmission || "Manual"}
                    onChange={(e) => updateSection("vehicle", "transmission", e.target.value)}
                  >
                    {["Manual", "Automatic"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="hud-select-chevron" />
                </div>
              </div>
            </div>

            {/* 3. Odometer */}
            <div className="hud-metric-pill editable" title="Click to edit Odometer mileage">
              <div className="hud-metric-icon">
                <Gauge size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.odometer", "Odometer")}</span>
                <div className="hud-metric-val-wrap">
                  <input
                    type="number"
                    className="hud-metric-input"
                    value={v.odometer !== undefined && v.odometer !== null ? v.odometer : ""}
                    onChange={(e) => updateSection("vehicle", "odometer", e.target.value)}
                    placeholder="0"
                  />
                  <span className="hud-km-suffix">km</span>
                </div>
              </div>
            </div>

            {/* 4. Ownership */}
            <div className="hud-metric-pill editable" title="Click to change Ownership">
              <div className="hud-metric-icon">
                <Award size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.ownership", "Ownership")}</span>
                <div className="hud-metric-val-wrap">
                  <select
                    className="hud-metric-select"
                    value={v.ownership || "First Owner"}
                    onChange={(e) => updateSection("vehicle", "ownership", e.target.value)}
                  >
                    {["First Owner", "Second Owner", "Third Owner", "Fourth Owner or More"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="hud-select-chevron" />
                </div>
              </div>
            </div>

            {/* 5. Condition (New!) */}
            <div className="hud-metric-pill editable" title="Click to change Vehicle Condition">
              <div className="hud-metric-icon hud-condition-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="hud-metric-details">
                <span className="hud-metric-label">{t("vehicle.condition", "Condition")}</span>
                <div className="hud-metric-val-wrap">
                  <select
                    className={`hud-metric-select condition-val-${(v.condition || "Excellent").toLowerCase().replace(/\s+/g, "-")}`}
                    value={v.condition || "Excellent"}
                    onChange={(e) => updateSection("vehicle", "condition", e.target.value)}
                  >
                    {["Excellent", "Good", "Fair", "Needs Repair"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="hud-select-chevron" />
                </div>
              </div>
            </div>
          </div>
        </div>
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