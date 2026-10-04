import { useEffect, useRef, useState } from "react";
import { Camera, Check, RefreshCw, SwitchCamera, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/features/i18n/LanguageContext";

export function LiveCameraModal({
  isOpen,
  onClose,
  onCapture,
  title = "Take Photo",
  guideType = "document", // "document", "portrait", or "thumb"
}) {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileFallbackRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment");
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [loadingCamera, setLoadingCamera] = useState(false);

  // Stop current active stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start webcam stream
  const startCamera = async (facing) => {
    stopStream();
    setCameraError("");
    setLoadingCamera(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.warn("Could not start live webcam, providing file/camera fallback:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Use device photo picker instead."
          : "Camera not available directly. Choose an image or use your device camera."
      );
    } finally {
      setLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setCapturedUrl(null);
      setCameraError("");
      startCamera(facingMode);
    } else {
      stopStream();
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    }
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  // Capture snapshot from current video frame
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedUrl(url);
        stopStream();
      },
      "image/jpeg",
      0.92
    );
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    setCapturedBlob(null);
    setCapturedUrl(null);
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (!capturedBlob) return;
    const photoObj = {
      name: `captured-${Date.now()}.jpg`,
      type: "image/jpeg",
      size: capturedBlob.size,
      blob: capturedBlob,
    };
    onClose();
    setTimeout(() => {
      onCapture(photoObj);
    }, 0);
  };

  // Toggle front/back camera
  const handleSwitchCamera = () => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
  };

  // Fallback file chooser
  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    onCapture({
      name: file.name,
      type: file.type || "image/jpeg",
      size: file.size,
      blob: file,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="live-camera-dialog" data-testid="live-camera-dialog">
        <DialogTitle className="camera-dialog-title">
          <Camera size={18} className="text-amber-500" />
          <span>{title}</span>
        </DialogTitle>
        <DialogDescription className="camera-dialog-desc">
          {guideType === "thumb"
            ? t("identity.thumb_hint", "Align the thumb impression inside the frame and take a clear photo.")
            : t("identity.camera_hint", "Position within frame and hold steady.")}
        </DialogDescription>

        <div className="camera-viewfinder-container" data-testid="camera-viewfinder">
          {capturedUrl ? (
            /* Preview of captured image */
            <div className="camera-snapshot-preview">
              <img src={capturedUrl} alt="Captured snapshot" />
            </div>
          ) : cameraError ? (
            /* Error & device photo fallback */
            <div className="camera-error-fallback">
              <Camera size={44} className="camera-fallback-icon" />
              <p className="camera-error-text">{cameraError}</p>
              <button
                type="button"
                className="camera-fallback-btn"
                onClick={() => fileFallbackRef.current?.click()}
                data-testid="camera-fallback-file-btn"
              >
                <Upload size={16} />
                <span>{t("identity.upload_photo", "Choose from Device / Take Photo")}</span>
              </button>
            </div>
          ) : (
            /* Live camera stream */
            <div className="camera-stream-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video-feed"
              />
              {/* Overlay alignment guide */}
              <div className={`camera-guide-overlay ${guideType}`}>
                <div className="camera-guide-corner tl" />
                <div className="camera-guide-corner tr" />
                <div className="camera-guide-corner bl" />
                <div className="camera-guide-corner br" />
                <div className="camera-guide-label">
                  {guideType === "thumb"
                    ? "Thumb Impression"
                    : guideType === "portrait"
                    ? "Portrait Frame"
                    : "Signature / Document"}
                </div>
              </div>

              {/* Switch camera button */}
              <button
                type="button"
                className="camera-switch-btn"
                onClick={handleSwitchCamera}
                title={t("identity.switch_camera", "Switch Camera")}
                aria-label="Switch Camera"
              >
                <SwitchCamera size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Hidden fallback file input */}
        <input
          ref={fileFallbackRef}
          type="file"
          hidden
          accept="image/*"
          capture={facingMode}
          onChange={handleFallbackFile}
          data-testid="camera-fallback-input"
        />

        {/* Action Controls */}
        <div className="camera-dialog-actions">
          {capturedUrl ? (
            <>
              <button
                type="button"
                className="camera-btn-retake"
                onClick={handleRetake}
                data-testid="camera-retake-btn"
              >
                <RefreshCw size={15} />
                <span>{t("identity.retake", "Retake")}</span>
              </button>
              <button
                type="button"
                className="camera-btn-confirm"
                onClick={handleConfirm}
                data-testid="camera-confirm-btn"
              >
                <Check size={16} />
                <span>{t("identity.use_photo", "Use Photo")}</span>
              </button>
            </>
          ) : !cameraError ? (
            <>
              <button
                type="button"
                className="camera-btn-cancel"
                onClick={onClose}
              >
                {t("action.cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="camera-snap-trigger"
                onClick={handleSnap}
                disabled={loadingCamera}
                data-testid="camera-snap-btn"
                title={t("identity.capture_snap", "Capture Photo")}
              >
                <div className="camera-snap-inner" />
              </button>
              <button
                type="button"
                className="camera-file-alt-btn"
                onClick={() => fileFallbackRef.current?.click()}
                title="Upload from device instead"
              >
                <Upload size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="camera-btn-cancel"
              onClick={onClose}
            >
              {t("action.close", "Close")}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
