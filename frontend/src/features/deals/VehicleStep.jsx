import { FieldGrid, DealField } from "./DealField";
import { vehicleGroups } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
import { useLanguage } from "@/features/i18n/LanguageContext";

const groupTitleMap = {
  "Vehicle details": "section.vehicle_details",
  "Ownership & condition": "section.ownership_condition",
  "Documents & validity": "section.documents_validity",
};

export const VehicleStep = ({ deal, update, updateSection, setPhoto, errors }) => {
  const { t } = useLanguage();

  return (
    <div className="vehicle-step-container" data-testid="vehicle-step-container">
      {/* Step title */}
      <h2 className="seller-step-title">{t("step.vehicle", "Vehicle")}</h2>

      {/* Vehicle main photo on top */}
      <PhotoSlots
        group="vehicle"
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="portrait"
      />

      {/* Deal status */}
      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.deal_status", "Deal status")}</h2>
          <span className="required-note">{t("section.required_fields", "* Required fields")}</span>
        </div>
        <div className="form-grid wizard-fields">
          <DealField
            prefix="deal"
            config={{ key: "status", label: "Stock status", type: "select", options: ["In Stock", "Sold"] }}
            value={deal.status}
            onChange={update}
          />
          <DealField
            prefix="deal"
            config={{ key: "rc_status", label: "RC transfer status", type: "select", options: ["Pending", "Completed"] }}
            value={deal.rc_status}
            onChange={update}
          />
        </div>
      </section>

      {/* Vehicle field groups */}
      {vehicleGroups.map(group => (
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