import { useEffect, useRef, useState } from "react";
import { Bike, Camera, Check, Clock, Download, Eye, Plus, Replace, Trash2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { photoSlots } from "./fieldConfig";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { PartyIdentityRow } from "./PartyIdentityRow";
import { downloadPhoto } from "@/utils/photoDownload";

const slotKeyMap = {
  "Front view": "slot.front_view",
  "Rear view": "slot.rear_view",
  "Left side": "slot.left_side",
  "Right side": "slot.right_side",
  "Odometer": "slot.odometer",
  "Engine number": "slot.engine_number",
  "Chassis number": "slot.chassis_number",
  "RC front": "slot.rc_front",
  "RC back": "slot.rc_back",
  "Insurance document": "slot.insurance_document",
  "Seller portrait": "slot.seller_portrait",
  "Buyer portrait": "slot.buyer_portrait",
  "Aadhaar front": "slot.aadhaar_front",
  "Aadhaar back": "slot.aadhaar_back",
  "PAN card": "slot.pan_card",
  "Driving licence front": "slot.dl_front",
  "Driving licence back": "slot.dl_back",
  "Address proof": "slot.address_proof",
  "Signature": "slot.signature",
  "Purchase agreement": "slot.purchase_agreement",
  "Sale agreement": "slot.sale_agreement",
  "Additional document": "slot.additional_document",
  "Seller witness photo": "slot.seller_witness_photo",
  "Buyer witness photo": "slot.buyer_witness_photo",
};

export const PhotoPreview = ({ photo, alt, ...props }) => {
  const [url, setUrl] = useState(photo?.url || "");
  useEffect(() => {
    if (!photo?.blob) { setUrl(photo?.url || ""); return; }
    const objectUrl = URL.createObjectURL(photo.blob); setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);
  return url ? <img src={url} alt={alt} {...props}/> : null;
};

const PhotoSlot = ({ id, label, photo, onChange, readOnly, onDeleteExtra = null }) => {
  const { t } = useLanguage();
  const fileInput   = useRef(null);
  const cameraInput = useRef(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  const displayLabel = slotKeyMap[label] ? t(slotKeyMap[label], label) : label;

  const choose = async event => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Choose a JPG, PNG or WebP photo.");
    if (file.size > 10 * 1024 * 1024) return setError("Photo must be 10 MB or smaller.");
    setBusy(true);
    try { const bitmap = await createImageBitmap(file); bitmap.close(); onChange(id, { name: file.name, type: file.type, size: file.size, blob: file }); }
    catch { setError("This image cannot be opened. Choose another photo."); }
    finally { setBusy(false); }
  };

  return (
    <div className={`photo-slot ${photo ? "has-photo" : ""}`} data-testid={`photo-slot-${id}`}>
      {photo ? (
        <button
          type="button"
          className="photo-slot-main has-photo"
          onClick={() => setPreview(true)}
          data-testid={`photo-open-${id}`}
          aria-label={`View ${displayLabel}`}
        >
          <PhotoPreview photo={photo} alt={displayLabel} data-testid={`photo-preview-${id}`}/>
          <span className="photo-zoom"><Eye size={15}/></span>
        </button>
      ) : (
        <div className="photo-slot-empty" data-testid={`photo-empty-${id}`}>
          <button
            type="button"
            className="slot-action-btn slot-take-btn"
            onClick={() => cameraInput.current?.click()}
            disabled={busy || readOnly}
            data-testid={`photo-take-${id}`}
            aria-label={`Take photo for ${displayLabel}`}
          >
            <Camera size={14}/>
            <span>{busy ? t("photo.opening", "Opening…") : t("photo.take_photo", "Take Photo")}</span>
          </button>
          <button
            type="button"
            className="slot-action-btn slot-upload-btn"
            onClick={() => fileInput.current?.click()}
            disabled={busy || readOnly}
            data-testid={`photo-upload-${id}`}
            aria-label={`Upload photo for ${displayLabel}`}
          >
            <Upload size={14}/>
            <span>{busy ? t("photo.opening", "Opening…") : t("photo.upload_photo", "Upload Photo")}</span>
          </button>
        </div>
      )}

      <div className="photo-slot-caption">
        <span data-testid={`photo-label-${id}`}>{displayLabel}</span>
        {photo && (
          <div className="photo-caption-actions">
            <button
              type="button"
              className="icon-button download-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                downloadPhoto(photo, displayLabel || label || id);
              }}
              title={t("photo.download_photo", "Download photo")}
              aria-label={t("photo.download_photo", "Download photo")}
              data-testid={`photo-download-${id}`}
            >
              <Download size={14}/>
            </button>
            {!readOnly && (
              <>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => cameraInput.current?.click()}
                  title={`Retake ${label} with camera`}
                  aria-label={`Retake ${label} with camera`}
                  data-testid={`photo-retake-${id}`}
                >
                  <Camera size={14}/>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => fileInput.current?.click()}
                  title={`Upload new ${label}`}
                  aria-label={`Upload new ${label}`}
                  data-testid={`photo-replace-${id}`}
                >
                  <Replace size={14}/>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    onChange(id, null);
                    if (onDeleteExtra) onDeleteExtra();
                  }}
                  title={`Remove ${label}`}
                  aria-label={`Remove ${label}`}
                  data-testid={`photo-remove-${id}`}
                >
                  <Trash2 size={14}/>
                </button>
              </>
            )}
          </div>
        )}
        {!photo && !readOnly && onDeleteExtra && (
          <div className="photo-caption-actions">
            <button
              type="button"
              className="icon-button"
              onClick={onDeleteExtra}
              title={`Remove this slot`}
              aria-label={`Remove this slot`}
              data-testid={`photo-delete-slot-${id}`}
            >
              <Trash2 size={14}/>
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <>
          <input
            ref={fileInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={choose}
            data-testid={`photo-input-${id}`}
          />
          <input
            ref={cameraInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={choose}
            data-testid={`photo-camera-${id}`}
          />
        </>
      )}

      {error && <small className="field-error" role="alert" data-testid={`photo-error-${id}`}>{error}</small>}

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="photo-dialog" data-testid={`photo-dialog-${id}`}>
          <div className="photo-dialog-header">
            <div>
              <DialogTitle data-testid={`photo-title-${id}`}>{displayLabel || label}</DialogTitle>
              <DialogDescription data-testid={`photo-filename-${id}`}>{photo?.name || "Photo preview"}</DialogDescription>
            </div>
            {photo && (
              <button
                type="button"
                className="photo-dialog-download-btn"
                onClick={() => downloadPhoto(photo, displayLabel || label || id)}
                data-testid={`photo-dialog-download-${id}`}
              >
                <Download size={15} />
                <span>{t("photo.download_photo", "Download Photo")}</span>
              </button>
            )}
          </div>
          <PhotoPreview photo={photo} alt={label} data-testid={`photo-full-${id}`}/>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Avatar-style portrait slot ────────────────────────────────────────────────
const AvatarPortraitSlot = ({ id, label, photo, onChange, readOnly, icon = "person", stockStatus = null, onStockStatusChange = null, rcStatus = null, onRcStatusChange = null }) => {
  const { t } = useLanguage();
  const fileInput   = useRef(null);
  const cameraInput = useRef(null);
  const [error,   setError]   = useState("");
  const [preview, setPreview] = useState(false);
  const [busy,    setBusy]    = useState(false);

  const displayLabel = slotKeyMap[label] ? t(slotKeyMap[label], label) : label;

  const choose = async event => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Choose a JPG, PNG or WebP photo.");
    if (file.size > 10 * 1024 * 1024) return setError("Photo must be 10 MB or smaller.");
    setBusy(true);
    try { const bitmap = await createImageBitmap(file); bitmap.close(); onChange(id, { name: file.name, type: file.type, size: file.size, blob: file }); }
    catch { setError("This image cannot be opened. Choose another photo."); }
    finally { setBusy(false); }
  };

  return (
    <div className="avatar-portrait-row" data-testid={`photo-slot-${id}`}>
      {/* Circular avatar or vehicle card */}
      <button
        type="button"
        className={`avatar-circle ${icon === "bike" ? "avatar-vehicle-card" : ""}`}
        onClick={() => photo ? setPreview(true) : fileInput.current?.click()}
        disabled={busy || (readOnly && !photo)}
        data-testid={`photo-open-${id}`}
        aria-label={photo ? `View ${displayLabel}` : `Add ${displayLabel}`}
      >
        {photo
          ? <PhotoPreview
              photo={photo}
              alt={displayLabel}
              data-testid={`photo-preview-${id}`}
              style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius: icon === "bike" ? "12px" : "50%", position:"absolute", inset:0 }}
            />
          : icon === "bike" ? (
              <Bike size={38} color="#4d6070" strokeWidth={1.8} />
            ) : (
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
                <circle cx="21" cy="15" r="8" fill="#4d6070"/>
                <ellipse cx="21" cy="36" rx="13" ry="8" fill="#4d6070"/>
              </svg>
            )
        }
      </button>

      {/* Action buttons */}
      <div className="avatar-actions">
        <button
          type="button"
          className="avatar-action-btn"
          onClick={() => cameraInput.current?.click()}
          disabled={busy || readOnly}
          data-testid={`photo-take-${id}`}
        >
          <Camera size={15}/> <span>{t("photo.take_photo", "Take Photo")}</span>
        </button>
        <button
          type="button"
          className="avatar-action-btn"
          onClick={() => fileInput.current?.click()}
          disabled={busy || readOnly}
          data-testid={`photo-upload-${id}`}
        >
          <Upload size={15}/> <span>{busy ? t("photo.opening", "Opening…") : t("photo.upload_photo", "Upload Photo")}</span>
        </button>
        <p className="avatar-hint">
          {photo
            ? <>
                <button
                  type="button"
                  className="avatar-replace-link"
                  onClick={() => downloadPhoto(photo, displayLabel || label || id)}
                  data-testid={`photo-download-${id}`}
                >
                  <Download size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                  {t("photo.download", "Download")}
                </button>
                {!readOnly && (
                  <>
                    {" · "}
                    <button type="button" className="avatar-replace-link" onClick={() => fileInput.current?.click()} data-testid={`photo-replace-${id}`}>{t("photo.replace", "Replace")}</button>
                    {" · "}
                    <button type="button" className="avatar-replace-link" onClick={() => onChange(id, null)} data-testid={`photo-remove-${id}`}>{t("photo.remove", "Remove")}</button>
                  </>
                )}
              </>
            : t("photo.optional_hint", "Optional now — uploads automatically on save.")
          }
        </p>
        {error && <small className="field-error" role="alert" data-testid={`photo-error-${id}`}>{error}</small>}
      </div>

      {/* Status toggle buttons beside vehicle photo: Stock & RC Transfer */}
      {(onStockStatusChange || onRcStatusChange) && (
        <div className="avatar-status-controls-wrapper" data-testid="avatar-status-controls">
          {onStockStatusChange && (
            <div className="avatar-stock-toggle-box" data-testid="avatar-stock-toggle-box">
              <div className="avatar-stock-header">
                <span className="avatar-stock-title">{t("deals.stock_label", "Stock status")}</span>
                <span className={`status-pill ${stockStatus === "Out of Stock" || stockStatus === "Sold" ? "red" : "blue"}`} data-testid="avatar-stock-pill">
                  {stockStatus === "Out of Stock" || stockStatus === "Sold" ? t("status.out_of_stock", "Out of Stock") : t("status.in_stock", "In Stock")}
                </span>
              </div>
              <div className="avatar-stock-btn-group">
                <button
                  type="button"
                  className={`stock-switch-btn in-stock ${stockStatus !== "Out of Stock" && stockStatus !== "Sold" ? "active" : ""}`}
                  onClick={() => onStockStatusChange("In Stock")}
                  data-testid="stock-btn-in-stock"
                >
                  <Check size={14} strokeWidth={2.4}/>
                  <span>{t("status.in_stock", "In Stock")}</span>
                </button>
                <button
                  type="button"
                  className={`stock-switch-btn out-of-stock ${stockStatus === "Out of Stock" || stockStatus === "Sold" ? "active" : ""}`}
                  onClick={() => onStockStatusChange("Out of Stock")}
                  data-testid="stock-btn-out-of-stock"
                >
                  <X size={14} strokeWidth={2.4}/>
                  <span>{t("status.out_of_stock", "Out of Stock")}</span>
                </button>
              </div>
            </div>
          )}

          {onRcStatusChange && (
            <div className="avatar-stock-toggle-box rc-toggle-box" data-testid="avatar-rc-toggle-box">
              <div className="avatar-stock-header">
                <span className="avatar-stock-title">{t("deals.rc_label", "RC Transfer")}</span>
                <span className={`status-pill ${rcStatus === "Completed" || rcStatus === "Transferred" ? "green" : "gold"}`} data-testid="avatar-rc-pill">
                  {rcStatus === "Completed" || rcStatus === "Transferred" ? t("status.rc_transferred", "RC Transferred") : t("status.rc_pending", "RC Pending")}
                </span>
              </div>
              <div className="avatar-stock-btn-group">
                <button
                  type="button"
                  className={`stock-switch-btn rc-pending ${rcStatus !== "Completed" && rcStatus !== "Transferred" ? "active" : ""}`}
                  onClick={() => onRcStatusChange("Pending")}
                  data-testid="rc-btn-pending"
                >
                  <Clock size={14} strokeWidth={2.4}/>
                  <span>{t("status.pending", "Pending")}</span>
                </button>
                <button
                  type="button"
                  className={`stock-switch-btn rc-transferred ${rcStatus === "Completed" || rcStatus === "Transferred" ? "active" : ""}`}
                  onClick={() => onRcStatusChange("Transferred")}
                  data-testid="rc-btn-transferred"
                >
                  <Check size={14} strokeWidth={2.4}/>
                  <span>{t("status.transferred", "Transferred")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden inputs */}
      {!readOnly && <>
        <input ref={fileInput}   type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={choose} data-testid={`photo-input-${id}`}/>
        <input ref={cameraInput} type="file" hidden accept="image/jpeg,image/png,image/webp" capture="user" onChange={choose} data-testid={`photo-camera-${id}`}/>
      </>}

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="photo-dialog" data-testid={`photo-dialog-${id}`}>
          <div className="photo-dialog-header">
            <div>
              <DialogTitle data-testid={`photo-title-${id}`}>{displayLabel}</DialogTitle>
              <DialogDescription data-testid={`photo-filename-${id}`}>{photo?.name || "Photo preview"}</DialogDescription>
            </div>
            {photo && (
              <button
                type="button"
                className="photo-dialog-download-btn"
                onClick={() => downloadPhoto(photo, displayLabel || label || id)}
                data-testid={`photo-dialog-download-${id}`}
              >
                <Download size={15} />
                <span>{t("photo.download_photo", "Download Photo")}</span>
              </button>
            )}
          </div>
          <PhotoPreview photo={photo} alt={displayLabel} data-testid={`photo-full-${id}`}/>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Plus card for adding more photos ─────────────────────────────────────────
const AddPhotoBox = ({ group, onAddPhotos, disabled = false }) => {
  const { t } = useLanguage();
  const fileInput   = useRef(null);
  const cameraInput = useRef(null);

  const handleFiles = event => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length) {
      onAddPhotos(files);
    }
  };

  return (
    <div
      className="photo-slot add-photo-box"
      data-testid={`photo-add-box-${group}`}
      onClick={(e) => {
        if (e.target.tagName !== "BUTTON" && !e.target.closest("button") && !disabled) {
          fileInput.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          fileInput.current?.click();
        }
      }}
      aria-label="Add more photos"
    >
      <div className="add-photo-box-main">
        <div className="add-photo-icon-circle">
          <Plus size={22} strokeWidth={2.5} />
        </div>
        <strong className="add-photo-title">{t("photo.add_photo", "Add photo")}</strong>
        <span className="add-photo-sub">{t("photo.take_upload_more", "Take or upload more")}</span>

        <div className="add-photo-actions">
          <button
            type="button"
            className="slot-action-btn slot-take-btn"
            onClick={(e) => {
              e.stopPropagation();
              cameraInput.current?.click();
            }}
            disabled={disabled}
            data-testid={`add-photo-take-${group}`}
            title="Take photo with camera"
          >
            <Camera size={14} />
            <span>{t("photo.take_photo", "Take Photo")}</span>
          </button>
          <button
            type="button"
            className="slot-action-btn slot-upload-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInput.current?.click();
            }}
            disabled={disabled}
            data-testid={`add-photo-upload-${group}`}
            title="Upload photo from device"
          >
            <Upload size={14} />
            <span>{t("photo.upload_photo", "Upload Photo")}</span>
          </button>
        </div>
      </div>

      <div className="photo-slot-caption add-photo-box-caption">
        <span>{t("photo.more_photos", "+ More photos")}</span>
      </div>

      {/* Hidden file & camera inputs with multiple file selection */}
      <input
        ref={fileInput}
        type="file"
        hidden
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFiles}
        data-testid={`add-extra-file-input-${group}`}
      />
      <input
        ref={cameraInput}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFiles}
        data-testid={`add-extra-camera-input-${group}`}
      />
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
export const PhotoSlots = ({ group, photos, onChange, readOnly = false, dealerToggle = null, variant = "all", stockStatus = null, onStockStatusChange = null, rcStatus = null, onRcStatusChange = null }) => {
  const { t } = useLanguage();
  const slots         = photoSlots[group] || [];
  const count         = slots.filter((_, i) => photos[`${group}-${i + 1}`]).length;
  const isPersonGroup = group === "seller" || group === "buyer";
  const isVehicle     = group === "vehicle";

  // Dynamic extra slots tracking
  const [extraSlotIds, setExtraSlotIds] = useState(() => {
    const prefix = `${group}-extra-`;
    return Object.keys(photos || {}).filter(k => k.startsWith(prefix));
  });

  const existingExtraKeys = Object.keys(photos || {}).filter(k => k.startsWith(`${group}-extra-`));
  const allExtraIds = Array.from(new Set([...extraSlotIds, ...existingExtraKeys])).sort((a, b) => {
    const numA = parseInt(a.replace(`${group}-extra-`, ""), 10) || 0;
    const numB = parseInt(b.replace(`${group}-extra-`, ""), 10) || 0;
    return numA - numB;
  });

  const handleAddPhotos = (files) => {
    let currentIds = [...allExtraIds];
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) continue;
      let maxNum = 0;
      currentIds.forEach(id => {
        const num = parseInt(id.replace(`${group}-extra-`, ""), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const nextNum = maxNum + 1;
      const newId = `${group}-extra-${nextNum}`;
      currentIds.push(newId);
      onChange(newId, { name: file.name, type: file.type, size: file.size, blob: file });
    }
    setExtraSlotIds(currentIds);
  };

  if (isPersonGroup || isVehicle) {
    const portraitId    = `${group}-1`;
    const portraitLabel = slots[0];
    const restSlots     = slots.slice(1);
    const hasPortrait   = !!photos[portraitId];
    const docsCount     = restSlots.filter((_, i) => photos[`${group}-${i + 2}`]).length;
    const sectionTitle  = group === "seller" ? t("photo.seller_photo", "Seller photo") : group === "buyer" ? t("photo.buyer_photo", "Buyer photo") : t("photo.vehicle_photo", "Vehicle photo");
    const docsTitle     = isVehicle ? t("photo.additional_docs", "Additional photos & documents") : t("photo.docs_additional", "Documents & additional photos");

    if (variant === "portrait") {
      if (isPersonGroup) {
        return (
          <PartyIdentityRow
            group={group}
            photos={photos}
            onChange={onChange}
            readOnly={readOnly}
            dealerToggle={dealerToggle}
          />
        );
      }

      return (
        <section className="wizard-group photo-group" data-testid={`${group}-portrait-section`}>
          <div className="section-title">
            <h2>{sectionTitle}</h2>
            <div className="photo-section-actions">
              <span className="slot-count" data-testid={`${group}-photo-count`}>
                {hasPortrait ? `1 / 1 ${t("photo.photos_count", "photo")}` : t("photo.optional", "Optional")}
              </span>
              {dealerToggle}
            </div>
          </div>

          <AvatarPortraitSlot
            id={portraitId}
            label={portraitLabel}
            photo={photos[portraitId]}
            onChange={onChange}
            readOnly={readOnly}
            icon={isVehicle ? "bike" : "person"}
            stockStatus={isVehicle ? stockStatus : null}
            onStockStatusChange={isVehicle ? onStockStatusChange : null}
            rcStatus={isVehicle ? rcStatus : null}
            onRcStatusChange={isVehicle ? onRcStatusChange : null}
          />
        </section>
      );
    }

    if (variant === "docs") {
      const filteredSlots = isPersonGroup ? restSlots.filter((s) => s !== "Signature") : restSlots;
      const extraUploaded = allExtraIds.filter((id) => photos[id]).length;
      const totalDocsCount =
        filteredSlots.filter((label) => {
          const originalIndex = restSlots.indexOf(label);
          return photos[`${group}-${originalIndex + 2}`];
        }).length + extraUploaded;
      const totalDocsSlots = filteredSlots.length + allExtraIds.length;

      return (
        <section className="wizard-group photo-group" data-testid={`${group}-docs-section`}>
          <div className="section-title">
            <h2>{docsTitle}</h2>
            <span className="slot-count" data-testid={`${group}-docs-count`}>
              {totalDocsCount} / {totalDocsSlots} {t("photo.photos_count", "photos")}
            </span>
          </div>
          <div className="photo-slot-grid">
            {filteredSlots.map((label) => {
              const originalIndex = restSlots.indexOf(label);
              const slotId = `${group}-${originalIndex + 2}`;
              return (
                <PhotoSlot
                  key={label}
                  id={slotId}
                  label={label}
                  photo={photos[slotId]}
                  onChange={onChange}
                  readOnly={readOnly}
                />
              );
            })}
            {allExtraIds.map((extraId) => {
              const num = extraId.replace(`${group}-extra-`, "");
              const photo = photos[extraId];
              return (
                <PhotoSlot
                  key={extraId}
                  id={extraId}
                  label={photo?.name ? `Additional: ${photo.name.slice(0, 16)}` : `Additional photo ${num}`}
                  photo={photo}
                  onChange={(id, val) => {
                    onChange(id, val);
                    if (!val) {
                      setExtraSlotIds(prev => prev.filter(x => x !== extraId));
                    }
                  }}
                  readOnly={readOnly}
                  onDeleteExtra={() => {
                    onChange(extraId, null);
                    setExtraSlotIds(prev => prev.filter(x => x !== extraId));
                  }}
                />
              );
            })}
            {!readOnly && (
              <AddPhotoBox
                group={group}
                onAddPhotos={handleAddPhotos}
              />
            )}
          </div>
        </section>
      );
    }

    if (isVehicle) {
      const extraUploaded = allExtraIds.filter(id => photos[id]).length;
      return (
        <section className="wizard-group photo-group">
          <div className="section-title">
            <h2>Photos &amp; documents</h2>
            <span className="slot-count" data-testid={`${group}-photo-count`}>
              {count + extraUploaded} / {slots.length + allExtraIds.length} photos
            </span>
          </div>
          <div className="photo-slot-grid">
            {slots.map((label, i) => (
              <PhotoSlot
                key={label}
                id={`${group}-${i + 1}`}
                label={label}
                photo={photos[`${group}-${i + 1}`]}
                onChange={onChange}
                readOnly={readOnly}
              />
            ))}
            {allExtraIds.map((extraId) => {
              const num = extraId.replace(`${group}-extra-`, "");
              const photo = photos[extraId];
              return (
                <PhotoSlot
                  key={extraId}
                  id={extraId}
                  label={photo?.name ? `Additional: ${photo.name.slice(0, 16)}` : `Additional photo ${num}`}
                  photo={photo}
                  onChange={(id, val) => {
                    onChange(id, val);
                    if (!val) {
                      setExtraSlotIds(prev => prev.filter(x => x !== extraId));
                    }
                  }}
                  readOnly={readOnly}
                  onDeleteExtra={() => {
                    onChange(extraId, null);
                    setExtraSlotIds(prev => prev.filter(x => x !== extraId));
                  }}
                />
              );
            })}
            {!readOnly && (
              <AddPhotoBox
                group={group}
                onAddPhotos={handleAddPhotos}
              />
            )}
          </div>
        </section>
      );
    }

    return (
      <section className="wizard-group photo-group">
        {/* Heading row: "Seller photo" + photo count + Dealer toggle */}
        <div className="section-title">
          <h2>{group === "seller" ? t("photo.seller_photo", "Seller photo") : t("photo.buyer_photo", "Buyer photo")}</h2>
          <div className="photo-section-actions">
            <span className="slot-count" data-testid={`${group}-photo-count`}>{count} / {slots.length} {t("photo.photos_count", "photos")}</span>
            {dealerToggle}
          </div>
        </div>

        <AvatarPortraitSlot
          id={portraitId}
          label={portraitLabel}
          photo={photos[portraitId]}
          onChange={onChange}
          readOnly={readOnly}
        />

        {restSlots.length > 0 && (
          <div className="avatar-docs-label">{t("photo.docs_additional", "Documents & additional photos")}</div>
        )}
        <div className="photo-slot-grid">
          {restSlots.map((label, i) => {
            const slotId = `${group}-${i + 2}`;
            return (
              <PhotoSlot
                key={label}
                id={slotId}
                label={label}
                photo={photos[slotId]}
                onChange={onChange}
                readOnly={readOnly}
              />
            );
          })}
          {allExtraIds.map((extraId) => {
            const num = extraId.replace(`${group}-extra-`, "");
            const photo = photos[extraId];
            return (
              <PhotoSlot
                key={extraId}
                id={extraId}
                label={photo?.name ? `Additional: ${photo.name.slice(0, 16)}` : `Additional photo ${num}`}
                photo={photo}
                onChange={(id, val) => {
                  onChange(id, val);
                  if (!val) {
                    setExtraSlotIds(prev => prev.filter(x => x !== extraId));
                  }
                }}
                readOnly={readOnly}
                onDeleteExtra={() => {
                  onChange(extraId, null);
                  setExtraSlotIds(prev => prev.filter(x => x !== extraId));
                }}
              />
            );
          })}
          {!readOnly && (
            <AddPhotoBox
              group={group}
              onAddPhotos={handleAddPhotos}
            />
          )}
        </div>
      </section>
    );
  }

  // Witness / vehicle — original compact grid
  return (
    <section className="wizard-group photo-group">
      <div className="section-title">
        <h2>{group.startsWith("witness") ? t("photo.witness_photo", "Photo") : t("photo.additional_docs", "Photos & documents")}</h2>
        <span className="slot-count" data-testid={`${group}-photo-count`}>{count} / {slots.length} {t("photo.photos_count", "photos")}</span>
      </div>
      <div className={`photo-slot-grid ${slots.length === 1 ? "single-photo" : ""}`}>
        {slots.map((label, i) => (
          <PhotoSlot
            key={label}
            id={`${group}-${i + 1}`}
            label={label}
            photo={photos[`${group}-${i + 1}`]}
            onChange={onChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    </section>
  );
};