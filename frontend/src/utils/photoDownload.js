/**
 * Utility to download uploaded or previewed photos/documents directly to the user's device.
 * Handles Blob, File, data URL (Base64/SVG), object URLs, and remote URLs.
 */

export function downloadPhoto(photo, fallbackLabel = "metro-motors-photo") {
  if (!photo) return;

  // 1. Sanitize fallback label for use as a file name
  const sanitizedLabel = String(fallbackLabel || "photo")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();

  // 2. Determine file extension based on type or existing filename
  let filename = photo.name || "";
  let ext = "";

  if (photo.type?.includes("png")) ext = "png";
  else if (photo.type?.includes("svg")) ext = "svg";
  else if (photo.type?.includes("webp")) ext = "webp";
  else if (photo.type?.includes("jpeg") || photo.type?.includes("jpg")) ext = "jpg";

  if (!filename) {
    filename = `${sanitizedLabel}${ext ? `.${ext}` : ".jpg"}`;
  } else if (!filename.includes(".")) {
    filename = `${filename}${ext ? `.${ext}` : ".jpg"}`;
  }

  // 3. Trigger download via <a> anchor tag helper
  const triggerAnchor = (href, name) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Case A: photo contains a File or Blob object
  if (photo.blob instanceof Blob) {
    const blobUrl = URL.createObjectURL(photo.blob);
    triggerAnchor(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return;
  }

  // Case B: photo is a Blob itself
  if (photo instanceof Blob) {
    const blobUrl = URL.createObjectURL(photo);
    triggerAnchor(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return;
  }

  // Case C: photo has a URL (or photo is string URL)
  const url = typeof photo === "string" ? photo : photo.url;
  if (url) {
    // Data URLs or already generated blob URLs can be downloaded directly
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      triggerAnchor(url, filename);
      return;
    }

    // Remote or local server URLs: fetch as blob to enforce download
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        triggerAnchor(blobUrl, filename);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      })
      .catch(() => {
        // Fallback: open/download directly
        triggerAnchor(url, filename);
      });
  }
}
