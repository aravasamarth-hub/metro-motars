import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { convertToIndianWords } from "@/utils/numberToWords";

export interface SellerBillProps {
  deal: any;
  resolvedImages?: {
    sellerPhoto?: string | null;
    sellerSignature?: string | null;
    sellerThumb?: string | null;
    vehiclePhoto?: string | null;
    witnessPhoto?: string | null;
    witnessSignature?: string | null;
    witnessThumb?: string | null;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 12,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  borderContainer: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: "#0a2342",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    borderWidth: 1.2,
    borderColor: "#0a2342",
    height: 56,
    marginBottom: 4,
  },
  logoBox: {
    width: 185,
    backgroundColor: "#0a2342",
    padding: 6,
    justifyContent: "center",
  },
  brandTitle: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    letterSpacing: 0.8,
  },
  brandTagline: {
    color: "#facc15",
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  headerTitleBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1.2,
    borderRightColor: "#0a2342",
    paddingHorizontal: 4,
  },
  mainTitle: {
    color: "#0a2342",
    fontFamily: "Helvetica-Bold",
    fontSize: 11.5,
    letterSpacing: 0.4,
  },
  subTitle1: {
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.8,
    marginTop: 1.5,
  },
  subTitle2: {
    color: "#475569",
    fontFamily: "Helvetica-Bold",
    fontSize: 6.6,
    marginTop: 1,
  },
  metaBox: {
    width: 120,
    backgroundColor: "#f8fafc",
    padding: 5,
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  metaLabel: {
    color: "#475569",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.2,
  },
  metaVal: {
    color: "#0a2342",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.8,
  },

  // ── Section Bars ──
  sectionBar: {
    backgroundColor: "#0a2342",
    paddingVertical: 3,
    paddingHorizontal: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 3,
  },
  sectionTitle: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8.2,
    letterSpacing: 0.3,
  },
  sectionSub: {
    color: "#93c5fd",
    fontFamily: "Helvetica-Bold",
    fontSize: 6.8,
  },

  // ── Grid Layouts ──
  gridBox: {
    borderWidth: 0.8,
    borderColor: "#cbd5e1",
    padding: 5,
    flexDirection: "row",
    gap: 7,
    backgroundColor: "#ffffff",
  },

  // ── Photo Cells ──
  photoCell: {
    width: 76,
    height: 98,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoPlaceholderText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    marginTop: 3,
    textAlign: "center",
  },

  // ── Table Key-Value Rows ──
  tableFields: {
    flex: 1,
    justifyContent: "space-between",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
    height: 9.8,
  },
  fieldLabel: {
    width: 86,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  fieldColon: {
    width: 6,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
  fieldValue: {
    flex: 1,
    borderBottomWidth: 0.6,
    borderBottomColor: "#94a3b8",
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    paddingBottom: 0.5,
    overflow: "hidden",
  },

  // ── Signature & Thumb Boxes ──
  sigColumn: {
    width: 84,
    gap: 4,
    justifyContent: "space-between",
  },
  sigBox: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 2,
    minHeight: 46,
  },
  sigImg: {
    maxWidth: "85%",
    maxHeight: 30,
    objectFit: "contain",
    marginBottom: 1,
  },
  sigLabel: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    borderTopWidth: 0.6,
    borderTopColor: "#cbd5e1",
    width: "100%",
    textAlign: "center",
    paddingTop: 1.5,
  },

  // ── Amount Cards ──
  amountCards: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 4,
  },
  amountCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0a2342",
    borderRadius: 2,
    backgroundColor: "#f8fafc",
    padding: 6,
    alignItems: "center",
  },
  amountCardTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 2,
    textAlign: "center",
  },
  amountCardVal: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },
  amountMetaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.6,
    borderTopColor: "#e2e8f0",
    paddingTop: 3,
    fontSize: 6.8,
    color: "#334155",
  },

  // ── Vehicle Section ──
  vehiclePhotoCell: {
    width: 82,
    height: 82,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  vehicleSpecs: {
    flex: 1.3,
    justifyContent: "space-between",
  },
  vehicleCompliance: {
    flex: 0.9,
    justifyContent: "space-between",
    borderLeftWidth: 0.6,
    borderLeftColor: "#cbd5e1",
    paddingLeft: 6,
  },

  // ── Witness Section ──
  witnessPhotoCell: {
    width: 58,
    height: 52,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  witnessFields: {
    flex: 1,
    justifyContent: "space-between",
  },
  witnessSigs: {
    width: 130,
    flexDirection: "row",
    gap: 5,
  },

  // ── Declaration ──
  declarationBox: {
    borderWidth: 0.8,
    borderColor: "#cbd5e1",
    padding: 7,
    backgroundColor: "#ffffff",
  },
  clauseText: {
    fontSize: 7.8,
    lineHeight: 1.42,
    color: "#0f172a",
    marginBottom: 3,
  },
  clauseBold: {
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },

  // ── Bottom Signatures ──
  bottomSignatures: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  bottomSigBox: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    height: 48,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 3,
  },
  bottomSigLine: {
    width: "75%",
    borderTopWidth: 0.6,
    borderTopColor: "#475569",
    marginBottom: 2,
  },
  bottomSigTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    textAlign: "center",
  },
  bottomSigSub: {
    fontSize: 5.8,
    color: "#64748b",
    textAlign: "center",
    marginTop: 0.5,
  },
  bottomSigImg: {
    maxWidth: "80%",
    maxHeight: 24,
    objectFit: "contain",
    marginBottom: 2,
  },
});

function formatDisplayDate(dateStr?: string): string {
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

function formatCurrency(val: any): string {
  if (val === "" || val === null || val === undefined) return "—";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
}

export function SellerBillPDF({ deal, resolvedImages }: SellerBillProps) {
  const seller = deal?.seller || {};
  const vehicle = deal?.vehicle || {};
  const payments = deal?.payments || {};
  const witness1 = deal?.witness1 || (deal?.witnesses && deal?.witnesses[0]) || {};

  const billNumber = deal.bill_number || deal.billNumber || "Bill-001";
  const dealId = deal.id ? (deal.id.startsWith("deal-") ? deal.id : deal.id.slice(0, 10).toUpperCase()) : "DEAL-NEW";
  const txDate = formatDisplayDate(payments.payment_date || deal.created_at);

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

  const fullAddress = [seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(", ");
  const mfgYear = [vehicle.mfg_month, vehicle.year].filter(Boolean).join(" ");
  const regNumber = vehicle.registration_number || vehicle.vehicle_number || "";

  const sellerPhoto = resolvedImages?.sellerPhoto;
  const sellerSign = resolvedImages?.sellerSignature;
  const sellerThumb = resolvedImages?.sellerThumb;
  const vehiclePhoto = resolvedImages?.vehiclePhoto;
  const witnessPhoto = resolvedImages?.witnessPhoto;
  const witnessSign = resolvedImages?.witnessSignature;
  const witnessThumb = resolvedImages?.witnessThumb;
  const isValidRasterImage = (src?: string | null): boolean => {
    if (!src || typeof src !== "string") return false;
    const s = src.trim();
    return (
      s.startsWith("data:image/") ||
      s.startsWith("blob:") ||
      s.startsWith("http://") ||
      s.startsWith("https://")
    );
  };

  return (
    <Document title={`${billNumber}-Vehicle-Handover-Agreement`} author="Metro Motors">
      <Page size="A4" style={styles.page}>
        <View style={styles.borderContainer} wrap={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 26, height: 26, borderRadius: 5, backgroundColor: "#e5b94c", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#0a2342", fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: -0.5 }}>MM</Text>
                </View>
                <View>
                  <Text style={styles.brandTitle}>METRO MOTORS</Text>
                  <Text style={styles.brandTagline}>BUY • SELL • EXCHANGE • FINANCE</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerTitleBox}>
              <Text style={styles.mainTitle}>VEHICLE HANDOVER AGREEMENT</Text>
              <Text style={styles.subTitle1}>OWNER TO METRO MOTORS</Text>
              <Text style={styles.subTitle2}>FOR VEHICLE HANDOVER & AMOUNT SETTLEMENT</Text>
            </View>
            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Bill No:</Text>
                <Text style={styles.metaVal}>{billNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Deal ID:</Text>
                <Text style={styles.metaVal}>{dealId}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaVal}>{txDate}</Text>
              </View>
            </View>
          </View>

          {/* Section 1: Owner Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>1. OWNER (SELLER) DETAILS (Vehicle Owner)</Text>
            <Text style={styles.sectionSub}>Registered Owner Profile</Text>
          </View>
          <View style={styles.gridBox}>
            {/* Photo Box */}
            <View style={styles.photoCell}>
              {isValidRasterImage(sellerPhoto) ? (
                <Image src={sellerPhoto!} style={styles.photoImg} />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.photoPlaceholderText}>Owner Photo</Text>
                </View>
              )}
            </View>

            {/* Table Fields */}
            <View style={styles.tableFields}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.name || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Father / Spouse Name</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.father_name || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.phone || seller.mobile || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Alternate Mobile</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.alternate_phone || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.email || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Address</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.address || fullAddress || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>City / District</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.city || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>State</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.state || "Karnataka"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>PIN Code</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.pincode || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Aadhaar Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.id_number || seller.aadhaar || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>PAN Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{seller.pan_number || ""}</Text>
              </View>
            </View>

            {/* Signature & Thumb */}
            <View style={styles.sigColumn}>
              <View style={styles.sigBox}>
                {isValidRasterImage(sellerSign) ? <Image src={sellerSign!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Owner Signature</Text>
              </View>
              <View style={styles.sigBox}>
                {isValidRasterImage(sellerThumb) ? <Image src={sellerThumb!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Owner Thumb</Text>
              </View>
            </View>
          </View>

          {/* Section 2: Amount Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>2. AMOUNT DETAILS (Amount given by METRO MOTORS to Owner)</Text>
            <Text style={styles.sectionSub}>Agreed Consideration</Text>
          </View>
          <View style={[styles.gridBox, { flexDirection: "column" }]}>
            <View style={styles.amountCards}>
              <View style={styles.amountCard}>
                <Text style={styles.amountCardTitle}>Agreed Purchase Amount</Text>
                <Text style={styles.amountCardVal}>{formatCurrency(rawPurchase)}</Text>
              </View>
              <View style={styles.amountCard}>
                <Text style={styles.amountCardTitle}>Amount Paid / Advanced</Text>
                <Text style={[styles.amountCardVal, { color: "#047857" }]}>{formatCurrency(rawPaid)}</Text>
              </View>
              <View style={styles.amountCard}>
                <Text style={styles.amountCardTitle}>Amount Pending / Balance</Text>
                <Text style={[styles.amountCardVal, { color: "#b45309" }]}>{formatCurrency(balanceNum)}</Text>
              </View>
            </View>
            <View style={styles.amountMetaBar}>
              <Text>
                Method: {payments.payment_method || "Cash"}
                {payments.transaction_reference ? `  · Ref: ${payments.transaction_reference}` : ""}
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Status: {paymentStatus}</Text>
            </View>
          </View>

          {/* Section 3: Vehicle Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>3. VEHICLE DETAILS</Text>
            <Text style={styles.sectionSub}>Vehicle Specifications & Verification</Text>
          </View>
          <View style={styles.gridBox}>
            {/* Vehicle Photo */}
            <View style={styles.vehiclePhotoCell}>
              {isValidRasterImage(vehiclePhoto) ? (
                <Image src={vehiclePhoto!} style={styles.photoImg} />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.photoPlaceholderText}>Vehicle Photo</Text>
                </View>
              )}
            </View>

            {/* Vehicle Specs */}
            <View style={styles.vehicleSpecs}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Vehicle Name</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.vehicle_name || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Make / Brand</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.make || vehicle.brand || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Model</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.model || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Month & Year Mfg</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{mfgYear || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration No</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{regNumber || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration Date</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.registration_date ? formatDisplayDate(vehicle.registration_date) : ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Engine Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.engine_number || vehicle.engineNumber || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Chassis Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.chassis_number || vehicle.chassisNumber || ""}</Text>
              </View>
            </View>

            {/* Compliance */}
            <View style={styles.vehicleCompliance}>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { width: 68 }]}>Tax</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.tax || "Paid"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { width: 68 }]}>Insurance</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.insurance || "Active"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { width: 68 }]}>Fitness Cert</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.fitness || "Valid"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { width: 68 }]}>Clearance / NOC</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.noc || "Available"}</Text>
              </View>
            </View>
          </View>

          {/* Section 4: Witness Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>4. SELLER WITNESS DETAILS (Witness from seller side)</Text>
            <Text style={styles.sectionSub}>Witness Identification</Text>
          </View>
          <View style={styles.gridBox}>
            <View style={styles.witnessPhotoCell}>
              {isValidRasterImage(witnessPhoto) ? (
                <Image src={witnessPhoto!} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoPlaceholderText}>Witness Photo</Text>
              )}
            </View>
            <View style={styles.witnessFields}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{witness1.name || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{witness1.phone || witness1.mobile || ""}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Aadhaar Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{witness1.id_number || witness1.aadhaar || ""}</Text>
              </View>
            </View>
            <View style={styles.witnessSigs}>
              <View style={styles.sigBox}>
                {isValidRasterImage(witnessSign) ? <Image src={witnessSign!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Witness Signature</Text>
              </View>
              <View style={styles.sigBox}>
                {isValidRasterImage(witnessThumb) ? <Image src={witnessThumb!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Witness Thumb</Text>
              </View>
            </View>
          </View>

          {/* Section 5: Declaration */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>5. HANDOVER & PURCHASE DECLARATION</Text>
            <Text style={styles.sectionSub}>Legal Terms & Undertaking</Text>
          </View>
          <View style={styles.declarationBox}>
            <Text style={styles.clauseText}>
              1. I, the undersigned registered owner of the above vehicle, declare that I am voluntarily handing over and selling my vehicle to <Text style={styles.clauseBold}>METRO MOTORS</Text> and acknowledge receipt of <Text style={styles.clauseBold}>{formatCurrency(rawPaid)}</Text> (Rupees <Text style={styles.clauseBold}>{advanceInWords}</Text>) as purchase consideration / advance amount.
            </Text>
            <Text style={styles.clauseText}>
              2. The remaining balance payable of <Text style={styles.clauseBold}>{formatCurrency(balanceNum)}</Text> shall be settled as per agreed terms upon document clearance and handover formalities.
            </Text>
            <Text style={styles.clauseText}>
              3. I authorize <Text style={styles.clauseBold}>METRO MOTORS</Text> to keep the vehicle in its custody, verify transport records, and arrange its sale / transfer to a third-party purchaser.
            </Text>
            <Text style={styles.clauseText}>
              4. <Text style={styles.clauseBold}>METRO MOTORS</Text> shall have full right to sell the vehicle at a mutually decided price, and sale proceeds shall first be used to recover the purchase amount advanced.
            </Text>
            <Text style={styles.clauseText}>
              5. I confirm that all vehicle details, registration documents, and personal details are true and the vehicle is free from any legal encumbrance, theft, or police complaints.
            </Text>
            <Text style={styles.clauseText}>
              6. I have read and understood the above terms and agree to the handover and purchase of the vehicle by <Text style={styles.clauseBold}>METRO MOTORS</Text>.
            </Text>
          </View>

          {/* Signatures */}
          <View style={styles.bottomSignatures}>
            <View style={styles.bottomSigBox}>
              {isValidRasterImage(sellerSign) && (
                <Image src={sellerSign!} style={styles.bottomSigImg} />
              )}
              <View style={styles.bottomSigLine} />
              <Text style={styles.bottomSigTitle}>Owner (Seller) Signature</Text>
            </View>
            <View style={styles.bottomSigBox}>
              <View style={styles.bottomSigLine} />
              <Text style={styles.bottomSigTitle}>For METRO MOTORS</Text>
              <Text style={styles.bottomSigSub}>(Authorized Representative)</Text>
            </View>
            <View style={styles.bottomSigBox}>
              {isValidRasterImage(witnessSign) && (
                <Image src={witnessSign!} style={styles.bottomSigImg} />
              )}
              <View style={styles.bottomSigLine} />
              <Text style={styles.bottomSigTitle}>Witness Signature</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default SellerBillPDF;
