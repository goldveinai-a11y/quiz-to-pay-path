import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BOOK_TITLES } from "@/lib/product/types";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

type SendResult = { delivered: boolean; reason?: string };

/** One delivery point: managed sending, suppression handled by the platform. */
async function deliver(
  templateName: string,
  to: string,
  templateData: Record<string, unknown>,
  idempotencyKey: string,
): Promise<SendResult> {
  try {
    const result = await sendTemplateEmail(templateName, to, { templateData, idempotencyKey });
    return result.sent ? { delivered: true } : { delivered: false, reason: result.reason };
  } catch (error) {
    console.error(`[email] ${templateName} failed for ${to}:`, error);
    return { delivered: false, reason: "send_failed" };
  }
}

type Admin = ReturnType<typeof createClient<Database>>;

async function db(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

const DAY_MS = 86400000;

export function siteUrl(origin?: string | null) {
  if (origin?.startsWith("http")) return origin.replace(/\/$/, "");
  const configured = process.env["SITE_URL"];
  if (configured) return configured.replace(/\/$/, "");
  return "https://www.bibleroutine.app";
}

/** Every reader has one preferences row; it also carries the unsubscribe key. */
export async function ensurePreferences(userId: string, email: string) {
  const admin = await db();
  const { data } = await admin
    .from("email_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) return data;
  const { data: created } = await admin
    .from("email_preferences")
    .insert({ user_id: userId, email })
    .select("*")
    .single();
  return created;
}

async function alreadySent(userId: string, kind: string, day: number | null) {
  const admin = await db();
  let query = admin.from("email_events").select("id").eq("user_id", userId).eq("kind", kind);
  query = day === null ? query.is("day_number", null) : query.eq("day_number", day);
  const { data } = await query.limit(1).maybeSingle();
  return Boolean(data);
}

async function record(userId: string, kind: string, day: number | null) {
  const admin = await db();
  await admin.from("email_events").insert({ user_id: userId, kind, day_number: day });
}

async function signInLink(email: string, redirectTo: string) {
  const admin = await db();
  const { data } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  return data?.properties?.action_link ?? redirectTo;
}

/** Sent once, right after payment. Carries the only key back into the product. */
export async function sendWelcome(userId: string, email: string, bookSlug: string, origin?: string) {
  const base = siteUrl(origin);
  const prefs = await ensurePreferences(userId, email);
  if (!prefs) return { delivered: false, reason: "no_preferences" };
  if (await alreadySent(userId, "welcome", null)) return { delivered: false, reason: "duplicate" };

  const link = await signInLink(email, `${base}/plan/1`);
  const result = await deliver(
    "welcome",
    email,
    { bookTitle: BOOK_TITLES[bookSlug] ?? "your plan", signInUrl: link },
    `welcome-${userId}`,
  );
  if (result.delivered) await record(userId, "welcome", null);
  return result;
}

type Summary = { daily: number; winBack: number; finish: number; skipped: number };

/**
 * One pass over every active plan. Each reader gets at most one email:
 * today's session, a nudge after three quiet days, or the finish note.
 */
export async function runDailyDispatch(origin?: string): Promise<Summary> {
  const admin = await db();
  const base = siteUrl(origin);
  const summary: Summary = { daily: 0, winBack: 0, finish: 0, skipped: 0 };

  const { data: plans } = await admin
    .from("user_plans")
    .select("id, user_id, book_slug, started_at, created_at, paused_until, streak_count")
    .eq("is_active", true);

  for (const plan of plans ?? []) {
    const prefs = await admin
      .from("email_preferences")
      .select("*")
      .eq("user_id", plan.user_id)
      .maybeSingle();
    const pref = prefs.data;
    if (!pref) {
      summary.skipped += 1;
      continue;
    }
    if (plan.paused_until && new Date(plan.paused_until).getTime() > Date.now()) {
      summary.skipped += 1;
      continue;
    }

    const { data: sessions } = await admin
      .from("study_sessions")
      .select("day_number, title, reference, setup, book, chapter, verse_start")
      .eq("book_slug", plan.book_slug)
      .order("day_number");
    const { data: progress } = await admin
      .from("user_progress")
      .select("day_number, completed_at, note")
      .eq("plan_id", plan.id);

    const done = new Set(
      (progress ?? []).filter((p) => p.completed_at).map((p) => p.day_number),
    );
    const total = (sessions ?? []).length;
    // A day is open once the one before it is finished.
    const nextSession = (sessions ?? []).find(
      (s) => !done.has(s.day_number) && (s.day_number === 1 || done.has(s.day_number - 1)),
    );
    const lastTouch = (progress ?? [])
      .map((p) => (p.completed_at ? new Date(p.completed_at).getTime() : 0))
      .reduce((a, b) => Math.max(a, b), 0);
    const quietDays = lastTouch ? Math.floor((Date.now() - lastTouch) / DAY_MS) : 0;

    // Finished the book.
    if (total > 0 && done.size >= total) {
      if (pref.milestone && !(await alreadySent(plan.user_id, "finish", null))) {
        const notes = (progress ?? []).filter((p) => p.note && p.note.trim()).length;
        const result = await deliver(
          "plan-finished",
          pref.email,
          {
            bookTitle: BOOK_TITLES[plan.book_slug] ?? plan.book_slug,
            sessions: done.size,
            notes,
            reviewUrl: `${base}/plan?review=1`,
          },
          `plan-finished-${plan.user_id}-${plan.book_slug}`,
        );
        if (result.delivered) {
          await record(plan.user_id, "finish", null);
          summary.finish += 1;
          continue;
        }
      }
      summary.skipped += 1;
      continue;
    }

    if (!nextSession) {
      summary.skipped += 1;
      continue;
    }

    // Three quiet days: one line from the session they left.
    if (quietDays >= 3 && pref.win_back) {
      const sinceLastNudge = await admin
        .from("email_events")
        .select("sent_at")
        .eq("user_id", plan.user_id)
        .eq("kind", "win_back")
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const recent =
        sinceLastNudge.data &&
        Date.now() - new Date(sinceLastNudge.data.sent_at).getTime() < 5 * DAY_MS;
      if (!recent) {
        const { data: verse } = await admin
          .from("verses")
          .select("text")
          .eq("translation", "WEB")
          .eq("book", nextSession.book)
          .eq("chapter", nextSession.chapter)
          .eq("verse", nextSession.verse_start)
          .maybeSingle();
        const link = await signInLink(pref.email, `${base}/plan/${nextSession.day_number}`);
        const result = await deliver(
          "win-back",
          pref.email,
          {
            day: nextSession.day_number,
            title: nextSession.title,
            quote: verse?.text ?? nextSession.setup,
            reference: nextSession.reference,
            planUrl: link,
          },
          `win-back-${plan.user_id}-${nextSession.day_number}-${new Date().toISOString().slice(0, 10)}`,
        );
        if (result.delivered) {
          await record(plan.user_id, "win_back", nextSession.day_number);
          summary.winBack += 1;
          continue;
        }
      }
    }

    // Today's session, once per day number.
    if (pref.daily_reminder && !(await alreadySent(plan.user_id, "daily", nextSession.day_number))) {
      const link = await signInLink(pref.email, `${base}/plan/${nextSession.day_number}`);
      const result = await deliver(
        "daily-session",
        pref.email,
        {
          day: nextSession.day_number,
          title: nextSession.title,
          reference: nextSession.reference,
          setup: nextSession.setup,
          streak: streakFor.get(plan.user_id) ?? 0,
          planUrl: link,
        },
        `daily-${plan.user_id}-${nextSession.day_number}`,
      );
      if (result.delivered) {
        await record(plan.user_id, "daily", nextSession.day_number);
        summary.daily += 1;
        continue;
      }
    }

    summary.skipped += 1;
  }

  return summary;
}
