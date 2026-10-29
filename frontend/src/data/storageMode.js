/**
 * Storage Mode Configuration for Metro Motors
 *
 * Explicitly manages whether the frontend operates in:
 * - "local": IndexedDB browser-local storage (metro-motors-app-v1). Perfect for demos, offline use, and zero-setup testing.
 * - "remote": Authenticated FastAPI backend + MongoDB centralized persistence.
 *
 * CRITICAL RULE: Storage mode transitions must be explicit.
 * Remote API failures must NEVER silently fall back to local storage,
 * as this causes silent data divergence and lost writes.
 */

export const STORAGE_MODES = {
  LOCAL: "local",
  REMOTE: "remote",
};

const STORAGE_MODE_KEY = "metro_motors_storage_mode";
const EVENT_NAME = "metro-storage-mode-changed";

/**
 * Returns the currently active storage mode ("local" | "remote").
 * Defaults to "local" unless explicitly overridden in localStorage or env.
 */
export function getStorageMode() {
  try {
    const saved = localStorage.getItem(STORAGE_MODE_KEY);
    if (saved === STORAGE_MODES.REMOTE || saved === STORAGE_MODES.LOCAL) {
      return saved;
    }
  } catch {
    // LocalStorage unavailable
  }

  // Check optional environment variable default
  if (process.env.REACT_APP_DEFAULT_STORAGE_MODE === "remote") {
    return STORAGE_MODES.REMOTE;
  }

  return STORAGE_MODES.LOCAL;
}

/**
 * Explicitly switch the storage mode.
 * Dispatches 'metro-storage-mode-changed' event so components update immediately.
 */
export function setStorageMode(mode) {
  if (mode !== STORAGE_MODES.LOCAL && mode !== STORAGE_MODES.REMOTE) {
    throw new Error(`Invalid storage mode: "${mode}". Must be "local" or "remote".`);
  }
  try {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  } catch {
    // LocalStorage unavailable
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { mode } }));
  }
}

/**
 * Checks if remote storage backend is configured.
 */
export function isRemoteConfigured() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  return Boolean(backendUrl && backendUrl.trim().length > 0);
}

/**
 * Get human-readable diagnostic status for the UI.
 */
export function getStorageModeInfo() {
  const mode = getStorageMode();
  const configured = isRemoteConfigured();

  if (mode === STORAGE_MODES.REMOTE) {
    return {
      mode: STORAGE_MODES.REMOTE,
      label: "Remote Storage",
      badgeColor: "#3b82f6",
      isRemote: true,
      isConfigured: configured,
      description: configured
        ? "Connected to centralized Metro Motors server API"
        : "Remote mode selected, but backend URL is unconfigured",
    };
  }

  return {
    mode: STORAGE_MODES.LOCAL,
    label: "Local Demo Storage",
    badgeColor: "#10b981",
    isRemote: false,
    isConfigured: true,
    description: "Browser-isolated IndexedDB. Data is safely stored only on this device.",
  };
}
