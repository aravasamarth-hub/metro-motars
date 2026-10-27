/**
 * Customer Enquiry & Contact Service for Metro Motors Public Marketplace
 */

// Business Contact Configuration: Reads environment variables or falls back to standard demo values
const env = (typeof process !== "undefined" && process.env) || {};

export const SHOWROOM_CONTACT = {
  name: env.REACT_APP_SHOWROOM_NAME || "Metro Motors Showroom",
  address: env.REACT_APP_SHOWROOM_ADDRESS || "100ft Road, Indiranagar, Bengaluru, Karnataka 560038",
  phone: env.REACT_APP_SHOWROOM_PHONE || "+91 98800 12345",
  rawPhone: env.REACT_APP_SHOWROOM_RAW_PHONE || "919880012345",
  email: env.REACT_APP_SHOWROOM_EMAIL || "sales@metromotors.in",
  businessHours: env.REACT_APP_SHOWROOM_HOURS || "Mon – Sun: 9:30 AM – 8:30 PM",
  isConfigured: Boolean(env.REACT_APP_SHOWROOM_PHONE),
};

/**
 * Builds pre-filled WhatsApp enquiry link for a specific vehicle.
 */
export function getWhatsAppEnquiryUrl(vehicle) {
  const message = vehicle
    ? `Hello Metro Motors, I am interested in purchasing the ${vehicle.year} ${vehicle.title} (Price: ₹${vehicle.sellingPrice.toLocaleString("en-IN")}, Ref: ${vehicle.id}). Is this motorcycle currently available for inspection and test drive?`
    : `Hello Metro Motors, I would like to enquire about your available pre-owned motorcycle inventory.`;

  return `https://wa.me/${SHOWROOM_CONTACT.rawPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Validates customer enquiry form fields.
 */
export function validateEnquiryForm(form) {
  const errors = {};
  if (!form.name || form.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  const cleanPhone = (form.phone || "").replace(/[\s-+]/g, "");
  if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  }
  return errors;
}

const API_BASE = env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8001";

/**
 * Submits a customer purchase enquiry to the server with graceful offline/local fallback.
 */
export async function submitPurchaseEnquiry(enquiry) {
  const validation = validateEnquiryForm(enquiry);
  if (Object.keys(validation).length > 0) {
    const firstKey = Object.keys(validation)[0];
    throw new Error(validation[firstKey]);
  }

  const cleanPhone = (enquiry.phone || "").replace(/[\s-+]/g, "");

  const payload = {
    name: enquiry.name.trim(),
    phone: cleanPhone,
    preferred_method: enquiry.preferredMethod || "WhatsApp",
    vehicle_id: String(enquiry.vehicleId || "inquiry"),
    vehicle_title: String(enquiry.vehicleTitle || "Motorcycle"),
    message: String(enquiry.message || "").slice(0, 500),
  };

  // Attempt server-side delivery
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE}/api/public/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 201) {
      const data = await response.json();
      
      // Store local copy for customer convenience
      try {
        const existing = JSON.parse(localStorage.getItem("metro_customer_enquiries") || "[]");
        existing.unshift({ ...payload, id: data.enquiry_id, createdAt: new Date().toISOString(), serverStatus: "Delivered" });
        localStorage.setItem("metro_customer_enquiries", JSON.stringify(existing));
      } catch {
        // Storage quota exceeded or private browsing restricted; safe to ignore
      }

      return {
        success: true,
        isServerDelivered: true,
        isLocalOnly: false,
        enquiryId: data.enquiry_id,
        message: data.message || "Your purchase enquiry has been registered with our showroom team.",
      };
    } else if (response.status === 429) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Too many enquiry requests. Please wait a few moments or contact our showroom directly.");
    } else if (response.status === 422) {
      const errData = await response.json().catch(() => ({}));
      const detail = Array.isArray(errData.detail) ? errData.detail[0]?.msg : errData.detail;
      throw new Error(detail || "Invalid enquiry details. Please check your phone number and name.");
    }
  } catch (err) {
    // If it's a validation or rate-limiting error thrown above, rethrow
    if (err.message && (err.message.includes("Too many") || err.message.includes("Invalid enquiry") || err.message.includes("valid 10-digit"))) {
      throw err;
    }
    // Network failure / offline server -> fallback to local demo logging
    console.warn("Backend enquiry service unavailable; storing locally in demo session:", err.message);
  }

  // Fallback: local session storage
  const fallbackRecord = {
    id: `enquiry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...enquiry,
    createdAt: new Date().toISOString(),
    status: "Demo Lead (Offline)",
  };

  try {
    const existing = JSON.parse(localStorage.getItem("metro_customer_enquiries") || "[]");
    existing.unshift(fallbackRecord);
    localStorage.setItem("metro_customer_enquiries", JSON.stringify(existing));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("metro-new-enquiry", { detail: fallbackRecord }));
    }
  } catch (err) {
    console.error("Failed to store fallback enquiry:", err);
  }

  return {
    success: true,
    isServerDelivered: false,
    isLocalOnly: true,
    isFallback: true,
    enquiryId: fallbackRecord.id,
    message: "Enquiry saved in offline demo session. Note: The live showroom server is currently offline. Please tap WhatsApp or Call to finalize directly.",
  };
}
