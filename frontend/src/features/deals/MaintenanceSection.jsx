import React, { useState, useMemo } from "react";
import {
  Wrench,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Droplets,
  Battery,
  Disc,
  Gauge,
  Flame,
  ShieldCheck,
  Clock,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import {
  DEFAULT_MAINTENANCE_SERVICES,
  calculateMaintenanceTotal,
  money,
} from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const MaintenanceSection = ({ deal, updateSection, readOnly = false }) => {
  const { t } = useLanguage();

  // Safely extract maintenance data
  const maintenance = deal?.maintenance || {
    services: DEFAULT_MAINTENANCE_SERVICES,
    total_expense: "0",
    notes: "",
  };

  const services = useMemo(() => {
    if (Array.isArray(maintenance.services) && maintenance.services.length > 0) {
      return maintenance.services;
    }
    return DEFAULT_MAINTENANCE_SERVICES;
  }, [maintenance.services]);

  // Total expense dynamically calculated
  const totalExpense = useMemo(() => {
    return services
      .filter((s) => s.enabled)
      .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [services]);

  const selectedCount = services.filter((s) => s.enabled).length;

  // State for inline "Add Custom Service"
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Helper to update services array and total_expense together
  const updateServices = (newServices) => {
    const newTotal = newServices
      .filter((s) => s.enabled)
      .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    updateSection("maintenance", {
      ...(deal?.maintenance || {}),
      services: newServices,
      total_expense: String(newTotal),
    });
  };

  // Toggle single service
  const handleToggle = (id) => {
    if (readOnly) return;
    const next = services.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateServices(next);
  };

  // Update single service price
  const handlePriceChange = (id, newPrice) => {
    if (readOnly) return;
    const next = services.map((s) =>
      s.id === id ? { ...s, price: newPrice } : s
    );
    updateServices(next);
  };

  // Delete custom service
  const handleDeleteService = (id) => {
    if (readOnly) return;
    const next = services.filter((s) => s.id !== id);
    updateServices(next);
  };

  // Add new custom service
  const handleAddCustom = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!customName.trim()) return;

    const newService = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      price: customPrice ? String(Number(customPrice)) : "0",
      enabled: true,
      isCustom: true,
    };

    updateServices([...services, newService]);
    setCustomName("");
    setCustomPrice("");
    setShowAddForm(false);
  };

  // Select all / clear all
  const handleSelectAll = () => {
    const next = services.map((s) => ({ ...s, enabled: true }));
    updateServices(next);
  };

  const handleClearAll = () => {
    const next = services.map((s) => ({ ...s, enabled: false }));
    updateServices(next);
  };

  // If readOnly mode (e.g. in DealView summary)
  if (readOnly) {
    const activeServices = services.filter((s) => s.enabled);
    if (!activeServices.length && Number(totalExpense) === 0) {
      return (
        <section className="wizard-group" data-testid="deal-view-maintenance-empty">
          <div className="section-title">
            <h2>Mechanical Maintenance Cost</h2>
          </div>
          <p className="local-notes" style={{ color: "var(--local-muted)" }}>
            No mechanical refurbishment expenses recorded for this deal.
          </p>
        </section>
      );
    }

    return (
      <section className="wizard-group" data-testid="deal-view-maintenance">
        <div className="section-title">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Wrench size={18} className="text-amber-400" />
            <h2>Mechanical Maintenance & Refurbishment Cost</h2>
          </div>
          <div className="maintenance-total-pill">
            <span>Total Expense:</span>
            <strong>{money(totalExpense)}</strong>
          </div>
        </div>

        <div className="maintenance-readonly-grid">
          {activeServices.map((s, idx) => (
            <div key={s.id || idx} className="maintenance-readonly-item">
              <div className="maintenance-item-title-wrap">
                <CheckCircle2 size={15} color="#4ade80" />
                <span>{s.name}</span>
              </div>
              <strong className="maintenance-readonly-price">{money(s.price)}</strong>
            </div>
          ))}
        </div>

        {maintenance.notes && (
          <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--local-muted)" }}>
            <b>Workshop Notes:</b> {maintenance.notes}
          </div>
        )}
      </section>
    );
  }

  // Interactive Form Mode (inside Deal Wizard / PaymentStep)
  return (
    <div className="maintenance-section-card" data-testid="maintenance-section-card">
      {/* Header */}
      <div className="maintenance-card-header">
        <div className="maintenance-header-left">
          <div className="maintenance-icon-bubble">
            <Wrench size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 className="maintenance-card-title">
                Mechanical Maintenance Cost
              </h3>
              <span className="maintenance-count-pill">
                {selectedCount} of {services.length} selected
              </span>
            </div>
            <p className="maintenance-card-subtitle">
              Pre-sale refurbishment, servicing, fluids, brakes, battery, and replacement expenses.
            </p>
          </div>
        </div>

        {/* Live Total Expense Pill */}
        <div className="maintenance-total-badge" data-testid="maintenance-total-expense">
          <span className="maintenance-total-label">Total Expense</span>
          <strong className="maintenance-total-val">{money(totalExpense)}</strong>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="maintenance-toolbar no-print">
        <div className="maintenance-toolbar-left">
          <button
            type="button"
            className="maintenance-mini-btn"
            onClick={handleSelectAll}
            data-testid="maintenance-select-all"
          >
            Select All
          </button>
          <button
            type="button"
            className="maintenance-mini-btn"
            onClick={handleClearAll}
            data-testid="maintenance-clear-all"
          >
            Clear All
          </button>
        </div>

        <button
          type="button"
          className="maintenance-add-custom-trigger"
          onClick={() => setShowAddForm(!showAddForm)}
          data-testid="maintenance-add-service-btn"
        >
          <Plus size={14} />
          <span>Add Custom Service</span>
        </button>
      </div>

      {/* Add Custom Service Inline Form */}
      {showAddForm && (
        <div className="maintenance-inline-add-form" data-testid="maintenance-custom-form">
          <div className="maintenance-add-fields">
            <div style={{ flex: 2 }}>
              <label className="maintenance-field-label">Service Type / Work Details *</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                placeholder="e.g. Engine Decarbonization, Chain Adjustment, Polish..."
                className="maintenance-input"
                autoFocus
                data-testid="custom-service-name-input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="maintenance-field-label">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                placeholder="0.00"
                className="maintenance-input"
                data-testid="custom-service-price-input"
              />
            </div>
          </div>
          <div className="maintenance-add-actions">
            <button
              type="button"
              className="button button-secondary maintenance-cancel-btn"
              onClick={() => {
                setShowAddForm(false);
                setCustomName("");
                setCustomPrice("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary maintenance-confirm-btn"
              onClick={handleAddCustom}
              data-testid="confirm-add-custom-service"
            >
              <Plus size={14} /> Add to Services
            </button>
          </div>
        </div>
      )}

      {/* Service Items Grid / List */}
      <div className="maintenance-services-grid" data-testid="maintenance-services-list">
        {services.map((item, idx) => {
          const isChecked = Boolean(item.enabled);

          return (
            <div
              key={item.id || idx}
              className={`maintenance-item-row ${isChecked ? "is-selected" : ""}`}
              data-testid={`maintenance-item-${item.id}`}
            >
              {/* Checkbox */}
              <button
                type="button"
                className={`maintenance-checkbox-box ${isChecked ? "checked" : ""}`}
                onClick={() => handleToggle(item.id)}
                title={isChecked ? "Deselect service" : "Select service"}
                data-testid={`checkbox-${item.id}`}
              >
                {isChecked ? <Check size={14} strokeWidth={3} /> : null}
              </button>

              {/* Service Type Name */}
              <div
                className="maintenance-item-name-block"
                onClick={() => handleToggle(item.id)}
                style={{ cursor: "pointer" }}
              >
                <span className="maintenance-item-idx">{(idx + 1).toString().padStart(2, "0")}</span>
                <span className={`maintenance-item-name ${isChecked ? "active-text" : ""}`}>
                  {item.name}
                </span>
                {item.isCustom && <span className="maintenance-custom-tag">CUSTOM</span>}
              </div>

              {/* Price Input */}
              <div className="maintenance-price-input-wrap">
                <span className="maintenance-currency-symbol">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  placeholder="0"
                  className="maintenance-price-input"
                  title="Service cost (₹)"
                  data-testid={`price-input-${item.id}`}
                />
              </div>

              {/* Remove Action (for custom services or any service) */}
              {item.isCustom ? (
                <button
                  type="button"
                  className="maintenance-item-delete-btn"
                  onClick={() => handleDeleteService(item.id)}
                  title="Delete this service"
                  data-testid={`delete-service-${item.id}`}
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <div style={{ width: "24px" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Notes / Invoice Remarks */}
      <div className="maintenance-notes-container">
        <label className="maintenance-field-label">Workshop / Refurbishment Remarks (Optional)</label>
        <textarea
          rows={2}
          value={maintenance.notes || ""}
          onChange={(e) =>
            updateSection("maintenance", {
              ...maintenance,
              notes: e.target.value,
            })
          }
          placeholder="Mechanic name, workshop invoice number, warranty parts replaced, or specific repair observations..."
          className="maintenance-textarea"
          data-testid="maintenance-notes-input"
        />
      </div>

      {/* Financial Summary Strip */}
      <div className="maintenance-summary-strip">
        <div className="maintenance-summary-left">
          <span>Refurbishment Investment:</span>
          <small>{selectedCount} mechanical services recorded</small>
        </div>
        <div className="maintenance-summary-right">
          <span className="label">Total Expense:</span>
          <strong className="value">{money(totalExpense)}</strong>
        </div>
      </div>
    </div>
  );
};
