/**
 * Entry segments.
 *
 * One landing page and one quiz, both reading their first screens from this
 * config. A segment arrives one of two ways:
 *   - from the URL (`/?v=no-time`, or utm_content=no-time) — paid traffic,
 *     the visitor sees their own hero immediately;
 *   - from the first quiz question — direct, shared and organic traffic,
 *     which never carries a tag.
 *
 * Both paths end up in the same place: `answers.segment`.
 */
import type { Step } from "./types";
import { SECTIONS, steps as baseSteps } from "./steps";

export type SegmentId = "no-time" | "emergency" | "default";

export type SegmentCopy = {
  id: SegmentId;
  /** Landing hero */
  headline: string;
  sub: string;
  cta: string;
  promises: string[];
  heroNote: string;
  /** Result page */
  resultBullet?: string;
  /** Steps that replace the generic section-1 questions */
  firstQuestions?: Step[];
};

const noTimeQuestions: Step[] = [
  {
    id: "falls-apart",
    kind: "single",
    section: SECTIONS[1],
    title: "Where does the day usually go?",
    subtitle: "The honest answer, not the one you'd give in church.",
    options: [
      { value: "morning-rush", label: "Mornings are already a scramble" },
      { value: "work", label: "Work swallows the middle of the day" },
      { value: "evening-tired", label: "By evening I've got nothing left" },
      { value: "phone", label: "The time exists — it goes to my phone" },
    ],
  },
  {
    id: "restarts",
    kind: "single",
    section: SECTIONS[1],
    title: "How many times have you started and stopped?",
    subtitle: "Nobody sees this but you.",
    options: [
      { value: "once", label: "Once" },
      { value: "few", label: "A few times" },
      { value: "lost-count", label: "I've lost count" },
      { value: "never-started", label: "I've never really got going" },
    ],
  },
  {
    id: "no-time-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "The plan is built for the week you actually have.",
    subtitle:
      "Nothing here needs a clear half hour or a perfect streak. One passage, sized to seven minutes, waiting where you left it.",
    eyebrow: "Why it stopped last time",
    tone: "indigo",
    bullets: [
      "No time → one passage sized to seven minutes, never a whole chapter",
      "Missed a day → nothing resets, you pick up exactly where you stopped",
      "Gone a week → day 6 is still day 6 when you come back",
    ],
    cta: "Continue",
  },
];

const emergencyQuestions: Step[] = [
  {
    id: "whats-happening",
    kind: "single",
    section: SECTIONS[1],
    title: "What's going on right now?",
    subtitle: "This decides where your first week starts.",
    options: [
      { value: "anxious", label: "I can't switch my head off" },
      { value: "grief", label: "I've lost someone or something" },
      { value: "relationship", label: "A relationship is breaking" },
      { value: "decision", label: "I have a decision I can't make" },
      { value: "shaken", label: "My faith itself feels shaky" },
      { value: "rather-not-say", label: "Rather not say" },
    ],
  },
  {
    id: "first-week",
    kind: "single",
    section: SECTIONS[1],
    title: "What would actually help in the first seven days?",
    options: [
      { value: "calm", label: "Something that settles me at night" },
      { value: "words", label: "Words for what I can't say out loud" },
      { value: "hope", label: "A reason to think this passes" },
      { value: "sense", label: "Some sense of what any of it means" },
    ],
  },
  {
    id: "emergency-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "It starts where you are, not at Genesis.",
    subtitle:
      "You won't be handed a chapter about somebody else's problem. Your first passage is chosen for what you just told us, and it's explained before you read a word of it.",
    eyebrow: "What happens next",
    tone: "terra",
    bullets: [
      "Day 1 speaks to what you're in, not to page one",
      "Every passage explained first — no verse dropped on you cold",
      "Ask anything, however raw. Nobody sees it but you",
    ],
    cta: "Continue",
  },
];

export const SEGMENTS: Record<SegmentId, SegmentCopy> = {
  default: {
    id: "default",
    headline: "Never know where to start with the Bible?",
    sub: "Answer a 2-minute quiz and get a simple day-by-day plan made for beginners — no theology degree needed.",
    cta: "Start",
    promises: ["7 minutes a day", "Plain English", "No card required"],
    heroNote: "Explained in plain English — no confusing Bible-speak.",
  },
  "no-time": {
    id: "no-time",
    headline: "You don't need more discipline. You need a shorter page.",
    sub: "Seven minutes, one passage, already chosen for you. Miss a day and nothing resets — that's the whole point.",
    cta: "Show me my 7 minutes",
    promises: ["7 minutes, not an hour", "Missing a day resets nothing", "No card required"],
    heroNote: "One passage a day. It's still waiting when you come back.",
    resultBullet:
      "Built for the week you actually have — seven minutes a day, and a missed day costs you nothing",
    firstQuestions: noTimeQuestions,
  },
  emergency: {
    id: "emergency",
    headline: "Hard week? Start where it actually hurts.",
    sub: "Tell us what's going on and your first seven days are chosen for that — explained in plain English, no church voice.",
    cta: "Start where I am",
    promises: ["Starts with what you're facing", "Explained, not preached", "No card required"],
    heroNote: "Your first passage is picked for what you're in right now.",
    resultBullet:
      "Your first week is chosen for what you're going through — not a chapter about somebody else",
    firstQuestions: emergencyQuestions,
  },
};

const ALIASES: Record<string, SegmentId> = {
  "no-time": "no-time",
  notime: "no-time",
  time: "no-time",
  routine: "no-time",
  emergency: "emergency",
  hard: "emergency",
  "hard-season": "emergency",
};

/** Reads a segment from a query string (`?v=` or `utm_content=`). */
export function segmentFromSearch(search: string): SegmentId | null {
  const params = new URLSearchParams(search);
  for (const key of ["v", "segment", "utm_content"]) {
    const raw = params.get(key)?.toLowerCase().trim();
    if (raw && ALIASES[raw]) return ALIASES[raw]!;
  }
  return null;
}

export function getSegment(id: string | null | undefined): SegmentCopy {
  return SEGMENTS[(id as SegmentId) in SEGMENTS ? (id as SegmentId) : "default"]!;
}

/** The self-select question shown when no tag came in from the URL. */
export const SEGMENT_STEP: Step = {
  id: "segment",
  kind: "single",
  section: SECTIONS[0],
  title: "What brought you here today?",
  subtitle: "This changes what we ask next.",
  options: [
    { value: "no-time", label: "I never find the time — it keeps falling apart" },
    { value: "emergency", label: "Something hard is happening right now" },
    { value: "default", label: "I want to finally understand what I'm reading" },
  ],
};

/**
 * The step list for a run of the quiz.
 * - `fromUrl` true: the segment came in tagged, so the self-select question is skipped.
 * - Segment-specific questions replace the generic `blockers` / `plan-history` /
 *   `blockers-pivot` block in section 2.
 */
export function stepsForSegment(id: string | null | undefined, fromUrl: boolean): Step[] {
  const seg = getSegment(id);
  const out = [...baseSteps];

  if (seg.firstQuestions) {
    const start = out.findIndex((s) => s.id === "blockers");
    const end = out.findIndex((s) => s.id === "plan-history");
    if (start !== -1 && end !== -1) {
      out.splice(start, end - start + 1, ...seg.firstQuestions);
    }
  }

  if (!fromUrl) out.unshift(SEGMENT_STEP);
  return out;
}
