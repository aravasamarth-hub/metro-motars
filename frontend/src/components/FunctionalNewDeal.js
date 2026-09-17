import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { STEPS } from "@/features/deals/dealModel";
import { useDealWizard } from "@/features/deals/useDealWizard";
import { VehicleStep } from "@/features/deals/VehicleStep";
import { PersonStep, WitnessStep } from "@/features/deals/PersonStep";
import { PaymentStep } from "@/features/deals/PaymentStep";
import { ReviewStep } from "@/features/deals/DealSummary";
import { ConfirmDialog } from "@/features/deals/LocalUI";

export default function FunctionalNewDeal() {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const [discardTarget, setDiscardTarget] = useState("");
  const wizard = useDealWizard(dealId, saved => navigate(`/deals/${saved.id}`, { state: { saved: saved.bill_number } }));
  const { deal, step, go, save, errors, loading, loadError, busy, message } = wizard;
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
    <button className="back-link wizard-back" onClick={back} data-testid="new-deal-back"><ArrowLeft size={16}/> Deals</button>
    <div className="page-header"><div><div className="eyebrow">Deal workspace</div><h1 data-testid="page-title">{dealId ? "Edit Deal" : "New Deal"}</h1></div><div className="wizard-bill"><span>Bill number{!dealId && " · Preview"}</span><strong data-testid="wizard-bill-number">{loading ? "…" : deal.bill_number}</strong></div></div>
    {loading ? <p role="status" data-testid="wizard-loading">Opening deal…</p> : loadError ? <div role="alert" className="workflow-message" data-testid="wizard-load-error">{loadError}</div> : <>
      <nav className="wizard-steps" aria-label="Deal steps" data-testid="wizard-steps">{STEPS.map((name, i) => <button type="button" className={`${step === i ? "active" : ""} ${i < step ? "visited" : ""}`} key={name} onClick={() => go(i)} disabled={busy} aria-current={step === i ? "step" : undefined} data-testid={`wizard-step-${i + 1}`}><span>{i < step ? <Check size={15}/> : i + 1}</span><b>{name}</b></button>)}</nav>
      <div className="wizard-step-heading"><h2 data-testid="wizard-step-title">{STEPS[step]}</h2><span data-testid="wizard-progress">Step {step + 1} of 6</span></div>
      {message && <div className="workflow-message wizard-message" role="alert" data-testid="wizard-message">{message}<ul>{Object.entries(errors).map(([field, error]) => <li key={field} data-testid={`error-summary-${field.replaceAll(".", "-")}`}>{error}</li>)}</ul></div>}
      <form noValidate onSubmit={e => { e.preventDefault(); if (step === 5) save(); else go(step + 1); }}>
        <fieldset disabled={busy} className="wizard-body" key={step}>
          {step === 0 && <VehicleStep {...wizard}/>}
          {step === 1 && <PersonStep group="seller" {...wizard}/>}
          {step === 2 && <PersonStep group="buyer" {...wizard}/>}
          {step === 3 && <WitnessStep {...wizard}/>}
          {step === 4 && <PaymentStep {...wizard}/>}
          {step === 5 && <ReviewStep deal={deal} update={wizard.update} edit={go}/>}
        </fieldset>
        <footer className="wizard-footer"><button type="button" className="button button-secondary" onClick={() => step ? go(step - 1) : back()} disabled={busy} data-testid="wizard-previous"><ArrowLeft size={16}/>{step ? "Previous" : "Cancel"}</button><span className="wizard-save-note" data-testid="wizard-save-note">{step === 5 ? "Saved on this browser only" : "Unsaved deal"}</span><button type="submit" className="button button-primary" disabled={busy} data-testid={step === 5 ? "save-deal-button" : "wizard-next"}>{step === 5 ? <><Save size={16}/>{busy ? "Saving…" : "Save Deal"}</> : <>Continue<ArrowRight size={16}/></>}</button></footer>
      </form>
    </>}
    <ConfirmDialog open={!!discardTarget} onOpenChange={open => !open && setDiscardTarget("")} title="Discard unsaved changes?" description="This deal has not been saved. Your changes and selected photos will be lost." onConfirm={() => navigate(discardTarget)} confirm="Discard changes" testid="discard-deal"/>
  </div>;
}