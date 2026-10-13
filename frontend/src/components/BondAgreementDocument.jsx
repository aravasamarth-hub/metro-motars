import React from "react";
import "./BondAgreementDocument.css";

// Helper formatting functions
function formatINR(val) {
  if (val === undefined || val === null || val === "" || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString("en-IN");
}

function formatDate(val) {
  if (!val) {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${d} / ${m} / ${y}`;
  }
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, "0");
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    const yr = d.getFullYear();
    return `${day} / ${mon} / ${yr}`;
  } catch {
    return String(val);
  }
}

export default function BondAgreementDocument({ deal = {} }) {
  if (!deal) return null;

  const seller = deal.seller || {};
  const buyer = deal.buyer || {};
  const vehicle = deal.vehicle || {};
  const payments = deal.payments || {};
  const witnesses = deal.witnesses || [deal.witness1 || {}, deal.witness2 || {}];
  const witness1 = witnesses[0] || {};
  const witness2 = witnesses[1] || {};

  const txDate = deal.transactionDate || deal.date || deal.created_at || new Date().toISOString();
  const formattedTxDate = formatDate(txDate);
  const deliveryTime = deal.deliveryTime || "11:30 AM";

  // E Stamp Certificate number
  const eStampCertNo = deal.eStampNumber || deal.e_stamp_number || deal.bondCertificateNo || deal.bond_certificate_no || "";

  // Financials
  const agreedPrice = Number(payments.selling_price ?? payments.purchase_price ?? 0);
  const tokenAdvance = Number(payments.received_from_buyer ?? payments.paid_to_seller ?? 0);
  const balanceAmount = Math.max(0, agreedPrice - tokenAdvance);
  const paymentMethod = (payments.payment_method || "Cash").toLowerCase();

  // Vehicle Details
  const vehicleType = (vehicle.type || vehicle.vehicle_type || "bike").toLowerCase();
  const isCar = vehicleType.includes("car") || vehicleType.includes("four") || vehicleType.includes("4");
  const isBike = !isCar;
  const make = vehicle.make || vehicle.brand || "";
  const model = vehicle.model || vehicle.vehicle_name || "";
  const year = vehicle.year || vehicle.mfg_year || "";
  const color = vehicle.color || "—";
  const regNumber = vehicle.reg_number || vehicle.registration_number || vehicle.regNo || "";
  const chassisNumber = vehicle.chassis_number || vehicle.chassisNumber || "";
  const engineNumber = vehicle.engine_number || vehicle.engineNumber || "";

  // Signatures
  const sellerSignSrc = deal.photos?.seller_signature || null;
  const buyerSignSrc = deal.photos?.buyer_signature || null;
  const witness1SignSrc = deal.photos?.witness_signature || null;

  // Address Builders
  const sellerAddress = [seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(", ");
  const buyerAddress = [buyer.address, buyer.city, buyer.state, buyer.pincode].filter(Boolean).join(", ");

  return (
    <div className="bond-agreement-wrapper" data-testid="bond-agreement-document">
      {/* ===================== PAGE 1 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-1">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page1-body">
          <div className="bond-page1-date-row">
            <span>ದಿನಾಂಕ / Date:</span>
            <span className="bond-date-fill">{formattedTxDate}</span>
          </div>

          <h1 className="bond-page1-title-kannada">ವಾಹನ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಒಪ್ಪಂದ ಪತ್ರ</h1>
          <h2 className="bond-page1-title-english">VEHICLE PURCHASE AND SALE AGREEMENT</h2>
          <div className="bond-page1-asterisks">*******</div>

          <p className="bond-page1-intro-kannada">
            ಈ ವಾಹನ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಒಪ್ಪಂದವನ್ನು ಇಂದು ಇವರ ನಡುವೆ ಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ:
          </p>
          <p className="bond-page1-intro-english">
            This Vehicle Purchase and Sale Agreement is entered into by and between:
          </p>
        </div>

        <div className="bond-page-footer">
          <span>Page 1 of 7</span>
        </div>
      </div>

      {/* ===================== PAGE 2 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-2">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page-content">
          {/* First Party (Seller) */}
          <div className="bond-section-heading">
            <span>ಮೊದಲ ಪಾರ್ಟಿ / FIRST PARTY : ಮಾರಾಟಗಾರರು / SELLER</span>
          </div>
          <div className="bond-checkbox-row">
            <span className="bond-checkbox-item">
              <span className="bond-box-check">✓</span> ನೋಂದಾಯಿತ ಮಾಲೀಕರು / Registered Owner
            </span>
            <span className="bond-checkbox-item">
              <span className="bond-box-check"> </span> ಡೀಲರ್ / Dealer
            </span>
          </div>

          <table className="bond-table">
            <tbody>
              <tr>
                <td className="bond-td-label">ಹೆಸರು ಅಥವಾ ಸಂಸ್ಥೆಯ ಹೆಸರು<br />Name or Firm Name</td>
                <td className="bond-td-val">{seller.name || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ತಂದೆಯ ಹೆಸರು<br />Father's Name</td>
                <td className="bond-td-val">{seller.father_name || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ವಿಳಾಸ<br />Address</td>
                <td className="bond-td-val">{sellerAddress || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ<br />Mobile No</td>
                <td className="bond-td-val">{seller.phone || seller.mobile || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಆಧಾರ್ ಸಂಖ್ಯೆ<br />Aadhaar Number</td>
                <td className="bond-td-val">{seller.id_number || seller.aadhaar || "—"}</td>
              </tr>
            </tbody>
          </table>
          <p className="bond-subtext-note">
            ಇವರನ್ನು ಇನ್ನು ಮುಂದೆ ಒಪ್ಪಂದದಲ್ಲಿ "ಮಾರಾಟಗಾರ" ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ. / Hereinafter referred to as the "Seller".
          </p>

          {/* Second Party (Buyer) */}
          <div className="bond-section-heading">
            <span>ಎರಡನೇ ಪಾರ್ಟಿ / SECOND PARTY : ಖರೀದಿದಾರರು / BUYER</span>
          </div>
          <div className="bond-checkbox-row">
            <span className="bond-checkbox-item">
              <span className="bond-box-check">✓</span> ಖರೀದಿದಾರ / Buyer (Customer)
            </span>
            <span className="bond-checkbox-item">
              <span className="bond-box-check"> </span> ಡೀಲರ್ / Dealer
            </span>
          </div>

          <table className="bond-table">
            <tbody>
              <tr>
                <td className="bond-td-label">ಹೆಸರು ಅಥವಾ ಸಂಸ್ಥೆಯ ಹೆಸರು<br />Name or Firm Name</td>
                <td className="bond-td-val">{buyer.name || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ತಂದೆಯ ಹೆಸರು<br />Father's Name</td>
                <td className="bond-td-val">{buyer.father_name || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ವಿಳಾಸ<br />Address</td>
                <td className="bond-td-val">{buyerAddress || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ<br />Mobile No</td>
                <td className="bond-td-val">{buyer.phone || buyer.mobile || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಆಧಾರ್ ಸಂಖ್ಯೆ<br />Aadhaar Number</td>
                <td className="bond-td-val">{buyer.id_number || buyer.aadhaar || "—"}</td>
              </tr>
            </tbody>
          </table>
          <p className="bond-subtext-note">
            ಇವರನ್ನು ಇನ್ನು ಮುಂದೆ ಒಪ್ಪಂದದಲ್ಲಿ "ಖರೀದಿದಾರ" ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ. / Hereinafter referred to as the "Buyer".
          </p>

          {/* Section 1: Vehicle Description */}
          <div className="bond-section-heading">
            <span>೧. ವಾಹನದ ವಿವರಗಳು / 1. DESCRIPTION OF THE VEHICLE</span>
          </div>
          <p style={{ fontSize: "10px", margin: "4px 0", color: "#374151" }}>
            ಮಾರಾಟಗಾರನು ತನ್ನ ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡಲು ಮತ್ತು ಖರೀದಿದಾರನು ಅದನ್ನು ಖರೀದಿಸಲು ಒಪ್ಪಿಕೊಂಡಿರುತ್ತಾರೆ. ಆ ವಾಹನದ ವಿವರಗಳು ಈ ಕೆಳಗಿನಂತಿವೆ:<br />
            <em>The Seller agrees to sell, and the Buyer agrees to purchase, the following vehicle:</em>
          </p>

          <table className="bond-table">
            <tbody>
              <tr>
                <td className="bond-td-label">ವಾಹನದ ಪ್ರಕಾರ / Vehicle Type</td>
                <td className="bond-td-val">
                  <span className="bond-checkbox-item" style={{ marginRight: 16 }}>
                    <span className="bond-box-check">{isCar ? "✓" : " "}</span> Car / ಕಾರು
                  </span>
                  <span className="bond-checkbox-item">
                    <span className="bond-box-check">{isBike ? "✓" : " "}</span> Bike / ಬೈಕ್
                  </span>
                </td>
              </tr>
              <tr>
                <td className="bond-td-label">ತಯಾರಕ ಕಂಪನಿ / Make (Brand)</td>
                <td className="bond-td-val">{make || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಮಾಡೇಲ್ / Model</td>
                <td className="bond-td-val">{model || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ತಯಾರಿಕಾ ವರ್ಷ / Year of Manufacture</td>
                <td className="bond-td-val">{year || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಬಣ್ಣ / Color</td>
                <td className="bond-td-val">{color}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ನೋಂದಣಿ ಸಂಖ್ಯೆ / Registration Number</td>
                <td className="bond-td-val" style={{ fontWeight: 800 }}>{regNumber || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಚಾಸಿಸ್ ಸಂಖ್ಯೆ / Chassis Number</td>
                <td className="bond-td-val" style={{ fontFamily: "monospace" }}>{chassisNumber || "—"}</td>
              </tr>
              <tr>
                <td className="bond-td-label">ಎಂಜಿನ್ ಸಂಖ್ಯೆ / Engine Number</td>
                <td className="bond-td-val" style={{ fontFamily: "monospace" }}>{engineNumber || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bond-page-footer">
          <span>Page 2 of 7</span>
        </div>
      </div>

      {/* ===================== PAGE 3 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-3">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page-content">
          {/* Section 2: Purchase Price & Payment Terms */}
          <div className="bond-section-heading">
            <span>೨. ಒಟ್ಟು ಮೊತ್ತ ಮತ್ತು ಪಾವತಿ ನಿಯಮಗಳು / 2. PURCHASE PRICE AND PAYMENT TERMS</span>
          </div>

          <div style={{ fontSize: "10.4px", lineHeight: "1.5", margin: "6px 0 10px 0" }}>
            <p style={{ margin: "3px 0" }}>
              • <strong>ಒಟ್ಟು ಮಾರಾಟದ ಮೊತ್ತ:</strong> ವಾಹನದ ಒಟ್ಟು ಮೊತ್ತವನ್ನು <strong>ರೂ. {formatINR(agreedPrice)}</strong> ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.<br />
              • <strong>Total Purchase Price:</strong> The total agreed purchase price for the Vehicle is fixed at <strong>Rs. {formatINR(agreedPrice)}</strong>.
            </p>
            <p style={{ margin: "5px 0" }}>
              • <strong>ಪಾವತಿಯ ವಿಧಾನ / Mode of Payment:</strong>{" "}
              <span className="bond-checkbox-item" style={{ marginRight: 12 }}>
                <span className="bond-box-check">{paymentMethod === "cash" ? "✓" : " "}</span> ನಗದು (Cash)
              </span>
              <span className="bond-checkbox-item" style={{ marginRight: 12 }}>
                <span className="bond-box-check">{paymentMethod.includes("upi") || paymentMethod.includes("online") ? "✓" : " "}</span> ಯುಪಿಐ (UPI)
              </span>
              <span className="bond-checkbox-item">
                <span className="bond-box-check">{paymentMethod.includes("loan") || paymentMethod.includes("finance") ? "✓" : " "}</span> ಸಾಲ (Loan)
              </span>
            </p>
            <p style={{ margin: "3px 0" }}>
              • <strong>ಮುಂಗಡ ಹಣ:</strong> ರೂ. <strong>{formatINR(tokenAdvance)}</strong> ಅನ್ನು ದಿನಾಂಕ: <strong>{formattedTxDate}</strong> ರಂದು ಪಾವತಿಸಲಾಗಿದೆ.<br />
              • <strong>Token Amount:</strong> An advance of Rs. <strong>{formatINR(tokenAdvance)}</strong> has been paid on [Date] <strong>{formattedTxDate}</strong>.
            </p>
            <p style={{ margin: "3px 0" }}>
              • <strong>ಬಾಕಿ ಮೊತ್ತ:</strong> ಉಳಿದ ಪೂರ್ಣ ಬಾಕಿ ಮೊತ್ತ ರೂ. <strong>{formatINR(balanceAmount)}</strong> ಅನ್ನು ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸುವ ಅಧಿಕೃತ ದಿನಾಂಕದಂದು ಅಥವಾ ಅದಕ್ಕೂ ಮುಂಚಿತವಾಗಿ ಅಂದರೆ ದಿನಾಂಕ: <strong>{formattedTxDate}</strong> ರೊಳಗೆ ಪಾವತಿಸತಕ್ಕದ್ದು.<br />
              • <strong>Balance Amount:</strong> The remaining full balance of Rs. <strong>{formatINR(balanceAmount)}</strong> shall be paid on or before the official date of delivery, latest by [Date] <strong>{formattedTxDate}</strong>.
            </p>
          </div>

          {/* Section 3: First Party (Seller's) Representations & Warranties */}
          <div className="bond-section-heading">
            <span>೩. ಮೊದಲ ಪಾರ್ಟಿ (ಮಾರಾಟಗಾರನ) ಷರತ್ತುಗಳು / 3. FIRST PARTY (SELLER'S) REPRESENTATIONS & WARRANTIES</span>
          </div>
          <div className="bond-checkbox-row">
            <span style={{ fontWeight: 700 }}>ಮಾರಾಟಗಾರನ ಅರ್ಹತೆ / Seller's Status:</span>
            <span className="bond-checkbox-item">
              <span className="bond-box-check">✓</span> ಕಾನೂನುಬದ್ಧ ಅಸಲಿ ಮಾಲೀಕ / Absolute Legal Owner
            </span>
            <span className="bond-checkbox-item">
              <span className="bond-box-check"> </span> ಅಧಿಕೃತ ಡೀಲರ್ / Authorized Dealer
            </span>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೧. ನಾಗರಿಕ ಮತ್ತು ಅಪರಾಧ ಜವಾಬ್ದಾರಿ:</strong> ನೋಂದಣಿ ಪತ್ರದ (RC) ಪ್ರಕಾರ ನೋಂದಾಯಿತ ಮಾಲೀಕರಾಗಿರಲಿ ಅಥವಾ ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡುತ್ತಿರುವ ಒಪ್ಪಂದದ ಹಕ್ಕು ಹೊಂದಿರುವ ಡೀಲರ್ ಆಗಿರಲಿ, ಅವರು ಈ ವ್ಯವಹಾರಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಂಪೂರ್ಣ ಹಾಗೂ ನಿರಪೇಕ್ಷ ನಾಗರಿಕ (ಸಿವಿಲ್) ಮತ್ತು ಅಪರಾಧ (ಕ್ರಿಮಿನಲ್) ಜವಾಬ್ದಾರಿಯನ್ನು ವಹಿಸಿಕೊಳ್ಳುತ್ತಾರೆ.
            </div>
            <div className="bond-clause-english">
              <strong>1. Civil and Criminal Responsibility:</strong> The Registered Owner as per RC or the Agreement Holder dealer selling the Vehicle explicitly assumes absolute civil and criminal responsibility for this transaction.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೨. ದಾಖಲೆಗಳ ನೈಜತೆ ಮತ್ತು ಆರ್ಟಿಓ ಸಹಿ ಹೊಣೆಗಾರಿಕೆ:</strong> ನೋಂದಾಯಿತ ಮಾಲೀಕರು ಅಥವಾ ಒಪ್ಪಂದದ ಹಕ್ಕು ಹೊಂದಿರುವ ಡೀಲರ್ ವಾಹನದ ಎಲ್ಲಾ ಅಸಲಿ ದಾಖಲೆಗಳು ನೂರಕ್ಕೆ ನೂರರಷ್ಟು ನೈಜವಾಗಿವೆ ಎಂದು ಭರವಸೆ ನೀಡುತ್ತಾರೆ. ಯಾವುದೇ ಆರ್ಟಿಓ (RTO) ಸಹಿ ಹೊಂದಾಣಿಕೆಯಾಗದಿದ್ದಲ್ಲಿ ತಮ್ಮ ಸ್ವಂತ ಖರ್ಚಿನಲ್ಲಿ ಆ ದಾಖಲೆಗಳನ್ನು ಸರಿಪಡಿಸಿಕೊಡಲು ಕಾನೂನುಬದ್ಧವಾಗಿ ಬದ್ಧರಾಗಿರುತ್ತಾರೆ.
            </div>
            <div className="bond-clause-english">
              <strong>2. Genuineness of Documents & RTO Signatures:</strong> The Registered Owner or agreement holder dealer guarantees that all original vehicle documents are 100% genuine. In case of any RTO signature mismatch, they are legally bound to rectify the paperwork at their own cost.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೩. ಆರ್ಟಿಓ ನಮೂನೆಗಳು, ಬ್ಯಾಂಕ್ ಸಾಲ ಮುಕ್ತಾಯ ಮತ್ತು ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ ಜವಾಬ್ದಾರಿ:</strong> ನೋಂದಾಯಿತ ಮಾಲೀಕರು ಅಥವಾ ಡೀಲರ್ ಸರಿಯಾಗಿ ಸಹಿ ಮಾಡಲಾದ ಅಸಲಿ ನಮೂನೆ ೨೯ (Form 29) ಮತ್ತು ನಮೂನೆ ೩೦ (Form 30) ಒದಗಿಸಲು ಜವಾಬ್ದಾರರು. ಬ್ಯಾಂಕ್ ಸಾಲವಿದ್ದರೆ, ಸಾಲ ಚುಕ್ತಾ ಮಾಡಿ, ನಿರಾಕ್ಷೇಪಣಾ ಪತ್ರ (NOC) ಮತ್ತು ಸಹಿ ಮಾಡಿದ ನಮೂನೆ ೩೫ (Form 35) ಒದಗಿಸಬೇಕು. ಈ ದಾಖಲೆಗಳನ್ನು ನೀಡಿದ ತಕ್ಷಣ ಖರೀದಿದಾರನು ವಾಹನದ ಮಾಲೀಕತ್ವವನ್ನು (RC Transfer) ತನ್ನ ಹೆಸರಿಗೆ ವರ್ಗಾಯಿಸಿಕೊಳ್ಳಲೇಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>3. RTO Forms, Loan Termination (NOC, Form 35) and Transfer Responsibility:</strong> The Seller is responsible for delivering genuinely signed Form 29 and Form 30. If there is active bank finance, the Seller must clear the loan entirely, obtain NOC, and provide signed Form 35. Upon delivery of these documents, the Buyer must mandatorily transfer the RC.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೪. ನ್ಯಾಯಾಲಯದ ಮೊಕದ್ದಮೆ ಮತ್ತು ದಂಡ ಮುಕ್ತತೆಯ ಭರವಸೆ:</strong> ಈ ವಾಹನವು ಮಾರಾಟದ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದವರೆಗೆ ಯಾವುದೇ ಹಿಂದಿನ ಪೊಲೀಸ್/ ನ್ಯಾಯಾಲಯದ ಪ್ರಕರಣಗಳು, ಆರ್ಟಿಓ ಕಪ್ಪುಪಟ್ಟಿ (Blacklisting) ಅಥವಾ ಬಾಕಿ ಇರುವ ಸಂಚಾರಿ ನಿಯಮ ಉಲ್ಲಂಘನೆಯ ಆನ್‌ಲೈನ್ ದಂಡಗಳಿಂದ ಮುಕ್ತವಾಗಿದೆ ಎಂದು ಖಾತರಿಪಡಿಸುತ್ತಾರೆ.
            </div>
            <div className="bond-clause-english">
              <strong>4. Guarantee Against Litigation and Fines:</strong> The Seller legally guarantees that the vehicle is free from any previous police/ court cases, RTO blacklisting, or pending traffic e-Challans up to the date and time of sale.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೫. ವರ್ಗಾವಣೆ ವಿಫಲತೆಗೆ ದ್ವಿಗುಣ ಹಣದ ದಂಡದ ಷರತ್ತು:</strong> ದಾಖಲೆಗಳ ದೋಷ ಅಥವಾ ಮಾಲೀಕತ್ವದ ದೋಷಗಳಿಂದಾಗಿ ಆರ್ಸಿ ವರ್ಗಾವಣೆ (RC Transfer) ಖಾಯಂ ಆಗಿ ವಿಫಲಗೊಂಡರೆ, ಮಾರಾಟಗಾರನು ಒಟ್ಟು ಖರೀದಿ ಮೊತ್ತದ ಎರಡರಷ್ಟು ಹಣವನ್ನು ಖರೀದಿದಾರನಿಗೆ ಕಾನೂನು ದಂಡದ ರೂಪದಲ್ಲಿ ಮರುಪಾವತಿಸಲು ಬಾಧ್ಯಸ್ಥರಾಗಿರುತ್ತಾರೆ.
            </div>
          </div>
        </div>

        <div className="bond-page-footer">
          <span>Page 3 of 7</span>
        </div>
      </div>

      {/* ===================== PAGE 4 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-4">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page-content">
          <div className="bond-clause-block" style={{ marginBottom: 12 }}>
            <div className="bond-clause-english">
              <strong>5. Penalty for Transfer Failure:</strong> If the RC transfer fails permanently due to document faults or title defects, the Seller shall immediately refund double the total purchase amount to the Buyer as a legal penalty.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೬. ಮೂರನೇ ವ್ಯಕ್ತಿಗಳ ಹಕ್ಕು ಮತ್ತು ಮಾಲೀಕತ್ವ ವಿವಾದಗಳಿಲ್ಲದ ಖಾತರಿ:</strong> ಈ ವಾಹನದ ಮೇಲೆ ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿ, ಹಣಕಾಸು ಸಂಸ್ಥೆ ಅಥವಾ ಕುಟುಂಬದ ಸದಸ್ಯರು ಯಾವುದೇ ಸಿಂಧುತ್ವ ಹೊಂದಿರುವ ಕಾನೂನುಬದ್ಧ ಹಕ್ಕು ಅಥವಾ ಮಾಲೀಕತ್ವದ ವಿವಾದವನ್ನು ಹೊಂದಿಲ್ಲ ಎಂದು ಖಾತರಿಪಡಿಸುತ್ತಾರೆ.
            </div>
            <div className="bond-clause-english">
              <strong>6. No Third-Party Claims:</strong> The Seller guarantees that no third party, financial institution, or family member holds any valid legal claim or ownership dispute over this vehicle.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೭. ಒಪ್ಪಂದದ ವೆಚ್ಚಗಳು ಮತ್ತು ನಷ್ಟ ಪರಿಹಾರ:</strong> ತಪ್ಪು ದಾಖಲೆಗಳು ಅಥವಾ ಮಾರಾಟಗಾರರು ಮುಚ್ಚಿಟ್ಟ ಹಿಂದಿನ ಯಾವುದೇ ಸಮಸ್ಯೆಗಳಿಂದಾಗಿ ಖರೀದಿದಾರರು ಯಾವುದೇ ಮೊಕದ್ದಮೆ ಎದುರಿಸಬೇಕಾಗಿ ಬಂದಲ್ಲಿ ಮಾರಾಟಗಾರನು ಖರೀದಿದಾರನಿಗೆ ಎಲ್ಲಾ ಕಾನೂನು ವೆಚ್ಚಗಳು ಹಾಗೂ ವಕೀಲರ ಶುಲ್ಕವನ್ನು ಭರಿಸಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>7. Legal Costs Indemnification:</strong> If the Buyer faces any litigation or expenses due to faulty paperwork or prior issues hidden by the Seller, the Seller shall immediately indemnify and bear all legal costs and advocate fees incurred by the Buyer.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೮. ಮಾರಾಟಗಾರರಿಂದ ಒಪ್ಪಂದ ರದ್ದುತಿ ಷರತ್ತು:</strong> ಮಾರಾಟಗಾರನು ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡಲು ಒಪ್ಪಿ ಮುಂಗಡ ಹಣವನ್ನು ಪಡೆದ ನಂತರ, ಒಂದು ವೇಳೆ ತಾವಾಗಿಯೇ ಈ ಒಪ್ಪಂದವನ್ನು ರದ್ದುಗೊಳಿಸಿದರೆ, ಅವರು ಖರೀದಿದಾರರು ನಿರ್ಧರಿಸುವ ದಂಡದ ಮೊತ್ತದೊಂದಿಗೆ ಮುಂಗಡ ಹಣವನ್ನು ಮರುಪಾವತಿಸಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>8. Cancellation by Seller:</strong> If the Seller agrees to sell the vehicle and accepts an advance, and subsequently cancels the deal, the Seller shall be legally bound to refund the advance amount along with a penalty amount determined by the Buyer.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೯. ಮಧ್ಯವರ್ತಿ ಮತ್ತು ಮುಕ್ತ ನಮೂನೆಗಳ ಹೊಣೆಗಾರಿಕೆ:</strong> ಒಂದು ವೇಳೆ ಮಾರಾಟಗಾರನು ಅಥವಾ ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸುತ್ತಿರುವ ವ್ಯಕ್ತಿಯು ಮಧ್ಯವರ್ತಿ, ಡೀಲರ್ ಅಥವಾ ಕುಟುಂಬದ ಸದಸ್ಯರಾಗಿದ್ದು, ವಾಹನವನ್ನು ತಮ್ಮ ಹೆಸರಿಗೆ ವರ್ಗಾಯಿಸಿಕೊಳ್ಳದೆ ಮೂಲ ಮಾಲೀಕರ ಸಹಿ ಇರುವ ನಮೂನೆ ೨೯ ಮತ್ತು ೩೦ (Open Forms) ನೀಡಿ ಮಾರಾಟ ಮಾಡುತ್ತಿದ್ದರೆ, ಅವರು ಸಂಪೂರ್ಣ ಕಾನೂನುಬದ್ಧ ಗ್ಯಾರಂಟಿದಾರರಾಗಿ (Legal Guarantor) ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಾರೆ. ಮೂಲ ನೋಂದಾಯಿತ ಮಾಲೀಕರ ಸಹಿಯ ನೈಜತೆಗೆ ಅವರೇ ನೂರಕ್ಕೆ ನೂರರಷ್ಟು ಜವಾಬ್ದಾರರು. ಭವಿಷ್ಯದಲ್ಲಿ ಆರ್ಟಿಓ ವರ್ಗಾವಣೆ ವಿಫಲವಾದಲ್ಲಿ, ಸಹಿ ಹೊಂದಾಣಿಕೆಯಾಗದಿದ್ದಲ್ಲಿ ಅಥವಾ ಮೂಲ ಮಾಲೀಕರು ಯಾವುದೇ ಆಕ್ಷೇಪಣೆ ಎತ್ತಿದರೆ, ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸಿದ ವ್ಯಕ್ತಿಯೇ ಸಂಪೂರ್ಣ ಕಾನೂನು, ಕ್ರಿಮಿನಲ್ ಮತ್ತು ಆರ್ಥಿಕ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಹೊರಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>9. Intermediary & Open Form Liability Clause:</strong> If the Seller or physical handler of the vehicle is an intermediary, dealer, or family member selling the vehicle with pre-signed open forms (Form 29 & 30) without transferring the RC to their own name, they explicitly act as an Absolute Legal Guarantor. They unconditionally guarantee the absolute genuineness of the original Registered Owner's signatures and take 100% legal, civil, criminal, and financial responsibility. In the event of RTO transfer rejection, signature mismatch, or claims made by the original owner, the physical seller shall face all legal consequences and compensate the Buyer immediately.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೧೦. ಮಾರಾಟಗಾರನ ಗುರುತು ಮತ್ತು ಸಮ್ಮತಿ ಖಾತರಿ:</strong> ಈ ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಮಾಡಿ ಹಣವನ್ನು ಪಡೆಯುತ್ತಿರುವ ವ್ಯಕ್ತಿಯು, ಈ ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡಲು ನೋಂದಾಯಿತ ಮಾಲೀಕರಿಂದ ಸ್ಪಷ್ಟವಾದ, ಕಾನೂನುಬದ್ಧವಾದ ಮತ್ತು ನಿರಾಕರಿಸಲಾಗದ ಸಮ್ಮತಿಯನ್ನು ಹೊಂದಿದ್ದಾನೆ ಎಂದು ಖಾತರಿಪಡಿಸುತ್ತಾನೆ. ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸುತ್ತಿರುವ ವ್ಯಕ್ತಿಯ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಇದರೊಂದಿಗೆ ಲಗತ್ತಿಸಲಾಗಿದೆ. ವಾಹನದ ಅನಧಿಕೃತ ಮಾರಾಟ, ವಂಚನೆ ಅಥವಾ ಕಳ್ಳತನಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ನೋಂದಾಯಿತ ಮಾಲೀಕರು ಭವಿಷ್ಯದಲ್ಲಿ ಯಾವುದೇ ವಿವಾದವನ್ನು ಎತ್ತಿದರೆ, ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸಿದ ವ್ಯಕ್ತಿಯೇ ತಮ್ಮ ಸ್ವಂತ ವೆಚ್ಚ ಮತ್ತು ಅಪಾಯದಲ್ಲಿ ಅದನ್ನು ಬಗೆಹರಿಸಬೇಕು ಹಾಗೂ ಖರೀದಿದಾರನನ್ನು ಯಾವುದೇ ಪೊಲೀಸ್ ಅಥವಾ ನ್ಯಾಯಾಲಯದ ಪ್ರಕರಣಗಳಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ಮುಕ್ತಗೊಳಿಸಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>10. Physical Seller Identity & Consent Confirmation:</strong> The physical person executing this agreement and receiving the payment confirms they have the explicit, undeniable, and legally valid consent of the Registered Owner to sell this vehicle. A copy of the physical seller's government ID is mandatory and attached hereto. Any future dispute raised by the Registered Owner regarding unauthorized sale, fraud, or theft shall be strictly faced and settled by the physical seller at their own risk, cost, and consequence, completely indemnifying the Buyer from any police or court matters.
            </div>
          </div>

          {/* Section 4: Second Party (Buyer's) Terms & Responsibilities */}
          <div className="bond-section-heading">
            <span>೪. ಎರಡನೇ ಪಾರ್ಟಿ (ಖರೀದಿದಾರನ) ಷರತ್ತುಗಳು / 4. SECOND PARTY (BUYER'S) TERMS & RESPONSIBILITIES</span>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೧. ವಾಹನದ ತಪಾಸಣೆ ಮತ್ತು ತೃಪ್ತಿ:</strong> ಎರಡನೇ ಪಾರ್ಟಿಯು (ಖರೀದಿದಾರ) ವಾಹನದ ಎಂಜಿನ್, ಬಾಡಿ, ದಾಖಲೆಗಳು ಮತ್ತು ಅದರ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ತೃಪ್ತಿಕರವಾಗಿ ತಪಾಸಣೆ ಮಾಡಿದ ನಂತರವೇ ಖರೀದಿಸುತ್ತಿದ್ದಾರೆ. ಇಂದಿನಿಂದ ಮುಂದಕ್ಕೆ ಮೊದಲ ಪಾರ್ಟಿಯು ಯಾವುದೇ ರೀತಿಯ ಯಾಂತ್ರಿಕ ದೋಷಗಳಿಗೆ ಅಥವಾ ದುರಸ್ತಿಗಳಿಗೆ ಜವಾಬ್ದಾರರಾಗಿರುವುದಿಲ್ಲ.
            </div>
          </div>
        </div>

        <div className="bond-page-footer">
          <span>Page 4 of 7</span>
        </div>
      </div>

      {/* ===================== PAGE 5 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-5">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page-content">
          <div className="bond-clause-block" style={{ marginBottom: 10 }}>
            <div className="bond-clause-english">
              <strong>1. Vehicle Inspection and Satisfaction:</strong> The Second Party (Buyer) is purchasing the vehicle only after a satisfactory inspection of the vehicle's engine, body, documents, and current condition. From now onwards, the First Party shall not be responsible for any mechanical faults or repairs.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೨. ನಾಗರಿಕ ಮತ್ತು ಅಪರಾಧ ಹೊಣೆಗಾರಿಕೆ:</strong> ಇಂದಿನ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ, ಈ ವಾಹನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಅಪಘಾತ, ಜೀವಹಾನಿ, ಸಾರ್ವಜನಿಕ ಆಸ್ತಿಗೆ ಹಾನಿ, ಕಳ್ಳತನ, ಕಳ್ಳಸಾಗಾಣಿಕೆ, ಮಾದಕ ದ್ರವ್ಯ ಅಥವಾ ಯಾವುದೇ ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳಿಗೆ ಖರೀದಿದಾರ ಮಾತ್ರವೇ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ.
            </div>
            <div className="bond-clause-english">
              <strong>2. Civil and Criminal Liability:</strong> With effect from today's date and time, for any accident, loss of life, damage to property, theft, smuggling, drug trafficking, or any illegal activities involving this vehicle, the Second Party (Buyer) shall be solely held responsible.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೩. ಸಂಚಾರಿ ನಿಯಮ ಉಲ್ಲಂಘನೆ ದಂಡಗಳು:</strong> ಇಂದಿನ ನಿರ್ದಿಷ್ಟ ಸಮಯದ ನಂತರ ದಾಖಲಾಗುವ ಯಾವುದೇ ಆನ್‌ಲೈನ್ ಟ್ರಾಫಿಕ್ ದಂಡಗಳು (ಇ-ಚಲನ್‌ಗಳು) ಅಥವಾ ಪೊಲೀಸ್ ಪ್ರಕರಣಗಳಿಗೆ ಎರಡನೇ ಪಾರ್ಟಿ ಮಾತ್ರವೇ ದಂಡ ಮತ್ತು ಜುಲ್ಮಾನೆಗಳನ್ನು ಪಾವತಿಸಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>3. Traffic Violations and Fines:</strong> For any online traffic fines (e-Challans) or police cases registered after today's specified time, the Second Party alone shall pay the fines and penalties.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೪. ಮರುಮಾರಾಟ ಮತ್ತು ಅಡಮಾನ ನಿಷೇಧ:</strong> ನೋಂದಣಿ ಪತ್ರವನ್ನು (RC) ತಮ್ಮದೇ ಹೆಸರಿಗೆ ವರ್ಗಾಯಿಸಿಕೊಳ್ಳುವ ಮುನ್ನ ಎರಡನೇ ಪಾರ್ಟಿಯು ಈ ವಾಹನವನ್ನು ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಗೆ ಮರುಮಾರಾಟ ಮಾಡುವುದನ್ನು ಅಥವಾ ಅಡಮಾನ/ಸಾಲದ ರೂಪದಲ್ಲಿ ಇಡುವುದನ್ನು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.
            </div>
            <div className="bond-clause-english">
              <strong>4. Prohibition of Resale and Pledging:</strong> Before transferring the RC to their own name, the Second Party is strictly prohibited from reselling this vehicle to any third party or placing it as a pledge/loan.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೫. ಭವಿಷ್ಯದ ವಿವಾದಗಳ ನಷ್ಟ ಪರಿಹಾರ:</strong> ಈ ವಾಹನಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭವಿಷ್ಯದಲ್ಲಿ ಯಾವುದೇ ನ್ಯಾಯಾಲಯದ ವಿವಾದಗಳು, ಪೊಲೀಸ್ ಜಪ್ತಿಗಳು ಅಥವಾ ಆರ್ಟಿಓ ಕಛೇರಿಯಿಂದ ದಂಡಗಳು ಉದ್ಭವಿಸಿದರೆ, ಎರಡನೇ ಪಾರ್ಟಿಯು ಮೊದಲ ಪಾರ್ಟಿಗೆ ಉಂಟಾಗುವ ಆರ್ಥಿಕ ನಷ್ಟಗಳು ಮತ್ತು ಕಾನೂನು ವೆಚ್ಚಗಳನ್ನು ಭರಿಸಬೇಕು.
            </div>
            <div className="bond-clause-english">
              <strong>5. Indemnification of Future Disputes:</strong> In connection with this vehicle, if any future court disputes, police seizures, or penalties from the RTO office arise, the Second Party shall indemnify and bear all financial losses and legal costs incurred by the First Party.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೬. ವಾಹನ ಹಿಂತಿರುಗಿಸುವಿಕೆ ನಿಯಮ:</strong> ವಾಹನವನ್ನು ಖರೀದಿಸಿದ ನಂತರ, ಎರಡನೇ ಪಾರ್ಟಿಯು ಅದನ್ನು ತಕ್ಷಣವೇ ಹಿಂತಿರುಗಿಸಲು ಪ್ರಯತ್ನಿಸಿದರೆ, ಅವರು ಮಾರಾಟದ ಬೆಲೆಯ ಕೇವಲ 50% ರಷ್ಟು ಹಣವನ್ನು ಮಾತ್ರ ಹಿಂತಿರುಗಿ ಪಡೆಯಲು ಅರ್ಹರಾಗಿರುತ್ತಾರೆ. ತಡವಾಗಿ ಹಿಂತಿರುಗಿಸಿದರೆ ವಾಹನದ ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯದ ಆಧಾರದ ಮೇಲೆ ನಿರ್ಧರಿಸಲಾಗುವುದು.
            </div>
            <div className="bond-clause-english">
              <strong>6. Vehicle Return Policy:</strong> After purchasing the vehicle, if the Second Party tries to return it immediately, they shall be entitled to receive only 50% of the sale price back. Subsequent returns will be decided based on market value.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೭. ಮುಂಗಡ ಹಣ ಮುಟ್ಟುಗೋಲು:</strong> ಮುಂಗಡ ಹಣದ ಪಾವತಿಯನ್ನು ಮಾಡಿದ ನಂತರ ಎರಡನೇ ಪಾರ್ಟಿಯು ಒಪ್ಪಂದವನ್ನು ರದ್ದುಗೊಳಿಸಿದರೆ ಅಥವಾ ಒಪ್ಪಿದ ಸಮಯದೊಳಗೆ ವಾಹನವನ್ನು ವಶಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಲು ವಿಫಲರಾದರೆ, ಮುಂಗಡ ಹಣವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಳ್ಳಲಾಗುವುದು (ಹಿಂತಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ).
            </div>
            <div className="bond-clause-english">
              <strong>7. Forfeiture of Advance Amount:</strong> If the Second Party cancels the deal after paying the advance or fails to take delivery within the agreed time, the advance amount shall be strictly non-refundable and will be entirely forfeited.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೮. ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ ಮತ್ತು ಖರೀದಿದಾರನ ಸಂಪೂರ್ಣ ಹೊಣೆಗಾರಿಕೆ ನಿಯಮ:</strong> ವಾಹನದ ಮಾಲೀಕತ್ವವು (RC Transfer) ಖರೀದಿದಾರನ ಹೆಸರಿಗೆ ಅಧಿಕೃತವಾಗಿ ಮತ್ತು ಸಂಪೂರ್ಣವಾಗಿ ವರ್ಗಾವಣೆಯಾಗುವವರೆಗೂ, ವಾಹನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಎಲ್ಲಾ ನಾಗರಿಕ, ಅಪರಾಧ ಮತ್ತು ಕಾನೂನು ಜವಾಬ್ದಾರಿಗಳು ಕಡ್ಡಾಯವಾಗಿ ಖರೀದಿದಾರನ ಮೇಲೆಯೇ ಇರುತ್ತವೆ. ಈ ಮಧ್ಯಂತರ ಅವಧಿಯಲ್ಲಿ ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಅಪಘಾತ, ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳು ಅಥವಾ ಯಾವುದೇ ಘಟನೆಗಳು ಸಂಭವಿಸಿದಲ್ಲಿ ಅದಕ್ಕೆ ಖರೀದಿದಾರನಾದ ನಾನೇ ಸಂಪೂರ್ಣ ಜವಾಬ್ದಾರನಾಗಿರುತ್ತೇನೆ ಮತ್ತು ನಾನು ಇದಕ್ಕೆ ಸಮ್ಮತಿಸುತ್ತೇನೆ. ಖರೀದಿದಾರನು ನೋಂದಾಯಿತ ಮಾಲೀಕರ ಮೇಲೆ ಅಥವಾ ಡೀಲರ್ ಮೇಲೆ ಯಾವುದೇ ರೀತಿಯ ಜವಾಬ್ದಾರಿ, ಆಪಾದನೆ ಅಥವಾ ಕಾನೂನು ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಹೊರಿಸುವುದಿಲ್ಲ ಎಂದು ಒಪ್ಪಿಕೊಳ್ಳುತ್ತಾನೆ. ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಘಟನೆ ಸಂಭವಿಸಿದಲ್ಲಿ ಎದುರಾಗುವ ಎಲ್ಲಾ ಪೊಲೀಸ್ ಸ್ಟೇಷನ್ ವಿಷಯಗಳನ್ನು ಮತ್ತು ನ್ಯಾಯಾಲಯದ ಕಾನೂನು ಪ್ರಕರಣಗಳನ್ನು ಖರೀದಿದಾರನಾದ ನಾನೇ ನನ್ನ ಸ್ವಂತ ಹಣ ಮತ್ತು ವೆಚ್ಚದಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ಎದುರಿಸುತ್ತೇನೆ.
            </div>
            <div className="bond-clause-english">
              <strong>8. Ownership Transfer and Absolute Buyer Liability Clause:</strong> Until the vehicle ownership (RC Transfer) is officially and completely transferred to the Buyer's name, all civil, criminal, and legal responsibilities regarding the vehicle rest strictly and entirely upon the Buyer. If any accident, illegal activities, or anything happens during this interim period, the Buyer alone is completely responsible for that, and I (buyer) expressly agree to the same. The Buyer agrees and covenants that he will NOT put or place any liability, blame, or legal responsibility on the Registered Owner or the Dealer.
            </div>
          </div>
        </div>

        <div className="bond-page-footer">
          <span>Page 5 of 7</span>
        </div>
      </div>

      {/* ===================== PAGE 6 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-6">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page-content">
          <div className="bond-clause-block" style={{ marginBottom: 12 }}>
            <div className="bond-clause-english">
              In case of any eventuality, the Buyer alone shall face all police station matters and legal court cases entirely with my own money and expenses.
            </div>
          </div>

          {/* Section 5: Delivery Details */}
          <div className="bond-section-heading">
            <span>೫. ವಾಹನ ಹಸ್ತಾಂತರದ ಸಮಯ / 5. DELIVERY DETAILS</span>
          </div>
          <div className="bond-delivery-grid">
            <div className="bond-delivery-cell">
              <span className="bond-delivery-lbl">ಹಸ್ತಾಂತರಿಸಿದ ದಿನಾಂಕ / Date of Delivery</span>
              <span className="bond-delivery-val">{formattedTxDate}</span>
            </div>
            <div className="bond-delivery-cell">
              <span className="bond-delivery-lbl">ಹಸ್ತಾಂತರಿಸಿದ ಸಮಯ / Time of Delivery</span>
              <span className="bond-delivery-val">{deliveryTime}</span>
            </div>
          </div>

          {/* Section 6: Declaration */}
          <div className="bond-section-heading">
            <span>೬. ಘೋಷಣೆ / 6. DECLARATION</span>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೧. ಇ-ಸ್ಟ್ಯಾಂಪ್ ವಿಳಂಬ ಒಪ್ಪಂದ:</strong> ಸರ್ಕಾರಿ ಸರ್ವರ್ ಸಮಸ್ಯೆಗಳು, ತಾಂತ್ರಿಕ ಅಡಚಣೆಗಳು ಅಥವಾ ಸಾರ್ವಜನಿಕ ರಜಾದಿನಗಳ ಕಾರಣದಿಂದಾಗಿ ಇ-ಸ್ಟ್ಯಾಂಪ್ (E-Stamp) ಪತ್ರವನ್ನು ಪಡೆಯುವುದು ವಿಳಂಬವಾದಲ್ಲಿ, ಈ ಒಪ್ಪಂದವು ವಾಹನ ವಹಿವಾಟಿನ ಮೂಲ ದಿನಾಂಕದಿಂದಲೇ ಸಂಪೂರ್ಣವಾಗಿ ಮಾನ್ಯವಾಗಿರುತ್ತದೆ ಮತ್ತು ಕಾನೂನುಬದ್ಧವಾಗಿ ಜಾರಿಯಲ್ಲಿರುತ್ತದೆ ಎಂದು ಎರಡೂ ಪಕ್ಷಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಒಪ್ಪಿಕೊಳ್ಳುತ್ತವೆ. ಒಂದು ವೇಳೆ ವಿತರಿಸಲಾದ ಇ-ಸ್ಟ್ಯಾಂಪ್ ಪತ್ರವು ನಂತರದ ದಿನಾಂಕವನ್ನು ಹೊಂದಿದ್ದರೂ ಸಹ, ಈ ಒಪ್ಪಂದವನ್ನು ವಾಹನ ವಹಿವಾಟು ನಡೆದ ನೈಜ ದಿನಾಂಕದಿಂದಲೇ ಸಕ್ರಿಯ ಮತ್ತು ಕಾನೂನುಬದ್ಧವಾಗಿ ಜಾರಿಗೊಳಿಸಬಹುದಾದ ಒಪ್ಪಂದವೆಂದು ಪರಿಗಣಿಸಲಾಗುವುದು.
            </div>
            <div className="bond-clause-english">
              <strong>1. E-Stamp Delay Agreement:</strong> If the generation of the E-Stamp paper is delayed due to government server issues, technical downtime, or public holidays, both parties explicitly agree that this contract remains fully valid and legally binding from the original execution date. Even if the issued E-Stamp paper reflects a later date, this agreement shall be treated as active and legally enforceable from the actual date of vehicle transaction.
            </div>
          </div>

          <div className="bond-clause-block">
            <div className="bond-clause-kannada">
              <strong>೨.</strong> ನಾನು, ಮೊದಲ ಪಾರ್ಟಿ (ಮಾರಾಟಗಾರ) ಮತ್ತು ನಾನು, ಎರಡನೇ ಪಾರ್ಟಿ (ಖರೀದಿದಾರ), ಈ ಮೂಲಕ ನಾವು ಈ ಒಪ್ಪಂದದ ಪ್ರತಿಯೊಂದು ನಿಯಮವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಓದಿ ಅಥವಾ ಓದದಿದ್ದಲ್ಲಿ ಈ ಇಡೀ ಒಪ್ಪಂದವನ್ನು ಪೂರ್ಣವಾಗಿ ಆಲಿಸಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇವೆ ಎಂದು ಘೋಷಿಸುತ್ತೇವೆ. ಎಲ್ಲವನ್ನೂ ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಿದ ನಂತರ, ನಾವು ಈ ಒಪ್ಪಂದಕ್ಕೆ ಸಮ್ಮತಿಸುತ್ತೇವೆ ಮತ್ತು ಯಾವುದೇ ಬಲವಂತ ಅಥವಾ ಒತ್ತಡವಿಲ್ಲದೆ, ನಮ್ಮ ಪೂರ್ಣ ಪ್ರಜ್ಞಾವಸ್ಥೆಯಲ್ಲಿ ಸಾಕ್ಷಿಗಳ ಸಮ್ಮುಖದಲ್ಲಿ ಒಪ್ಪಿ ಸಹಿ ಮಾಡಿದ್ದೇವೆ.
            </div>
            <div className="bond-clause-english">
              <strong>2.</strong> I, the First Party (Seller) and I, the Second Party (Buyer), hereby declare that we have completely read, or if unable to read, have listened to this entire agreement and fully understood each and every term. Having fully comprehended everything, we are agreeing to this contract and placing our signatures in our full conscious state of mind, without any coercion or pressure, in the presence of the following witnesses.
            </div>
          </div>

          {/* Section 7: Signatures & Execution */}
          <div className="bond-section-heading">
            <span>೭. ಸಹಿಗಳು / 7. SIGNATURES AND EXECUTION</span>
          </div>

          <div className="bond-sigs-container">
            {/* First Party (Seller) Signature */}
            <div className="bond-sig-card">
              <span className="bond-sig-card-title">ಮೊದಲ ಪಾರ್ಟಿ (ಮಾರಾಟಗಾರ) / FIRST PARTY (SELLER)</span>
              <div className="bond-sig-preview-slot">
                {sellerSignSrc ? (
                  <img src={sellerSignSrc} alt="Seller Signature" className="bond-sig-preview-img" />
                ) : null}
              </div>
              <div className="bond-sig-card-line" />
              <span className="bond-sig-card-label">ಹೆಬ್ಬೆಟ್ಟಿನ ಗುರುತು / ಸಹಿ: / Thumb Impression / Signature</span>
              <span className="bond-sig-card-date">ದಿನಾಂಕ / Date: <strong>{formattedTxDate}</strong></span>
              <span className="bond-sig-card-label" style={{ marginTop: 2, fontWeight: 800 }}>ಮಾರಾಟಗಾರನ ಸಹಿ / Seller's Signature</span>
            </div>

            {/* Second Party (Buyer) Signature */}
            <div className="bond-sig-card">
              <span className="bond-sig-card-title">ಎರಡನೇ ಪಾರ್ಟಿ (ಖರೀದಿದಾರ) / SECOND PARTY (BUYER)</span>
              <div className="bond-sig-preview-slot">
                {buyerSignSrc ? (
                  <img src={buyerSignSrc} alt="Buyer Signature" className="bond-sig-preview-img" />
                ) : null}
              </div>
              <div className="bond-sig-card-line" />
              <span className="bond-sig-card-label">ಹೆಬ್ಬೆಟ್ಟಿನ ಗುರುತು / ಸಹಿ: / Thumb Impression / Signature</span>
              <span className="bond-sig-card-date">ದಿನಾಂಕ / Date: <strong>{formattedTxDate}</strong></span>
              <span className="bond-sig-card-label" style={{ marginTop: 2, fontWeight: 800 }}>ಖರೀದಿದಾರನ ಸಹಿ / Buyer's Signature</span>
            </div>
          </div>
        </div>

        <div className="bond-page-footer">
          <span>Page 6 of 7</span>
        </div>
      </div>

      {/* ===================== PAGE 7 OF 7 ===================== */}
      <div className="bond-page" data-testid="bond-page-7">
        <div className="bond-estamp-header">
          <span className="bond-estamp-label">E Stamp Certificate No:</span>
          <span className="bond-estamp-val">{eStampCertNo || "_______________________"}</span>
        </div>

        <div className="bond-page-content">
          <div className="bond-section-heading">
            <span>ಸಾಕ್ಷಿಗಳು / WITNESSES</span>
          </div>

          <div className="bond-witnesses-grid">
            {/* Witness 1 */}
            <div className="bond-witness-card">
              <div className="bond-witness-card-title">1. ಸಾಕ್ಷಿ 1 ರ ವಿವರಗಳು / Witness 1 Details:</div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ಹೆಸರು / Name:</span>
                <div className="bond-witness-field-line">{witness1.name || ""}</div>
              </div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ವಿಳಾಸ / Full Address:</span>
                <div className="bond-witness-field-line">{witness1.address || ""}</div>
              </div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ಫೋನ್ / Phone No:</span>
                <div className="bond-witness-field-line">{witness1.phone || witness1.mobile || ""}</div>
              </div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ಸಹಿ / Witness Signature:</span>
                <div className="bond-witness-sig-slot">
                  {witness1SignSrc ? (
                    <img src={witness1SignSrc} alt="Witness 1 Signature" style={{ maxHeight: 34, maxWidth: "90%", objectFit: "contain" }} />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Witness 2 */}
            <div className="bond-witness-card">
              <div className="bond-witness-card-title">2. ಸಾಕ್ಷಿ 2 ರ ವಿವರಗಳು / Witness 2 Details:</div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ಹೆಸರು / Name:</span>
                <div className="bond-witness-field-line">{witness2.name || ""}</div>
              </div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ವಿಳಾಸ / Full Address:</span>
                <div className="bond-witness-field-line">{witness2.address || ""}</div>
              </div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ಫೋನ್ / Phone No:</span>
                <div className="bond-witness-field-line">{witness2.phone || witness2.mobile || ""}</div>
              </div>
              <div className="bond-witness-field">
                <span className="bond-witness-field-lbl">ಸಹಿ / Witness Signature:</span>
                <div className="bond-witness-sig-slot">
                  {/* Blank or line for Witness 2 signature */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bond-page-footer">
          <span>Page 7 of 7</span>
        </div>
      </div>
    </div>
  );
}
