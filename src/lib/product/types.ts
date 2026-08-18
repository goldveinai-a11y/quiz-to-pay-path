export type PlanDay = {
  day: number;
  title: string;
  reference: string;
  unlocked: boolean;
  done: boolean;
  step: number;
};

export type StreakState = {
  current: number;
  longest: number;
  /** True on a day the reader has already finished a session. */
  todayDone: boolean;
  freezesLeft: number;
};

export type WordNote = {
  word: string;
  original: string;
  transliteration: string;
  language: string;
  meaning: string;
  alsoIn: string | null;
};

export type SavedNote = {
  day: number;
  title: string;
  reference: string;
  question: string;
  note: string;
  completedAt: string | null;
};

export type SavedHighlight = {
  day: number;
  reference: string;
  verse: number;
  text: string;
};

export type MyPlan = {
  planId: string;
  bookSlug: string;
  bookTitle: string;
  translation: string;
  tradition: string;
  voices: string;
  showBothSides: boolean;
  readerName: string | null;
  startedAt: string;
  currentDay: number;
  finished: number;
  total: number;
  days: PlanDay[];
  streak: StreakState;
  notesCount: number;
  complete: boolean;
  hero: {
    day: number;
    title: string;
    setup: string;
    reference: string;
    tone: string;
    complete: boolean;
  } | null;
  otherBooks: { slug: string; title: string; finished: number }[];
};

export type DivideReading = { tradition: string; reading: string; verses?: string };

export type TraditionVoice = { tradition: string; reading: string };

export type CrossReference = { reference: string; note: string };

export type Application = { prompt: string; body: string };

export type SessionQuiz = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type SessionDay = {
  day: number;
  bookTitle: string;
  title: string;
  setup: string;
  reference: string;
  translation: string;
  tone: string;
  highlightWord: string | null;
  verses: { verse: number; text: string }[];
  words: WordNote[];
  insight: { title: string; body: string; author: string; year: string };
  context: string;
  crossReference: CrossReference | null;
  application: Application | null;
  voices: TraditionVoice[];
  /** Honest reading estimate, derived from the length of the session. */
  minutes: number;
  divide: {
    question: string;
    readings: DivideReading[];
    common: string | null;
  } | null;
  question: string;
  quiz: SessionQuiz | null;
  step: number;
  note: string | null;
  /** Verse numbers this reader has highlighted in this passage. */
  highlights: number[];
  done: boolean;
  next: { day: number; title: string } | null;
};

export const BOOK_TITLES: Record<string, string> = {
  john: "John in 30 days",
  mark: "Mark in 30 days",
  psalms: "Psalms in 30 days",
  philippians: "Philippians in 30 days",
  ruth: "Ruth in 30 days",
  proverbs: "Proverbs in 30 days",
  ephesians: "Ephesians in 30 days",
};

/** Quiz themes map onto the book the paywall promises. */
export const THEME_TO_BOOK: Record<string, string> = {
  anxiety: "philippians",
  grief: "psalms",
  guilt: "psalms",
  doubt: "john",
  purpose: "ephesians",
  relationship: "ruth",
  money: "proverbs",
  nothing: "john",
};