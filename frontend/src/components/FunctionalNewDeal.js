import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Briefcase,
  Check,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileCheck,
  Save,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { STEPS, getStepStatus } from "@/features/deals/dealModel";
import { useDealWizard } from "@/features/deals/useDealWizard";
import { VehicleStep } from "@/features/deals/VehicleStep";
import { PersonStep } from "@/features/deals/PersonStep";
import { MaintenanceStep } from "@/features/deals/MaintenanceStep";
import { AgentStep } from "@/features/deals/AgentStep";
import { PaymentStep } from "@/features/deals/PaymentStep";
import { ReviewStep } from "@/features/deals/DealSummary";
import { ConfirmDialog } from "@/features/deals/LocalUI";
import { useLanguage } from "@/features/i18n/LanguageContext";

const STEP_ICONS = [Bike, UserCheck, Wrench, Users, Briefcase, CreditCard, FileCheck];

const STEP_TRANSLATION_KEYS = [
  "step.vehicle",
  "step.seller",
  "step.maintenance",
  "step.buyer",
  "step.agent",
  "step.payments",
  "step.notes_save",
];

export default function FunctionalNewDeal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { dealId } = useParams();

  const stepQuery = searchParams.get("step") || (location.hash === "#agent" ? "agent" : "");
  let targetInitialStep = 0;
  if (stepQuery === "seller") targetInitialStep = 1;
  else if (stepQuery === "maintenance") targetInitialStep = 2;
  else if (stepQuery === "buyer") targetInitialStep = 3;
  else if (stepQuery === "agent") targetInitialStep = 4;
  else if (stepQuery === "payments") targetInitialStep = 5;
  else if (stepQuery && !isNaN(stepQuery)) targetInitialStep = parseInt(stepQuery, 10);

  const [discardTarget, setDiscardTarget] = useState("");
  const wizard = useDealWizard(
    dealId,
    (saved) => navigate(`/deals/${saved.id}`, { state: { saved: saved.bill_number } }),
    targetInitialStep
  );
  const {
    deal,
    step,
    go,
    save,
    errors,
    loading,
    loadError,
    busy,
    message,
    fillDemoText,
    dirty,
  } = wizard;
  const isReview = step === STEPS.length - 1;
  const back = () => (dirty ? setDiscardTarget("/deals") : navigate("/deals"));

  const completedCount = STEPS.filter((_, i) => getStepStatus(deal, i) === "complete").length;
  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || link.target === "_blank")
        return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault();
      event.stopPropagation();
      setDiscardTarget(`${url.pathname}${url.search}`);
    };
    document.addEventListener("click", guard, true);
    return () => document.removeEventListener("click", guard, true);
  }, [dirty]);

  return (
    <div className="local-page wizard-page luxury-wizard">
      <button className="back-link wizard-back" onClick={back} data-testid="new-deal-back">
        <ArrowLeft size={16} /> {t("nav.deals", "Deals")}
      </button>

      {/* Header bar with luxury chassis plate & actions */}
      <div className="page-header luxury-page-header">
        <div>
          <div className="eyebrow luxury-eyebrow">
            <span className="eyebrow-dot" />
            {t("deal.workspace", "DEAL WORKSPACE")}
          </div>
          <h1 data-testid="page-title" className="luxury-page-title">
            {dealId ? t("deal.edit_deal", "Edit Deal") : t("deal.new_deal", "New Deal")}
          </h1>
        </div>

        <div className="wizard-header-actions">
          <button
            type="button"
            className="button button-secondary luxury-autofill-btn"
            onClick={fillDemoText}
            disabled={busy || loading}
            data-testid="auto-fill-demo-text"
            title="Fills realistic showroom demo records across all wizard steps"
          >
            <Sparkles size={15} className="autofill-sparkle-icon" />
            <span>{t("wizard.fill_demo", "Auto-Fill Demo (No Photos)")}</span>
          </button>

          {/* Chassis-inspired Bill Number plate */}
          <div className="chassis-bill-badge" data-testid="wizard-bill-badge">
            <div className="chassis-bill-header">
              <span className="chassis-pulse-dot" />
              <span className="chassis-bill-sub">
                {t("deal.bill_number", "Bill Sequence")}
                {!dealId && ` · ${t("deal.preview", "Preview")}`}
              </span>
            </div>
            <strong data-testid="wizard-bill-number" className="chassis-bill-value">
              {loading ? "…" : deal.bill_number || "MM-26-XXXX"}
            </strong>
          </div>
        </div>
      </div>

      {loading ? (
        <p role="status" data-testid="wizard-loading" className="luxury-loading">
          {t("deal.opening", "Opening deal workspace…")}
        </p>
      ) : loadError ? (
        <div role="alert" className="workflow-message" data-testid="wizard-load-error">
          {loadError}
        </div>
      ) : (
        <>
          {/* Executive Stepper Navigation Track */}
          <div className="luxury-stepper-container">
            <div className="luxury-stepper-progress-bar">
              <div
                className="luxury-stepper-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <nav className="wizard-steps-v2 luxury-steps-v2" aria-label="Deal steps" data-testid="wizard-steps">
              {STEPS.map((name, i) => {
                const active = i === step;
                const status = getStepStatus(deal, i);
                const isComplete = status === "complete";
                const isPartial = status === "partial";
                const stepLabel = t(STEP_TRANSLATION_KEYS[i] || name, name);
                const StepIcon = STEP_ICONS[i] || Bike;

                return (
                  <button
                    type="button"
                    key={name}
                    className={`wsv2-item luxury-step-item ${active ? "wsv2-active" : ""} ${
                      isComplete && !active ? "wsv2-done" : ""
                    } ${isPartial && !active ? "wsv2-error" : ""}`}
                    onClick={() => go(i, false)}
                    disabled={busy}
                    aria-current={active ? "step" : undefined}
                    data-testid={`wizard-step-${i + 1}`}
                  >
                    <span className="wsv2-circle luxury-step-circle">
                      {isComplete && !active ? (
                        <Check size={16} strokeWidth={2.8} />
                      ) : isPartial && !active ? (
                        <AlertCircle size={16} strokeWidth={2.4} />
                      ) : (
                        <StepIcon size={16} strokeWidth={active ? 2.4 : 1.8} />
                      )}
                    </span>
                    <div className="luxury-step-text">
                      <span className="luxury-step-idx">0{i + 1}</span>
                      <span className="wsv2-label luxury-step-title">{stepLabel}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {message && (
            <div
              className="workflow-message wizard-message luxury-msg-box"
              role="alert"
              data-testid="wizard-message"
            >
              <AlertCircle size={18} className="text-amber-500" />
              <div>
                <strong>{message}</strong>
                {Object.keys(errors).length > 0 && (
                  <ul>
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} data-testid={`error-summary-${field.replaceAll(".", "-")}`}>
                        {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (isReview) save();
              else go(step + 1);
            }}
          >
            <fieldset disabled={busy} className="wizard-body luxury-wizard-body" key={step}>
              {step === 0 && <VehicleStep {...wizard} />}
              {step === 1 && <PersonStep group="seller" {...wizard} />}
              {step === 2 && <MaintenanceStep {...wizard} />}
              {step === 3 && <PersonStep group="buyer" {...wizard} />}
              {step === 4 && <AgentStep {...wizard} />}
              {step === 5 && <PaymentStep {...wizard} />}
              {isReview && <ReviewStep deal={deal} update={wizard.update} edit={go} />}
            </fieldset>

            {/* Glassmorphic Floating Action Dock */}
            <footer className="wizard-footer luxury-floating-dock">
              <button
                type="button"
                className="button button-secondary luxury-nav-btn prev-btn"
                onClick={() => (step ? go(step - 1) : back())}
                disabled={busy}
                data-testid="wizard-previous"
              >
                <ArrowLeft size={16} />
                <span>{step ? t("wizard.previous", "Previous") : t("wizard.cancel", "Cancel")}</span>
              </button>

              <div className="luxury-save-status">
                <span className={`status-dot ${dirty ? "dot-dirty" : "dot-saved"}`} />
                <span className="wizard-save-note" data-testid="wizard-save-note">
                  {dirty
                    ? t("wizard.unsaved_deal", "Unsaved changes in workspace")
                    : isReview
                    ? t("wizard.saved_browser_only", "Ready to finalize · Saved locally")
                    : "Step saved to local store"}
                </span>
              </div>

              <div className="wizard-footer-actions">
                {!isReview && (
                  <button
                    type="button"
                    className="button button-secondary wizard-save-btn luxury-save-btn"
                    onClick={save}
                    disabled={busy}
                    data-testid="wizard-save-deal"
                  >
                    <Save size={16} />
                    <span>{busy ? t("wizard.saving", "Saving…") : t("wizard.save_deal", "Save Deal")}</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="button button-primary luxury-continue-btn"
                  disabled={busy}
                  data-testid={isReview ? "save-deal-button" : "wizard-next"}
                >
                  {isReview ? (
                    <>
                      <Save size={16} />
                      <span>{busy ? t("wizard.saving", "Saving…") : t("wizard.save_deal", "Finalize & Save Deal")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("wizard.continue", "Continue")}</span>
                      <ArrowRight size={16} className="btn-arrow-icon" />
                    </>
                  )}
                </button>
              </div>
            </footer>
          </form>
        </>
      )}
      <ConfirmDialog
        open={!!discardTarget}
        onOpenChange={(open) => !open && setDiscardTarget("")}
        title={t("dialog.discard_title", "Discard unsaved changes?")}
        description={t(
          "dialog.discard_desc",
          "This deal has not been saved. Your changes and selected photos will be lost."
        )}
        onConfirm={() => navigate(discardTarget)}
        confirm={t("dialog.discard_confirm", "Discard changes")}
        cancelText={t("dialog.cancel", "Cancel")}
        testid="discard-deal"
      />
    </div>
  );
}