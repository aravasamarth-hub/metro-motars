import { useLanguage } from "@/features/i18n/LanguageContext";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const day = (value, lang = "en") => {
  if (!value) return "—";
  const locale = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
  return new Date(String(value).includes("T") ? value : `${value}T12:00:00`).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
};

function Party({ party, testid, phoneLabel, idLabel, roleLabel }) {
  return <div className="bill-party" data-testid={testid}>
    <span className="bill-party-role">{roleLabel || party.role}</span>
    <b>{party.name || "—"}</b>
    {party.phone && <span>{phoneLabel}: {party.phone}</span>}
    {party.address && <span>{party.address}</span>}
    {party.id_details && <span>{idLabel}: {party.id_details}</span>}
  </div>;
}

export default function BillDocument({ doc }) {
  const { t, language } = useLanguage();
  if (!doc) return null;
  const { bill, deal, vehicle, parties, payment_lines: lines = [], witnesses = [], confidential } = doc;

  const vehicleRows = [
    [t("table.col_vehicle", "Vehicle"), "vehicle_name"],
    [t("billdoc.make_model", "Make / Model"), "make"],
    [t("field.year", "Year"), "year_of_manufacture"],
    [t("field.color", "Color"), "color"],
    [t("field.engine_number", "Engine No."), "engine_number"],
    [t("field.chassis_number", "Chassis No."), "chassis_number"],
    [t("field.vehicle_number", "Vehicle No."), "vehicle_number"],
    [t("field.registration_number", "Registration No."), "registration_number"],
    [t("field.insurance", "Insurance"), "insurance"],
  ];

  const getRoleLabel = (role) => {
    if (role === "Seller") return t("step.seller", "Seller");
    if (role === "Buyer") return t("step.buyer", "Buyer");
    return role;
  };

  const getStatusLabel = (status) => {
    if (status === "Sold") return t("status.sold", "Sold");
    if (status === "In Stock") return t("status.in_stock", "In Stock");
    return status;
  };

  return <article className="bill-doc" data-testid="bill-document">
    <header className="bill-doc-head">
      <div className="bill-brand"><div className="bill-brand-mark">MM</div><div><strong>METRO MOTORS</strong><small>RESELLING SHOWROOM · MOTORCYCLE SALE & PURCHASE</small></div></div>
      <div className="bill-doc-title">
        <b>{bill.bill_type === "Seller → Buyer" ? t("billdoc.sale_receipt", "SALE RECEIPT") : t("billdoc.purchase_receipt", "PURCHASE RECEIPT")}</b>
        <span>{bill.bill_type === "Seller → Buyer" ? t("bills.seller_to_buyer", "Seller → Buyer") : t("bills.seller_to_intermediate", "Seller → Intermediate")}</span>
      </div>
    </header>
    <div className="bill-meta">
      <span>{t("billdoc.bill_no", "Bill No.")} <b data-testid="bill-doc-number">{bill.bill_number}</b></span>
      <span>{t("billdoc.date", "Date")} <b>{day(bill.created_date, language)}</b></span>
      <span>{t("billdoc.deal_id", "Deal ID")} <b data-testid="bill-doc-deal">{deal.deal_id}</b></span>
      <span>{t("billdoc.status", "Status")} <b>{getStatusLabel(deal.status)}</b></span>
    </div>
    <section className="bill-block">
      <h4>{t("billdoc.vehicle_details", "Vehicle details")}</h4>
      <div className="bill-kv">{vehicleRows.map(([label, key]) => <span key={key}><i>{label}</i><b>{key === "make" ? `${vehicle.make || ""} ${vehicle.model || ""}`.trim() || "—" : vehicle[key] || "—"}</b></span>)}</div>
    </section>
    <section className="bill-block">
      <h4>{t("billdoc.parties", "Parties")}</h4>
      <div className="bill-parties">
        <Party party={parties.from} testid="bill-party-from" phoneLabel={t("billdoc.phone", "Phone")} idLabel={t("billdoc.id", "ID")} roleLabel={getRoleLabel(parties.from.role)}/>
        <Party party={parties.to} testid="bill-party-to" phoneLabel={t("billdoc.phone", "Phone")} idLabel={t("billdoc.id", "ID")} roleLabel={getRoleLabel(parties.to.role)}/>
      </div>
    </section>
    <section className="bill-block">
      <h4>{t("billdoc.payment_details", "Payment details")}</h4>
      <table className="bill-table"><thead><tr><th>{t("billdoc.date", "Date")}</th><th>{t("billdoc.col_received_paid", "Received from / Paid to")}</th><th>{t("billdoc.col_mode", "Mode / Type")}</th><th>{t("billdoc.status", "Status")}</th><th className="right">{t("billdoc.col_amount", "Amount")}</th></tr></thead>
        <tbody>{lines.length ? lines.map((line, index) => <tr key={index} data-testid={`bill-doc-line-${index}`}><td>{day(line.payment_date, language)}</td><td>{line.person || "—"}</td><td>{line.payment_type}{line.notes ? ` · ${line.notes}` : ""}</td><td>{line.payment_status}</td><td className="right">{money(line.amount)}</td></tr>) : <tr><td colSpan={5}>{t("billdoc.no_payment_entries", "No payment entries recorded for this document.")}</td></tr>}</tbody>
        <tfoot><tr><td colSpan={4}>{t("billdoc.total", "Total")}</td><td className="right" data-testid="bill-doc-total">{money(doc.total_amount)}</td></tr></tfoot>
      </table>
      <p className="bill-words" data-testid="bill-doc-words">{t("billdoc.amount_in_words", "Amount in words:")} <b>{doc.total_in_words}</b></p>
    </section>
    {confidential && <section className="bill-block bill-confidential" data-testid="bill-doc-confidential">
      <h4>{t("billdoc.internal_record", "Internal record (office use only)")}</h4>
      <div className="bill-kv"><span><i>{t("finances.purchase_total", "Purchase total")}</i><b>{money(confidential.purchase_total)}</b></span><span><i>{t("finances.selling_total", "Sale total")}</i><b>{money(confidential.sale_total)}</b></span><span><i>{t("finances.commission", "Commission")}</i><b>{money(confidential.commission)}</b></span><span><i>{t("summary.balance", "Margin")}</i><b>{money(confidential.margin)}</b></span></div>
    </section>}
    <section className="bill-block">
      <p className="bill-declaration">{t("billdoc.declaration", "The vehicle described above is transferred in its present condition. Both parties confirm the details, amounts and identification records stated in this document are correct.")}</p>
      <div className="bill-signs">
        <div><span/><small>{getRoleLabel(parties.from.role)} {t("billdoc.signature", "signature")}</small></div>
        <div><span/><small>{getRoleLabel(parties.to.role)} {t("billdoc.signature", "signature")}</small></div>
        {witnesses.slice(0, 2).map((witness, index) => <div key={index}><span/><small>{t("billdoc.witness", "Witness")} {index + 1}{witness.name ? ` · ${witness.name}` : ""}</small></div>)}
        <div><span/><small>{t("billdoc.for_metro_motors", "For Metro Motors")}</small></div>
      </div>
    </section>
  </article>;
}
