export type StepKind =
  | "single"
  | "multi"
  | "cards"
  | "statement"
  | "interstitial"
  | "slider"
  | "demo"
  | "text"
  | "email"
  | "analysis";

export type Option = {
  value: string;
  label: string;
  emoji?: string;
  image?: string;
  hint?: string;
};

export type Step = {
  id: string;
  kind: StepKind;
  section: string;
  title: string;
  subtitle?: string;
  options?: Option[];
  minLabel?: string;
  maxLabel?: string;
  cta?: string;
  source?: string;
  placeholder?: string;
  /** interstitial only — overrides the built-in look. See StepRenderer's INTERSTITIAL_DEFAULTS fallback. */
  eyebrow?: string;
  bullets?: string[];
  tone?: "teal" | "terra" | "indigo" | "olive";
};

export type Answers = Record<string, string | string[] | number>;
