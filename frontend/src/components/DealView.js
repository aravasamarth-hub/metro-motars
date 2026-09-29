import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Pencil } from "lucide-react";
import { dealRepository } from "@/data/dealRepository";
import { DealSummary } from "@/features/deals/DealSummary";
import { StatusBadges } from "@/features/deals/LocalUI";
import { agentFields, dealerFields, paymentFields, personFields, vehicleGroups, witnessFields } from "@/features/deals/fieldConfig";
import { PhotoSlots } from "@/features/deals/PhotoSlots";
import { displayDate } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

const groupTitleMap = {
  "Vehicle details": "section.vehicle_details",
  "Ownership & condition": "section.ownership_condition",
  "Documents & validity": "section.documents_validity",
};

const ReadGroup = ({ title, fields, value, prefix }) => {
  const { t } = useLanguage();
  return (
    <section className="wizard-group">
      <div className="section-title"><h2>{title}</h2></div>
      <dl className="local-read-grid">
        {fields.map(f => {
          let fieldLabel = f.label;
          if (prefix === "agent" && t(`agent.${f.key}`)) {
            fieldLabel = t(`agent.${f.key}`, f.label);
          } else if (prefix && String(prefix).startsWith("witness") && f.key === "id_number") {
            fieldLabel = t("field.witness_id_details", f.label);
          } else {
            fieldLabel = t(`field.${f.key}`, f.label);
          }
          return (
            <div key={f.key}>
              <dt>{fieldLabel}</dt>
              <dd data-testid={`read-${prefix}-${f.key.replaceAll("_", "-")}`}>{value[f.key] || "—"}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
};

export default function DealView() {
  const { dealId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [deal, setDeal] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setDeal(null);
    setError("");
    dealRepository.get(dealId).then(value => {
      if (!active) return;
      if (!value) setError(t("dealview.not_saved", "This deal is not saved in this browser."));
      else setDeal(value);
    }).catch(e => active && setError(e.message));
    return () => { active = false; };
  }, [dealId, t]);

  return (
    <div className="local-page">
      <button className="back-link wizard-back" onClick={() => navigate("/deals")} data-testid="deal-view-back">
        <ArrowLeft size={16}/> {t("nav.deals", "Deals")}
      </button>
      <div className="page-header">
        <div>
          <div className="eyebrow">{t("dealview.record_eyebrow", "Deal record")}</div>
          <h1 data-testid="page-title">{deal?.bill_number || t("dealview.details_title", "Deal details")}</h1>
        </div>
        {deal && (
          <button className="button button-primary" onClick={() => navigate(`/new-deal/${deal.id}`)} data-testid="deal-view-edit">
            <Pencil size={16}/> {t("deal.edit_deal", "Edit Deal")}
          </button>
        )}
      </div>
      {error ? (
        <div className="workflow-message" role="alert" data-testid="deal-view-error">{error}</div>
      ) : !deal ? (
        <p role="status" data-testid="deal-view-loading">{t("dealview.loading", "Loading deal…")}</p>
      ) : (
        <>
          {state?.saved && (
            <div className="local-success" role="status" data-testid="deal-saved-message">
              <CheckCircle2 size={18}/>{state.saved} {t("dealview.saved_notice", "saved on this browser. No data was sent to a server.")}
            </div>
          )}
          <div className="local-record-meta">
            <StatusBadges deal={deal} prefix="detail"/>
            <span data-testid="deal-created-date">{t("dealview.created_on", "Created")} {displayDate(deal.created_at, language)}</span>
          </div>
          <DealSummary deal={deal}/>
          {vehicleGroups.map(group => (
            <ReadGroup
              key={group.title}
              title={t(groupTitleMap[group.title] || group.title, group.title)}
              fields={group.fields}
              value={deal.vehicle}
              prefix="vehicle"
            />
          ))}
          <PhotoSlots group="vehicle" photos={deal.photos} readOnly/>
          {["seller", "buyer"].map((group, i) => (
            <div key={group}>
              <ReadGroup
                title={group === "seller" ? t("step.seller", "Seller") : t("step.buyer", "Buyer")}
                fields={deal[group].is_dealer ? [...personFields, ...dealerFields] : personFields}
                value={deal[group]}
                prefix={group}
              />
              <PhotoSlots group={group} photos={deal.photos} readOnly/>
              <ReadGroup
                title={group === "seller" ? t("section.seller_witness", "Seller witness") : t("section.buyer_witness", "Buyer witness")}
                fields={witnessFields}
                value={deal.witnesses[i]}
                prefix={`witness-${i + 1}`}
              />
              <PhotoSlots group={`witness-${i + 1}`} photos={deal.photos} readOnly/>
            </div>
          ))}
          <ReadGroup title={t("step.payments", "Payments")} fields={paymentFields} value={deal.payments} prefix="payments"/>
          {deal.agent?.name && (
            <ReadGroup title={t("agent.details_title", "Agent details")} fields={agentFields} value={deal.agent} prefix="agent"/>
          )}
          <section className="wizard-group">
            <div className="section-title"><h2>{t("section.notes_remarks", "Notes & remarks")}</h2></div>
            <p className="local-notes" data-testid="deal-view-notes">{deal.notes || t("dealview.no_notes", "No notes recorded.")}</p>
          </section>
        </>
      )}
    </div>
  );
}