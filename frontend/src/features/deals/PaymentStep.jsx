import {
  Calculator,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Banknote,
  Smartphone,
  Building2,
  FileCheck2,
  Layers,
  Sparkles,
  Wrench,
} from "lucide-react";
import { FieldGrid } from "./DealField";
import { paymentFields } from "./fieldConfig";
import { commission, grossCommission, calculateMaintenanceTotal, money } from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { MaintenanceSection } from "./MaintenanceSection";

const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash", desc: "Showroom Counter", icon: Banknote },
  { id: "UPI", label: "UPI / QR", desc: "Instant Digital", icon: Smartphone },
  { id: "Bank Transfer", label: "Bank Transfer", desc: "RTGS / NEFT / IMPS", icon: Building2 },
  { id: "Cheque", label: "Cheque", desc: "CTS Clearing", icon: FileCheck2 },
  { id: "Mixed", label: "Mixed / Split", desc: "Part Cash / Part Bank", icon: Layers },
];

export const PaymentStep = ({ deal, updateSection, errors }) => {
  const { t } = useLanguage();
  const p = deal?.payments || {};
  const maintenanceExpense = calculateMaintenanceTotal(deal?.maintenance);
  const grossAmount = grossCommission(p);
  const netAmount = commission(p, maintenanceExpense);

  const purchaseNum = Number(p.purchase_price) || 0;
  const sellingNum = Number(p.selling_price) || 0;
  const receivedNum = Number(p.received_from_buyer) || 0;
  const paidNum = Number(p.paid_to_seller) || 0;

  const marginPercent =
    sellingNum > 0 && netAmount !== null
      ? ((netAmount / sellingNum) * 100).toFixed(1)
      : null;

  const sellerBalance =
    p.purchase_price === "" ? "—" : money(purchaseNum - paidNum);
  const buyerBalance =
    p.selling_price === "" ? "—" : money(sellingNum - receivedNum);

  return (
    <div className="payment-step-container" data-testid="payment-step-container">
      {/* Executive Financial Cockpit */}
      <div className="financial-cockpit-container" data-testid="financial-cockpit">
        <div className="cockpit-grid">
          {/* Selling Price Inflow */}
          <div className="cockpit-card">
            <div className="cockpit-header">
              <span className="cockpit-label">
                {t("payment.selling_inflow", "Selling Inflow")}
              </span>
              <ArrowUpRight size={16} className="cockpit-icon" />
            </div>
            <div className="cockpit-val">
              {p.selling_price === "" ? "₹0" : money(sellingNum)}
            </div>
            <div className="cockpit-sub">
              <span>{t("payment.received", "Received")}:</span>
              <strong>{money(receivedNum)}</strong>
            </div>
          </div>

          {/* Purchase Price Procurement */}
          <div className="cockpit-card">
            <div className="cockpit-header">
              <span className="cockpit-label">
                {t("payment.purchase_cost", "Procurement Cost")}
              </span>
              <ArrowDownLeft size={16} className="cockpit-icon" />
            </div>
            <div className="cockpit-val">
              {p.purchase_price === "" ? "₹0" : money(purchaseNum)}
            </div>
            <div className="cockpit-sub">
              <span>{t("payment.disbursed", "Disbursed")}:</span>
              <strong>{money(paidNum)}</strong>
            </div>
          </div>

          {/* Mechanical Maintenance Cost */}
          <div className="cockpit-card">
            <div className="cockpit-header">
              <span className="cockpit-label">
                {t("maintenance.cockpit_title", "Maintenance Cost")}
              </span>
              <Wrench size={16} className="cockpit-icon" style={{ color: "#f59e0b" }} />
            </div>
            <div className="cockpit-val" style={{ color: maintenanceExpense > 0 ? "#f59e0b" : undefined }}>
              {money(maintenanceExpense)}
            </div>
            <div className="cockpit-sub">
              <span>{t("maintenance.services", "Services")}:</span>
              <strong>
                {deal?.maintenance?.services
                  ? `${deal.maintenance.services.filter((s) => s.enabled).length} active`
                  : "0 active"}
              </strong>
            </div>
          </div>

          {/* Net Margin / Commission */}
          <div className={`cockpit-card ${netAmount >= 0 ? "margin-highlight" : ""}`}>
            <div className="cockpit-header">
              <span className="cockpit-label">
                {t("section.commission", "Net Commission")}
              </span>
              <TrendingUp size={16} className="cockpit-icon" />
            </div>
            <div
              className={`cockpit-val ${netAmount < 0 ? "negative" : "positive"}`}
              data-testid="calculated-commission"
              aria-live="polite"
            >
              {money(netAmount)}
            </div>
            <div className="cockpit-sub">
              {marginPercent !== null && (
                <span className="cockpit-margin-badge">
                  {netAmount >= 0 ? `+${marginPercent}% Margin` : `${marginPercent}% Deficit`}
                </span>
              )}
              {p.purchase_price && p.selling_price && (
                <span>{netAmount >= 0 ? "Profitable" : "Below Cost"}</span>
              )}
            </div>
          </div>

          {/* Live Deal Balance */}
          <div className="cockpit-card">
            <div className="cockpit-header">
              <span className="cockpit-label">
                {t("payment.balances", "Outstanding")}
              </span>
              <Calculator size={16} className="cockpit-icon" />
            </div>
            <div className="cockpit-sub" style={{ marginTop: "4px" }}>
              <span>{t("balance.receivable_buyer", "From Buyer")}:</span>
              <strong data-testid="buyer-balance" style={{ color: "var(--gold)" }}>
                {buyerBalance}
              </strong>
            </div>
            <div className="cockpit-sub">
              <span>{t("balance.payable_seller", "To Seller")}:</span>
              <strong data-testid="seller-balance">
                {sellerBalance}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {netAmount < 0 && (
        <p className="field-error" role="status" data-testid="negative-commission-warning">
          {t("payment.negative_commission", "Selling below purchase + refurbishment price: this deal has a negative net commission.")}
        </p>
      )}

      {/* Visual Payment Method Selector */}
      <div className="wizard-group" style={{ paddingTop: 0 }}>
        <div className="section-title">
          <h2>{t("payment.select_method", "Select Payment Channel")}</h2>
          <span className="slot-count">
            <Sparkles size={12} style={{ display: "inline", marginRight: "4px" }} />
            Quick Touch Selection
          </span>
        </div>
        <div className="payment-methods-grid" data-testid="payment-methods-grid">
          {PAYMENT_METHODS.map((m) => {
            const isSelected = p.payment_method === m.id;
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                className={`payment-method-card ${isSelected ? "selected" : ""}`}
                onClick={() => updateSection("payments", "payment_method", m.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    updateSection("payments", "payment_method", m.id);
                  }
                }}
                data-testid={`payment-method-option-${m.id.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="payment-method-icon-wrap">
                  <Icon size={20} />
                </div>
                <div className="payment-method-title">{m.label}</div>
                <div className="payment-method-hint">{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Payment Inputs */}
      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.pricing_payments", "Pricing & payments")}</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="required-note">{t("section.required_fields", "* Required fields")}</span>
            <span className="slot-count">INR · ₹</span>
          </div>
        </div>
        <FieldGrid
          fields={paymentFields}
          prefix="payments"
          value={deal.payments}
          errors={errors}
          onChange={(key, value) => updateSection("payments", key, value)}
        />
      </section>

      {/* Mechanical Maintenance & Refurbishment Cost Section */}
      <MaintenanceSection
        deal={deal}
        updateSection={updateSection}
      />
    </div>
  );
};