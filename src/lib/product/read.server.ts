import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  BOOK_TITLES,
  type MyPlan,
  type PlanDay,
  type SavedNote,
  type SessionDay,
  type DivideReading,
  type WordNote,
} from "./types";
import type { SavedHighlight } from "./types";
import type { Application, CrossReference, TraditionVoice } from "./types";
import { ACCESS_PLANS, getAccessPlan } from "./pricing";
import { RENEWALS } from "@/lib/payments/renewals";

type Admin = ReturnType<typeof createClient<Database>>;

async function db(scoped?: Admin): Promise<Admin> {
  // Reads and writes made on behalf of a signed-in reader use their own
  // client, so row-level security stays in force. The service client is only
  // used where there is no user session (payment fulfilment, email dispatch).
  if (scoped) return scoped;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

/** The RLS-scoped client handed to us by the auth middleware. */
export type ScopedClient = Admin;

const DAY_MS = 86400000;

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

const MAX_FREEZES = 3;

/**
 * Exactly one plan record per reader per book, kept forever. Coming back to a
 * book reopens the same record, so nothing a reader finished can be lost by
 * switching between books.
 */
async function ensurePlan(userId: string, bookSlug: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const slug = BOOK_TITLES[bookSlug] ? bookSlug : "john";
  const { data: existing } = await supabase
    .from("user_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("book_slug", slug)
    .maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("user_plans")
    .upsert(
      {
        user_id: userId,
        book_slug: slug,
        book_title: BOOK_TITLES[slug]!,
        translation: "WEB",
        is_active: true,
      },
      { onConflict: "user_id,book_slug" },
    )
    .select("*")
    .single();
  if (error || !created) throw new Error(error?.message ?? "Could not open a plan");
  return created;
}

async function activePlan(userId: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const { data } = await supabase
    .from("user_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) return data;
  // The product must work for someone who never took the quiz.
  return ensurePlan(userId, "john", scoped);
}

/** The streak follows the reader, not a single book. */
async function readerState(userId: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const { data } = await supabase
    .from("reader_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) return data;
  const { data: created } = await supabase
    .from("reader_state")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("*")
    .single();
  return (
    created ?? {
      user_id: userId,
      streak_count: 0,
      longest_streak: 0,
      last_completed_on: null as string | null,
      freezes_used: 0,
    }
  );
}

// Close reading runs ~120 words a minute. On top of the written blocks a
// session costs time the word count can't see: scripture itself (~22 words a
// verse, read slower), the word study tap, the quiz, and the reflection.
function estimateMinutes(
  parts: (string | null | undefined)[],
  extras?: { verses?: number; hasQuiz?: boolean; hasWordStudy?: boolean },
): number {
  const words = parts.filter(Boolean).join(" ").trim().split(/\s+/).filter(Boolean).length;
  let minutes = words / 120;
  minutes += ((extras?.verses ?? 0) * 22) / 90; // scripture, read slowly
  if (extras?.hasWordStudy) minutes += 0.6;
  if (extras?.hasQuiz) minutes += 0.8;
  minutes += 1; // the reflection question and the note
  return Math.max(3, Math.round(minutes));
}

export async function buildMyPlan(userId: string, scoped?: Admin): Promise<MyPlan> {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  const [{ data: sessions }, { data: progress }] = await Promise.all([
    supabase
      .from("study_sessions")
      .select(
        "day_number, title, reference, setup, art_tone, insight_body, context_body, application, cross_reference, voices",
      )
      .eq("book_slug", plan.book_slug)
      .order("day_number"),
    supabase
      .from("user_progress")
      .select("day_number, step, completed_at, note")
      .eq("plan_id", plan.id),
  ]);

  const byDay = new Map((progress ?? []).map((p) => [p.day_number, p]));
  const startedAt = plan.started_at ?? plan.created_at;

  // A day opens as soon as the one before it is finished — the plan waits for
  // the reader, never the clock.
  let previousDone = true;
  const days: PlanDay[] = (sessions ?? []).map((s) => {
    const p = byDay.get(s.day_number);
    const done = Boolean(p?.completed_at);
    const unlocked = previousDone;
    previousDone = done;
    return {
      day: s.day_number,
      title: s.title,
      reference: s.reference,
      unlocked,
      done,
      step: p?.step ?? 1,
    };
  });

  const state = await readerState(userId, scoped);
  const { data: allPlans } = await supabase
    .from("user_plans")
    .select("id, book_slug")
    .eq("user_id", userId);
  const otherIds = (allPlans ?? []).filter((p) => p.id !== plan.id).map((p) => p.id);
  const { data: otherProgress } = otherIds.length
    ? await supabase
        .from("user_progress")
        .select("plan_id, completed_at")
        .in("plan_id", otherIds)
        .not("completed_at", "is", null)
    : { data: [] as { plan_id: string; completed_at: string | null }[] };
  const doneByPlan = new Map<string, number>();
  for (const row of otherProgress ?? [])
    doneByPlan.set(row.plan_id, (doneByPlan.get(row.plan_id) ?? 0) + 1);

  const unlocked = days.filter((d) => d.unlocked);
  const finished = days.filter((d) => d.done).length;
  // Today's session: the first unlocked day that isn't done, else the newest unlocked.
  const current = unlocked.find((d) => !d.done) ?? unlocked[unlocked.length - 1] ?? days[0];
  const heroSource = (sessions ?? []).find((s) => s.day_number === current?.day);

  return {
    planId: plan.id,
    bookSlug: plan.book_slug,
    bookTitle: BOOK_TITLES[plan.book_slug] ?? plan.book_slug,
    translation: plan.translation,
    tradition: plan.tradition ?? "unsure",
    voices: plan.voices ?? "classic",
    showBothSides: plan.show_both_sides ?? true,
    readerName: plan.reader_name,
    startedAt,
    currentDay: current?.day ?? 1,
    finished,
    total: days.length,
    days,
    streak: {
      current: state.streak_count ?? 0,
      longest: state.longest_streak ?? 0,
      todayDone: state.last_completed_on === dayKey(new Date()),
      freezesLeft: Math.max(0, MAX_FREEZES - (state.freezes_used ?? 0)),
    },
    notesCount: (progress ?? []).filter((p) => p.note && p.note.trim()).length,
    complete: days.length > 0 && finished >= days.length,
    hero: heroSource
      ? {
          day: heroSource.day_number,
          title: heroSource.title,
          setup: heroSource.setup,
          reference: heroSource.reference,
          tone: heroSource.art_tone ?? "teal",
          // The real length of today's session, not a marketing number.
          minutes: estimateMinutes([
            heroSource.insight_body,
            heroSource.context_body,
            ((heroSource.application ?? null) as { body?: string } | null)?.body ?? "",
            ((heroSource.cross_reference ?? null) as { note?: string } | null)?.note ?? "",
            ((heroSource.voices ?? []) as { reading?: string }[])
              .map((v) => v?.reading ?? "")
              .join(" "),
          ]),
          complete: Boolean(current?.done),
        }
      : null,
    otherBooks: Object.entries(BOOK_TITLES)
      .filter(([slug]) => slug !== plan.book_slug)
      .map(([slug, title]) => {
        const row = (allPlans ?? []).find((p) => p.book_slug === slug);
        return { slug, title, finished: row ? (doneByPlan.get(row.id) ?? 0) : 0 };
      }),
  };
}

export async function buildSessionDay(userId: string, day: number, scoped?: Admin): Promise<SessionDay> {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  if (day > 1) {
    const { data: prev } = await supabase
      .from("user_progress")
      .select("completed_at")
      .eq("plan_id", plan.id)
      .eq("day_number", day - 1)
      .maybeSingle();
    if (!prev?.completed_at) throw new Error(`Finish day ${day - 1} first.`);
  }

  const { data: session } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day)
    .maybeSingle();
  if (!session) throw new Error("This session is not available yet.");

  // Verse text always comes from the database, never from a model.
  const { data: verses } = await supabase
    .from("verses")
    .select("verse, text")
    .eq("translation", plan.translation)
    .eq("book", session.book)
    .eq("chapter", session.chapter)
    .gte("verse", session.verse_start)
    .lte("verse", session.verse_end)
    .order("verse");

  const { data: progress } = await supabase
    .from("user_progress")
    .select("step, note, completed_at")
    .eq("plan_id", plan.id)
    .eq("day_number", day)
    .maybeSingle();

  // Word study: curated public-domain lexicon notes for this exact passage.
  const { data: wordRows } = await supabase
    .from("word_notes")
    .select("word, original, transliteration, language, meaning, also_in")
    .eq("book", session.book)
    .eq("chapter", session.chapter)
    .gte("verse", session.verse_start)
    .lte("verse", session.verse_end);
  const words: WordNote[] = (wordRows ?? []).map((w) => ({
    word: w.word,
    original: w.original,
    transliteration: w.transliteration,
    language: w.language,
    meaning: w.meaning,
    alsoIn: w.also_in,
  }));

  // Seeded books ship one lexicon note with the session itself.
  const seedWord = (session.word_study ?? null) as
    | { word: string; original: string; language: string; gloss: string; body: string }
    | null;
  if (seedWord?.word && !words.some((w) => w.word.toLowerCase() === seedWord.word.toLowerCase())) {
    words.push({
      word: seedWord.word,
      original: seedWord.original,
      transliteration: seedWord.gloss,
      language: seedWord.language,
      meaning: seedWord.body,
      alsoIn: null,
    });
  }

  const { data: next } = await supabase
    .from("study_sessions")
    .select("day_number, title")
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day + 1)
    .maybeSingle();

  const { data: highlightRows } = await supabase
    .from("verse_highlights")
    .select("verse")
    .eq("user_id", userId)
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day);

  // One short comprehension question, seeded per session. Never generated at runtime.
  const { data: quizRow } = await supabase
    .from("session_quiz")
    .select("question, options, correct_index, explanation")
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day)
    .maybeSingle();
  const quizOptions = Array.isArray(quizRow?.options) ? (quizRow.options as string[]) : [];

  const readings = (session.divide_readings ?? null) as DivideReading[] | null;
  const showDivide = Boolean(session.divides && plan.show_both_sides !== false && readings?.length);

  const crossReference = (session.cross_reference ?? null) as CrossReference | null;
  const application = (session.application ?? null) as Application | null;
  const allVoices = ((session.voices ?? []) as TraditionVoice[]).filter((v) => v?.reading);
  const tradition = (plan.tradition ?? "unsure").toLowerCase();
  const own = allVoices.find((v) => v.tradition.toLowerCase().startsWith(tradition.slice(0, 6)));
  // Show every tradition when the reader asked for both sides or never told us.
  const voices = plan.show_both_sides !== false || !own ? allVoices : [own];

  const wordCount =
    [
      session.insight_body,
      session.context_body,
      application?.body ?? "",
      crossReference?.note ?? "",
      voices.map((v) => v.reading).join(" "),
      (verses ?? []).map((v) => v.text).join(" "),
    ]
      .join(" ")
      .trim()
      .split(/\s+/).length;
  // ~130 words a minute for close reading, plus a minute for the question.
  const minutes = Math.max(3, Math.round(wordCount / 130) + 1);

  return {
    day,
    bookTitle: BOOK_TITLES[plan.book_slug] ?? plan.book_slug,
    title: session.title,
    setup: session.setup,
    reference: session.reference,
    translation: plan.translation,
    tone: session.art_tone ?? "teal",
    highlightWord: session.highlight_word,
    verses: (verses ?? []).map((v) => ({ verse: v.verse, text: v.text })),
    words,
    insight: {
      title: session.insight_title,
      body: session.insight_body,
      author: session.insight_author,
      year: session.insight_year,
    },
    context: session.context_body,
    crossReference,
    application,
    voices,
    minutes,
    divide: showDivide
      ? {
          question: session.divide_question ?? "How traditions read this",
          readings: readings ?? [],
          common: session.divide_common,
        }
      : null,
    question: session.question,
    quiz:
      quizRow && quizOptions.length >= 2
        ? {
            question: quizRow.question,
            options: quizOptions,
            correctIndex: quizRow.correct_index,
            explanation: quizRow.explanation,
          }
        : null,
    step: progress?.step ?? 1,
    note: progress?.note ?? null,
    highlights: (highlightRows ?? []).map((h) => h.verse),
    done: Boolean(progress?.completed_at),
    next: next
      ? {
          day: next.day_number,
          title: next.title,
        }
      : null,
  };
}

export async function persistStep(userId: string, day: number, step: number, scoped?: Admin) {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  await supabase
    .from("user_progress")
    .upsert(
      { user_id: userId, plan_id: plan.id, day_number: day, step },
      { onConflict: "plan_id,day_number" },
    );
  return { ok: true };
}

export async function persistDone(userId: string, day: number, note: string | null, scoped?: Admin) {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      plan_id: plan.id,
      day_number: day,
      step: 6,
      note,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "plan_id,day_number" },
  );
  const streak = await bumpStreak(plan, userId, scoped);
  return { ok: true, streak };
}

type PlanRow = Awaited<ReturnType<typeof activePlan>>;

/**
 * One session finished today extends the streak. A single missed day spends a
 * freeze instead of wiping it — the plan should never punish a bad week.
 */
async function bumpStreak(plan: PlanRow, userId: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const state = await readerState(userId, scoped);
  const today = dayKey(new Date());
  const last = state.last_completed_on ?? null;
  let current = state.streak_count ?? 0;
  let freezesUsed = state.freezes_used ?? 0;
  let usedFreeze = false;

  if (last === today) {
    // Already counted today.
  } else if (last && daysBetween(last, today) === 1) {
    current += 1;
  } else if (last && daysBetween(last, today) === 2 && freezesUsed < MAX_FREEZES) {
    current += 1;
    freezesUsed += 1;
    usedFreeze = true;
  } else {
    current = 1;
  }

  const longest = Math.max(state.longest_streak ?? 0, current);

  const { count } = await supabase
    .from("user_progress")
    .select("day_number", { count: "exact", head: true })
    .eq("plan_id", plan.id)
    .not("completed_at", "is", null);
  const { count: total } = await supabase
    .from("study_sessions")
    .select("day_number", { count: "exact", head: true })
    .eq("book_slug", plan.book_slug);
  const finishedAll = Boolean(total && count && count >= total);

  await supabase.from("reader_state").upsert(
    {
      user_id: userId,
      streak_count: current,
      longest_streak: longest,
      last_completed_on: today,
      freezes_used: freezesUsed,
    },
    { onConflict: "user_id" },
  );

  if (finishedAll && !plan.completed_at) {
    await supabase
      .from("user_plans")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", plan.id)
      .eq("user_id", userId);
  }

  return { current, longest, usedFreeze, freezesLeft: Math.max(0, MAX_FREEZES - freezesUsed), finishedAll };
}

/** Everything the reader wrote, in one place — the reason to stay past day 30. */
export async function listNotes(userId: string, scoped?: Admin): Promise<SavedNote[]> {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  const [{ data: progress }, { data: sessions }] = await Promise.all([
    supabase
      .from("user_progress")
      .select("day_number, note, completed_at")
      .eq("plan_id", plan.id)
      .not("note", "is", null)
      .order("day_number"),
    supabase
      .from("study_sessions")
      .select("day_number, title, reference, question")
      .eq("book_slug", plan.book_slug),
  ]);
  const byDay = new Map((sessions ?? []).map((s) => [s.day_number, s]));
  return (progress ?? [])
    .filter((p) => p.note && p.note.trim())
    .map((p) => {
      const s = byDay.get(p.day_number);
      return {
        day: p.day_number,
        title: s?.title ?? `Day ${p.day_number}`,
        reference: s?.reference ?? "",
        question: s?.question ?? "",
        note: p.note!.trim(),
        completedAt: p.completed_at,
      };
    });
}

/**
 * WEB or KJV — both public domain, both fully imported for every plan book.
 * The choice belongs to the reader, so it is written to every book they hold.
 */
export async function setTranslation(userId: string, translation: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const value = translation === "KJV" ? "KJV" : "WEB";
  await supabase.from("user_plans").update({ translation: value }).eq("user_id", userId);
  return { translation: value };
}

/** Tapping a verse keeps it; tapping again lets it go. */
export async function toggleHighlight(
  userId: string,
  day: number,
  verse: number,
  scoped?: Admin,
) {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  const { data: existing } = await supabase
    .from("verse_highlights")
    .select("id")
    .eq("user_id", userId)
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day)
    .eq("verse", verse)
    .maybeSingle();

  if (existing) {
    await supabase.from("verse_highlights").delete().eq("id", existing.id);
    return { highlighted: false };
  }

  const { data: session } = await supabase
    .from("study_sessions")
    .select("book, chapter, reference")
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day)
    .maybeSingle();
  if (!session) throw new Error("This session is not available.");

  const { data: row } = await supabase
    .from("verses")
    .select("text")
    .eq("translation", plan.translation)
    .eq("book", session.book)
    .eq("chapter", session.chapter)
    .eq("verse", verse)
    .maybeSingle();
  if (!row) throw new Error("That verse is not part of this passage.");

  await supabase.from("verse_highlights").insert({
    user_id: userId,
    book_slug: plan.book_slug,
    day_number: day,
    reference: `${session.reference.split(":")[0]}:${verse}`,
    verse,
    text: row.text,
  });
  return { highlighted: true };
}

/** Every verse the reader kept, newest first, for the Notes screen. */
export async function listHighlights(userId: string, scoped?: Admin): Promise<SavedHighlight[]> {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  const { data } = await supabase
    .from("verse_highlights")
    .select("day_number, reference, verse, text")
    .eq("user_id", userId)
    .eq("book_slug", plan.book_slug)
    .order("day_number", { ascending: false });
  return (data ?? []).map((h) => ({
    day: h.day_number,
    reference: h.reference,
    verse: h.verse,
    text: h.text,
  }));
}

export async function switchBook(userId: string, bookSlug: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const slug = BOOK_TITLES[bookSlug] ? bookSlug : "john";
  // Reopen the reader's existing record for this book, never a fresh one.
  const plan = await ensurePlan(userId, slug, scoped);
  await supabase.from("user_plans").update({ is_active: false }).eq("user_id", userId);
  const { error } = await supabase
    .from("user_plans")
    .update({ is_active: true })
    .eq("id", plan.id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { planId: plan.id, bookSlug: slug };
}

export async function readAccess(userId: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const { data } = await supabase
    .from("subscriptions")
    .select("plan_code, plan_label, status, amount_cents, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    planCode: data.plan_code,
    planLabel: data.plan_label,
    status: data.status,
    amountCents: data.amount_cents,
    renewsAt: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    upgrades:
      data.status === "active" && !data.cancel_at_period_end ? upgradeOptions(data.plan_code) : [],
  };
}

/** One click, no retention flow: access stays until the paid period ends. */
export async function cancelAccess(userId: string) {
  const supabase = await db();
  const { data: current } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (current?.provider_subscription_id) {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const { resolveStripeEnv } = await import("@/lib/payments/env.server");
    const stripe = createStripeClient(resolveStripeEnv());
    await stripe.subscriptions.update(current.provider_subscription_id, {
      cancel_at_period_end: true,
    });
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: true, canceled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Undo a cancellation before the period ends — nothing is charged again. */
export async function resumeAccess(userId: string) {
  const supabase = await db();
  const { data: current } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (current?.provider_subscription_id) {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const { resolveStripeEnv } = await import("@/lib/payments/env.server");
    const stripe = createStripeClient(resolveStripeEnv());
    await stripe.subscriptions.update(current.provider_subscription_id, {
      cancel_at_period_end: false,
    });
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: false, canceled_at: null })
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Longer cycles cost less per day, so only moves up this ladder are offered. */
const PLAN_RANK: Record<string, number> = { "1-week": 0, "1-month": 1, "3-month": 2 };

export function upgradeOptions(currentCode: string) {
  const rank = PLAN_RANK[currentCode] ?? 0;
  return Object.values(ACCESS_PLANS)
    .filter((p) => (PLAN_RANK[p.code] ?? 0) > rank)
    .map((p) => {
      const renewal = RENEWALS[p.code] ?? RENEWALS["1-month"]!;
      return {
        code: p.code,
        label: p.label,
        renews: p.renews,
        renewalAmountCents: renewal.amountCents,
      };
    });
}

/**
 * Moves the live subscription onto a longer renewal cycle. Access is never
 * interrupted; the card processor prorates the difference.
 */
export async function changePlan(userId: string, targetCode: string) {
  const supabase = await db();
  const { data: current } = await supabase
    .from("subscriptions")
    .select("id, plan_code, provider_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!current) throw new Error("No active access to change");

  const currentRank = PLAN_RANK[current.plan_code] ?? 0;
  const targetRank = PLAN_RANK[targetCode];
  if (targetRank === undefined) throw new Error("Unknown plan");
  if (targetRank <= currentRank) throw new Error("Only longer cycles can be chosen");

  const target = getAccessPlan(targetCode);
  const renewal = RENEWALS[targetCode] ?? RENEWALS["1-month"]!;

  if (current.provider_subscription_id) {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const { resolveStripeEnv } = await import("@/lib/payments/env.server");
    const { ensureRenewalPrice } = await import("@/lib/payments/catalog.server");
    const stripe = createStripeClient(resolveStripeEnv());
    const price = await ensureRenewalPrice(stripe, renewal);

    const subscription = await stripe.subscriptions.retrieve(current.provider_subscription_id);
    const item =
      subscription.items.data.find((i) => i.price.recurring) ?? subscription.items.data[0];
    if (item) {
      await stripe.subscriptions.update(current.provider_subscription_id, {
        items: [{ id: item.id, price: price.id }],
        proration_behavior: "create_prorations",
        metadata: { ...(subscription.metadata ?? {}), planCode: target.code },
      });
    }
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_code: target.code,
      plan_label: target.label,
      amount_cents: renewal.amountCents,
    })
    .eq("id", current.id);
  if (error) throw new Error(error.message);
  return { ok: true, planCode: target.code };
}

