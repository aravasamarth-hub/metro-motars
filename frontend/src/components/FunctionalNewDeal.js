import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Save, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { STEPS, getStepStatus } from "@/features/deals/dealModel";
import { useDealWizard } from "@/features/deals/useDealWizard";
import { VehicleStep } from "@/features/deals/VehicleStep";
import { PersonStep } from "@/features/deals/PersonStep";
import { AgentStep } from "@/features/deals/AgentStep";
import { PaymentStep } from "@/features/deals/PaymentStep";
import { ReviewStep } from "@/features/deals/DealSummary";
import { ConfirmDialog } from "@/features/deals/LocalUI";
import { useLanguage } from "@/features/i18n/LanguageContext";

const STEP_TRANSLATION_KEYS = [
  "step.vehicle",
  "step.seller",
  "step.buyer",
  "step.agent",
  "step.payments",
  "step.notes_save",
];

export default function FunctionalNewDeal() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { dealId } = useParams();
  const [discardTarget, setDiscardTarget] = useState("");
  const wizard = useDealWizard(dealId, saved => navigate(`/deals/${saved.id}`, { state: { saved: saved.bill_number } }));
  const { deal, step, go, save, errors, loading, loadError, busy, message, fillDemoText } = wizard;
  const isReview = step === STEPS.length - 1;
  const back = () => wizard.dirty ? setDiscardTarget("/deals") : navigate("/deals");

  useEffect(() => {
    if (!wizard.dirty) return;
    const guard = event => {
      const link = event.target.closest("a[href]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || link.target === "_blank") return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault(); event.stopPropagation(); setDiscardTarget(`${url.pathname}${url.search}`);
    };
    document.addEventListener("click", guard, true);
    return () => document.removeEventListener("click", guard, true);
  }, [wizard.dirty]);
  return <div className="local-page wizard-page">
    <button className="back-link wizard-back" onClick={back} data-testid="new-deal-back"><ArrowLeft size={16}/> {t("nav.deals", "Deals")}</button>
    <div className="page-header">
      <div>
        <div className="eyebrow">{t("deal.workspace", "Deal workspace")}</div>
        <h1 data-testid="page-title">{dealId ? t("deal.edit_deal", "Edit Deal") : t("deal.new_deal", "New Deal")}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="button button-secondary"
          onClick={fillDemoText}
          disabled={busy || loading}
          data-testid="auto-fill-demo-text"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderColor: "rgba(245, 158, 11, 0.5)", color: "#f59e0b", background: "rgba(245, 158, 11, 0.08)" }}
          title="Fills all text fields across all steps without adding any photos"
        >
          <Sparkles size={16} /> {t("wizard.fill_demo", "Auto-Fill Demo (No Photos)")}
        </button>
        <div className="wizard-bill">
          <span>{t("deal.bill_number", "Bill number")}{!dealId && ` · ${t("deal.preview", "Preview")}`}</span>
          <strong data-testid="wizard-bill-number">{loading ? "…" : deal.bill_number}</strong>
        </div>
      </div>
    </div>
    {loading ? <p role="status" data-testid="wizard-loading">{t("deal.opening", "Opening deal…")}</p> : loadError ? <div role="alert" className="workflow-message" data-testid="wizard-load-error">{loadError}</div> : <>
      <nav className="wizard-steps-v2" aria-label="Deal steps" data-testid="wizard-steps">
        {STEPS.map((name, i) => {
          const active = i === step;
          const status = getStepStatus(deal, i); // "complete" | "partial" | "empty"
          const isComplete = status === "complete";
          const isPartial = status === "partial";
          const stepLabel = t(STEP_TRANSLATION_KEYS[i] || name, name);
          return (
            <button
              type="button"
              key={name}
              className={`wsv2-item ${active ? "wsv2-active" : ""} ${isComplete && !active ? "wsv2-done" : ""} ${isPartial && !active ? "wsv2-error" : ""}`}
              onClick={() => go(i, false)}
              disabled={busy}
              aria-current={active ? "step" : undefined}
              data-testid={`wizard-step-${i + 1}`}
              title={
                isComplete
                  ? `${stepLabel}: Completed`
                  : isPartial
                  ? `${stepLabel}: Partially filled`
                  : `${stepLabel}: Not filled`
              }
            >
              <span className="wsv2-circle">
                {active ? (
                  <span className="wsv2-num">{i + 1}</span>
                ) : isComplete ? (
                  <CheckCircle2 size={18} strokeWidth={2.5}/>
                ) : isPartial ? (
                  <AlertCircle size={18} strokeWidth={2.5}/>
                ) : (
                  <span className="wsv2-num">{i + 1}</span>
                )}
              </span>
              <span className="wsv2-label">{stepLabel}</span>
            </button>
          );
        })}
      </nav>
      {message && <div className="workflow-message wizard-message" role="alert" data-testid="wizard-message">{message}<ul>{Object.entries(errors).map(([field, error]) => <li key={field} data-testid={`error-summary-${field.replaceAll(".", "-")}`}>{error}</li>)}</ul></div>}
      <form noValidate onSubmit={e => { e.preventDefault(); if (isReview) save(); else go(step + 1); }}>
        <fieldset disabled={busy} className="wizard-body" key={step}>
          {step === 0 && <VehicleStep {...wizard}/>}
          {step === 1 && <PersonStep group="seller" {...wizard}/>}
          {step === 2 && <PersonStep group="buyer" {...wizard}/>}
          {step === 3 && <AgentStep {...wizard}/>}
          {step === 4 && <PaymentStep {...wizard}/>}
          {isReview && <ReviewStep deal={deal} update={wizard.update} edit={go}/>}
        </fieldset>
        <footer className="wizard-footer">
          <button type="button" className="button button-secondary" onClick={() => step ? go(step - 1) : back()} disabled={busy} data-testid="wizard-previous">
            <ArrowLeft size={16}/>{step ? t("wizard.previous", "Previous") : t("wizard.cancel", "Cancel")}
          </button>
          <span className="wizard-save-note" data-testid="wizard-save-note">{isReview ? t("wizard.saved_browser_only", "Saved on this browser only") : t("wizard.unsaved_deal", "Unsaved deal")}</span>
          <div className="wizard-footer-actions">
            {!isReview && (
              <button
                type="button"
                className="button button-secondary wizard-save-btn"
                onClick={save}
                disabled={busy}
                data-testid="wizard-save-deal"
              >
                <Save size={16}/>{busy ? t("wizard.saving", "Saving…") : t("wizard.save_deal", "Save Deal")}
              </button>
            )}
            <button
              type="submit"
              className="button button-primary"
              disabled={busy}
              data-testid={isReview ? "save-deal-button" : "wizard-next"}
            >
              {isReview ? <><Save size={16}/>{busy ? t("wizard.saving", "Saving…") : t("wizard.save_deal", "Save Deal")}</> : <>{t("wizard.continue", "Continue")}<ArrowRight size={16}/></>}
            </button>
          </div>
        </footer>
      </form>
    </>}
    <ConfirmDialog open={!!discardTarget} onOpenChange={open => !open && setDiscardTarget("")} title={t("dialog.discard_title", "Discard unsaved changes?")} description={t("dialog.discard_desc", "This deal has not been saved. Your changes and selected photos will be lost.")} onConfirm={() => navigate(discardTarget)} confirm={t("dialog.discard_confirm", "Discard changes")} cancelText={t("dialog.cancel", "Cancel")} testid="discard-deal"/>
  </div>;
}