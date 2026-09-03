import type { Step } from "./types";

export const SECTIONS = [
  "You",
  "Where you are",
  "What you need",
  "Your rhythm",
  "Your plan",
] as const;

export const steps: Step[] = [
  // Section 1 — You
  {
    id: "gender",
    kind: "single",
    section: SECTIONS[0],
    title: "Which best describes you?",
    options: [
      { value: "man", label: "Man" },
      { value: "woman", label: "Woman" },
    ],
  },
  {
    id: "age",
    kind: "single",
    section: SECTIONS[0],
    title: "How old are you?",
    subtitle: "Your pace and reading length are set from this.",
    options: [
      { value: "18-24", label: "18–24" },
      { value: "25-34", label: "25–34" },
      { value: "35-44", label: "35–44" },
      { value: "45-54", label: "45–54" },
      { value: "55+", label: "55+" },
    ],
  },
  {
    id: "tradition",
    kind: "single",
    section: SECTIONS[0],
    title: "Which tradition are you closest to?",
    subtitle: "This sets your canon, translation and which voices we quote.",
    options: [
      { value: "catholic", label: "Catholic" },
      { value: "orthodox", label: "Orthodox" },
      { value: "baptist", label: "Baptist / Evangelical" },
      { value: "reformed", label: "Reformed / Presbyterian" },
      { value: "pentecostal", label: "Pentecostal" },
      { value: "just-christian", label: "Just Christian" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },

  // Section 2 — Where you are
  {
    id: "frequency",
    kind: "single",
    section: SECTIONS[1],
    title: "How often do you actually read the Bible?",
    subtitle: "Be honest — nobody sees this but you.",
    options: [
      { value: "most-days", label: "Most days" },
      { value: "few-week", label: "A few times a week" },
      { value: "now-and-then", label: "Now and then" },
      { value: "almost-never", label: "Almost never" },
      { value: "starting", label: "I want to start" },
    ],
  },
  {
    id: "blockers",
    kind: "multi",
    section: SECTIONS[1],
    title: "When you try to read it, what happens?",
    subtitle: "Pick everything that sounds familiar.",
    options: [
      { value: "no-time", label: "I run out of time" },
      { value: "routine", label: "I forget — the routine falls apart" },
      { value: "dont-understand", label: "I don't understand what I'm reading" },
      { value: "lose-thread", label: "I lose the thread of the story" },
      { value: "bored", label: "I get bored" },
      { value: "guilt", label: "I feel guilty and stop" },
      { value: "where-start", label: "I don't know where to start" },
    ],
  },
  {
    id: "blockers-pivot",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "That's not a willpower problem.",
    subtitle:
      "Almost everyone stalls for the same handful of reasons — no time, a routine that quietly stops, dense wording, no natural stopping point. BibleRoutine is built to remove each one, before you read a single verse.",
    eyebrow: "Why this feels hard",
    tone: "indigo",
    bullets: [
      "No time → one passage sized to seven minutes, not a chapter",
      "Routine falls apart → the plan picks up where you left off, nothing resets",
      "Confusing wording → explained in plain English",
      "Losing the thread → who wrote it and why, before every passage",
    ],
    cta: "Continue",
  },
  {
    id: "plan-history",
    kind: "single",
    section: SECTIONS[1],
    title: "Have you ever tried a reading plan?",
    options: [
      { value: "finished", label: "Finished one" },
      { value: "started", label: "Started, didn't finish" },
      { value: "never", label: "Never tried" },
    ],
  },
  {
    id: "embarrassed",
    kind: "statement",
    section: SECTIONS[1],
    title: "\u201cI've felt embarrassed asking a question about faith.\u201d",
    options: [
      { value: "yes", label: "That's me" },
      { value: "no", label: "Not really" },
      { value: "skip", label: "Rather not say" },
    ],
  },
  {
    id: "break-1",
    kind: "interstitial",
    section: SECTIONS[1],
    title: "You're not alone.",
    subtitle:
      "4 out of 5 people who take this say they want to read more — and 2 out of 3 say they don't understand what they read.",
    source: "ABS, State of the Bible 2026",
    eyebrow: "You're not alone",
    tone: "terra",
    bullets: ["4 in 5 want to read more", "2 in 3 don't understand it", "Almost nobody says it out loud"],
    cta: "Got it",
  },

  // Section 3 — What you need
  {
    id: "trigger",
    kind: "cards",
    section: SECTIONS[2],
    title: "What made you look for this today?",
    options: [
      { value: "understand", label: "I want to actually understand it", image: "understand" },
      { value: "hard-season", label: "Something hard is happening", image: "storm" },
      { value: "habit", label: "I want a habit that sticks", image: "habit" },
      { value: "group", label: "I'm leading a group", image: "group" },
      { value: "returning", label: "I'm coming back after time away", image: "returning" },
    ],
  },
  {
    id: "themes",
    kind: "cards",
    section: SECTIONS[2],
    title: "What's on your mind right now?",
    subtitle: "Choose as many as you like — your first readings start here.",
    options: [
      { value: "anxiety", label: "Anxiety", image: "anxiety" },
      { value: "relationship", label: "A relationship", image: "relationship" },
      { value: "money", label: "Money or work", image: "money" },
      { value: "guilt", label: "Guilt", image: "guilt" },
      { value: "doubt", label: "Doubt", image: "doubt" },
      { value: "grief", label: "Grief", image: "grief" },
      { value: "purpose", label: "Purpose", image: "purpose" },
      { value: "nothing", label: "Nothing specific", image: "calm" },
    ],
  },
  {
    id: "outcome",
    kind: "single",
    section: SECTIONS[2],
    title: "If this worked, what's different in 30 days?",
    options: [
      { value: "read-most-days", label: "I'd read most days" },
      { value: "understand", label: "I'd understand what I read" },
      { value: "say-in-group", label: "I'd have something to say in group" },
      { value: "dread-group", label: "I'd stop dreading the question in group" },
      { value: "closer", label: "I'd feel less far away" },
    ],
  },
  {
    id: "break-2",
    kind: "interstitial",
    section: SECTIONS[2],
    title: "A guide changes the odds.",
    subtitle:
      "People who follow a guide read most or all of the Bible — 74% of them. Without one, it's 33%.",
    source: "Lifeway Research",
    eyebrow: "The odds",
    tone: "teal",
    bullets: ["74% finish with a guide", "33% finish without one", "Seven minutes is enough"],
    cta: "Continue",
  },
  {
    id: "style",
    kind: "single",
    section: SECTIONS[2],
    title: "Which sounds more like you?",
    options: [
      { value: "explain-first", label: "Explain it first, then let me read" },
      { value: "read-first", label: "Let me read, help when I'm stuck" },
      { value: "depends", label: "Depends — both, when I need it" },
    ],
  },

  // Section 4 — Your rhythm
  {
    id: "time-of-day",
    kind: "single",
    section: SECTIONS[3],
    title: "When can you honestly give it 7 minutes?",
    options: [
      { value: "morning", label: "Morning" },
      { value: "lunch", label: "Lunch" },
      { value: "evening", label: "Evening" },
      { value: "bed", label: "Right before bed" },
      { value: "unsure", label: "Honestly, I don't know when" },
    ],
  },
  {
    id: "days",
    kind: "single",
    section: SECTIONS[3],
    title: "How many days a week are you actually going to show up?",
    options: [
      { value: "2-3", label: "2–3 days" },
      { value: "4-5", label: "4–5 days" },
      { value: "6-7", label: "6–7 days" },
    ],
  },
  {
    id: "disagreements",
    kind: "single",
    section: SECTIONS[3],
    title: "Do you want to see where traditions disagree?",
    options: [
      { value: "both", label: "Yes, show me both sides" },
      { value: "own", label: "Just my own tradition" },
      { value: "unsure", label: "I don't know yet" },
    ],
  },
  {
    id: "understanding",
    kind: "slider",
    section: SECTIONS[3],
    title: "How well do you feel you understand the Bible today?",
    minLabel: "Lost most of the time",
    maxLabel: "I could teach it",
    cta: "Continue",
  },
  {
    id: "greek-demo",
    kind: "demo",
    section: SECTIONS[3],
    title: "Every verse, down to the original word.",
    subtitle: "The original Greek and Hebrew behind any verse. Free, always.",
    options: [
      { value: "show", label: "Show me this" },
      { value: "advanced", label: "Too advanced for me" },
    ],
  },

  // Section 5 — Your plan
  {
    id: "name",
    kind: "text",
    section: SECTIONS[4],
    title: "What should we call you?",
    placeholder: "Your first name",
    cta: "Continue",
  },
  {
    id: "analysis",
    kind: "analysis",
    section: SECTIONS[4],
    title: "Building your plan",
  },
];

export const totalSteps = steps.length;
