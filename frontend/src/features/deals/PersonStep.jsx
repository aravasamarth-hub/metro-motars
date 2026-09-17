import { Switch } from "@/components/ui/switch";
import { FieldGrid } from "./DealField";
import { dealerFields, personFields, witnessFields } from "./fieldConfig";
import { PhotoSlots } from "./PhotoSlots";
export const PersonStep = ({ group, deal, updateSection, updateWitness, setPhoto, errors }) => {
  const person = deal[group];
  const required = group === "seller" || deal.status === "Sold";
  return <>
    <section className="wizard-group"><div className="section-title"><h2>{group === "seller" ? "Seller details" : "Buyer details"}</h2><label className="dealer-toggle" htmlFor={`${group}-dealer`}><span>Dealer</span><Switch id={`${group}-dealer`} checked={person.is_dealer} onCheckedChange={value => updateSection(group, "is_dealer", value)} data-testid={`${group}-dealer-toggle`}/></label></div>
      {!required && <p className="empty-note" data-testid="buyer-optional-note">Buyer details are optional while the bike is in stock.</p>}
      <FieldGrid fields={personFields.map(f => ({ ...f, required: required && ["name", "phone"].includes(f.key) }))} value={person} prefix={group} errors={errors} onChange={(key, value) => updateSection(group, key, value)}/>
    </section>
    {person.is_dealer && <section className="wizard-group" data-testid={`${group}-dealer-fields`}><div className="section-title"><h2>Dealership details</h2></div><FieldGrid fields={dealerFields} value={person} prefix={group} errors={errors} onChange={(key, value) => updateSection(group, key, value)}/></section>}
    <PhotoSlots group={group} photos={deal.photos} onChange={setPhoto}/>
    <WitnessSection group={group} deal={deal} updateWitness={updateWitness} setPhoto={setPhoto} errors={errors}/>
  </>;
};
export const WitnessSection = ({ group, deal, updateWitness, setPhoto, errors }) => {
  const index = group === "seller" ? 0 : 1;
  return <section className="wizard-group" data-testid={`${group}-witness-section`}>
    <div className="section-title"><h2 data-testid={`${group}-witness-title`}>{group === "seller" ? "Seller witness" : "Buyer witness"}</h2><span className="slot-count">Optional</span></div>
    <FieldGrid fields={witnessFields} value={deal.witnesses[index]} prefix={`witnesses.${index}`} errors={errors} onChange={(key, value) => updateWitness(index, key, value)}/>
    <PhotoSlots group={`witness-${index + 1}`} photos={deal.photos} onChange={setPhoto}/>
  </section>;
};