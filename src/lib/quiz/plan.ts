import type { Answers } from "./types";

const TRADITION_MAP: Record<string, { translation: string; voices: string }> = {
  catholic: { translation: "WEB (with the deuterocanon)", voices: "Augustine, Aquinas, Ratzinger" },
  orthodox: { translation: "WEB (with the deuterocanon)", voices: "Chrysostom, Athanasius, Schmemann" },
  baptist: { translation: "KJV", voices: "Spurgeon, Stott, Keller" },
  reformed: { translation: "WEB", voices: "Calvin, Owen, Sproul" },
  pentecostal: { translation: "WEB", voices: "Fee, Yong, Cho" },
  "just-christian": { translation: "WEB", voices: "Lewis, Wright, Keller" },
  unsure: { translation: "WEB (easy to read, modern English)", voices: "Lewis, Wright, Keller" },
};

const THEME_BOOK: Record<string, { book: string; why: string }> = {
  anxiety: { book: "Philippians", why: "Paul writes it from a prison cell and still calls it a letter about joy." },
  relationship: { book: "Ruth", why: "Four short chapters on loyalty when everything has fallen apart." },
  money: { book: "Proverbs", why: "The most practical book in the Bible about work, money and words." },
  guilt: { book: "Psalms", why: "Psalm 51 is what forgiveness sounds like from the inside." },
  doubt: { book: "John", why: "Written specifically for people who are not sure yet." },
  grief: { book: "Psalms", why: "A third of the Psalms are laments. Grief has language here." },
  purpose: { book: "Ephesians", why: "Six chapters on who you are before anything you do." },
  nothing: { book: "Mark", why: "The fastest gospel — the whole story in about two hours of reading." },
};

export type PlanResult = {
  name: string;
  email: string;
  book: string;
  bookWhy: string;
  translation: string;
  voices: string;
  daysPerWeek: string;
  sessions: number;
  timeOfDay: string;
  minutes: number;
  understandingNow: number;
  understandingAfter: number;
  themes: string[];
  showBothSides: boolean;
};

const TIME_LABEL: Record<string, string> = {
  morning: "morning",
  lunch: "lunch break",
  evening: "evening",
  bed: "just before bed",
};

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

export function buildPlan(answers: Answers): PlanResult {
  const tradition = (answers["tradition"] as string) ?? "unsure";
  const trad = TRADITION_MAP[tradition] ?? TRADITION_MAP["unsure"]!;
  const themes = asArray(answers["themes"]).filter((t) => t !== "nothing");
  const primary = themes[0] ?? "nothing";
  const book = THEME_BOOK[primary] ?? THEME_BOOK["nothing"]!;
  const days = (answers["days"] as string) ?? "4-5";
  const sessions = days === "2-3" ? 3 : days === "6-7" ? 7 : 5;
  const now = Number(answers["understanding"] ?? 4);
  const depth = (answers["analysis_depth"] as string) ?? "shorter";

  return {
    name: ((answers["name"] as string) ?? "friend").trim() || "friend",
    email: (answers["email"] as string) ?? "",
    book: book.book,
    bookWhy: book.why,
    translation: trad.translation,
    voices: trad.voices,
    daysPerWeek: days.replace("-", "–"),
    sessions,
    timeOfDay: TIME_LABEL[(answers["time-of-day"] as string) ?? "morning"] ?? "morning",
    minutes: depth === "deeper" ? 12 : 7,
    understandingNow: now,
    understandingAfter: Math.min(10, Math.max(now + 3, 7)),
    themes,
    showBothSides: answers["disagreements"] === "both",
  };
}

export const THEME_LABELS: Record<string, string> = {
  anxiety: "Anxiety",
  relationship: "A relationship",
  money: "Money or work",
  guilt: "Guilt",
  doubt: "Doubt",
  grief: "Grief",
  purpose: "Purpose",
};
