import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { AGREEMENT_TEMPLATE_DATA_URI } from "@/assets/agreementTemplateBase64";
import { convertToIndianWords } from "@/utils/numberToWords";
import {
  PAGE_DIMENSIONS,
  HEADER_COORDINATES,
  OWNER_VEHICLE_COORDINATES,
  SENTENCE_COORDINATES,
  PRICE_COORDINATES,
  SELLER_BLOCK_COORDINATES,
  PURCHASER_BLOCK_COORDINATES,
  WITNESS_BLOCK_COORDINATES,
  CHECKBOX_COORDINATES,
  PAYMENT_COORDINATES,
  FieldBox,
} from "./agreementCoordinates";

export interface SellerAgreementDeal {
  billNumber?: string;
  bill_number?: string;
  place?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  insurance?: boolean;
  fc?: boolean;
  tax?: boolean;
  cc?: boolean;
  toAndInsurance?: string;
  vehicle?: {
    brand?: string;
    make?: string;
    model?: string;
    variant?: string;
    engineNumber?: string;
    engine_number?: string;
    vehicleNumber?: string;
    vehicle_number?: string;
    registration_number?: string;
    chassisNumber?: string;
    chassis_number?: string;
    tax?: string;
    fitness?: string;
    insurance?: string;
    hypothecation?: string;
    noc?: string;
    sold_date?: string;
    bought_date?: string;
    [key: string]: any;
  };
  seller?: {
    name?: string;
    fullAddress?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    mobile?: string;
    phone?: string;
    aadhaar?: string;
    id_number?: string;
    photo?: any;
    signature?: any;
    thumb?: any;
    [key: string]: any;
  };
  buyer?: {
    name?: string;
    fullAddress?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    mobile?: string;
    phone?: string;
    aadhaar?: string;
    id_number?: string;
    photo?: any;
    signature?: any;
    thumb?: any;
    [key: string]: any;
  };
  witness1?: {
    name?: string;
    address?: string;
    mobile?: string;
    phone?: string;
    aadhaar?: string;
    id_number?: string;
    photo?: any;
    signature?: any;
    thumb?: any;
    [key: string]: any;
  };
  witnesses?: Array<{
    name?: string;
    address?: string;
    phone?: string;
    id_number?: string;
    photo?: any;
    signature?: any;
    thumb?: any;
    [key: string]: any;
  }>;
  payment?: {
    purchasePrice?: string | number;
    advancePaid?: string | number;
    balanceAmount?: string | number;
    toAndInsurance?: string;
    [key: string]: any;
  };
  payments?: {
    purchase_price?: string | number;
    selling_price?: string | number;
    paid_to_seller?: string | number;
    received_from_buyer?: string | number;
    payment_date?: string;
    [key: string]: any;
  };
  photos?: Record<string, any>;
  [key: string]: any;
}

interface SellerAgreementProps {
  deal: SellerAgreementDeal;
  resolvedImages?: {
    sellerPhoto?: string | null;
    sellerSignature?: string | null;
    sellerThumb?: string | null;
    buyerPhoto?: string | null;
    buyerSignature?: string | null;
    buyerThumb?: string | null;
    witnessPhoto?: string | null;
    witnessSignature?: string | null;
    witnessThumb?: string | null;
  };
}

const styles = StyleSheet.create({
  page: {
    width: PAGE_DIMENSIONS.width,
    height: PAGE_DIMENSIONS.height,
    position: "relative",
    backgroundColor: "#ffffff",
    padding: 0,
    margin: 0,
  },
  backgroundTemplate: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_DIMENSIONS.width,
    height: PAGE_DIMENSIONS.height,
  },
  nameField: {
    position: "absolute",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0f233f",
  },
  valueField: {
    position: "absolute",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.0,
    color: "#0f233f",
  },
  textRegular: {
    position: "absolute",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#1e293b",
  },
  headerField: {
    position: "absolute",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.0,
    color: "#0f233f",
    textAlign: "center",
  },
  missingImageBox: {
    position: "absolute",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  missingImageText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textAlign: "center",
  },
  imageContainer: {
    position: "absolute",
    overflow: "hidden",
  },
  imageCover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageContain: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  checkboxContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    fontFamily: "Helvetica-Bold",
    color: "#0d2342",
    fontSize: 13,
    textAlign: "center",
  },
  paymentValue: {
    position: "absolute",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0d2342",
    textAlign: "center",
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
  if (val === "" || val === null || val === undefined) return "";
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num) + " /-";
}

function splitAddressLines(text: string, maxLen = 65, maxLines = 2): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxLen) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function SellerAgreementPDF({ deal, resolvedImages }: SellerAgreementProps) {
  // 1. Header mapping
  const slNo = deal.billNumber || deal.bill_number || "MM-26-0002";
  const place = deal.place || (deal.seller?.city ? `${deal.seller.city}` : "Davangere");
  const dateValue = formatDisplayDate(
    deal.deliveryDate ||
    deal.payments?.payment_date ||
    deal.vehicle?.sold_date ||
    deal.vehicle?.bought_date
  );
  const timeValue = deal.deliveryTime || deal.delivery_time || "11:30 AM";

  // 2. Owner section
  const sellerName = deal.seller?.name || "";
  const sellerFullAddress =
    deal.seller?.fullAddress ||
    [deal.seller?.address, deal.seller?.city, deal.seller?.state, deal.seller?.pincode]
      .filter(Boolean)
      .join(", ");
  const sellerAddressLines = splitAddressLines(sellerFullAddress, 70, 2);
  const sellerMobile = deal.seller?.mobile || deal.seller?.phone || "";
  const sellerAadhaar = deal.seller?.aadhaar || deal.seller?.id_number || "";

  // 3. Vehicle section
  const vehicleMake = deal.vehicle?.brand || deal.vehicle?.make || "";
  const vehicleModel = deal.vehicle?.model || deal.vehicle?.variant || "";
  const engineNumber = deal.vehicle?.engineNumber || deal.vehicle?.engine_number || "";
  const vehicleNumber =
    deal.vehicle?.vehicleNumber ||
    deal.vehicle?.vehicle_number ||
    deal.vehicle?.registration_number ||
    "";
  const chassisNumber = deal.vehicle?.chassisNumber || deal.vehicle?.chassis_number || "";

  // 4. Sentence section
  const buyerName = "METRO MOTORS";

  // 5. Witness section
  const witness1: any = deal.witness1 || (deal.witnesses && deal.witnesses[0]) || {};
  const witnessName = witness1.name || "";
  const witnessAddress = witness1.address || "";
  const witnessAddressLines = splitAddressLines(witnessAddress, 25, 2);
  const witnessMobile = witness1.mobile || witness1.phone || "";
  const witnessAadhaar = witness1.aadhaar || witness1.id_number || "";

  // 6. Price section
  const purchasePriceRaw =
    deal.payment?.purchasePrice ??
    deal.payments?.purchase_price ??
    deal.payments?.selling_price ??
    "";
  const priceDisplay = purchasePriceRaw ? formatCurrency(purchasePriceRaw) : "";
  const priceWords = convertToIndianWords(purchasePriceRaw);

  const advancePaidRaw =
    deal.payment?.advancePaid ??
    deal.payments?.paid_to_seller ??
    deal.payments?.received_from_buyer ??
    "";
  const advancePaidDisplay = advancePaidRaw ? formatCurrency(advancePaidRaw) : "";

  let balanceAmountRaw = deal.payment?.balanceAmount;
  if (balanceAmountRaw === undefined || balanceAmountRaw === "") {
    if (purchasePriceRaw !== "" && advancePaidRaw !== "") {
      balanceAmountRaw = Math.max(0, Number(purchasePriceRaw) - Number(advancePaidRaw));
    } else {
      balanceAmountRaw = "";
    }
  }
  const balanceAmountDisplay = balanceAmountRaw !== "" ? formatCurrency(balanceAmountRaw) : "";
  const toAndInsuranceDisplay =
    deal.payment?.toAndInsurance ? (
      !isNaN(Number(deal.payment?.toAndInsurance)) ? formatCurrency(deal.payment?.toAndInsurance) : deal.payment?.toAndInsurance
    ) : "5,000 /-";

  // 7. Checkboxes
  const isInsuranceChecked =
    deal.insurance === true ||
    deal.vehicle?.insurance === "Active" ||
    deal.vehicle?.insurance === "Valid" ||
    deal.insurance !== false;
  const isFcChecked =
    deal.fc === true ||
    deal.vehicle?.fitness === "Valid" ||
    deal.vehicle?.fitness === "Lifetime" ||
    deal.fc !== false;
  const isTaxChecked =
    deal.tax === true ||
    deal.vehicle?.tax === "Paid" ||
    deal.vehicle?.tax === "Lifetime" ||
    deal.tax !== false;
  const isCcChecked =
    deal.cc === true ||
    deal.vehicle?.noc === "Available" ||
    deal.vehicle?.hypothecation === "No" ||
    deal.cc !== false;

  // 8. Photos & signatures
  const sellerPhoto = resolvedImages?.sellerPhoto || deal.seller?.photo;
  const sellerSignature = resolvedImages?.sellerSignature || deal.seller?.signature;
  const sellerThumb = resolvedImages?.sellerThumb || deal.seller?.thumb;

  const buyerPhoto = resolvedImages?.buyerPhoto || deal.buyer?.photo;
  const buyerSignature = resolvedImages?.buyerSignature || deal.buyer?.signature;
  const buyerThumb = resolvedImages?.buyerThumb || deal.buyer?.thumb;

  const witnessPhoto = resolvedImages?.witnessPhoto || deal.witness1?.photo;
  const witnessSignature = resolvedImages?.witnessSignature || deal.witness1?.signature;
  const witnessThumb = resolvedImages?.witnessThumb || deal.witness1?.thumb;

  const renderImageBox = (
    src: string | null | undefined,
    coords: FieldBox,
    isSignature = false
  ) => {
    const boxStyle = {
      left: coords.x,
      top: coords.y,
      width: coords.width,
      height: coords.height,
    };

    if (!src) {
      return (
        <View style={[styles.missingImageBox, boxStyle]}>
          <Text style={styles.missingImageText}>NOT UPLOADED</Text>
        </View>
      );
    }

    return (
      <View style={[styles.imageContainer, boxStyle]}>
        <Image
          src={src}
          style={isSignature ? styles.imageContain : styles.imageCover}
        />
      </View>
    );
  };

  return (
    <Document title={`${slNo}-Seller-Agreement`} author="Metro Motors">
      <Page size="A4" style={styles.page}>
        {/* Full-Page A4 Background Template with zero margins */}
        <Image
          src={AGREEMENT_TEMPLATE_DATA_URI}
          style={styles.backgroundTemplate}
          fixed={true}
        />

        {/* ----------------- HEADER ROW (Centered) ----------------- */}
        {/* Bill No centered inside SL NO line */}
        <Text
          style={[
            styles.headerField,
            {
              left: HEADER_COORDINATES.billNo.x,
              top: HEADER_COORDINATES.billNo.y,
              width: HEADER_COORDINATES.billNo.width,
            },
          ]}
        >
          {slNo}
        </Text>

        {/* Place centered on PLACE line */}
        <Text
          style={[
            styles.headerField,
            {
              left: HEADER_COORDINATES.place.x,
              top: HEADER_COORDINATES.place.y,
              width: HEADER_COORDINATES.place.width,
            },
          ]}
        >
          {place}
        </Text>

        {/* Date centered on DATE line */}
        <Text
          style={[
            styles.headerField,
            {
              left: HEADER_COORDINATES.date.x,
              top: HEADER_COORDINATES.date.y,
              width: HEADER_COORDINATES.date.width,
              fontSize: 8.5,
            },
          ]}
        >
          {dateValue}
        </Text>

        {/* Time centered on TIME line */}
        <Text
          style={[
            styles.headerField,
            {
              left: HEADER_COORDINATES.time.x,
              top: HEADER_COORDINATES.time.y,
              width: HEADER_COORDINATES.time.width,
              fontSize: 8.0,
            },
          ]}
        >
          {timeValue}
        </Text>

        {/* ----------------- OWNER SECTION ----------------- */}
        {/* Registered Owner Name starts exactly after printed label */}
        <Text
          style={[
            styles.nameField,
            {
              left: OWNER_VEHICLE_COORDINATES.registeredOwnerName.x,
              top: OWNER_VEHICLE_COORDINATES.registeredOwnerName.y,
              width: OWNER_VEHICLE_COORDINATES.registeredOwnerName.width,
            },
          ]}
        >
          {sellerName}
        </Text>

        {/* Address wraps within dotted line width (maximum 2 lines) */}
        <Text
          style={[
            styles.textRegular,
            {
              left: OWNER_VEHICLE_COORDINATES.addressLine1.x,
              top: OWNER_VEHICLE_COORDINATES.addressLine1.y,
              width: OWNER_VEHICLE_COORDINATES.addressLine1.width,
            },
          ]}
        >
          {sellerAddressLines[0] || ""}
        </Text>
        <Text
          style={[
            styles.textRegular,
            {
              left: OWNER_VEHICLE_COORDINATES.addressLine2.x,
              top: OWNER_VEHICLE_COORDINATES.addressLine2.y,
              width: OWNER_VEHICLE_COORDINATES.addressLine2.width,
            },
          ]}
        >
          {sellerAddressLines[1] || ""}
        </Text>

        {/* ----------------- VEHICLE SECTION ----------------- */}
        {/* Make (Left) */}
        <Text
          style={[
            styles.valueField,
            {
              left: OWNER_VEHICLE_COORDINATES.make.x,
              top: OWNER_VEHICLE_COORDINATES.make.y,
              width: OWNER_VEHICLE_COORDINATES.make.width,
            },
          ]}
        >
          {vehicleMake}
        </Text>

        {/* Vehicle No (Right) */}
        <Text
          style={[
            styles.valueField,
            {
              left: OWNER_VEHICLE_COORDINATES.vehicleNo.x,
              top: OWNER_VEHICLE_COORDINATES.vehicleNo.y,
              width: OWNER_VEHICLE_COORDINATES.vehicleNo.width,
            },
          ]}
        >
          {vehicleNumber}
        </Text>

        {/* Model (Left) */}
        <Text
          style={[
            styles.valueField,
            {
              left: OWNER_VEHICLE_COORDINATES.model.x,
              top: OWNER_VEHICLE_COORDINATES.model.y,
              width: OWNER_VEHICLE_COORDINATES.model.width,
            },
          ]}
        >
          {vehicleModel}
        </Text>

        {/* Chassis No (Right) */}
        <Text
          style={[
            styles.valueField,
            {
              left: OWNER_VEHICLE_COORDINATES.chassisNo.x,
              top: OWNER_VEHICLE_COORDINATES.chassisNo.y,
              width: OWNER_VEHICLE_COORDINATES.chassisNo.width,
            },
          ]}
        >
          {chassisNumber}
        </Text>

        {/* Engine No (Left) */}
        <Text
          style={[
            styles.valueField,
            {
              left: OWNER_VEHICLE_COORDINATES.engineNo.x,
              top: OWNER_VEHICLE_COORDINATES.engineNo.y,
              width: OWNER_VEHICLE_COORDINATES.engineNo.width,
            },
          ]}
        >
          {engineNumber}
        </Text>

        {/* ----------------- SENTENCE SECTION ----------------- */}
        {/* Buyer name begins immediately after "Shri" */}
        <Text
          style={[
            styles.nameField,
            {
              left: SENTENCE_COORDINATES.buyerName.x,
              top: SENTENCE_COORDINATES.buyerName.y,
              width: SENTENCE_COORDINATES.buyerName.width,
              color: "#0f233f",
            },
          ]}
        >
          {buyerName}
        </Text>

        {/* ----------------- PRICE SECTION ----------------- */}
        {/* Amount starts after "Rs." */}
        <Text
          style={[
            styles.valueField,
            {
              left: PRICE_COORDINATES.purchasePrice.x,
              top: PRICE_COORDINATES.purchasePrice.y,
              width: PRICE_COORDINATES.purchasePrice.width,
            },
          ]}
        >
          {priceDisplay}
        </Text>

        {/* Amount in words stays inside the dotted line */}
        <Text
          style={[
            styles.valueField,
            {
              left: PRICE_COORDINATES.priceWords.x,
              top: PRICE_COORDINATES.priceWords.y,
              width: PRICE_COORDINATES.priceWords.width,
              fontSize: 8.5,
            },
          ]}
        >
          {priceWords}
        </Text>

        {/* Purchaser Signature */}
        {buyerSignature ? (
          renderImageBox(buyerSignature, PRICE_COORDINATES.purchaserSignature, true)
        ) : (
          <Text
            style={[
              styles.textRegular,
              {
                left: PRICE_COORDINATES.purchaserSignature.x,
                top: PRICE_COORDINATES.purchaserSignature.y + 2,
                width: PRICE_COORDINATES.purchaserSignature.width,
              },
            ]}
          >
            {buyerName === "METRO MOTORS" ? "Metro Motors" : buyerName}
          </Text>
        )}

        {/* ----------------- SELLER BLOCK ----------------- */}
        {/* Photo fills rectangle with cover crop */}
        {renderImageBox(sellerPhoto, SELLER_BLOCK_COORDINATES.photo)}

        {/* Thumb fills only thumb box */}
        {renderImageBox(sellerThumb, SELLER_BLOCK_COORDINATES.thumb)}

        {/* Name aligned to printed dotted line */}
        <Text
          style={[
            styles.nameField,
            {
              left: SELLER_BLOCK_COORDINATES.name.x,
              top: SELLER_BLOCK_COORDINATES.name.y,
              width: SELLER_BLOCK_COORDINATES.name.width,
              fontSize: 8.5,
            },
          ]}
        >
          {sellerName}
        </Text>

        {/* Address lines automatically wrap without overflowing */}
        <Text
          style={[
            styles.textRegular,
            {
              left: SELLER_BLOCK_COORDINATES.addressLine1.x,
              top: SELLER_BLOCK_COORDINATES.addressLine1.y,
              width: SELLER_BLOCK_COORDINATES.addressLine1.width,
              fontSize: 7.5,
            },
          ]}
        >
          {sellerAddressLines[0] || ""}
        </Text>
        <Text
          style={[
            styles.textRegular,
            {
              left: SELLER_BLOCK_COORDINATES.addressLine2.x,
              top: SELLER_BLOCK_COORDINATES.addressLine2.y,
              width: SELLER_BLOCK_COORDINATES.addressLine2.width,
              fontSize: 7.5,
            },
          ]}
        >
          {sellerAddressLines[1] || ""}
        </Text>

        {/* Sign */}
        {sellerSignature ? (
          renderImageBox(sellerSignature, SELLER_BLOCK_COORDINATES.sign, true)
        ) : (
          <Text
            style={[
              styles.textRegular,
              {
                left: SELLER_BLOCK_COORDINATES.sign.x,
                top: SELLER_BLOCK_COORDINATES.sign.y + 2,
                width: SELLER_BLOCK_COORDINATES.sign.width,
                fontSize: 7.5,
              },
            ]}
          >
            {sellerName}
          </Text>
        )}

        {/* Cell */}
        <Text
          style={[
            styles.valueField,
            {
              left: SELLER_BLOCK_COORDINATES.cell.x,
              top: SELLER_BLOCK_COORDINATES.cell.y,
              width: SELLER_BLOCK_COORDINATES.cell.width,
              fontSize: 8.0,
            },
          ]}
        >
          {sellerMobile}
        </Text>

        {/* Aadhaar */}
        <Text
          style={[
            styles.valueField,
            {
              left: SELLER_BLOCK_COORDINATES.aadhaar.x,
              top: SELLER_BLOCK_COORDINATES.aadhaar.y,
              width: SELLER_BLOCK_COORDINATES.aadhaar.width,
              fontSize: 8.0,
            },
          ]}
        >
          {sellerAadhaar}
        </Text>

        {/* ----------------- PURCHASER BLOCK ----------------- */}
        {/* Purchaser is permanently METRO MOTORS and pre-printed on the template */}

        {/* ----------------- WITNESS BLOCK ----------------- */}
        {/* Photo */}
        {renderImageBox(witnessPhoto, WITNESS_BLOCK_COORDINATES.photo)}

        {/* Thumb */}
        {renderImageBox(witnessThumb, WITNESS_BLOCK_COORDINATES.thumb)}

        {/* Name */}
        <Text
          style={[
            styles.nameField,
            {
              left: WITNESS_BLOCK_COORDINATES.name.x,
              top: WITNESS_BLOCK_COORDINATES.name.y,
              width: WITNESS_BLOCK_COORDINATES.name.width,
              fontSize: 8.5,
            },
          ]}
        >
          {witnessName}
        </Text>

        {/* Address */}
        <Text
          style={[
            styles.textRegular,
            {
              left: WITNESS_BLOCK_COORDINATES.addressLine1.x,
              top: WITNESS_BLOCK_COORDINATES.addressLine1.y,
              width: WITNESS_BLOCK_COORDINATES.addressLine1.width,
              fontSize: 7.5,
            },
          ]}
        >
          {witnessAddressLines[0] || ""}
        </Text>
        <Text
          style={[
            styles.textRegular,
            {
              left: WITNESS_BLOCK_COORDINATES.addressLine2.x,
              top: WITNESS_BLOCK_COORDINATES.addressLine2.y,
              width: WITNESS_BLOCK_COORDINATES.addressLine2.width,
              fontSize: 7.5,
            },
          ]}
        >
          {witnessAddressLines[1] || ""}
        </Text>

        {/* Sign */}
        {witnessSignature ? (
          renderImageBox(witnessSignature, WITNESS_BLOCK_COORDINATES.sign, true)
        ) : (
          <Text
            style={[
              styles.textRegular,
              {
                left: WITNESS_BLOCK_COORDINATES.sign.x,
                top: WITNESS_BLOCK_COORDINATES.sign.y + 2,
                width: WITNESS_BLOCK_COORDINATES.sign.width,
                fontSize: 7.5,
              },
            ]}
          >
            {witnessName}
          </Text>
        )}

        {/* Cell */}
        <Text
          style={[
            styles.valueField,
            {
              left: WITNESS_BLOCK_COORDINATES.cell.x,
              top: WITNESS_BLOCK_COORDINATES.cell.y,
              width: WITNESS_BLOCK_COORDINATES.cell.width,
              fontSize: 8.0,
            },
          ]}
        >
          {witnessMobile}
        </Text>

        {/* Aadhaar */}
        <Text
          style={[
            styles.valueField,
            {
              left: WITNESS_BLOCK_COORDINATES.aadhaar.x,
              top: WITNESS_BLOCK_COORDINATES.aadhaar.y,
              width: WITNESS_BLOCK_COORDINATES.aadhaar.width,
              fontSize: 8.0,
            },
          ]}
        >
          {witnessAadhaar}
        </Text>

        {/* ----------------- CHECKBOXES (9x9 mm = 25.51x25.51 pt) ----------------- */}
        {isInsuranceChecked && (
          <View
            style={[
              styles.checkboxContainer,
              {
                left: CHECKBOX_COORDINATES.insurance.x,
                top: CHECKBOX_COORDINATES.insurance.y,
                width: CHECKBOX_COORDINATES.insurance.width,
                height: CHECKBOX_COORDINATES.insurance.height,
              },
            ]}
          >
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}

        {isFcChecked && (
          <View
            style={[
              styles.checkboxContainer,
              {
                left: CHECKBOX_COORDINATES.fc.x,
                top: CHECKBOX_COORDINATES.fc.y,
                width: CHECKBOX_COORDINATES.fc.width,
                height: CHECKBOX_COORDINATES.fc.height,
              },
            ]}
          >
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}

        {isTaxChecked && (
          <View
            style={[
              styles.checkboxContainer,
              {
                left: CHECKBOX_COORDINATES.tax.x,
                top: CHECKBOX_COORDINATES.tax.y,
                width: CHECKBOX_COORDINATES.tax.width,
                height: CHECKBOX_COORDINATES.tax.height,
              },
            ]}
          >
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}

        {isCcChecked && (
          <View
            style={[
              styles.checkboxContainer,
              {
                left: CHECKBOX_COORDINATES.cc.x,
                top: CHECKBOX_COORDINATES.cc.y,
                width: CHECKBOX_COORDINATES.cc.width,
                height: CHECKBOX_COORDINATES.cc.height,
              },
            ]}
          >
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}

        {/* ----------------- PAYMENT BREAKDOWN ----------------- */}
        {/* Price */}
        <Text
          style={[
            styles.paymentValue,
            {
              left: PAYMENT_COORDINATES.price.x,
              top: PAYMENT_COORDINATES.price.y,
              width: PAYMENT_COORDINATES.price.width,
            },
          ]}
        >
          {priceDisplay}
        </Text>

        {/* Advance Paid */}
        <Text
          style={[
            styles.paymentValue,
            {
              left: PAYMENT_COORDINATES.advancePaid.x,
              top: PAYMENT_COORDINATES.advancePaid.y,
              width: PAYMENT_COORDINATES.advancePaid.width,
            },
          ]}
        >
          {advancePaidDisplay}
        </Text>

        {/* Balance Amount */}
        <Text
          style={[
            styles.paymentValue,
            {
              left: PAYMENT_COORDINATES.balanceAmount.x,
              top: PAYMENT_COORDINATES.balanceAmount.y,
              width: PAYMENT_COORDINATES.balanceAmount.width,
            },
          ]}
        >
          {balanceAmountDisplay}
        </Text>

        {/* TO & Insurance */}
        <Text
          style={[
            styles.paymentValue,
            {
              left: PAYMENT_COORDINATES.toAndInsurance.x,
              top: PAYMENT_COORDINATES.toAndInsurance.y,
              width: PAYMENT_COORDINATES.toAndInsurance.width,
              fontSize: 9.0,
            },
          ]}
        >
          {toAndInsuranceDisplay}
        </Text>
      </Page>
    </Document>
  );
}

export default SellerAgreementPDF;
