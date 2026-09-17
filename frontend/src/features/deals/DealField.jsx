import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export const fieldId = (prefix, key) => `${prefix}-${key}`.replace(/[_.]/g, "-");
export const DealField = ({ config, prefix, value, onChange, error, readOnly = false }) => {
  const { key, label, type, required, options, min, max, step } = config;
  const id = fieldId(prefix, key);
  const props = { id, value: value ?? "", onChange: e => onChange(key, e.target.value), "data-testid": `${id}-input`, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined, "aria-required": !!required, disabled: readOnly };
  return <label className={`form-field wizard-field ${type === "textarea" ? "field-wide" : ""}`} htmlFor={id}>
    <span>{label}{required && <em>*</em>}</span>
    {type === "select" ? <select {...props}>{options.map(option => <option key={option}>{option}</option>)}</select> : type === "textarea" ? <Textarea {...props} rows={3}/> : <Input {...props} type={type} min={type === "number" ? min ?? 0 : undefined} max={max} step={step} maxLength={type === "number" ? undefined : 500} autoComplete="off"/>}
    {error && <small className="field-error" id={`${id}-error`} data-testid={`${id}-error`}>{error}</small>}
  </label>;
};
export const FieldGrid = ({ fields, value, prefix, onChange, errors = {} }) => <div className="form-grid wizard-fields">{fields.map(config => <DealField key={config.key} config={config} prefix={prefix} value={value[config.key]} onChange={onChange} error={errors[`${prefix}.${config.key}`]}/>)}</div>;