import { DealField } from "./DealField";
import { money } from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const AgentStep = ({ deal, updateSection, errors = {} }) => {
  const { t } = useLanguage();
  const agent = deal.agent || {};

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

  const total = Number(agent.total_amount) || 0;
  const paid = Number(agent.amount_paid) || 0;
  const balance = agent.amount_balance !== "" && agent.amount_balance != null
    ? Number(agent.amount_balance)
    : Math.max(0, total - paid);
  const hasAgentAmounts = (agent.total_amount !== "" && agent.total_amount != null) || (agent.amount_paid !== "" && agent.amount_paid != null);

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
        </div>

        <div className="form-grid wizard-fields">
          <DealField
            config={{ key: "name", label: t("agent.name", "Agent name"), type: "text", placeholder: "e.g. Ramesh RTO Agent" }}
            prefix="agent"
            value={agent.name}
            error={errors["agent.name"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{ key: "phone", label: t("agent.phone", "Phone number"), type: "tel", placeholder: "e.g. 9876543210" }}
            prefix="agent"
            value={agent.phone}
            error={errors["agent.phone"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{ key: "email", label: t("agent.email", "Email ID (Optional)"), type: "email", placeholder: "e.g. agent@example.com" }}
            prefix="agent"
            value={agent.email}
            error={errors["agent.email"]}
            onChange={handleAgentChange}
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <DealField
            config={{
              key: "task",
              label: t("agent.task", "Task / Work details"),
              type: "textarea",
              placeholder: "Enter details about RTO work, ownership transfer, commission agreement, or broker instructions...",
            }}
            prefix="agent"
            value={agent.task}
            error={errors["agent.task"]}
            onChange={handleAgentChange}
          />
        </div>

        <div className="form-grid wizard-fields" style={{ marginTop: "16px" }}>
          <DealField
            config={{ key: "total_amount", label: t("agent.total_amount", "Total amount (₹)"), type: "number", step: "0.01", placeholder: "0.00" }}
            prefix="agent"
            value={agent.total_amount}
            error={errors["agent.total_amount"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{ key: "amount_paid", label: t("agent.amount_paid", "Amount paid (₹)"), type: "number", step: "0.01", placeholder: "0.00" }}
            prefix="agent"
            value={agent.amount_paid}
            error={errors["agent.amount_paid"]}
            onChange={handleAgentChange}
          />
          <DealField
            config={{ key: "amount_balance", label: t("agent.amount_balance", "Amount balance (₹)"), type: "number", step: "0.01", placeholder: "0.00" }}
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
              <strong style={{ color: "#49d19b" }} data-testid="agent-amount-paid">{money(paid)}</strong>
            </div>
            <div>
              <span>{t("agent.pending_balance", "Balance due to agent")}</span>
              <strong style={{ color: balance > 0 ? "var(--gold)" : "inherit" }} data-testid="agent-balance-due">{money(balance)}</strong>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
