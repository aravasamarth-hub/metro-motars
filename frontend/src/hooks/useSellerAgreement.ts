import React, { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  SellerAgreementPDF,
  SellerAgreementDeal,
} from "@/components/pdf/SellerAgreementPDF";

/**
 * Safely resolves any photo representation (Blob, File, Object with .blob, Data URL, string URL)
 * into a Base64 Data URL or string URL for @react-pdf/renderer.
 * Returns null on any failure, guaranteeing that PDF generation never crashes.
 */
async function resolveImageToDataUrl(imageInput: any): Promise<string | null> {
  if (!imageInput) return null;

  if (typeof imageInput === "string") {
    const trimmed = imageInput.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  const blob =
    imageInput.blob ||
    (imageInput instanceof Blob || imageInput instanceof File ? imageInput : null);

  if (blob) {
    try {
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(typeof reader.result === "string" ? reader.result : null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  if (typeof imageInput.url === "string" && imageInput.url.trim().length > 0) {
    return imageInput.url;
  }

  return null;
}

/**
 * Directly generates and triggers automatic download of the Seller Agreement PDF.
 * Name format: MM-26-0001-Seller-Agreement.pdf
 */
export async function downloadSellerAgreementPDF(deal: SellerAgreementDeal): Promise<string> {
  // Pre-resolve all photos safely
  const [
    sellerPhoto,
    sellerSignature,
    sellerThumb,
    buyerPhoto,
    buyerSignature,
    buyerThumb,
    witnessPhoto,
    witnessSignature,
  ] = await Promise.all([
    resolveImageToDataUrl(
      deal.seller?.photo || deal.photos?.["seller-1"] || deal.photos?.["seller_photo"]
    ),
    resolveImageToDataUrl(
      deal.seller?.signature || deal.photos?.["seller-8"] || deal.photos?.["seller_signature"]
    ),
    resolveImageToDataUrl(
      deal.seller?.thumb || deal.photos?.["seller-thumb"] || deal.photos?.["seller-2"]
    ),
    resolveImageToDataUrl(
      deal.buyer?.photo || deal.photos?.["buyer-1"] || deal.photos?.["buyer_photo"]
    ),
    resolveImageToDataUrl(
      deal.buyer?.signature || deal.photos?.["buyer-8"] || deal.photos?.["buyer_signature"]
    ),
    resolveImageToDataUrl(
      deal.buyer?.thumb || deal.photos?.["buyer-thumb"] || deal.photos?.["buyer-2"]
    ),
    resolveImageToDataUrl(
      deal.witness1?.photo || deal.photos?.["witness-1-1"] || deal.photos?.["witness-1"]
    ),
    resolveImageToDataUrl(
      deal.witness1?.signature ||
        deal.photos?.["witness-1-2"] ||
        deal.photos?.["witness-1-signature"]
    ),
  ]);

  const resolvedImages = {
    sellerPhoto,
    sellerSignature,
    sellerThumb,
    buyerPhoto,
    buyerSignature,
    buyerThumb,
    witnessPhoto,
    witnessSignature,
  };

  const doc = React.createElement(SellerAgreementPDF, { deal, resolvedImages }) as any;
  const instance = pdf(doc);
  const blob = await instance.toBlob();

  const rawBillNumber = deal.billNumber || deal.bill_number || "MM-26-0001";
  const cleanBillNumber = rawBillNumber.replace(/[^a-zA-Z0-9_-]/g, "-");
  const fileName = `${cleanBillNumber}-Seller-Agreement.pdf`;

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);

  return fileName;
}

export function useSellerAgreement() {
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateAgreement = useCallback(async (deal: SellerAgreementDeal) => {
    setGenerating(true);
    setError(null);
    try {
      const fileName = await downloadSellerAgreementPDF(deal);
      return fileName;
    } catch (err: any) {
      const message = err?.message || "Failed to generate Seller Agreement PDF";
      setError(message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  return {
    generateAgreement,
    generating,
    error,
  };
}

export default useSellerAgreement;
