import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const fieldId = (prefix, key) => `${prefix}-${key}`.replace(/[_.]/g, "-");

const optionKeyMap = {
  "In Stock": "opt.in_stock",
  "Out of Stock": "opt.out_of_stock",
  "Sold": "opt.sold",
  "Pending": "opt.pending",
  "Completed": "opt.completed",
  "Petrol": "opt.petrol",
  "Electric": "opt.electric",
  "Diesel": "opt.diesel",
  "Other": "opt.other",
  "Manual": "opt.manual",
  "Automatic": "opt.automatic",
  "First Owner": "opt.first_owner",
  "Second Owner": "opt.second_owner",
  "Third Owner": "opt.third_owner",
  "Fourth Owner or More": "opt.fourth_owner",
  "Excellent": "opt.excellent",
  "Good": "opt.good",
  "Fair": "opt.fair",
  "Needs Repair": "opt.needs_repair",
  "Paid": "opt.paid",
  "Expired": "opt.expired",
  "Lifetime": "opt.lifetime",
  "Valid": "opt.valid",
  "Active": "opt.active",
  "Not Available": "opt.not_available",
  "Not Required": "opt.not_required",
  "Available": "opt.available",
  "Yes": "opt.yes",
  "No": "opt.no",
  "Closed": "opt.closed",
  "Cash": "opt.cash",
  "UPI": "opt.upi",
  "Bank Transfer": "opt.bank_transfer",
  "Cheque": "opt.cheque",
  "Mixed": "opt.mixed",
  "Aadhaar": "opt.aadhaar",
  "Driving Licence": "opt.driving_licence",
  "Passport": "opt.passport",
  "Voter ID": "opt.voter_id",
  "January": "month.january",
  "February": "month.february",
  "March": "month.march",
  "April": "month.april",
  "May": "month.may",
  "June": "month.june",
  "July": "month.july",
  "August": "month.august",
  "September": "month.september",
  "October": "month.october",
  "November": "month.november",
  "December": "month.december",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function toMonthInputValue(year, month) {
  if (!year && !month) return "";
  let y = String(year || "").trim();
  let m = String(month || "").trim();

  if (/^\d{4}-\d{2}$/.test(y)) return y;

  const yMatch = y.match(/\d{4}/);
  const cleanYear = yMatch ? yMatch[0] : "";
  if (!cleanYear) return "";

  let mNum = 1;
  if (m) {
    const idx = MONTH_NAMES.findIndex(name => name.toLowerCase() === m.toLowerCase());
    if (idx !== -1) {
      mNum = idx + 1;
    } else {
      const parsed = parseInt(m, 10);
      if (parsed >= 1 && parsed <= 12) mNum = parsed;
    }
  }
  return `${cleanYear}-${String(mNum).padStart(2, "0")}`;
}

export const DealField = ({ config, prefix, value, allValues, onChange, error, readOnly = false }) => {
  const { t } = useLanguage();
  const { key, label, type, required, options, min, max, step, placeholder } = config;
  const id = fieldId(prefix, key);

  // Translate label
  let translatedLabel = label;
  if (prefix === "agent" && t(`agent.${key}`)) {
    translatedLabel = t(`agent.${key}`, label);
  } else if (prefix && String(prefix).startsWith("witness") && key === "id_number") {
    translatedLabel = t("field.witness_id_details", label);
  } else {
    translatedLabel = t(`field.${key}`, label);
  }

  // Translate placeholder if present
  const translatedPlaceholder = placeholder ? t(`placeholder.${key}`, placeholder) : undefined;

  const isMonth = type === "month" || type === "month_year";
  const monthInputValue = isMonth ? toMonthInputValue(value ?? allValues?.year, allValues?.mfg_month) : "";

  const handleMonthChange = (e) => {
    const val = e.target.value;
    if (!val) {
      try { onChange({ year: "", mfg_month: "" }); } catch (_) {}
      onChange("year", "");
      onChange("mfg_month", "");
      return;
    }
    const [y, mStr] = val.split("-");
    const mIndex = parseInt(mStr, 10) - 1;
    const monthName = MONTH_NAMES[mIndex] || "";
    try { onChange({ year: y, mfg_month: monthName }); } catch (_) {}
    onChange("year", y);
    onChange("mfg_month", monthName);
  };

  const props = {
    id,
    value: value ?? "",
    onChange: e => onChange(key, e.target.value),
    "data-testid": `${id}-input`,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    "aria-required": !!required,
    disabled: readOnly,
    placeholder: translatedPlaceholder,
  };

  return (
    <label className={`form-field wizard-field ${type === "textarea" || config.wide ? "field-wide" : ""}`} htmlFor={id}>
      <span>{translatedLabel}{required && <em>*</em>}</span>
      {isMonth ? (
        <Input
          id={id}
          type="month"
          value={monthInputValue}
          onChange={handleMonthChange}
          onClick={(e) => {
            try {
              e.target.showPicker?.();
            } catch (_) {}
          }}
          disabled={readOnly}
          data-testid={`${id}-input`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required={!!required}
          className="month-picker-input"
          autoComplete="off"
        />
      ) : type === "select" ? (
        <select {...props}>
          {key === "mfg_month" && (
            <option value="">{t("opt.select_month", "-- Select Month --")}</option>
          )}
          {options.map(option => {
            const optKey = optionKeyMap[option];
            const displayOption = optKey ? t(optKey, option) : option;
            return (
              <option key={option} value={option}>
                {displayOption}
              </option>
            );
          })}
        </select>
      ) : type === "textarea" ? (
        <Textarea {...props} rows={3} />
      ) : (
        <Input
          {...props}
          type={type}
          min={type === "number" ? min ?? 0 : undefined}
          max={max}
          step={step}
          maxLength={type === "number" ? undefined : 500}
          autoComplete="off"
        />
      )}
      {error && <small className="field-error" id={`${id}-error`} data-testid={`${id}-error`}>{error}</small>}
    </label>
  );
};

export const FieldGrid = ({ fields, value, prefix, onChange, errors = {} }) => (
  <div className="form-grid wizard-fields">
    {fields.map(config => (
      <DealField
        key={config.key}
        config={config}
        prefix={prefix}
        value={value[config.key]}
        allValues={value}
        onChange={onChange}
        error={errors[`${prefix}.${config.key}`]}
      />
    ))}
  </div>
);