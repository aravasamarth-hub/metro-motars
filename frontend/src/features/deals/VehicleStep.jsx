import { FieldGrid, DealField } from "./DealField";
import { vehicleGroups } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
export const VehicleStep = ({ deal, update, updateSection, setPhoto, errors }) => <>
  <section className="wizard-group"><div className="section-title"><h2>Deal status</h2><span className="required-note">* Required fields</span></div><div className="form-grid wizard-fields">
    <DealField prefix="deal" config={{ key: "status", label: "Stock status", type: "select", options: ["In Stock", "Sold"] }} value={deal.status} onChange={update}/>
    <DealField prefix="deal" config={{ key: "rc_status", label: "RC transfer status", type: "select", options: ["Pending", "Completed"] }} value={deal.rc_status} onChange={update}/>
  </div></section>
  {vehicleGroups.map(group => <section className="wizard-group" key={group.title}><div className="section-title"><h2>{group.title}</h2></div><FieldGrid fields={group.fields.map(f => f.key === "sold_date" ? { ...f, required: deal.status === "Sold" } : f)} prefix="vehicle" value={deal.vehicle} errors={errors} onChange={(key, value) => updateSection("vehicle", key, value)}/></section>)}
  <PhotoSlots group="vehicle" photos={deal.photos} onChange={setPhoto}/>
</>;