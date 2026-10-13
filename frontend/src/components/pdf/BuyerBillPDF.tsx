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

export interface BuyerBillProps {
  deal: any;
  resolvedImages?: {
    buyerPhoto?: string | null;
    buyerSignature?: string | null;
    buyerThumb?: string | null;
    sellerPhoto?: string | null;
    sellerSignature?: string | null;
    sellerThumb?: string | null;
    vehiclePhoto?: string | null;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 10,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  borderContainer: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: "#0a2342",
    padding: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    borderWidth: 1.2,
    borderColor: "#0a2342",
    height: 58,
    marginBottom: 2.5,
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
    fontSize: 14.5,
    letterSpacing: 0.8,
  },
  brandTagline: {
    color: "#facc15",
    fontFamily: "Helvetica-Bold",
    fontSize: 6.2,
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
    fontSize: 13,
    letterSpacing: 0.4,
  },
  subTitle1: {
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
    fontSize: 8.6,
    marginTop: 1.5,
  },
  subTitle2: {
    color: "#475569",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.2,
    marginTop: 0.5,
  },
  metaBox: {
    width: 135,
    backgroundColor: "#f8fafc",
    padding: 5,
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1.5,
  },
  metaLabel: {
    fontSize: 8,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 8.4,
    color: "#0a2342",
    fontFamily: "Helvetica-Bold",
  },

  // ── Section Bars ──
  sectionBar: {
    backgroundColor: "#0a2342",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginTop: 3,
    marginBottom: 2,
  },
  sectionTitle: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.2,
    letterSpacing: 0.4,
  },
  sectionSub: {
    color: "#93c5fd",
    fontSize: 7.4,
    fontFamily: "Helvetica-Bold",
  },

  // ── Grid & Common Field Lines ──
  gridBox: {
    borderWidth: 0.8,
    borderColor: "#cbd5e1",
    padding: 5,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    gap: 9,
  },
  photoCell: {
    width: 92,
    height: 104,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  photoCaption: {
    fontSize: 7.2,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  fieldLabel: {
    width: 88,
    fontSize: 8.2,
    color: "#334155",
    fontFamily: "Helvetica-Bold",
  },
  fieldColon: {
    width: 8,
    fontSize: 8.2,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
  },
  fieldValue: {
    flex: 1,
    fontSize: 8.2,
    color: "#0f172a",
  },
  fieldValueBold: {
    flex: 1,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },

  // ── Section 1: Vehicle ──
  vehicleSpecs: {
    flex: 1,
    justifyContent: "space-between",
  },
  vehicleDocs: {
    width: 155,
    borderLeftWidth: 0.8,
    borderLeftColor: "#e2e8f0",
    paddingLeft: 7,
    justifyContent: "space-between",
  },
  docsHeader: {
    fontSize: 8.2,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    borderBottomWidth: 0.6,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 2,
    marginBottom: 2.5,
  },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1.5,
  },
  docName: {
    fontSize: 7.8,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
  },
  docVal: {
    fontSize: 8,
    color: "#047857",
    fontFamily: "Helvetica-Bold",
  },

  // ── Sections 2 & 3: Person Grids (Buyer & Seller) ──
  personTwoCol: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  personCol: {
    flex: 1,
    justifyContent: "space-between",
  },
  sideSigs: {
    width: 126,
    flexDirection: "column",
    gap: 4.5,
  },
  sideSigBox: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 2.5,
    height: 48,
  },
  sigImg: {
    maxWidth: "92%",
    maxHeight: 34,
    objectFit: "contain",
  },
  sigLabel: {
    fontSize: 7.2,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },

  // ── Section 4: Transaction & Payment ──
  txBox: {
    borderWidth: 0.8,
    borderColor: "#cbd5e1",
    padding: 5,
    backgroundColor: "#ffffff",
  },
  txGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4.5,
  },
  txItem: {
    width: "32.3%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    backgroundColor: "#f8fafc",
    borderWidth: 0.6,
    borderColor: "#e2e8f0",
  },
  txItemHighlight: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  txItemBalance: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  txLbl: {
    fontSize: 7.6,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
  },
  txVal: {
    fontSize: 7.8,
    color: "#0f172a",
    fontFamily: "Helvetica-Bold",
  },
  txValProminent: {
    fontSize: 9.8,
    color: "#1e3a8a",
    fontFamily: "Helvetica-Bold",
  },
  txValBalance: {
    fontSize: 9.5,
    color: "#b91c1c",
    fontFamily: "Helvetica-Bold",
  },
  txWordsLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    paddingTop: 2.5,
    borderTopWidth: 0.6,
    borderTopColor: "#e2e8f0",
    gap: 7,
  },
  txWordsLbl: {
    fontSize: 7.8,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },
  txWordsVal: {
    fontSize: 7.8,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },

  // ── Section 5: Acknowledgement ──
  ackBox: {
    borderWidth: 0.8,
    borderColor: "#cbd5e1",
    padding: 5,
    backgroundColor: "#ffffff",
  },
  ackIntro: {
    fontSize: 7.6,
    lineHeight: 1.38,
    color: "#0f172a",
    marginBottom: 3,
  },
  clauseText: {
    fontSize: 7.2,
    lineHeight: 1.35,
    color: "#1e293b",
    marginBottom: 2,
  },
  clauseBold: {
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
  },

  // ── Section 6: Signatures Grid ──
  signaturesGrid: {
    flexDirection: "row",
    gap: 7,
  },
  sigCard: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 2.5,
  },
  cardSigSlot: {
    height: 25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardSigImg: {
    maxWidth: "88%",
    maxHeight: 24,
    objectFit: "contain",
  },
  cardSigLine: {
    width: "86%",
    borderTopWidth: 0.8,
    borderTopColor: "#475569",
    marginVertical: 1,
  },
  cardSigText: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 18,
  },
  cardSigTitle: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    textAlign: "center",
  },
  cardSigSub: {
    fontSize: 6,
    color: "#64748b",
    textAlign: "center",
  },
  sigDateCard: {
    width: 86,
    borderWidth: 0.8,
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,
  },
  sigDateLbl: {
    fontSize: 7.4,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
  },
  sigDateVal: {
    fontSize: 8.2,
    fontFamily: "Helvetica-Bold",
    color: "#0a2342",
    marginTop: 2,
  },
});

function formatINR(val: any): string {
  if (val === "" || val === null || val === undefined) return "—";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return "₹" + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

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

function maskAadhaar(val?: string): string {
  if (!val) return "—";
  const cleaned = String(val).replace(/\s+/g, "");
  if (/^\d{12}$/.test(cleaned)) {
    return `•••• •••• ${cleaned.slice(8)}`;
  }
  return val;
}

function isValidRasterImage(src?: string | null): boolean {
  if (!src || typeof src !== "string") return false;
  const clean = src.trim();
  if (clean.length === 0) return false;
  if (clean.startsWith("data:image/svg+xml") || clean.includes("<svg")) return false;
  return (
    clean.startsWith("data:image/png") ||
    clean.startsWith("data:image/jpeg") ||
    clean.startsWith("data:image/webp") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://")
  );
}

export function BuyerBillPDF({ deal, resolvedImages = {} }: BuyerBillProps) {
  const seller = deal?.seller || {};
  const buyer = deal?.buyer || {};
  const vehicle = deal?.vehicle || {};
  const payments = deal?.payments || {};

  // Financial calculations
  const rawSellingPrice = payments.selling_price ?? "";
  const rawDiscount = payments.discount ?? 0;
  const rawAdditional = payments.additional_charges ?? 0;
  const rawReceived = payments.received_from_buyer ?? payments.advance_amount ?? "";

  const sellingPrice = rawSellingPrice !== "" && !isNaN(Number(rawSellingPrice)) ? Number(rawSellingPrice) : 0;
  const discount = rawDiscount !== "" && !isNaN(Number(rawDiscount)) ? Number(rawDiscount) : 0;
  const additionalCharges = rawAdditional !== "" && !isNaN(Number(rawAdditional)) ? Number(rawAdditional) : 0;

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
  }

  const advanceAmount =
    payments.advance_amount !== undefined && payments.advance_amount !== "" && !isNaN(Number(payments.advance_amount))
      ? Number(payments.advance_amount)
      : totalReceived;

  const amountInWords = finalInvoiceAmount > 0 ? convertToIndianWords(finalInvoiceAmount) : "Zero Rupees Only";

  const rawBillNumber = deal?.buyer_bill_number || deal?.bill_number || deal?.billNumber || "BB-001";
  const billNumber = rawBillNumber.startsWith("Bill-") ? rawBillNumber.replace("Bill-", "BB-") : rawBillNumber;

  const dealId = deal?.id ? (deal.id.startsWith("deal-") ? deal.id : deal.id.slice(0, 10).toUpperCase()) : "DEAL-NEW";
  const txDate = formatDisplayDate(payments.payment_date || deal?.created_at);
  const mfgYear = [vehicle.mfg_month, vehicle.year].filter(Boolean).join(" ");
  const regNumber = vehicle.registration_number || vehicle.vehicle_number || "";

  const {
    buyerPhoto,
    buyerSignature,
    buyerThumb,
    sellerPhoto,
    sellerSignature,
    sellerThumb,
    vehiclePhoto,
  } = resolvedImages;

  return (
    <Document title={`Buyer_Bill_${billNumber}`} author="Metro Motors">
      <Page size="A4" style={styles.page}>
        <View style={styles.borderContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.brandTitle}>METRO MOTORS</Text>
              <Text style={styles.brandTagline}>BUY • SELL • EXCHANGE • FINANCE</Text>
            </View>
            <View style={styles.headerTitleBox}>
              <Text style={styles.mainTitle}>BUYER BILL — VEHICLE PURCHASE RECEIPT</Text>
              <Text style={styles.subTitle1}>PURCHASE & TRANSACTION RECORD</Text>
              <Text style={styles.subTitle2}>INTERMEDIARY FACILITATED VEHICLE SALE</Text>
            </View>
            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Bill No:</Text>
                <Text style={styles.metaValue}>{billNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Deal ID:</Text>
                <Text style={styles.metaValue}>{dealId}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>{txDate}</Text>
              </View>
            </View>
          </View>

          {/* Section 1: Vehicle Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>1. VEHICLE DETAILS</Text>
            <Text style={styles.sectionSub}>Verified Vehicle Identity & Registration</Text>
          </View>
          <View style={styles.gridBox}>
            <View style={styles.photoCell}>
              {isValidRasterImage(vehiclePhoto) ? (
                <Image src={vehiclePhoto!} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoCaption}>Vehicle Photo</Text>
              )}
            </View>
            <View style={styles.vehicleSpecs}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Vehicle Name</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.vehicle_name || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Make / Brand</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.make || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Model</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.model || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Month & Year of Mfg</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{mfgYear || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValueBold}>{regNumber || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Registration Date</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.registration_date || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Engine Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.engine_number || vehicle.engineNumber || "—"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Chassis Number</Text>
                <Text style={styles.fieldColon}>:</Text>
                <Text style={styles.fieldValue}>{vehicle.chassis_number || vehicle.chassisNumber || "—"}</Text>
              </View>
            </View>
            <View style={styles.vehicleDocs}>
              <Text style={styles.docsHeader}>Document Validity</Text>
              <View style={styles.docRow}>
                <Text style={styles.docName}>Tax Status</Text>
                <Text style={styles.docVal}>{vehicle.tax || "L.T.T. Paid"}</Text>
              </View>
              <View style={styles.docRow}>
                <Text style={styles.docName}>Insurance Status</Text>
                <Text style={styles.docVal}>{vehicle.insurance || "Active / Valid"}</Text>
              </View>
              <View style={styles.docRow}>
                <Text style={styles.docName}>Fitness Certificate</Text>
                <Text style={styles.docVal}>{vehicle.fc || vehicle.fitness || "Valid"}</Text>
              </View>
              <View style={styles.docRow}>
                <Text style={styles.docName}>Clearance Certificate</Text>
                <Text style={styles.docVal}>{vehicle.cc || vehicle.noc || "Clear / Obtained"}</Text>
              </View>
            </View>
          </View>

          {/* Section 2: Buyer Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>2. BUYER DETAILS</Text>
            <Text style={styles.sectionSub}>Purchasing Party Profile</Text>
          </View>
          <View style={styles.gridBox}>
            <View style={styles.photoCell}>
              {isValidRasterImage(buyerPhoto) ? (
                <Image src={buyerPhoto!} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoCaption}>Buyer Photo</Text>
              )}
            </View>
            <View style={styles.personTwoCol}>
              <View style={styles.personCol}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValueBold}>{buyer.name || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Mobile Number</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.phone || buyer.mobile || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.email || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>City / District</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.city || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>PIN Code</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.pincode || buyer.pin || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>PAN Number</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.pan_number || buyer.pan || ""}</Text>
                </View>
              </View>
              <View style={styles.personCol}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Father / Spouse</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.father_name || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Alt Mobile</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.alternate_phone || buyer.alt_phone || ""}</Text>
                </View>
                <View style={styles.addressRow}>
                  <Text style={styles.fieldLabel}>Address</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.address || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{buyer.state || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Aadhaar Number</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{maskAadhaar(buyer.id_number || buyer.aadhaar || "")}</Text>
                </View>
              </View>
            </View>
            <View style={styles.sideSigs}>
              <View style={styles.sideSigBox}>
                {isValidRasterImage(buyerSignature) ? <Image src={buyerSignature!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Buyer Signature</Text>
              </View>
              <View style={styles.sideSigBox}>
                {isValidRasterImage(buyerThumb) ? <Image src={buyerThumb!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Buyer Thumb</Text>
              </View>
            </View>
          </View>

          {/* Section 3: Seller / Registered Owner Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>3. SELLER / REGISTERED OWNER DETAILS</Text>
            <Text style={styles.sectionSub}>Registered Owner / Selling Party Profile</Text>
          </View>
          <View style={styles.gridBox}>
            <View style={styles.photoCell}>
              {isValidRasterImage(sellerPhoto) ? (
                <Image src={sellerPhoto!} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoCaption}>Seller Photo</Text>
              )}
            </View>
            <View style={styles.personTwoCol}>
              <View style={styles.personCol}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValueBold}>{seller.name || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Mobile Number</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.phone || seller.mobile || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.email || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>City / District</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.city || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>PIN Code</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.pincode || seller.pin || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>PAN Number</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.pan_number || seller.pan || ""}</Text>
                </View>
              </View>
              <View style={styles.personCol}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Father / Spouse</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.father_name || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Alt Mobile</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.alternate_phone || seller.alt_phone || ""}</Text>
                </View>
                <View style={styles.addressRow}>
                  <Text style={styles.fieldLabel}>Address</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.address || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{seller.state || ""}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Aadhaar Number</Text>
                  <Text style={styles.fieldColon}>:</Text>
                  <Text style={styles.fieldValue}>{maskAadhaar(seller.id_number || seller.aadhaar || "")}</Text>
                </View>
              </View>
            </View>
            <View style={styles.sideSigs}>
              <View style={styles.sideSigBox}>
                {isValidRasterImage(sellerSignature) ? <Image src={sellerSignature!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Seller Signature</Text>
              </View>
              <View style={styles.sideSigBox}>
                {isValidRasterImage(sellerThumb) ? <Image src={sellerThumb!} style={styles.sigImg} /> : null}
                <Text style={styles.sigLabel}>Seller Thumb</Text>
              </View>
            </View>
          </View>

          {/* Section 4: Transaction & Payment Details */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>4. TRANSACTION & PAYMENT DETAILS</Text>
            <Text style={styles.sectionSub}>Financial Settlement & Record</Text>
          </View>
          <View style={styles.txBox}>
            <View style={styles.txGrid}>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Deal ID:</Text>
                <Text style={styles.txVal}>{dealId}</Text>
              </View>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Bill Number:</Text>
                <Text style={styles.txVal}>{billNumber}</Text>
              </View>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Date:</Text>
                <Text style={styles.txVal}>{txDate}</Text>
              </View>

              <View style={[styles.txItem, styles.txItemHighlight]}>
                <Text style={styles.txLbl}>Final Transaction Amt:</Text>
                <Text style={styles.txValProminent}>{formatINR(finalInvoiceAmount)}</Text>
              </View>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Advance Amount Paid:</Text>
                <Text style={styles.txVal}>{formatINR(advanceAmount)}</Text>
              </View>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Total Amount Received:</Text>
                <Text style={styles.txVal}>{formatINR(totalReceived)}</Text>
              </View>

              <View style={[styles.txItem, styles.txItemBalance]}>
                <Text style={styles.txLbl}>Remaining Balance:</Text>
                <Text style={styles.txValBalance}>{formatINR(remainingBalance)}</Text>
              </View>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Payment Method:</Text>
                <Text style={styles.txVal}>{payments.payment_method || "Cash"}</Text>
              </View>
              <View style={styles.txItem}>
                <Text style={styles.txLbl}>Payment Status:</Text>
                <Text style={styles.txVal}>{paymentStatus}</Text>
              </View>
            </View>

            <View style={styles.txWordsLine}>
              <Text style={styles.txWordsLbl}>Amount in Words:</Text>
              <Text style={styles.txWordsVal}>{amountInWords}</Text>
            </View>
          </View>

          {/* Section 5: Buyer Acknowledgement */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>5. BUYER ACKNOWLEDGEMENT</Text>
            <Text style={styles.sectionSub}>Intermediary Transaction Undertaking</Text>
          </View>
          <View style={styles.ackBox}>
            <Text style={styles.ackIntro}>
              I hereby acknowledge the purchase of the vehicle described in this bill from the seller/registered owner, facilitated through <Text style={styles.clauseBold}>METRO MOTORS</Text>, acting as an intermediary in the transaction. The final transaction amount is as stated in this bill.
            </Text>
            <Text style={styles.clauseText}>
              1. I acknowledge the payments recorded in this bill and understand that any outstanding balance remains payable according to the agreed transaction terms.
            </Text>
            <Text style={styles.clauseText}>
              2. The vehicle details and transaction information have been recorded to the best of the parties' knowledge.
            </Text>
            <Text style={styles.clauseText}>
              3. I understand that the vehicle is purchased from the seller/registered owner through METRO MOTORS, and that METRO MOTORS is not represented as the direct vehicle owner or seller.
            </Text>
            <Text style={styles.clauseText}>
              4. The vehicle, along with its available keys and documents, has been received in inspected condition, subject to the terms agreed between the parties.
            </Text>
            <Text style={styles.clauseText}>
              5. I confirm that I have read and understood the transaction terms recorded in this bill.
            </Text>
          </View>

          {/* Section 6: Signatures */}
          <View style={styles.sectionBar}>
            <Text style={styles.sectionTitle}>6. SIGNATURES</Text>
            <Text style={styles.sectionSub}>Execution & Delivery Confirmation</Text>
          </View>
          <View style={styles.signaturesGrid}>
            <View style={styles.sigCard}>
              <View style={styles.cardSigSlot}>
                {isValidRasterImage(sellerSignature) && (
                  <Image src={sellerSignature!} style={styles.cardSigImg} />
                )}
              </View>
              <View style={styles.cardSigLine} />
              <View style={styles.cardSigText}>
                <Text style={styles.cardSigTitle}>Seller / Registered Owner Signature</Text>
                <Text style={styles.cardSigSub}>(Selling Party)</Text>
              </View>
            </View>

            <View style={styles.sigCard}>
              <View style={styles.cardSigSlot}>
                {isValidRasterImage(buyerSignature) && (
                  <Image src={buyerSignature!} style={styles.cardSigImg} />
                )}
              </View>
              <View style={styles.cardSigLine} />
              <View style={styles.cardSigText}>
                <Text style={styles.cardSigTitle}>Buyer Signature</Text>
                <Text style={styles.cardSigSub}>(Purchasing Party)</Text>
              </View>
            </View>

            <View style={styles.sigCard}>
              <View style={styles.cardSigSlot} />
              <View style={styles.cardSigLine} />
              <View style={styles.cardSigText}>
                <Text style={styles.cardSigTitle}>For METRO MOTORS</Text>
                <Text style={styles.cardSigSub}>(Authorized Representative)</Text>
              </View>
            </View>

            <View style={styles.sigDateCard}>
              <Text style={styles.sigDateLbl}>Date:</Text>
              <Text style={styles.sigDateVal}>{txDate}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
export default BuyerBillPDF;
