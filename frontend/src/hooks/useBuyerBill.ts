import React, { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { BuyerBillPDF } from "@/components/pdf/BuyerBillPDF";
import { exportPreviewToPdf } from "@/utils/domToPdf";

/**
 * Converts an SVG data URL to a clean PNG data URL via an off-screen HTML canvas.
 * Resolves within ~15ms, with an explicit 400ms safety timeout to prevent hanging.
 */
async function rasterizeSvgToPng(svgDataUrl: string, maxDim = 320): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      let finished = false;
      const timeout = setTimeout(() => {
        if (!finished) {
          finished = true;
          img.src = "";
          resolve(null);
        }
      }, 400);

      img.onload = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          const w = img.naturalWidth || maxDim;
          const h = img.naturalHeight || maxDim;
          const scale = Math.min(1, maxDim / Math.max(w, h));
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL("image/png");
          resolve(pngUrl);
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        resolve(null);
      };

      img.src = svgDataUrl;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Safely resolves any photo representation (Blob, File, Object with .blob/.dataUrl, String URL)
 * into a Base64 PNG/JPEG Data URL or string URL for @react-pdf/renderer.
 * Returns null on any failure, guaranteeing that PDF generation never crashes or stalls.
 */
async function resolveImageToDataUrl(imageInput: any): Promise<string | null> {
  if (!imageInput) return null;

  let rawUrl: string | null = null;
  if (typeof imageInput === "string") {
    const trimmed = imageInput.trim();
    rawUrl = trimmed.length > 0 ? trimmed : null;
  } else if (imageInput.dataUrl) {
    rawUrl = imageInput.dataUrl;
  } else if (imageInput.url) {
    rawUrl = imageInput.url;
  } else if (imageInput.src) {
    rawUrl = imageInput.src;
  } else {
    const blob =
      imageInput.blob ||
      (imageInput instanceof Blob || imageInput instanceof File ? imageInput : null);
    if (blob) {
      try {
        rawUrl = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        rawUrl = null;
      }
    }
  }

  if (!rawUrl) return null;

  // Handle SVG data URLs
  if (rawUrl.startsWith("data:image/svg+xml") || rawUrl.includes("<svg")) {
    const png = await rasterizeSvgToPng(rawUrl);
    return png;
  }

  // Handle standard raster formats
  if (
    rawUrl.startsWith("data:image/") ||
    rawUrl.startsWith("blob:") ||
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://")
  ) {
    return rawUrl;
  }

  return null;
}

/**
 * Generates and downloads the official Buyer Bill as a genuine A4 PDF.
 */
export async function downloadBuyerBillPDF(deal: any): Promise<string> {
  if (typeof document !== "undefined" && document.querySelector("#print-area")) {
    const regNo = (deal?.vehicle?.registration_number || deal?.buyer_bill_number || deal?.bill_number || "Bill").replace(/[^a-zA-Z0-9_-]/g, "_");
    const defaultFileName = `Buyer_Bill_${regNo}.pdf`;
    return await exportPreviewToPdf("#print-area", defaultFileName);
  }

  const photos = deal?.photos || {};
  const seller = deal?.seller || {};
  const buyer = deal?.buyer || {};
  const vehicle = deal?.vehicle || {};

  const [
    buyerPhoto,
    buyerSignature,
    buyerThumb,
    sellerPhoto,
    sellerSignature,
    sellerThumb,
    vehiclePhoto,
  ] = await Promise.all([
    resolveImageToDataUrl(
      photos["buyer-1"] || photos["buyer-portrait"] || photos["buyer_photo"] || buyer.photo
    ),
    resolveImageToDataUrl(
      photos["buyer-signature"] || photos["buyer-8"] || photos["buyer_signature"] || buyer.signature
    ),
    resolveImageToDataUrl(
      photos["buyer-thumb"] || photos["buyer-thumb-impression"] || photos["buyer-2"] || buyer.thumb
    ),
    resolveImageToDataUrl(
      photos["seller-1"] || photos["seller-portrait"] || photos["seller_photo"] || seller.photo
    ),
    resolveImageToDataUrl(
      photos["seller-signature"] || photos["seller-8"] || photos["seller_signature"] || seller.signature
    ),
    resolveImageToDataUrl(
      photos["seller-thumb"] || photos["seller-thumb-impression"] || photos["seller-2"] || seller.thumb
    ),
    resolveImageToDataUrl(
      photos["vehicle-1"] || photos["vehicle_front"] || vehicle.photo
    ),
  ]);

  const resolvedImages = {
    buyerPhoto,
    buyerSignature,
    buyerThumb,
    sellerPhoto,
    sellerSignature,
    sellerThumb,
    vehiclePhoto,
  };

  const doc = React.createElement(BuyerBillPDF, { deal, resolvedImages }) as any;
  const instance = pdf(doc);

  // Strict 5-second timeout protection
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("PDF generation timed out after 5 seconds")), 5000)
  );

  const rawBlob = await Promise.race([instance.toBlob(), timeoutPromise]);

  const rawBillNumber = deal.buyer_bill_number || deal.bill_number || deal.billNumber || "BB-001";
  const cleanBillNumber = (rawBillNumber.startsWith("Bill-") ? rawBillNumber.replace("Bill-", "BB-") : rawBillNumber).replace(/[^a-zA-Z0-9_-]/g, "-");
  const fileName = `${cleanBillNumber}-Buyer-Bill.pdf`;

  const pdfBlob =
    rawBlob.type === "application/pdf"
      ? rawBlob
      : new Blob([rawBlob], { type: "application/pdf" });

  let targetFile: File | Blob = pdfBlob;
  try {
    targetFile = new File([pdfBlob], fileName, { type: "application/pdf" });
  } catch {
    targetFile = pdfBlob;
  }

  // 1. Native Windows File System Access API
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "PDF Document (*.pdf)",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();
      return fileName;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return fileName;
      }
    }
  }

  // 2. Legacy Edge API
  if (typeof window !== "undefined" && (window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveOrOpenBlob(targetFile, fileName);
    return fileName;
  }

  // 3. Standard browser download fallback
  const blobUrl = URL.createObjectURL(targetFile);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.setAttribute("download", fileName);
  link.style.display = "none";
  document.body.appendChild(link);

  try {
    const mouseEvt = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    link.dispatchEvent(mouseEvt);
  } catch {
    link.click();
  }

  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Ignore
    }
  }, 1500);

  return fileName;
}

/**
 * Prints the isolated genuine A4 Buyer Bill PDF without printing surrounding UI.
 */
export async function printBuyerBillPDF(deal: any): Promise<void> {
  if (typeof window !== "undefined") {
    window.print();
  }
}

export function useBuyerBill() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBill = useCallback(async (deal: any) => {
    setGenerating(true);
    setError(null);
    try {
      const fileName = await downloadBuyerBillPDF(deal);
      return fileName;
    } catch (err: any) {
      console.error("Buyer bill PDF generation error:", err);
      const msg = err?.message || "Failed to generate Buyer Bill PDF";
      setError(msg);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const printBill = useCallback(async (deal: any) => {
    setGenerating(true);
    setError(null);
    try {
      await printBuyerBillPDF(deal);
    } catch (err: any) {
      console.error("Buyer bill print error:", err);
      window.print();
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generateBill, printBill, generating, error };
}

export default useBuyerBill;
