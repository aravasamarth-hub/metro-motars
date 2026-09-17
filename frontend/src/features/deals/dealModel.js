export const STEPS = ["Vehicle", "Seller", "Buyer", "Payments", "Notes & Save"];
export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const money = value => value === "" || value == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
export const displayDate = value => value ? new Date(value.includes("T") ? value : `${value}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const commission = payments => payments.purchase_price === "" || payments.selling_price === "" ? null : Math.round((Number(payments.selling_price) - Number(payments.purchase_price)) * 100) / 100;
const person = () => ({ name: "", phone: "", alternate_phone: "", father_name: "", email: "", address: "", city: "", state: "Karnataka", pincode: "", id_type: "Aadhaar", id_number: "", pan_number: "", is_dealer: false, dealer_name: "", gst_number: "", dealer_address: "" });
export function emptyDeal() {
  return { schema_version: 1, id: null, bill_number: "", status: "In Stock", rc_status: "Pending",
    vehicle: { vehicle_name: "", make: "", model: "", variant: "", year: "", color: "", vehicle_number: "", registration_number: "", registration_date: "", engine_number: "", chassis_number: "", engine_cc: "", fuel_type: "Petrol", transmission: "Manual", odometer: "", ownership: "First Owner", condition: "Good", bought_date: localDay(), sold_date: "", tax: "Paid", tax_valid_until: "", fitness: "Valid", fitness_valid_until: "", insurance: "Active", insurance_policy: "", insurance_valid_until: "", puc_valid_until: "", hypothecation: "No", financier: "", noc: "Not Required", keys: "2", service_history: "" },
    seller: person(), buyer: person(), witnesses: [person(), person()],
    payments: { purchase_price: "", selling_price: "", paid_to_seller: "", received_from_buyer: "", payment_method: "Cash", payment_date: localDay(), transaction_reference: "", notes: "" },
    photos: {}, notes: "", created_at: null, updated_at: null };
}
export function validateStep(deal, step) {
  const errors = {};
  const required = (key, value, label) => { if (!String(value ?? "").trim()) errors[key] = `${label} is required.`; };
  if (step === 0) {
    ["vehicle_name", "make", "model", "year", "vehicle_number", "bought_date"].forEach(key => required(`vehicle.${key}`, deal.vehicle[key], key.replaceAll("_", " ")));
    if (deal.vehicle.year && (!/^\d{4}$/.test(deal.vehicle.year) || +deal.vehicle.year < 1900 || +deal.vehicle.year > new Date().getFullYear() + 1)) errors["vehicle.year"] = "Enter a valid four-digit year.";
    ["engine_cc", "odometer"].forEach(key => { if (deal.vehicle[key] !== "" && (!Number.isFinite(+deal.vehicle[key]) || +deal.vehicle[key] < 0)) errors[`vehicle.${key}`] = "Enter a non-negative number."; });
    if (deal.status === "Sold") required("vehicle.sold_date", deal.vehicle.sold_date, "Sold date");
    if (deal.vehicle.sold_date && deal.vehicle.sold_date < deal.vehicle.bought_date) errors["vehicle.sold_date"] = "Sold date cannot be before bought date.";
  }
  if (step === 1 || step === 2) {
    const people = [
      [step === 1 ? "seller" : "buyer", step === 1 ? deal.seller : deal.buyer, step === 1 || deal.status === "Sold"],
      [`witnesses.${step - 1}`, deal.witnesses[step - 1], false],
    ];
    people.forEach(([prefix, p, needed]) => {
      const entered = needed || !!(p.name || p.phone || p.address || p.id_number || p.is_dealer);
      if (entered) { required(`${prefix}.name`, p.name, "Name"); required(`${prefix}.phone`, p.phone, "Phone"); }
      ["phone", "alternate_phone"].forEach(key => { if (p[key] && !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(p[key].replace(/[\s-]/g, ""))) errors[`${prefix}.${key}`] = "Enter a valid 10-digit Indian mobile number."; });
      if (p.pincode && !/^[1-9]\d{5}$/.test(p.pincode)) errors[`${prefix}.pincode`] = "Enter a six-digit PIN code.";
      if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors[`${prefix}.email`] = "Enter a valid email address.";
      if (p.is_dealer) required(`${prefix}.dealer_name`, p.dealer_name, "Dealership name");
    });
  }
  if (step === 3) {
    required("payments.purchase_price", deal.payments.purchase_price, "Purchase price");
    if (deal.status === "Sold") required("payments.selling_price", deal.payments.selling_price, "Selling price");
    ["purchase_price", "selling_price", "paid_to_seller", "received_from_buyer"].forEach(key => {
      const value = deal.payments[key];
      if (value !== "" && (!Number.isFinite(+value) || +value < 0 || +value > 999999999)) errors[`payments.${key}`] = "Enter an amount between 0 and 999,999,999.";
    });
    if (+deal.payments.paid_to_seller > +deal.payments.purchase_price) errors["payments.paid_to_seller"] = "Cannot exceed the purchase price.";
    if (+deal.payments.received_from_buyer > +deal.payments.selling_price) errors["payments.received_from_buyer"] = "Cannot exceed the selling price.";
  }
  return errors;
}
export const validateDeal = deal => STEPS.flatMap((_, step) => Object.entries(validateStep(deal, step)).map(([field, message]) => ({ field, message, step })));