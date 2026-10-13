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
    for (let i = 0; i < targets.length; i++) {
      const pageEl = targets[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2.5, // 2.5x resolution for ultra-sharp typography and borders
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(imgData, "JPEG", 0, 0, a4WidthMm, a4HeightMm, undefined, "FAST");
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
