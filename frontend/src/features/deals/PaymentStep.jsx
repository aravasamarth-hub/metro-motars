import { Calculator } from "lucide-react";
import { FieldGrid } from "./DealField";
import { paymentFields } from "./fieldConfig";
import { commission, money } from "./dealModel";
export const PaymentStep = ({ deal, updateSection, errors }) => {
  const amount = commission(deal.payments);
  return <>
    <section className="wizard-group"><div className="section-title"><h2>Pricing & payments</h2><span className="slot-count">INR · ₹</span></div><FieldGrid fields={paymentFields} prefix="payments" value={deal.payments} errors={errors} onChange={(key, value) => updateSection("payments", key, value)}/></section>
    <section className="commission-strip"><div><Calculator size={22}/><div><h2>Commission</h2><span>Selling price − Purchase price</span></div></div><output className={amount < 0 ? "negative-value" : ""} data-testid="calculated-commission" aria-live="polite">{money(amount)}</output></section>
    {amount < 0 && <p className="field-error" role="status" data-testid="negative-commission-warning">Selling below purchase price: this deal has a negative commission.</p>}
    <div className="payment-balances"><div><span>Balance payable to seller</span><strong data-testid="seller-balance">{deal.payments.purchase_price === "" ? "—" : money(Number(deal.payments.purchase_price) - Number(deal.payments.paid_to_seller))}</strong></div><div><span>Balance receivable from buyer</span><strong data-testid="buyer-balance">{deal.payments.selling_price === "" ? "—" : money(Number(deal.payments.selling_price) - Number(deal.payments.received_from_buyer))}</strong></div></div>
  </>;
};