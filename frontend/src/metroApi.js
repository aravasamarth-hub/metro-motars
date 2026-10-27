const API = `${process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8001"}/api`;

const TOKEN_KEY = "metro_auth_token";

export function getAuthToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAuthToken(token, persist = false) {
  try {
    if (persist) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    /* Storage quota exceeded or disabled in private browsing */
  }
}

export function clearAuthToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Ignore storage cleanup errors */
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail || `Metro Motors request failed (${response.status})`);
    error.status = response.status;
    error.detail = payload.detail;
    throw error;
  }
  return payload;
}

export const saveDealWorkflow = (payload) => request("/workflow/deals", { method: "POST", body: JSON.stringify(payload) });
export const getDealWorkspace = (dealId) => request(`/deals/${dealId}/workspace`);
export const listBills = () => request("/bills");
export const updateBill = (billId, payload) => request(`/bills/${billId}`, { method: "PUT", body: JSON.stringify(payload) });
export const generateBill = (dealId, billType) => request(`/deals/${dealId}/bills/generate`, { method: "POST", body: JSON.stringify({ bill_type: billType }) });
export const getFinances = () => request("/finances/summary");
export const listDealsOverview = () => request("/overview/deals");
export const getDashboard = () => request("/overview/dashboard");
export const deleteDeal = (dealId) => request(`/deals/${dealId}?cascade=true`, { method: "DELETE" });
export const getBillDocument = (billId) => request(`/bills/${billId}/document`);
export const createDocument = (payload) => request("/documents", { method: "POST", body: JSON.stringify(payload) });
export const updateDocument = (documentId, payload) => request(`/documents/${documentId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteDocument = (documentId) => request(`/documents/${documentId}`, { method: "DELETE" });

export const authRegister = (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
export const authLogin = (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
export const authGoogle = (payload) => request("/auth/google", { method: "POST", body: JSON.stringify(payload) });
export const authForgotPassword = (payload) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) });
export const authVerifyOtp = (payload) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify(payload) });
export const authResetPassword = (payload) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) });
export const authLogout = () => request("/auth/logout", { method: "POST" });
export const authGetMe = () => request("/auth/me");
export const authHealth = () => request("/auth/health");
export const authSetPassword = (payload) => request("/auth/set-password", { method: "POST", body: JSON.stringify(payload) });
export const authSendOtp = (payload) => request("/auth/send-otp", { method: "POST", body: JSON.stringify(payload) });

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}