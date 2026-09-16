const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "Metro Motors request failed");
  return payload;
}

export const saveDealWorkflow = (payload) => request("/workflow/deals", { method: "POST", body: JSON.stringify(payload) });
export const getDealWorkspace = (dealId) => request(`/deals/${dealId}/workspace`);
export const listBills = () => request("/bills");
export const updateBill = (billId, payload) => request(`/bills/${billId}`, { method: "PUT", body: JSON.stringify(payload) });
export const generateBill = (dealId, billType) => request(`/deals/${dealId}/bills/generate`, { method: "POST", body: JSON.stringify({ bill_type: billType }) });
export const getFinances = () => request("/finances/summary");
export const createDocument = (payload) => request("/documents", { method: "POST", body: JSON.stringify(payload) });
export const updateDocument = (documentId, payload) => request(`/documents/${documentId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteDocument = (documentId) => request(`/documents/${documentId}`, { method: "DELETE" });

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}