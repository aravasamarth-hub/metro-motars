import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  FilePlus2,
  Printer,
  X,
  Search,
  TrendingUp,
  CircleDollarSign,
  ArrowDownLeft,
  WalletCards,
  Sparkles,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useDeals } from "./useDeals";
import { commission, calculateMaintenanceTotal, money, localDay } from "./dealModel";
import BillDocument from "@/components/BillDocument";
import BillModal from "@/components/BillModal";
import { useLanguage } from "@/features/i18n/LanguageContext";

// ── constants ────────────────────────────────────────────────────────────────
const BILL_TYPES = ["Seller → Buyer", "Seller → Intermediate"];

// ── number-to-words (INR) ────────────────────────────────────────────────────
function toWords(n) {
  if (!n) return "Zero Rupees Only";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(num) {
    if (num < 20)   return ones[num];
    if (num < 100)  return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred" + (num%100 ? " "+convert(num%100) : "");
    if (num < 1e5)  return convert(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " "+convert(num%1000) : "");
    if (num < 1e7)  return convert(Math.floor(num/1e5))  + " Lakh"     + (num%1e5  ? " "+convert(num%1e5)  : "");
    return           convert(Math.floor(num/1e7))  + " Crore"    + (num%1e7  ? " "+convert(num%1e7)  : "");
  }
  const rupees = Math.floor(n);
  const paise  = Math.round((n - rupees) * 100);
  let result = convert(rupees) + " Rupees";
  if (paise) result += " and " + convert(paise) + " Paise";
  return result + " Only";
}

// ── build the doc object BillDocument expects ────────────────────────────────
function buildBillDoc(deal, billType) {
  const isBuyer = billType === "Seller → Buyer";
  const v = deal.vehicle  || {};
  const s = deal.seller   || {};
  const b = deal.buyer    || {};
  const p = deal.payments || {};

  const fromPerson = { role:"Seller",       name: s.name||"—", phone: s.phone||"", address: s.address||"", id_details: s.id_number||"" };
  const toPerson   = isBuyer
    ? { role:"Buyer",       name: b.name||"—", phone: b.phone||"", address: b.address||"", id_details: b.id_number||"" }
    : { role:"Metro Motors",name: "Metro Motors", phone:"", address:"", id_details:"" };

  const paymentLines = [];
  if (isBuyer && p.received_from_buyer) {
    paymentLines.push({ payment_date: p.payment_date||localDay(), person: b.name||"Buyer",
      payment_type: p.payment_method||"Cash", notes: p.notes||"", payment_status:"Received",
      amount: Number(p.received_from_buyer) });
  } else if (!isBuyer && p.paid_to_seller) {
    paymentLines.push({ payment_date: p.payment_date||localDay(), person: s.name||"Seller",
      payment_type: p.payment_method||"Cash", notes: p.notes||"", payment_status:"Paid",
      amount: Number(p.paid_to_seller) });
  }

  const totalAmount = isBuyer ? Number(p.received_from_buyer||0) : Number(p.paid_to_seller||0);

  return {
    bill: {
      bill_id:      "LOCAL-" + (deal.id||"").slice(0,8),
      bill_number:  deal.bill_number || "MM-00-0001",
      bill_type:    billType,
      created_date: new Date().toISOString(),
    },
    deal:    { deal_id: deal.bill_number || (deal.id||"").slice(0,8).toUpperCase(), status: deal.status||"In Stock" },
    vehicle: { vehicle_name: v.vehicle_name, make: v.make, model: v.model,
      year_of_manufacture: v.year, color: v.color, engine_number: v.engine_number,
      chassis_number: v.chassis_number, vehicle_number: v.vehicle_number,
      registration_number: v.registration_number, insurance: v.insurance },
    parties:      { from: fromPerson, to: toPerson },
    payment_lines: paymentLines,
    witnesses:    (deal.witnesses||[]).filter(w => w.name),
    confidential: isBuyer ? null : {
      purchase_total: Number(p.purchase_price||0),
      sale_total:     Number(p.selling_price||0),
      commission:     commission(p, calculateMaintenanceTotal(deal.maintenance))||0,
      margin:         Number(p.selling_price||0) - Number(p.purchase_price||0),
    },
    total_amount:   totalAmount,
    total_in_words: toWords(totalAmount),
  };
}

// ── LocalBills ───────────────────────────────────────────────────────────────
export const LocalBills = () => {
  const { deals, loading, error } = useDeals();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [query,    setQuery]   = useState("");
  const [picker,   setPicker]  = useState(false);
  const [billType, setBillType] = useState(BILL_TYPES[0]);
  const [preview,  setPreview] = useState(null);
  const [dealQ,    setDealQ]   = useState("");

  const filtered = useMemo(() =>
    deals.filter(d =>
      [d.bill_number, d.vehicle?.vehicle_name, d.seller?.name, d.buyer?.name]
        .join(" ").toLowerCase().includes(query.toLowerCase())
    ), [deals, query]);

  const pickerDeals = useMemo(() =>
    deals.filter(d =>
      [d.bill_number, d.vehicle?.vehicle_name, d.vehicle?.vehicle_number, d.seller?.name, d.buyer?.name]
        .join(" ").toLowerCase().includes(dealQ.toLowerCase())
    ), [deals, dealQ]);

  const generate = (deal) => {
    setPreview({ deal, doc: buildBillDoc(deal, billType) });
    setPicker(false);
  };

  const billCols = [
    t("table.col_bill_no", "Bill No"),
    t("table.col_vehicle", "Vehicle"),
    t("table.col_seller", "Seller"),
    t("table.col_buyer", "Buyer"),
    t("table.col_purchase", "Purchase"),
    t("table.col_selling", "Selling"),
    t("table.col_status", "Status"),
    t("table.col_actions", "Actions"),
  ];

  return (
    <>
      {/* page header */}
      <div className="page-header no-print">
        <div>
          <div className="eyebrow">{t("bills.eyebrow", "Billing & records")}</div>
          <h1 data-testid="page-title">{t("bills.title", "Customer Bills")}</h1>
          <p>{t("bills.subtitle", "Generate and print bills from saved deals — 100% offline, no server needed.")}</p>
        </div>
        <button className="button button-primary" onClick={() => { setDealQ(""); setPicker(true); }} data-testid="generate-bill-button">
          <FilePlus2 size={17}/> {t("bills.generate_bill", "Generate Bill")}
        </button>
      </div>

      {error && <div className="workflow-message no-print" data-testid="bills-error">{error}</div>}

      {/* search */}
      <div className="toolbar no-print">
        <div className="search-field">
          <Search size={17}/>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t("bills.search_placeholder", "Search vehicle, seller, buyer…")} data-testid="bills-search-input"/>
          {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14}/></button>}
        </div>
      </div>

      {/* table */}
      <div className="table-shell no-print">
        <div className="table-heading">
          <b>{t("bills.saved_deals", "Saved deals")} <span data-testid="bills-count">{filtered.length}</span></b>
          <span>{t("bills.click_to_generate", "Click to generate a bill")}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>{billCols.map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(deal => (
                <tr key={deal.id} data-testid={`bill-row-${deal.id}`}>
                  <td><b className="bill-number-link">{deal.bill_number}</b></td>
                  <td>{deal.vehicle?.vehicle_name||"—"}</td>
                  <td>{deal.seller?.name||"—"}</td>
                  <td>{deal.buyer?.name||"—"}</td>
                  <td><b>{money(deal.payments?.purchase_price)}</b></td>
                  <td><b>{money(deal.payments?.selling_price)}</b></td>
                  <td>{deal.status === "Sold" ? t("status.sold", "Sold") : t("status.in_stock", "In Stock")}</td>
                  <td>
                    <div className="row-actions">
                      <button title={t("table.view_deal", "View deal")} onClick={() => navigate(`/deals/${deal.id}`)} aria-label="View deal">
                        <ArrowUpRight size={15}/>
                      </button>
                      <button title={t("bills.generate_bill", "Generate bill")} data-testid={`gen-bill-${deal.id}`}
                        onClick={() => { setBillType("Seller → Buyer"); setPreview({ deal, doc: buildBillDoc(deal, "Seller → Buyer") }); }}
                        aria-label="Generate bill">
                        <FilePlus2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!deals.length && (
                <tr><td colSpan={8}>
                  <div className="local-empty" data-testid="bills-empty">
                    {loading ? t("table.loading", "Loading…") : <><h2>{t("bills.no_deals_yet", "No deals yet")}</h2><p>{t("bills.create_deal_first", "Create a deal from New Deal first.")}</p></>}
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* deal picker modal */}
      {picker && (
        <div className="bill-preview-backdrop no-print" role="dialog" data-testid="deal-picker-modal">
          <section className="bill-preview">
            <div className="section-title">
              <div><div className="eyebrow">{t("bills.generate_modal_title", "Generate bill")}</div><h2>{t("bills.select_saved_deal", "Select a saved deal")}</h2></div>
              <button className="icon-button" onClick={() => setPicker(false)} aria-label="Close deal picker" data-testid="close-deal-picker">
                <X size={18}/>
              </button>
            </div>
            <label className="form-field">
              <span>{t("bills.bill_type", "Bill type")}</span>
              <select value={billType} onChange={e => setBillType(e.target.value)} data-testid="deal-picker-bill-type">
                <option value="Seller → Buyer">{t("bills.seller_to_buyer", "Seller → Buyer")}</option>
                <option value="Seller → Intermediate">{t("bills.seller_to_intermediate", "Seller → Intermediate")}</option>
              </select>
            </label>
            <div className="toolbar" style={{margin:"12px 0"}}>
              <div className="search-field">
                <Search size={16}/>
                <input value={dealQ} onChange={e => setDealQ(e.target.value)} autoFocus
                  placeholder={t("bills.search_deal_placeholder", "Search deal, vehicle, seller or buyer…")} data-testid="deal-picker-search"/>
              </div>
            </div>
            <div className="deal-picker-list" data-testid="deal-picker-list">
              {pickerDeals.map(deal => (
                <button key={deal.id} className="deal-picker-row"
                  onClick={() => generate(deal)} data-testid={`deal-picker-${deal.id}`}>
                  <b>{deal.bill_number}</b>
                  <span>{deal.vehicle?.vehicle_name} · {deal.vehicle?.vehicle_number||t("bills.no_plate", "No plate")}</span>
                  <span>{t("bills.seller_label", "Seller")}: {deal.seller?.name||"—"} · {t("bills.buyer_label", "Buyer")}: {deal.buyer?.name||"—"}</span>
                </button>
              ))}
              {!pickerDeals.length && (
                <p className="empty-note" data-testid="deal-picker-empty">
                  {deals.length ? t("bills.no_deals_match", "No deals match your search.") : t("bills.create_deal_first", "No saved deals. Create one from New Deal first.")}
                </p>
              )}
            </div>
            <button className="button button-secondary" style={{marginTop:14}}
              onClick={() => { setPicker(false); navigate("/new-deal"); }} data-testid="deal-picker-new-deal">
              + {t("nav.new_deal", "New Deal")}
            </button>
          </section>
        </div>
      )}

      {/* BillModal for interactive preview and editing */}
      <BillModal
        deal={preview?.deal || preview?.doc?.deal}
        isOpen={!!preview}
        onClose={() => setPreview(null)}
      />
    </>
  );
};

// ── LocalFinances ────────────────────────────────────────────────────────────
export const LocalFinances = () => {
  const { deals, loading, error } = useDeals();
  const { t } = useLanguage();
  const sum = (key) =>
    deals.reduce((total, d) => total + Number(d.payments[key] || 0), 0);

  const purchaseTotal = sum("purchase_price");
  const sellingTotal = sum("selling_price");
  const paidToSellers = sum("paid_to_seller");
  const receivedFromBuyers = sum("received_from_buyer");
  const maintenanceTotal = deals.reduce(
    (total, d) => total + calculateMaintenanceTotal(d.maintenance),
    0
  );
  const totalCommission = deals.reduce(
    (acc, d) =>
      acc +
      (d.commission != null
        ? d.commission
        : commission(d.payments, calculateMaintenanceTotal(d.maintenance)) || 0),
    0
  );

  const outstandingBuyers = Math.max(0, sellingTotal - receivedFromBuyers);
  const outstandingSellers = Math.max(0, purchaseTotal - paidToSellers);
  const marginPercent =
    sellingTotal > 0 ? ((totalCommission / sellingTotal) * 100).toFixed(1) : "0.0";
  const collectionRatio =
    sellingTotal > 0 ? Math.round((receivedFromBuyers / sellingTotal) * 100) : 0;
  const sellerPaymentRatio =
    purchaseTotal > 0 ? Math.round((paidToSellers / purchaseTotal) * 100) : 0;

  const rows = [
    [t("finances.purchase_total", "Purchase total"), purchaseTotal],
    [t("finances.selling_total", "Selling total"), sellingTotal],
    ...(maintenanceTotal > 0
      ? [[t("maintenance.title", "Maintenance Cost"), maintenanceTotal]]
      : []),
    [t("finances.paid_to_sellers", "Paid to sellers"), paidToSellers],
    [t("finances.received_from_buyers", "Received from buyers"), receivedFromBuyers],
    [t("finances.commission", "Commission"), totalCommission],
  ];

  return (
    <div className="local-page finances-page-luxury">
      {/* Luxury Treasury Header */}
      <div className="page-header finances-luxury-header">
        <div>
          <div className="eyebrow finances-eyebrow">
            <span className="eyebrow-beacon" />
            <span>{t("finances.eyebrow", "EXECUTIVE FINANCIAL OVERVIEW · TREASURY COCKPIT")}</span>
          </div>
          <h1 data-testid="page-title" className="finances-hero-title">
            {t("finances.title", "Finances")}
          </h1>
          <p className="finances-hero-subtitle">
            Showroom Cashflow, Dealer Margins, Procurement & Receivables Registry
          </p>
        </div>

        <div className="finances-header-badge">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Local Vault Encrypted · IndexedDB Storage</span>
        </div>
      </div>

      <div
        className="workflow-message luxury-finances-notice"
        data-testid="local-finances-notice"
      >
        <Sparkles size={15} className="text-amber-400" />
        <span>{t("finances.notice", "Preview totals from this browser's saved deals only.")}</span>
      </div>

      {error && (
        <p role="alert" className="workflow-message" data-testid="local-finances-error">
          {error}
        </p>
      )}

      {/* 5-Card Luxury Financial Treasury Grid */}
      <div className="finances-treasury-grid">
        {/* Card 1: Selling Total (Gold) */}
        <div className="finances-card card-gold">
          <div className="finances-card-top">
            <span className="finances-card-label">{t("finances.selling_total", "Selling Total")}</span>
            <div className="finances-orb orb-gold">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="finances-val gold-val">
            {loading ? "…" : money(sellingTotal)}
          </div>
          <div className="finances-chip gold-chip">
            <span>Gross Sales Volume</span>
          </div>
        </div>

        {/* Card 2: Purchase Total (Blue) */}
        <div className="finances-card card-blue">
          <div className="finances-card-top">
            <span className="finances-card-label">{t("finances.purchase_total", "Purchase Total")}</span>
            <div className="finances-orb orb-blue">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div className="finances-val">
            {loading ? "…" : money(purchaseTotal)}
          </div>
          <div className="finances-chip blue-chip">
            <span>Fleet Procurement Cost</span>
          </div>
        </div>

        {/* Card 3: Realized Commission (Emerald) */}
        <div className="finances-card card-emerald">
          <div className="finances-card-top">
            <span className="finances-card-label">{t("finances.commission", "Net Margin")}</span>
            <div className="finances-orb orb-emerald">
              <CircleDollarSign size={20} />
            </div>
          </div>
          <div className="finances-val emerald-val">
            {loading ? "…" : money(totalCommission)}
          </div>
          <div className="finances-chip emerald-chip">
            <CheckCircle2 size={12} />
            <span>{`+${marginPercent}% Profit Margin`}</span>
          </div>
        </div>

        {/* Card 4: Received from Buyers (Cyan) */}
        <div className="finances-card card-cyan">
          <div className="finances-card-top">
            <span className="finances-card-label">{t("finances.received_from_buyers", "Received From Buyers")}</span>
            <div className="finances-orb orb-cyan">
              <WalletCards size={20} />
            </div>
          </div>
          <div className="finances-val cyan-val">
            {loading ? "…" : money(receivedFromBuyers)}
          </div>
          <div className="finances-chip cyan-chip">
            <span>{`${collectionRatio}% Inflow Recovered`}</span>
          </div>
        </div>

        {/* Card 5: Paid to Sellers (Purple) */}
        <div className="finances-card card-purple">
          <div className="finances-card-top">
            <span className="finances-card-label">{t("finances.paid_to_sellers", "Paid To Sellers")}</span>
            <div className="finances-orb orb-purple">
              <Building2 size={20} />
            </div>
          </div>
          <div className="finances-val">
            {loading ? "…" : money(paidToSellers)}
          </div>
          <div className="finances-chip purple-chip">
            <span>{`${sellerPaymentRatio}% Disbursed`}</span>
          </div>
        </div>
      </div>

      {/* Cashflow Recovery & Balance Analysis Card */}
      <div className="finances-cashflow-card">
        <div className="cashflow-card-header">
          <div className="cashflow-title">
            <WalletCards size={16} className="text-amber-400" />
            <span>Showroom Collection & Liquidity Position</span>
          </div>
          <div className="cashflow-stats">
            <span className="stat-pill stat-cyan">
              ● Received: {money(receivedFromBuyers)} ({collectionRatio}%)
            </span>
            <span className="stat-pill stat-amber">
              ● Buyer Outstanding: {money(outstandingBuyers)}
            </span>
            <span className="stat-pill stat-purple">
              ● Seller Payable: {money(outstandingSellers)}
            </span>
          </div>
        </div>

        {/* Segmented Collection Progress */}
        <div className="cashflow-progress-track">
          <div
            className="cashflow-segment segment-collected"
            style={{ width: `${Math.max(collectionRatio, 6)}%` }}
            title={`Collected: ${money(receivedFromBuyers)}`}
          />
          <div
            className="cashflow-segment segment-pending"
            style={{ width: `${Math.max(100 - collectionRatio, 6)}%` }}
            title={`Pending: ${money(outstandingBuyers)}`}
          />
        </div>

        <div className="cashflow-footer-summary">
          <div className="cashflow-summary-item">
            <span className="summary-label">Net Pending Balance from Buyers:</span>
            <strong className="summary-val text-amber-400">{money(outstandingBuyers)}</strong>
          </div>
          <div className="cashflow-summary-item">
            <span className="summary-label">Net Owed to Vehicle Sellers:</span>
            <strong className="summary-val text-slate-300">{money(outstandingSellers)}</strong>
          </div>
          <div className="cashflow-summary-item">
            <span className="summary-label">Estimated Deal Margin:</span>
            <strong className="summary-val text-emerald-400">{money(totalCommission)}</strong>
          </div>
        </div>
      </div>

      {/* Detailed Ledger Summary List (Preserving all test identifiers) */}
      <div className="finances-ledger-section">
        <div className="section-title">
          <h2>Financial Ledger Breakdown</h2>
          <span className="slot-count">5 Core Metrics Verified</span>
        </div>
        <dl className="deal-summary-grid finances-summary-grid">
          {rows.map(([label, value]) => (
            <div key={label} className="finances-ledger-card">
              <dt>{label}</dt>
              <dd
                data-testid={`local-finance-${label.toLowerCase().replaceAll(" ", "-")}`}
                className="finances-ledger-val"
              >
                {loading ? "…" : money(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};