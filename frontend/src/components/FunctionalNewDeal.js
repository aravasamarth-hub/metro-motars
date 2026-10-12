import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
  ShieldCheck,
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

// 1. shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 2. KokonutUI
import FloatingPaths from "@/components/kokonut/BackgroundPaths";
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev)
import { MotionCounter } from "@/components/motion/MotionCounter";

// 4. Anime.js v4
import AnimePulseBeacon from "@/components/anime/AnimePulseBeacon";
import AnimeDealJourney from "@/components/anime/AnimeDealJourney";

// 5. Bklit
import { InspectionRadialGauge } from "@/components/bklit/InspectionRadialGauge";

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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="local-page wizard-page luxury-wizard"
    >
      <button className="back-link wizard-back mb-3" onClick={back} data-testid="new-deal-back">
        <ArrowLeft size={16} /> {t("nav.deals", "Back to Deals")}
      </button>

      {/* ── Luxury Workspace Hero (With KokonutUI FloatingPaths) ── */}
      <div className="luxury-hero-container relative mb-6">
        <FloatingPaths position={-1} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <AnimePulseBeacon color="gold" size="sm" label="DEAL WORKSPACE CADENCE" />
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                Step 0{step + 1} of 0{STEPS.length}
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                {completedCount} Sections Verified
              </Badge>
            </div>

            <h1 data-testid="page-title" className="text-2xl sm:text-3xl font-extrabold text-white font-manrope">
              {dealId ? t("deal.edit_deal", "Edit Deal") : t("deal.new_deal", "New Deal Workflow")}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Precision vehicle specification, legal transfer party records &amp; finance registry
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              className="border-neutral-700 hover:border-amber-500/40 text-xs font-semibold gap-1.5"
              onClick={fillDemoText}
              disabled={busy || loading}
              data-testid="auto-fill-demo-text"
              title="Fills realistic showroom demo records across all wizard steps"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>{t("wizard.fill_demo", "Auto-Fill Demo")}</span>
            </Button>

            {/* Bill Number Plate Badge */}
            <div className="p-2.5 px-4 rounded-xl border border-amber-500/30 bg-neutral-900/90 text-right shadow-lg">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                {t("deal.bill_number", "Bill Sequence")}
              </div>
              <div data-testid="wizard-bill-number" className="text-sm font-extrabold text-amber-400 font-mono">
                {loading ? "…" : deal.bill_number || "Bill-XXX"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p role="status" data-testid="wizard-loading" className="luxury-loading text-neutral-400 p-8 text-center">
          {t("deal.opening", "Opening deal workspace…")}
        </p>
      ) : loadError ? (
        <div role="alert" className="workflow-message" data-testid="wizard-load-error">
          {loadError}
        </div>
      ) : (
        <>
          {/* ── Stepper Navigation Track ── */}
          <div className="luxury-stepper-container mb-6 bg-neutral-900/60 p-2 rounded-2xl border border-neutral-800 backdrop-blur-xl">
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mb-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5" aria-label="Deal steps" data-testid="wizard-steps">
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
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all border ${
                      active
                        ? "bg-amber-500/15 border-amber-500/60 text-amber-400 shadow-md shadow-amber-500/10 font-bold"
                        : isComplete
                        ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50"
                        : "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-800/50"
                    }`}
                    onClick={() => go(i, false)}
                    disabled={busy}
                    aria-current={active ? "step" : undefined}
                    data-testid={`wizard-step-${i + 1}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        active
                          ? "bg-amber-500 text-neutral-950 font-bold shadow-sm"
                          : isComplete
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {isComplete && !active ? (
                        <Check size={14} strokeWidth={2.8} />
                      ) : isPartial && !active ? (
                        <AlertCircle size={14} strokeWidth={2.4} />
                      ) : (
                        <StepIcon size={14} strokeWidth={active ? 2.4 : 1.8} />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-[9px] font-mono opacity-60">0{i + 1}</div>
                      <div className="text-xs font-semibold truncate">{stepLabel}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {message && (
            <div
              className="workflow-message wizard-message luxury-msg-box mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs"
              role="alert"
              data-testid="wizard-message"
            >
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>{message}</strong>
                {Object.keys(errors).length > 0 && (
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
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
            {/* KokonutUI SpotlightCard container wrapping step form */}
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.12)"
              className="p-6 md:p-8 rounded-2xl border-neutral-800 bg-neutral-900/70 backdrop-blur-xl shadow-2xl mb-6"
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
            </SpotlightCard>

            {/* Glassmorphic Floating Action Dock with KokonutUI ParticleButton */}
            <footer className="wizard-footer luxury-floating-dock flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-2xl sticky bottom-4 z-20">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
                onClick={() => (step ? go(step - 1) : back())}
                disabled={busy}
                data-testid="wizard-previous"
              >
                <ArrowLeft size={15} />
                <span>{step ? t("wizard.previous", "Previous") : t("wizard.cancel", "Cancel")}</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${dirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                <span className="text-neutral-400 text-[11px]" data-testid="wizard-save-note">
                  {dirty
                    ? t("wizard.unsaved_deal", "Unsaved changes in workspace")
                    : isReview
                    ? t("wizard.saved_browser_only", "Ready to finalize · Saved locally")
                    : "Step saved to local store"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {!isReview && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-neutral-700 text-xs font-semibold"
                    onClick={save}
                    disabled={busy}
                    data-testid="wizard-save-deal"
                  >
                    <Save size={15} className="mr-1.5" />
                    <span>{busy ? t("wizard.saving", "Saving…") : t("wizard.save_deal", "Save Draft")}</span>
                  </Button>
                )}

                {/* ParticleButton for Continue / Finalize */}
                <ParticleButton
                  type="submit"
                  disabled={busy}
                  data-testid={isReview ? "save-deal-button" : "wizard-next"}
                  className="luxury-particle-cta px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
                >
                  {isReview ? (
                    <>
                      <Save size={15} />
                      <span>{busy ? t("wizard.saving", "Saving…") : t("wizard.save_deal", "Finalize & Save Deal")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("wizard.continue", "Continue")}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </ParticleButton>
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
    </motion.div>
  );
}