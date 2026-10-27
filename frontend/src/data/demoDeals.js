// Complete, production-grade showroom demo dataset for Metro Motors
// All 5 deals include 100% comprehensive details (Vehicle specs, Seller profile,
// Mechanical maintenance breakdown, Buyer profile, RTO agent task, Payment schedule)
// and high-resolution verified SVG visual photo suites across all required documentation slots.

const SVG_ICONS = {
  car: `<g transform="translate(80, 20)" stroke="currentColor">
    <path d="M60 115 L95 75 L225 75 L260 115 L305 120 C315 120 325 128 325 138 L325 168 C325 174 320 178 314 178 L290 178 C290 160 274 150 258 150 C242 150 226 160 226 178 L114 178 C114 160 98 150 82 150 C66 150 50 160 50 178 L34 178 C28 178 24 174 24 168 L24 135 C24 125 32 118 45 116 Z" fill="none" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="82" cy="178" r="18" fill="none" stroke-width="5"/>
    <circle cx="82" cy="178" r="7" fill="currentColor"/>
    <circle cx="258" cy="178" r="18" fill="none" stroke-width="5"/>
    <circle cx="258" cy="178" r="7" fill="currentColor"/>
    <path d="M102 85 L218 85 L245 115 L78 115 Z" fill="currentColor" opacity="0.22"/>
    <line x1="160" y1="85" x2="160" y2="115" stroke-width="4"/>
  </g>`,
  bike_gear: `<g transform="translate(90, 25)" stroke="currentColor">
    <circle cx="55" cy="155" r="28" fill="none" stroke-width="5"/>
    <circle cx="55" cy="155" r="9" fill="currentColor"/>
    <circle cx="235" cy="155" r="28" fill="none" stroke-width="5"/>
    <circle cx="235" cy="155" r="9" fill="currentColor"/>
    <path d="M55 155 L105 85 L185 85 L235 155 L145 155 Z" fill="none" stroke-width="5" stroke-linejoin="round"/>
    <path d="M105 85 L90 55 L125 55" fill="none" stroke-width="5" stroke-linecap="round"/>
    <path d="M145 85 L175 125 L115 125 Z" fill="currentColor" opacity="0.3"/>
    <path d="M175 105 L210 105 L225 130" fill="none" stroke-width="4" stroke-linecap="round"/>
  </g>`,
  scooter: `<g transform="translate(90, 25)" stroke="currentColor">
    <circle cx="58" cy="155" r="26" fill="none" stroke-width="5"/>
    <circle cx="58" cy="155" r="8" fill="currentColor"/>
    <circle cx="232" cy="155" r="26" fill="none" stroke-width="5"/>
    <circle cx="232" cy="155" r="8" fill="currentColor"/>
    <path d="M90 60 L78 65 L88 100 L145 145 L195 145 L228 120 L218 90 L168 90" fill="none" stroke-width="5" stroke-linejoin="round"/>
    <path d="M88 100 L145 100 L145 145" fill="none" stroke-width="5"/>
    <circle cx="190" cy="105" r="10" fill="currentColor" opacity="0.25"/>
  </g>`,
  odometer: `<g transform="translate(80, 20)" stroke="currentColor">
    <circle cx="160" cy="120" r="62" fill="none" stroke-width="5"/>
    <path d="M115 120 A45 45 0 0 1 205 120" fill="none" stroke-width="4" stroke-dasharray="5 7"/>
    <line x1="160" y1="120" x2="198" y2="92" stroke-width="5" stroke-linecap="round"/>
    <circle cx="160" cy="120" r="10" fill="currentColor"/>
    <rect x="125" y="142" width="70" height="22" rx="4" fill="currentColor" opacity="0.25"/>
    <text x="160" y="157" font-family="monospace" font-size="12" font-weight="bold" fill="currentColor" text-anchor="middle" stroke="none">KM/H</text>
  </g>`,
  engine: `<g transform="translate(85, 20)" stroke="currentColor">
    <rect x="105" y="75" width="110" height="95" rx="8" fill="none" stroke-width="5"/>
    <line x1="130" y1="55" x2="130" y2="75" stroke-width="5"/>
    <line x1="190" y1="55" x2="190" y2="75" stroke-width="5"/>
    <line x1="105" y1="115" x2="215" y2="115" stroke-width="4"/>
    <circle cx="160" cy="142" r="18" fill="none" stroke-width="4"/>
    <line x1="160" y1="124" x2="160" y2="160" stroke-width="3"/>
  </g>`,
  chassis: `<g transform="translate(85, 20)" stroke="currentColor">
    <rect x="85" y="70" width="150" height="105" rx="8" fill="none" stroke-width="5"/>
    <line x1="105" y1="102" x2="215" y2="102" stroke-width="4" stroke-dasharray="7 5"/>
    <line x1="105" y1="124" x2="190" y2="124" stroke-width="4" stroke-dasharray="7 5"/>
    <circle cx="98" cy="84" r="4" fill="currentColor"/>
    <circle cx="222" cy="84" r="4" fill="currentColor"/>
    <circle cx="98" cy="161" r="4" fill="currentColor"/>
    <circle cx="222" cy="161" r="4" fill="currentColor"/>
    <rect x="110" y="140" width="100" height="18" rx="3" fill="currentColor" opacity="0.25"/>
  </g>`,
  id_card: `<g transform="translate(80, 20)" stroke="currentColor">
    <rect x="85" y="65" width="150" height="110" rx="10" fill="none" stroke-width="5"/>
    <rect x="100" y="85" width="38" height="42" rx="4" fill="currentColor" opacity="0.28"/>
    <line x1="152" y1="92" x2="218" y2="92" stroke-width="5" stroke-linecap="round"/>
    <line x1="152" y1="110" x2="202" y2="110" stroke-width="5" stroke-linecap="round"/>
    <line x1="100" y1="148" x2="220" y2="148" stroke-width="4" stroke-dasharray="6 4"/>
  </g>`,
  person: `<g transform="translate(80, 20)" stroke="currentColor">
    <circle cx="160" cy="88" r="32" fill="none" stroke-width="5"/>
    <circle cx="160" cy="88" r="12" fill="currentColor" opacity="0.25"/>
    <path d="M96 172 C96 135 124 130 160 130 C196 130 224 135 224 172" fill="none" stroke-width="5" stroke-linecap="round"/>
  </g>`,
  signature: `<g transform="translate(80, 20)" stroke="currentColor">
    <path d="M85 135 C110 100 130 85 142 115 C152 145 162 75 178 135 C192 105 208 120 222 100 C232 130 248 125 262 120" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="75" y1="152" x2="265" y2="152" stroke-width="2" stroke-dasharray="5 5" opacity="0.5"/>
  </g>`,
  thumb: `<g transform="translate(80, 20)" stroke="currentColor">
    <ellipse cx="160" cy="120" rx="38" ry="52" fill="none" stroke-width="4"/>
    <ellipse cx="160" cy="120" rx="26" ry="38" fill="none" stroke-width="4"/>
    <ellipse cx="160" cy="120" rx="14" ry="24" fill="none" stroke-width="4"/>
    <path d="M160 90 L160 150" stroke-width="3" stroke-linecap="round"/>
  </g>`,
};

const escapeXml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const makePhotoSvg = (title, subtitle, iconKey = "bike_gear", accent = "#d97706", badge = "METRO VERIFIED") => {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeBadge = escapeXml(badge);
  const iconGraphic = SVG_ICONS[iconKey] || SVG_ICONS.bike_gear;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="340" viewBox="0 0 480 340">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1120"/>
        <stop offset="50%" stop-color="#152033"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <pattern id="cardGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="1"/>
      </pattern>
    </defs>
    
    <!-- Outer Card Background & Grid -->
    <rect width="100%" height="100%" fill="url(#cardBg)" rx="16"/>
    <rect width="100%" height="100%" fill="url(#cardGrid)" rx="16"/>
    <rect x="2" y="2" width="476" height="336" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1.5" rx="14"/>
    
    <!-- Top Brand Header Bar -->
    <g transform="translate(24, 20)">
      <rect x="0" y="0" width="76" height="24" rx="5" fill="url(#pillGrad)"/>
      <text x="38" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#090d16" text-anchor="middle" letter-spacing="1">METRO</text>
      
      <rect x="86" y="0" width="130" height="24" rx="5" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="151" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.5">${safeBadge}</text>
      
      <text x="432" y="16" font-family="monospace" font-size="10" font-weight="600" fill="#64748b" text-anchor="end">ID #MM-${Math.abs((title + subtitle).split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 90000 + 10000)}</text>
    </g>
    
    <!-- Center Graphic Circle & Vector Artwork -->
    <g transform="translate(0, 10)" color="${accent}">
      <circle cx="240" cy="135" r="70" fill="rgba(255,255,255,0.03)" stroke="${accent}" stroke-width="1.8" stroke-dasharray="6 3"/>
      <circle cx="240" cy="135" r="58" fill="rgba(0,0,0,0.3)"/>
      ${iconGraphic}
    </g>
    
    <!-- Title & Detailed Subtitle -->
    <text x="240" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="0.2">${safeTitle}</text>
    <text x="240" y="258" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8" text-anchor="middle">${safeSubtitle}</text>
    
    <!-- Bottom Verified Security Seal -->
    <g transform="translate(145, 286)">
      <rect width="190" height="28" rx="14" fill="rgba(34, 197, 94, 0.12)" stroke="#22c55e" stroke-width="1.2"/>
      <circle cx="22" cy="14" r="5" fill="#22c55e"/>
      <text x="104" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" fill="#86efac" text-anchor="middle" letter-spacing="0.6">OFFICIAL RECORD VALID</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const createPhoto = (slotId, title, subtitle, iconKey, accent = "#d97706", badge = "METRO VERIFIED") => ({
  name: `${slotId}.svg`,
  type: "image/svg+xml",
  size: 2048,
  url: makePhotoSvg(title, subtitle, iconKey, accent, badge),
});

export const getTextOnlyDemoDeal = () => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return {
    id: "deal-demo-hunter-350-no-photos",
    kind: "deal",
    schema_version: 1,
    bill_number: "Bill-000",
    status: "In Stock",
    rc_status: "Pending",
    commission: 19000,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    vehicle: {
      vehicle_type: "2 Wheeler with Gear",
      vehicle_name: "Royal Enfield Hunter 350 Dapper Ash",
      make: "Royal Enfield",
      model: "Hunter 350",
      variant: "Dapper Series Dual-Channel ABS",
      year: "2023",
      color: "Dapper Ash / Silver",
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
      bought_date: todayStr,
      sold_date: "",
      keys: "2",
      service_history: "Authorized service records up to date. Fresh synthetic oil, zero accidental history.",
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
        id_type: "Driving Licence",
        id_number: "KA01 20190008421",
      },
    ],
    maintenance: {
      services: [
        { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
        { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
      ],
      total_expense: "1450",
      notes: "Full synthetic engine oil replacement and showroom detailing completed.",
    },
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
      payment_date: todayStr,
      transaction_reference: "UPI-GPAY-981245012",
      notes: "Token advance received via UPI.",
    },
    photos: {},
    notes: "Text-only demo record.",
  };
};

export const getDemoDeals = () => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return [
    // ═════════════════════════════════════════════════════════════════════════
    // 1. Royal Enfield Classic 350 (2 Wheeler with Gear) - In Stock, RC Pending
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "deal-demo-re-classic-350",
      kind: "deal",
      schema_version: 1,
      bill_number: "Bill-001",
      status: "In Stock",
      rc_status: "Pending",
      commission: 23000,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      vehicle: {
        vehicle_type: "2 Wheeler with Gear",
        vehicle_name: "Royal Enfield Classic 350 Stealth Black",
        make: "Royal Enfield",
        model: "Classic 350",
        variant: "Dual-Channel ABS Dark Series",
        year: "2023",
        color: "Stealth Black",
        vehicle_number: "KA-03-JJ-4521",
        registration_number: "KA03JJ4521",
        registration_date: "2023-03-12",
        engine_number: "RE350J23K98411",
        chassis_number: "ME3J3S5K0PA984112",
        engine_cc: "349",
        fuel_type: "Petrol",
        transmission: "Manual",
        odometer: "8450",
        ownership: "First Owner",
        condition: "Excellent",
        bought_date: "2026-09-10",
        sold_date: "",
        keys: "2",
        service_history: "Fully authorized service at King's Royal Enfield Indiranagar. Ceramic coating done, zero scratches, brand new Michelin tires.",
        tax: "Lifetime",
        tax_valid_until: "2038-03-11",
        fitness: "Valid",
        fitness_valid_until: "2038-03-11",
        insurance: "Active",
        insurance_policy: "HDFC-ERGO-MOT-889104",
        insurance_valid_until: "2027-03-10",
        puc_valid_until: "2027-01-15",
        hypothecation: "Closed",
        financier: "HDFC Bank (NOC in hand)",
        noc: "Available",
      },
      seller: {
        name: "Vikram R. Shetty",
        father_name: "Raghavendra Shetty",
        phone: "9845123987",
        alternate_phone: "9845123988",
        email: "vikram.shetty@gmail.com",
        address: "#412, 14th Main, HAL 2nd Stage, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560008",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-4512",
        pan_number: "ABGPS1245K",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Deepak S. Nair",
          phone: "9844091823",
          address: "#28, Domlur 1st Stage, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-9912",
        },
        {
          name: "Pranav Varma",
          phone: "9731234567",
          address: "#105, AECS Layout, Kundalahalli, Bengaluru",
          id_type: "Driving Licence",
          id_number: "KA53 20210008124",
        },
      ],
      maintenance: {
        services: [
          { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
          { id: "chain_sprocket", name: "Chain Sprocket & Drive Line Lubrication", price: "800", enabled: true },
          { id: "brakes", name: "Brake Pad & Shoe Replacement", price: "650", enabled: true },
          { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
        ],
        total_expense: "2900",
        notes: "Full synthetic Motul 300V oil service, new rear brake pads, and ceramic polish applied.",
      },
      buyer: {
        name: "Aditya Mohan",
        father_name: "Mohan Krishnan",
        phone: "9900881122",
        alternate_phone: "9900881123",
        email: "aditya.mohan@outlook.com",
        address: "Flat B-402, Prestige Palms, Whitefield",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560066",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-8821",
        pan_number: "BCKPA8912L",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Ramesh Babu (Indiranagar RTO)",
        phone: "9886012345",
        email: "ramesh.rto.services@gmail.com",
        task: "RC ownership transfer from KA-03 Indiranagar to KA-53 KR Puram & Form 29/30 submission",
        total_amount: "3500",
        amount_paid: "2000",
        amount_balance: "1500",
      },
      payments: {
        purchase_price: "162000",
        selling_price: "185000",
        paid_to_seller: "162000",
        received_from_buyer: "35000",
        payment_method: "Bank Transfer",
        payment_date: todayStr,
        transaction_reference: "NEFT-HDFC-910283741",
        notes: "Advance booking amount ₹35,000 received. Balance ₹1,50,000 due upon final delivery handover.",
      },
      photos: {
        // Vehicle photo suite
        "vehicle-1": createPhoto("vehicle-1", "Front Mask & Headlamp", "Royal Enfield Classic 350 · KA-03-JJ-4521", "bike_gear", "#d97706", "2W GEARED"),
        "vehicle-2": createPhoto("vehicle-2", "Rear Profile & Tail Lamp", "Exhaust, registration plate & indicators intact", "bike_gear", "#d97706", "2W GEARED"),
        "vehicle-3": createPhoto("vehicle-3", "Left Engine & Crankcase", "Royal Enfield 349cc J-Series engine block", "engine", "#3b82f6", "ENGINE"),
        "vehicle-4": createPhoto("vehicle-4", "Right Exhaust & Tank", "Stealth Black matte tank badge & chrome exhaust", "bike_gear", "#d97706", "2W GEARED"),
        "vehicle-5": createPhoto("vehicle-5", "Odometer: 8,450 km", "Analog-digital console reading certified", "odometer", "#10b981", "ODOMETER"),
        "vehicle-6": createPhoto("vehicle-6", "Engine Stamping", "RE350J23K98411 · Authorized Match", "engine", "#6366f1", "ENGINE NO"),
        "vehicle-7": createPhoto("vehicle-7", "Chassis VIN Plate", "ME3J3S5K0PA984112 Stamped Headstock", "chassis", "#ec4899", "CHASSIS NO"),
        "vehicle-8": createPhoto("vehicle-8", "Insurance & Smart Card", "HDFC ERGO Comprehensive Valid 2027", "id_card", "#06b6d4", "DOCUMENTS"),
        // Seller identity suite
        "seller-1": createPhoto("seller-1", "Seller Portrait", "Vikram R. Shetty (Verified)", "person", "#8b5cf6", "SELLER"),
        "seller-signature": createPhoto("seller-signature", "Seller Digital Signature", "Vikram R. Shetty · Form 29/30 Verified", "signature", "#f59e0b", "SIGNATURE"),
        "seller-thumb": createPhoto("seller-thumb", "Seller Biometric Thumb", "UIDAI Biometric Stamp Valid", "thumb", "#3b82f6", "BIOMETRIC"),
        "seller-2": createPhoto("seller-2", "Seller Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "seller-3": createPhoto("seller-3", "Seller Aadhaar Card (Back)", "Address: #412 Indiranagar Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "seller-4": createPhoto("seller-4", "Seller PAN Card", "Income Tax Dept · ABGPS1245K", "id_card", "#6366f1", "PAN CARD"),
        "seller-5": createPhoto("seller-5", "Seller Driving Licence", "KA RTO Indiranagar · Valid LMV/MCWG", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "seller-8": createPhoto("seller-8", "Original RC Smartcard (Front)", "Government of Karnataka · KA-03-JJ-4521", "id_card", "#f97316", "RC CARD"),
        "seller-9": createPhoto("seller-9", "Original RC Smartcard (Back)", "Chip Verified · Hypothecation Cleared", "id_card", "#f97316", "RC CARD"),
        "seller-11": createPhoto("seller-11", "Seller Purchase Agreement", "Metro Motors Showroom Acquisition Deed", "id_card", "#84cc16", "AGREEMENT"),
        // Buyer identity suite
        "buyer-1": createPhoto("buyer-1", "Buyer Portrait", "Aditya Mohan (Verified)", "person", "#06b6d4", "BUYER"),
        "buyer-signature": createPhoto("buyer-signature", "Buyer Digital Signature", "Aditya Mohan · Sale Agreement Signed", "signature", "#f59e0b", "SIGNATURE"),
        "buyer-thumb": createPhoto("buyer-thumb", "Buyer Biometric Thumb", "Inked Left Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "buyer-2": createPhoto("buyer-2", "Buyer Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "buyer-3": createPhoto("buyer-3", "Buyer Aadhaar Card (Back)", "Address: Prestige Palms Whitefield", "id_card", "#10b981", "AADHAAR"),
        "buyer-4": createPhoto("buyer-4", "Buyer PAN Card", "Income Tax Dept · BCKPA8912L", "id_card", "#6366f1", "PAN CARD"),
        "buyer-5": createPhoto("buyer-5", "Buyer Driving Licence", "KA RTO KR Puram · Valid MCWG", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "buyer-11": createPhoto("buyer-11", "Buyer Delivery Sale Deed", "Metro Motors Official Delivery Order", "id_card", "#84cc16", "SALE BILL"),
        // Witnesses
        "witness-1-1": createPhoto("witness-1-1", "Seller Witness Photo", "Deepak S. Nair", "person", "#f59e0b", "WITNESS 1"),
        "witness-1-2": createPhoto("witness-1-2", "Witness 1 Signature", "Deepak S. Nair Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-signature": createPhoto("witness-1-signature", "Witness 1 Signature", "Deepak S. Nair Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-3": createPhoto("witness-1-3", "Witness 1 Thumb Impression", "Deepak S. Nair Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-1-thumb": createPhoto("witness-1-thumb", "Witness 1 Thumb Impression", "Deepak S. Nair Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-1": createPhoto("witness-2-1", "Buyer Witness Photo", "Pranav Varma", "person", "#ec4899", "WITNESS 2"),
        "witness-2-2": createPhoto("witness-2-2", "Witness 2 Signature", "Pranav Varma Attestation", "signature", "#ec4899", "SIGNATURE"),
        "witness-2-signature": createPhoto("witness-2-signature", "Witness 2 Signature", "Pranav Varma Attestation", "signature", "#ec4899", "SIGNATURE"),
        "witness-2-3": createPhoto("witness-2-3", "Witness 2 Thumb Impression", "Pranav Varma Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-thumb": createPhoto("witness-2-thumb", "Witness 2 Thumb Impression", "Pranav Varma Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
      },
      notes: "Showroom flagship cruiser. Clean single-owner machine in showroom condition with both original keys and manual book.",
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 2. Honda Activa 6G DLX Smart Key (2 Wheeler without Gear) - In Stock
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "deal-demo-honda-activa-6g",
      kind: "deal",
      schema_version: 1,
      bill_number: "Bill-002",
      status: "In Stock",
      rc_status: "Pending",
      commission: 12500,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      vehicle: {
        vehicle_type: "2 Wheeler without Gear",
        vehicle_name: "Honda Activa 6G DLX Smart Key",
        make: "Honda",
        model: "Activa 6G",
        variant: "DLX Smart Keyless Remote",
        year: "2024",
        color: "Pearl Siren Blue",
        vehicle_number: "KA-04-KQ-3319",
        registration_number: "KA04KQ3319",
        registration_date: "2024-02-15",
        engine_number: "HND110E981245",
        chassis_number: "ME4JF9124RA891244",
        engine_cc: "109",
        fuel_type: "Petrol",
        transmission: "Automatic",
        odometer: "5120",
        ownership: "First Owner",
        condition: "Excellent",
        bought_date: "2026-09-20",
        sold_date: "",
        keys: "2",
        service_history: "Maintained exclusively at Silicon Honda Malleshwaram. Smart key remote battery replaced, zero accidental history.",
        tax: "Lifetime",
        tax_valid_until: "2039-02-14",
        fitness: "Valid",
        fitness_valid_until: "2039-02-14",
        insurance: "Active",
        insurance_policy: "TATA-AIG-SCOT-992144",
        insurance_valid_until: "2027-02-12",
        puc_valid_until: "2026-12-30",
        hypothecation: "No",
        financier: "",
        noc: "Not Required",
      },
      seller: {
        name: "Lakshmi Narayanan",
        father_name: "R. Narayanan",
        phone: "9448019283",
        alternate_phone: "9448019284",
        email: "narayanan.l@gmail.com",
        address: "#19, Malleshwaram 8th Cross",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560003",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-5521",
        pan_number: "ALMPL9841P",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Sridhar Rao",
          phone: "9448119284",
          address: "#45, Rajajinagar 2nd Block, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-4412",
        },
        {
          name: "Ananya Deshmukh",
          phone: "9845191828",
          address: "#302, Green Orchid, Yeshwanthpur, Bengaluru",
          id_type: "Driving Licence",
          id_number: "KA04 2022001928",
        },
      ],
      maintenance: {
        services: [
          { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
          { id: "filters", name: "Filter Replacements", price: "350", enabled: true },
          { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
        ],
        total_expense: "1800",
        notes: "Genuine Honda engine oil and air filter replacement. Foam wash and teflon polished.",
      },
      buyer: {
        name: "Pooja Deshmukh",
        father_name: "Girish Deshmukh",
        phone: "9845091827",
        alternate_phone: "9845091828",
        email: "pooja.deshmukh@tcs.com",
        address: "#302, Green Orchid Apartments, Yeshwanthpur",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560022",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-9021",
        pan_number: "BPDPM7712Q",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Anand RTO Consult",
        phone: "9844055667",
        email: "anand.rto.services@gmail.com",
        task: "RC ownership transfer to Yeshwanthpur RTO (KA-04) & Smart Card dispatch",
        total_amount: "2000",
        amount_paid: "2000",
        amount_balance: "0",
      },
      payments: {
        purchase_price: "62000",
        selling_price: "74500",
        paid_to_seller: "62000",
        received_from_buyer: "20000",
        payment_method: "UPI",
        payment_date: todayStr,
        transaction_reference: "UPI-ICICI-88124901",
        notes: "Token advance ₹20,000 paid. Remaining balance ₹54,500 due on vehicle handover.",
      },
      photos: {
        // Vehicle photo suite
        "vehicle-1": createPhoto("vehicle-1", "Front Apron & LED", "Honda Activa 6G DLX · KA-04-KQ-3319", "scooter", "#06b6d4", "2W AUTO"),
        "vehicle-2": createPhoto("vehicle-2", "Rear & Number Plate", "External fuel lid & chrome badging intact", "scooter", "#06b6d4", "2W AUTO"),
        "vehicle-3": createPhoto("vehicle-3", "Left Body & Floorboard", "Pristine metallic blue body paint & rubber mat", "scooter", "#06b6d4", "2W AUTO"),
        "vehicle-4": createPhoto("vehicle-4", "Right Exhaust & Muffler", "Heat shield guard & rear suspension verified", "scooter", "#06b6d4", "2W AUTO"),
        "vehicle-5": createPhoto("vehicle-5", "Odometer: 5,120 km", "Honda Smart Key digital console reading", "odometer", "#10b981", "ODOMETER"),
        "vehicle-6": createPhoto("vehicle-6", "Engine Stamping", "HND110E981245 Crankcase Match", "engine", "#6366f1", "ENGINE NO"),
        "vehicle-7": createPhoto("vehicle-7", "Chassis VIN Number", "ME4JF9124RA891244 Stamped Frame", "chassis", "#ec4899", "CHASSIS NO"),
        "vehicle-8": createPhoto("vehicle-8", "RC Smartcard & Insurance", "Tata AIG Active Policy & Smart Card Copy", "id_card", "#3b82f6", "DOCUMENTS"),
        // Seller identity suite
        "seller-1": createPhoto("seller-1", "Seller Portrait", "Lakshmi Narayanan (Verified)", "person", "#8b5cf6", "SELLER"),
        "seller-signature": createPhoto("seller-signature", "Seller Digital Signature", "Lakshmi Narayanan · Sale Endorsement", "signature", "#f59e0b", "SIGNATURE"),
        "seller-thumb": createPhoto("seller-thumb", "Seller Biometric Thumb", "Inked Left Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "seller-2": createPhoto("seller-2", "Seller Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "seller-3": createPhoto("seller-3", "Seller Aadhaar Card (Back)", "Address: Malleshwaram 8th Cross Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "seller-4": createPhoto("seller-4", "Seller PAN Card", "Income Tax Dept · ALMPL9841P", "id_card", "#6366f1", "PAN CARD"),
        "seller-5": createPhoto("seller-5", "Seller Driving Licence", "KA-04 Malleshwaram RTO", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "seller-8": createPhoto("seller-8", "Original RC Smartcard (Front)", "KA-04-KQ-3319 · Honda Motorcycle & Scooter", "id_card", "#f97316", "RC CARD"),
        "seller-9": createPhoto("seller-9", "Original RC Smartcard (Back)", "First Owner · Lifetime Tax Paid", "id_card", "#f97316", "RC CARD"),
        "seller-11": createPhoto("seller-11", "Seller Acquisition Receipt", "Metro Motors Showroom Purchase Deed", "id_card", "#84cc16", "AGREEMENT"),
        // Buyer identity suite
        "buyer-1": createPhoto("buyer-1", "Buyer Portrait", "Pooja Deshmukh (Verified)", "person", "#ec4899", "BUYER"),
        "buyer-signature": createPhoto("buyer-signature", "Buyer Digital Signature", "Pooja Deshmukh · Sale Agreement", "signature", "#f59e0b", "SIGNATURE"),
        "buyer-thumb": createPhoto("buyer-thumb", "Buyer Biometric Thumb", "UIDAI Biometric Stamp Valid", "thumb", "#3b82f6", "BIOMETRIC"),
        "buyer-2": createPhoto("buyer-2", "Buyer Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "buyer-3": createPhoto("buyer-3", "Buyer Aadhaar Card (Back)", "Address: Yeshwanthpur Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "buyer-4": createPhoto("buyer-4", "Buyer PAN Card", "Income Tax Dept · BPDPM7712Q", "id_card", "#6366f1", "PAN CARD"),
        "buyer-5": createPhoto("buyer-5", "Buyer Driving Licence", "KA RTO Yeshwanthpur · MCWOG Valid", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "buyer-11": createPhoto("buyer-11", "Buyer Vehicle Bill", "Metro Motors Official Booking Invoice", "id_card", "#84cc16", "SALE BILL"),
        // Witnesses
        "witness-1-1": createPhoto("witness-1-1", "Seller Witness Photo", "Sridhar Rao", "person", "#f59e0b", "WITNESS 1"),
        "witness-1-2": createPhoto("witness-1-2", "Witness 1 Signature", "Sridhar Rao Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-signature": createPhoto("witness-1-signature", "Witness 1 Signature", "Sridhar Rao Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-3": createPhoto("witness-1-3", "Witness 1 Thumb Impression", "Sridhar Rao Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-1-thumb": createPhoto("witness-1-thumb", "Witness 1 Thumb Impression", "Sridhar Rao Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-1": createPhoto("witness-2-1", "Buyer Witness Photo", "Ananya Deshmukh", "person", "#10b981", "WITNESS 2"),
        "witness-2-2": createPhoto("witness-2-2", "Witness 2 Signature", "Ananya Deshmukh Attestation", "signature", "#10b981", "SIGNATURE"),
        "witness-2-signature": createPhoto("witness-2-signature", "Witness 2 Signature", "Ananya Deshmukh Attestation", "signature", "#10b981", "SIGNATURE"),
        "witness-2-3": createPhoto("witness-2-3", "Witness 2 Thumb Impression", "Ananya Deshmukh Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-thumb": createPhoto("witness-2-thumb", "Witness 2 Thumb Impression", "Ananya Deshmukh Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
      },
      notes: "High liquidity family scooter with keyless Smart Key remote. 100% genuine vehicle with full service records.",
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 3. Hyundai Creta 1.5 Turbo DCT (4 Wheeler Car) - Sold, RC Transferred
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "deal-demo-hyundai-creta",
      kind: "deal",
      schema_version: 1,
      bill_number: "Bill-003",
      status: "Sold",
      rc_status: "Transferred",
      commission: 170000,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      vehicle: {
        vehicle_type: "4 Wheeler Car",
        vehicle_name: "Hyundai Creta 1.5 Turbo DCT SX (O)",
        make: "Hyundai",
        model: "Creta",
        variant: "1.5 Turbo DCT SX (O) Panoramic Sunroof Dual Tone",
        year: "2023",
        color: "Ranger Khaki with Abyss Black",
        vehicle_number: "KA-01-MJ-8821",
        registration_number: "KA01MJ8821",
        registration_date: "2023-08-25",
        engine_number: "G4LDNU98214",
        chassis_number: "MALC381CLPM098124",
        engine_cc: "1482",
        fuel_type: "Petrol",
        transmission: "Automatic",
        odometer: "14200",
        ownership: "First Owner",
        condition: "Excellent",
        bought_date: "2026-09-01",
        sold_date: "2026-09-28",
        keys: "2",
        service_history: "Maintained exclusively at Trident Hyundai Koramangala. 10,000 km periodic service complete. 3M ceramic coating and zero accidental history.",
        tax: "Lifetime",
        tax_valid_until: "2038-08-24",
        fitness: "Valid",
        fitness_valid_until: "2038-08-24",
        insurance: "Active",
        insurance_policy: "BAJAJ-ALLIANZ-CAR-90214",
        insurance_valid_until: "2026-08-23",
        puc_valid_until: "2027-02-15",
        hypothecation: "Closed",
        financier: "Kotak Mahindra Prime (NOC verified)",
        noc: "Available",
      },
      seller: {
        name: "Arjun N. Mehta",
        father_name: "Naveen Mehta",
        phone: "9820123456",
        alternate_phone: "9820123457",
        email: "arjun.mehta@techcorp.io",
        address: "#88, 5th Block, Koramangala",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560095",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-9943",
        pan_number: "AXCPM9012N",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Kunal Bansal",
          phone: "9820987654",
          address: "#12, 1st Cross, HSR Layout Sector 4",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-3341",
        },
        {
          name: "Rohit Sen",
          phone: "9820445566",
          address: "#502, Prestige Ferns, Bellandur, Bengaluru",
          id_type: "Driving Licence",
          id_number: "KA01 20200009124",
        },
      ],
      maintenance: {
        services: [
          { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
          { id: "filters", name: "Filter Replacements", price: "350", enabled: true },
          { id: "brakes", name: "Brake Pad & Shoe Replacement", price: "650", enabled: true },
          { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
        ],
        total_expense: "2450",
        notes: "Full synthetic Shell Helix Ultra oil service, AC cabin filter replacement, and full showroom polish.",
      },
      buyer: {
        name: "Siddharth V. Menon",
        father_name: "Venugopal Menon",
        phone: "9886099887",
        alternate_phone: "9886099888",
        email: "siddharth.menon@intel.com",
        address: "Flat 1204, Rohan Jharoka 2, Bellandur Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560103",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-7788",
        pan_number: "BCMPM8821L",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Shivakumar (Koramangala RTO)",
        phone: "9448123456",
        email: "shiva.rto.services@gmail.com",
        task: "KA-01 Koramangala RTO Form 29/30 submission, hypothecation cancellation & RC smart card transfer",
        total_amount: "6500",
        amount_paid: "6500",
        amount_balance: "0",
      },
      payments: {
        purchase_price: "1480000",
        selling_price: "1650000",
        paid_to_seller: "1480000",
        received_from_buyer: "1650000",
        payment_method: "Bank Transfer",
        payment_date: "2026-09-28",
        transaction_reference: "RTGS-HDFC-9912048571",
        notes: "Full settlement via RTGS. Vehicle delivered with warranty transfer & gate pass.",
      },
      photos: {
        // Vehicle photo suite
        "vehicle-1": createPhoto("vehicle-1", "Front 3/4 & Parametric Grille", "Hyundai Creta 1.5 Turbo · KA-01-MJ-8821", "car", "#ef4444", "4W CAR"),
        "vehicle-2": createPhoto("vehicle-2", "Rear Profile & Connected LED", "Connected taillights & twin tip exhaust", "car", "#ef4444", "4W CAR"),
        "vehicle-3": createPhoto("vehicle-3", "Left Profile & Diamond Alloys", "17-inch alloy wheels & roof rails intact", "car", "#ef4444", "4W CAR"),
        "vehicle-4": createPhoto("vehicle-4", "Right Profile & Sunroof", "Panoramic sunroof & dual-tone roof", "car", "#ef4444", "4W CAR"),
        "vehicle-5": createPhoto("vehicle-5", "Odometer: 14,200 km", "10.25-inch digital driver cluster certified", "odometer", "#10b981", "ODOMETER"),
        "vehicle-6": createPhoto("vehicle-6", "Engine Bay Stamping", "G4LDNU98214 Turbo GDi Engine Block", "engine", "#6366f1", "ENGINE NO"),
        "vehicle-7": createPhoto("vehicle-7", "Chassis VIN Plate", "MALC381CLPM098124 B-Pillar Stamped", "chassis", "#ec4899", "CHASSIS NO"),
        "vehicle-8": createPhoto("vehicle-8", "RC Smartcard & Insurance", "Bajaj Allianz Zero Dep Policy Valid 2026", "id_card", "#06b6d4", "DOCUMENTS"),
        // Seller identity suite
        "seller-1": createPhoto("seller-1", "Seller Portrait", "Arjun N. Mehta (Verified)", "person", "#8b5cf6", "SELLER"),
        "seller-signature": createPhoto("seller-signature", "Seller Digital Signature", "Arjun N. Mehta · Form 29/30 Cleared", "signature", "#f59e0b", "SIGNATURE"),
        "seller-thumb": createPhoto("seller-thumb", "Seller Biometric Thumb", "Inked Left Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "seller-2": createPhoto("seller-2", "Seller Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "seller-3": createPhoto("seller-3", "Seller Aadhaar Card (Back)", "Address: 5th Block Koramangala", "id_card", "#10b981", "AADHAAR"),
        "seller-4": createPhoto("seller-4", "Seller PAN Card", "Income Tax Dept · AXCPM9012N", "id_card", "#6366f1", "PAN CARD"),
        "seller-5": createPhoto("seller-5", "Seller Driving Licence", "KA RTO Koramangala · Valid LMV", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "seller-8": createPhoto("seller-8", "Original RC Smartcard (Front)", "Government of Karnataka · KA-01-MJ-8821", "id_card", "#f97316", "RC CARD"),
        "seller-9": createPhoto("seller-9", "Original RC Smartcard (Back)", "Hypothecation NOC Attached", "id_card", "#f97316", "RC CARD"),
        "seller-11": createPhoto("seller-11", "Seller Car Transfer Deed", "Metro Motors Showroom Transfer Deed", "id_card", "#84cc16", "AGREEMENT"),
        // Buyer identity suite
        "buyer-1": createPhoto("buyer-1", "Buyer Portrait", "Siddharth V. Menon (Verified)", "person", "#06b6d4", "BUYER"),
        "buyer-signature": createPhoto("buyer-signature", "Buyer Digital Signature", "Siddharth V. Menon · Bill of Sale", "signature", "#f59e0b", "SIGNATURE"),
        "buyer-thumb": createPhoto("buyer-thumb", "Buyer Biometric Thumb", "UIDAI Biometric Stamp Valid", "thumb", "#3b82f6", "BIOMETRIC"),
        "buyer-2": createPhoto("buyer-2", "Buyer Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "buyer-3": createPhoto("buyer-3", "Buyer Aadhaar Card (Back)", "Address: Rohan Jharoka Bellandur", "id_card", "#10b981", "AADHAAR"),
        "buyer-4": createPhoto("buyer-4", "Buyer PAN Card", "Income Tax Dept · BCMPM8821L", "id_card", "#6366f1", "PAN CARD"),
        "buyer-5": createPhoto("buyer-5", "Buyer Driving Licence", "KA RTO HSR Layout · LMV Valid", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "buyer-11": createPhoto("buyer-11", "Buyer Purchase Agreement", "Metro Motors Showroom Delivery Note", "id_card", "#84cc16", "SALE BILL"),
        // Witnesses
        "witness-1-1": createPhoto("witness-1-1", "Seller Witness Photo", "Kunal Bansal", "person", "#f59e0b", "WITNESS 1"),
        "witness-1-2": createPhoto("witness-1-2", "Witness 1 Signature", "Kunal Bansal Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-signature": createPhoto("witness-1-signature", "Witness 1 Signature", "Kunal Bansal Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-3": createPhoto("witness-1-3", "Witness 1 Thumb Impression", "Kunal Bansal Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-1-thumb": createPhoto("witness-1-thumb", "Witness 1 Thumb Impression", "Kunal Bansal Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-1": createPhoto("witness-2-1", "Buyer Witness Photo", "Rohit Sen", "person", "#10b981", "WITNESS 2"),
        "witness-2-2": createPhoto("witness-2-2", "Witness 2 Signature", "Rohit Sen Attestation", "signature", "#10b981", "SIGNATURE"),
        "witness-2-signature": createPhoto("witness-2-signature", "Witness 2 Signature", "Rohit Sen Attestation", "signature", "#10b981", "SIGNATURE"),
        "witness-2-3": createPhoto("witness-2-3", "Witness 2 Thumb Impression", "Rohit Sen Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-thumb": createPhoto("witness-2-thumb", "Witness 2 Thumb Impression", "Rohit Sen Impression", "thumb", "#3b82f6", "BIOMETRIC"),
      },
      notes: "High value 4-wheeler car sale with substantial margin of ₹1,70,000. RC ownership transferred cleanly.",
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 4. Yamaha YZF R15 V4 Racing Blue (2 Wheeler with Gear) - In Stock
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "deal-demo-yamaha-r15-v4",
      kind: "deal",
      schema_version: 1,
      bill_number: "Bill-004",
      status: "In Stock",
      rc_status: "Pending",
      commission: 20000,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      vehicle: {
        vehicle_type: "2 Wheeler with Gear",
        vehicle_name: "Yamaha YZF R15 V4 Racing Blue",
        make: "Yamaha",
        model: "YZF R15 V4",
        variant: "Racing Blue Quickshifter Traction Control USD",
        year: "2023",
        color: "Racing Blue with Matte Grey",
        vehicle_number: "KA-05-NL-6672",
        registration_number: "KA05NL6672",
        registration_date: "2023-06-18",
        engine_number: "YMH155G449102",
        chassis_number: "ME1RG5410PA098124",
        engine_cc: "155",
        fuel_type: "Petrol",
        transmission: "Manual",
        odometer: "9400",
        ownership: "First Owner",
        condition: "Excellent",
        bought_date: "2026-09-22",
        sold_date: "",
        keys: "2",
        service_history: "Showroom serviced at Orion Yamaha Koramangala. Variable Valve Actuation (VVA) checked, quickshifter calibrated.",
        tax: "Lifetime",
        tax_valid_until: "2038-06-17",
        fitness: "Valid",
        fitness_valid_until: "2038-06-17",
        insurance: "Active",
        insurance_policy: "ICICI-LOMBARD-R15-9042",
        insurance_valid_until: "2027-06-15",
        puc_valid_until: "2027-02-28",
        hypothecation: "No",
        financier: "",
        noc: "Not Required",
      },
      seller: {
        name: "Syed Farooq",
        father_name: "Syed Ameer",
        phone: "9880198273",
        alternate_phone: "9880198274",
        email: "farooq.syed@gmail.com",
        address: "#71, Jayanagar 4th Block",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560011",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-6612",
        pan_number: "DFXPF4412E",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Wasim Khan",
          phone: "9880293847",
          address: "#34, BTM Layout 1st Stage, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-9812",
        },
        {
          name: "Gautam Rao",
          phone: "9741283749",
          address: "#99, Banashankari 2nd Stage, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-4491",
        },
      ],
      maintenance: {
        services: [
          { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
          { id: "chain_sprocket", name: "Chain Sprocket & Drive Line Lubrication", price: "800", enabled: true },
          { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
        ],
        total_expense: "2250",
        notes: "Yamalube full synthetic oil change, O-ring chain degreased and lubed, body polished.",
      },
      buyer: {
        name: "Chirag Hegde",
        father_name: "Satish Hegde",
        phone: "9741283746",
        alternate_phone: "9741283747",
        email: "chirag.hegde@techlabs.com",
        address: "#202, Banashankari 3rd Stage, 7th Main",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560085",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-1123",
        pan_number: "EPMCH9921K",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Manjunath (Jayanagar RTO Services)",
        phone: "9449812345",
        email: "manju.rto@rediffmail.com",
        task: "KA-05 Jayanagar RTO transfer & tax endorsement to KA-51 Electronic City",
        total_amount: "2800",
        amount_paid: "1500",
        amount_balance: "1300",
      },
      payments: {
        purchase_price: "132000",
        selling_price: "152000",
        paid_to_seller: "132000",
        received_from_buyer: "30000",
        payment_method: "UPI",
        payment_date: todayStr,
        transaction_reference: "UPI-PAYTM-992147102",
        notes: "Token advance ₹30,000 received today. Buyer collecting bike upon paying balance ₹1,22,000.",
      },
      photos: {
        // Vehicle photo suite
        "vehicle-1": createPhoto("vehicle-1", "Front Fairing & Bi-LED", "Yamaha YZF R15 V4 · KA-05-NL-6672", "bike_gear", "#3b82f6", "2W GEARED"),
        "vehicle-2": createPhoto("vehicle-2", "Rear Tail Cowl & Plate", "LED tail light & aerodynamic tail section", "bike_gear", "#3b82f6", "2W GEARED"),
        "vehicle-3": createPhoto("vehicle-3", "Left Fairing & USD Fork", "Golden upside down front forks intact", "bike_gear", "#3b82f6", "2W GEARED"),
        "vehicle-4": createPhoto("vehicle-4", "Right Profile & Exhaust", "Racing Blue body decals & alloy wheel rims", "bike_gear", "#3b82f6", "2W GEARED"),
        "vehicle-5": createPhoto("vehicle-5", "Odometer: 9,400 km", "Negative LCD screen with gear position indicator", "odometer", "#10b981", "ODOMETER"),
        "vehicle-6": createPhoto("vehicle-6", "Engine Stamping", "YMH155G449102 VVA Liquid Cooled", "engine", "#6366f1", "ENGINE NO"),
        "vehicle-7": createPhoto("vehicle-7", "Chassis VIN Plate", "ME1RG5410PA098124 Stamped Frame", "chassis", "#ec4899", "CHASSIS NO"),
        "vehicle-8": createPhoto("vehicle-8", "RC Smartcard & Insurance", "ICICI Lombard Active Policy & Smart Card", "id_card", "#06b6d4", "DOCUMENTS"),
        // Seller identity suite
        "seller-1": createPhoto("seller-1", "Seller Portrait", "Syed Farooq (Verified)", "person", "#8b5cf6", "SELLER"),
        "seller-signature": createPhoto("seller-signature", "Seller Digital Signature", "Syed Farooq · Ownership Release", "signature", "#f59e0b", "SIGNATURE"),
        "seller-thumb": createPhoto("seller-thumb", "Seller Biometric Thumb", "Inked Left Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "seller-2": createPhoto("seller-2", "Seller Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "seller-3": createPhoto("seller-3", "Seller Aadhaar Card (Back)", "Address: Jayanagar 4th Block Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "seller-4": createPhoto("seller-4", "Seller PAN Card", "Income Tax Dept · DFXPF4412E", "id_card", "#6366f1", "PAN CARD"),
        "seller-5": createPhoto("seller-5", "Seller Driving Licence", "KA RTO Jayanagar · MCWG Valid", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "seller-8": createPhoto("seller-8", "Original RC Smartcard (Front)", "KA-05-NL-6672 · India Yamaha Motor", "id_card", "#f97316", "RC CARD"),
        "seller-9": createPhoto("seller-9", "Original RC Smartcard (Back)", "Lifetime Tax Paid · Commercial Clear", "id_card", "#f97316", "RC CARD"),
        "seller-11": createPhoto("seller-11", "Seller Purchase Agreement", "Metro Motors Showroom Transfer Receipt", "id_card", "#84cc16", "AGREEMENT"),
        // Buyer identity suite
        "buyer-1": createPhoto("buyer-1", "Buyer Portrait", "Chirag Hegde (Verified)", "person", "#10b981", "BUYER"),
        "buyer-signature": createPhoto("buyer-signature", "Buyer Digital Signature", "Chirag Hegde · Delivery Bill Signed", "signature", "#f59e0b", "SIGNATURE"),
        "buyer-thumb": createPhoto("buyer-thumb", "Buyer Biometric Thumb", "UIDAI Biometric Stamp Valid", "thumb", "#3b82f6", "BIOMETRIC"),
        "buyer-2": createPhoto("buyer-2", "Buyer Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "buyer-3": createPhoto("buyer-3", "Buyer Aadhaar Card (Back)", "Address: Banashankari 3rd Stage Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "buyer-4": createPhoto("buyer-4", "Buyer PAN Card", "Income Tax Dept · EPMCH9921K", "id_card", "#6366f1", "PAN CARD"),
        "buyer-5": createPhoto("buyer-5", "Buyer Driving Licence", "KA RTO Banashankari · MCWG", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "buyer-11": createPhoto("buyer-11", "Buyer Sale Delivery Note", "Metro Motors Official Booking Invoice", "id_card", "#84cc16", "SALE BILL"),
        // Witnesses
        "witness-1-1": createPhoto("witness-1-1", "Seller Witness Photo", "Wasim Khan", "person", "#f59e0b", "WITNESS 1"),
        "witness-1-2": createPhoto("witness-1-2", "Witness 1 Signature", "Wasim Khan Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-signature": createPhoto("witness-1-signature", "Witness 1 Signature", "Wasim Khan Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-3": createPhoto("witness-1-3", "Witness 1 Thumb Impression", "Wasim Khan Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-1-thumb": createPhoto("witness-1-thumb", "Witness 1 Thumb Impression", "Wasim Khan Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-1": createPhoto("witness-2-1", "Buyer Witness Photo", "Gautam Rao", "person", "#06b6d4", "WITNESS 2"),
        "witness-2-2": createPhoto("witness-2-2", "Witness 2 Signature", "Gautam Rao Attestation", "signature", "#06b6d4", "SIGNATURE"),
        "witness-2-signature": createPhoto("witness-2-signature", "Witness 2 Signature", "Gautam Rao Attestation", "signature", "#06b6d4", "SIGNATURE"),
        "witness-2-3": createPhoto("witness-2-3", "Witness 2 Thumb Impression", "Gautam Rao Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-thumb": createPhoto("witness-2-thumb", "Witness 2 Thumb Impression", "Gautam Rao Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
      },
      notes: "Track-inspired sports commuter with quickshifter. High demand unit with token advance received.",
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 5. TVS Jupiter 125 Disc SmartXonnect (2 Wheeler without Gear) - Sold
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "deal-demo-tvs-jupiter-125",
      kind: "deal",
      schema_version: 1,
      bill_number: "Bill-005",
      status: "Sold",
      rc_status: "Transferred",
      commission: 11000,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      vehicle: {
        vehicle_type: "2 Wheeler without Gear",
        vehicle_name: "TVS Jupiter 125 Disc SmartXonnect",
        make: "TVS",
        model: "Jupiter 125",
        variant: "Disc SmartXonnect Bluetooth TFT Navigation",
        year: "2024",
        color: "Titanium Grey Metallic",
        vehicle_number: "KA-51-EF-2020",
        registration_number: "KA51EF2020",
        registration_date: "2024-01-10",
        engine_number: "TVS125G981249",
        chassis_number: "MD625BF84R109812",
        engine_cc: "124",
        fuel_type: "Petrol",
        transmission: "Automatic",
        odometer: "3850",
        ownership: "First Owner",
        condition: "Excellent",
        bought_date: "2026-09-14",
        sold_date: "2026-09-29",
        keys: "2",
        service_history: "Maintained at Tristar TVS Electronic City. Under-seat dual helmet storage clean, Bluetooth app pairing active.",
        tax: "Lifetime",
        tax_valid_until: "2039-01-09",
        fitness: "Valid",
        fitness_valid_until: "2039-01-09",
        insurance: "Active",
        insurance_policy: "GO-DIGIT-TW-9912048",
        insurance_valid_until: "2027-01-08",
        puc_valid_until: "2026-12-15",
        hypothecation: "No",
        financier: "",
        noc: "Not Required",
      },
      seller: {
        name: "Harish Gowda",
        father_name: "Bore Gowda",
        phone: "9980123984",
        alternate_phone: "9980123985",
        email: "harish.gowda@gmail.com",
        address: "#82, Nagarbhavi 2nd Stage, Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560072",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-3891",
        pan_number: "CGHPS9921D",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Kiran Gowda",
          phone: "9980223985",
          address: "#82, Nagarbhavi 2nd Stage, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-3892",
        },
        {
          name: "Praveen Reddy",
          phone: "9739019284",
          address: "Electronic City Phase 1, Bengaluru",
          id_type: "Driving Licence",
          id_number: "KA51 20210008451",
        },
      ],
      maintenance: {
        services: [
          { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
          { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
        ],
        total_expense: "1450",
        notes: "TVS Tru4 synthetic oil service and showroom deep detailing completed.",
      },
      buyer: {
        name: "Naveen Reddy",
        father_name: "Pratap Reddy",
        phone: "9739019283",
        alternate_phone: "9739019284",
        email: "naveen.reddy@infosys.com",
        address: "Flat 104, Sai Sannidhi, Electronic City Phase 1",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560100",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-7720",
        pan_number: "DKNPR8812M",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Ramesh Babu (Electronic City RTO)",
        phone: "9886012345",
        email: "ramesh.rto@gmail.com",
        task: "KA-51 Electronic City RTO transfer, smart card printing & dispatch",
        total_amount: "2200",
        amount_paid: "2200",
        amount_balance: "0",
      },
      payments: {
        purchase_price: "68000",
        selling_price: "79000",
        paid_to_seller: "68000",
        received_from_buyer: "79000",
        payment_method: "UPI",
        payment_date: "2026-09-29",
        transaction_reference: "UPI-GPAY-991204812",
        notes: "Full payment ₹79,000 cleared via Google Pay UPI. Official delivery handover completed.",
      },
      photos: {
        // Vehicle photo suite
        "vehicle-1": createPhoto("vehicle-1", "Front Apron & LED DRL", "TVS Jupiter 125 · KA-51-EF-2020", "scooter", "#10b981", "2W AUTO"),
        "vehicle-2": createPhoto("vehicle-2", "Rear & Tail Cluster", "Signature LED light guide & number plate intact", "scooter", "#10b981", "2W AUTO"),
        "vehicle-3": createPhoto("vehicle-3", "Front Fuel Fill & Legroom", "External front fuel filler & front glove box", "scooter", "#10b981", "2W AUTO"),
        "vehicle-4": createPhoto("vehicle-4", "Disc Brake & Diamond Wheels", "Front petal disc brake & alloy rims", "scooter", "#10b981", "2W AUTO"),
        "vehicle-5": createPhoto("vehicle-5", "Odometer: 3,850 km", "Color TFT SmartXonnect screen verified", "odometer", "#10b981", "ODOMETER"),
        "vehicle-6": createPhoto("vehicle-6", "Engine Stamping", "TVS125G981249 ETFi Match", "engine", "#6366f1", "ENGINE NO"),
        "vehicle-7": createPhoto("vehicle-7", "Chassis VIN Number", "MD625BF84R109812 Stamped Chassis", "chassis", "#ec4899", "CHASSIS NO"),
        "vehicle-8": createPhoto("vehicle-8", "RC Smartcard & Insurance", "Digit Insurance Policy Valid 2027", "id_card", "#3b82f6", "DOCUMENTS"),
        // Seller identity suite
        "seller-1": createPhoto("seller-1", "Seller Portrait", "Harish Gowda (Verified)", "person", "#8b5cf6", "SELLER"),
        "seller-signature": createPhoto("seller-signature", "Seller Digital Signature", "Harish Gowda · Form 29/30 Cleared", "signature", "#f59e0b", "SIGNATURE"),
        "seller-thumb": createPhoto("seller-thumb", "Seller Biometric Thumb", "Inked Left Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "seller-2": createPhoto("seller-2", "Seller Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "seller-3": createPhoto("seller-3", "Seller Aadhaar Card (Back)", "Address: Nagarbhavi 2nd Stage Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "seller-4": createPhoto("seller-4", "Seller PAN Card", "Income Tax Dept · CGHPS9921D", "id_card", "#6366f1", "PAN CARD"),
        "seller-5": createPhoto("seller-5", "Seller Driving Licence", "KA RTO Nagarbhavi · MCWG/LMV", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "seller-8": createPhoto("seller-8", "Original RC Smartcard (Front)", "KA-51-EF-2020 · TVS Motor Company", "id_card", "#f97316", "RC CARD"),
        "seller-9": createPhoto("seller-9", "Original RC Smartcard (Back)", "First Owner · Lifetime Road Tax Paid", "id_card", "#f97316", "RC CARD"),
        "seller-11": createPhoto("seller-11", "Seller Purchase Agreement", "Metro Motors Showroom Acquisition Deed", "id_card", "#84cc16", "AGREEMENT"),
        // Buyer identity suite
        "buyer-1": createPhoto("buyer-1", "Buyer Portrait", "Naveen Reddy (Verified)", "person", "#10b981", "BUYER"),
        "buyer-signature": createPhoto("buyer-signature", "Buyer Digital Signature", "Naveen Reddy · Final Delivery Deed", "signature", "#f59e0b", "SIGNATURE"),
        "buyer-thumb": createPhoto("buyer-thumb", "Buyer Biometric Thumb", "UIDAI Biometric Stamp Valid", "thumb", "#3b82f6", "BIOMETRIC"),
        "buyer-2": createPhoto("buyer-2", "Buyer Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "buyer-3": createPhoto("buyer-3", "Buyer Aadhaar Card (Back)", "Address: Electronic City Phase 1 Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "buyer-4": createPhoto("buyer-4", "Buyer PAN Card", "Income Tax Dept · DKNPR8812M", "id_card", "#6366f1", "PAN CARD"),
        "buyer-5": createPhoto("buyer-5", "Buyer Driving Licence", "KA RTO Electronic City · MCWOG", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "buyer-11": createPhoto("buyer-11", "Buyer Vehicle Bill", "Metro Motors Official Gate Pass & Invoice", "id_card", "#84cc16", "SALE BILL"),
        // Witnesses
        "witness-1-1": createPhoto("witness-1-1", "Seller Witness Photo", "Kiran Gowda", "person", "#f59e0b", "WITNESS 1"),
        "witness-1-2": createPhoto("witness-1-2", "Witness 1 Signature", "Kiran Gowda Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-signature": createPhoto("witness-1-signature", "Witness 1 Signature", "Kiran Gowda Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-3": createPhoto("witness-1-3", "Witness 1 Thumb Impression", "Kiran Gowda Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-1-thumb": createPhoto("witness-1-thumb", "Witness 1 Thumb Impression", "Kiran Gowda Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-1": createPhoto("witness-2-1", "Buyer Witness Photo", "Praveen Reddy", "person", "#ec4899", "WITNESS 2"),
        "witness-2-2": createPhoto("witness-2-2", "Witness 2 Signature", "Praveen Reddy Attestation", "signature", "#ec4899", "SIGNATURE"),
        "witness-2-signature": createPhoto("witness-2-signature", "Witness 2 Signature", "Praveen Reddy Attestation", "signature", "#ec4899", "SIGNATURE"),
        "witness-2-3": createPhoto("witness-2-3", "Witness 2 Thumb Impression", "Praveen Reddy Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-thumb": createPhoto("witness-2-thumb", "Witness 2 Thumb Impression", "Praveen Reddy Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
      },
      notes: "Feature-packed 125cc family scooter with Bluetooth turn-by-turn navigation. Smooth handover with zero pending tasks.",
    },
    // ═════════════════════════════════════════════════════════════════════════
    // 6. Royal Enfield Himalayan 450 (2 Wheeler with Gear) - In Stock, RC Pending
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: "deal-demo-himalayan-450",
      kind: "deal",
      schema_version: 1,
      bill_number: "Bill-006",
      status: "In Stock",
      rc_status: "Pending",
      commission: 30550,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      vehicle: {
        vehicle_type: "2 Wheeler with Gear",
        vehicle_name: "Royal Enfield Himalayan 450 Summit Hanle Black",
        make: "Royal Enfield",
        model: "Himalayan 450",
        variant: "Summit Edition Tubeless Cross-Spoke",
        year: "2024",
        color: "Hanle Black & Gold",
        vehicle_number: "KA-04-MZ-4450",
        registration_number: "KA04MZ4450",
        registration_date: "2024-03-22",
        engine_number: "RE450SH09218",
        chassis_number: "ME3K4H04PRA049214",
        engine_cc: "452",
        fuel_type: "Petrol",
        transmission: "Manual",
        odometer: "4200",
        ownership: "First Owner",
        condition: "Showroom Pristine",
        bought_date: "2026-10-18",
        sold_date: "",
        keys: "2",
        service_history: "Full authorized service history at Acclaim Motors Yelahanka. First 5,000km check completed with Motul 7100 fully synthetic.",
        tax: "Lifetime",
        tax_valid_until: "2039-03-21",
        fitness: "Valid",
        fitness_valid_until: "2039-03-21",
        insurance: "Active",
        insurance_policy: "HDFC-ERGO-TW-2024-44501",
        insurance_valid_until: "2027-03-20",
        puc_valid_until: "2027-03-20",
        hypothecation: "No",
        financier: "",
        noc: "Clear NOC Available",
      },
      seller: {
        name: "Aditya Vardhan Rao",
        father_name: "K. S. Narayana Rao",
        phone: "9845019283",
        alternate_phone: "9845019284",
        email: "aditya.rao@motorcycles-blr.com",
        address: "Villa 42, Palm Meadows, Whitefield",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560066",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-4521",
        pan_number: "APVPR9042K",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      witnesses: [
        {
          name: "Vikas Menon",
          phone: "9845119285",
          address: "Palm Meadows Phase 2, Whitefield, Bengaluru",
          id_type: "Aadhaar",
          id_number: "XXXX-XXXX-7712",
        },
        {
          name: "Siddharth Hegde",
          phone: "9980128472",
          address: "Indiranagar 100ft Road, Bengaluru",
          id_type: "Driving Licence",
          id_number: "KA03 20200007821",
        },
      ],
      maintenance: {
        services: [
          { id: "lof", name: "Lube, Oil, and Filter (LOF)", price: "850", enabled: true },
          { id: "detailing_wash", name: "Showroom Detailing, Teflon Coating & Wash", price: "600", enabled: true },
        ],
        total_expense: "1450",
        notes: "Liquid-cooled Sherpa 450 synthetic lube service, chain tensioning & premium ceramic seal wash completed.",
      },
      buyer: {
        name: "Rohit Chandrashekar",
        father_name: "Chandrashekar Murthy",
        phone: "9900887711",
        alternate_phone: "9900887712",
        email: "rohit.c@cloudtech.io",
        address: "Apartment 1202, Sobha Windfall, Thanisandra Main Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560077",
        id_type: "Aadhaar",
        id_number: "XXXX-XXXX-9934",
        pan_number: "BRCPM1092F",
        is_dealer: false,
        dealer_name: "",
        gst_number: "",
        dealer_address: "",
      },
      agent: {
        name: "Ramesh Babu (RTO Specialist)",
        phone: "9886012345",
        email: "ramesh.rto.services@gmail.com",
        task: "KA-04 Yeshwanthpur to KA-50 Yelahanka RTO transfer & Hypothecation clearance",
        total_amount: "2800",
        amount_paid: "2800",
        amount_balance: "0",
      },
      payments: {
        purchase_price: "285000",
        selling_price: "317000",
        paid_to_seller: "285000",
        received_from_buyer: "50000",
        payment_method: "Bank Transfer",
        payment_date: "2026-10-20",
        transaction_reference: "HDFCN26102008451",
        notes: "Token advance of ₹50,000 received via HDFC NetBanking. Balance ₹2,67,000 due upon final delivery.",
      },
      photos: {
        // Vehicle photo suite
        "vehicle-1": createPhoto("vehicle-1", "Front 3/4 & TFT Tripper Display", "Himalayan 450 Summit · KA-04-MZ-4450", "bike_gear", "#f59e0b", "2W GEARED"),
        "vehicle-2": createPhoto("vehicle-2", "Rear Luggage Rack & Dual Exhaust", "Cross-spoke tubeless wheel & integrated LED indicators", "bike_gear", "#f59e0b", "2W GEARED"),
        "vehicle-3": createPhoto("vehicle-3", "Sherpa 452cc DOHC Engine", "Liquid-cooled DOHC 40PS engine case verified", "engine", "#f59e0b", "ENGINE NO"),
        "vehicle-4": createPhoto("vehicle-4", "USD Showa Fork & Dual ABS", "ByBre calipers & 320mm front disc brake", "bike_gear", "#f59e0b", "2W GEARED"),
        "vehicle-5": createPhoto("vehicle-5", "Odometer: 4,200 km", "Full-color round TFT Google Maps console verified", "odometer", "#10b981", "ODOMETER"),
        "vehicle-6": createPhoto("vehicle-6", "Engine Stamping", "RE450SH09218 Match Verified", "engine", "#6366f1", "ENGINE NO"),
        "vehicle-7": createPhoto("vehicle-7", "Chassis VIN Number", "ME3K4H04PRA049214 Stamped Chassis", "chassis", "#ec4899", "CHASSIS NO"),
        "vehicle-8": createPhoto("vehicle-8", "RC Smartcard & Insurance", "HDFC ERGO Comprehensive Valid 2027", "id_card", "#3b82f6", "DOCUMENTS"),
        // Seller identity suite
        "seller-1": createPhoto("seller-1", "Seller Portrait", "Aditya Vardhan Rao (Verified)", "person", "#8b5cf6", "SELLER"),
        "seller-signature": createPhoto("seller-signature", "Seller Digital Signature", "Aditya V. Rao · Form 29/30 Cleared", "signature", "#f59e0b", "SIGNATURE"),
        "seller-thumb": createPhoto("seller-thumb", "Seller Biometric Thumb", "Inked Left Thumb Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "seller-2": createPhoto("seller-2", "Seller Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "seller-3": createPhoto("seller-3", "Seller Aadhaar Card (Back)", "Address: Palm Meadows, Whitefield, Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "seller-4": createPhoto("seller-4", "Seller PAN Card", "Income Tax Dept · APVPR9042K", "id_card", "#6366f1", "PAN CARD"),
        "seller-5": createPhoto("seller-5", "Seller Driving Licence", "KA RTO KR Puram · MCWG/LMV", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "seller-8": createPhoto("seller-8", "Original RC Smartcard (Front)", "KA-04-MZ-4450 · Royal Enfield", "id_card", "#f97316", "RC CARD"),
        "seller-9": createPhoto("seller-9", "Original RC Smartcard (Back)", "First Owner · Lifetime Tax Paid", "id_card", "#f97316", "RC CARD"),
        "seller-11": createPhoto("seller-11", "Seller Purchase Agreement", "Metro Motors Showroom Acquisition Deed", "id_card", "#84cc16", "AGREEMENT"),
        // Buyer identity suite
        "buyer-1": createPhoto("buyer-1", "Buyer Portrait", "Rohit Chandrashekar (Verified)", "person", "#10b981", "BUYER"),
        "buyer-signature": createPhoto("buyer-signature", "Buyer Digital Signature", "Rohit Chandrashekar · Token Deed", "signature", "#f59e0b", "SIGNATURE"),
        "buyer-thumb": createPhoto("buyer-thumb", "Buyer Biometric Thumb", "UIDAI Biometric Stamp Valid", "thumb", "#3b82f6", "BIOMETRIC"),
        "buyer-2": createPhoto("buyer-2", "Buyer Aadhaar Card (Front)", "UIDAI Government of India", "id_card", "#10b981", "AADHAAR"),
        "buyer-3": createPhoto("buyer-3", "Buyer Aadhaar Card (Back)", "Address: Thanisandra Main Road, Bengaluru", "id_card", "#10b981", "AADHAAR"),
        "buyer-4": createPhoto("buyer-4", "Buyer PAN Card", "Income Tax Dept · BRCPM1092F", "id_card", "#6366f1", "PAN CARD"),
        "buyer-5": createPhoto("buyer-5", "Buyer Driving Licence", "KA RTO Yelahanka · MCWG", "id_card", "#06b6d4", "DRIVING LICENCE"),
        "buyer-11": createPhoto("buyer-11", "Buyer Vehicle Booking Receipt", "Metro Motors Official Booking Voucher", "id_card", "#84cc16", "SALE BILL"),
        // Witnesses
        "witness-1-1": createPhoto("witness-1-1", "Seller Witness Photo", "Vikas Menon", "person", "#f59e0b", "WITNESS 1"),
        "witness-1-2": createPhoto("witness-1-2", "Witness 1 Signature", "Vikas Menon Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-signature": createPhoto("witness-1-signature", "Witness 1 Signature", "Vikas Menon Attestation", "signature", "#f59e0b", "SIGNATURE"),
        "witness-1-3": createPhoto("witness-1-3", "Witness 1 Thumb Impression", "Vikas Menon Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-1-thumb": createPhoto("witness-1-thumb", "Witness 1 Thumb Impression", "Vikas Menon Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-1": createPhoto("witness-2-1", "Buyer Witness Photo", "Siddharth Hegde", "person", "#ec4899", "WITNESS 2"),
        "witness-2-2": createPhoto("witness-2-2", "Witness 2 Signature", "Siddharth Hegde Attestation", "signature", "#ec4899", "SIGNATURE"),
        "witness-2-signature": createPhoto("witness-2-signature", "Witness 2 Signature", "Siddharth Hegde Attestation", "signature", "#ec4899", "SIGNATURE"),
        "witness-2-3": createPhoto("witness-2-3", "Witness 2 Thumb Impression", "Siddharth Hegde Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
        "witness-2-thumb": createPhoto("witness-2-thumb", "Witness 2 Thumb Impression", "Siddharth Hegde Inked Impression", "thumb", "#3b82f6", "BIOMETRIC"),
      },
      notes: "Showroom flagship adventure tourer with liquid-cooled Sherpa 452cc engine. Immaculate condition with all original keys and tools.",
    },
  ];
};
