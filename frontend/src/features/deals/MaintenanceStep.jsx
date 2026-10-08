import React from "react";
import { Wrench, Sparkles, AlertCircle } from "lucide-react";
import { MaintenanceSection } from "./MaintenanceSection";
import { calculateMaintenanceTotal, money } from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const MaintenanceStep = ({ deal, updateSection, errors }) => {
  const { t } = useLanguage();
  const maintenance = deal?.maintenance || {};
  const services = Array.isArray(maintenance.services) ? maintenance.services : [];
  const activeCount = services.filter((s) => s.enabled).length;
  const totalExpense = calculateMaintenanceTotal(deal?.maintenance);

  return (
    <div className="maintenance-step-container" data-testid="maintenance-step-container">
      {/* Step Header */}
      <div className="section-title" style={{ marginBottom: "16px" }}>
        <div>
          <h2 className="seller-step-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Wrench size={22} className="text-amber-400" />
            <span>{t("maintenance.title", "Mechanical Maintenance Cost")}</span>
          </h2>
          <p className="wizard-step-desc" style={{ marginTop: "4px", color: "var(--local-muted)", fontSize: "13px" }}>
            {t(
              "maintenance.step_desc",
              "Record vehicle refurbishment, parts replacement, servicing, and workshop expenses incurred before customer handover."
            )}
          </p>
        </div>
      </div>

      {/* Main Interactive Maintenance Section */}
      <MaintenanceSection
        deal={deal}
        updateSection={updateSection}
      />
    </div>
  );
};
