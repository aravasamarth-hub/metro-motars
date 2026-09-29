import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const fieldId = (prefix, key) => `${prefix}-${key}`.replace(/[_.]/g, "-");

const optionKeyMap = {
  "In Stock": "opt.in_stock",
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
};

export const DealField = ({ config, prefix, value, onChange, error, readOnly = false }) => {
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
    <label className={`form-field wizard-field ${type === "textarea" ? "field-wide" : ""}`} htmlFor={id}>
      <span>{translatedLabel}{required && <em>*</em>}</span>
      {type === "select" ? (
        <select {...props}>
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
        onChange={onChange}
        error={errors[`${prefix}.${config.key}`]}
      />
    ))}
  </div>
);