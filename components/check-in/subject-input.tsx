type SubjectInputProps = {
  defaultValue?: string;
};

export function SubjectInput({ defaultValue }: SubjectInputProps) {
  return (
    <label className="block space-y-2">
      <span>Subject</span>
      <input
        name="subject"
        required
        minLength={1}
        maxLength={100}
        defaultValue={defaultValue}
        placeholder="Operating Systems"
        className="w-full rounded-md border px-3 py-2"
      />
    </label>
  );
}
