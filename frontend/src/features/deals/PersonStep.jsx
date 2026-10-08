import { Switch } from "@/components/ui/switch";
import { FieldGrid } from "./DealField";
import { personFields, witnessFields } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
import { PartyIdentityRow } from "./PartyIdentityRow";
import { Seller } from "@/components/Seller";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { money } from "./dealModel";

export const PersonStep = ({ group, deal, updateSection, updateWitness, setPhoto, errors }) => {
  const { t } = useLanguage();

  if (group === "seller") {
    return (
      <Seller
        group={group}
        deal={deal}
        updateSection={updateSection}
        updateWitness={updateWitness}
        setPhoto={setPhoto}
        errors={errors}
      />
    );
  }
  const person = deal[group] || {};
  const title = group === "buyer" ? t("step.buyer", "Buyer") : group;
  const detailsTitle = group === "buyer" ? t("section.buyer_details", "Buyer details") : `${title} details`;

  const payments = deal?.payments || {};
  const isBuyer = group === "buyer";
  const sellingPrice = payments.selling_price ?? "";
  const receivedFromBuyer = payments.received_from_buyer ?? "";

  const priceNum = Number(sellingPrice) || 0;
  const receivedNum = Number(receivedFromBuyer) || 0;
  const pendingNum = Math.max(0, priceNum - receivedNum);
  const hasAmounts =
    (sellingPrice !== "" && sellingPrice != null) ||
    (receivedFromBuyer !== "" && receivedFromBuyer != null);

  return (
    <div className="person-step-container" data-testid={`${group}-step-container`}>
      {/* Step title */}
      <h2 className="seller-step-title">{title}</h2>

      {/* Unified 3-Card Identity Row: Photo | Signature | Thumb Impression */}
      <PartyIdentityRow
        group={group}
        deal={deal}
        photos={deal?.photos || {}}
        onChange={setPhoto}
        readOnly={false}
        dealerToggle={
          <label className="dealer-toggle" htmlFor={`${group}-dealer-photo`}>
            <span>{t("section.dealer", "Dealer")}</span>
            <Switch
              id={`${group}-dealer-photo`}
              checked={person?.is_dealer}
              onCheckedChange={value => updateSection(group, "is_dealer", value)}
              data-testid={`${group}-dealer-toggle-photo`}
            />
          </label>
        }
      />

      {/* Details section */}
      <section className="wizard-group">
        <div className="section-title">
          <h2>{detailsTitle}</h2>
          <span className="required-note">{t("section.required_fields", "* Required fields")}</span>
        </div>
        <FieldGrid
          fields={personFields}
          value={person}
          prefix={group}
          errors={errors}
          onChange={(key, value) => updateSection(group, key, value)}
        />
      </section>

      {/* Buyer Payment / Pricing section: Price amount, Amount paid, Amount pending */}
      {isBuyer && (
        <section className="wizard-group" data-testid="buyer-payments-section">
          <div className="section-title">
            <h2>{t("section.buyer_payments", "Payment & pricing details")}</h2>
            {hasAmounts && (
              <span
                className={`status-pill ${receivedNum >= priceNum && priceNum > 0 ? "green" : receivedNum > 0 ? "gold" : "blue"}`}
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
              <span>{t("field.price_amount", "Price amount (₹)")}</span>
              <input
                id="buyer-payments-selling-price"
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => updateSection("payments", "selling_price", e.target.value)}
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
              <span>{t("field.amount_paid", "Amount paid (₹)")}</span>
              <input
                id="buyer-payments-received-from-buyer"
                type="number"
                step="0.01"
                min="0"
                value={receivedFromBuyer}
                onChange={(e) => updateSection("payments", "received_from_buyer", e.target.value)}
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
      )}

      {/* Witness section */}
      <WitnessSection
        group={group}
        deal={deal}
        updateWitness={updateWitness}
        setPhoto={setPhoto}
        errors={errors}
      />

      {/* Documents & additional photos at bottom */}
      <PhotoSlots
        group={group}
        photos={deal?.photos || {}}
        onChange={setPhoto}
        variant="docs"
      />
    </div>
  );
};

export const WitnessSection = ({ group, deal, updateWitness, setPhoto, errors }) => {
  const { t } = useLanguage();
  const index = group === "seller" ? 0 : 1;
  const witnessTitle = group === "seller" ? t("section.seller_witness", "Seller witness") : t("section.buyer_witness", "Buyer witness");

  return (
    <section className="wizard-group" data-testid={`${group}-witness-section`}>
      <div className="section-title">
        <h2 data-testid={`${group}-witness-title`}>{witnessTitle}</h2>
        <span className="slot-count">{t("photo.optional", "Optional")}</span>
      </div>
      <FieldGrid
        fields={witnessFields}
        value={deal.witnesses[index]}
        prefix={`witnesses.${index}`}
        errors={errors}
        onChange={(key, value) => updateWitness(index, key, value)}
      />
      <PhotoSlots group={`witness-${index + 1}`} photos={deal.photos} onChange={setPhoto} />
    </section>
  );
};