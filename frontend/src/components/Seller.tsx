import React, { useState } from "react";
import { FileDown, Loader2, CheckCircle2, AlertCircle, Printer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FieldGrid } from "@/features/deals/DealField";
import { personFields } from "@/features/deals/fieldConfig";
import { PhotoSlots } from "@/features/deals/PhotoSlots";
import { WitnessSection } from "@/features/deals/PersonStep";
import { useSellerAgreement } from "@/hooks/useSellerAgreement";
import { useLanguage } from "@/features/i18n/LanguageContext";
import BillModal from "@/components/BillModal";

export interface SellerProps {
  deal: any;
  updateSection: (section: string, key: string, value: any) => void;
  updateWitness: (index: number, key: string, value: any) => void;
  setPhoto: (key: string, value: any) => void;
  errors?: Record<string, string>;
  group?: string;
  [key: string]: any;
}

export function Seller({
  deal,
  updateSection,
  updateWitness,
  setPhoto,
  errors = {},
  group = "seller",
}: SellerProps) {
  const { t } = useLanguage();
  const person = deal?.seller || {};
  const { generateAgreement, generating, error: agreementError } = useSellerAgreement();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const handleGenerateAgreement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSuccessMessage("");
    try {
      const fileName = await generateAgreement(deal);
      setSuccessMessage(`Agreement generated: ${fileName}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to generate seller agreement:", err);
    }
  };

  return (
    <div className="seller-step-container" data-testid="seller-step-container">

      {/* Step title */}
      <h2 className="seller-step-title">{t("step.seller", "Seller")}</h2>

      {/* Seller photo (avatar) on top */}
      <PhotoSlots
        group="seller"
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="portrait"
        dealerToggle={
          <label className="dealer-toggle" htmlFor="seller-dealer-photo">
            <span>{t("section.dealer", "Dealer")}</span>
            <Switch
              {...({
                id: "seller-dealer-photo",
                checked: person?.is_dealer,
                onCheckedChange: (value: any) => updateSection("seller", "is_dealer", value),
                "data-testid": "seller-dealer-toggle-photo",
              } as any)}
            />
          </label>
        }
      />

      {/* Seller details */}
      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.seller_details", "Seller details")}</h2>
          <span className="required-note">{t("section.required_fields", "* Required fields")}</span>
        </div>
        <FieldGrid
          fields={personFields}
          value={person}
          prefix="seller"
          errors={errors}
          onChange={(key, value) => updateSection("seller", key, value)}
        />
      </section>

      {/* Witness section */}
      <WitnessSection
        group="seller"
        deal={deal}
        updateWitness={updateWitness}
        setPhoto={setPhoto}
        errors={errors}
      />

      {/* Documents & additional photos at bottom */}
      <PhotoSlots
        group="seller"
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="docs"
      />

      {/* Metro Motors Legal Documents banner at bottom */}
      <div className="seller-action-strip">
        <div>
          <strong className="seller-action-strip-title">{t("legal.strip_title", "Metro Motors Legal Documents")}</strong>
          <span className="seller-action-strip-sub">
            {t("legal.strip_sub", "Printable A4 Delivery Note & Sale Agreement between Seller & Purchaser")}
          </span>
        </div>

        {/* Toggle-style action buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="agreement-toggle-btn"
            data-testid="preview-seller-agreement-button"
            title="Preview & Print Bill"
          >
            <Printer size={15} />
            <span>{t("bills.print", "Preview & Print Bill")}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateAgreement}
            disabled={generating}
            className="agreement-toggle-btn"
            data-testid="generate-seller-agreement-button"
            title="Download PDF Agreement"
          >
            {generating ? (
              <><Loader2 size={15} className="animate-spin" /><span>{t("legal.generating", "Generating…")}</span></>
            ) : (
              <><FileDown size={15} /><span>{t("legal.generate_btn", "Download PDF")}</span></>
            )}
          </button>
        </div>
      </div>

      {successMessage && (
        <div role="status" className="workflow-message seller-msg seller-msg-ok" data-testid="seller-agreement-success">
          <CheckCircle2 size={16} /><span>{successMessage}</span>
        </div>
      )}

      {agreementError && (
        <div role="alert" className="workflow-message seller-msg seller-msg-err" data-testid="seller-agreement-error">
          <AlertCircle size={16} /><span>{agreementError}</span>
        </div>
      )}

      <BillModal deal={deal} isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

export default Seller;
