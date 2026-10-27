import React, { useState } from "react";
import { X, Phone, MessageSquare, Send, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { SHOWROOM_CONTACT, getWhatsAppEnquiryUrl, submitPurchaseEnquiry } from "@/data/customerEnquiry";

export default function EnquiryModal({ vehicle, isOpen, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredMethod, setPreferredMethod] = useState("WhatsApp");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen || !vehicle) return null;

  const whatsappUrl = getWhatsAppEnquiryUrl(vehicle);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return; // Prevent double submit
    setError("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <Sparkles size={13} /> Contact Showroom
            </div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">
              Purchase Enquiry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Vehicle Badge */}
        <div className="px-6 py-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {vehicle.year} {vehicle.title}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {vehicle.odometerKm?.toLocaleString("en-IN")} km · {vehicle.registrationLocation}
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              ₹{vehicle.sellingPrice?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                submissionResult?.isServerDelivered
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                  : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
              }`}>
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                {submissionResult?.isServerDelivered
                  ? "Enquiry Registered with Showroom!"
                  : "Enquiry Logged in Local Preview"}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
                {submissionResult?.isServerDelivered ? (
                  <>
                    Thank you! Your enquiry has been received and logged in our showroom queue (Ref:{" "}
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {submissionResult?.enquiryId}
                    </span>
                    ). A motorcycle specialist will contact you via {preferredMethod}.
                  </>
                ) : (
                  <>
                    Your enquiry has been saved to your browser&apos;s local storage.
                    <span className="block font-semibold text-amber-600 dark:text-amber-400 mt-1">
                      Note: Live server delivery is offline.
                    </span>
                    Please connect directly with our showroom team on WhatsApp or Call to guarantee your inspection.
                  </>
                )}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
                >
                  <MessageSquare size={15} /> Message on WhatsApp Now
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Direct Actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <a
                  href={`tel:${SHOWROOM_CONTACT.rawPhone}`}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:border-amber-500/50 hover:bg-amber-500/5 text-neutral-900 dark:text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Phone size={15} className="text-amber-500" />
                  <span>Call {SHOWROOM_CONTACT.phone}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors shadow-sm"
                >
                  <MessageSquare size={15} />
                  <span>WhatsApp Showroom</span>
                </a>
              </div>

              {/* Local Storage Limitation Disclosure */}
              <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
                <span className="font-bold">Preview Notice:</span> Web enquiries are logged in local browser storage only. For live vehicle booking, please connect directly via WhatsApp or Phone.
              </div>

              <div className="relative flex py-1 items-center mb-4">
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
                <span className="flex-shrink mx-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  or log local callback
                </span>
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Mobile Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9880012345"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["WhatsApp", "Phone Call"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPreferredMethod(method)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                          preferredMethod === method
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Questions or Test Drive Request (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Is it available for inspection this Sunday?"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" /> No spam guarantee
                  </span>
                  <button
                    type="submit"
                    disabled={busy}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-colors"
                  >
                    {busy ? "Submitting..." : <><Send size={14} /> Send Enquiry</>}
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
