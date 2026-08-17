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

function unlockAt(startedAt: string, day: number) {
  return new Date(new Date(startedAt).getTime() + (day - 1) * DAY_MS);
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

const MAX_FREEZES = 3;

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
  const { data: created, error } = await supabase
    .from("user_plans")
    .insert({ user_id: userId, book_slug: "john", book_title: BOOK_TITLES["john"]!, translation: "WEB", is_active: true })
    .select("*")
    .single();
  if (error || !created) throw new Error(error?.message ?? "Could not open a plan");
  return created;
}

export async function buildMyPlan(userId: string, scoped?: Admin): Promise<MyPlan> {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  const [{ data: sessions }, { data: progress }] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("day_number, title, reference, setup, art_tone")
      .eq("book_slug", plan.book_slug)
      .order("day_number"),
    supabase
      .from("user_progress")
      .select("day_number, step, completed_at, note")
      .eq("plan_id", plan.id),
  ]);

  const byDay = new Map((progress ?? []).map((p) => [p.day_number, p]));
  const now = Date.now();
  const startedAt = plan.started_at ?? plan.created_at;

  const days: PlanDay[] = (sessions ?? []).map((s) => {
    const at = unlockAt(startedAt, s.day_number);
    const p = byDay.get(s.day_number);
    return {
      day: s.day_number,
      title: s.title,
      reference: s.reference,
      unlockAt: at.toISOString(),
      unlocked: at.getTime() <= now,
      done: Boolean(p?.completed_at),
      step: p?.step ?? 1,
    };
  });

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
      current: plan.streak_count ?? 0,
      longest: plan.longest_streak ?? 0,
      todayDone: plan.last_completed_on === dayKey(new Date()),
      freezesLeft: Math.max(0, MAX_FREEZES - (plan.freezes_used ?? 0)),
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
          complete: Boolean(current?.done),
        }
      : null,
    otherBooks: Object.entries(BOOK_TITLES)
      .filter(([slug]) => slug !== plan.book_slug)
      .map(([slug, title]) => ({ slug, title })),
  };
}

export async function buildSessionDay(userId: string, day: number, scoped?: Admin): Promise<SessionDay> {
  const supabase = await db(scoped);
  const plan = await activePlan(userId, scoped);
  const startedAt = plan.started_at ?? plan.created_at;
  if (unlockAt(startedAt, day).getTime() > Date.now()) {
    throw new Error("This day has not opened yet.");
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

  const { data: next } = await supabase
    .from("study_sessions")
    .select("day_number, title")
    .eq("book_slug", plan.book_slug)
    .eq("day_number", day + 1)
    .maybeSingle();

  const readings = (session.divide_readings ?? null) as DivideReading[] | null;
  const showDivide = Boolean(session.divides && plan.show_both_sides !== false && readings?.length);

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
    divide: showDivide
      ? {
          question: session.divide_question ?? "How traditions read this",
          readings: readings ?? [],
          common: session.divide_common,
        }
      : null,
    question: session.question,
    step: progress?.step ?? 1,
    note: progress?.note ?? null,
    done: Boolean(progress?.completed_at),
    next: next
      ? {
          day: next.day_number,
          title: next.title,
          unlockAt: unlockAt(startedAt, next.day_number).toISOString(),
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
  const today = dayKey(new Date());
  const last = plan.last_completed_on ?? null;
  let current = plan.streak_count ?? 0;
  let freezesUsed = plan.freezes_used ?? 0;
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

  const longest = Math.max(plan.longest_streak ?? 0, current);

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

  await supabase
    .from("user_plans")
    .update({
      streak_count: current,
      longest_streak: longest,
      last_completed_on: today,
      freezes_used: freezesUsed,
      ...(finishedAll && !plan.completed_at ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq("id", plan.id)
    .eq("user_id", userId);

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

export async function switchBook(userId: string, bookSlug: string, scoped?: Admin) {
  const supabase = await db(scoped);
  const slug = BOOK_TITLES[bookSlug] ? bookSlug : "john";
  await supabase.from("user_plans").update({ is_active: false }).eq("user_id", userId);
  const { data, error } = await supabase
    .from("user_plans")
    .insert({ user_id: userId, book_slug: slug, book_title: BOOK_TITLES[slug]!, translation: "WEB", is_active: true })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { planId: data.id, bookSlug: slug };
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
export async function cancelAccess(userId: string, environment: "sandbox" | "live" = "sandbox") {
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
    const stripe = createStripeClient(environment);
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
export async function changePlan(
  userId: string,
  targetCode: string,
  environment: "sandbox" | "live" = "sandbox",
) {
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
    const stripe = createStripeClient(environment);
    const lookupKey = `plainly_renewal_${renewal.intervalCount}_${renewal.interval}_${renewal.amountCents}`;

    const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
    const price =
      existing.data[0] ??
      (await stripe.prices.create({
        currency: "usd",
        unit_amount: renewal.amountCents,
        recurring: { interval: renewal.interval, interval_count: renewal.intervalCount },
        lookup_key: lookupKey,
        transfer_lookup_key: true,
        nickname: `BibleRoutine — continued access (${target.label})`,
        product_data: { name: "BibleRoutine — continued access" },
      }));

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

