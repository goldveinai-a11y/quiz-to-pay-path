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

const READER_TYPE: Record<string, string> = {
  understand: "an Honest Reader",
  "hard-season": "a Reader in a Hard Season",
  habit: "a Restarter",
  group: "a Reluctant Guide",
  returning: "a Returner",
};

type Obstacle = { name: string; line: string; bullet: string };

const OBSTACLES: Record<string, Obstacle> = {
  "dont-understand": {
    name: "missing context",
    line: "you read the words, but not who they were written to.",
    bullet: "Context before every passage — who is speaking, to whom, and why it mattered then",
  },
  "lose-thread": {
    name: "a lost thread",
    line: "every passage lands on its own and the story never joins up.",
    bullet: "Every session is a numbered step in one story, never a verse at random",
  },
  bored: {
    name: "a flat page",
    line: "the text goes past and nothing catches.",
    bullet: "One thing per session that changes how the passage reads — never a wall of notes",
  },
  guilt: {
    name: "the guilt loop",
    line: "one missed day quietly turns into a missed month.",
    bullet: "Counters that only go up. Miss a week and nothing you have done disappears",
  },
  "where-start": {
    name: "a blank page",
    line: "opening it means deciding where to begin, every single time.",
    bullet: "Tomorrow's passage is already chosen. You open it and read",
  },
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
  readerType: string;
  obstacleName: string;
  obstacleLine: string;
  bullets: string[];
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
  const trigger = (answers["trigger"] as string) ?? "understand";
  const readerType = READER_TYPE[trigger] ?? READER_TYPE["understand"]!;
  const blockers = asArray(answers["blockers"]);
  const obs = OBSTACLES[blockers[0] ?? "dont-understand"] ?? OBSTACLES["dont-understand"]!;
  const mins = depth === "deeper" ? 12 : 7;
  const tod = TIME_LABEL[(answers["time-of-day"] as string) ?? "morning"] ?? "morning";
  const style = (answers["style"] as string) ?? "explain-first";

  const bullets = [
    `Your 30-day plan through ${book.book}, one ${mins}-minute session in the ${tod}`,
    obs.bullet,
    style === "read-first"
      ? "The passage first, with help the moment you get stuck — the way you said you learn"
      : style === "depends"
        ? "Explanation or passage first — the session works either way, switch whenever you want"
        : "The explanation first, then the passage — the way you said you learn",
    "Tap any word for the original Greek or Hebrew. Free, forever.",
    answers["embarrassed"] === "yes"
      ? "Ask any question, however basic. Nobody sees it but you."
      : "Ask any question about the passage, any time.",
    answers["disagreements"] === "both"
      ? "See how Catholic, Orthodox and Protestant readings differ, side by side"
      : "Commentary from your own tradition only",
    "Notes, highlights and a streak that survives a missed day",
  ];
  if (trigger === "group") {
    bullets.splice(6, 0, "Prep your group's discussion — questions and a handout, ready to send");
  }

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
    readerType,
    obstacleName: obs.name,
    obstacleLine: obs.line,
    bullets,
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
