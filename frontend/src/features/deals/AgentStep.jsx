import React, { useState } from "react";
import { Check } from "lucide-react";
import { DealField } from "./DealField";
import { money } from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { AgentWhatsAppModal } from "./AgentWhatsAppModal";

export const RTO_TASKS = [
  { id: "TO", num: 1, label: "TO (Transfer of Ownership)" },
  { id: "HPT", num: 2, label: "HPT (Hypothecation Cancellation)" },
  { id: "HP_ENTRY", num: 3, label: "HP Entry" },
  { id: "DRC", num: 4, label: "DRC (Duplicate Registration Certificate)" },
  { id: "NOC", num: 5, label: "NOC (No Objection Certificate)" },
  { id: "FC", num: 6, label: "FC (Fitness Certificate)" },
  { id: "CC", num: 7, label: "CC (Clearance Certificate)" },
  { id: "OTHERS", num: 8, label: "Others" },
];

const getLocalDatetimeString = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const AgentStep = ({ deal, updateSection, errors = {} }) => {
  const { t } = useLanguage();
  const agent = deal.agent || {};

  // Extract initial otherDoc if present in deal.agent.other_doc or deal.agent.task
  const initialOtherDoc = () => {
    if (agent.other_doc) return agent.other_doc;
    if (typeof agent.task === "string" && agent.task.includes("Others (")) {
      const match = agent.task.match(/Others\s*\(([^)]+)\)/i);
      if (match) return match[1];
    }
    return "";
  };

  const [otherDoc, setOtherDoc] = useState(initialOtherDoc);

  // Task amounts dictionary { [taskId]: string | number }
  const [taskAmounts, setTaskAmounts] = useState(() => {
    return agent.task_amounts && typeof agent.task_amounts === "object"
      ? agent.task_amounts
      : {};
  });

  // State for opening the WhatsApp work notification editable modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Assigned at: defaults to current local datetime if not set
  const assignedAt = agent.assigned_at || getLocalDatetimeString();

  const handleAgentChange = (key, value) => {
    if (!updateSection) return;
    updateSection("agent", key, value);

    if (key === "total_amount") {
      const tot = value;
      const paid = agent.amount_paid;
      if (tot !== "" && tot != null && !isNaN(Number(tot))) {
        const p = paid !== "" && paid != null && !isNaN(Number(paid)) ? Number(paid) : 0;
        updateSection("agent", "amount_balance", String(Math.max(0, Number(tot) - p)));
      }
    } else if (key === "amount_paid") {
      const paid = value;
      const tot = agent.total_amount;
      if (tot !== "" && tot != null && !isNaN(Number(tot))) {
        const p = paid !== "" && paid != null && !isNaN(Number(paid)) ? Number(paid) : 0;
        updateSection("agent", "amount_balance", String(Math.max(0, Number(tot) - p)));
      }
    }
  };

  const getSelectedTaskIds = () => {
    if (Array.isArray(agent.tasks)) {
      return agent.tasks;
    }
    if (typeof agent.task === "string" && agent.task.trim()) {
      const text = agent.task.toLowerCase();
      const matched = RTO_TASKS.filter(
        (t) =>
          text.includes(t.label.toLowerCase()) ||
          text.includes(t.id.toLowerCase()) ||
          text.includes(`${t.num}.`)
      ).map((t) => t.id);
      if (text.includes("other") && !matched.includes("OTHERS")) {
        matched.push("OTHERS");
      }
      return matched;
    }
    return [];
  };

  const selectedIds = getSelectedTaskIds();

  // Format task summary for storage and deal view
  const formatTaskSummary = (taskIds, customDoc, amounts = taskAmounts) => {
    return taskIds
      .map((id) => {
        const item = RTO_TASKS.find((t) => t.id === id);
        if (!item) return id;
        let title = `${item.num}. ${item.label}`;
        if (id === "OTHERS") {
          const doc = String(customDoc || "").trim();
          title = doc ? `${item.num}. Others (${doc})` : `${item.num}. Others`;
        }
        const amt = amounts[id];
        if (amt !== "" && amt != null && !isNaN(Number(amt)) && Number(amt) > 0) {
          return `${title} (₹${Number(amt).toLocaleString("en-IN")})`;
        }
        return title;
      })
      .join(", ");
  };

  // Recalculate total from task amounts
  const calculateTotalFromAmounts = (taskIds, amounts) => {
    return taskIds.reduce((sum, id) => {
      const val = amounts[id];
      return sum + (val !== "" && val != null && !isNaN(Number(val)) ? Number(val) : 0);
    }, 0);
  };

  const handleToggleTask = (taskId) => {
    let next;
    if (selectedIds.includes(taskId)) {
      next = selectedIds.filter((id) => id !== taskId);
    } else {
      next = [...selectedIds, taskId];
    }
    next.sort((a, b) => {
      const idxA = RTO_TASKS.findIndex((t) => t.id === a);
      const idxB = RTO_TASKS.findIndex((t) => t.id === b);
      return idxA - idxB;
    });

    // Automatically calculate Total amount by summing the amounts of all selected tasks
    const newTotal = calculateTotalFromAmounts(next, taskAmounts);
    if (newTotal > 0) {
      handleAgentChange("total_amount", String(newTotal));
      const p = agent.amount_paid !== "" && agent.amount_paid != null && !isNaN(Number(agent.amount_paid)) ? Number(agent.amount_paid) : 0;
      handleAgentChange("amount_balance", String(Math.max(0, newTotal - p)));
    } else if (next.length === 0) {
      handleAgentChange("total_amount", "");
      handleAgentChange("amount_balance", "");
    }

    const taskSummary = formatTaskSummary(next, otherDoc, taskAmounts);
    handleAgentChange("tasks", next);
    handleAgentChange("task", taskSummary);
  };

  const handleTaskAmountChange = (taskId, amountVal) => {
    const updatedAmounts = { ...taskAmounts, [taskId]: amountVal };
    setTaskAmounts(updatedAmounts);
    handleAgentChange("task_amounts", updatedAmounts);

    // Sum up the amounts of all selected tasks
    const newTotal = calculateTotalFromAmounts(selectedIds, updatedAmounts);
    if (newTotal > 0) {
      handleAgentChange("total_amount", String(newTotal));
      const p = agent.amount_paid !== "" && agent.amount_paid != null && !isNaN(Number(agent.amount_paid)) ? Number(agent.amount_paid) : 0;
      handleAgentChange("amount_balance", String(Math.max(0, newTotal - p)));
    } else {
      handleAgentChange("total_amount", "");
      handleAgentChange("amount_balance", "");
    }

    const taskSummary = formatTaskSummary(selectedIds, otherDoc, updatedAmounts);
    handleAgentChange("task", taskSummary);
  };

  const handleOtherDocChange = (e) => {
    const val = e.target.value;
    setOtherDoc(val);
    handleAgentChange("other_doc", val);

    let next = selectedIds;
    if (!next.includes("OTHERS")) {
      next = [...next, "OTHERS"];
      next.sort((a, b) => {
        const idxA = RTO_TASKS.findIndex((t) => t.id === a);
        const idxB = RTO_TASKS.findIndex((t) => t.id === b);
        return idxA - idxB;
      });
      handleAgentChange("tasks", next);
    }

    const taskSummary = formatTaskSummary(next, val, taskAmounts);
    handleAgentChange("task", taskSummary);
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    const allIds = RTO_TASKS.map((t) => t.id);
    const newTotal = calculateTotalFromAmounts(allIds, taskAmounts);
    if (newTotal > 0) {
      handleAgentChange("total_amount", String(newTotal));
      const p = agent.amount_paid !== "" && agent.amount_paid != null && !isNaN(Number(agent.amount_paid)) ? Number(agent.amount_paid) : 0;
      handleAgentChange("amount_balance", String(Math.max(0, newTotal - p)));
    }
    const taskSummary = formatTaskSummary(allIds, otherDoc, taskAmounts);
    handleAgentChange("tasks", allIds);
    handleAgentChange("task", taskSummary);
  };

  const handleClearAll = (e) => {
    e.preventDefault();
    handleAgentChange("tasks", []);
    handleAgentChange("task", "");
    handleAgentChange("total_amount", "");
    handleAgentChange("amount_balance", "");
    setOtherDoc("");
    handleAgentChange("other_doc", "");
  };

  const total = Number(agent.total_amount) || 0;
  const paid = Number(agent.amount_paid) || 0;
  const balance =
    agent.amount_balance !== "" && agent.amount_balance != null
      ? Number(agent.amount_balance)
      : Math.max(0, total - paid);
  const hasAgentAmounts =
    (agent.total_amount !== "" && agent.total_amount != null) ||
    (agent.amount_paid !== "" && agent.amount_paid != null);

  // Open editable WhatsApp message preview & sender modal
  const handleSendWhatsApp = () => {
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="agent-step-container" data-testid="agent-step-container">
      {/* Step title */}
      <h2 className="seller-step-title">{t("agent.title", "Agent")}</h2>

      <section className="wizard-group">
        <div className="section-title">
          <div>
            <h2>{t("agent.details_title", "Agent details")}</h2>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--local-muted)" }}>
              {t("agent.details_desc", "RTO transfer, broker, or service agent information for this deal")}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {hasAgentAmounts && (
              <span
                className={`status-pill ${paid >= total && total > 0 ? "green" : paid > 0 ? "gold" : "blue"}`}
                data-testid="agent-status-pill"
              >
                {paid >= total && total > 0
                  ? t("agent.paid_in_full", "Paid in Full")
                  : paid > 0
                  ? `${t("agent.balance", "Balance")}: ${money(balance)}`
                  : t("agent.unpaid", "Unpaid")}
              </span>
            )}

            {/* WhatsApp Notification Button */}
            <button
              type="button"
              className="agent-whatsapp-btn"
              onClick={handleSendWhatsApp}
              data-testid="agent-whatsapp-btn"
              title="Send Work Details, Assigned Time & Payment to Agent via WhatsApp"
            >
              <svg className="agent-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.79 2.39a8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
              </svg>
              <span>{t("agent.notify_whatsapp", "Notify Agent on WhatsApp")}</span>
            </button>
          </div>
        </div>

        <div className="form-grid wizard-fields">
          <DealField
            config={{
              key: "name",
              label: t("agent.name", "Agent name"),
              type: "text",
              placeholder: "e.g. Ramesh RTO Agent",
            }}
            prefix="agent"
            value={agent.name}
            error={errors["agent.name"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{
              key: "phone",
              label: t("agent.phone", "Phone number"),
              type: "tel",
              placeholder: "e.g. 9876543210",
            }}
            prefix="agent"
            value={agent.phone}
            error={errors["agent.phone"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{
              key: "email",
              label: t("agent.email", "Email ID (Optional)"),
              type: "email",
              placeholder: "e.g. agent@example.com",
            }}
            prefix="agent"
            value={agent.email}
            error={errors["agent.email"]}
            onChange={handleAgentChange}
          />

          {/* Time of work assigned for all of them together */}
          <label className="form-field wizard-field" htmlFor="agent-assigned-at">
            <span>{t("agent.assigned_at", "Time of work assigned")}</span>
            <input
              id="agent-assigned-at"
              type="datetime-local"
              value={agent.assigned_at || assignedAt}
              onChange={(e) => handleAgentChange("assigned_at", e.target.value)}
              data-testid="agent-assigned-at-input"
            />
          </label>
        </div>

        {/* RTO Work Checklist with Square Checkboxes and Amounts */}
        <div className="agent-tasks-section" data-testid="agent-tasks-section">
          <div className="agent-tasks-header">
            <div className="agent-tasks-header-left">
              <h3 className="agent-tasks-header-title">{t("agent.task", "Task / Work details")}</h3>
              <span className="agent-tasks-count-pill" data-testid="agent-tasks-count-pill">
                {selectedIds.length > 0
                  ? `${selectedIds.length} of ${RTO_TASKS.length} selected`
                  : "0 selected"}
              </span>
            </div>
            <div className="agent-tasks-actions">
              <button
                type="button"
                className="agent-tasks-btn-link"
                onClick={handleSelectAll}
                data-testid="agent-tasks-select-all"
              >
                Select All
              </button>
              <button
                type="button"
                className="agent-tasks-btn-link"
                onClick={handleClearAll}
                data-testid="agent-tasks-clear-all"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="agent-tasks-grid" role="group" aria-label="RTO Work & Services">
            {RTO_TASKS.map((task) => {
              const isSelected = selectedIds.includes(task.id);

              if (task.id === "OTHERS") {
                return (
                  <div
                    key={task.id}
                    className={`agent-task-card agent-task-card-others ${isSelected ? "selected" : ""}`}
                    data-testid="agent-task-others"
                    onClick={!isSelected ? () => handleToggleTask("OTHERS") : undefined}
                  >
                    <div className="agent-task-others-row">
                      <div className="agent-task-main">
                        <label
                          className="agent-task-others-checkbox-label"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask("OTHERS");
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTask("OTHERS")}
                            style={{
                              position: "absolute",
                              opacity: 0,
                              pointerEvents: "none",
                              width: 0,
                              height: 0,
                            }}
                            aria-label={`${task.num}. ${task.label}`}
                          />
                          <span className="agent-task-checkbox" aria-hidden="true">
                            {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                          </span>
                          <span className="agent-task-text">
                            <span className="agent-task-number">{task.num}.</span>
                            <span className="agent-task-label">{task.label}</span>
                          </span>
                        </label>
                      </div>

                      {/* Amount beside Others - displayed when selected */}
                      {isSelected && (
                        <div
                          className="agent-task-amount-wrap"
                          onClick={(e) => e.stopPropagation()}
                          title="Enter amount for this task"
                        >
                          <span className="agent-task-currency-prefix">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="agent-task-amount-input"
                            placeholder="0.00"
                            value={taskAmounts["OTHERS"] !== undefined ? taskAmounts["OTHERS"] : ""}
                            onChange={(e) => handleTaskAmountChange("OTHERS", e.target.value)}
                            data-testid="agent-task-amount-others"
                          />
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="agent-task-others-input-container">
                        <input
                          type="text"
                          className="agent-task-others-input"
                          placeholder="Enter document / certificate name (e.g. Form 28, Police Verification)..."
                          value={otherDoc}
                          onChange={handleOtherDocChange}
                          onClick={(e) => e.stopPropagation()}
                          data-testid="agent-task-others-input"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <label
                  key={task.id}
                  className={`agent-task-card ${isSelected ? "selected" : ""}`}
                  data-testid={`agent-task-${task.id.toLowerCase()}`}
                >
                  <div className="agent-task-main">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTask(task.id)}
                      style={{
                        position: "absolute",
                        opacity: 0,
                        pointerEvents: "none",
                        width: 0,
                        height: 0,
                      }}
                      aria-label={`${task.num}. ${task.label}`}
                    />
                    <span className="agent-task-checkbox" aria-hidden="true">
                      {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                    </span>
                    <span className="agent-task-text">
                      <span className="agent-task-number">{task.num}.</span>
                      <span className="agent-task-label">{task.label}</span>
                    </span>
                  </div>

                  {/* Amount beside the task - displayed when selected */}
                  {isSelected && (
                    <div
                      className="agent-task-amount-wrap"
                      onClick={(e) => e.stopPropagation()}
                      title="Enter amount for this task"
                    >
                      <span className="agent-task-currency-prefix">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="agent-task-amount-input"
                        placeholder="0.00"
                        value={taskAmounts[task.id] !== undefined ? taskAmounts[task.id] : ""}
                        onChange={(e) => handleTaskAmountChange(task.id, e.target.value)}
                        data-testid={`agent-task-amount-${task.id.toLowerCase()}`}
                      />
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {errors["agent.task"] && (
            <small className="field-error" style={{ marginTop: "10px" }}>
              {errors["agent.task"]}
            </small>
          )}
        </div>

        <div className="form-grid wizard-fields" style={{ marginTop: "16px" }}>
          <DealField
            config={{
              key: "total_amount",
              label: t("agent.total_amount", "Total amount (₹)"),
              type: "number",
              step: "0.01",
              placeholder: "0.00",
            }}
            prefix="agent"
            value={agent.total_amount}
            error={errors["agent.total_amount"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{
              key: "amount_paid",
              label: t("agent.amount_paid", "Amount paid (₹)"),
              type: "number",
              step: "0.01",
              placeholder: "0.00",
            }}
            prefix="agent"
            value={agent.amount_paid}
            error={errors["agent.amount_paid"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{
              key: "amount_balance",
              label: t("agent.amount_balance", "Amount balance (₹)"),
              type: "number",
              step: "0.01",
              placeholder: "0.00",
            }}
            prefix="agent"
            value={agent.amount_balance}
            error={errors["agent.amount_balance"]}
            onChange={handleAgentChange}
          />
        </div>

        {hasAgentAmounts && (
          <div className="payment-balances" style={{ marginTop: "20px" }}>
            <div>
              <span>{t("agent.total_fee", "Total fee payable to agent")}</span>
              <strong data-testid="agent-total-fee">{money(total)}</strong>
            </div>
            <div>
              <span>{t("agent.paid_so_far", "Amount paid to agent")}</span>
              <strong style={{ color: "#49d19b" }} data-testid="agent-amount-paid">
                {money(paid)}
              </strong>
            </div>
            <div>
              <span>{t("agent.pending_balance", "Balance due to agent")}</span>
              <strong
                style={{ color: balance > 0 ? "var(--gold)" : "inherit" }}
                data-testid="agent-balance-due"
              >
                {money(balance)}
              </strong>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button
                type="button"
                className="agent-whatsapp-btn"
                onClick={handleSendWhatsApp}
                title="Send notification to Agent via WhatsApp"
              >
                <svg className="agent-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.79 2.39a8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
                </svg>
                <span>{t("agent.notify_whatsapp", "Notify Agent on WhatsApp")}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Editable WhatsApp Work Notification Modal */}
      <AgentWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        deal={deal}
        agent={agent}
        selectedTasks={selectedIds}
        taskAmounts={taskAmounts}
        otherDoc={otherDoc}
        customAssignedAt={assignedAt}
        onUpdateAgentPhone={(newPhone) => handleAgentChange("phone", newPhone)}
      />
    </div>
  );
};
