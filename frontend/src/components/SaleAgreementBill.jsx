import React from "react";
import templateBg from "@/assets/agreement_template.jpg";
import thumbSvg from "@/assets/biometric_thumb.svg";
import "./SaleAgreementBill.css";

function convertToIndianWords(amount) {
  if (amount === null || amount === undefined || amount === "") return "Zero Rupees Only";
  const num = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : Number(amount);
  if (isNaN(num) || num === 0) return "Zero Rupees Only";

  const n = Math.floor(Math.abs(num));
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function belowHundred(v) {
    if (v === 0) return "";
    if (v < 20) return ones[v];
    const u = v % 10;
    return tens[Math.floor(v / 10)] + (u ? " " + ones[u] : "");
  }

  function belowThousand(v) {
    let s = "";
    const h = Math.floor(v / 100);
    const r = v % 100;
    if (h > 0) s += ones[h] + " Hundred";
    if (r > 0) s += (s ? " " : "") + belowHundred(r);
    return s;
  }

  let words = "";
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  if (crore > 0) words += (crore < 100 ? belowHundred(crore) : belowThousand(crore)) + " Crore ";
  if (lakh > 0) words += belowHundred(lakh) + " Lakh ";
  if (thousand > 0) words += belowHundred(thousand) + " Thousand ";
  if (rem > 0) words += belowThousand(rem);

  return (words.trim() || "Zero") + " Rupees Only";
}

function formatDisplayDate(dateStr) {
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

function formatAmount(val) {
  if (val === "" || val === null || val === undefined) return "";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num) + " /-";
}

function splitAddress3(addr = "", maxLen1 = 30, maxLen2 = 36, maxLen3 = 36) {
  if (!addr) return ["", "", ""];
  const words = addr.split(" ");
  let line1 = "";
  let line2 = "";
  let line3 = "";
  for (const w of words) {
    if ((line1 + " " + w).trim().length <= maxLen1) {
      line1 = (line1 + " " + w).trim();
    } else if ((line2 + " " + w).trim().length <= maxLen2) {
      line2 = (line2 + " " + w).trim();
    } else {
      line3 = (line3 + " " + w).trim();
    }
  }
  return [line1, line2, line3];
}

export default function SaleAgreementBill({ deal = {}, doc = null }) {
  // Normalize if passed a doc wrapper
  const d = doc?.deal ? {
    ...doc.deal,
    vehicle: doc.vehicle || {},
    seller: doc.parties?.from || {},
    buyer: doc.parties?.to || {},
    payments: doc.payment_lines?.length ? {
      purchase_price: doc.total_amount,
      paid_to_seller: doc.payment_lines[0]?.amount
    } : (doc.confidential ? {
      purchase_price: doc.confidential.purchase_total,
      selling_price: doc.confidential.sale_total
    } : {}),
    bill_number: doc.bill?.bill_number || deal.bill_number,
    created_at: doc.bill?.created_date || deal.created_at,
    witnesses: doc.witnesses || deal.witnesses,
    photos: deal.photos || {}
  } : deal;

  const billNo = d.bill_number || d.billNumber || "MM-26-0002";
  const place = d.place || d.seller?.city || "Davangere";
  const dateStr = formatDisplayDate(d.deliveryDate || d.payments?.payment_date || d.created_at);
  const dateParts = dateStr.includes("/") ? dateStr.split("/").map(s => s.trim()) : [dateStr, "", ""];
  const dayPart = d.deliveryDay || dateParts[0] || "";
  const monthPart = d.deliveryMonth || dateParts[1] || "";
  const yearPart = d.deliveryYear || dateParts[2] || "";
  const timeStr = d.deliveryTime || d.delivery_time || "11:30 AM";

  // Vehicle
  const v = d.vehicle || {};
  const vehicleMake = v.make || v.brand || "Honda";
  const vehicleModel = v.model || v.vehicle_name || "Activa 6G";
  const vehicleNo = v.vehicle_number || v.registration_number || "KA-17-EX-2456";
  const chassisNo = v.chassis_number || v.chassisNumber || "ME4JF4214P1234567";
  const engineNo = v.engine_number || v.engineNumber || "JF42E-1234567";

  // Seller
  const s = d.seller || {};
  const sellerName = s.name || "Ramesh Kumar";
  const rawSellerAddr = s.address || [s.address, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "#12, 2nd Cross, Vinayaka Nagar, Davangere, Karnataka - 577004";
  const [sellerAddr1, sellerAddr2, sellerAddr3] = (s.address1 !== undefined || s.address2 !== undefined || s.address3 !== undefined)
    ? [s.address1 || "", s.address2 || "", s.address3 || ""]
    : splitAddress3(rawSellerAddr, 30, 42, 42);
  const sellerPhone = s.phone || s.mobile || "9448123456";
  const sellerAadhaar = s.id_number || s.aadhaar || "1234 5678 9012";

  // Purchaser (default METRO MOTORS, or custom buyer name if edited)
  const buyerName = d.buyerName || d.buyer?.name || "METRO MOTORS";

  // Witness 1
  const w1 = d.witness1 || (d.witnesses && d.witnesses[0]) || {};
  const witnessName = w1.name || "Suresh Kumar";
  const rawWitnessAddr = w1.address || "#5, Temple Road, Bapuji Nagar, Davangere, Karnataka - 577002";
  const [witnessAddr1, witnessAddr2, witnessAddr3] = (w1.address1 !== undefined || w1.address2 !== undefined || w1.address3 !== undefined)
    ? [w1.address1 || "", w1.address2 || "", w1.address3 || ""]
    : splitAddress3(rawWitnessAddr, 20, 26, 26);
  const witnessPhone = w1.phone || w1.mobile || "9987654321";
  const witnessAadhaar = w1.id_number || w1.aadhaar || "9876 5432 1098";

  // Financials
  const p = d.payments || d.payment || {};
  const purchasePriceVal = (p.purchase_price !== "" && p.purchase_price != null) ? p.purchase_price
    : (p.purchasePrice !== "" && p.purchasePrice != null) ? p.purchasePrice
    : (p.selling_price !== "" && p.selling_price != null) ? p.selling_price
    : 65000;

  const advancePaidVal = (p.paid_to_seller !== "" && p.paid_to_seller != null) ? p.paid_to_seller
    : (p.advancePaid !== "" && p.advancePaid != null) ? p.advancePaid
    : (p.received_from_buyer !== "" && p.received_from_buyer != null) ? p.received_from_buyer
    : 25000;

  const balanceVal = (p.balanceAmount !== undefined && p.balanceAmount !== "" && p.balanceAmount != null)
    ? p.balanceAmount
    : Math.max(0, Number(purchasePriceVal || 0) - Number(advancePaidVal || 0));

  const toInsuranceVal = (p.toAndInsurance !== "" && p.toAndInsurance != null)
    ? p.toAndInsurance
    : (d.toAndInsurance !== "" && d.toAndInsurance != null)
    ? d.toAndInsurance
    : 5000;

  const priceFormatted = formatAmount(purchasePriceVal);
  const priceInWords = convertToIndianWords(purchasePriceVal);
  const advanceFormatted = formatAmount(advancePaidVal);
  const balanceFormatted = formatAmount(balanceVal);
  const toInsuranceFormatted = typeof toInsuranceVal === "number" || !isNaN(Number(toInsuranceVal)) ? formatAmount(toInsuranceVal) : String(toInsuranceVal);

  // Checkboxes
  const isInsuranceChecked = d.insurance !== undefined ? !!d.insurance : true;
  const isFcChecked = d.fc !== undefined ? !!d.fc : true;
  const isTaxChecked = d.tax !== undefined ? !!d.tax : true;
  const isCcChecked = d.cc !== undefined ? !!d.cc : true;

  // Photos & Media
  const photos = d.photos || {};
  const resolveMediaUrl = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (item.url) return item.url;
    if (item.blob) {
      try {
        return URL.createObjectURL(item.blob);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const sellerPhoto = resolveMediaUrl(photos["seller-portrait"] || photos["seller-1"] || photos["seller_photo"] || s.photo);
  const sellerThumb = resolveMediaUrl(photos["seller-thumb"] || photos["seller-thumb-impression"] || photos["seller-2"] || s.thumb);
  const sellerSig = resolveMediaUrl(photos["seller-signature"] || photos["seller-8"] || photos["seller_signature"] || s.signature);

  const buyerPhoto = resolveMediaUrl(photos["buyer-portrait"] || photos["buyer-1"] || photos["buyer_photo"] || b.photo);
  const buyerThumb = resolveMediaUrl(photos["buyer-thumb"] || photos["buyer-thumb-impression"] || photos["buyer-2"] || b.thumb);
  const buyerSig = resolveMediaUrl(photos["buyer-signature"] || photos["buyer-8"] || photos["buyer_signature"] || b.signature);

  const witnessPhoto = resolveMediaUrl(photos["witness-1-1"] || photos["witness-1"] || w1.photo);
  const witnessThumb = resolveMediaUrl(photos["witness-1-thumb"] || photos["witness-1-2"] || w1.thumb);
  const witnessSig = resolveMediaUrl(photos["witness-1-signature"] || w1.signature);

  return (
    <div className="sale-agreement-container" data-testid="sale-agreement-container">
      <div
        className="sale-agreement-bill"
        id="sale-agreement-bill"
        style={{ backgroundImage: `url(${templateBg})` }}
        data-testid="sale-agreement-bill"
      >
        {/* ===================== 1. TOP HEADER ROW ===================== */}
        {/* SL. NO. */}
        <div className="sab-field bold" style={{ left: "12.5%", top: "18.3%", width: "10.0%", height: "2.0%" }}>
          {billNo}
        </div>
        {/* PLACE */}
        <div className="sab-field bold" style={{ left: "36.0%", top: "18.3%", width: "14.5%", height: "2.0%" }}>
          {place}
        </div>
        {/* DATE (Day, Month, Year precisely placed in underline slots) */}
        <div className="sab-field bold center" style={{ left: "63.6%", top: "18.4%", width: "3.2%", height: "2.0%" }}>
          {dayPart}
        </div>
        <div className="sab-field bold center" style={{ left: "68.5%", top: "18.4%", width: "3.2%", height: "2.0%" }}>
          {monthPart}
        </div>
        <div className="sab-field bold center" style={{ left: "73.4%", top: "18.4%", width: "5.5%", height: "2.0%" }}>
          {yearPart}
        </div>
        {/* TIME */}
        <div className="sab-field bold center" style={{ left: "89.0%", top: "18.4%", width: "9.2%", height: "2.0%", background: "#ffffff", borderRadius: "2px" }}>
          {timeStr}
        </div>

        {/* ===================== 2. OWNER & VEHICLE DETAILS ===================== */}
        {/* Registered Owner Name */}
        <div className="sab-field bold" style={{ left: "22.8%", top: "21.8%", width: "73.0%", height: "1.9%" }}>
          {sellerName}
        </div>
        {/* Address Line 1 */}
        <div className="sab-field" style={{ left: "11.8%", top: "23.8%", width: "84.0%", height: "1.9%" }}>
          {sellerAddr1}
        </div>
        {/* Address Line 2 */}
        <div className="sab-field" style={{ left: "11.8%", top: "25.7%", width: "84.0%", height: "1.9%" }}>
          {sellerAddr2}
        </div>

        {/* Make */}
        <div className="sab-field bold" style={{ left: "10.0%", top: "27.6%", width: "37.0%", height: "1.9%" }}>
          {vehicleMake}
        </div>
        {/* Vehicle No */}
        <div className="sab-field bold" style={{ left: "67.0%", top: "27.6%", width: "29.0%", height: "1.9%" }}>
          {vehicleNo}
        </div>

        {/* Model */}
        <div className="sab-field bold" style={{ left: "10.5%", top: "29.6%", width: "36.5%", height: "1.9%" }}>
          {vehicleModel}
        </div>
        {/* Chassis No */}
        <div className="sab-field bold" style={{ left: "65.6%", top: "29.6%", width: "30.5%", height: "1.9%" }}>
          {chassisNo}
        </div>

        {/* Engine No */}
        <div className="sab-field bold" style={{ left: "13.8%", top: "31.7%", width: "33.0%", height: "1.9%" }}>
          {engineNo}
        </div>

        {/* ===================== 3. AGREEMENT SENTENCE ===================== */}
        {/* This Day I have sold above vehicle to Shri : */}
        <div className="sab-field bold" style={{ left: "34.5%", top: "33.9%", width: "61.5%", height: "1.9%", color: "#001e4d" }}>
          {buyerName}
        </div>

        {/* and delivered the possession before the following witness there of Rs. */}
        <div className="sab-field bold" style={{ left: "52.8%", top: "38.4%", width: "22.0%", height: "1.9%" }}>
          {priceFormatted}
        </div>

        {/* Rs. in (words) : */}
        <div className="sab-field bold" style={{ left: "14.2%", top: "40.4%", width: "62.0%", height: "1.9%" }}>
          {priceInWords}
        </div>

        {/* Purchaser Signature : */}
        <div className="sab-field signature-script" style={{ left: "20.2%", top: "42.7%", width: "45.0%", height: "2.0%" }}>
          {buyerSig ? (
            <img src={buyerSig} alt="Purchaser Sign" style={{ maxHeight: "100%", objectFit: "contain" }} />
          ) : (buyerName === "METRO MOTORS" ? "" : buyerName)}
        </div>

        {/* ===================== 4. THREE COLUMNS (SELLER, PURCHASER, WITNESS) ===================== */}
        {/* --- SELLER COLUMN --- */}
        {/* Seller Photo */}
        <div className="sab-image-box" style={{ left: "4.8%", top: "51.4%", width: "13.5%", height: "8.8%" }}>
          {sellerPhoto ? (
            <img src={sellerPhoto} alt="Seller" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "9px", fontWeight: "bold" }}>
              <span style={{ fontSize: "16px", marginBottom: "2px" }}>👤</span>
              <span>SELLER</span>
            </div>
          )}
        </div>

        {/* Seller Thumb */}
        <div className="sab-image-box thumb" style={{ left: "18.0%", top: "53.6%", width: "13.0%", height: "5.4%" }}>
          <img src={sellerThumb || thumbSvg} alt="Seller Thumb" style={{ maxHeight: "100%", objectFit: "contain" }} />
        </div>

        {/* Seller Name (Line 1, Y=642) */}
        <div className="sab-field bold" style={{ left: "10.2%", top: "60.8%", width: "28.5%", height: "1.9%" }}>
          {sellerName}
        </div>
        {/* Seller Address (Line 2, Y=663) */}
        <div className="sab-field" style={{ left: "10.7%", top: "62.8%", width: "28.0%", height: "1.9%" }}>
          {sellerAddr1}
        </div>
        {/* Seller Address Line 2 (Line 3, Y=684) */}
        <div className="sab-field" style={{ left: "4.0%", top: "64.9%", width: "34.5%", height: "1.9%" }}>
          {sellerAddr2}
        </div>
        {/* Seller Address Line 3 (Line 4, Y=705) */}
        <div className="sab-field" style={{ left: "4.0%", top: "66.9%", width: "34.5%", height: "1.9%" }}>
          {sellerAddr3}
        </div>
        {/* Seller Signature (Line 5, Sign. :, Y=726) */}
        <div className="sab-field signature-script" style={{ left: "8.5%", top: "68.8%", width: "30.0%", height: "2.1%" }}>
          {sellerSig ? <img src={sellerSig} alt="Sign" style={{ maxHeight: "100%", objectFit: "contain" }} /> : sellerName}
        </div>
        {/* Seller Cell (Line 6, Cell. :, Y=747) */}
        <div className="sab-field bold" style={{ left: "8.5%", top: "71.0%", width: "30.0%", height: "1.9%" }}>
          {sellerPhone}
        </div>
        {/* Seller Aadhaar (Line 7, ADHAR NO. :, Y=769) */}
        <div className="sab-field bold" style={{ left: "13.0%", top: "73.2%", width: "25.5%", height: "1.9%" }}>
          {sellerAadhaar}
        </div>

        {/* --- PURCHASER COLUMN --- */}
        {/* Pre-printed on template for METRO MOTORS */}

        {/* --- WITNESS COLUMN --- */}
        {/* Witness Photo */}
        <div className="sab-image-box" style={{ left: "68.8%", top: "51.4%", width: "13.5%", height: "8.8%" }}>
          {witnessPhoto ? (
            <img src={witnessPhoto} alt="Witness" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "9px", fontWeight: "bold" }}>
              <span style={{ fontSize: "16px", marginBottom: "2px" }}>👤</span>
              <span>WITNESS</span>
            </div>
          )}
        </div>

        {/* Witness Thumb */}
        <div className="sab-image-box thumb" style={{ left: "83.0%", top: "53.6%", width: "13.0%", height: "5.4%" }}>
          <img src={witnessThumb || thumbSvg} alt="Witness Thumb" style={{ maxHeight: "100%", objectFit: "contain" }} />
        </div>

        {/* Witness Name (Line 1, Y=642) */}
        <div className="sab-field bold" style={{ left: "75.0%", top: "60.8%", width: "21.5%", height: "1.9%" }}>
          {witnessName}
        </div>
        {/* Witness Address Line 1 (Line 2, Y=663) */}
        <div className="sab-field" style={{ left: "75.5%", top: "62.8%", width: "21.0%", height: "1.9%" }}>
          {witnessAddr1}
        </div>
        {/* Witness Address Line 2 (Line 3, Y=684) */}
        <div className="sab-field" style={{ left: "69.0%", top: "64.9%", width: "27.5%", height: "1.9%" }}>
          {witnessAddr2}
        </div>
        {/* Witness Address Line 3 (Line 4, Y=705) */}
        <div className="sab-field" style={{ left: "69.0%", top: "66.9%", width: "27.5%", height: "1.9%" }}>
          {witnessAddr3}
        </div>
        {/* Witness Signature (Line 5, Sign. :, Y=726) */}
        <div className="sab-field signature-script" style={{ left: "73.5%", top: "68.8%", width: "23.0%", height: "2.1%" }}>
          {witnessSig ? <img src={witnessSig} alt="Sign" style={{ maxHeight: "100%", objectFit: "contain" }} /> : witnessName}
        </div>
        {/* Witness Cell (Line 6, Cell. :, Y=747) */}
        <div className="sab-field bold" style={{ left: "73.5%", top: "71.0%", width: "23.0%", height: "1.9%" }}>
          {witnessPhone}
        </div>
        {/* Witness Aadhaar (Line 7, ADHAR NO. :, Y=769) */}
        <div className="sab-field bold" style={{ left: "77.5%", top: "73.2%", width: "19.0%", height: "1.9%" }}>
          {witnessAadhaar}
        </div>

        {/* ===================== 5. BOTTOM CHECKBOXES ===================== */}
        {/* Insurance */}
        {isInsuranceChecked && (
          <div className="sab-checkbox-mark" style={{ left: "15.5%", top: "77.8%", width: "2.4%", height: "1.8%" }}>
            ✓
          </div>
        )}
        {/* F.C. */}
        {isFcChecked && (
          <div className="sab-checkbox-mark" style={{ left: "15.5%", top: "80.7%", width: "2.4%", height: "1.8%" }}>
            ✓
          </div>
        )}
        {/* Tax */}
        {isTaxChecked && (
          <div className="sab-checkbox-mark" style={{ left: "15.5%", top: "83.6%", width: "2.4%", height: "1.8%" }}>
            ✓
          </div>
        )}
        {/* C.C. */}
        {isCcChecked && (
          <div className="sab-checkbox-mark" style={{ left: "15.5%", top: "86.5%", width: "2.4%", height: "1.8%" }}>
            ✓
          </div>
        )}

        {/* ===================== 6. BOTTOM FINANCIALS ===================== */}
        {/* PRICE */}
        <div className="sab-field bold center" style={{ left: "80.5%", top: "77.4%", width: "17.2%", height: "3.2%", fontSize: "clamp(10px, 1.45cqw, 13px)" }}>
          {priceFormatted}
        </div>
        {/* ADVANCE PAID AMOUNT */}
        <div className="sab-field bold center" style={{ left: "80.5%", top: "81.1%", width: "17.2%", height: "3.2%", fontSize: "clamp(10px, 1.45cqw, 13px)" }}>
          {advanceFormatted}
        </div>
        {/* BALANCE AMOUNT */}
        <div className="sab-field bold center" style={{ left: "80.5%", top: "84.7%", width: "17.2%", height: "3.2%", fontSize: "clamp(10px, 1.45cqw, 13px)" }}>
          {balanceFormatted}
        </div>
        {/* T. O. AND INSURANCE */}
        <div className="sab-field bold center" style={{ left: "80.5%", top: "88.5%", width: "17.2%", height: "3.2%", fontSize: "clamp(10px, 1.45cqw, 13px)" }}>
          {toInsuranceFormatted}
        </div>
      </div>
    </div>
  );
}
