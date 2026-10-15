import React from "react";
import "./SellerBillDocument.css";
import { convertToIndianWords } from "@/utils/numberToWords";

// Helpers
function formatCurrency(val) {
  if (val === "" || val === null || val === undefined) return "—";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return "₹ " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr) {
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

export default function SellerBillDocument({ deal = {} }) {
  const seller = deal?.seller || {};
  const vehicle = deal?.vehicle || {};
  const payments = deal?.payments || {};
  const photos = deal?.photos || {};
  const witness1 = deal?.witness1 || (deal?.witnesses && deal?.witnesses[0]) || {};

  // Financial calculations
  const rawPurchase = payments.purchase_price ?? "";
  const rawPaid = payments.paid_to_seller ?? "";

  const purchaseNum = rawPurchase !== "" && !isNaN(Number(rawPurchase)) ? Number(rawPurchase) : 0;
  const paidNum = rawPaid !== "" && !isNaN(Number(rawPaid)) ? Number(rawPaid) : 0;
  const balanceNum = Math.max(0, purchaseNum - paidNum);

  let paymentStatus = "Pending";
  if (purchaseNum > 0 && paidNum >= purchaseNum) {
    paymentStatus = "Paid";
  } else if (paidNum > 0 && paidNum < purchaseNum) {
    paymentStatus = "Partially Paid";
  } else if (purchaseNum === 0 && paidNum > 0) {
    paymentStatus = "Advance Paid";
  }

  const advanceInWords = paidNum > 0 ? convertToIndianWords(paidNum) : "Zero Rupees Only";

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

  const sellerPhotoSrc = getPhotoSrc(photos["seller-1"] || photos["seller-portrait"] || photos["seller_photo"] || seller.photo);
  const sellerSignSrc = getPhotoSrc(photos["seller-signature"] || photos["seller_signature"] || seller.signature);
  const sellerThumbSrc = getPhotoSrc(photos["seller-thumb"] || photos["seller-thumb-impression"] || seller.thumb);

  const vehiclePhotoSrc = getPhotoSrc(photos["vehicle-1"] || photos["vehicle_front"] || vehicle.photo);

  const witnessPhotoSrc = getPhotoSrc(photos["witness-1-1"] || photos["witness-1"] || photos["witness_photo"] || witness1.photo);
  const witnessSignSrc = getPhotoSrc(photos["witness-1-signature"] || photos["witness-1-2"] || photos["witness_signature"] || witness1.signature);
  const witnessThumbSrc = getPhotoSrc(photos["witness-1-thumb"] || photos["witness-1-3"] || photos["witness-1-thumb-impression"] || witness1.thumb);

  const billNumber = deal.bill_number || deal.billNumber || "Bill-001";
  const dealId = deal.id ? (deal.id.startsWith("deal-") ? deal.id : deal.id.slice(0, 10).toUpperCase()) : "DEAL-NEW";
  const txDate = formatDate(payments.payment_date || deal.created_at);

  const fullAddress = [seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(", ");
  const mfgYear = [vehicle.mfg_month, vehicle.year].filter(Boolean).join(" ");
  const regNumber = vehicle.registration_number || vehicle.vehicle_number || "";

  return (
    <div className="seller-bill-wrapper" id="seller-bill-print-target">
      <div className="seller-bill-sheet" data-testid="seller-bill-sheet">
        {/* ===================== TOP HEADER ===================== */}
        <header className="sb-header">
          {/* Logo & Tagline */}
          <div className="sb-header-logo-box">
            <svg className="sb-header-logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sbGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd978" />
                  <stop offset="50%" stopColor="#e5b94c" />
                  <stop offset="100%" stopColor="#c69628" />
                </linearGradient>
                <linearGradient id="sbNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="100%" stopColor="#0b1726" />
                </linearGradient>
              </defs>
              {/* Luxury Rounded Emblem Frame */}
              <rect width="64" height="64" rx="14" fill="url(#sbNavyGrad)" />
              <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="url(#sbGoldGrad)" strokeWidth="2.5" />
              {/* Dual 'MM' Monogram */}
              <path d="M12 44 L12 22 L18 22 L23 33 L28 22 L34 22 L34 44 L29 44 L29 31 L25 39 L21 39 L17 31 L17 44 Z" fill="url(#sbGoldGrad)" />
              <path d="M30 44 L30 22 L36 22 L41 33 L46 22 L52 22 L52 44 L47 44 L47 31 L43 39 L39 39 L35 31 L35 44 Z" fill="url(#sbGoldGrad)" />
              {/* Speed underline */}
              <path d="M12 48 L52 48" stroke="url(#sbGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="sb-header-brand-text">
              <span className="sb-brand-name">METRO MOTORS</span>
              <span className="sb-brand-tagline">BUY • SELL • EXCHANGE • FINANCE</span>
            </div>
          </div>

          {/* Central Title */}
          <div className="sb-header-title-box">
            <h1 className="sb-main-title">VEHICLE HANDOVER AGREEMENT</h1>
            <div className="sb-sub-title-1">OWNER TO METRO MOTORS</div>
            <div className="sb-sub-title-2">FOR VEHICLE HANDOVER & AMOUNT SETTLEMENT</div>
          </div>

          {/* Metadata Box */}
          <div className="sb-header-meta-box">
            <div className="sb-meta-row">
              <span className="sb-meta-label">Bill No:</span>
              <span className="sb-meta-val" data-testid="sb-bill-number">{billNumber}</span>
            </div>
            <div className="sb-meta-row">
              <span className="sb-meta-label">Deal ID:</span>
              <span className="sb-meta-val" data-testid="sb-deal-id">{dealId}</span>
            </div>
            <div className="sb-meta-row">
              <span className="sb-meta-label">Date:</span>
              <span className="sb-meta-val">{txDate}</span>
            </div>
          </div>
        </header>

        {/* ===================== SECTION 1: OWNER (SELLER) DETAILS ===================== */}
        <div className="sb-section-bar">
          <span>1. OWNER (SELLER) DETAILS (Vehicle Owner)</span>
          <span className="sb-section-subtext">Registered Owner Profile</span>
        </div>
        <div className="sb-owner-grid">
          {/* Owner Photo */}
          <div className="sb-photo-cell">
            {sellerPhotoSrc ? (
              <img src={sellerPhotoSrc} alt="Owner" className="sb-photo-img" data-testid="sb-seller-photo" />
            ) : (
              <div className="sb-photo-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="sb-photo-caption">Owner Photo</span>
              </div>
            )}
          </div>

          {/* Owner Fields Table */}
          <div className="sb-table-fields">
            <div className="sb-field-line">
              <span className="sb-field-label">Full Name</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.name ? "empty" : ""}`} data-testid="sb-seller-name">
                {seller.name || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Father / Spouse Name</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.father_name ? "empty" : ""}`}>
                {seller.father_name || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Mobile Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.phone && !seller.mobile ? "empty" : ""}`} data-testid="sb-seller-phone">
                {seller.phone || seller.mobile || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Alternate Mobile</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.alternate_phone ? "empty" : ""}`}>
                {seller.alternate_phone || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Email Address</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.email ? "empty" : ""}`}>
                {seller.email || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Address</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.address && !fullAddress ? "empty" : ""}`} title={fullAddress}>
                {seller.address || fullAddress || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">City / District</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.city ? "empty" : ""}`}>
                {seller.city || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">State</span>
              <span className="sb-field-colon">:</span>
              <span className="sb-field-value">
                {seller.state || "Karnataka"}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">PIN Code</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.pincode ? "empty" : ""}`}>
                {seller.pincode || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Aadhaar Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.id_number && !seller.aadhaar ? "empty" : ""}`} data-testid="sb-seller-aadhaar">
                {seller.id_number || seller.aadhaar || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">PAN Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!seller.pan_number ? "empty" : ""}`}>
                {seller.pan_number || ""}
              </span>
            </div>
          </div>

          {/* Owner Signature & Thumb Boxes */}
          <div className="sb-signatures-cell">
            <div className="sb-sig-box">
              <div className="sb-sig-slot">
                {sellerSignSrc ? (
                  <img src={sellerSignSrc} alt="Signature" className="sb-sig-img" />
                ) : null}
              </div>
              <span className="sb-sig-label">Owner Signature</span>
            </div>
            <div className="sb-sig-box">
              <div className="sb-sig-slot">
                {sellerThumbSrc ? (
                  <img src={sellerThumbSrc} alt="Thumb" className="sb-sig-img" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M12 2a10 10 0 0 0-10 10c0 4.1 2.5 7.6 6 9.1" />
                    <path d="M12 6a6 6 0 0 0-6 6c0 2.5 1.5 4.6 3.6 5.5" />
                    <path d="M12 10a2 2 0 0 0-2 2c0 .9.6 1.7 1.4 1.9" />
                  </svg>
                )}
              </div>
              <span className="sb-sig-label">Owner Thumb</span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 2: AMOUNT DETAILS ===================== */}
        <div className="sb-section-bar">
          <span>2. AMOUNT DETAILS (Amount given by METRO MOTORS to Owner)</span>
          <span className="sb-section-subtext">Agreed Purchase Consideration</span>
        </div>
        <div className="sb-amount-container">
          <div className="sb-amount-cards">
            {/* Agreed Purchase Amount */}
            <div className="sb-amount-card">
              <span className="sb-amount-card-title">Agreed Purchase Amount (₹)</span>
              <span className="sb-amount-card-val" data-testid="sb-purchase-amount">
                {formatCurrency(rawPurchase)}
              </span>
            </div>

            {/* Advance Amount Paid */}
            <div className="sb-amount-card">
              <span className="sb-amount-card-title">Amount Paid / Advanced by METRO MOTORS (₹)</span>
              <span className="sb-amount-card-val paid" data-testid="sb-advance-paid">
                {formatCurrency(rawPaid)}
              </span>
            </div>

            {/* Balance Payable */}
            <div className="sb-amount-card">
              <span className="sb-amount-card-title">Amount Pending / Balance Payable (₹)</span>
              <span className="sb-amount-card-val pending" data-testid="sb-balance-payable">
                {formatCurrency(balanceNum)}
              </span>
            </div>
          </div>

          <div className="sb-amount-meta-bar">
            <div>
              <strong>Payment Method:</strong> {payments.payment_method || "Cash"}
              {payments.transaction_reference && <span> · Ref: {payments.transaction_reference}</span>}
            </div>
            <div>
              <strong>Payment Status:</strong>{" "}
              <span
                className={`sb-badge ${
                  paymentStatus === "Paid"
                    ? "paid"
                    : paymentStatus === "Partially Paid"
                    ? "partial"
                    : "pending"
                }`}
                data-testid="sb-payment-status"
              >
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 3: VEHICLE DETAILS ===================== */}
        <div className="sb-section-bar">
          <span>3. VEHICLE DETAILS</span>
          <span className="sb-section-subtext">Vehicle Specifications & Verification</span>
        </div>
        <div className="sb-vehicle-grid">
          {/* Vehicle Photo */}
          <div className="sb-vehicle-photo-cell">
            {vehiclePhotoSrc ? (
              <img src={vehiclePhotoSrc} alt="Vehicle" className="sb-photo-img" data-testid="sb-vehicle-photo" />
            ) : (
              <div className="sb-photo-placeholder">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
                <span className="sb-photo-caption">Vehicle Photo</span>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="sb-vehicle-specs">
            <div className="sb-field-line">
              <span className="sb-field-label">Vehicle Name</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!vehicle.vehicle_name ? "empty" : ""}`} data-testid="sb-vehicle-name">
                {vehicle.vehicle_name || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Make / Brand</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!vehicle.make && !vehicle.brand ? "empty" : ""}`} data-testid="sb-vehicle-make">
                {vehicle.make || vehicle.brand || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Model</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!vehicle.model ? "empty" : ""}`} data-testid="sb-vehicle-model">
                {vehicle.model || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Month & Year of Mfg</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!mfgYear ? "empty" : ""}`}>
                {mfgYear || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Registration Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!regNumber ? "empty" : ""}`} data-testid="sb-vehicle-reg">
                {regNumber || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Registration Date</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!vehicle.registration_date ? "empty" : ""}`}>
                {vehicle.registration_date ? formatDate(vehicle.registration_date) : ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Engine Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!vehicle.engine_number && !vehicle.engineNumber ? "empty" : ""}`} data-testid="sb-engine-number">
                {vehicle.engine_number || vehicle.engineNumber || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Chassis Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!vehicle.chassis_number && !vehicle.chassisNumber ? "empty" : ""}`} data-testid="sb-chassis-number">
                {vehicle.chassis_number || vehicle.chassisNumber || ""}
              </span>
            </div>
          </div>

          {/* Compliance & Certificates */}
          <div className="sb-vehicle-compliance">
            <div className="sb-field-line">
              <span className="sb-field-label" style={{ width: 105, minWidth: 105 }}>Tax</span>
              <span className="sb-field-colon">:</span>
              <span className="sb-field-value">{vehicle.tax || "Paid"}</span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label" style={{ width: 105, minWidth: 105 }}>Insurance</span>
              <span className="sb-field-colon">:</span>
              <span className="sb-field-value">{vehicle.insurance || "Active"}</span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label" style={{ width: 105, minWidth: 105 }}>Fitness Certificate</span>
              <span className="sb-field-colon">:</span>
              <span className="sb-field-value">{vehicle.fitness || "Valid"}</span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label" style={{ width: 105, minWidth: 105 }}>Clearance Cert / NOC</span>
              <span className="sb-field-colon">:</span>
              <span className="sb-field-value">{vehicle.noc || "Available"}</span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 4: SELLER WITNESS DETAILS ===================== */}
        <div className="sb-section-bar">
          <span>4. SELLER WITNESS DETAILS (Witness from seller side)</span>
          <span className="sb-section-subtext">Witness Identification</span>
        </div>
        <div className="sb-witness-grid">
          {/* Witness Photo */}
          <div className="sb-witness-photo-cell">
            {witnessPhotoSrc ? (
              <img src={witnessPhotoSrc} alt="Witness" className="sb-photo-img" />
            ) : (
              <div className="sb-photo-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="sb-photo-caption" style={{ fontSize: "6px" }}>Witness Photo</span>
              </div>
            )}
          </div>

          {/* Witness Fields */}
          <div className="sb-witness-fields">
            <div className="sb-field-line">
              <span className="sb-field-label">Full Name</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!witness1.name ? "empty" : ""}`}>
                {witness1.name || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Mobile Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!witness1.phone && !witness1.mobile ? "empty" : ""}`}>
                {witness1.phone || witness1.mobile || ""}
              </span>
            </div>
            <div className="sb-field-line">
              <span className="sb-field-label">Aadhaar Number</span>
              <span className="sb-field-colon">:</span>
              <span className={`sb-field-value ${!witness1.id_number && !witness1.aadhaar ? "empty" : ""}`}>
                {witness1.id_number || witness1.aadhaar || ""}
              </span>
            </div>
          </div>

          {/* Witness Signatures */}
          <div className="sb-witness-sigs">
            <div className="sb-sig-box">
              <div className="sb-sig-slot">
                {witnessSignSrc ? (
                  <img src={witnessSignSrc} alt="Witness Sign" className="sb-sig-img" />
                ) : null}
              </div>
              <span className="sb-sig-label">Witness Signature</span>
            </div>
            <div className="sb-sig-box">
              <div className="sb-sig-slot">
                {witnessThumbSrc ? (
                  <img src={witnessThumbSrc} alt="Witness Thumb" className="sb-sig-img" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M12 2a10 10 0 0 0-10 10c0 4.1 2.5 7.6 6 9.1" />
                    <path d="M12 6a6 6 0 0 0-6 6c0 2.5 1.5 4.6 3.6 5.5" />
                  </svg>
                )}
              </div>
              <span className="sb-sig-label">Witness Thumb</span>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 5: PURCHASE & HANDOVER DECLARATION ===================== */}
        <div className="sb-section-bar">
          <span>5. HANDOVER & PURCHASE DECLARATION</span>
          <span className="sb-section-subtext">Legal Terms & Undertaking</span>
        </div>
        <div className="sb-declaration-container">
          <ol className="sb-declaration-list">
            <li>
              I, the undersigned, being the registered owner of the above mentioned vehicle, hereby declare that I am voluntarily handing over and selling my vehicle to <strong>METRO MOTORS</strong> and acknowledge receipt of <strong>{formatCurrency(rawPaid)}</strong> (Rupees <strong>{advanceInWords}</strong>) as purchase consideration / advance amount.
            </li>
            <li>
              The remaining balance payable of <strong>{formatCurrency(balanceNum)}</strong> shall be settled as per agreed terms upon completion of document verification and handover formalities.
            </li>
            <li>
              I authorize <strong>METRO MOTORS</strong> to keep the above vehicle in its custody, verify all transport records, and arrange its sale / transfer to a third-party purchaser.
            </li>
            <li>
              <strong>METRO MOTORS</strong> shall have full right to sell the vehicle at a mutually decided price, and the sale proceeds shall first be used to recover the purchase amount advanced to me, along with any agreed service charges.
            </li>
            <li>
              I confirm that the vehicle details, registration documents, and personal information provided by me are true to the best of my knowledge, and the vehicle is free from any legal encumbrance, theft, or police complaints.
            </li>
            <li>
              I have read and understood the above terms and agree to the handover and purchase of the vehicle by <strong>METRO MOTORS</strong>.
            </li>
          </ol>
        </div>

        {/* ===================== BOTTOM SIGNATURE BLOCKS ===================== */}
        <div className="sb-bottom-signatures">
          <div className="sb-bottom-sig-box">
            <div className="sb-bottom-sig-slot">
              {sellerSignSrc ? (
                <img src={sellerSignSrc} alt="Owner Signature" className="sb-bottom-sig-img" />
              ) : null}
            </div>
            <div className="sb-bottom-sig-line"></div>
            <span className="sb-bottom-sig-title">Owner (Seller) Signature</span>
          </div>

          <div className="sb-bottom-sig-box">
            <div className="sb-bottom-sig-slot"></div>
            <div className="sb-bottom-sig-line"></div>
            <span className="sb-bottom-sig-title">For METRO MOTORS</span>
            <span className="sb-bottom-sig-sub">(Authorized Representative)</span>
          </div>

          <div className="sb-bottom-sig-box">
            <div className="sb-bottom-sig-slot">
              {witnessSignSrc ? (
                <img src={witnessSignSrc} alt="Witness Signature" className="sb-bottom-sig-img" />
              ) : null}
            </div>
            <div className="sb-bottom-sig-line"></div>
            <span className="sb-bottom-sig-title">Witness Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
