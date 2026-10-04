import { useEffect, useRef, useState, useCallback } from "react";
import { Check, Edit3, Eraser, RotateCcw, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/features/i18n/LanguageContext";

const PEN_COLORS = [
  { id: "blue", label: "Blue Ink", value: "#1d4ed8" },
  { id: "black", label: "Black Ink", value: "#0f172a" },
  { id: "navy", label: "Navy Ink", value: "#1e293b" },
];

const PEN_WIDTHS = [
  { id: "fine", label: "Fine", value: 2 },
  { id: "medium", label: "Medium", value: 3.5 },
  { id: "bold", label: "Bold", value: 5.5 },
];

export function SignaturePadModal({
  isOpen,
  onClose,
  onSave,
  title = "Draw Signature",
  initialColor = "#1d4ed8",
}) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [penColor, setPenColor] = useState(initialColor);
  const [penWidth, setPenWidth] = useState(3.5);

  const hasContent = strokes.length > 0 || !!currentStroke;

  // Redraw canvas from strokes
  const drawOnCanvas = (strokesList, activeStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw baseline guide
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const baselineY = height * 0.78;

    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, baselineY);
    ctx.lineTo(width - 30, baselineY);
    ctx.stroke();

    // Baseline "X" indicator
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("✕", 15, baselineY + 5);
    ctx.restore();

    // Redraw all strokes
    const allStrokes = activeStroke ? [...strokesList, activeStroke] : strokesList;
    for (const stroke of allStrokes) {
      if (!stroke.points || stroke.points.length === 0) continue;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          const p1 = stroke.points[i - 1];
          const p2 = stroke.points[i];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  // Canvas size setup on open
  useEffect(() => {
    if (!isOpen) {
      setStrokes([]);
      setCurrentStroke(null);
      return;
    }

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawOnCanvas([], null);
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Redraw when strokes change
  useEffect(() => {
    if (isOpen) {
      drawOnCanvas(strokes, currentStroke);
    }
  }, [strokes, currentStroke, isOpen]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pt = getCanvasCoords(e);
    setCurrentStroke({
      color: penColor,
      width: penWidth,
      points: [pt],
    });
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, pt],
      };
    });
  };

  const handlePointerUp = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    isDrawing.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setHasContent(false);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    // Calculate bounding box of drawn strokes to trim excess whitespace
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const stroke of strokes) {
      for (const pt of stroke.points) {
        minX = Math.min(minX, pt.x);
        minY = Math.min(minY, pt.y);
        maxX = Math.max(maxX, pt.x);
        maxY = Math.max(maxY, pt.y);
      }
    }

    const padding = 16;
    const cropX = Math.max(0, (minX - padding) * dpr);
    const cropY = Math.max(0, (minY - padding) * dpr);
    const cropW = Math.min(canvas.width - cropX, (maxX - minX + padding * 2) * dpr);
    const cropH = Math.min(canvas.height - cropY, (maxY - minY + padding * 2) * dpr);

    if (cropW <= 0 || cropH <= 0) return;

    // Create trimmed canvas
    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = cropW;
    trimmedCanvas.height = cropH;
    const tCtx = trimmedCanvas.getContext("2d");

    // Redraw only strokes without background/dashed guide on transparent canvas
    tCtx.save();
    tCtx.translate(-cropX, -cropY);

    for (const stroke of strokes) {
      if (!stroke.points || stroke.points.length === 0) continue;
      tCtx.save();
      tCtx.strokeStyle = stroke.color;
      tCtx.lineWidth = stroke.width * dpr;
      tCtx.lineCap = "round";
      tCtx.lineJoin = "round";

      tCtx.beginPath();
      if (stroke.points.length === 1) {
        tCtx.arc(stroke.points[0].x * dpr, stroke.points[0].y * dpr, (stroke.width * dpr) / 2, 0, Math.PI * 2);
        tCtx.fillStyle = stroke.color;
        tCtx.fill();
      } else {
        tCtx.moveTo(stroke.points[0].x * dpr, stroke.points[0].y * dpr);
        for (let i = 1; i < stroke.points.length; i++) {
          const p1 = stroke.points[i - 1];
          const p2 = stroke.points[i];
          const midX = ((p1.x + p2.x) / 2) * dpr;
          const midY = ((p1.y + p2.y) / 2) * dpr;
          tCtx.quadraticCurveTo(p1.x * dpr, p1.y * dpr, midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        tCtx.lineTo(last.x * dpr, last.y * dpr);
        tCtx.stroke();
      }
      tCtx.restore();
    }
    tCtx.restore();

    trimmedCanvas.toBlob((blob) => {
      if (!blob) return;
      const photoObj = {
        name: `signature-${Date.now()}.png`,
        type: "image/png",
        size: blob.size,
        blob: blob,
      };
      onClose();
      setTimeout(() => {
        onSave(photoObj);
      }, 0);
    }, "image/png");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="signature-pad-dialog" data-testid="signature-pad-dialog">
        <DialogTitle className="signature-dialog-title">
          <Edit3 size={18} className="text-amber-500" />
          <span>{title}</span>
        </DialogTitle>
        <DialogDescription className="signature-dialog-desc">
          {t("identity.sign_hint", "Sign inside the box using your finger, stylus, or mouse.")}
        </DialogDescription>

        {/* Drawing canvas container */}
        <div className="signature-canvas-wrapper" data-testid="signature-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            data-testid="signature-drawing-canvas"
          />
        </div>

        {/* Toolbar: Color picker, stroke width, undo, clear */}
        <div className="signature-toolbar">
          <div className="signature-tool-group">
            <span className="signature-tool-label">{t("identity.pen_color", "Ink")}:</span>
            <div className="signature-color-options">
              {PEN_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={`signature-color-btn ${penColor === col.value ? "active" : ""}`}
                  style={{ backgroundColor: col.value }}
                  onClick={() => setPenColor(col.value)}
                  title={col.label}
                  aria-label={col.label}
                />
              ))}
            </div>
          </div>

          <div className="signature-tool-group">
            <span className="signature-tool-label">{t("identity.pen_size", "Size")}:</span>
            <div className="signature-width-options">
              {PEN_WIDTHS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`signature-width-btn ${penWidth === w.value ? "active" : ""}`}
                  onClick={() => setPenWidth(w.value)}
                  title={w.label}
                >
                  <span
                    className="signature-width-dot"
                    style={{ width: `${w.value * 2}px`, height: `${w.value * 2}px` }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="signature-tool-actions">
            <button
              type="button"
              className="signature-aux-btn"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              title={t("identity.undo", "Undo last stroke")}
              data-testid="signature-undo-btn"
            >
              <RotateCcw size={14} />
              <span>{t("identity.undo", "Undo")}</span>
            </button>
            <button
              type="button"
              className="signature-aux-btn"
              onClick={handleClear}
              disabled={!hasContent}
              title={t("identity.clear_signature", "Clear canvas")}
              data-testid="signature-clear-btn"
            >
              <Eraser size={14} />
              <span>{t("identity.clear_signature", "Clear")}</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="signature-dialog-footer">
          <button
            type="button"
            className="signature-btn-cancel"
            onClick={onClose}
            data-testid="signature-cancel-btn"
          >
            {t("action.cancel", "Cancel")}
          </button>
          <button
            type="button"
            className="signature-btn-save"
            onClick={handleSave}
            disabled={!hasContent}
            data-testid="signature-save-btn"
          >
            <Check size={16} />
            <span>{t("identity.save_signature", "Save Signature")}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
