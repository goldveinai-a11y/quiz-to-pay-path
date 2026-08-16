import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BOOK_TITLES, type MyPlan, type PlanDay, type SessionDay, type DivideReading } from "./types";

type Admin = ReturnType<typeof createClient<Database>>;

async function db(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

const DAY_MS = 86400000;

function unlockAt(startedAt: string, day: number) {
  return new Date(new Date(startedAt).getTime() + (day - 1) * DAY_MS);
}

async function activePlan(userId: string) {
  const supabase = await db();
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

export async function buildMyPlan(userId: string): Promise<MyPlan> {
  const supabase = await db();
  const plan = await activePlan(userId);
  const [{ data: sessions }, { data: progress }] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("day_number, title, reference, setup, art_tone")
      .eq("book_slug", plan.book_slug)
      .order("day_number"),
    supabase.from("user_progress").select("day_number, step, completed_at").eq("plan_id", plan.id),
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

export async function buildSessionDay(userId: string, day: number): Promise<SessionDay> {
  const supabase = await db();
  const plan = await activePlan(userId);
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

export async function persistStep(userId: string, day: number, step: number) {
  const supabase = await db();
  const plan = await activePlan(userId);
  await supabase
    .from("user_progress")
    .upsert(
      { user_id: userId, plan_id: plan.id, day_number: day, step },
      { onConflict: "plan_id,day_number" },
    );
  return { ok: true };
}

export async function persistDone(userId: string, day: number, note: string | null) {
  const supabase = await db();
  const plan = await activePlan(userId);
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
  return { ok: true };
}

export async function switchBook(userId: string, bookSlug: string) {
  const supabase = await db();
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

export async function readAccess(userId: string) {
  const supabase = await db();
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

