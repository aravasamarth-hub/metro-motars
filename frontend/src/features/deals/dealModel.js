export const STEPS = ["Vehicle", "Seller", "Maintenance", "Buyer", "Agent", "Payments", "Notes & Save"];
export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const money = value => value === "" || value == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
export const displayDate = (value, lang = "en") => {
  if (!value) return "—";
  const locale = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
  return new Date(value.includes("T") ? value : `${value}T12:00:00`).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
};
export const DEFAULT_MAINTENANCE_SERVICES = [
  { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: false },
  { id: "fluids", name: "Fluid Top-ups & Flushes", price: "400", enabled: false },
  { id: "filters", name: "Filter Replacements", price: "350", enabled: false },
  { id: "spark_plug", name: "Spark Plug Replacement", price: "250", enabled: false },
  { id: "belts_hoses", name: "Belts and Hoses Inspection", price: "200", enabled: false },
  { id: "tires", name: "Tire Repair & Replacement", price: "2200", enabled: false },
  { id: "brakes", name: "Brake Pad & Shoe Replacement", price: "650", enabled: false },
  { id: "battery", name: "Battery Testing & Replacement", price: "1500", enabled: false },
  { id: "chain_sprocket", name: "Chain Sprocket & Drive Line Lubrication", price: "800", enabled: false },
  { id: "carburetor_fi", name: "Carburetor / Fuel Injection Cleaning", price: "500", enabled: false },
  { id: "suspension_fork", name: "Suspension & Fork Oil Overhaul", price: "950", enabled: false },
  { id: "electrical_wiring", name: "Electrical & Lighting Service", price: "300", enabled: false },
  { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: false },
];

export const calculateMaintenanceTotal = (maintenance) => {
  if (!maintenance || !Array.isArray(maintenance.services)) return 0;
  return maintenance.services
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
};

export const commission = (payments, maintenanceCost = 0) =>
  payments.purchase_price === "" || payments.selling_price === ""
    ? null
    : Math.round(
        (Number(payments.selling_price) -
          Number(payments.purchase_price) -
          Number(maintenanceCost || 0)) *
          100
      ) / 100;

export const grossCommission = (payments) =>
  payments.purchase_price === "" || payments.selling_price === ""
    ? null
    : Math.round(
        (Number(payments.selling_price) - Number(payments.purchase_price)) * 100
      ) / 100;

const person = () => ({ name: "", phone: "", alternate_phone: "", father_name: "", email: "", address: "", city: "", state: "Karnataka", pincode: "", id_type: "Aadhaar", id_number: "", pan_number: "", is_dealer: false, dealer_name: "", gst_number: "", dealer_address: "" });
export function emptyDeal() {
  return { schema_version: 1, id: null, bill_number: "", status: "In Stock", rc_status: "Pending",
    vehicle: { vehicle_name: "", make: "", model: "", mfg_month: "", year: "", color: "", vehicle_number: "", registration_number: "", registration_date: "", engine_number: "", chassis_number: "", engine_cc: "", fuel_type: "Petrol", transmission: "Manual", odometer: "", ownership: "First Owner", condition: "Good", bought_date: localDay(), sold_date: "", tax: "Paid", tax_valid_until: "", fitness: "Valid", fitness_valid_until: "", insurance: "Active", insurance_policy: "", insurance_valid_until: "", puc_valid_until: "", hypothecation: "No", financier: "", noc: "Not Required", keys: "2", service_history: "" },
    seller: person(), buyer: person(), witnesses: [person(), person()],
    payments: { purchase_price: "", selling_price: "", paid_to_seller: "", received_from_buyer: "", payment_method: "Cash", payment_date: localDay(), transaction_reference: "", notes: "" },
    agent: { name: "", phone: "", email: "", task: "", total_amount: "", amount_paid: "", amount_balance: "" },
    maintenance: { services: DEFAULT_MAINTENANCE_SERVICES, total_expense: "0", notes: "" },
    photos: {}, notes: "", created_at: null, updated_at: null };
}
export function validateStep(deal, step) {
  const errors = {};
  const required = (key, value, label) => { if (!String(value ?? "").trim()) errors[key] = `${label} is required.`; };
  if (step === 0) {
    required("vehicle.vehicle_name", deal.vehicle.vehicle_name, "Vehicle name");
    if (deal.vehicle.year && (!/^\d{4}$/.test(String(deal.vehicle.year).trim()) || +deal.vehicle.year < 1900 || +deal.vehicle.year > new Date().getFullYear() + 1)) errors["vehicle.year"] = "Enter a valid four-digit year.";
    ["engine_cc", "odometer"].forEach(key => { if (deal.vehicle[key] !== "" && (!Number.isFinite(+deal.vehicle[key]) || +deal.vehicle[key] < 0)) errors[`vehicle.${key}`] = "Enter a non-negative number."; });
    if (deal.vehicle.sold_date && deal.vehicle.bought_date && deal.vehicle.sold_date < deal.vehicle.bought_date) errors["vehicle.sold_date"] = "Sold date cannot be before bought date.";
  }
  if (step === 1) {
    const people = [
      ["seller", deal.seller],
      ["witnesses.0", deal.witnesses[0]],
    ];
    people.forEach(([prefix, p]) => {
      if (!p) return;
      ["phone", "alternate_phone"].forEach(key => { if (p[key] && !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(p[key].replace(/[\s-]/g, ""))) errors[`${prefix}.${key}`] = "Enter a valid 10-digit Indian mobile number."; });
      if (p.pincode && !/^[1-9]\d{5}$/.test(p.pincode)) errors[`${prefix}.pincode`] = "Enter a six-digit PIN code.";
      if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors[`${prefix}.email`] = "Enter a valid email address.";
    });
  }
  if (step === 2) {
    const m = deal.maintenance || {};
    if (Array.isArray(m.services)) {
      m.services.forEach(s => {
        if (s.price !== "" && s.price != null && (!Number.isFinite(+s.price) || +s.price < 0 || +s.price > 999999999)) {
          errors[`maintenance.${s.id}`] = "Enter a valid amount.";
        }
      });
    }
  }
  if (step === 3) {
    const people = [
      ["buyer", deal.buyer],
      ["witnesses.1", deal.witnesses[1]],
    ];
    people.forEach(([prefix, p]) => {
      if (!p) return;
      ["phone", "alternate_phone"].forEach(key => { if (p[key] && !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(p[key].replace(/[\s-]/g, ""))) errors[`${prefix}.${key}`] = "Enter a valid 10-digit Indian mobile number."; });
      if (p.pincode && !/^[1-9]\d{5}$/.test(p.pincode)) errors[`${prefix}.pincode`] = "Enter a six-digit PIN code.";
      if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors[`${prefix}.email`] = "Enter a valid email address.";
    });
  }
  if (step === 4) {
    const a = deal.agent || {};
    if (a.phone && !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(a.phone.replace(/[\s-]/g, ""))) errors["agent.phone"] = "Enter a valid 10-digit Indian mobile number.";
    if (a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) errors["agent.email"] = "Enter a valid email address.";
    ["total_amount", "amount_paid", "amount_balance"].forEach(key => {
      const val = a[key];
      if (val !== "" && val != null && (!Number.isFinite(+val) || +val < 0 || +val > 999999999)) errors[`agent.${key}`] = "Enter a valid amount.";
    });
  }
  if (step === 5) {
    ["purchase_price", "selling_price", "paid_to_seller", "received_from_buyer"].forEach(key => {
      const value = deal.payments[key];
      if (value !== "" && (!Number.isFinite(+value) || +value < 0 || +value > 999999999)) errors[`payments.${key}`] = "Enter an amount between 0 and 999,999,999.";
    });
    if (deal.payments.purchase_price !== "" && +deal.payments.paid_to_seller > +deal.payments.purchase_price) errors["payments.paid_to_seller"] = "Cannot exceed the purchase price.";
    if (deal.payments.selling_price !== "" && +deal.payments.received_from_buyer > +deal.payments.selling_price) errors["payments.received_from_buyer"] = "Cannot exceed the selling price.";
  }
  return errors;
}
export function getStepStatus(deal, step) {
  if (!deal) return "empty";
  const photos = deal.photos || {};

  if (step === 0) {
    const v = deal.vehicle || {};
    const hasPhotos = Object.keys(photos).some(k => k.startsWith("vehicle") && photos[k]);
    const hasData = Boolean(
      v.vehicle_name?.trim() ||
      v.vehicle_number?.trim() ||
      v.make?.trim() ||
      v.model?.trim() ||
      v.mfg_month?.trim() ||
      (v.year && String(v.year).trim()) ||
      v.color?.trim() ||
      v.registration_number?.trim() ||
      v.registration_date?.trim() ||
      v.engine_number?.trim() ||
      v.chassis_number?.trim() ||
      (v.engine_cc !== "" && v.engine_cc != null) ||
      (v.odometer !== "" && v.odometer != null) ||
      v.sold_date?.trim() ||
      v.service_history?.trim() ||
      hasPhotos
    );
    if (!hasData) return "empty";
    const isComplete = Boolean(v.vehicle_name && v.vehicle_name.trim()) && Object.keys(validateStep(deal, 0)).length === 0;
    return isComplete ? "complete" : "partial";
  }

  if (step === 1) {
    const s = deal.seller || {};
    const hasPhotos = Object.keys(photos).some(k => k.startsWith("seller") && photos[k]);
    const hasData = Boolean(
      s.name?.trim() ||
      s.phone?.trim() ||
      s.alternate_phone?.trim() ||
      s.father_name?.trim() ||
      s.email?.trim() ||
      s.address?.trim() ||
      s.city?.trim() ||
      s.pincode?.trim() ||
      s.id_number?.trim() ||
      s.pan_number?.trim() ||
      s.dealer_name?.trim() ||
      s.gst_number?.trim() ||
      s.dealer_address?.trim() ||
      s.is_dealer ||
      hasPhotos
    );
    if (!hasData) return "empty";
    const hasName = Boolean(
      (s.name && s.name.trim()) ||
      (s.is_dealer && s.dealer_name && s.dealer_name.trim())
    );
    const hasPhone = Boolean(s.phone && s.phone.trim());
    const isComplete = hasName && hasPhone && Object.keys(validateStep(deal, 1)).length === 0;
    return isComplete ? "complete" : "partial";
  }

  if (step === 2) {
    const m = deal.maintenance || {};
    const hasData = Boolean(
      (m.services && m.services.some(s => s.enabled || Number(s.price) > 0)) ||
      m.notes?.trim()
    );
    if (!hasData) return "empty";
    return Object.keys(validateStep(deal, 2)).length === 0 ? "complete" : "partial";
  }

  if (step === 3) {
    const b = deal.buyer || {};
    const hasPhotos = Object.keys(photos).some(k => k.startsWith("buyer") && photos[k]);
    const hasData = Boolean(
      b.name?.trim() ||
      b.phone?.trim() ||
      b.alternate_phone?.trim() ||
      b.father_name?.trim() ||
      b.email?.trim() ||
      b.address?.trim() ||
      b.city?.trim() ||
      b.pincode?.trim() ||
      b.id_number?.trim() ||
      b.pan_number?.trim() ||
      b.dealer_name?.trim() ||
      b.gst_number?.trim() ||
      b.dealer_address?.trim() ||
      b.is_dealer ||
      hasPhotos
    );
    if (!hasData) return "empty";
    const hasName = Boolean(
      (b.name && b.name.trim()) ||
      (b.is_dealer && b.dealer_name && b.dealer_name.trim())
    );
    const hasPhone = Boolean(b.phone && b.phone.trim());
    const isComplete = hasName && hasPhone && Object.keys(validateStep(deal, 3)).length === 0;
    return isComplete ? "complete" : "partial";
  }

  if (step === 4) {
    const a = deal.agent || {};
    const hasData = Boolean(
      a.name?.trim() ||
      a.phone?.trim() ||
      a.email?.trim() ||
      a.task?.trim() ||
      (a.total_amount !== "" && a.total_amount != null) ||
      (a.amount_paid !== "" && a.amount_paid != null) ||
      (a.amount_balance !== "" && a.amount_balance != null)
    );
    if (!hasData) return "empty";
    const hasName = Boolean(a.name && a.name.trim());
    const hasPhone = Boolean(a.phone && a.phone.trim());
    const isComplete = hasName && hasPhone && Object.keys(validateStep(deal, 4)).length === 0;
    return isComplete ? "complete" : "partial";
  }

  if (step === 5) {
    const p = deal.payments || {};
    const hasData = Boolean(
      (p.purchase_price !== "" && p.purchase_price != null) ||
      (p.selling_price !== "" && p.selling_price != null) ||
      (p.paid_to_seller !== "" && p.paid_to_seller != null) ||
      (p.received_from_buyer !== "" && p.received_from_buyer != null) ||
      p.transaction_reference?.trim() ||
      p.notes?.trim()
    );
    if (!hasData) return "empty";
    const hasPurchase = p.purchase_price !== "" && p.purchase_price != null && !isNaN(Number(p.purchase_price));
    const hasSelling = p.selling_price !== "" && p.selling_price != null && !isNaN(Number(p.selling_price));
    const isComplete = hasPurchase && hasSelling && Object.keys(validateStep(deal, 5)).length === 0;
    return isComplete ? "complete" : "partial";
  }

  if (step === 6) {
    const hasNotes = Boolean(deal.notes?.trim());
    const allPrevComplete =
      getStepStatus(deal, 0) === "complete" &&
      getStepStatus(deal, 1) === "complete" &&
      (getStepStatus(deal, 2) === "complete" || getStepStatus(deal, 2) === "empty") &&
      getStepStatus(deal, 3) === "complete" &&
      (getStepStatus(deal, 4) === "complete" || getStepStatus(deal, 4) === "empty") &&
      getStepStatus(deal, 5) === "complete";
    if (allPrevComplete) return "complete";
    if (hasNotes) return "partial";
    return "empty";
  }

  return "empty";
}

export function isStepFilled(deal, step) {
  return getStepStatus(deal, step) === "complete";
}

export function areVehicleAndSellerComplete(deal) {
  if (!deal) return false;
  const v = deal.vehicle || {};
  const s = deal.seller || {};

  // Vehicle must have vehicle_name and vehicle_number or registration_number
  const hasVehicleName = Boolean(v.vehicle_name && v.vehicle_name.trim());
  const hasVehicleNumber = Boolean((v.vehicle_number && v.vehicle_number.trim()) || (v.registration_number && v.registration_number.trim()));
  const isVehicleComplete = hasVehicleName && hasVehicleNumber;

  // Seller must have name (or dealer_name) and phone
  const hasSellerName = Boolean((s.name && s.name.trim()) || (s.is_dealer && s.dealer_name && s.dealer_name.trim()));
  const hasSellerPhone = Boolean(s.phone && s.phone.trim());
  const isSellerComplete = hasSellerName && hasSellerPhone;

  return isVehicleComplete && isSellerComplete;
}

export const validateDeal = deal => STEPS.flatMap((_, step) => Object.entries(validateStep(deal, step)).map(([field, message]) => ({ field, message, step })));