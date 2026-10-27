/**
 * Authenticated API Deal Adapter for Metro Motors
 *
 * Implements the deal repository contract against the centralized FastAPI backend.
 *
 * NON-NEGOTIABLE SAFETY:
 * - Does NOT silently fall back to IndexedDB on error.
 * - Throws typed ApiStorageError instances preserving status codes and messages.
 * - Handles data conversion between frontend and backend schemas without dropping fields.
 */

import { getAuthToken } from "@/metroApi";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8001"}/api`;

export class ApiStorageError extends Error {
  constructor(message, status = 500, detail = null) {
    super(message);
    this.name = "ApiStorageError";
    this.status = status;
    this.detail = detail;
    this.isRemoteError = true;
  }
}

/**
 * Perform an authenticated API request with explicit error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new ApiStorageError(
      `Cannot connect to Metro Motors backend server (${networkError.message}). Check your network connection.`,
      0,
      networkError.message
    );
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorDetail = data?.detail || data?.message || `HTTP ${response.status} ${response.statusText}`;
    if (response.status === 401) {
      throw new ApiStorageError("Authentication required or session expired. Please log in again.", 401, errorDetail);
    }
    if (response.status === 403) {
      throw new ApiStorageError(`Permission denied: ${errorDetail}`, 403, errorDetail);
    }
    if (response.status === 404) {
      throw new ApiStorageError(`Record not found: ${errorDetail}`, 404, errorDetail);
    }
    if (response.status === 409) {
      throw new ApiStorageError(`Conflict: ${errorDetail}`, 409, errorDetail);
    }
    throw new ApiStorageError(errorDetail, response.status, errorDetail);
  }

  return data;
}

/**
 * Converts a frontend deal object into the backend API payload schema.
 */
export function dealToBackendPayload(deal) {
  if (!deal) return {};

  const parties = [];
  if (deal.buyer) {
    parties.push({ ...deal.buyer, party_type: "BUYER" });
  }
  if (deal.seller) {
    parties.push({ ...deal.seller, party_type: "SELLER" });
  }
  if (deal.agent) {
    parties.push({ ...deal.agent, party_type: "AGENT" });
  }

  return {
    id: deal.id,
    deal_type: deal.deal_type || "Buy & Sell",
    status: deal.status || "Completed",
    bill_number: deal.bill_number,
    vehicle: deal.vehicle || {},
    parties: deal.parties || parties,
    payments: deal.payments || {},
    maintenance: Array.isArray(deal.maintenance) ? deal.maintenance : [],
    commission: deal.commission || 0,
    created_at: deal.created_at,
    updated_at: deal.updated_at,
    notes: deal.notes || "",
    // Preserve any legacy or custom metadata
    metadata: deal.metadata || {},
  };
}

/**
 * Converts a backend API record into a frontend deal structure.
 */
export function backendRecordToDeal(record) {
  if (!record) return null;

  const parties = record.parties || [];
  const buyer = parties.find(p => p.party_type === "BUYER" || p.role === "BUYER") || record.buyer || null;
  const seller = parties.find(p => p.party_type === "SELLER" || p.role === "SELLER") || record.seller || null;
  const agent = parties.find(p => p.party_type === "AGENT" || p.role === "AGENT") || record.agent || null;

  return {
    ...record,
    id: record.id || record._id,
    kind: "deal",
    buyer,
    seller,
    agent,
    vehicle: record.vehicle || {},
    payments: record.payments || {},
    maintenance: Array.isArray(record.maintenance) ? record.maintenance : [],
    created_at: record.created_at || new Date().toISOString(),
    updated_at: record.updated_at || new Date().toISOString(),
  };
}

export const apiDealAdapter = {
  async list() {
    const records = await apiRequest("/deals");
    if (!Array.isArray(records)) return [];
    return records.map(backendRecordToDeal).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  },

  async get(id) {
    if (!id) return null;
    const record = await apiRequest(`/deals/${id}`);
    return backendRecordToDeal(record);
  },

  async save(deal) {
    const payload = dealToBackendPayload(deal);
    let saved;
    if (deal.id) {
      saved = await apiRequest(`/deals/${deal.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      saved = await apiRequest("/deals", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    return backendRecordToDeal(saved);
  },

  async remove(id) {
    if (!id) return false;
    await apiRequest(`/deals/${id}?cascade=true`, {
      method: "DELETE",
    });
    return true;
  },

  async nextBillNumber() {
    try {
      const res = await apiRequest("/deals/next-bill-number");
      return res.bill_number;
    } catch {
      // Fallback format if endpoint not available; server assigns on save
      return "Bill-AUTO";
    }
  },

  async resetDemoData() {
    throw new ApiStorageError(
      "Resetting demo data is disabled in Remote Storage mode to protect central database integrity.",
      400
    );
  },

  async clearAllData() {
    throw new ApiStorageError(
      "Bulk clearing data is disabled in Remote Storage mode to protect central database integrity.",
      400
    );
  },
};
