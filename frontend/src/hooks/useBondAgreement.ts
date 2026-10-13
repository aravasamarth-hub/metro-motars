import React, { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { BondAgreementPDF } from "@/components/pdf/BondAgreementPDF";
import { exportPreviewToPdf } from "@/utils/domToPdf";

/**
 * Downloads the official 7-page Bond Agreement PDF.
 */
export async function downloadBondAgreementPDF(deal: any): Promise<string> {
  const regNo = (deal?.vehicle?.reg_number || deal?.vehicle?.regNo || deal?.id || "deal")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Bond_Agreement_${regNo}.pdf`;

  if (typeof document !== "undefined" && document.querySelector("#print-area")) {
    return await exportPreviewToPdf("#print-area", fileName);
  }

  // Pre-resolve raster signatures
  const resolvedImages = {
    sellerSignature: deal.photos?.seller_signature || null,
    buyerSignature: deal.photos?.buyer_signature || null,
    witnessSignature: deal.photos?.witness_signature || null,
  };

  const docElement = React.createElement(BondAgreementPDF, {
    deal,
    resolvedImages,
  });

  const asPdf = pdf(docElement as any);
  const pdfBlob = await asPdf.toBlob();

  let targetFile: Blob = pdfBlob;
  try {
    targetFile = new File([pdfBlob], fileName, { type: "application/pdf" });
  } catch {
    targetFile = pdfBlob;
  }

  // 1. Try native File System Access API
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

  // 2. Standard browser download fallback
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
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(blobUrl);
  }, 30000);

  return fileName;
}

/**
 * Prints the isolated 7-page Bond Agreement directly via browser print dialog.
 */
export async function printBondAgreement(deal: any): Promise<void> {
  if (typeof window !== "undefined") {
    window.print();
  }
}

export function useBondAgreement() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBond = useCallback(async (deal: any) => {
    setGenerating(true);
    setError(null);
    try {
      const fileName = await downloadBondAgreementPDF(deal);
      return fileName;
    } catch (err: any) {
      console.error("Bond agreement PDF generation error:", err);
      const msg = err?.message || "Failed to generate Bond Agreement PDF";
      setError(msg);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const printBond = useCallback(async (deal: any) => {
    setGenerating(true);
    setError(null);
    try {
      await printBondAgreement(deal);
    } catch (err: any) {
      console.error("Bond agreement print error:", err);
      window.print();
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generateBond, printBond, generating, error };
}

export default useBondAgreement;
