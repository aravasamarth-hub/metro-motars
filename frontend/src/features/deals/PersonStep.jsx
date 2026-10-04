import { Switch } from "@/components/ui/switch";
import { FieldGrid } from "./DealField";
import { personFields, witnessFields } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
import { PartyIdentityRow } from "./PartyIdentityRow";
import { Seller } from "@/components/Seller";
import { useLanguage } from "@/features/i18n/LanguageContext";

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