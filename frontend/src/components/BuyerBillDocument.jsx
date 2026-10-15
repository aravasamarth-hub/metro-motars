import React from "react";
import "./BuyerBillDocument.css";
import { convertToIndianWords } from "@/utils/numberToWords";

// Helpers
export function formatINR(val) {
  if (val === "" || val === null || val === undefined) return "—";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return "₹" + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

export function formatCurrency(val) {
  if (val === "" || val === null || val === undefined) return "—";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return "₹ " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} / ${month} / ${year}`;
  }
  const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = clean.split("-");
  if (parts.length === 3) {
    return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
  }
  return dateStr;
}

export function maskAadhaar(val) {
  if (!val) return "—";
  const cleaned = String(val).replace(/\s+/g, "");
  if (/^\d{12}$/.test(cleaned)) {
    return `•••• •••• ${cleaned.slice(8)}`;
  }
  return val;
}

export function calculateBuyerBillFinancials(payments = {}) {
  const rawSellingPrice = payments.selling_price ?? "";
  const rawDiscount = payments.discount ?? 0;
  const rawAdditional = payments.additional_charges ?? 0;
  const rawReceived = payments.received_from_buyer ?? payments.advance_amount ?? "";

  const sellingPrice = rawSellingPrice !== "" && !isNaN(Number(rawSellingPrice)) ? Number(rawSellingPrice) : 0;
  const discount = rawDiscount !== "" && !isNaN(Number(rawDiscount)) ? Number(rawDiscount) : 0;
  const additionalCharges = rawAdditional !== "" && !isNaN(Number(rawAdditional)) ? Number(rawAdditional) : 0;

  // Final Invoice Amount = Vehicle Selling Price - Discount + Additional Charges
  const finalInvoiceAmount = Math.max(0, sellingPrice - discount + additionalCharges);

  const totalReceived = rawReceived !== "" && !isNaN(Number(rawReceived)) ? Number(rawReceived) : 0;
  const remainingBalance = Math.max(0, finalInvoiceAmount - totalReceived);

  let paymentStatus = "Pending";
  if (finalInvoiceAmount > 0 && totalReceived >= finalInvoiceAmount) {
    paymentStatus = "Paid";
  } else if (totalReceived > 0 && totalReceived < finalInvoiceAmount) {
    paymentStatus = "Partially Paid";
  } else if (finalInvoiceAmount === 0 && totalReceived > 0) {
    paymentStatus = "Advance Paid";
  } else if (totalReceived > finalInvoiceAmount && finalInvoiceAmount > 0) {
    paymentStatus = "Credit / Overpaid";
  }

  const amountInWords = finalInvoiceAmount > 0 ? convertToIndianWords(finalInvoiceAmount) : "Zero Rupees Only";

  const advanceAmount =
    payments.advance_amount !== undefined && payments.advance_amount !== "" && !isNaN(Number(payments.advance_amount))
      ? Number(payments.advance_amount)
      : totalReceived;

  return {
    sellingPrice,
    discount,
    additionalCharges,
    finalInvoiceAmount,
    totalReceived,
    remainingBalance,
    paymentStatus,
    amountInWords,
    advanceAmount,
  };
}

export default function BuyerBillDocument({ deal = {} }) {
  const seller = deal?.seller || {};
  const buyer = deal?.buyer || {};
  const vehicle = deal?.vehicle || {};
  const payments = deal?.payments || {};
  const photos = deal?.photos || {};

  // Financial calculations strictly for Buyer Transaction
  const {
    finalInvoiceAmount,
    totalReceived: receivedNum,
    remainingBalance: balanceNum,
    paymentStatus,
    amountInWords: invoiceAmountInWords,
    advanceAmount,
  } = calculateBuyerBillFinancials(payments);

  // Photo resolution helper
  const getPhotoSrc = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (val.dataUrl) return val.dataUrl;
    if (val.url) return val.url;
    if (val.src) return val.src;
    if (val.blob) {
      try {
        return URL.createObjectURL(val.blob);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const vehiclePhotoSrc = getPhotoSrc(
    photos["vehicle-1"] || photos["vehicle_front"] || vehicle.photo
  );

  const buyerPhotoSrc = getPhotoSrc(
    photos["buyer-1"] || photos["buyer-portrait"] || photos["buyer_photo"] || buyer.photo
  );
  const buyerSignSrc = getPhotoSrc(
    photos["buyer-signature"] || photos["buyer_signature"] || buyer.signature
  );
  const buyerThumbSrc = getPhotoSrc(
    photos["buyer-thumb"] || photos["buyer-thumb-impression"] || buyer.thumb
  );

  const sellerPhotoSrc = getPhotoSrc(
    photos["seller-1"] || photos["seller-portrait"] || photos["seller_photo"] || seller.photo
  );
  const sellerSignSrc = getPhotoSrc(
    photos["seller-signature"] || photos["seller_signature"] || seller.signature
  );
  const sellerThumbSrc = getPhotoSrc(
    photos["seller-thumb"] || photos["seller-thumb-impression"] || seller.thumb
  );

  // Bill number: use buyer_bill_number if present, or adapt bill_number to BB prefix
  const rawBillNumber = deal.buyer_bill_number || deal.bill_number || deal.billNumber || "BB-001";
  const billNumber = rawBillNumber.startsWith("Bill-") ? rawBillNumber.replace("Bill-", "BB-") : rawBillNumber;

  const dealId = deal.id ? (deal.id.startsWith("deal-") ? deal.id : deal.id.slice(0, 10).toUpperCase()) : "DEAL-NEW";
  const txDate = formatDate(payments.payment_date || deal.created_at);
  const mfgYear = [vehicle.mfg_month, vehicle.year].filter(Boolean).join(" ");
  const regNumber = vehicle.registration_number || vehicle.vehicle_number || "";

  return (
    <div className="buyer-bill-wrapper" id="buyer-bill-print-target">
      <div className="buyer-bill-sheet" data-testid="buyer-bill-sheet">
        {/* ===================== TOP HEADER ===================== */}
        <header className="bb-header">
          {/* Logo & Tagline */}
          <div className="bb-header-logo-box">
            <svg className="bb-header-logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bbGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd978" />
                  <stop offset="50%" stopColor="#e5b94c" />
                  <stop offset="100%" stopColor="#c69628" />
                </linearGradient>
                <linearGradient id="bbNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="100%" stopColor="#0b1726" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="14" fill="url(#bbNavyGrad)" />
              <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="url(#bbGoldGrad)" strokeWidth="2.5" />
              <path d="M12 44 L12 22 L18 22 L23 33 L28 22 L34 22 L34 44 L29 44 L29 31 L25 39 L21 39 L17 31 L17 44 Z" fill="url(#bbGoldGrad)" />
              <path d="M30 44 L30 22 L36 22 L41 33 L46 22 L52 22 L52 44 L47 44 L47 31 L43 39 L39 39 L35 31 L35 44 Z" fill="url(#bbGoldGrad)" />
              <path d="M12 48 L52 48" stroke="url(#bbGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="bb-header-brand-text">
              <span className="bb-brand-name">METRO MOTORS</span>
              <span className="bb-brand-tagline">BUY • SELL • EXCHANGE • FINANCE</span>
            </div>
          </div>

          {/* Central Title */}
          <div className="bb-header-title-box">
            <h1 className="bb-main-title">BUYER BILL — VEHICLE PURCHASE RECEIPT</h1>
            <div className="bb-sub-title-1">PURCHASE & TRANSACTION RECORD</div>
            <div className="bb-sub-title-2">INTERMEDIARY FACILITATED VEHICLE SALE</div>
          </div>

          {/* Metadata Box */}
          <div className="bb-header-meta-box">
            <div className="bb-meta-row">
              <span className="bb-meta-label">Bill No:</span>
              <span className="bb-meta-val" data-testid="bb-bill-number">{billNumber}</span>
            </div>
            <div className="bb-meta-row">
              <span className="bb-meta-label">Deal ID:</span>
              <span className="bb-meta-val" data-testid="bb-deal-id">{dealId}</span>
            </div>
            <div className="bb-meta-row">
              <span className="bb-meta-label">Date:</span>
              <span className="bb-meta-val">{txDate}</span>
            </div>
          </div>
        </header>

        {/* ===================== SECTION 1: VEHICLE DETAILS ===================== */}
        <div className="bb-section-bar">
          <span>1. VEHICLE DETAILS</span>
          <span className="bb-section-subtext">Verified Vehicle Identity & Registration</span>
        </div>
        <div className="bb-vehicle-grid">
          {/* Vehicle Photo */}
          <div className="bb-photo-cell">
            {vehiclePhotoSrc ? (
              <img src={vehiclePhotoSrc} alt="Vehicle" className="bb-photo-img" data-testid="bb-vehicle-photo" />
            ) : (
              <div className="bb-photo-placeholder">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
                <span className="bb-photo-caption">Vehicle Photo</span>
              </div>
            )}
          </div>

          {/* Vehicle Main Specifications */}
          <div className="bb-vehicle-specs">
            <div className="bb-field-line">
              <span className="bb-field-label">Vehicle Name</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!vehicle.vehicle_name ? "empty" : ""}`} data-testid="bb-vehicle-name">
                {vehicle.vehicle_name || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Make / Brand</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!vehicle.make ? "empty" : ""}`}>
                {vehicle.make || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Model</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!vehicle.model ? "empty" : ""}`}>
                {vehicle.model || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Month & Year of Mfg</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!mfgYear ? "empty" : ""}`}>
                {mfgYear || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Registration Number</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value bold ${!regNumber ? "empty" : ""}`} data-testid="bb-vehicle-reg">
                {regNumber || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Registration Date</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!vehicle.registration_date ? "empty" : ""}`}>
                {vehicle.registration_date || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Engine Number</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!vehicle.engine_number ? "empty" : ""}`}>
                {vehicle.engine_number || vehicle.engineNumber || "—"}
              </span>
            </div>
            <div className="bb-field-line">
              <span className="bb-field-label">Chassis Number</span>
              <span className="bb-field-colon">:</span>
              <span className={`bb-field-value ${!vehicle.chassis_number ? "empty" : ""}`}>
                {vehicle.chassis_number || vehicle.chassisNumber || "—"}
              </span>
            </div>
          </div>

          {/* Vehicle Document Status Table */}
          <div className="bb-vehicle-docs">
            <div className="bb-docs-header">Document Validity</div>
            <div className="bb-doc-row">
              <span className="bb-doc-name">Tax Status</span>
              <span className="bb-doc-val">{vehicle.tax || "L.T.T. Paid"}</span>
            </div>
            <div className="bb-doc-row">
              <span className="bb-doc-name">Insurance Status</span>
              <span className="bb-doc-val">{vehicle.insurance || "Active / Valid"}</span>
            </div>
            <div className="bb-doc-row">
              <span className="bb-doc-name">Fitness Certificate</span>
              <span className="bb-doc-val">{vehicle.fc || vehicle.fitness || "Valid"}</span>
            </div>
            <div className="bb-doc-row">
              <span className="bb-doc-name">Clearance Certificate</span>
              <span className="bb-doc-val">{vehicle.cc || vehicle.noc || "Clear / Obtained"}</span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 2: BUYER DETAILS ===================== */}
        <div className="bb-section-bar">
          <span>2. BUYER DETAILS</span>
          <span className="bb-section-subtext">Purchasing Party Profile</span>
        </div>
        <div className="bb-person-grid">
          {/* Buyer Photo */}
          <div className="bb-photo-cell">
            {buyerPhotoSrc ? (
              <img src={buyerPhotoSrc} alt="Buyer" className="bb-photo-img" data-testid="bb-buyer-photo" />
            ) : (
              <div className="bb-photo-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="bb-photo-caption">Buyer Photo</span>
              </div>
            )}
          </div>

          {/* Buyer Fields in 2 columns */}
          <div className="bb-person-fields-two-col">
            <div className="bb-field-col">
              <div className="bb-field-line">
                <span className="bb-field-label">Full Name</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value bold ${!buyer.name ? "empty" : ""}`} data-testid="bb-buyer-name">
                  {buyer.name || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Mobile Number</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.phone && !buyer.mobile ? "empty" : ""}`}>
                  {buyer.phone || buyer.mobile || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Email Address</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.email ? "empty" : ""}`}>
                  {buyer.email || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">City / District</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.city ? "empty" : ""}`}>
                  {buyer.city || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">PIN Code</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.pincode && !buyer.pin ? "empty" : ""}`}>
                  {buyer.pincode || buyer.pin || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">PAN Number</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.pan_number && !buyer.pan ? "empty" : ""}`}>
                  {buyer.pan_number || buyer.pan || ""}
                </span>
              </div>
            </div>

            <div className="bb-field-col">
              <div className="bb-field-line">
                <span className="bb-field-label">Father / Spouse</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.father_name ? "empty" : ""}`}>
                  {buyer.father_name || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Alternate Mobile</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.alternate_phone && !buyer.alt_phone ? "empty" : ""}`}>
                  {buyer.alternate_phone || buyer.alt_phone || ""}
                </span>
              </div>
              <div className="bb-field-line bb-address-line">
                <span className="bb-field-label">Address</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value bb-address-value ${!buyer.address ? "empty" : ""}`}>
                  {buyer.address || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">State</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.state ? "empty" : ""}`}>
                  {buyer.state || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Aadhaar Number</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!buyer.id_number && !buyer.aadhaar ? "empty" : ""}`}>
                  {maskAadhaar(buyer.id_number || buyer.aadhaar || "")}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Signature & Thumb */}
          <div className="bb-side-sigs">
            <div className="bb-side-sig-box">
              <div className="bb-side-sig-slot">
                {buyerSignSrc ? <img src={buyerSignSrc} alt="Buyer Signature" className="bb-sig-img" /> : null}
              </div>
              <span className="bb-sig-label">Buyer Signature</span>
            </div>
            <div className="bb-side-sig-box">
              <div className="bb-side-sig-slot">
                {buyerThumbSrc ? <img src={buyerThumbSrc} alt="Buyer Thumb" className="bb-sig-img" /> : null}
              </div>
              <span className="bb-sig-label">Buyer Thumb</span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 3: SELLER / REGISTERED OWNER DETAILS ===================== */}
        <div className="bb-section-bar">
          <span>3. SELLER / REGISTERED OWNER DETAILS</span>
          <span className="bb-section-subtext">Registered Owner / Selling Party Profile</span>
        </div>
        <div className="bb-person-grid">
          {/* Seller Photo */}
          <div className="bb-photo-cell">
            {sellerPhotoSrc ? (
              <img src={sellerPhotoSrc} alt="Seller" className="bb-photo-img" data-testid="bb-seller-photo" />
            ) : (
              <div className="bb-photo-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="bb-photo-caption">Seller Photo</span>
              </div>
            )}
          </div>

          {/* Seller Fields in 2 columns */}
          <div className="bb-person-fields-two-col">
            <div className="bb-field-col">
              <div className="bb-field-line">
                <span className="bb-field-label">Full Name</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value bold ${!seller.name ? "empty" : ""}`} data-testid="bb-seller-name">
                  {seller.name || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Mobile Number</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.phone && !seller.mobile ? "empty" : ""}`}>
                  {seller.phone || seller.mobile || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Email Address</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.email ? "empty" : ""}`}>
                  {seller.email || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">City / District</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.city ? "empty" : ""}`}>
                  {seller.city || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">PIN Code</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.pincode && !seller.pin ? "empty" : ""}`}>
                  {seller.pincode || seller.pin || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">PAN Number</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.pan_number && !seller.pan ? "empty" : ""}`}>
                  {seller.pan_number || seller.pan || ""}
                </span>
              </div>
            </div>

            <div className="bb-field-col">
              <div className="bb-field-line">
                <span className="bb-field-label">Father / Spouse</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.father_name ? "empty" : ""}`}>
                  {seller.father_name || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Alternate Mobile</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.alternate_phone && !seller.alt_phone ? "empty" : ""}`}>
                  {seller.alternate_phone || seller.alt_phone || ""}
                </span>
              </div>
              <div className="bb-field-line bb-address-line">
                <span className="bb-field-label">Address</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value bb-address-value ${!seller.address ? "empty" : ""}`}>
                  {seller.address || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">State</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.state ? "empty" : ""}`}>
                  {seller.state || ""}
                </span>
              </div>
              <div className="bb-field-line">
                <span className="bb-field-label">Aadhaar Number</span>
                <span className="bb-field-colon">:</span>
                <span className={`bb-field-value ${!seller.id_number && !seller.aadhaar ? "empty" : ""}`}>
                  {maskAadhaar(seller.id_number || seller.aadhaar || "")}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Signature & Thumb */}
          <div className="bb-side-sigs">
            <div className="bb-side-sig-box">
              <div className="bb-side-sig-slot">
                {sellerSignSrc ? <img src={sellerSignSrc} alt="Seller Signature" className="bb-sig-img" /> : null}
              </div>
              <span className="bb-sig-label">Seller Signature</span>
            </div>
            <div className="bb-side-sig-box">
              <div className="bb-side-sig-slot">
                {sellerThumbSrc ? <img src={sellerThumbSrc} alt="Seller Thumb" className="bb-sig-img" /> : null}
              </div>
              <span className="bb-sig-label">Seller Thumb</span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 4: TRANSACTION & PAYMENT DETAILS ===================== */}
        <div className="bb-section-bar">
          <span>4. TRANSACTION & PAYMENT DETAILS</span>
          <span className="bb-section-subtext">Financial Settlement & Record</span>
        </div>
        <div className="bb-tx-container">
          <div className="bb-tx-grid">
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Deal ID</span>
              <span className="bb-tx-val">{dealId}</span>
            </div>
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Bill Number</span>
              <span className="bb-tx-val">{billNumber}</span>
            </div>
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Transaction Date</span>
              <span className="bb-tx-val">{txDate}</span>
            </div>

            <div className="bb-tx-item highlight">
              <span className="bb-tx-lbl">Final Transaction Amount</span>
              <span className="bb-tx-val prominent" data-testid="bb-final-amount">{formatINR(finalInvoiceAmount)}</span>
            </div>
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Advance Amount Paid</span>
              <span className="bb-tx-val">{formatINR(advanceAmount)}</span>
            </div>
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Total Amount Received</span>
              <span className="bb-tx-val" data-testid="bb-received-amount">{formatINR(receivedNum)}</span>
            </div>

            <div className="bb-tx-item balance">
              <span className="bb-tx-lbl">Remaining Balance</span>
              <span className="bb-tx-val bold" data-testid="bb-balance-amount">{formatINR(balanceNum)}</span>
            </div>
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Payment Method</span>
              <span className="bb-tx-val">{payments.payment_method || "Cash"}</span>
            </div>
            <div className="bb-tx-item">
              <span className="bb-tx-lbl">Payment Status</span>
              <span
                className={`bb-badge ${
                  paymentStatus === "Paid" ? "paid" : paymentStatus === "Partially Paid" ? "partial" : "pending"
                }`}
                data-testid="bb-payment-status-badge"
              >
                {paymentStatus}
              </span>
            </div>
          </div>

          <div className="bb-tx-words-line">
            <span className="bb-tx-words-label">Amount in Words:</span>
            <span className="bb-tx-words-val" data-testid="bb-amount-words">{invoiceAmountInWords}</span>
          </div>
        </div>

        {/* ===================== SECTION 5: BUYER ACKNOWLEDGEMENT ===================== */}
        <div className="bb-section-bar">
          <span>5. BUYER ACKNOWLEDGEMENT</span>
          <span className="bb-section-subtext">Intermediary Transaction Undertaking</span>
        </div>
        <div className="bb-acknowledgement-container">
          <p className="bb-acknowledgement-intro">
            I hereby acknowledge the purchase of the vehicle described in this bill from the seller/registered owner, facilitated through <strong>METRO MOTORS</strong>, acting as an intermediary in the transaction. The final transaction amount is as stated in this bill.
          </p>
          <ol className="bb-acknowledgement-list">
            <li>
              I acknowledge the payments recorded in this bill and understand that any outstanding balance remains payable according to the agreed transaction terms.
            </li>
            <li>
              The vehicle details and transaction information have been recorded to the best of the parties' knowledge.
            </li>
            <li>
              I understand that the vehicle is purchased from the seller/registered owner through METRO MOTORS, and that METRO MOTORS is not represented as the direct vehicle owner or seller.
            </li>
            <li>
              The vehicle, along with its available keys and documents, has been received in inspected condition, subject to the terms agreed between the parties.
            </li>
            <li>
              I confirm that I have read and understood the transaction terms recorded in this bill.
            </li>
          </ol>
        </div>

        {/* ===================== SECTION 6: SIGNATURES ===================== */}
        <div className="bb-section-bar">
          <span>6. SIGNATURES</span>
          <span className="bb-section-subtext">Execution & Delivery Confirmation</span>
        </div>
        <div className="bb-signatures-grid">
          <div className="bb-sig-card">
            <div className="bb-card-sig-slot">
              {sellerSignSrc && (
                <img src={sellerSignSrc} alt="Seller Signature" className="bb-card-sig-img" />
              )}
            </div>
            <div className="bb-card-sig-line" />
            <div className="bb-card-sig-text">
              <span className="bb-card-sig-title">Seller / Registered Owner Signature</span>
              <span className="bb-card-sig-sub">(Selling Party)</span>
            </div>
          </div>

          <div className="bb-sig-card">
            <div className="bb-card-sig-slot">
              {buyerSignSrc && (
                <img src={buyerSignSrc} alt="Buyer Signature" className="bb-card-sig-img" />
              )}
            </div>
            <div className="bb-card-sig-line" />
            <div className="bb-card-sig-text">
              <span className="bb-card-sig-title">Buyer Signature</span>
              <span className="bb-card-sig-sub">(Purchasing Party)</span>
            </div>
          </div>

          <div className="bb-sig-card">
            <div className="bb-card-sig-slot" />
            <div className="bb-card-sig-line" />
            <div className="bb-card-sig-text">
              <span className="bb-card-sig-title">For METRO MOTORS</span>
              <span className="bb-card-sig-sub">(Authorized Representative)</span>
            </div>
          </div>

          <div className="bb-sig-date-card">
            <span className="bb-sig-date-lbl">Date:</span>
            <span className="bb-sig-date-val">{txDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
