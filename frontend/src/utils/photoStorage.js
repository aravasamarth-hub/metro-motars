/**
 * Photo Storage Provider Abstraction for Metro Motors
 *
 * Provides a uniform interface for vehicle and party photo operations:
 * - LocalIndexedDBPhotoProvider (ACTIVE): Stores images safely as Blobs in IndexedDB.
 * - CloudStoragePhotoProvider (UNCONFIGURED): Prepared interface for future S3/GCS/R2/Cloudinary.
 *
 * STRICT SAFETY RULE:
 * Never pretend images are uploaded to the cloud when cloud storage is unconfigured.
 */

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validates a photo file's size, MIME type, and decodability.
 */
export async function validatePhotoFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || "unknown"}). Choose a JPG, PNG, or WebP photo.`,
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Photo exceeds 10 MB limit (${sizeMb} MB). Please choose a smaller image.`,
    };
  }

  // Attempt real image bitmap decoding if available in browser
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
    } catch {
      return {
        valid: false,
        error: "Corrupt or unreadable image file. Please choose another photo.",
      };
    }
  }

  return { valid: true, error: null };
}

/**
 * Local IndexedDB Provider (Currently Active for Local Demo Mode)
 */
export class LocalIndexedDBPhotoProvider {
  name = "local_indexeddb";

  isConfigured() {
    return true;
  }

  async upload(file, metadata = {}) {
    const validation = await validatePhotoFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const storageKey = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      storageKey,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
      provider: this.name,
      uploadedAt: new Date().toISOString(),
      metadata,
    };
  }

  async delete(_storageKey) {
    // Handled in IndexedDB deal record update
    return true;
  }
}

/**
 * Cloud Storage Provider (Prepared for Future Integration)
 */
export class CloudStoragePhotoProvider {
  name = "cloud_storage";

  isConfigured() {
    // Cloud storage credentials are not yet configured in this deployment
    return false;
  }

  async upload(_file, _metadata = {}) {
    throw new Error(
      "Cloud photo storage provider is not configured. Central photo upload is disabled until credentials are provided."
    );
  }

  async delete(_storageKey) {
    throw new Error(
      "Cloud photo storage provider is not configured. Central photo deletion is disabled until credentials are provided."
    );
  }
}

// Active provider instance
export const localPhotoProvider = new LocalIndexedDBPhotoProvider();
export const cloudPhotoProvider = new CloudStoragePhotoProvider();

export function getActivePhotoProvider() {
  if (cloudPhotoProvider.isConfigured()) {
    return cloudPhotoProvider;
  }
  return localPhotoProvider;
}
