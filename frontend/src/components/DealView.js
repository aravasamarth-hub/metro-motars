import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Pencil } from "lucide-react";
import { dealRepository } from "@/data/dealRepository";
import { DealSummary } from "@/features/deals/DealSummary";
import { StatusBadges } from "@/features/deals/LocalUI";
import { agentFields, dealerFields, paymentFields, personFields, vehicleGroups, witnessFields } from "@/features/deals/fieldConfig";
import { PhotoSlots } from "@/features/deals/PhotoSlots";
import { displayDate } from "@/features/deals/dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";
import BillModal from "@/components/BillModal";
import { AgentWhatsAppModal } from "@/features/deals/AgentWhatsAppModal";

const groupTitleMap = {
  "Vehicle details": "section.vehicle_details",
  "Ownership & condition": "section.ownership_condition",
  "Documents & validity": "section.documents_validity",
};

const ReadGroup = ({ title, fields, value, prefix, action }) => {
  const { t } = useLanguage();
  return (
    <section className="wizard-group">
      <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{title}</h2>
        {action}
      </div>
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
          let displayVal = value[f.key];
          if (f.type === "month_year") {
            const parts = [value.mfg_month, value.year].filter(Boolean);
            displayVal = parts.length > 0 ? parts.join(" ") : "";
          }
          return (
            <div key={f.key}>
              <dt>{fieldLabel}</dt>
              <dd data-testid={`read-${prefix}-${f.key.replaceAll("_", "-")}`}>{displayVal || "—"}</dd>
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
  const [billOpen, setBillOpen] = useState(false);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setDeal(null);
    setError("");
    dealRepository.get(dealId).then(value => {
      if (!active) return;
      if (!value) setError(t("dealview.not_saved", "This deal is not saved in this browser."));
      else {
        setDeal(value);
        if (window.location.hash === "#agent" || window.location.search.includes("agent")) {
          setTimeout(() => {
            const el = document.getElementById("deal-agent-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.classList.add("agent-section-highlighted");
              setTimeout(() => el.classList.remove("agent-section-highlighted"), 2500);
            }
          }, 350);
        }
      }
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
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="button button-secondary" onClick={() => setBillOpen(true)} data-testid="deal-view-generate-bill">
              <FileText size={16}/> {t("bills.generate_bill", "Generate Bill")}
            </button>
            <button className="button button-primary" onClick={() => navigate(`/new-deal/${deal.id}`)} data-testid="deal-view-edit">
              <Pencil size={16}/> {t("deal.edit_deal", "Edit Deal")}
            </button>
          </div>
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
          {vehicleGroups.map(group => {
            const fields = group.title === "Ownership & condition"
              ? [
                  { key: "ownership", label: "Ownership" },
                  { key: "condition", label: "Condition" },
                  ...group.fields,
                ]
              : group.fields;
            return (
              <ReadGroup
                key={group.title}
                title={t(groupTitleMap[group.title] || group.title, group.title)}
                fields={fields}
                value={deal.vehicle}
                prefix="vehicle"
              />
            );
          })}
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
            <div id="deal-agent-section">
              <ReadGroup
                title={t("agent.details_title", "Agent details")}
                fields={agentFields}
                value={deal.agent}
                prefix="agent"
                action={
                  <button
                    type="button"
                    className="agent-whatsapp-btn"
                    onClick={() => setAgentModalOpen(true)}
                    title="Notify Agent on WhatsApp"
                  >
                    <svg className="agent-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.79 2.39a8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
                    </svg>
                    <span>{t("agent.notify_whatsapp", "Notify Agent on WhatsApp")}</span>
                  </button>
                }
              />
            </div>
          )}
          <section className="wizard-group">
            <div className="section-title"><h2>{t("section.notes_remarks", "Notes & remarks")}</h2></div>
            <p className="local-notes" data-testid="deal-view-notes">{deal.notes || t("dealview.no_notes", "No notes recorded.")}</p>
          </section>
        </>
      )}
      <BillModal deal={deal} isOpen={billOpen} onClose={() => setBillOpen(false)} />
      <AgentWhatsAppModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        deal={deal}
        agent={deal?.agent}
      />
    </div>
  );
}