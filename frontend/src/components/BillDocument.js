const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const day = value => (value ? String(value).slice(0, 10).split("-").reverse().join("/") : "—");

const vehicleRows = [["Vehicle", "vehicle_name"], ["Make / Model", "make"], ["Year", "year_of_manufacture"], ["Color", "color"], ["Engine No.", "engine_number"], ["Chassis No.", "chassis_number"], ["Vehicle No.", "vehicle_number"], ["Registration No.", "registration_number"], ["Insurance", "insurance"]];

function Party({ party, testid }) {
  return <div className="bill-party" data-testid={testid}>
    <span className="bill-party-role">{party.role}</span>
    <b>{party.name || "—"}</b>
    {party.phone && <span>Phone: {party.phone}</span>}
    {party.address && <span>{party.address}</span>}
    {party.id_details && <span>ID: {party.id_details}</span>}
  </div>;
}

export default function BillDocument({ doc }) {
  if (!doc) return null;
  const { bill, deal, vehicle, parties, payment_lines: lines = [], witnesses = [], confidential } = doc;
  return <article className="bill-doc" data-testid="bill-document">
    <header className="bill-doc-head">
      <div className="bill-brand"><div className="bill-brand-mark">MM</div><div><strong>METRO MOTORS</strong><small>RESELLING SHOWROOM · MOTORCYCLE SALE & PURCHASE</small></div></div>
      <div className="bill-doc-title"><b>{bill.bill_type === "Seller → Buyer" ? "SALE RECEIPT" : "PURCHASE RECEIPT"}</b><span>{bill.bill_type}</span></div>
    </header>
    <div className="bill-meta">
      <span>Bill No. <b data-testid="bill-doc-number">{bill.bill_number}</b></span>
      <span>Date <b>{day(bill.created_date)}</b></span>
      <span>Deal ID <b data-testid="bill-doc-deal">{deal.deal_id}</b></span>
      <span>Status <b>{deal.status}</b></span>
    </div>
    <section className="bill-block">
      <h4>Vehicle details</h4>
      <div className="bill-kv">{vehicleRows.map(([label, key]) => <span key={key}><i>{label}</i><b>{key === "make" ? `${vehicle.make || ""} ${vehicle.model || ""}`.trim() || "—" : vehicle[key] || "—"}</b></span>)}</div>
    </section>
    <section className="bill-block">
      <h4>Parties</h4>
      <div className="bill-parties"><Party party={parties.from} testid="bill-party-from"/><Party party={parties.to} testid="bill-party-to"/></div>
    </section>
    <section className="bill-block">
      <h4>Payment details</h4>
      <table className="bill-table"><thead><tr><th>Date</th><th>Received from / Paid to</th><th>Mode / Type</th><th>Status</th><th className="right">Amount</th></tr></thead>
        <tbody>{lines.length ? lines.map((line, index) => <tr key={index} data-testid={`bill-doc-line-${index}`}><td>{day(line.payment_date)}</td><td>{line.person || "—"}</td><td>{line.payment_type}{line.notes ? ` · ${line.notes}` : ""}</td><td>{line.payment_status}</td><td className="right">{money(line.amount)}</td></tr>) : <tr><td colSpan={5}>No payment entries recorded for this document.</td></tr>}</tbody>
        <tfoot><tr><td colSpan={4}>Total</td><td className="right" data-testid="bill-doc-total">{money(doc.total_amount)}</td></tr></tfoot>
      </table>
      <p className="bill-words" data-testid="bill-doc-words">Amount in words: <b>{doc.total_in_words}</b></p>
    </section>
    {confidential && <section className="bill-block bill-confidential" data-testid="bill-doc-confidential">
      <h4>Internal record (office use only)</h4>
      <div className="bill-kv"><span><i>Purchase total</i><b>{money(confidential.purchase_total)}</b></span><span><i>Sale total</i><b>{money(confidential.sale_total)}</b></span><span><i>Commission</i><b>{money(confidential.commission)}</b></span><span><i>Margin</i><b>{money(confidential.margin)}</b></span></div>
    </section>}
    <section className="bill-block">
      <p className="bill-declaration">The vehicle described above is transferred in its present condition. Both parties confirm the details, amounts and identification records stated in this document are correct.</p>
      <div className="bill-signs">
        <div><span/><small>{parties.from.role} signature</small></div>
        <div><span/><small>{parties.to.role} signature</small></div>
        {witnesses.slice(0, 2).map((witness, index) => <div key={index}><span/><small>Witness {index + 1}{witness.name ? ` · ${witness.name}` : ""}</small></div>)}
        <div><span/><small>For Metro Motors</small></div>
      </div>
    </section>
  </article>;
}
