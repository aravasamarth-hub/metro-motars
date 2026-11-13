import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Sparkles,
  FileCheck,
  Send,
  Mail,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Phone,
  User,
  Car,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/features/i18n/LanguageContext";

const DContent: any = DialogContent;
const DTitle: any = DialogTitle;
const DDesc: any = DialogDescription;

export interface CustomerMessageModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly party: "seller" | "buyer";
  readonly deal: any;
  readonly initialTab?: "thank_you" | "rc_transfer";
}

/**
 * Format phone number to international WhatsApp standard
 * (assumes Indian +91 if 10 digits are provided)
 */
export function sanitizeWhatsAppPhone(phone: string | number | undefined | null): string {
  if (!phone) return "";
  const cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.length === 10) {
    return "91" + cleaned;
  }
  return cleaned;
}

export function CustomerMessageModal({
  isOpen,
  onClose,
  party,
  deal,
  initialTab = "thank_you",
}: Readonly<CustomerMessageModalProps>) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"thank_you" | "rc_transfer">(initialTab);
  const [copied, setCopied] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusNotice(null);
      setCopied(false);
    }
  }, [isOpen, initialTab]);

  const person = party === "seller" ? deal?.seller || {} : deal?.buyer || {};
  const recipientName = person?.name || (party === "seller" ? "Valued Seller" : "Valued Customer");
  const vehicle = deal?.vehicle || {};
  const vehicleName =
    vehicle?.vehicle_name ||
    `${vehicle?.make || ""} ${vehicle?.model || ""}`.trim() ||
    "vehicle";
  const regNumber = vehicle?.registration_number ? ` (Reg No: ${vehicle.registration_number})` : "";
  const buyerName = deal?.buyer?.name || "the purchaser";

  // Editable phone and email states
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  // Populate phone and email from deal on open
  useEffect(() => {
    if (isOpen) {
      setPhone(person?.phone || "");
      setEmail(person?.email || "");
    }
  }, [isOpen, person?.phone, person?.email]);

  // Default templates based on party & tab
  const defaultTemplate = useMemo(() => {
    if (party === "seller") {
      if (activeTab === "thank_you") {
        return `Dear ${recipientName},

Thank you for choosing Metro Motors! We truly appreciate doing business with you for the sale of your ${vehicleName}${regNumber}.

We are committed to providing a transparent, secure, and hassle-free vehicle experience. If you ever need any assistance in the future, please do not hesitate to contact us.

Warm regards,
Metro Motors Showroom
Indiranagar, Bengaluru
Phone: +91 98450 12345 / +91 80 2525 5555
Website: https://metromotors.in`;
      } else {
        return `Dear ${recipientName},

We are pleased to inform you that the RC transfer for your ${vehicleName}${regNumber} has been successfully completed and officially transferred to the buyer (${buyerName}).

All RTO documentation and ownership transfer formalities are now complete. Thank you once again for making your deal through Metro Motors!

Warm regards,
Metro Motors Showroom
Indiranagar, Bengaluru
Phone: +91 98450 12345 / +91 80 2525 5555`;
      }
    } else {
      // Buyer
      if (activeTab === "thank_you") {
        return `Dear ${recipientName},

Congratulations on your new ride and thank you for making a deal through Metro Motors! We are delighted to have assisted you in purchasing your ${vehicleName}${regNumber}.

We wish you safe, joyous, and memorable journeys ahead! Please feel free to reach out to us for any service, insurance, or documentation assistance.

Warm regards,
Metro Motors Showroom
Indiranagar, Bengaluru
Phone: +91 98450 12345 / +91 80 2525 5555
Website: https://metromotors.in`;
      } else {
        return `Dear ${recipientName},

Great news! The RC transfer for your vehicle ${vehicleName}${regNumber} has been completed successfully and is now officially transferred to your name.

Please come and verify and collect your original RC document from our showroom at your earliest convenience:

📍 Metro Motors Showroom, 100ft Road, Indiranagar, Bengaluru - 560038
📞 Contact: +91 98450 12345 / +91 80 2525 5555
⏰ Timings: 10:00 AM to 8:00 PM (Mon - Sun)

Please bring a valid photo ID (Aadhaar or Driving Licence) when collecting the document.

Warm regards,
Metro Motors Team`;
      }
    }
  }, [party, activeTab, recipientName, vehicleName, regNumber, buyerName]);

  // Update custom message when defaultTemplate changes
  useEffect(() => {
    setCustomMessage(defaultTemplate);
  }, [defaultTemplate]);

  const subject = useMemo(() => {
    if (party === "seller") {
      return activeTab === "thank_you"
        ? `Thank you for choosing Metro Motors - ${vehicleName}`
        : `RC Transfer Completed Successfully - ${vehicleName}${regNumber}`;
    } else {
      return activeTab === "thank_you"
        ? `Congratulations on your ${vehicleName} - Thank you from Metro Motors!`
        : `Action Required: RC Transfer Completed - Collect Original RC at Metro Motors (${vehicleName})`;
    }
  }, [party, activeTab, vehicleName, regNumber]);

  // Handle WhatsApp dispatch
  const handleSendWhatsApp = () => {
    const cleanPhone = sanitizeWhatsAppPhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setStatusNotice({
        type: "error",
        text: t("messaging.err_no_phone", "Please provide a valid 10-digit mobile number for WhatsApp."),
      });
      return;
    }

    const encodedText = encodeURIComponent(customMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setStatusNotice({
      type: "success",
      text: t("messaging.opened_wa", "Opened WhatsApp with pre-filled message!"),
    });
  };

  // Handle Email dispatch
  const handleSendEmail = () => {
    if (!email || !email.includes("@")) {
      setStatusNotice({
        type: "error",
        text: t("messaging.err_no_email", "Please provide a valid email address to send an email."),
      });
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(customMessage)}`;
    window.location.href = mailtoUrl;
    setStatusNotice({
      type: "success",
      text: t("messaging.opened_email", "Opened email client with pre-filled message!"),
    });
  };

  // Handle Copy to clipboard
  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(customMessage);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = customMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setStatusNotice({
        type: "success",
        text: t("messaging.copied", "Message copied to clipboard!"),
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DContent
        className="max-w-2xl bg-[#0e1726] border border-amber-500/40 text-neutral-100 p-0 overflow-hidden shadow-2xl rounded-xl"
        data-testid="customer-message-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#17263c] to-[#0c1626] border-b border-amber-500/25 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <DTitle className="text-base font-bold text-white flex items-center gap-2">
                <span>{party === "seller" ? "Seller Greeting & RC Update" : "Buyer Greeting & RC Update"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider font-semibold">
                  {party}
                </span>
              </DTitle>
              <DDesc className="text-xs text-neutral-400 mt-0.5">
                Send professional deal & RC status notifications via WhatsApp or Email
              </DDesc>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Recipient & Vehicle Context Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-neutral-900/70 border border-neutral-800 rounded-lg text-xs">
            <div className="flex items-center gap-2.5">
              <User size={16} className="text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-neutral-400 block">Recipient ({party})</span>
                <strong className="text-neutral-200 truncate block">{recipientName}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Car size={16} className="text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-neutral-400 block">Deal Vehicle</span>
                <strong className="text-neutral-200 truncate block">
                  {vehicleName} {regNumber}
                </strong>
              </div>
            </div>
          </div>

          {/* Message Choice Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900/90 border border-neutral-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("thank_you")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                activeTab === "thank_you"
                  ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
              }`}
              data-testid="tab-thank-you"
            >
              <Sparkles size={14} />
              <span>1. Thank You for Deal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rc_transfer")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                activeTab === "rc_transfer"
                  ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
              }`}
              data-testid="tab-rc-transfer"
            >
              <FileCheck size={14} />
              <span>
                {party === "seller" ? "2. RC Transferred to Buyer" : "2. RC Transfer Ready (Collect)"}
              </span>
            </button>
          </div>

          {/* Contact Input Fields (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-400" />
                <span>WhatsApp / Mobile Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9845012345"
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-700 focus:border-amber-500 rounded-md text-xs text-white placeholder-neutral-500 outline-none transition"
                data-testid="message-phone-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Mail size={13} className="text-sky-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-700 focus:border-amber-500 rounded-md text-xs text-white placeholder-neutral-500 outline-none transition"
                data-testid="message-email-input"
              />
            </div>
          </div>

          {/* Editable Message Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Message Preview <span className="text-neutral-500">(editable before dispatch)</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomMessage(defaultTemplate)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                title="Reset to default template"
              >
                <RotateCcw size={11} />
                <span>Reset to template</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-neutral-950/90 border border-neutral-700 focus:border-amber-500 rounded-md text-xs text-neutral-200 font-mono leading-relaxed outline-none resize-none transition shadow-inner"
              data-testid="message-textarea"
            />
          </div>

          {/* Status Notice if any */}
          {statusNotice && (
            <div
              className={`flex items-center gap-2 p-2.5 rounded-md text-xs ${
                statusNotice.type === "success"
                  ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
              }`}
            >
              {statusNotice.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{statusNotice.text}</span>
            </div>
          )}

          {/* Action Buttons: WhatsApp, Email, Copy */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition"
              data-testid="message-copy-btn"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>

            <div className="flex items-center gap-2.5">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition hover:scale-[1.02]"
                data-testid="message-send-whatsapp-btn"
              >
                <MessageSquare size={14} />
                <span>Send via WhatsApp</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>

              {/* Email Button */}
              <button
                type="button"
                onClick={handleSendEmail}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-900/30 transition hover:scale-[1.02]"
                data-testid="message-send-email-btn"
              >
                <Mail size={14} />
                <span>Send via Email</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </DContent>
    </Dialog>
  );
}

export default CustomerMessageModal;
