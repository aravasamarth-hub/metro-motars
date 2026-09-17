import { useEffect, useRef, useState } from "react";
import { dealRepository } from "@/data/dealRepository";
import { emptyDeal, validateDeal, validateStep } from "./dealModel";
export const useDealWizard = (dealId, onSaved) => {
  const [deal, setDeal] = useState(emptyDeal);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState("");
  const saving = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(""); setDirty(false); setStep(0); setErrors({}); setMessage("");
    (async () => {
      try {
        const value = dealId ? await dealRepository.get(dealId) : { ...emptyDeal(), bill_number: await dealRepository.nextBillNumber() };
        if (!value) throw new Error("This deal is not saved in this browser.");
        if (active) setDeal(value);
      } catch (e) { if (active) setLoadError(e.message); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [dealId]);
  useEffect(() => { const warn = e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const change = fn => { setDeal(fn); setDirty(true); setErrors({}); setMessage(""); };
  const update = (key, value) => change(current => ({ ...current, [key]: value }));
  const updateSection = (section, key, value) => change(current => ({ ...current, [section]: { ...current[section], [key]: value } }));
  const updateWitness = (index, key, value) => change(current => ({ ...current, witnesses: current.witnesses.map((p, i) => i === index ? { ...p, [key]: value } : p) }));
  const setPhoto = (key, value) => change(current => { const photos = { ...current.photos }; if (value) photos[key] = value; else delete photos[key]; return { ...current, photos }; });
  const showErrors = (newErrors, targetStep) => { setErrors(newErrors); setMessage("Please check the highlighted fields."); setStep(targetStep); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const go = target => {
    if (target > step) {
      for (let i = 0; i < target; i++) { const invalid = validateStep(deal, i); if (Object.keys(invalid).length) { showErrors(invalid, i); return; } }
    }
    setStep(target); setErrors({}); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = async () => {
    if (saving.current) return;
    const invalid = validateDeal(deal);
    if (invalid.length) { showErrors(Object.fromEntries(invalid.map(e => [e.field, e.message])), invalid[0].step); return; }
    saving.current = true; setBusy(true); setMessage("");
    try { const saved = await dealRepository.save(deal); setDirty(false); onSaved(saved); }
    catch (e) { setMessage(e.message); } finally { saving.current = false; setBusy(false); }
  };
  return { deal, step, errors, message, loading, busy, dirty, loadError, update, updateSection, updateWitness, setPhoto, go, save };
};