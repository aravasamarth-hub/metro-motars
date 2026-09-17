import { useEffect, useRef, useState } from "react";
import { Camera, Eye, Replace, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { photoSlots } from "./fieldConfig";

export const PhotoPreview = ({ photo, alt, ...props }) => {
  const [url, setUrl] = useState(photo?.url || "");
  useEffect(() => {
    if (!photo?.blob) { setUrl(photo?.url || ""); return; }
    const objectUrl = URL.createObjectURL(photo.blob); setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);
  return url ? <img src={url} alt={alt} {...props}/> : null;
};
const PhotoSlot = ({ id, label, photo, onChange, readOnly }) => {
  const input = useRef(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
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
  return <div className={`photo-slot ${photo ? "has-photo" : ""}`} data-testid={`photo-slot-${id}`}>
    <button type="button" className="photo-slot-main" onClick={() => photo ? setPreview(true) : input.current?.click()} disabled={busy || (readOnly && !photo)} data-testid={`photo-open-${id}`} aria-label={photo ? `View ${label}` : `Add ${label}`}>
      {photo ? <PhotoPreview photo={photo} alt={label} data-testid={`photo-preview-${id}`}/> : <><Camera size={21}/><span>{busy ? "Opening…" : "Add photo"}</span></>}
      {photo && <span className="photo-zoom"><Eye size={15}/></span>}
    </button>
    <div className="photo-slot-caption"><span data-testid={`photo-label-${id}`}>{label}</span>{photo && !readOnly && <div>
      <button type="button" className="icon-button" onClick={() => input.current?.click()} title={`Replace ${label}`} aria-label={`Replace ${label}`} data-testid={`photo-replace-${id}`}><Replace size={14}/></button>
      <button type="button" className="icon-button" onClick={() => onChange(id, null)} title={`Remove ${label}`} aria-label={`Remove ${label}`} data-testid={`photo-remove-${id}`}><Trash2 size={14}/></button>
    </div>}</div>
    {!readOnly && <input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={choose} data-testid={`photo-input-${id}`}/>}
    {error && <small className="field-error" role="alert" data-testid={`photo-error-${id}`}>{error}</small>}
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="photo-dialog" data-testid={`photo-dialog-${id}`}><DialogTitle data-testid={`photo-title-${id}`}>{label}</DialogTitle><DialogDescription data-testid={`photo-filename-${id}`}>{photo?.name}</DialogDescription><PhotoPreview photo={photo} alt={label} data-testid={`photo-full-${id}`}/></DialogContent></Dialog>
  </div>;
};
export const PhotoSlots = ({ group, photos, onChange, readOnly = false }) => {
  const slots = photoSlots[group];
  const count = slots.filter((_, i) => photos[`${group}-${i + 1}`]).length;
  return <section className="wizard-group photo-group"><div className="section-title"><h2>{group.startsWith("witness") ? "Photo" : "Photos & documents"}</h2><span className="slot-count" data-testid={`${group}-photo-count`}>{count} / {slots.length} photos</span></div>
    <div className={`photo-slot-grid ${slots.length === 1 ? "single-photo" : ""}`}>{slots.map((label, i) => <PhotoSlot key={label} id={`${group}-${i + 1}`} label={label} photo={photos[`${group}-${i + 1}`]} onChange={onChange} readOnly={readOnly}/>)}</div>
  </section>;
};