import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Download,
  Edit3,
  Eye,
  Fingerprint,
  PenTool,
  Replace,
  Trash2,
  Upload,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SignaturePadModal } from "./SignaturePadModal";
import { LiveCameraModal } from "./LiveCameraModal";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { downloadPhoto } from "@/utils/photoDownload";

export const PhotoPreview = ({ photo, alt, ...props }) => {
  const [url, setUrl] = useState(photo?.url || "");
  useEffect(() => {
    if (!photo?.blob) {
      setUrl(photo?.url || "");
      return;
    }
    const objectUrl = URL.createObjectURL(photo.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo?.blob, photo?.url]);
  return url ? <img src={url} alt={alt} {...props} /> : null;
};

export function PartyIdentityRow({
  group = "seller",
  deal,
  photos = {},
  onChange,
  readOnly = false,
  dealerToggle = null,
  embedded = false,
  showHeader = true,
  title = null,
  subtitle = null,
}) {
  const { t } = useLanguage();

  const isWitness = group.startsWith("witness");
  const isSellerWitness = group === "witness-1" || group === "seller-witness";
  const isBuyerWitness = group === "witness-2" || group === "buyer-witness";

  // Photo slot keys
  const portraitKey = `${group}-1`;
  const portraitAltKey = isWitness ? group : null;
  const signatureKey = `${group}-signature`;
  const signatureAltKey = isWitness ? `${group}-2` : `${group}-8`;
  const thumbKey = `${group}-thumb`;
  const thumbAltKey = isWitness ? `${group}-3` : `${group}-thumb-impression`;

  // Resolved media objects
  const portraitPhoto =
    photos[portraitKey] ||
    (portraitAltKey ? photos[portraitAltKey] : null) ||
    photos[`${group}-portrait`] ||
    photos[`${group}_photo`];
  const signaturePhoto =
    photos[signatureKey] ||
    photos[signatureAltKey] ||
    photos[`${group}_signature`];
  const thumbPhoto =
    photos[thumbKey] ||
    photos[thumbAltKey] ||
    photos[`${group}-thumb-impression`] ||
    photos[`${group}_thumb`];

  // Modals state
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [cameraModalConfig, setCameraModalConfig] = useState(null); // { isOpen, title, targetKey, altKey, guideType }
  const [zoomPhoto, setZoomPhoto] = useState(null); // { photo, title }

  // Hidden file inputs
  const portraitFileInput = useRef(null);
  const portraitCameraInput = useRef(null);
  const signatureFileInput = useRef(null);
  const thumbFileInput = useRef(null);
  const thumbCameraInput = useRef(null);

  const groupLabel = isWitness
    ? (isSellerWitness
        ? t("section.seller_witness", "Seller witness")
        : isBuyerWitness
        ? t("section.buyer_witness", "Buyer witness")
        : t("section.witness_details", "Witness"))
    : (group === "seller"
        ? t("step.seller", "Seller")
        : t("step.buyer", "Buyer"));

  const defaultTitle = isWitness
    ? (isSellerWitness
        ? t("identity.seller_witness_title", "Witness verification & identity")
        : isBuyerWitness
        ? t("identity.buyer_witness_title", "Witness verification & identity")
        : t("identity.witness_title", "Witness verification & identity"))
    : (group === "seller"
        ? t("identity.seller_title", "Seller Verification & Identity")
        : t("identity.buyer_title", "Buyer Verification & Identity"));

  const defaultSubtitle = isWitness
    ? t("identity.witness_subtitle", "Photo, digital signature, and thumb impression")
    : t("identity.row_subtitle", "Photo, digital signature, and thumb impression");

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  const card1Title = isWitness
    ? (isSellerWitness
        ? t("slot.seller_witness_photo", "Witness Photo")
        : isBuyerWitness
        ? t("slot.buyer_witness_photo", "Witness Photo")
        : t("photo.witness_photo", "Witness Photo"))
    : (group === "seller"
        ? t("photo.seller_photo", "Seller Photo")
        : t("photo.buyer_photo", "Buyer Photo"));

  const card2Title = isWitness
    ? t("identity.witness_sig", "Witness Signature")
    : (group === "seller"
        ? t("identity.seller_sig", "Seller Signature")
        : t("identity.buyer_sig", "Buyer Signature"));

  const card3Title = isWitness
    ? t("identity.witness_thumb", "Witness Fingerprint")
    : (group === "seller"
        ? t("identity.seller_thumb", "Seller Thumb")
        : t("identity.buyer_thumb", "Buyer Thumb"));

  // Handle generic file selection
  const handleFileChoose = async (targetKey, file, altKey = null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      alert("Please select a JPG, PNG, WebP or SVG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image file must be 10 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const photoObj = {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        dataUrl,
        url: dataUrl,
      };
      onChange(targetKey, photoObj);
      if (altKey) {
        setTimeout(() => onChange(altKey, photoObj), 0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle direct photo object (from canvas or webcam)
  const handleDirectSave = (targetKey, photoObj, altKey = null) => {
    if (!photoObj) return;
    const prepared = { ...photoObj };
    if (!prepared.dataUrl && !prepared.url && prepared.blob) {
      try {
        prepared.url = URL.createObjectURL(prepared.blob);
      } catch (e) {
        console.warn("Could not create object URL", e);
      }
    }
    if (!prepared.dataUrl && prepared.url && prepared.url.startsWith("data:")) {
      prepared.dataUrl = prepared.url;
    }
    onChange(targetKey, prepared);
    if (altKey) {
      setTimeout(() => onChange(altKey, prepared), 0);
    }
  };

  // Remove photo helper
  const handleRemove = (targetKey, altKey = null) => {
    onChange(targetKey, null);
    if (altKey) {
      setTimeout(() => onChange(altKey, null), 0);
    }
  };

  const RootContainer = embedded ? "div" : "section";
  const rootClass = embedded
    ? "party-identity-section embedded"
    : "wizard-group party-identity-section";

  return (
    <RootContainer className={rootClass} data-testid={`${group}-identity-section`}>
      {/* Header bar with title & dealer toggle */}
      {showHeader && (
        <div className="section-title identity-section-title">
          <div className="identity-title-lockup">
            <h2>{displayTitle}</h2>
            <span className="identity-sub-label">{displaySubtitle}</span>
          </div>
          <div className="photo-section-actions">
            {dealerToggle}
          </div>
        </div>
      )}

      {/* 3-Card Identity Grid */}
      <div className="party-identity-grid" data-testid={`${group}-identity-grid`}>
        {/* ===================== CARD 1: PROFILE PHOTO ===================== */}
        <div className={`identity-card ${portraitPhoto ? "has-data" : ""}`} data-testid={`${group}-photo-card`}>
          <div className="identity-card-header">
            <div className="identity-header-left">
              <User size={16} className="identity-header-icon" />
              <span className="identity-card-title">{card1Title}</span>
            </div>
            <span className={`identity-badge ${portraitPhoto ? "badge-success" : "badge-optional"}`}>
              {portraitPhoto ? (
                <>
                  <Check size={11} strokeWidth={2.5} /> {t("identity.uploaded", "Added")}
                </>
              ) : (
                t("identity.optional", "Optional")
              )}
            </span>
          </div>

          <div className="identity-card-body">
            {/* Avatar / Photo preview circle */}
            <div
              className="identity-avatar-box"
              onClick={() => portraitPhoto && setZoomPhoto({ photo: portraitPhoto, title: `${groupLabel} Photo` })}
              title={portraitPhoto ? "Click to view full photo" : undefined}
            >
              {portraitPhoto ? (
                <div className="identity-preview-wrapper avatar-wrapper">
                  <PhotoPreview photo={portraitPhoto} alt={`${groupLabel} Photo`} className="identity-img-cover" />
                  <div className="identity-zoom-overlay">
                    <ZoomIn size={18} />
                  </div>
                </div>
              ) : (
                <div className="identity-avatar-placeholder">
                  <svg width="44" height="44" viewBox="0 0 42 42" fill="none" aria-hidden="true">
                    <circle cx="21" cy="15" r="8" fill="#4d6070" />
                    <ellipse cx="21" cy="36" rx="13" ry="8" fill="#4d6070" />
                  </svg>
                  <span className="identity-placeholder-hint">
                    {isWitness ? t("identity.witness_photo_hint", "Witness Photo") : t("identity.passport_hint", "Passport / Photo")}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!readOnly && (
              <div className="identity-card-actions">
                <button
                  type="button"
                  className="identity-btn-primary"
                  onClick={() =>
                    setCameraModalConfig({
                      isOpen: true,
                      title: `${groupLabel} Photo`,
                      targetKey: portraitKey,
                      altKey: portraitAltKey,
                      guideType: "portrait",
                    })
                  }
                  data-testid={`${group}-photo-take-btn`}
                >
                  <Camera size={14} />
                  <span>{t("identity.take_photo", "Take Photo")}</span>
                </button>
                <button
                  type="button"
                  className="identity-btn-secondary"
                  onClick={() => portraitFileInput.current?.click()}
                  data-testid={`${group}-photo-upload-btn`}
                >
                  <Upload size={14} />
                  <span>{t("identity.upload_photo", "Upload Photo")}</span>
                </button>

                {portraitPhoto && (
                  <div className="identity-card-links">
                    <button
                      type="button"
                      className="identity-link-action"
                      onClick={() => downloadPhoto(portraitPhoto, `${groupLabel} Photo`)}
                      data-testid={`${group}-photo-download-link`}
                    >
                      <Download size={12} /> {t("photo.download", "Download")}
                    </button>
                    <span className="identity-link-sep">•</span>
                    <button
                      type="button"
                      className="identity-link-action"
                      onClick={() => portraitFileInput.current?.click()}
                    >
                      <Replace size={12} /> {t("photo.replace", "Replace")}
                    </button>
                    <span className="identity-link-sep">•</span>
                    <button
                      type="button"
                      className="identity-link-action danger"
                      onClick={() => handleRemove(portraitKey, portraitAltKey)}
                    >
                      <Trash2 size={12} /> {t("photo.remove", "Remove")}
                    </button>
                  </div>
                )}
              </div>
            )}
            {readOnly && portraitPhoto && (
              <div className="identity-card-links">
                <button
                  type="button"
                  className="identity-link-action"
                  onClick={() => downloadPhoto(portraitPhoto, `${groupLabel} Photo`)}
                  data-testid={`${group}-photo-download-link`}
                >
                  <Download size={12} /> {t("photo.download", "Download")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================== CARD 2: SIGNATURE BOX ===================== */}
        <div className={`identity-card ${signaturePhoto ? "has-data" : ""}`} data-testid={`${group}-signature-card`}>
          <div className="identity-card-header">
            <div className="identity-header-left">
              <PenTool size={16} className="identity-header-icon gold-icon" />
              <span className="identity-card-title">{card2Title}</span>
            </div>
            <span className={`identity-badge ${signaturePhoto ? "badge-success" : "badge-optional"}`}>
              {signaturePhoto ? (
                <>
                  <Check size={11} strokeWidth={2.5} /> {t("identity.signed", "Signed")}
                </>
              ) : (
                t("identity.optional", "Optional")
              )}
            </span>
          </div>

          <div className="identity-card-body">
            {/* Signature Preview Canvas / Card */}
            <div
              className="identity-signature-preview-box"
              onClick={() => signaturePhoto && setZoomPhoto({ photo: signaturePhoto, title: `${groupLabel} Signature` })}
              title={signaturePhoto ? "Click to view signature" : undefined}
            >
              {signaturePhoto ? (
                <div className="identity-preview-wrapper sig-wrapper">
                  <PhotoPreview
                    photo={signaturePhoto}
                    alt={`${groupLabel} Signature`}
                    className="identity-sig-img"
                  />
                  <div className="identity-zoom-overlay">
                    <ZoomIn size={18} />
                  </div>
                </div>
              ) : (
                <div className="identity-signature-placeholder">
                  <div className="identity-signature-guide-line">
                    <span className="sig-x">✕</span>
                    <span className="sig-text">{t("identity.sign_placeholder", "Sign on screen or upload")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Signature Action Buttons */}
            {!readOnly && (
              <div className="identity-card-actions">
                <button
                  type="button"
                  className="identity-btn-primary gold-highlight"
                  onClick={() => setSignaturePadOpen(true)}
                  data-testid={`${group}-sign-screen-btn`}
                >
                  <Edit3 size={14} />
                  <span>{signaturePhoto ? t("identity.sign_again", "Sign Again") : t("identity.sign_on_screen", "Sign on Screen")}</span>
                </button>

                <div className="identity-dual-btn-row">
                  <button
                    type="button"
                    className="identity-btn-secondary"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: `${groupLabel} Signature`,
                        targetKey: signatureKey,
                        altKey: signatureAltKey,
                        guideType: "document",
                      })
                    }
                    data-testid={`${group}-sig-take-btn`}
                    title="Take photo of paper signature"
                  >
                    <Camera size={13} />
                    <span>{t("identity.take_photo", "Take Photo")}</span>
                  </button>
                  <button
                    type="button"
                    className="identity-btn-secondary"
                    onClick={() => signatureFileInput.current?.click()}
                    data-testid={`${group}-sig-upload-btn`}
                    title="Upload signature image file"
                  >
                    <Upload size={13} />
                    <span>{t("identity.upload_btn", "Upload")}</span>
                  </button>
                </div>

                {signaturePhoto && (
                  <div className="identity-card-links">
                    <button
                      type="button"
                      className="identity-link-action"
                      onClick={() => downloadPhoto(signaturePhoto, `${groupLabel} Signature`)}
                      data-testid={`${group}-sig-download-link`}
                    >
                      <Download size={12} /> {t("photo.download", "Download")}
                    </button>
                    <span className="identity-link-sep">•</span>
                    <button
                      type="button"
                      className="identity-link-action"
                      onClick={() => setSignaturePadOpen(true)}
                    >
                      <Edit3 size={12} /> {t("identity.edit_sig", "Re-sign")}
                    </button>
                    <span className="identity-link-sep">•</span>
                    <button
                      type="button"
                      className="identity-link-action danger"
                      onClick={() => handleRemove(signatureKey, signatureAltKey)}
                    >
                      <Trash2 size={12} /> {t("photo.remove", "Remove")}
                    </button>
                  </div>
                )}
              </div>
            )}
            {readOnly && signaturePhoto && (
              <div className="identity-card-links">
                <button
                  type="button"
                  className="identity-link-action"
                  onClick={() => downloadPhoto(signaturePhoto, `${groupLabel} Signature`)}
                  data-testid={`${group}-sig-download-link`}
                >
                  <Download size={12} /> {t("photo.download", "Download")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================== CARD 3: THUMB IMPRESSION BOX ===================== */}
        <div className={`identity-card ${thumbPhoto ? "has-data" : ""}`} data-testid={`${group}-thumb-card`}>
          <div className="identity-card-header">
            <div className="identity-header-left">
              <Fingerprint size={16} className="identity-header-icon blue-icon" />
              <span className="identity-card-title">{card3Title}</span>
            </div>
            <span className={`identity-badge ${thumbPhoto ? "badge-success" : "badge-optional"}`}>
              {thumbPhoto ? (
                <>
                  <Check size={11} strokeWidth={2.5} /> {t("identity.uploaded", "Added")}
                </>
              ) : (
                t("identity.optional", "Optional")
              )}
            </span>
          </div>

          <div className="identity-card-body">
            {/* Thumb impression preview box */}
            <div
              className="identity-thumb-preview-box"
              onClick={() => thumbPhoto && setZoomPhoto({ photo: thumbPhoto, title: `${groupLabel} Thumb Impression` })}
              title={thumbPhoto ? "Click to view thumb impression" : undefined}
            >
              {thumbPhoto ? (
                <div className="identity-preview-wrapper thumb-wrapper">
                  <PhotoPreview
                    photo={thumbPhoto}
                    alt={`${groupLabel} Thumb Impression`}
                    className="identity-thumb-img"
                  />
                  <div className="identity-zoom-overlay">
                    <ZoomIn size={18} />
                  </div>
                </div>
              ) : (
                <div className="identity-thumb-placeholder">
                  <Fingerprint size={38} className="thumb-placeholder-icon" strokeWidth={1.5} />
                  <span className="identity-placeholder-hint">
                    {isWitness ? t("identity.fingerprint_hint", "Fingerprint / Inked Thumb") : t("identity.thumb_box_hint", "Inked thumb impression")}
                  </span>
                </div>
              )}
            </div>

            {/* Thumb Action Buttons */}
            {!readOnly && (
              <div className="identity-card-actions">
                <button
                  type="button"
                  className="identity-btn-primary"
                  onClick={() =>
                    setCameraModalConfig({
                      isOpen: true,
                      title: isWitness ? `${groupLabel} Fingerprint` : `${groupLabel} Thumb Impression`,
                      targetKey: thumbKey,
                      altKey: thumbAltKey,
                      guideType: "thumb",
                    })
                  }
                  data-testid={`${group}-thumb-take-btn`}
                >
                  <Camera size={14} />
                  <span>{t("identity.take_photo", "Take Photo")}</span>
                </button>
                <button
                  type="button"
                  className="identity-btn-secondary"
                  onClick={() => thumbFileInput.current?.click()}
                  data-testid={`${group}-thumb-upload-btn`}
                >
                  <Upload size={14} />
                  <span>{t("identity.upload_photo", "Upload Photo")}</span>
                </button>

                {thumbPhoto && (
                  <div className="identity-card-links">
                    <button
                      type="button"
                      className="identity-link-action"
                      onClick={() => downloadPhoto(thumbPhoto, `${groupLabel} Thumb Impression`)}
                      data-testid={`${group}-thumb-download-link`}
                    >
                      <Download size={12} /> {t("photo.download", "Download")}
                    </button>
                    <span className="identity-link-sep">•</span>
                    <button
                      type="button"
                      className="identity-link-action"
                      onClick={() => thumbFileInput.current?.click()}
                    >
                      <Replace size={12} /> {t("photo.replace", "Replace")}
                    </button>
                    <span className="identity-link-sep">•</span>
                    <button
                      type="button"
                      className="identity-link-action danger"
                      onClick={() => handleRemove(thumbKey, thumbAltKey)}
                    >
                      <Trash2 size={12} /> {t("photo.remove", "Remove")}
                    </button>
                  </div>
                )}
              </div>
            )}
            {readOnly && thumbPhoto && (
              <div className="identity-card-links">
                <button
                  type="button"
                  className="identity-link-action"
                  onClick={() => downloadPhoto(thumbPhoto, `${groupLabel} Thumb Impression`)}
                  data-testid={`${group}-thumb-download-link`}
                >
                  <Download size={12} /> {t("photo.download", "Download")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      {!readOnly && (
        <>
          <input
            ref={portraitFileInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChoose(portraitKey, e.target.files?.[0], portraitAltKey)}
            data-testid={`${group}-portrait-file-input`}
          />
          <input
            ref={signatureFileInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(e) => handleFileChoose(signatureKey, e.target.files?.[0], signatureAltKey)}
            data-testid={`${group}-signature-file-input`}
          />
          <input
            ref={thumbFileInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChoose(thumbKey, e.target.files?.[0], thumbAltKey)}
            data-testid={`${group}-thumb-file-input`}
          />
        </>
      )}

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={signaturePadOpen}
        onClose={() => setSignaturePadOpen(false)}
        onSave={(photoObj) => handleDirectSave(signatureKey, photoObj, signatureAltKey)}
        title={`${groupLabel} Signature`}
      />

      {/* Live Camera Capture Modal */}
      {cameraModalConfig && (
        <LiveCameraModal
          isOpen={cameraModalConfig.isOpen}
          title={cameraModalConfig.title}
          guideType={cameraModalConfig.guideType}
          onClose={() => setCameraModalConfig(null)}
          onCapture={(photoObj) =>
            handleDirectSave(cameraModalConfig.targetKey, photoObj, cameraModalConfig.altKey)
          }
        />
      )}

      {/* Zoom / Full Preview Dialog */}
      {zoomPhoto && (
        <Dialog open={!!zoomPhoto} onOpenChange={(open) => !open && setZoomPhoto(null)}>
          <DialogContent className="photo-dialog identity-zoom-dialog" data-testid="identity-zoom-dialog">
            <div className="photo-dialog-header">
              <div>
                <DialogTitle>{zoomPhoto.title}</DialogTitle>
                <DialogDescription>{zoomPhoto.photo?.name || "Image Preview"}</DialogDescription>
              </div>
              {zoomPhoto.photo && (
                <button
                  type="button"
                  className="photo-dialog-download-btn"
                  onClick={() => downloadPhoto(zoomPhoto.photo, zoomPhoto.title || "document")}
                  data-testid="party-identity-dialog-download"
                >
                  <Download size={15} />
                  <span>{t("photo.download_photo", "Download Photo")}</span>
                </button>
              )}
            </div>
            <div className="identity-zoom-preview-container">
              <PhotoPreview photo={zoomPhoto.photo} alt={zoomPhoto.title} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </RootContainer>
  );
}
