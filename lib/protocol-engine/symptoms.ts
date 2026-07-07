export const symptomKeys = [
  "cant_start",
  "phone_distraction",
  "social_media",
  "sleepiness",
  "anxiety",
  "mind_wandering",
  "low_motivation",
  "burnout",
  "overwhelm"
] as const;

export type SymptomKey = (typeof symptomKeys)[number];

export const symptomOptions: ReadonlyArray<{ key: SymptomKey; label: string }> = [
  { key: "cant_start", label: "Can't start studying" },
  { key: "phone_distraction", label: "Phone distraction" },
  { key: "social_media", label: "Social media distraction" },
  { key: "sleepiness", label: "Sleepiness" },
  { key: "anxiety", label: "Anxiety" },
  { key: "mind_wandering", label: "Mind wandering" },
  { key: "low_motivation", label: "Lack of motivation" },
  { key: "burnout", label: "Burnout" },
  { key: "overwhelm", label: "Overwhelm" }
];
