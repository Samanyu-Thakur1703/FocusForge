export function ProblemStatementField() {
  return (
    <label className="block space-y-2">
      <span>What is stopping you from studying right now?</span>
      <textarea
        name="problemStatement"
        maxLength={500}
        rows={4}
        placeholder="I keep checking Instagram"
        className="w-full rounded-md border px-3 py-2"
      />
    </label>
  );
}
