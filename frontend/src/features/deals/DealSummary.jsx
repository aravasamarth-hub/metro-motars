import { Pencil } from "lucide-react";
import { commission, money } from "./dealModel";
import { DealField } from "./DealField";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const DealSummary = ({ deal, edit }) => {
  const { t } = useLanguage();

  const rows = [
    [t("step.vehicle", "Vehicle"), `${deal.vehicle.vehicle_name || "—"} · ${deal.vehicle.vehicle_number || "—"}`, 0],
    [t("step.seller", "Seller"), deal.seller.is_dealer ? `${deal.seller.name} · ${deal.seller.dealer_name}` : deal.seller.name || "—", 1],
    [t("step.buyer", "Buyer"), deal.buyer.name || t("summary.not_assigned", "Not assigned"), 2],
    [t("section.seller_witness", "Seller witness"), deal.witnesses[0].name || t("summary.not_recorded", "Not recorded"), 1],
    [t("section.buyer_witness", "Buyer witness"), deal.witnesses[1].name || t("summary.not_recorded", "Not recorded"), 2],
    [t("field.purchase_price", "Purchase price"), money(deal.payments.purchase_price), 4],
    [t("field.selling_price", "Selling price"), money(deal.payments.selling_price), 4],
    [t("section.commission", "Commission"), money(commission(deal.payments)), 4],
    [t("photo.photos_count", "Photos"), `${Object.values(deal.photos).filter(Boolean).length} / 32 ${t("summary.attached", "attached")}`, 0],
  ];

  if (deal.agent?.name) {
    const bal = deal.agent.amount_balance !== "" && deal.agent.amount_balance != null
      ? Number(deal.agent.amount_balance)
      : Math.max(0, (Number(deal.agent.total_amount) || 0) - (Number(deal.agent.amount_paid) || 0));
    rows.push([
      t("step.agent", "Agent"),
      `${deal.agent.name}${deal.agent.task ? ` · ${deal.agent.task}` : ""} · ${t("summary.balance", "Balance")}: ${money(bal)}`,
      3
    ]);
  }

  return (
    <dl className="deal-summary-grid">
      {rows.map(([label, value, step]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd data-testid={`summary-${label.toLowerCase().replaceAll(" ", "-")}`}>
            {value}
            {edit && (
              <button
                type="button"
                className="icon-button"
                onClick={() => edit(step)}
                title={`${t("summary.edit", "Edit")} ${label}`}
                aria-label={`${t("summary.edit", "Edit")} ${label}`}
                data-testid={`summary-edit-${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                <Pencil size={13}/>
              </button>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export const ReviewStep = ({ deal, update, edit }) => {
  const { t } = useLanguage();

  return (
    <>
      <h2 className="seller-step-title">{t("step.notes_save", "Notes & Save")}</h2>

      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.deal_summary", "Deal summary")}</h2>
          <span className="status-pill gold" data-testid="summary-bill-number">{deal.bill_number}</span>
        </div>
        <DealSummary deal={deal} edit={edit}/>
      </section>

      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.deal_status", "Deal status")}</h2>
        </div>
        <div className="form-grid wizard-fields">
          <DealField config={{ key: "status", label: "Stock status", type: "select", options: ["In Stock", "Out of Stock", "Sold"] }} prefix="review" value={deal.status} onChange={update}/>
          <DealField config={{ key: "rc_status", label: "RC transfer status", type: "select", options: ["Pending", "Completed"] }} prefix="review" value={deal.rc_status} onChange={update}/>
        </div>
      </section>

      <section className="wizard-group">
        <div className="section-title">
          <h2>{t("section.notes_remarks", "Notes & remarks")}</h2>
        </div>
        <DealField config={{ key: "notes", label: "Notes & remarks", type: "textarea" }} prefix="deal" value={deal.notes} onChange={update}/>
      </section>
    </>
  );
};