import React, { useState } from "react";
import { FileDown, Loader2, CheckCircle2, AlertCircle, Printer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FieldGrid } from "@/features/deals/DealField";
import { personFields } from "@/features/deals/fieldConfig";
import { PhotoSlots } from "@/features/deals/PhotoSlots";
import { PartyIdentityRow } from "@/features/deals/PartyIdentityRow";
import { WitnessSection } from "@/features/deals/PersonStep";
import { useSellerAgreement } from "@/hooks/useSellerAgreement";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { money } from "@/features/deals/dealModel";
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
  const payments = deal?.payments || {};
  const purchasePrice = payments.purchase_price ?? "";
  const paidToSeller = payments.paid_to_seller ?? "";

  const priceNum = Number(purchasePrice) || 0;
  const paidNum = Number(paidToSeller) || 0;
  const pendingNum = Math.max(0, priceNum - paidNum);
  const hasAmounts = (purchasePrice !== "" && purchasePrice != null) || (paidToSeller !== "" && paidToSeller != null);

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

      {/* Unified 3-Card Identity Row: Photo | Signature | Thumb Impression */}
      <PartyIdentityRow
        group="seller"
        deal={deal}
        photos={deal?.photos || {}}
        onChange={setPhoto}
        readOnly={false}
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

      {/* Seller Payment / Pricing section: Price amount, Amount paid, Amount pending */}
      <section className="wizard-group" data-testid="seller-payments-section">
        <div className="section-title">
          <h2>{t("section.seller_payments", "Payment & pricing details")}</h2>
          {hasAmounts && (
            <span
              className={`status-pill ${paidNum >= priceNum && priceNum > 0 ? "green" : paidNum > 0 ? "gold" : "blue"}`}
              data-testid="seller-payment-status-pill"
            >
              {paidNum >= priceNum && priceNum > 0
                ? t("payment.paid_in_full", "Paid in Full")
                : paidNum > 0
                ? `${t("payment.pending", "Pending")}: ${money(pendingNum)}`
                : t("payment.unpaid", "Unpaid")}
            </span>
          )}
        </div>
        <div className="form-grid wizard-fields">
          <label className="form-field wizard-field" htmlFor="seller-payments-purchase-price">
            <span>{t("field.price_amount", "Price amount (₹)")}</span>
            <input
              id="seller-payments-purchase-price"
              type="number"
              step="0.01"
              min="0"
              value={purchasePrice}
              onChange={(e: any) => updateSection("payments", "purchase_price", e.target.value)}
              placeholder="e.g. 150000"
              data-testid="seller-payments-purchase-price-input"
              autoComplete="off"
            />
            {errors?.["payments.purchase_price"] && (
              <small className="field-error" id="seller-payments-purchase-price-error">
                {errors["payments.purchase_price"]}
              </small>
            )}
          </label>

          <label className="form-field wizard-field" htmlFor="seller-payments-paid-to-seller">
            <span>{t("field.amount_paid", "Amount paid (₹)")}</span>
            <input
              id="seller-payments-paid-to-seller"
              type="number"
              step="0.01"
              min="0"
              value={paidToSeller}
              onChange={(e: any) => updateSection("payments", "paid_to_seller", e.target.value)}
              placeholder="e.g. 50000"
              data-testid="seller-payments-paid-to-seller-input"
              autoComplete="off"
            />
            {errors?.["payments.paid_to_seller"] && (
              <small className="field-error" id="seller-payments-paid-to-seller-error">
                {errors["payments.paid_to_seller"]}
              </small>
            )}
          </label>

          <label className="form-field wizard-field" htmlFor="seller-payments-amount-pending">
            <span>{t("field.amount_pending", "Amount pending (₹)")}</span>
            <input
              id="seller-payments-amount-pending"
              type="text"
              readOnly
              value={purchasePrice !== "" && purchasePrice != null ? money(pendingNum) : "—"}
              className="amount-pending-display"
              data-testid="seller-payments-amount-pending-input"
              disabled
            />
          </label>
        </div>
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
            title="Preview & Edit Bill"
          >
            <Printer size={15} />
            <span>{t("bills.preview_bill", "Preview & Edit Bill")}</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="agreement-toggle-btn"
            data-testid="generate-seller-agreement-button"
            title="Preview, Edit & Download PDF Agreement"
          >
            <FileDown size={15} />
            <span>{t("legal.generate_btn", "Generate Bill & Download")}</span>
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
