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

export type SegmentId = "no-time" | "emergency" | "curious" | "social" | "returning" | "male" | "default";

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

const curiousQuestions: Step[] = [
  {
    id: "bible-distance",
    kind: "single",
    section: SECTIONS[1],
    title: "How close do you feel to the Bible right now?",
    subtitle: "No wrong answer. This decides where we start.",
    options: [
      { value: "never-opened", label: "I've never really opened it" },
      { value: "intimidated", label: "Curious, but it feels intimidating" },
      { value: "read-as-kid", label: "I read some as a kid, not since" },
      { value: "read-sometimes", label: "I read it now and then" },
    ],
  },
  {
    id: "not-for-you",
    kind: "single",
    section: SECTIONS[1],
    title: "What makes it feel 'not for you'?",
    subtitle: "We can remove that first.",
    options: [
      { value: "language", label: "The language feels ancient" },
      { value: "where-start", label: "I don't know where to start" },
      { value: "rule-book", label: "It reads like a rule book" },
      { value: "afraid-wrong", label: "I'm afraid of getting it wrong" },
    ],
  },
  {
    id: "curious-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "Curiosity is enough.",
    subtitle:
      "You don't have to become 'a Bible person' first. The plan starts where you are and explains before it assumes.",
    eyebrow: "Why this works",
    tone: "teal",
    bullets: [
      "No background assumed — every passage is explained first",
      "No shame for not knowing the characters or the timeline",
      "Seven minutes, so you can stop without guilt",
    ],
    cta: "Continue",
  },
];

const socialQuestions: Step[] = [
  {
    id: "group-context",
    kind: "single",
    section: SECTIONS[1],
    title: "Where does the Bible question usually come up?",
    subtitle: "The room where you feel like you should know more.",
    options: [
      { value: "small-group", label: "A small group or Bible study" },
      { value: "family", label: "Family conversations" },
      { value: "church", label: "Church or service" },
      { value: "work", label: "Work or with friends" },
      { value: "online", label: "Online / social media" },
    ],
  },
  {
    id: "confident-change",
    kind: "single",
    section: SECTIONS[1],
    title: "What would change if you could answer confidently?",
    options: [
      { value: "less-dread", label: "I'd dread it less" },
      { value: "contribute", label: "I could actually contribute" },
      { value: "not-fake", label: "I wouldn't feel like I'm faking it" },
      { value: "help-someone", label: "I could help someone else who is stuck" },
    ],
  },
  {
    id: "social-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "Nobody here is watching.",
    subtitle:
      "Learn privately first. Ask the basic questions you would never ask out loud. Then decide if you ever say a word.",
    eyebrow: "How this helps",
    tone: "indigo",
    bullets: [
      "Every passage explained before you read it",
      "Ask anything — nobody sees the question but you",
      "A 30-day foundation, so the next group conversation feels different",
    ],
    cta: "Continue",
  },
];

const returningQuestions: Step[] = [
  {
    id: "time-away",
    kind: "single",
    section: SECTIONS[1],
    title: "How long has it been since you read regularly?",
    subtitle: "Be honest — there is no right timeline.",
    options: [
      { value: "weeks", label: "A few weeks" },
      { value: "months", label: "Months" },
      { value: "years", label: "Years" },
      { value: "since-childhood", label: "Since I was a kid" },
    ],
  },
  {
    id: "brought-back",
    kind: "single",
    section: SECTIONS[1],
    title: "What brought you back today?",
    options: [
      { value: "miss-it", label: "I miss it" },
      { value: "hard-season", label: "Something hard is happening" },
      { value: "dont-give-up", label: "I don't want to give up" },
      { value: "someone-mentioned", label: "Someone mentioned this" },
    ],
  },
  {
    id: "returning-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "No lecture, no check-in.",
    subtitle:
      "The plan just opens to the right page when you come back. No questions about where you've been.",
    eyebrow: "What to expect",
    tone: "terra",
    bullets: [
      "Pick up without explaining the gap",
      "One short passage, not a chapter to catch up on",
      "Miss a day and nothing resets — that's the design",
    ],
    cta: "Continue",
  },
];

const maleQuestions: Step[] = [
  {
    id: "want-to-read",
    kind: "single",
    section: SECTIONS[1],
    title: "What would make you actually want to read it?",
    subtitle: "Not what you think you should want — what would pull you in.",
    options: [
      { value: "history", label: "Real historical context" },
      { value: "languages", label: "The original Greek and Hebrew" },
      { value: "arguments", label: "Honest arguments, not soft answers" },
      { value: "structure", label: "A clear structure I can follow" },
    ],
  },
  {
    id: "facts-or-meaning",
    kind: "single",
    section: SECTIONS[1],
    title: "Which sounds more useful?",
    options: [
      { value: "facts-first", label: "Facts first, then what they mean" },
      { value: "meaning-first", label: "Meaning first, then the facts behind it" },
      { value: "both", label: "Both, side by side" },
    ],
  },
  {
    id: "male-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "Built like a field guide.",
    subtitle:
      "Who wrote it, to whom, what the words meant then, and why it matters now. No fluff, no forced emotion.",
    eyebrow: "How it's taught",
    tone: "olive",
    bullets: [
      "Original language tools one tap away",
      "Historical context before every passage",
      "Straight explanations — no church voice",
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
  curious: {
    id: "curious",
    headline: "You don't have to become 'a Bible person' first.",
    sub: "Start curious. Seven minutes a day, explained before it assumes you already know the story.",
    cta: "Start curious",
    promises: ["No background needed", "Explained first, then read", "No card required"],
    heroNote: "Every passage explained before you read a word of it.",
    resultBullet:
      "Built for curiosity, not credentials — every passage is explained before you read it",
    firstQuestions: curiousQuestions,
  },
  social: {
    id: "social",
    headline: "Tired of nodding along when the Bible comes up?",
    sub: "Learn privately first. Ask the questions you'd never ask out loud. Then decide if you ever say a word.",
    cta: "Learn before the room",
    promises: ["Private first", "Explained, not preached", "No card required"],
    heroNote: "Nobody sees your questions but you.",
    resultBullet:
      "A 30-day foundation so the next conversation about the Bible feels different — learned in private first",
    firstQuestions: socialQuestions,
  },
  returning: {
    id: "returning",
    headline: "Coming back doesn't need an explanation.",
    sub: "No lecture, no catch-up chapter. One passage a day, and the plan picks up exactly where you left off.",
    cta: "Pick up where I left off",
    promises: ["No guilt for the gap", "One passage a day", "No card required"],
    heroNote: "The plan opens to the right page. No questions asked.",
    resultBullet:
      "No catch-up required — one short passage a day and a missed day costs you nothing",
    firstQuestions: returningQuestions,
  },
  male: {
    id: "male",
    headline: "Read it like a field guide, not a devotional.",
    sub: "Historical context, original languages, straight explanations. No fluff, no forced emotion.",
    cta: "Show me the field guide",
    promises: ["Original languages, one tap", "Historical context", "No card required"],
    heroNote: "Who wrote it, to whom, and why it mattered then.",
    resultBullet:
      "Built for the intellectual track — original language tools and historical context first",
    firstQuestions: maleQuestions,
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
  curious: "curious",
  "bible-curious": "curious",
  "just-curious": "curious",
  new: "curious",
  social: "social",
  group: "social",
  "dread-group": "social",
  shame: "social",
  returning: "returning",
  return: "returning",
  back: "returning",
  "church-hurt": "returning",
  male: "male",
  men: "male",
  guy: "male",
  intellectual: "male",
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
    { value: "curious", label: "I'm curious but it feels like it's not for me" },
    { value: "social", label: "I dread the Bible question in a group" },
    { value: "returning", label: "I'm coming back after time away" },
    { value: "male", label: "I want the facts, not the fluff" },
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
