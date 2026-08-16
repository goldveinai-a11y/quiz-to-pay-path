export type PlanDay = {
  day: number;
  title: string;
  reference: string;
  unlockAt: string;
  unlocked: boolean;
  done: boolean;
  step: number;
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
  hero: {
    day: number;
    title: string;
    setup: string;
    reference: string;
    tone: string;
    complete: boolean;
  } | null;
  otherBooks: { slug: string; title: string }[];
};

export type DivideReading = { tradition: string; reading: string; verses?: string };

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
  insight: { title: string; body: string; author: string; year: string };
  context: string;
  divide: {
    question: string;
    readings: DivideReading[];
    common: string | null;
  } | null;
  question: string;
  step: number;
  note: string | null;
  done: boolean;
  next: { day: number; title: string; unlockAt: string } | null;
};

export const BOOK_TITLES: Record<string, string> = {
  john: "John in 30 days",
  mark: "Mark in 30 days",
  psalms: "Psalms in 30 days",
};

/** Quiz themes map onto the three books that exist today. */
export const THEME_TO_BOOK: Record<string, string> = {
  anxiety: "psalms",
  grief: "psalms",
  guilt: "psalms",
  doubt: "john",
  purpose: "john",
  relationship: "mark",
  money: "mark",
  nothing: "john",
};