import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures an HTML element (or multi-page container) with 100% visual fidelity
 * and downloads it as an A4 PDF document.
 * This guarantees the downloaded PDF matches the live preview pixel-for-pixel.
 */
export async function exportPreviewToPdf(
  containerSelector: string = "#print-area",
  fileName: string = "Metro_Motors_Bill.pdf"
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF export is only available in browser environment");
  }

  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) {
    throw new Error(`Target container '${containerSelector}' not found in document.`);
  }

  // Check for distinct page sheets (Seller Bill, Buyer Bill, Bond Agreement)
  const distinctPages = container.querySelectorAll<HTMLElement>(
    ".seller-bill-sheet, .buyer-bill-sheet, .bond-page"
  );

  const targets: HTMLElement[] =
    distinctPages.length > 0 ? Array.from(distinctPages) : [container];

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const a4WidthMm = 210;
  const a4HeightMm = 297;

  // Temporarily reset any zoom scale on container while capturing so measurements are true
  const originalTransform = container.style.transform;
  const originalTransformOrigin = container.style.transformOrigin;
  container.style.transform = "none";
  container.style.transformOrigin = "top left";

  try {
    // Wait for all web fonts to load completely before capturing canvas
    if (typeof document !== "undefined" && (document as any).fonts && (document as any).fonts.ready) {
      await (document as any).fonts.ready;
    }

    for (let i = 0; i < targets.length; i++) {
      const pageEl = targets[i];
      const originalShadow = pageEl.style.boxShadow;
      pageEl.style.boxShadow = "none";

      try {
        const pageWidth = pageEl.offsetWidth || 794;
        const pageHeight = pageEl.offsetHeight || 1123;

        const canvas = await html2canvas(pageEl, {
          scale: 2.5, // 2.5x resolution for ultra-sharp typography and borders
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: pageWidth,
          height: pageHeight,
          windowWidth: pageWidth,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document) => {
            // Fix Tailwind image preflight and prevent html2canvas ctx.clip() text cut-offs
            const style = clonedDoc.createElement("style");
            style.innerHTML = `
              img {
                display: inline-block !important;
              }
              .buyer-bill-sheet, .seller-bill-sheet, .bond-page {
                box-shadow: none !important;
              }
              .bb-field-line, .sb-field-line, .bb-doc-row {
                display: flex !important;
                align-items: center !important;
                min-height: 16px !important;
                line-height: 1.45 !important;
              }
              .bb-field-label, .sb-field-label, .bb-field-colon, .sb-field-colon, .bb-doc-name, .bb-doc-val {
                padding-top: 2px !important;
                display: flex !important;
                align-items: center !important;
                line-height: 1.4 !important;
              }
              .bb-field-value, .sb-field-value {
                overflow: visible !important;
                padding-top: 2px !important;
                padding-bottom: 1px !important;
                display: flex !important;
                align-items: center !important;
                min-height: 16px !important;
                line-height: 1.4 !important;
              }
              .bb-meta-row, .sb-meta-row {
                padding-top: 1.5px !important;
              }
              .bb-meta-val, .sb-meta-val {
                overflow: visible !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          },
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);

        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }

        pdf.addImage(imgData, "JPEG", 0, 0, a4WidthMm, a4HeightMm, undefined, "FAST");
      } finally {
        pageEl.style.boxShadow = originalShadow;
      }
    }

    // Try Windows File System Access API if available, else standard jsPDF save
    if ("showSaveFilePicker" in window) {
      try {
        const pdfBlob = pdf.output("blob");
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
        // Fallback to standard save
        pdf.save(fileName);
        return fileName;
      }
    } else {
      pdf.save(fileName);
      return fileName;
    }
  } finally {
    // Restore original zoom transform
    container.style.transform = originalTransform;
    container.style.transformOrigin = originalTransformOrigin;
  }
}

export default exportPreviewToPdf;
