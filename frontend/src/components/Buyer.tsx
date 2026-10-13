import React, { useState } from "react";
import { FileDown, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FieldGrid } from "@/features/deals/DealField";
import { personFields } from "@/features/deals/fieldConfig";
import { PhotoSlots } from "@/features/deals/PhotoSlots";
import { PartyIdentityRow } from "@/features/deals/PartyIdentityRow";
import { WitnessSection } from "@/features/deals/PersonStep";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { money } from "@/features/deals/dealModel";
import BillModal from "@/components/BillModal";
import { useBuyerBill } from "@/hooks/useBuyerBill";

export interface BuyerProps {
  deal: any;
  updateSection: (section: string, key: string, value: any) => void;
  updateWitness: (index: number, key: string, value: any) => void;
  setPhoto: (key: string, value: any) => void;
  errors?: Record<string, string>;
  group?: string;
  [key: string]: any;
}

export function Buyer({
  deal,
  updateSection,
  updateWitness,
  setPhoto,
  errors = {},
  group = "buyer",
}: BuyerProps) {
  const { t } = useLanguage();
  const person = deal?.buyer || {};
  const payments = deal?.payments || {};
  const sellingPrice = payments.selling_price ?? "";
  const receivedFromBuyer = payments.received_from_buyer ?? "";

  const priceNum = Number(sellingPrice) || 0;
  const receivedNum = Number(receivedFromBuyer) || 0;
  const pendingNum = Math.max(0, priceNum - receivedNum);
  const hasAmounts =
    (sellingPrice !== "" && sellingPrice != null) ||
    (receivedFromBuyer !== "" && receivedFromBuyer != null);

  const { generateBill, generating, error: billError } = useBuyerBill();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const handleGenerateDirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSuccessMessage("");
    try {
      const fileName = await generateBill(deal);
      setSuccessMessage(`Buyer Bill generated: ${fileName}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to generate buyer bill:", err);
    }
  };

  return (
    <div className="person-step-container buyer-step-container" data-testid="buyer-step-container">
      {/* Step title */}
      <h2 className="seller-step-title">{t("step.buyer", "Buyer")}</h2>

      {/* Unified 3-Card Identity Row: Photo | Signature | Thumb Impression */}
      <PartyIdentityRow
        group="buyer"
        deal={deal}
        photos={deal?.photos || {}}
        onChange={setPhoto}
        readOnly={false}
        dealerToggle={
          <label className="dealer-toggle" htmlFor="buyer-dealer-photo">
            <span>{t("section.dealer", "Dealer")}</span>
            <Switch
              {...({
                id: "buyer-dealer-photo",
                checked: person?.is_dealer,
                onCheckedChange: (value: any) => updateSection("buyer", "is_dealer", value),
                "data-testid": "buyer-dealer-toggle-photo",
              } as any)}
            />
          </label>
        }
      />

      {/* Buyer details */}
      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.buyer_details", "Buyer details")}</h2>
          <span className="required-note">{t("section.required_fields", "* Required fields")}</span>
        </div>
        <FieldGrid
          fields={personFields}
          value={person}
          prefix="buyer"
          errors={errors}
          onChange={(key, value) => updateSection("buyer", key, value)}
        />
      </section>

      {/* Buyer Payment / Pricing section: Selling price, Amount received, Amount pending */}
      <section className="wizard-group" data-testid="buyer-payments-section">
        <div className="section-title">
          <h2>{t("section.buyer_payments", "Payment & pricing details")}</h2>
          {hasAmounts && (
            <span
              className={`status-pill ${
                receivedNum >= priceNum && priceNum > 0 ? "green" : receivedNum > 0 ? "gold" : "blue"
              }`}
              data-testid="buyer-payment-status-pill"
            >
              {receivedNum >= priceNum && priceNum > 0
                ? t("payment.paid_in_full", "Paid in Full")
                : receivedNum > 0
                ? `${t("payment.pending", "Pending")}: ${money(pendingNum)}`
                : t("payment.unpaid", "Unpaid")}
            </span>
          )}
        </div>
        <div className="form-grid wizard-fields">
          <label className="form-field wizard-field" htmlFor="buyer-payments-selling-price">
            <span>{t("field.selling_price", "Selling price (₹)")}</span>
            <input
              id="buyer-payments-selling-price"
              type="number"
              step="0.01"
              min="0"
              value={sellingPrice}
              onChange={(e: any) => updateSection("payments", "selling_price", e.target.value)}
              placeholder="e.g. 180000"
              data-testid="buyer-payments-selling-price-input"
              autoComplete="off"
            />
            {errors?.["payments.selling_price"] && (
              <small className="field-error" id="buyer-payments-selling-price-error">
                {errors["payments.selling_price"]}
              </small>
            )}
          </label>

          <label className="form-field wizard-field" htmlFor="buyer-payments-received-from-buyer">
            <span>{t("field.amount_received", "Amount received (₹)")}</span>
            <input
              id="buyer-payments-received-from-buyer"
              type="number"
              step="0.01"
              min="0"
              value={receivedFromBuyer}
              onChange={(e: any) => updateSection("payments", "received_from_buyer", e.target.value)}
              placeholder="e.g. 50000"
              data-testid="buyer-payments-received-from-buyer-input"
              autoComplete="off"
            />
            {errors?.["payments.received_from_buyer"] && (
              <small className="field-error" id="buyer-payments-received-from-buyer-error">
                {errors["payments.received_from_buyer"]}
              </small>
            )}
          </label>

          <label className="form-field wizard-field" htmlFor="buyer-payments-amount-pending">
            <span>{t("field.amount_pending", "Amount pending (₹)")}</span>
            <input
              id="buyer-payments-amount-pending"
              type="text"
              readOnly
              value={sellingPrice !== "" && sellingPrice != null ? money(pendingNum) : "—"}
              className="amount-pending-display"
              data-testid="buyer-payments-amount-pending-input"
              disabled
            />
          </label>
        </div>
      </section>

      {/* Witness section for Buyer */}
      <WitnessSection
        group="buyer"
        deal={deal}
        updateWitness={updateWitness}
        setPhoto={setPhoto}
        errors={errors}
      />

      {/* Documents & additional photos at bottom */}
      <PhotoSlots
        group="buyer"
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="docs"
      />

      {/* Metro Motors Legal Documents banner for Buyer Bill */}
      <div className="seller-action-strip buyer-action-strip" data-testid="buyer-action-strip">
        <div>
          <strong className="seller-action-strip-title">
            {t("legal.buyer_strip_title", "Metro Motors Legal Documents (Buyer Bill)")}
          </strong>
          <span className="seller-action-strip-sub">
            {t("legal.buyer_strip_sub", "Printable A4 Buyer Bill & Vehicle Sale Receipt for Purchasing Party")}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="agreement-toggle-btn"
            data-testid="preview-buyer-bill-button"
            title="Preview & Edit Buyer Bill"
          >
            <Printer size={15} />
            <span>{t("bills.preview_buyer_bill", "Preview & Edit Buyer Bill")}</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="agreement-toggle-btn"
            data-testid="generate-buyer-bill-button"
            title="Preview, Edit & Download Buyer Bill PDF"
          >
            <FileDown size={15} />
            <span>{t("legal.generate_buyer_bill_btn", "Generate Buyer Bill & Download")}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div role="status" className="workflow-message seller-msg seller-msg-ok" data-testid="buyer-bill-success">
          <CheckCircle2 size={16} /><span>{successMessage}</span>
        </div>
      )}

      {billError && (
        <div role="alert" className="workflow-message seller-msg seller-msg-err" data-testid="buyer-bill-error">
          <AlertCircle size={16} /><span>{billError}</span>
        </div>
      )}

      <BillModal
        deal={deal}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        initialDocument="buyer-bill"
      />
    </div>
  );
}

export default Buyer;
