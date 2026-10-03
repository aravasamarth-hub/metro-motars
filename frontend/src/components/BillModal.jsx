import React, { useEffect, useState } from "react";
import { Printer, FileDown, X, Loader2 } from "lucide-react";
import SaleAgreementBill from "./SaleAgreementBill";
import { downloadSellerAgreementPDF } from "@/hooks/useSellerAgreement";
import { useLanguage } from "@/features/i18n/LanguageContext";

export default function BillModal({ deal, isOpen, onClose }) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !deal) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setDownloadSuccess("");
    try {
      const fileName = await downloadSellerAgreementPDF(deal);
      setDownloadSuccess(fileName);
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      console.error("PDF download failed, falling back to print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const billNumber = deal.bill_number || deal.billNumber || "MM-26-0002";

  return (
    <div
      className="bill-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="bill-modal"
    >
      <div className="bill-modal-shell">
        {/* Top Control Bar (hidden in print) */}
        <div className="bill-modal-bar no-print">
          <div className="bill-modal-title">
            <span>{t("legal.strip_title", "Sale Agreement / Delivery Note")}</span>
            <span>·</span>
            <strong>{billNumber}</strong>
            {downloadSuccess && (
              <span style={{ color: "#34d399", fontSize: "12px", marginLeft: "8px" }}>
                ✓ {t("legal.saved", "Downloaded")} {downloadSuccess}
              </span>
            )}
          </div>

          <div className="bill-modal-actions">
            <button
              type="button"
              className="bill-modal-btn secondary"
              onClick={handlePrint}
              data-testid="bill-modal-print"
              title="Print A4 Delivery Note"
            >
              <Printer size={15} />
              <span>{t("bills.print", "Print")}</span>
            </button>

            <button
              type="button"
              className="bill-modal-btn primary"
              onClick={handleDownloadPDF}
              disabled={downloading}
              data-testid="bill-modal-download-pdf"
              title="Download Official PDF"
            >
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{t("legal.generating", "Generating…")}</span>
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  <span>{t("bills.save_pdf", "Save as PDF")}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="bill-modal-btn close"
              onClick={onClose}
              aria-label="Close"
              data-testid="bill-modal-close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div id="print-area" className="bill-print-area">
          <SaleAgreementBill deal={deal} />
        </div>
      </div>
    </div>
  );
}
