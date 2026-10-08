import React, { useState, useEffect } from "react";
import { X, Copy, Check, RefreshCw, Send, Phone, MessageSquare, AlertCircle } from "lucide-react";
import { RTO_TASKS } from "./AgentStep";
import { money } from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

/**
 * Generate formatted Metro Motors work assignment notification text
 */
export const generateAgentMessage = ({
  deal = {},
  agent = {},
  selectedTasks = [],
  taskAmounts = {},
  otherDoc = "",
  customAssignedAt = "",
}) => {
  const showroomName = "METRO MOTORS";
  const agentName = (agent.name || "").trim() || "Agent";
  const agentPhone = (agent.phone || "").trim();

  // Format Assigned Time
  let timeFormatted = "Not specified";
  const assignedVal = customAssignedAt || agent.assigned_at;
  if (assignedVal) {
    try {
      const dt = new Date(assignedVal);
      if (!isNaN(dt.getTime())) {
        timeFormatted = dt.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        timeFormatted = assignedVal;
      }
    } catch {
      timeFormatted = assignedVal;
    }
  }

  // Vehicle info
  const v = deal.vehicle || {};
  const vehicleName = v.vehicle_name || v.make_model || "";
  const regNo = v.registration_number || "";
  const vehicleDesc = [vehicleName, regNo].filter(Boolean).join(" • ");

  // Task list formatting
  const tasksToFormat = Array.isArray(selectedTasks) && selectedTasks.length > 0
    ? selectedTasks
    : Array.isArray(agent.tasks) && agent.tasks.length > 0
    ? agent.tasks
    : [];

  const selectedTasksList = tasksToFormat.map((id) => {
    const item = RTO_TASKS.find((t) => t.id === id);
    if (!item) return `• ${id}`;
    let title = `${item.num}. ${item.label}`;
    if (id === "OTHERS") {
      const doc = String(otherDoc || agent.other_doc || "").trim();
      title = doc ? `8. Others (${doc})` : "8. Others";
    }
    const amounts = taskAmounts || agent.task_amounts || {};
    const amt = amounts[id];
    const amtStr =
      amt && !isNaN(Number(amt)) && Number(amt) > 0
        ? ` — ₹${Number(amt).toLocaleString("en-IN")}`
        : "";
    return `• ${title}${amtStr}`;
  });

  const tasksText =
    selectedTasksList.length > 0
      ? selectedTasksList.join("\n")
      : "• No specific tasks selected";

  const total = Number(agent.total_amount) || 0;
  const paid = Number(agent.amount_paid) || 0;
  const balance =
    agent.amount_balance !== "" && agent.amount_balance != null
      ? Number(agent.amount_balance)
      : Math.max(0, total - paid);

  const totalStr = money(total);
  const paidStr = money(paid);
  const balanceStr = money(balance);

  const lines = [
    `🏍️ *${showroomName} — WORK ASSIGNMENT*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🏢 *Showroom:* Metro Motors, Davanagere`,
    `👤 *Agent Name:* ${agentName}`,
  ];

  if (agentPhone) {
    lines.push(`📞 *Agent Phone:* ${agentPhone}`);
  }

  lines.push(`⏰ *Time of Work Assigned:* ${timeFormatted}`);

  if (vehicleDesc) {
    lines.push(`🛵 *Vehicle:* ${vehicleDesc}`);
  }
  if (deal.bill_number) {
    lines.push(`📄 *Bill No:* ${deal.bill_number}`);
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *TASK / WORK DETAILS:*`,
    tasksText,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *PAYMENT DETAILS:*`,
    `• *Total Amount:* ${totalStr}`,
    `• *Amount Paid:* ${paidStr}`,
    `• *Amount Balance:* ${balanceStr}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Please complete the assigned RTO work and update Metro Motors showroom._`,
    `📍 *Metro Motors*, PB Road, Davanagere`
  );

  return lines.join("\n");
};

/**
 * Modal dialog for reviewing, editing and sending WhatsApp message to Agent
 */
export const AgentWhatsAppModal = ({
  isOpen,
  onClose,
  deal = {},
  agent = {},
  selectedTasks = [],
  taskAmounts = {},
  otherDoc = "",
  customAssignedAt = "",
  onUpdateAgentPhone,
}) => {
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Initialize or re-populate when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialPhone = (agent.phone || "").trim();
      setPhone(initialPhone);

      const generated = generateAgentMessage({
        deal,
        agent,
        selectedTasks,
        taskAmounts,
        otherDoc,
        customAssignedAt,
      });
      setMessage(generated);
      setCopied(false);
    }
  }, [isOpen, deal, agent, selectedTasks, taskAmounts, otherDoc, customAssignedAt]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (onUpdateAgentPhone) {
      onUpdateAgentPhone(val);
    }
  };

  const handleResetToTemplate = () => {
    const generated = generateAgentMessage({
      deal,
      agent: { ...agent, phone },
      selectedTasks,
      taskAmounts,
      otherDoc,
      customAssignedAt,
    });
    setMessage(generated);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = message;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleSendWhatsApp = () => {
    const rawDigits = (phone || "").replace(/\D/g, "");
    const targetPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

    const url = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const cleanDigits = (phone || "").replace(/\D/g, "");
  const hasValidPhone = cleanDigits.length >= 10;
  const lineCount = (message.match(/\n/g) || []).length + 1;
  const charCount = message.length;

  return (
    <div
      className="agent-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      data-testid="agent-whatsapp-modal"
    >
      <div
        className="agent-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="agent-whatsapp-modal-card"
      >
        {/* Modal Header */}
        <div className="agent-modal-header">
          <div className="agent-modal-header-left">
            <div className="agent-modal-icon-badge">
              <svg className="agent-modal-whatsapp-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.79 2.39a8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 className="agent-modal-title">
                  {t("agent.modal_title", "Notify Agent via WhatsApp")}
                </h3>
                <span className="agent-modal-badge">METRO MOTORS</span>
              </div>
              <p className="agent-modal-subtitle">
                {t("agent.modal_subtitle", "Review and edit the work notification message before sending to the agent.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="agent-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="agent-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="agent-modal-body">
          {/* Agent Number / Recipient Card */}
          <div className="agent-modal-recipient-card">
            <div className="agent-modal-recipient-row">
              <div className="agent-modal-field-group">
                <label className="agent-modal-field-label" htmlFor="agent-modal-phone-input">
                  <Phone size={14} />
                  <span>{t("agent.phone", "Agent Phone Number")}</span>
                  {hasValidPhone ? (
                    <span className="agent-modal-phone-status valid">✓ Ready</span>
                  ) : (
                    <span className="agent-modal-phone-status notice">
                      <AlertCircle size={12} />
                      Enter 10-digit number
                    </span>
                  )}
                </label>
                <div className="agent-modal-phone-input-wrap">
                  <span className="agent-modal-country-prefix">+91</span>
                  <input
                    id="agent-modal-phone-input"
                    type="tel"
                    className="agent-modal-phone-input"
                    placeholder="e.g. 9886012345"
                    value={phone}
                    onChange={handlePhoneChange}
                    data-testid="agent-modal-phone-input"
                  />
                </div>
              </div>

              {agent.name && (
                <div className="agent-modal-agent-name-chip">
                  <span className="agent-modal-chip-label">Agent:</span>
                  <strong>{agent.name}</strong>
                </div>
              )}
            </div>

            <p className="agent-modal-hint-text">
              This message will be dispatched directly to the agent's WhatsApp from Metro Motors.
            </p>
          </div>

          {/* Editable Message Textarea */}
          <div className="agent-modal-editor-container">
            <div className="agent-modal-editor-header">
              <div className="agent-modal-editor-label">
                <MessageSquare size={14} />
                <span>{t("agent.modal_message_label", "Editable Message (Metro Motors Work Notification)")}</span>
              </div>
              <button
                type="button"
                className="agent-modal-reset-btn"
                onClick={handleResetToTemplate}
                title="Reset back to generated template"
                data-testid="agent-modal-reset-btn"
              >
                <RefreshCw size={12} />
                <span>{t("agent.modal_reset", "Reset to Template")}</span>
              </button>
            </div>

            <textarea
              className="agent-modal-textarea"
              rows={13}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message to send to the agent..."
              data-testid="agent-modal-textarea"
            />

            <div className="agent-modal-editor-footer">
              <span className="agent-modal-counter">
                {lineCount} lines • {charCount} characters
              </span>
              <span className="agent-modal-editor-tip">
                You can freely edit task instructions, deadlines, or pricing details above.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="agent-modal-actions">
          <button
            type="button"
            className={`agent-modal-copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            data-testid="agent-modal-copy-btn"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>{t("agent.modal_copied", "Copied to Clipboard!")}</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>{t("agent.modal_copy", "Copy Message")}</span>
              </>
            )}
          </button>

          <div className="agent-modal-actions-right">
            <button
              type="button"
              className="agent-modal-cancel-btn"
              onClick={onClose}
              data-testid="agent-modal-cancel-btn"
            >
              {t("agent.modal_close", "Cancel")}
            </button>

            <button
              type="button"
              className="agent-modal-send-btn"
              onClick={handleSendWhatsApp}
              data-testid="agent-modal-send-btn"
            >
              <Send size={15} />
              <span>{t("agent.modal_send", "Send via WhatsApp")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
