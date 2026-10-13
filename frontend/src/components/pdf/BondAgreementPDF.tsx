import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Noto Sans Kannada for PDF rendering of bilingual text
try {
  Font.register({
    family: "NotoSansKannada",
    fonts: [
      {
        src: "https://fonts.gstatic.com/ea/notosanskannada/v1/NotoSansKannada-Regular.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://fonts.gstatic.com/ea/notosanskannada/v1/NotoSansKannada-Bold.ttf",
        fontWeight: "bold",
      },
    ],
  });
} catch (e) {
  // Fallback to standard Helvetica if font registration fails or is offline
}

export interface BondAgreementPDFProps {
  deal: any;
  resolvedImages?: {
    sellerSignature?: string | null;
    buyerSignature?: string | null;
    witnessSignature?: string | null;
  };
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 36,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#111827",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  estampHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 0.8,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
    marginBottom: 12,
  },
  estampLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    marginRight: 4,
  },
  estampVal: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    minWidth: 140,
    borderBottomWidth: 0.6,
    borderBottomColor: "#9ca3af",
  },
  pageFooter: {
    borderTopWidth: 0.8,
    borderTopColor: "#e5e7eb",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  pageFooterText: {
    fontSize: 7.5,
    color: "#6b7280",
    fontFamily: "Helvetica",
  },
  // Section Headings
  sectionHeading: {
    backgroundColor: "#f3f4f6",
    borderLeftWidth: 3,
    borderLeftColor: "#1e3a5f",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    marginTop: 8,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 5,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#374151",
  },
  boxCheck: {
    width: 9,
    height: 9,
    borderWidth: 0.8,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  // Tables
  table: {
    borderWidth: 0.6,
    borderColor: "#cbd5e1",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.6,
    borderBottomColor: "#cbd5e1",
    minHeight: 14,
    alignItems: "center",
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 14,
    alignItems: "center",
  },
  tdLabel: {
    width: "35%",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRightWidth: 0.6,
    borderRightColor: "#cbd5e1",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  tdVal: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  subtextNote: {
    fontSize: 7,
    color: "#475569",
    fontStyle: "italic",
    marginBottom: 6,
  },
  // Clauses
  clauseBlock: {
    marginBottom: 6,
    lineHeight: 1.35,
  },
  clauseKannada: {
    fontSize: 7.8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 1.5,
  },
  clauseEnglish: {
    fontSize: 7.4,
    fontFamily: "Helvetica",
    color: "#374151",
  },
  clauseBold: {
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },
  // Delivery Grid
  deliveryGrid: {
    flexDirection: "row",
    borderWidth: 0.6,
    borderColor: "#cbd5e1",
    marginVertical: 6,
  },
  deliveryCell: {
    flex: 1,
    padding: 6,
  },
  deliveryCellBorder: {
    flex: 1,
    padding: 6,
    borderRightWidth: 0.6,
    borderRightColor: "#cbd5e1",
  },
  deliveryLbl: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    marginBottom: 2,
  },
  deliveryVal: {
    fontSize: 8.8,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },
  // Sigs
  sigsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  sigCard: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: "#cbd5e1",
    padding: 6,
    backgroundColor: "#f8fafc",
    minHeight: 85,
    justifyContent: "space-between",
  },
  sigCardTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    textAlign: "center",
    borderBottomWidth: 0.6,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 2,
    marginBottom: 4,
  },
  sigSlot: {
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sigImg: {
    maxHeight: 28,
    maxWidth: "85%",
    objectFit: "contain",
  },
  sigLine: {
    borderTopWidth: 0.6,
    borderTopColor: "#475569",
    marginVertical: 2,
  },
  sigCardLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textAlign: "center",
  },
  // Witness Cards
  witnessGrid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  witnessCard: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: "#cbd5e1",
    padding: 10,
    backgroundColor: "#ffffff",
  },
  witnessCardTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0a2342",
    paddingBottom: 3,
  },
  witnessField: {
    marginBottom: 10,
  },
  witnessFieldLbl: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    marginBottom: 1.5,
  },
  witnessFieldVal: {
    minHeight: 12,
    borderBottomWidth: 0.6,
    borderBottomColor: "#94a3b8",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    paddingBottom: 1,
  },
});

function formatINR(val: any) {
  if (val === undefined || val === null || val === "" || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString("en-IN");
}

function formatDate(val: any) {
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

export const BondAgreementPDF: React.FC<BondAgreementPDFProps> = ({
  deal = {},
  resolvedImages = {},
}) => {
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
  const eStampCertNo = deal.eStampNumber || deal.e_stamp_number || deal.bondCertificateNo || deal.bond_certificate_no || "";

  const agreedPrice = Number(payments.selling_price ?? payments.purchase_price ?? 0);
  const tokenAdvance = Number(payments.received_from_buyer ?? payments.paid_to_seller ?? 0);
  const balanceAmount = Math.max(0, agreedPrice - tokenAdvance);
  const paymentMethod = (payments.payment_method || "Cash").toLowerCase();

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

  const sellerSign = resolvedImages.sellerSignature || deal.photos?.seller_signature || null;
  const buyerSign = resolvedImages.buyerSignature || deal.photos?.buyer_signature || null;
  const witness1Sign = resolvedImages.witnessSignature || deal.photos?.witness_signature || null;

  const sellerAddress = [seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(", ");
  const buyerAddress = [buyer.address, buyer.city, buyer.state, buyer.pincode].filter(Boolean).join(", ");

  return (
    <Document>
      {/* ── Page 1 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 60, alignItems: "center" }}>
          <View style={{ alignSelf: "flex-end", flexDirection: "row", marginBottom: 14 }}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold" }}>ದಿನಾಂಕ / Date: </Text>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", borderBottomWidth: 0.6, paddingHorizontal: 6 }}>
              {formattedTxDate}
            </Text>
          </View>

          <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 5, textAlign: "center" }}>
            ವಾಹನ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಒಪ್ಪಂದ ಪತ್ರ
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1f2937", marginBottom: 8, letterSpacing: 0.5, textAlign: "center" }}>
            VEHICLE PURCHASE AND SALE AGREEMENT
          </Text>
          <Text style={{ fontSize: 12, letterSpacing: 2, marginBottom: 10, color: "#4b5563" }}>*******</Text>

          <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 3 }}>
            ಈ ವಾಹನ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಒಪ್ಪಂದವನ್ನು ಇಂದು ಇವರ ನಡುವೆ ಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ:
          </Text>
          <Text style={{ fontSize: 9, fontStyle: "italic", textAlign: "center", color: "#374151" }}>
            This Vehicle Purchase and Sale Agreement is entered into by and between:
          </Text>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 1 of 7</Text>
        </View>
      </Page>

      {/* ── Page 2 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>ಮೊದಲ ಪಾರ್ಟಿ / FIRST PARTY : ಮಾರಾಟಗಾರರು / SELLER</Text>
          </View>
          <View style={styles.checkboxRow}>
            <View style={styles.checkboxItem}>
              <View style={styles.boxCheck}><Text>✓</Text></View>
              <Text>ನೋಂದಾಯಿತ ಮಾಲೀಕರು / Registered Owner</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={styles.boxCheck}><Text> </Text></View>
              <Text>ಡೀಲರ್ / Dealer</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಹೆಸರು ಅಥವಾ ಸಂಸ್ಥೆಯ ಹೆಸರು / Name or Firm Name</Text>
              <Text style={styles.tdVal}>{seller.name || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ತಂದೆಯ ಹೆಸರು / Father's Name</Text>
              <Text style={styles.tdVal}>{seller.father_name || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ವಿಳಾಸ / Address</Text>
              <Text style={styles.tdVal}>{sellerAddress || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile No</Text>
              <Text style={styles.tdVal}>{seller.phone || seller.mobile || "—"}</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tdLabel}>ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar Number</Text>
              <Text style={styles.tdVal}>{seller.id_number || seller.aadhaar || "—"}</Text>
            </View>
          </View>
          <Text style={styles.subtextNote}>
            ಇವರನ್ನು ಇನ್ನು ಮುಂದೆ ಒಪ್ಪಂದದಲ್ಲಿ "ಮಾರಾಟಗಾರ" ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ. / Hereinafter referred to as the "Seller".
          </Text>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>ಎರಡನೇ ಪಾರ್ಟಿ / SECOND PARTY : ಖರೀದಿದಾರರು / BUYER</Text>
          </View>
          <View style={styles.checkboxRow}>
            <View style={styles.checkboxItem}>
              <View style={styles.boxCheck}><Text>✓</Text></View>
              <Text>ಖರೀದಿದಾರ / Buyer (Customer)</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={styles.boxCheck}><Text> </Text></View>
              <Text>ಡೀಲರ್ / Dealer</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಹೆಸರು ಅಥವಾ ಸಂಸ್ಥೆಯ ಹೆಸರು / Name or Firm Name</Text>
              <Text style={styles.tdVal}>{buyer.name || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ತಂದೆಯ ಹೆಸರು / Father's Name</Text>
              <Text style={styles.tdVal}>{buyer.father_name || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ವಿಳಾಸ / Address</Text>
              <Text style={styles.tdVal}>{buyerAddress || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile No</Text>
              <Text style={styles.tdVal}>{buyer.phone || buyer.mobile || "—"}</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tdLabel}>ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar Number</Text>
              <Text style={styles.tdVal}>{buyer.id_number || buyer.aadhaar || "—"}</Text>
            </View>
          </View>
          <Text style={styles.subtextNote}>
            ಇವರನ್ನು ಇನ್ನು ಮುಂದೆ ಒಪ್ಪಂದದಲ್ಲಿ "ಖರೀದಿದಾರ" ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ. / Hereinafter referred to as the "Buyer".
          </Text>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೧. ವಾಹನದ ವಿವರಗಳು / 1. DESCRIPTION OF THE VEHICLE</Text>
          </View>
          <Text style={{ fontSize: 7.2, color: "#374151", marginBottom: 3 }}>
            ಮಾರಾಟಗಾರನು ತನ್ನ ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡಲು ಮತ್ತು ಖರೀದಿದಾರನು ಅದನ್ನು ಖರೀದಿಸಲು ಒಪ್ಪಿಕೊಂಡಿರುತ್ತಾರೆ. ಆ ವಾಹನದ ವಿವರಗಳು ಈ ಕೆಳಗಿನಂತಿವೆ: / The Seller agrees to sell, and the Buyer agrees to purchase, the following vehicle:
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ವಾಹನದ ಪ್ರಕಾರ / Vehicle Type</Text>
              <View style={[styles.tdVal, { flexDirection: "row", gap: 14 }]}>
                <View style={styles.checkboxItem}>
                  <View style={styles.boxCheck}><Text>{isCar ? "✓" : " "}</Text></View>
                  <Text>Car / ಕಾರು</Text>
                </View>
                <View style={styles.checkboxItem}>
                  <View style={styles.boxCheck}><Text>{isBike ? "✓" : " "}</Text></View>
                  <Text>Bike / ಬೈಕ್</Text>
                </View>
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ತಯಾರಕ ಕಂಪನಿ / Make (Brand)</Text>
              <Text style={styles.tdVal}>{make || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಮಾಡೇಲ್ / Model</Text>
              <Text style={styles.tdVal}>{model || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ತಯಾರಿಕಾ ವರ್ಷ / Year of Manufacture</Text>
              <Text style={styles.tdVal}>{year || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಬಣ್ಣ / Color</Text>
              <Text style={styles.tdVal}>{color}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ನೋಂದಣಿ ಸಂಖ್ಯೆ / Registration Number</Text>
              <Text style={[styles.tdVal, { fontFamily: "Helvetica-Bold" }]}>{regNumber || "—"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tdLabel}>ಚಾಸಿಸ್ ಸಂಖ್ಯೆ / Chassis Number</Text>
              <Text style={styles.tdVal}>{chassisNumber || "—"}</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tdLabel}>ಎಂಜಿನ್ ಸಂಖ್ಯೆ / Engine Number</Text>
              <Text style={styles.tdVal}>{engineNumber || "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 2 of 7</Text>
        </View>
      </Page>

      {/* ── Page 3 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೨. ಒಟ್ಟು ಮೊತ್ತ ಮತ್ತು ಪಾವತಿ ನಿಯಮಗಳು / 2. PURCHASE PRICE AND PAYMENT TERMS</Text>
          </View>

          <View style={{ fontSize: 7.8, lineHeight: 1.45, marginVertical: 4 }}>
            <Text>• ಒಟ್ಟು ಮಾರಾಟದ ಮೊತ್ತ: ವಾಹನದ ಒಟ್ಟು ಮೊತ್ತವನ್ನು ರೂ. {formatINR(agreedPrice)} ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</Text>
            <Text>• Total Purchase Price: The total agreed purchase price for the Vehicle is fixed at Rs. {formatINR(agreedPrice)}.</Text>
            <View style={{ flexDirection: "row", gap: 12, marginVertical: 3 }}>
              <Text>• ಪಾವತಿಯ ವಿಧಾನ / Mode of Payment:</Text>
              <View style={styles.checkboxItem}><View style={styles.boxCheck}><Text>{paymentMethod === "cash" ? "✓" : " "}</Text></View><Text>ನಗದು (Cash)</Text></View>
              <View style={styles.checkboxItem}><View style={styles.boxCheck}><Text>{paymentMethod.includes("upi") ? "✓" : " "}</Text></View><Text>ಯುಪಿಐ (UPI)</Text></View>
              <View style={styles.checkboxItem}><View style={styles.boxCheck}><Text>{paymentMethod.includes("loan") ? "✓" : " "}</Text></View><Text>ಸಾಲ (Loan)</Text></View>
            </View>
            <Text>• ಮುಂಗಡ ಹಣ: ರೂ. {formatINR(tokenAdvance)} ಅನ್ನು ದಿನಾಂಕ: {formattedTxDate} ರಂದು ಪಾವತಿಸಲಾಗಿದೆ.</Text>
            <Text>• Token Amount: An advance of Rs. {formatINR(tokenAdvance)} has been paid on [Date] {formattedTxDate}.</Text>
            <Text>• ಬಾಕಿ ಮೊತ್ತ: ಉಳಿದ ಪೂರ್ಣ ಬಾಕಿ ಮೊತ್ತ ರೂ. {formatINR(balanceAmount)} ಅನ್ನು ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸುವ ಅಧಿಕೃತ ದಿನಾಂಕದಂದು ಅಥವಾ ದಿನಾಂಕ: {formattedTxDate} ರೊಳಗೆ ಪಾವತಿಸತಕ್ಕದ್ದು.</Text>
            <Text>• Balance Amount: The remaining full balance of Rs. {formatINR(balanceAmount)} shall be paid on or before the official delivery date {formattedTxDate}.</Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೩. ಮೊದಲ ಪಾರ್ಟಿ (ಮಾರಾಟಗಾರನ) ಷರತ್ತುಗಳು / 3. FIRST PARTY (SELLER'S) REPRESENTATIONS & WARRANTIES</Text>
          </View>
          <View style={styles.checkboxRow}>
            <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold" }}>ಮಾರಾಟಗಾರನ ಅರ್ಹತೆ / Seller's Status:</Text>
            <View style={styles.checkboxItem}><View style={styles.boxCheck}><Text>✓</Text></View><Text>ಕಾನೂನುಬದ್ಧ ಅಸಲಿ ಮಾಲೀಕ / Absolute Legal Owner</Text></View>
            <View style={styles.checkboxItem}><View style={styles.boxCheck}><Text> </Text></View><Text>ಅಧಿಕೃತ ಡೀಲರ್ / Authorized Dealer</Text></View>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೧. ನಾಗರಿಕ ಮತ್ತು ಅಪರಾಧ ಜವಾಬ್ದಾರಿ: ನೋಂದಣಿ ಪತ್ರದ (RC) ಪ್ರಕಾರ ನೋಂದಾಯಿತ ಮಾಲೀಕರಾಗಿರಲಿ ಅಥವಾ ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡುತ್ತಿರುವ ಒಪ್ಪಂದದ ಹಕ್ಕು ಹೊಂದಿರುವ ಡೀಲರ್ ಆಗಿರಲಿ, ಅವರು ಈ ವ್ಯವಹಾರಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಂಪೂರ್ಣ ಹಾಗೂ ನಿರಪೇಕ್ಷ ನಾಗರಿಕ (ಸಿವಿಲ್) ಮತ್ತು ಅಪರಾಧ (ಕ್ರಿಮಿನಲ್) ಜವಾಬ್ದಾರಿಯನ್ನು ವಹಿಸಿಕೊಳ್ಳುತ್ತಾರೆ.</Text>
            <Text style={styles.clauseEnglish}>1. Civil and Criminal Responsibility: The Registered Owner as per RC or the Agreement Holder dealer selling the Vehicle explicitly assumes absolute civil and criminal responsibility for this transaction.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೨. ದಾಖಲೆಗಳ ನೈಜತೆ ಮತ್ತು ಆರ್ಟಿಓ ಸಹಿ ಹೊಣೆಗಾರಿಕೆ: ನೋಂದಾಯಿತ ಮಾಲೀಕರು ಅಥವಾ ಒಪ್ಪಂದದ ಹಕ್ಕು ಹೊಂದಿರುವ ಡೀಲರ್ ವಾಹನದ ಎಲ್ಲಾ ಅಸಲಿ ದಾಖಲೆಗಳು ನೂರಕ್ಕೆ ನೂರರಷ್ಟು ನೈಜವಾಗಿವೆ ಎಂದು ಭರವಸೆ ನೀಡುತ್ತಾರೆ. ಯಾವುದೇ ಆರ್ಟಿಓ (RTO) ಸಹಿ ಹೊಂದಾಣಿಕೆಯಾಗದಿದ್ದಲ್ಲಿ ತಮ್ಮ ಸ್ವಂತ ಖರ್ಚಿನಲ್ಲಿ ಆ ದಾಖಲೆಗಳನ್ನು ಸರಿಪಡಿಸಿಕೊಡಲು ಕಾನೂನುಬದ್ಧವಾಗಿ ಬದ್ಧರಾಗಿರುತ್ತಾರೆ.</Text>
            <Text style={styles.clauseEnglish}>2. Genuineness of Documents & RTO Signatures: The Registered Owner or agreement holder dealer guarantees that all original vehicle documents are 100% genuine. In case of any RTO signature mismatch, they are legally bound to rectify the paperwork at their own cost.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೩. ಆರ್ಟಿಓ ನಮೂನೆಗಳು, ಬ್ಯಾಂಕ್ ಸಾಲ ಮುಕ್ತಾಯ ಮತ್ತು ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ ಜವಾಬ್ದಾರಿ: ನೋಂದಾಯಿತ ಮಾಲೀಕರು ಅಥವಾ ಡೀಲರ್ ಸರಿಯಾಗಿ ಸಹಿ ಮಾಡಲಾದ ಅಸಲಿ ನಮೂನೆ ೨೯ (Form 29) ಮತ್ತು ನಮೂನೆ ೩೦ (Form 30) ಒದಗಿಸಲು ಜವಾಬ್ದಾರರು. ಬ್ಯಾಂಕ್ ಸಾಲವಿದ್ದರೆ, ಸಾಲ ಚುಕ್ತಾ ಮಾಡಿ, ನಿರಾಕ್ಷೇಪಣಾ ಪತ್ರ (NOC) ಮತ್ತು ಸಹಿ ಮಾಡಿದ ನಮೂನೆ ೩೫ (Form 35) ಒದಗಿಸಬೇಕು. ಈ ದಾಖಲೆಗಳನ್ನು ನೀಡಿದ ತಕ್ಷಣ ಖರೀದಿದಾರನು ವಾಹನದ ಮಾಲೀಕತ್ವವನ್ನು (RC Transfer) ತನ್ನ ಹೆಸರಿಗೆ ವರ್ಗಾಯಿಸಿಕೊಳ್ಳಲೇಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>3. RTO Forms, Loan Termination (NOC, Form 35) and Transfer Responsibility: The Seller is responsible for delivering genuinely signed Form 29 and Form 30. If there is active bank finance, the Seller must clear the loan entirely, obtain NOC, and provide signed Form 35. Upon delivery of these documents, the Buyer must mandatorily transfer the RC.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೪. ನ್ಯಾಯಾಲಯದ ಮೊಕದ್ದಮೆ ಮತ್ತು ದಂಡ ಮುಕ್ತತೆಯ ಭರವಸೆ: ಈ ವಾಹನವು ಮಾರಾಟದ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದವರೆಗೆ ಯಾವುದೇ ಹಿಂದಿನ ಪೊಲೀಸ್/ ನ್ಯಾಯಾಲಯದ ಪ್ರಕರಣಗಳು, ಆರ್ಟಿಓ ಕಪ್ಪುಪಟ್ಟಿ (Blacklisting) ಅಥವಾ ಬಾಕಿ ಇರುವ ಸಂಚಾರಿ ನಿಯಮ ಉಲ್ಲಂಘನೆಯ ಆನ್‌ಲೈನ್ ದಂಡಗಳಿಂದ ಮುಕ್ತವಾಗಿದೆ ಎಂದು ಖಾತರಿಪಡಿಸುತ್ತಾರೆ.</Text>
            <Text style={styles.clauseEnglish}>4. Guarantee Against Litigation and Fines: The Seller legally guarantees that the vehicle is free from any previous police/ court cases, RTO blacklisting, or pending traffic e-Challans up to the date and time of sale.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೫. ವರ್ಗಾವಣೆ ವಿಫಲತೆಗೆ ದ್ವಿಗುಣ ಹಣದ ದಂಡದ ಷರತ್ತು: ದಾಖಲೆಗಳ ದೋಷ ಅಥವಾ ಮಾಲೀಕತ್ವದ ದೋಷಗಳಿಂದಾಗಿ ಆರ್ಸಿ ವರ್ಗಾವಣೆ (RC Transfer) ಖಾಯಂ ಆಗಿ ವಿಫಲಗೊಂಡರೆ, ಮಾರಾಟಗಾರನು ಒಟ್ಟು ಖರೀದಿ ಮೊತ್ತದ ಎರಡರಷ್ಟು ಹಣವನ್ನು ಖರೀದಿದಾರನಿಗೆ ಕಾನೂನು ದಂಡದ ರೂಪದಲ್ಲಿ ಮರುಪಾವತಿಸಲು ಬಾಧ್ಯಸ್ಥರಾಗಿರುತ್ತಾರೆ.</Text>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 3 of 7</Text>
        </View>
      </Page>

      {/* ── Page 4 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View>
          <View style={styles.clauseBlock}>
            <Text style={styles.clauseEnglish}>5. Penalty for Transfer Failure: If the RC transfer fails permanently due to document faults or title defects, the Seller shall immediately refund double the total purchase amount to the Buyer as a legal penalty.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೬. ಮೂರನೇ ವ್ಯಕ್ತಿಗಳ ಹಕ್ಕು ಮತ್ತು ಮಾಲೀಕತ್ವ ವಿವಾದಗಳಿಲ್ಲದ ಖಾತರಿ: ಈ ವಾಹನದ ಮೇಲೆ ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿ, ಹಣಕಾಸು ಸಂಸ್ಥೆ ಅಥವಾ ಕುಟುಂಬದ ಸದಸ್ಯರು ಯಾವುದೇ ಸಿಂಧುತ್ವ ಹೊಂದಿರುವ ಕಾನೂನುಬದ್ಧ ಹಕ್ಕು ಅಥವಾ ಮಾಲೀಕತ್ವದ ವಿವಾದವನ್ನು ಹೊಂದಿಲ್ಲ ಎಂದು ಖಾತರಿಪಡಿಸುತ್ತಾರೆ.</Text>
            <Text style={styles.clauseEnglish}>6. No Third-Party Claims: The Seller guarantees that no third party, financial institution, or family member holds any valid legal claim or ownership dispute over this vehicle.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೭. ಒಪ್ಪಂದದ ವೆಚ್ಚಗಳು ಮತ್ತು ನಷ್ಟ ಪರಿಹಾರ: ತಪ್ಪು ದಾಖಲೆಗಳು ಅಥವಾ ಮಾರಾಟಗಾರರು ಮುಚ್ಚಿಟ್ಟ ಹಿಂದಿನ ಯಾವುದೇ ಸಮಸ್ಯೆಗಳಿಂದಾಗಿ ಖರೀದಿದಾರರು ಯಾವುದೇ ಮೊಕದ್ದಮೆ ಎದುರಿಸಬೇಕಾಗಿ ಬಂದಲ್ಲಿ ಮಾರಾಟಗಾರನು ಖರೀದಿದಾರನಿಗೆ ಎಲ್ಲಾ ಕಾನೂನು ವೆಚ್ಚಗಳು ಹಾಗೂ ವಕೀಲರ ಶುಲ್ಕವನ್ನು ಭರಿಸಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>7. Legal Costs Indemnification: If the Buyer faces any litigation or expenses due to faulty paperwork or prior issues hidden by the Seller, the Seller shall immediately indemnify and bear all legal costs and advocate fees incurred by the Buyer.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೮. ಮಾರಾಟಗಾರರಿಂದ ಒಪ್ಪಂದ ರದ್ದುತಿ ಷರತ್ತು: ಮಾರಾಟಗಾರನು ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡಲು ಒಪ್ಪಿ ಮುಂಗಡ ಹಣವನ್ನು ಪಡೆದ ನಂತರ, ಒಂದು ವೇಳೆ ತಾವಾಗಿಯೇ ಈ ಒಪ್ಪಂದವನ್ನು ರದ್ದುಗೊಳಿಸಿದರೆ, ಅವರು ಖರೀದಿದಾರರು ನಿರ್ಧರಿಸುವ ದಂಡದ ಮೊತ್ತದೊಂದಿಗೆ ಮುಂಗಡ ಹಣವನ್ನು ಮರುಪಾವತಿಸಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>8. Cancellation by Seller: If the Seller agrees to sell the vehicle and accepts an advance, and subsequently cancels the deal, the Seller shall be legally bound to refund the advance amount along with a penalty amount determined by the Buyer.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೯. ಮಧ್ಯವರ್ತಿ ಮತ್ತು ಮುಕ್ತ ನಮೂನೆಗಳ ಹೊಣೆಗಾರಿಕೆ: ಒಂದು ವೇಳೆ ಮಾರಾಟಗಾರನು ಅಥವಾ ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸುತ್ತಿರುವ ವ್ಯಕ್ತಿಯು ಮಧ್ಯವರ್ತಿ, ಡೀಲರ್ ಅಥವಾ ಕುಟುಂಬದ ಸದಸ್ಯರಾಗಿದ್ದು, ವಾಹನವನ್ನು ತಮ್ಮ ಹೆಸರಿಗೆ ವರ್ಗಾಯಿಸಿಕೊಳ್ಳದೆ ಮೂಲ ಮಾಲೀಕರ ಸಹಿ ಇರುವ ನಮೂನೆ ೨೯ ಮತ್ತು ೩೦ (Open Forms) ನೀಡಿ ಮಾರಾಟ ಮಾಡುತ್ತಿದ್ದರೆ, ಅವರು ಸಂಪೂರ್ಣ ಕಾನೂನುಬದ್ಧ ಗ್ಯಾರಂಟಿದಾರರಾಗಿ (Legal Guarantor) ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಾರೆ. ಮೂಲ ನೋಂದಾಯಿತ ಮಾಲೀಕರ ಸಹಿಯ ನೈಜತೆಗೆ ಅವರೇ ನೂರಕ್ಕೆ ನೂರರಷ್ಟು ಜವಾಬ್ದಾರರು. ಭವಿಷ್ಯದಲ್ಲಿ ಆರ್ಟಿಓ ವರ್ಗಾವಣೆ ವಿಫಲವಾದಲ್ಲಿ, ಸಹಿ ಹೊಂದಾಣಿಕೆಯಾಗದಿದ್ದಲ್ಲಿ ಅಥವಾ ಮೂಲ ಮಾಲೀಕರು ಯಾವುದೇ ಆಕ್ಷೇಪಣೆ ಎತ್ತಿದರೆ, ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸಿದ ವ್ಯಕ್ತಿಯೇ ಸಂಪೂರ್ಣ ಕಾನೂನು, ಕ್ರಿಮಿನಲ್ ಮತ್ತು ಆರ್ಥಿಕ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಹೊರಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>9. Intermediary & Open Form Liability Clause: If the Seller or physical handler of the vehicle is an intermediary, dealer, or family member selling the vehicle with pre-signed open forms (Form 29 & 30) without transferring the RC to their own name, they explicitly act as an Absolute Legal Guarantor. They unconditionally guarantee the absolute genuineness of the original Registered Owner's signatures and take 100% legal, civil, criminal, and financial responsibility. In the event of RTO transfer rejection, signature mismatch, or claims made by the original owner, the physical seller shall face all legal consequences and compensate the Buyer immediately.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೧೦. ಮಾರಾಟಗಾರನ ಗುರುತು ಮತ್ತು ಸಮ್ಮತಿ ಖಾತರಿ: ಈ ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಮಾಡಿ ಹಣವನ್ನು ಪಡೆಯುತ್ತಿರುವ ವ್ಯಕ್ತಿಯು, ಈ ವಾಹನವನ್ನು ಮಾರಾಟ ಮಾಡಲು ನೋಂದಾಯಿತ ಮಾಲೀಕರಿಂದ ಸ್ಪಷ್ಟವಾದ, ಕಾನೂನುಬದ್ಧವಾದ ಮತ್ತು ನಿರಾಕರಿಸಲಾಗದ ಸಮ್ಮತಿಯನ್ನು ಹೊಂದಿದ್ದಾನೆ ಎಂದು ಖಾತರಿಪಡಿಸುತ್ತಾನೆ. ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸುತ್ತಿರುವ ವ್ಯಕ್ತಿಯ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಇದರೊಂದಿಗೆ ಲಗತ್ತಿಸಲಾಗಿದೆ. ವಾಹನದ ಅನಧಿಕೃತ ಮಾರಾಟ, ವಂಚನೆ ಅಥವಾ ಕಳ್ಳತನಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ನೋಂದಾಯಿತ ಮಾಲೀಕರು ಭವಿಷ್ಯದಲ್ಲಿ ಯಾವುದೇ ವಿವಾದವನ್ನು ಎತ್ತಿದರೆ, ವಾಹನವನ್ನು ಹಸ್ತಾಂತರಿಸಿದ ವ್ಯಕ್ತಿಯೇ ತಮ್ಮ ಸ್ವಂತ ವೆಚ್ಚ ಮತ್ತು ಅಪಾಯದಲ್ಲಿ ಅದನ್ನು ಬಗೆಹರಿಸಬೇಕು ಹಾಗೂ ಖರೀದಿದಾರನನ್ನು ಯಾವುದೇ ಪೊಲೀಸ್ ಅಥವಾ ನ್ಯಾಯಾಲಯದ ಪ್ರಕರಣಗಳಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ಮುಕ್ತಗೊಳಿಸಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>10. Physical Seller Identity & Consent Confirmation: The physical person executing this agreement and receiving the payment confirms they have the explicit, undeniable, and legally valid consent of the Registered Owner to sell this vehicle. A copy of the physical seller's government ID is mandatory and attached hereto. Any future dispute raised by the Registered Owner regarding unauthorized sale, fraud, or theft shall be strictly faced and settled by the physical seller at their own risk, cost, and consequence, completely indemnifying the Buyer from any police or court matters.</Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೪. ಎರಡನೇ ಪಾರ್ಟಿ (ಖರೀದಿದಾರನ) ಷರತ್ತುಗಳು / 4. SECOND PARTY (BUYER'S) TERMS & RESPONSIBILITIES</Text>
          </View>
          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೧. ವಾಹನದ ತಪಾಸಣೆ ಮತ್ತು ತೃಪ್ತಿ: ಎರಡನೇ ಪಾರ್ಟಿಯು (ಖರೀದಿದಾರ) ವಾಹನದ ಎಂಜಿನ್, ಬಾಡಿ, ದಾಖಲೆಗಳು ಮತ್ತು ಅದರ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ತೃಪ್ತಿಕರವಾಗಿ ತಪಾಸಣೆ ಮಾಡಿದ ನಂತರವೇ ಖರೀದಿಸುತ್ತಿದ್ದಾರೆ. ಇಂದಿನಿಂದ ಮುಂದಕ್ಕೆ ಮೊದಲ ಪಾರ್ಟಿಯು ಯಾವುದೇ ರೀತಿಯ ಯಾಂತ್ರಿಕ ದೋಷಗಳಿಗೆ ಅಥವಾ ದುರಸ್ತಿಗಳಿಗೆ ಜವಾಬ್ದಾರರಾಗಿರುವುದಿಲ್ಲ.</Text>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 4 of 7</Text>
        </View>
      </Page>

      {/* ── Page 5 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View>
          <View style={styles.clauseBlock}>
            <Text style={styles.clauseEnglish}>1. Vehicle Inspection and Satisfaction: The Second Party (Buyer) is purchasing the vehicle only after a satisfactory inspection of the vehicle's engine, body, documents, and current condition. From now onwards, the First Party shall not be responsible for any mechanical faults or repairs.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೨. ನಾಗರಿಕ ಮತ್ತು ಅಪರಾಧ ಹೊಣೆಗಾರಿಕೆ: ಇಂದಿನ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ, ಈ ವಾಹನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಅಪಘಾತ, ಜೀವಹಾನಿ, ಸಾರ್ವಜನಿಕ ಆಸ್ತಿಗೆ ಹಾನಿ, ಕಳ್ಳತನ, ಕಳ್ಳಸಾಗಾಣಿಕೆ, ಮಾದಕ ದ್ರವ್ಯ ಅಥವಾ ಯಾವುದೇ ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳಿಗೆ ಖರೀದಿದಾರ ಮಾತ್ರವೇ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ.</Text>
            <Text style={styles.clauseEnglish}>2. Civil and Criminal Liability: With effect from today's date and time, for any accident, loss of life, damage to property, theft, smuggling, drug trafficking, or any illegal activities involving this vehicle, the Second Party (Buyer) shall be solely held responsible.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೩. ಸಂಚಾರಿ ನಿಯಮ ಉಲ್ಲಂಘನೆ ದಂಡಗಳು: ಇಂದಿನ ನಿರ್ದಿಷ್ಟ ಸಮಯದ ನಂತರ ದಾಖಲಾಗುವ ಯಾವುದೇ ಆನ್‌ಲೈನ್ ಟ್ರಾಫಿಕ್ ದಂಡಗಳು (ಇ-ಚಲನ್‌ಗಳು) ಅಥವಾ ಪೊಲೀಸ್ ಪ್ರಕರಣಗಳಿಗೆ ಎರಡನೇ ಪಾರ್ಟಿ ಮಾತ್ರವೇ ದಂಡ ಮತ್ತು ಜುಲ್ಮಾನೆಗಳನ್ನು ಪಾವತಿಸಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>3. Traffic Violations and Fines: For any online traffic fines (e-Challans) or police cases registered after today's specified time, the Second Party alone shall pay the fines and penalties.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೪. ಮರುಮಾರಾಟ ಮತ್ತು ಅಡಮಾನ ನಿಷೇಧ: ನೋಂದಣಿ ಪತ್ರವನ್ನು (RC) ತಮ್ಮದೇ ಹೆಸರಿಗೆ ವರ್ಗಾಯಿಸಿಕೊಳ್ಳುವ ಮುನ್ನ ಎರಡನೇ ಪಾರ್ಟಿಯು ಈ ವಾಹನವನ್ನು ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಗೆ ಮರುಮಾರಾಟ ಮಾಡುವುದನ್ನು ಅಥವಾ ಅಡಮಾನ/ಸಾಲದ ರೂಪದಲ್ಲಿ ಇಡುವುದನ್ನು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.</Text>
            <Text style={styles.clauseEnglish}>4. Prohibition of Resale and Pledging: Before transferring the RC to their own name, the Second Party is strictly prohibited from reselling this vehicle to any third party or placing it as a pledge/loan.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೫. ಭವಿಷ್ಯದ ವಿವಾದಗಳ ನಷ್ಟ ಪರಿಹಾರ: ಈ ವಾಹನಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭವಿಷ್ಯದಲ್ಲಿ ಯಾವುದೇ ನ್ಯಾಯಾಲಯದ ವಿವಾದಗಳು, ಪೊಲೀಸ್ ಜಪ್ತಿಗಳು ಅಥವಾ ಆರ್ಟಿಓ ಕಛೇರಿಯಿಂದ ದಂಡಗಳು ಉದ್ಭವಿಸಿದರೆ, ಎರಡನೇ ಪಾರ್ಟಿಯು ಮೊದಲ ಪಾರ್ಟಿಗೆ ಉಂಟಾಗುವ ಆರ್ಥಿಕ ನಷ್ಟಗಳು ಮತ್ತು ಕಾನೂನು ವೆಚ್ಚಗಳನ್ನು ಭರಿಸಬೇಕು.</Text>
            <Text style={styles.clauseEnglish}>5. Indemnification of Future Disputes: In connection with this vehicle, if any future court disputes, police seizures, or penalties from the RTO office arise, the Second Party shall indemnify and bear all financial losses and legal costs incurred by the First Party.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೬. ವಾಹನ ಹಿಂತಿರುಗಿಸುವಿಕೆ ನಿಯಮ: ವಾಹನವನ್ನು ಖರೀದಿಸಿದ ನಂತರ, ಎರಡನೇ ಪಾರ್ಟಿಯು ಅದನ್ನು ತಕ್ಷಣವೇ ಹಿಂತಿರುಗಿಸಲು ಪ್ರಯತ್ನಿಸಿದರೆ, ಅವರು ಮಾರಾಟದ ಬೆಲೆಯ ಕೇವಲ 50% ರಷ್ಟು ಹಣವನ್ನು ಮಾತ್ರ ಹಿಂತಿರುಗಿ ಪಡೆಯಲು ಅರ್ಹರಾಗಿರುತ್ತಾರೆ. ತಡವಾಗಿ ಹಿಂತಿರುಗಿಸಿದರೆ ವಾಹನದ ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯದ ಆಧಾರದ ಮೇಲೆ ನಿರ್ಧರಿಸಲಾಗುವುದು.</Text>
            <Text style={styles.clauseEnglish}>6. Vehicle Return Policy: After purchasing the vehicle, if the Second Party tries to return it immediately, they shall be entitled to receive only 50% of the sale price back. Subsequent returns will be decided based on market value.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೭. ಮುಂಗಡ ಹಣ ಮುಟ್ಟುಗೋಲು: ಮುಂಗಡ ಹಣದ ಪಾವತಿಯನ್ನು ಮಾಡಿದ ನಂತರ ಎರಡನೇ ಪಾರ್ಟಿಯು ಒಪ್ಪಂದವನ್ನು ರದ್ದುಗೊಳಿಸಿದರೆ ಅಥವಾ ಒಪ್ಪಿದ ಸಮಯದೊಳಗೆ ವಾಹನವನ್ನು ವಶಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಲು ವಿಫಲರಾದರೆ, ಮುಂಗಡ ಹಣವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಳ್ಳಲಾಗುವುದು (ಹಿಂತಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ).</Text>
            <Text style={styles.clauseEnglish}>7. Forfeiture of Advance Amount: If the Second Party cancels the deal after paying the advance or fails to take delivery within the agreed time, the advance amount shall be strictly non-refundable and will be entirely forfeited.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೮. ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ ಮತ್ತು ಖರೀದಿದಾರನ ಸಂಪೂರ್ಣ ಹೊಣೆಗಾರಿಕೆ ನಿಯಮ: ವಾಹನದ ಮಾಲೀಕತ್ವವು (RC Transfer) ಖರೀದಿದಾರನ ಹೆಸರಿಗೆ ಅಧಿಕೃತವಾಗಿ ಮತ್ತು ಸಂಪೂರ್ಣವಾಗಿ ವರ್ಗಾವಣೆಯಾಗುವವರೆಗೂ, ವಾಹನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಎಲ್ಲಾ ನಾಗರಿಕ, ಅಪರಾಧ ಮತ್ತು ಕಾನೂನು ಜವಾಬ್ದಾರಿಗಳು ಕಡ್ಡಾಯವಾಗಿ ಖರೀದಿದಾರನ ಮೇಲೆಯೇ ಇರುತ್ತವೆ. ಈ ಮಧ್ಯಂತರ ಅವಧಿಯಲ್ಲಿ ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಅಪಘಾತ, ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳು ಅಥವಾ ಯಾವುದೇ ಘಟನೆಗಳು ಸಂಭವಿಸಿದಲ್ಲಿ ಅದಕ್ಕೆ ಖರೀದಿದಾರನಾದ ನಾನೇ ಸಂಪೂರ್ಣ ಜವಾಬ್ದಾರನಾಗಿರುತ್ತೇನೆ ಮತ್ತು ನಾನು ಇದಕ್ಕೆ ಸಮ್ಮತಿಸುತ್ತೇನೆ. ಖರೀದಿದಾರನು ನೋಂದಾಯಿತ ಮಾಲೀಕರ ಮೇಲೆ ಅಥವಾ ಡೀಲರ್ ಮೇಲೆ ಯಾವುದೇ ರೀತಿಯ ಜವಾಬ್ದಾರಿ, ಆಪಾದನೆ ಅಥವಾ ಕಾನೂನು ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಹೊರಿಸುವುದಿಲ್ಲ ಎಂದು ಒಪ್ಪಿಕೊಳ್ಳುತ್ತಾನೆ. ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಘಟನೆ ಸಂಭವಿಸಿದಲ್ಲಿ ಎದುರಾಗುವ ಎಲ್ಲಾ ಪೊಲೀಸ್ ಸ್ಟೇಷನ್ ವಿಷಯಗಳನ್ನು ಮತ್ತು ನ್ಯಾಯಾಲಯದ ಕಾನೂನು ಪ್ರಕರಣಗಳನ್ನು ಖರೀದಿದಾರನಾದ ನಾನೇ ನನ್ನ ಸ್ವಂತ ಹಣ ಮತ್ತು ವೆಚ್ಚದಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ಎದುರಿಸುತ್ತೇನೆ.</Text>
            <Text style={styles.clauseEnglish}>8. Ownership Transfer and Absolute Buyer Liability Clause: Until the vehicle ownership (RC Transfer) is officially and completely transferred to the Buyer's name, all civil, criminal, and legal responsibilities regarding the vehicle rest strictly and entirely upon the Buyer. If any accident, illegal activities, or anything happens during this interim period, the Buyer alone is completely responsible for that, and I (buyer) expressly agree to the same. The Buyer agrees and covenants that he will NOT put or place any liability, blame, or legal responsibility on the Registered Owner or the Dealer.</Text>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 5 of 7</Text>
        </View>
      </Page>

      {/* ── Page 6 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View>
          <View style={styles.clauseBlock}>
            <Text style={styles.clauseEnglish}>In case of any eventuality, the Buyer alone shall face all police station matters and legal court cases entirely with my own money and expenses.</Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೫. ವಾಹನ ಹಸ್ತಾಂತರದ ಸಮಯ / 5. DELIVERY DETAILS</Text>
          </View>
          <View style={styles.deliveryGrid}>
            <View style={styles.deliveryCellBorder}>
              <Text style={styles.deliveryLbl}>ಹಸ್ತಾಂತರಿಸಿದ ದಿನಾಂಕ / Date of Delivery</Text>
              <Text style={styles.deliveryVal}>{formattedTxDate}</Text>
            </View>
            <View style={styles.deliveryCell}>
              <Text style={styles.deliveryLbl}>ಹಸ್ತಾಂತರಿಸಿದ ಸಮಯ / Time of Delivery</Text>
              <Text style={styles.deliveryVal}>{deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೬. ಘೋಷಣೆ / 6. DECLARATION</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೧. ಇ-ಸ್ಟ್ಯಾಂಪ್ ವಿಳಂಬ ಒಪ್ಪಂದ: ಸರ್ಕಾರಿ ಸರ್ವರ್ ಸಮಸ್ಯೆಗಳು, ತಾಂತ್ರಿಕ ಅಡಚಣೆಗಳು ಅಥವಾ ಸಾರ್ವಜನಿಕ ರಜಾದಿನಗಳ ಕಾರಣದಿಂದಾಗಿ ಇ-ಸ್ಟ್ಯಾಂಪ್ (E-Stamp) ಪತ್ರವನ್ನು ಪಡೆಯುವುದು ವಿಳಂಬವಾದಲ್ಲಿ, ಈ ಒಪ್ಪಂದವು ವಾಹನ ವಹಿವಾಟಿನ ಮೂಲ ದಿನಾಂಕದಿಂದಲೇ ಸಂಪೂರ್ಣವಾಗಿ ಮಾನ್ಯವಾಗಿರುತ್ತದೆ ಮತ್ತು ಕಾನೂನುಬದ್ಧವಾಗಿ ಜಾರಿಯಲ್ಲಿರುತ್ತದೆ ಎಂದು ಎರಡೂ ಪಕ್ಷಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಒಪ್ಪಿಕೊಳ್ಳುತ್ತವೆ. ಒಂದು ವೇಳೆ ವಿತರಿಸಲಾದ ಇ-ಸ್ಟ್ಯಾಂಪ್ ಪತ್ರವು ನಂತರದ ದಿನಾಂಕವನ್ನು ಹೊಂದಿದ್ದರೂ ಸಹ, ಈ ಒಪ್ಪಂದವನ್ನು ವಾಹನ ವಹಿವಾಟು ನಡೆದ ನೈಜ ದಿನಾಂಕದಿಂದಲೇ ಸಕ್ರಿಯ ಮತ್ತು ಕಾನೂನುಬದ್ಧವಾಗಿ ಜಾರಿಗೊಳಿಸಬಹುದಾದ ಒಪ್ಪಂದವೆಂದು ಪರಿಗಣಿಸಲಾಗುವುದು.</Text>
            <Text style={styles.clauseEnglish}>1. E-Stamp Delay Agreement: If the generation of the E-Stamp paper is delayed due to government server issues, technical downtime, or public holidays, both parties explicitly agree that this contract remains fully valid and legally binding from the original execution date. Even if the issued E-Stamp paper reflects a later date, this agreement shall be treated as active and legally enforceable from the actual date of vehicle transaction.</Text>
          </View>

          <View style={styles.clauseBlock}>
            <Text style={styles.clauseKannada}>೨. ನಾನು, ಮೊದಲ ಪಾರ್ಟಿ (ಮಾರಾಟಗಾರ) ಮತ್ತು ನಾನು, ಎರಡನೇ ಪಾರ್ಟಿ (ಖರೀದಿದಾರ), ಈ ಮೂಲಕ ನಾವು ಈ ಒಪ್ಪಂದದ ಪ್ರತಿಯೊಂದು ನಿಯಮವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಓದಿ ಅಥವಾ ಓದದಿದ್ದಲ್ಲಿ ಈ ಇಡೀ ಒಪ್ಪಂದವನ್ನು ಪೂರ್ಣವಾಗಿ ಆಲಿಸಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇವೆ ಎಂದು ಘೋಷಿಸುತ್ತೇವೆ. ಎಲ್ಲವನ್ನೂ ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಿದ ನಂತರ, ನಾವು ಈ ಒಪ್ಪಂದಕ್ಕೆ ಸಮ್ಮತಿಸುತ್ತೇವೆ ಮತ್ತು ಯಾವುದೇ ಬಲವಂತ ಅಥವಾ ಒತ್ತಡವಿಲ್ಲದೆ, ನಮ್ಮ ಪೂರ್ಣ ಪ್ರಜ್ಞಾವಸ್ಥೆಯಲ್ಲಿ ಸಾಕ್ಷಿಗಳ ಸಮ್ಮುಖದಲ್ಲಿ ಒಪ್ಪಿ ಸಹಿ ಮಾಡಿದ್ದೇವೆ.</Text>
            <Text style={styles.clauseEnglish}>2. I, the First Party (Seller) and I, the Second Party (Buyer), hereby declare that we have completely read, or if unable to read, have listened to this entire agreement and fully understood each and every term. Having fully comprehended everything, we are agreeing to this contract and placing our signatures in our full conscious state of mind, without any coercion or pressure, in the presence of the following witnesses.</Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>೭. ಸಹಿಗಳು / 7. SIGNATURES AND EXECUTION</Text>
          </View>

          <View style={styles.sigsRow}>
            {/* Seller Sig Card */}
            <View style={styles.sigCard}>
              <Text style={styles.sigCardTitle}>ಮೊದಲ ಪಾರ್ಟಿ (ಮಾರಾಟಗಾರ) / FIRST PARTY (SELLER)</Text>
              <View style={styles.sigSlot}>
                {sellerSign ? <Image src={sellerSign} style={styles.sigImg} /> : null}
              </View>
              <View style={styles.sigLine} />
              <Text style={styles.sigCardLabel}>ಹೆಬ್ಬೆಟ್ಟಿನ ಗುರುತು / ಸಹಿ: / Thumb Impression / Signature</Text>
              <Text style={[styles.sigCardLabel, { marginTop: 2 }]}>ದಿನಾಂಕ / Date: {formattedTxDate}</Text>
              <Text style={[styles.sigCardLabel, { marginTop: 2, fontFamily: "Helvetica-Bold" }]}>ಮಾರಾಟಗಾರನ ಸಹಿ / Seller's Signature</Text>
            </View>

            {/* Buyer Sig Card */}
            <View style={styles.sigCard}>
              <Text style={styles.sigCardTitle}>ಎರಡನೇ ಪಾರ್ಟಿ (ಖರೀದಿದಾರ) / SECOND PARTY (BUYER)</Text>
              <View style={styles.sigSlot}>
                {buyerSign ? <Image src={buyerSign} style={styles.sigImg} /> : null}
              </View>
              <View style={styles.sigLine} />
              <Text style={styles.sigCardLabel}>ಹೆಬ್ಬೆಟ್ಟಿನ ಗುರುತು / ಸಹಿ: / Thumb Impression / Signature</Text>
              <Text style={[styles.sigCardLabel, { marginTop: 2 }]}>ದಿನಾಂಕ / Date: {formattedTxDate}</Text>
              <Text style={[styles.sigCardLabel, { marginTop: 2, fontFamily: "Helvetica-Bold" }]}>ಖರೀದಿದಾರನ ಸಹಿ / Buyer's Signature</Text>
            </View>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 6 of 7</Text>
        </View>
      </Page>

      {/* ── Page 7 of 7 ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.estampHeader}>
          <Text style={styles.estampLabel}>E Stamp Certificate No:</Text>
          <Text style={styles.estampVal}>{eStampCertNo || "_______________________"}</Text>
        </View>

        <View>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>ಸಾಕ್ಷಿಗಳು / WITNESSES</Text>
          </View>

          <View style={styles.witnessGrid}>
            {/* Witness 1 */}
            <View style={styles.witnessCard}>
              <Text style={styles.witnessCardTitle}>1. ಸಾಕ್ಷಿ 1 ರ ವಿವರಗಳು / Witness 1 Details:</Text>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ಹೆಸರು / Name:</Text>
                <Text style={styles.witnessFieldVal}>{witness1.name || ""}</Text>
              </View>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ವಿಳಾಸ / Full Address:</Text>
                <Text style={styles.witnessFieldVal}>{witness1.address || ""}</Text>
              </View>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ಫೋನ್ / Phone No:</Text>
                <Text style={styles.witnessFieldVal}>{witness1.phone || witness1.mobile || ""}</Text>
              </View>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ಸಹಿ / Witness Signature:</Text>
                <View style={{ minHeight: 30, borderBottomWidth: 0.6, borderBottomColor: "#475569", justifyContent: "center", alignItems: "center" }}>
                  {witness1Sign ? (
                    <Image src={witness1Sign} style={{ maxHeight: 26, maxWidth: "80%", objectFit: "contain" }} />
                  ) : null}
                </View>
              </View>
            </View>

            {/* Witness 2 */}
            <View style={styles.witnessCard}>
              <Text style={styles.witnessCardTitle}>2. ಸಾಕ್ಷಿ 2 ರ ವಿವರಗಳು / Witness 2 Details:</Text>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ಹೆಸರು / Name:</Text>
                <Text style={styles.witnessFieldVal}>{witness2.name || ""}</Text>
              </View>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ವಿಳಾಸ / Full Address:</Text>
                <Text style={styles.witnessFieldVal}>{witness2.address || ""}</Text>
              </View>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ಫೋನ್ / Phone No:</Text>
                <Text style={styles.witnessFieldVal}>{witness2.phone || witness2.mobile || ""}</Text>
              </View>
              <View style={styles.witnessField}>
                <Text style={styles.witnessFieldLbl}>ಸಹಿ / Witness Signature:</Text>
                <View style={{ minHeight: 30, borderBottomWidth: 0.6, borderBottomColor: "#475569" }} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Page 7 of 7</Text>
        </View>
      </Page>
    </Document>
  );
};

export default BondAgreementPDF;
