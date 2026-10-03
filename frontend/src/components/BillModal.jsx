import React, { useEffect, useState } from "react";
import {
  Printer,
  FileDown,
  X,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Check,
  ZoomIn,
  ZoomOut,
  User,
  Bike,
  IndianRupee,
  Building2,
  Users,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import SaleAgreementBill from "./SaleAgreementBill";
import { downloadSellerAgreementPDF } from "@/hooks/useSellerAgreement";
import { dealRepository } from "@/data/dealRepository";
import { useLanguage } from "@/features/i18n/LanguageContext";

export default function BillModal({
  deal,
  isOpen,
  onClose,
  onDealUpdate = undefined,
}) {
  const { t } = useLanguage();
  const [editableDeal, setEditableDeal] = useState(null);
  const [showEditor, setShowEditor] = useState(true);
  const [activeTab, setActiveTab] = useState("seller");
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    if (isOpen && deal) {
      // Create a clean deep clone so changes are isolated to this session
      try {
        setEditableDeal(JSON.parse(JSON.stringify(deal)));
      } catch (e) {
        setEditableDeal({ ...deal });
      }
      setSaveNotice("");
      setDownloadSuccess("");
    }
  }, [isOpen, deal]);

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

  if (!isOpen || !editableDeal) return null;

  // Edit helper functions
  const updateSeller = (key, value) => {
    setEditableDeal((prev) => ({
      ...prev,
      seller: { ...(prev?.seller || {}), [key]: value },
    }));
  };

  const updateVehicle = (key, value) => {
    setEditableDeal((prev) => ({
      ...prev,
      vehicle: { ...(prev?.vehicle || {}), [key]: value },
    }));
  };

  const updatePayments = (key, value) => {
    setEditableDeal((prev) => ({
      ...prev,
      payments: { ...(prev?.payments || {}), [key]: value },
    }));
  };

  const updateBuyer = (key, value) => {
    setEditableDeal((prev) => ({
      ...prev,
      buyerName: key === "name" ? value : prev?.buyerName,
      buyer: { ...(prev?.buyer || {}), [key]: value },
    }));
  };

  const updateWitness1 = (key, value) => {
    setEditableDeal((prev) => {
      const witnesses = [...(prev?.witnesses || [{}, {}])];
      witnesses[0] = { ...(witnesses[0] || {}), [key]: value };
      return {
        ...prev,
        witnesses,
        witness1: { ...(prev?.witness1 || {}), [key]: value },
      };
    });
  };

  const updateGeneral = (key, value) => {
    setEditableDeal((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const autoCalculateBalance = () => {
    const p = editableDeal?.payments || {};
    const price = Number(p.purchase_price ?? p.selling_price ?? 0);
    const advance = Number(p.paid_to_seller ?? p.received_from_buyer ?? 0);
    const bal = Math.max(0, price - advance);
    updatePayments("balanceAmount", bal);
  };

  const handleReset = () => {
    if (deal) {
      try {
        setEditableDeal(JSON.parse(JSON.stringify(deal)));
      } catch (e) {
        setEditableDeal({ ...deal });
      }
      setSaveNotice("Reset to deal data");
      setTimeout(() => setSaveNotice(""), 3000);
    }
  };

  const handleSaveToDeal = async () => {
    setSaving(true);
    setSaveNotice("");
    try {
      if (editableDeal.id) {
        const saved = await dealRepository.save(editableDeal);
        if (onDealUpdate) onDealUpdate(saved);
        setSaveNotice("Saved to deal ✓");
      } else {
        if (onDealUpdate) onDealUpdate(editableDeal);
        setSaveNotice("Edits applied ✓");
      }
      setTimeout(() => setSaveNotice(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveNotice("Save failed");
      setTimeout(() => setSaveNotice(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setDownloadSuccess("");
    try {
      const fileName = await downloadSellerAgreementPDF(editableDeal);
      setDownloadSuccess(fileName);
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      console.error("PDF download failed, falling back to print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const billNumber =
    editableDeal.bill_number || editableDeal.billNumber || "MM-26-0002";

  const seller = editableDeal.seller || {};
  const vehicle = editableDeal.vehicle || {};
  const payments = editableDeal.payments || {};
  const buyer = editableDeal.buyer || {};
  const witness1 =
    editableDeal.witness1 || (editableDeal.witnesses && editableDeal.witnesses[0]) || {};

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
      <div
        className={`bill-modal-shell ${showEditor ? "with-editor" : "preview-only"}`}
      >
        {/* Top Control Bar (hidden in print) */}
        <div className="bill-modal-bar no-print">
          <div className="bill-modal-title">
            <span className="bill-modal-badge">
              {t("legal.strip_title", "Sale Agreement & Delivery Note")}
            </span>
            <span className="bill-modal-separator">·</span>
            <strong className="bill-modal-number">{billNumber}</strong>

            {saveNotice && (
              <span className="bill-modal-notice success">
                <Check size={13} /> {saveNotice}
              </span>
            )}

            {downloadSuccess && (
              <span className="bill-modal-notice download">
                ✓ {t("legal.saved", "Downloaded")} {downloadSuccess}
              </span>
            )}
          </div>

          <div className="bill-modal-actions">
            {/* Toggle Editor Panel */}
            <button
              type="button"
              className={`bill-modal-btn ${showEditor ? "active-toggle" : "secondary"}`}
              onClick={() => setShowEditor(!showEditor)}
              title={showEditor ? "Hide Edit Panel" : "Edit Bill Details"}
              data-testid="bill-modal-toggle-editor"
            >
              <Pencil size={14} />
              <span>{showEditor ? t("common.hide_edit", "Hide Editor") : t("common.edit_fields", "Edit Fields")}</span>
            </button>

            {/* Reset to Original Deal */}
            <button
              type="button"
              className="bill-modal-btn secondary"
              onClick={handleReset}
              title="Reset all fields to original deal values"
              data-testid="bill-modal-reset"
            >
              <RotateCcw size={14} />
              <span>{t("common.reset", "Reset")}</span>
            </button>

            {/* Save to Deal Record */}
            <button
              type="button"
              className="bill-modal-btn secondary save-btn"
              onClick={handleSaveToDeal}
              disabled={saving}
              title="Save changes to deal storage"
              data-testid="bill-modal-save-deal"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>{t("common.save", "Save to Deal")}</span>
            </button>

            {/* Print A4 Document */}
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

            {/* Download Official PDF */}
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

            {/* Close Modal */}
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

        {/* Modal Main Content Layout: Split Editor on Left, Live Preview on Right */}
        <div className="bill-modal-body">
          {/* ===================== EDIT DRAWER / SIDEBAR ===================== */}
          {showEditor && (
            <aside className="bill-editor-pane no-print" data-testid="bill-editor-pane">
              <div className="bill-editor-header">
                <div className="bill-editor-title">
                  <SlidersHorizontal size={15} className="text-gold" />
                  <span>{t("common.edit_bill_details", "Edit Bill Details")}</span>
                </div>
                <span className="bill-editor-hint">
                  {t("common.live_sync_hint", "Updates live on bill")}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="bill-editor-tabs" role="tablist">
                <button
                  type="button"
                  className={`bill-tab-btn ${activeTab === "seller" ? "active" : ""}`}
                  onClick={() => setActiveTab("seller")}
                  title="Seller details"
                >
                  <User size={13} />
                  <span>Seller</span>
                </button>
                <button
                  type="button"
                  className={`bill-tab-btn ${activeTab === "vehicle" ? "active" : ""}`}
                  onClick={() => setActiveTab("vehicle")}
                  title="Vehicle details"
                >
                  <Bike size={13} />
                  <span>Vehicle</span>
                </button>
                <button
                  type="button"
                  className={`bill-tab-btn ${activeTab === "financials" ? "active" : ""}`}
                  onClick={() => setActiveTab("financials")}
                  title="Price & Financials"
                >
                  <IndianRupee size={13} />
                  <span>Financials</span>
                </button>
                <button
                  type="button"
                  className={`bill-tab-btn ${activeTab === "buyer" ? "active" : ""}`}
                  onClick={() => setActiveTab("buyer")}
                  title="Purchaser / Buyer"
                >
                  <Building2 size={13} />
                  <span>Purchaser</span>
                </button>
                <button
                  type="button"
                  className={`bill-tab-btn ${activeTab === "witness" ? "active" : ""}`}
                  onClick={() => setActiveTab("witness")}
                  title="Witness details"
                >
                  <Users size={13} />
                  <span>Witness</span>
                </button>
                <button
                  type="button"
                  className={`bill-tab-btn ${activeTab === "general" ? "active" : ""}`}
                  onClick={() => setActiveTab("general")}
                  title="Date, Time & Place"
                >
                  <Calendar size={13} />
                  <span>General</span>
                </button>
              </div>

              {/* Form Content by Active Tab */}
              <div className="bill-editor-fields">
                {/* 1. SELLER TAB */}
                {activeTab === "seller" && (
                  <div className="bill-form-section">
                    <div className="bill-field-group">
                      <label>Seller Full Name</label>
                      <input
                        type="text"
                        value={seller.name || ""}
                        onChange={(e) => updateSeller("name", e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        data-testid="edit-seller-name"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Mobile / Cell Number</label>
                      <input
                        type="text"
                        value={seller.phone || seller.mobile || ""}
                        onChange={(e) => updateSeller("phone", e.target.value)}
                        placeholder="e.g. 9448123456"
                        data-testid="edit-seller-phone"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Aadhaar / ID Number</label>
                      <input
                        type="text"
                        value={seller.id_number || seller.aadhaar || ""}
                        onChange={(e) => updateSeller("id_number", e.target.value)}
                        placeholder="e.g. 1234 5678 9012"
                        data-testid="edit-seller-aadhaar"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Full Address (Auto-split across lines)</label>
                      <textarea
                        rows={2}
                        value={seller.address || ""}
                        onChange={(e) => {
                          updateSeller("address", e.target.value);
                          // Clear explicit line overrides so auto-split updates
                          updateSeller("address1", undefined);
                          updateSeller("address2", undefined);
                          updateSeller("address3", undefined);
                        }}
                        placeholder="e.g. #12, 2nd Cross, Vinayaka Nagar, Davangere"
                        data-testid="edit-seller-address"
                      />
                    </div>

                    <div className="bill-sub-header">
                      <span>Exact Line Placement on Dotted Lines:</span>
                    </div>

                    <div className="bill-field-group">
                      <label>Address Line 1 (Right of 'Residing at :')</label>
                      <input
                        type="text"
                        value={seller.address1 !== undefined ? seller.address1 : ""}
                        onChange={(e) => updateSeller("address1", e.target.value)}
                        placeholder="Line 1 override (leave blank for auto-split)"
                      />
                    </div>
                    <div className="bill-field-group">
                      <label>Address Line 2 (Second dotted line)</label>
                      <input
                        type="text"
                        value={seller.address2 !== undefined ? seller.address2 : ""}
                        onChange={(e) => updateSeller("address2", e.target.value)}
                        placeholder="Line 2 override"
                      />
                    </div>
                    <div className="bill-field-group">
                      <label>Address Line 3 (Third dotted line)</label>
                      <input
                        type="text"
                        value={seller.address3 !== undefined ? seller.address3 : ""}
                        onChange={(e) => updateSeller("address3", e.target.value)}
                        placeholder="Line 3 override"
                      />
                    </div>
                  </div>
                )}

                {/* 2. VEHICLE TAB */}
                {activeTab === "vehicle" && (
                  <div className="bill-form-section">
                    <div className="bill-field-group">
                      <label>Vehicle Make & Model</label>
                      <input
                        type="text"
                        value={
                          vehicle.model ||
                          vehicle.variant ||
                          vehicle.vehicle_name ||
                          ""
                        }
                        onChange={(e) => {
                          updateVehicle("model", e.target.value);
                          updateVehicle("vehicle_name", e.target.value);
                        }}
                        placeholder="e.g. Royal Enfield Hunter 350 / Activa 6G"
                        data-testid="edit-vehicle-model"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Vehicle Number (Registration Plate)</label>
                      <input
                        type="text"
                        value={
                          vehicle.vehicle_number ||
                          vehicle.registration_number ||
                          ""
                        }
                        onChange={(e) => {
                          updateVehicle("vehicle_number", e.target.value);
                          updateVehicle("registration_number", e.target.value);
                        }}
                        placeholder="e.g. KA-17-EX-2456"
                        data-testid="edit-vehicle-number"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Engine Number</label>
                      <input
                        type="text"
                        value={vehicle.engine_number || vehicle.engineNumber || ""}
                        onChange={(e) => updateVehicle("engine_number", e.target.value)}
                        placeholder="e.g. JF42E-1234567"
                        data-testid="edit-engine-number"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Chassis Number</label>
                      <input
                        type="text"
                        value={vehicle.chassis_number || vehicle.chassisNumber || ""}
                        onChange={(e) => updateVehicle("chassis_number", e.target.value)}
                        placeholder="e.g. ME4JF4214P1234567"
                        data-testid="edit-chassis-number"
                      />
                    </div>
                  </div>
                )}

                {/* 3. FINANCIALS TAB */}
                {activeTab === "financials" && (
                  <div className="bill-form-section">
                    <div className="bill-field-group">
                      <label>Agreed Total Sale Amount (₹)</label>
                      <input
                        type="number"
                        value={
                          payments.purchase_price ?? payments.selling_price ?? ""
                        }
                        onChange={(e) => {
                          updatePayments("purchase_price", e.target.value);
                          updatePayments("selling_price", e.target.value);
                        }}
                        placeholder="e.g. 65000"
                        data-testid="edit-sale-price"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Advance Paid Amount (₹)</label>
                      <input
                        type="number"
                        value={
                          payments.paid_to_seller ?? payments.advancePaid ?? ""
                        }
                        onChange={(e) => {
                          updatePayments("paid_to_seller", e.target.value);
                          updatePayments("advancePaid", e.target.value);
                        }}
                        placeholder="e.g. 25000"
                        data-testid="edit-advance-price"
                      />
                    </div>

                    <div className="bill-field-group">
                      <div className="label-with-action">
                        <label>Balance Amount (₹)</label>
                        <button
                          type="button"
                          className="text-btn"
                          onClick={autoCalculateBalance}
                          title="Auto calculate (Price - Advance)"
                        >
                          <Sparkles size={11} /> Auto-Calc
                        </button>
                      </div>
                      <input
                        type="number"
                        value={payments.balanceAmount !== undefined ? payments.balanceAmount : ""}
                        onChange={(e) => updatePayments("balanceAmount", e.target.value)}
                        placeholder="Leave blank for auto-calculation"
                        data-testid="edit-balance-price"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>T. O. And Insurance (₹)</label>
                      <input
                        type="text"
                        value={
                          payments.toAndInsurance !== undefined
                            ? payments.toAndInsurance
                            : editableDeal.toAndInsurance !== undefined
                            ? editableDeal.toAndInsurance
                            : "5000"
                        }
                        onChange={(e) => {
                          updatePayments("toAndInsurance", e.target.value);
                          updateGeneral("toAndInsurance", e.target.value);
                        }}
                        placeholder="e.g. 5000"
                      />
                    </div>

                    <div className="bill-sub-header">
                      <span>Vehicle Document Checkmarks:</span>
                    </div>

                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editableDeal.insurance !== undefined ? !!editableDeal.insurance : true}
                          onChange={(e) => updateGeneral("insurance", e.target.checked)}
                        />
                        <span>Insurance</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editableDeal.fc !== undefined ? !!editableDeal.fc : true}
                          onChange={(e) => updateGeneral("fc", e.target.checked)}
                        />
                        <span>F. C.</span>
                      </label>
                    </div>

                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editableDeal.tax !== undefined ? !!editableDeal.tax : true}
                          onChange={(e) => updateGeneral("tax", e.target.checked)}
                        />
                        <span>Tax</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editableDeal.cc !== undefined ? !!editableDeal.cc : true}
                          onChange={(e) => updateGeneral("cc", e.target.checked)}
                        />
                        <span>C. C.</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. BUYER TAB */}
                {activeTab === "buyer" && (
                  <div className="bill-form-section">
                    <div className="bill-field-group">
                      <label>Purchaser Name</label>
                      <input
                        type="text"
                        value={editableDeal.buyerName || buyer.name || "METRO MOTORS"}
                        onChange={(e) => updateBuyer("name", e.target.value)}
                        placeholder="METRO MOTORS"
                        data-testid="edit-buyer-name"
                      />
                      <small className="helper-text">
                        Default is METRO MOTORS (pre-printed showroom purchase).
                      </small>
                    </div>

                    <div className="bill-field-group">
                      <label>Purchaser Phone</label>
                      <input
                        type="text"
                        value={buyer.phone || buyer.mobile || ""}
                        onChange={(e) => updateBuyer("phone", e.target.value)}
                        placeholder="Optional contact"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Purchaser Aadhaar / ID</label>
                      <input
                        type="text"
                        value={buyer.id_number || buyer.aadhaar || ""}
                        onChange={(e) => updateBuyer("id_number", e.target.value)}
                        placeholder="Optional Aadhaar"
                      />
                    </div>
                  </div>
                )}

                {/* 5. WITNESS TAB */}
                {activeTab === "witness" && (
                  <div className="bill-form-section">
                    <div className="bill-field-group">
                      <label>Witness Name</label>
                      <input
                        type="text"
                        value={witness1.name || ""}
                        onChange={(e) => updateWitness1("name", e.target.value)}
                        placeholder="e.g. Suresh Kumar"
                        data-testid="edit-witness-name"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Witness Cell / Phone</label>
                      <input
                        type="text"
                        value={witness1.phone || witness1.mobile || ""}
                        onChange={(e) => updateWitness1("phone", e.target.value)}
                        placeholder="e.g. 9987654321"
                        data-testid="edit-witness-phone"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Witness Aadhaar / ID</label>
                      <input
                        type="text"
                        value={witness1.id_number || witness1.aadhaar || ""}
                        onChange={(e) => updateWitness1("id_number", e.target.value)}
                        placeholder="e.g. 9876 5432 1098"
                        data-testid="edit-witness-aadhaar"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Witness Full Address</label>
                      <textarea
                        rows={2}
                        value={witness1.address || ""}
                        onChange={(e) => {
                          updateWitness1("address", e.target.value);
                          updateWitness1("address1", undefined);
                          updateWitness1("address2", undefined);
                          updateWitness1("address3", undefined);
                        }}
                        placeholder="e.g. #5, Temple Road, Bapuji Nagar, Davangere"
                        data-testid="edit-witness-address"
                      />
                    </div>

                    <div className="bill-sub-header">
                      <span>Exact Line Placement on Dotted Lines:</span>
                    </div>

                    <div className="bill-field-group">
                      <label>Address Line 1 (Right of 'Address :')</label>
                      <input
                        type="text"
                        value={witness1.address1 !== undefined ? witness1.address1 : ""}
                        onChange={(e) => updateWitness1("address1", e.target.value)}
                        placeholder="Line 1 override"
                      />
                    </div>
                    <div className="bill-field-group">
                      <label>Address Line 2 (Second line)</label>
                      <input
                        type="text"
                        value={witness1.address2 !== undefined ? witness1.address2 : ""}
                        onChange={(e) => updateWitness1("address2", e.target.value)}
                        placeholder="Line 2 override"
                      />
                    </div>
                    <div className="bill-field-group">
                      <label>Address Line 3 (Third line)</label>
                      <input
                        type="text"
                        value={witness1.address3 !== undefined ? witness1.address3 : ""}
                        onChange={(e) => updateWitness1("address3", e.target.value)}
                        placeholder="Line 3 override"
                      />
                    </div>
                  </div>
                )}

                {/* 6. GENERAL TAB */}
                {activeTab === "general" && (
                  <div className="bill-form-section">
                    <div className="bill-field-group">
                      <label>Bill Number (Sl. No.)</label>
                      <input
                        type="text"
                        value={editableDeal.bill_number || editableDeal.billNumber || ""}
                        onChange={(e) => {
                          updateGeneral("bill_number", e.target.value);
                          updateGeneral("billNumber", e.target.value);
                        }}
                        placeholder="e.g. MM-26-0002"
                        data-testid="edit-bill-number"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Place</label>
                      <input
                        type="text"
                        value={editableDeal.place || seller.city || "Davangere"}
                        onChange={(e) => updateGeneral("place", e.target.value)}
                        placeholder="Davangere"
                        data-testid="edit-bill-place"
                      />
                    </div>

                    <div className="bill-field-group">
                      <label>Delivery / Agreement Date</label>
                      <input
                        type="date"
                        value={
                          (editableDeal.deliveryDate || editableDeal.payments?.payment_date || editableDeal.created_at || "")
                            .split("T")[0]
                        }
                        onChange={(e) => {
                          updateGeneral("deliveryDate", e.target.value);
                          updateGeneral("deliveryDay", undefined);
                          updateGeneral("deliveryMonth", undefined);
                          updateGeneral("deliveryYear", undefined);
                        }}
                        data-testid="edit-bill-date"
                      />
                    </div>

                    <div className="bill-sub-header">
                      <span>Or specify exact Day, Month, Year slots:</span>
                    </div>

                    <div className="three-cols">
                      <div className="bill-field-group">
                        <label>Day (DD)</label>
                        <input
                          type="text"
                          value={editableDeal.deliveryDay || ""}
                          onChange={(e) => updateGeneral("deliveryDay", e.target.value)}
                          placeholder="e.g. 15"
                        />
                      </div>
                      <div className="bill-field-group">
                        <label>Month (MM)</label>
                        <input
                          type="text"
                          value={editableDeal.deliveryMonth || ""}
                          onChange={(e) => updateGeneral("deliveryMonth", e.target.value)}
                          placeholder="e.g. 02"
                        />
                      </div>
                      <div className="bill-field-group">
                        <label>Year (YYYY)</label>
                        <input
                          type="text"
                          value={editableDeal.deliveryYear || ""}
                          onChange={(e) => updateGeneral("deliveryYear", e.target.value)}
                          placeholder="e.g. 2026"
                        />
                      </div>
                    </div>

                    <div className="bill-field-group">
                      <label>Delivery Time</label>
                      <input
                        type="text"
                        value={editableDeal.deliveryTime || editableDeal.delivery_time || "11:30 AM"}
                        onChange={(e) => updateGeneral("deliveryTime", e.target.value)}
                        placeholder="e.g. 11:30 AM"
                        data-testid="edit-bill-time"
                      />
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* ===================== LIVE PRINTABLE BILL PREVIEW ===================== */}
          <main className="bill-preview-pane">
            {/* Zoom & Inspection Controls */}
            <div className="bill-preview-toolbar no-print">
              <span className="preview-tip">
                <Eye size={13} /> Live Preview: edits update immediately
              </span>

              <div className="zoom-controls">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  className="zoom-fit-btn"
                  onClick={() => setZoom(1)}
                  title="Reset Zoom to 100%"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Printable Bill Container */}
            <div
              id="print-area"
              className="bill-print-area"
              style={{
                transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                transformOrigin: "top center",
              }}
            >
              <SaleAgreementBill deal={editableDeal} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
