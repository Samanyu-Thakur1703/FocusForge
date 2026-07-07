import { symptomOptions } from "@/lib/protocol-engine/symptoms";

export function SymptomPicker() {
  return (
    <fieldset className="space-y-3">
      <legend>Choose all that apply</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {symptomOptions.map((symptom) => (
          <label key={symptom.key} className="flex items-center gap-2 rounded-md border p-3">
            <input name="symptomKeys" type="checkbox" value={symptom.key} />
            <span>{symptom.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
