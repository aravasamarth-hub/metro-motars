import { useEffect, useRef, useState } from "react";
import { dealRepository } from "@/data/dealRepository";
import { emptyDeal, isStepFilled, localDay, STEPS, validateDeal, validateStep } from "./dealModel";

export const useDealWizard = (dealId, onSaved) => {
  const [deal, setDeal] = useState(emptyDeal);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(""); setDirty(false); setStep(0); setErrors({}); setMessage("");
    (async () => {
      try {
        const value = dealId ? await dealRepository.get(dealId) : { ...emptyDeal(), bill_number: await dealRepository.nextBillNumber() };
        if (!value) throw new Error("This deal is not saved in this browser.");
        if (active) setDeal(value);
      } catch (e) { if (active) setLoadError(e.message); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [dealId]);

  useEffect(() => { const warn = e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);

  const change = fn => { setDeal(fn); setDirty(true); setErrors({}); setMessage(""); };
  const update = (key, value) => change(current => ({ ...current, [key]: value }));
  const updateSection = (section, key, value) => change(current => ({ ...current, [section]: { ...current[section], [key]: value } }));
  const updateWitness = (index, key, value) => change(current => ({ ...current, witnesses: current.witnesses.map((p, i) => i === index ? { ...p, [key]: value } : p) }));
  const setPhoto = (key, value) => change(current => { const photos = { ...current.photos }; if (value) photos[key] = value; else delete photos[key]; return { ...current, photos }; });
  const showErrors = (newErrors, targetStep) => { setErrors(newErrors); setMessage("Please check the highlighted fields."); setStep(targetStep); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const fillDemoText = () => {
    change(current => ({
      ...current,
      status: "In Stock",
      rc_status: "Pending",
      vehicle: {
        vehicle_name: "Royal Enfield Hunter 350 Dapper Ash",
        make: "Royal Enfield",
        model: "Hunter 350",
        variant: "Dapper Series Dual-Channel ABS",
        year: "2023",
        color: "Dapper Ash",
        vehicle_number: "KA-05-MH-2024",
        registration_number: "KA05MH2024",
        registration_date: "2023-05-18",
        engine_number: "RE350H982145",
        chassis_number: "ME3J3S5H0PA991204",
        engine_cc: "349",
        fuel_type: "Petrol",
        transmission: "Manual",
        odometer: "7850",
        ownership: "First Owner",
        condition: "Excellent",
        bought_date: localDay(),
        sold_date: "",
        keys: "2",
        service_history: "Showroom serviced at Acclaim Motors Jayanagar. Fresh synthetic engine oil & new brake pads. Zero accidental history.",
        tax: "Lifetime",
        tax_valid_until: "2038-05-17",
        fitness: "Valid",
        fitness_valid_until: "2038-05-17",
        insurance: "Active",
        insurance_policy: "HDFC-ERGO-TW-982104",
        insurance_valid_until: "2027-05-15",
        puc_valid_until: "2027-01-30",
        hypothecation: "No",
        financier: "",
        noc: "Not Required",
      },
      seller: {
        name: "Sandeep R. Kulkarni",
        father_name: "Raghavendra Kulkarni",
        phone: "9845123456",
        alternate_phone: "9845123457",
        email: "sandeep.kulkarni@gmail.com",
        address: "#245, 7th Main, 4th Block, Jayanagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560011",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-6521",
        pan_number: "ABCPK9812M",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Vinay Kumar",
          phone: "9844012345",
          address: "#12, 2nd Cross, BTM Layout 2nd Stage, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-3341",
        },
        {
          name: "Girish Murthy",
          phone: "9900112233",
          address: "#88, 5th Block, Koramangala, Bengaluru",
          id_type: "Driving License",
          id_number: "KA01 20190008421",
        },
      ],
      buyer: {
        name: "Aakash V. Sharma",
        father_name: "Vijay Sharma",
        phone: "9988776655",
        alternate_phone: "9988776656",
        email: "aakash.sharma@techcorp.in",
        address: "Flat 402, Green Glen Heights, Bellandur Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560103",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-8890",
        pan_number: "BPDPS4412L",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Ramesh Babu (RTO Consultant)",
        phone: "9886012345",
        email: "ramesh.rto.services@gmail.com",
        task: "KA-05 Jayanagar to KA-51 Electronic City RTO transfer & Form 29/30 submission",
        total_amount: "2500",
        amount_paid: "1500",
        amount_balance: "1000",
      },
      payments: {
        purchase_price: "135000",
        selling_price: "154000",
        paid_to_seller: "135000",
        received_from_buyer: "30000",
        payment_method: "UPI",
        payment_date: localDay(),
        transaction_reference: "UPI-GPAY-981245012",
        notes: "Token advance ₹30,000 received via UPI. Remaining balance ₹1,24,000 due upon physical vehicle handover.",
      },
      photos: {}, // STRICTLY NO PHOTOS
      notes: "Demo deal created with all text details completely filled (vehicle specs, seller, buyer, agent, payments). Zero photos attached as requested.",
    }));
  };

  const go = (target, validate = true) => {
    if (validate && target > step) {
      for (let i = 0; i < target; i++) { const invalid = validateStep(deal, i); if (Object.keys(invalid).length) { showErrors(invalid, i); return; } }
    }
    setStep(target); setErrors({}); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (saving.current) return;
    const invalid = validateDeal(deal);
    if (invalid.length) { showErrors(Object.fromEntries(invalid.map(e => [e.field, e.message])), invalid[0].step); return; }
    saving.current = true; setBusy(true); setMessage("");
    try { const saved = await dealRepository.save(deal); setDirty(false); onSaved(saved); }
    catch (e) { setMessage(e.message); } finally { saving.current = false; setBusy(false); }
  };

  return { deal, step, errors, message, loading, busy, dirty, loadError, update, updateSection, updateWitness, setPhoto, fillDemoText, go, save };
};