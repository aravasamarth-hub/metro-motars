import React, { useState, useEffect } from "react";
import { X, Phone, MessageSquare, Send, CheckCircle2, ShieldCheck, Loader2, Info } from "lucide-react";
import { SHOWROOM_CONTACT, getWhatsAppEnquiryUrl, submitPurchaseEnquiry, validateEnquiryForm } from "@/data/customerEnquiry";
import { MOTORCYCLE_PLACEHOLDER_SVG } from "@/data/publicInventory";
import { formatPrice, formatKm, useOverlay } from "./marketplaceUtils";

export default function EnquiryModal({ vehicle, isOpen, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredMethod, setPreferredMethod] = useState("WhatsApp");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const open = Boolean(isOpen && vehicle);
  useOverlay(open, onClose);

  // Reset the form whenever a different vehicle is opened.
  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    setSubmissionResult(null);
    setError("");
    setFieldErrors({});
  }, [open, vehicle?.id]);

  if (!open) return null;

  const whatsappUrl = getWhatsAppEnquiryUrl(vehicle);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return; // Prevent double submit
    setError("");
    const errs = validateEnquiryForm({ name, phone });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);

    try {
      const res = await submitPurchaseEnquiry({
        name,
        phone,
        preferredMethod,
        message,
        vehicleId: vehicle.id,
        vehicleTitle: vehicle.title,
        vehiclePrice: vehicle.sellingPrice,
      });
      setSubmissionResult(res);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Could not submit enquiry. Please call our showroom directly.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="enquiry-title" data-testid="enquiry-modal">
      <button type="button" className="mm-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close enquiry" tabIndex={-1} />
      <div className="mm-sheet relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-[color:var(--mm-paper)] text-neutral-900 shadow-2xl dark:bg-[color:var(--mm-ink-900)] dark:text-neutral-100 sm:rounded-[24px]">
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div>
            <p className="mm-eyebrow">Contact Showroom</p>
            <h3 id="enquiry-title" className="mm-display mt-2 text-2xl text-neutral-950 dark:text-white">Purchase Enquiry</h3>
          </div>
          <button type="button" onClick={onClose} className="mm-icon-btn -mr-2 -mt-1" aria-label="Close modal" data-testid="enquiry-close">
            <X size={20} />
          </button>
        </div>

        <div className="mx-6 flex items-center gap-3 rounded-[14px] border border-black/[0.06] bg-white p-3 dark:border-white/[0.07] dark:bg-[color:var(--mm-ink-850)]">
          <img
            src={vehicle.primaryPhoto || MOTORCYCLE_PLACEHOLDER_SVG}
            alt=""
            className="h-12 w-16 shrink-0 rounded-[8px] object-cover"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = MOTORCYCLE_PLACEHOLDER_SVG; }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{vehicle.year ? `${vehicle.year} ` : ""}{vehicle.title}</p>
            <p className="truncate text-[12px] text-neutral-500">{formatKm(vehicle.odometerKm)} · {vehicle.registrationLocation}</p>
          </div>
          <span className="mm-display shrink-0 text-[15px]">{formatPrice(vehicle.sellingPrice)}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          {success ? (
            <div className="py-6 text-center" data-testid="enquiry-success">
              <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${submissionResult?.isServerDelivered ? "bg-emerald-500/10 text-emerald-500" : "bg-[rgba(217,164,65,0.15)] text-[color:var(--mm-gold-lo)]"}`}>
                <CheckCircle2 size={32} />
              </div>
              <h4 className="mm-display mt-5 text-xl text-neutral-950 dark:text-white">
                {submissionResult?.isServerDelivered ? "Enquiry Registered with Showroom!" : "Enquiry Logged in Local Preview"}
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {submissionResult?.isServerDelivered ? (
                  <>
                    Thank you! Your enquiry has been received (Ref:{" "}
                    <span className="font-mono font-semibold text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">{submissionResult?.enquiryId}</span>
                    ). A specialist will contact you via {preferredMethod}.
                  </>
                ) : (
                  <>
                    Your enquiry has been saved to this browser&apos;s local storage.
                    <span className="mt-1 block font-semibold text-[color:var(--mm-gold-lo)] dark:text-[color:var(--mm-gold)]">Note: Live server delivery is offline.</span>
                    Please connect with our showroom team on WhatsApp or by phone to confirm your inspection.
                  </>
                )}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mm-btn mm-btn-whatsapp">
                  <MessageSquare size={16} /> Message on WhatsApp Now
                </a>
                <button type="button" onClick={onClose} className="mm-btn mm-btn-outline" data-testid="enquiry-success-close">Close</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <a href={`tel:${SHOWROOM_CONTACT.rawPhone}`} className="mm-btn mm-btn-outline !text-[13px]" data-testid="enquiry-call-link">
                  <Phone size={15} /> <span className="truncate">Call {SHOWROOM_CONTACT.phone}</span>
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mm-btn mm-btn-whatsapp !text-[13px]" data-testid="enquiry-whatsapp-link">
                  <MessageSquare size={15} /> WhatsApp Showroom
                </a>
              </div>

              <div className="mt-4 flex gap-2 rounded-[12px] bg-[rgba(217,164,65,0.10)] p-3 text-[12px] leading-snug text-[#7a5a17] dark:text-[color:var(--mm-gold-hi)]">
                <Info size={15} className="mt-px shrink-0" />
                <span><b>Preview notice:</b> web enquiries are stored in this browser only. For a confirmed booking, contact us on WhatsApp or phone.</span>
              </div>

              <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" /> or request a callback <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
              </div>

              {error && (
                <div className="mb-4 rounded-[12px] border border-red-500/30 bg-red-500/10 p-3 text-[13px] font-medium text-red-600 dark:text-red-400" role="alert" data-testid="enquiry-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="enq-name" className="mm-field-label">Your Full Name *</label>
                  <input
                    id="enq-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    aria-invalid={Boolean(fieldErrors.name)}
                    className="mm-input"
                    data-testid="enquiry-name-input"
                  />
                  {fieldErrors.name && <p className="mm-field-error" data-testid="enquiry-name-error">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="enq-phone" className="mm-field-label">Mobile Number (WhatsApp) *</label>
                  <input
                    id="enq-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+-]/g, ""))}
                    placeholder="e.g. 9880012345"
                    maxLength={14}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className="mm-input"
                    data-testid="enquiry-phone-input"
                  />
                  {fieldErrors.phone && <p className="mm-field-error" data-testid="enquiry-phone-error">{fieldErrors.phone}</p>}
                </div>

                <fieldset>
                  <legend className="mm-field-label">Preferred Contact Method</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {["WhatsApp", "Phone Call"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPreferredMethod(method)}
                        aria-pressed={preferredMethod === method}
                        className={`mm-btn mm-btn-sm !min-h-[42px] border ${preferredMethod === method ? "border-[color:var(--mm-gold)] bg-[rgba(217,164,65,0.10)] text-neutral-900 dark:text-white" : "border-black/[0.12] text-neutral-600 dark:border-white/[0.12] dark:text-neutral-400"}`}
                        data-testid={`enquiry-method-${method.replace(" ", "-").toLowerCase()}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="enq-msg" className="mm-field-label">Questions or Test Drive Request (Optional)</label>
                  <textarea
                    id="enq-msg"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Is it available for inspection this Sunday?"
                    maxLength={500}
                    className="mm-input"
                    data-testid="enquiry-message-input"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="flex items-center gap-1.5 text-[12px] text-neutral-500">
                    <ShieldCheck size={14} className="text-emerald-500" /> No spam guarantee
                  </span>
                  <button type="submit" disabled={busy} className="mm-btn mm-btn-primary" data-testid="enquiry-submit-button">
                    {busy ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <><Send size={15} /> Send Enquiry</>}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
