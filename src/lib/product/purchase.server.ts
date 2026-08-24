import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BOOK_TITLES } from "./types";
import { getAccessPlan } from "./pricing";

type Admin = ReturnType<typeof createClient<Database>>;

async function adminClient(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

export type PurchaseInput = {
  email: string;
  planCode: string;
  bookSlug?: string | undefined;
  tradition?: string | undefined;
  voices?: string | undefined;
  showBothSides?: boolean | undefined;
  readerName?: string | undefined;
  origin?: string | undefined;
  providerCustomerId?: string | null | undefined;
  providerSubscriptionId?: string | null | undefined;
};

/**
 * Freezes the plan at the moment of payment: creates (or finds) the account,
 * writes ONE user_plans record, and mails the person their sign-in link.
 * Everything after this point reads the record, never the quiz answers.
 */
export async function fulfillPurchase(input: PurchaseInput) {
  const admin = await adminClient();
  const email = input.email.trim().toLowerCase();

  // The return screen and the webhook both fulfil; whichever lands first wins.
  if (input.providerSubscriptionId) {
    const { data: already } = await admin
      .from("subscriptions")
      .select("id")
      .eq("provider_subscription_id", input.providerSubscriptionId)
      .maybeSingle();
    if (already) {
      // The webhook got here first. The buyer is still sitting on the return
      // screen, so mint them a sign-in token instead of dropping them at /auth.
      const origin = input.origin?.startsWith("http") ? input.origin : undefined;
      const link = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        ...(origin ? { options: { redirectTo: `${origin}/auth` } } : {}),
      });
      return {
        tokenHash: link.data?.properties?.hashed_token ?? null,
        planId: null,
        bookSlug: input.bookSlug ?? "john",
      };
    }
  }
  const bookSlug = BOOK_TITLES[input.bookSlug ?? ""] ? input.bookSlug! : "john";
  const plan = getAccessPlan(input.planCode);

  let userId: string | null = null;
  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: input.readerName ?? null },
  });
  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error || !link.data.user) {
      throw new Error(created.error?.message ?? "Could not create the account");
    }
    userId = link.data.user.id;
  }

  await admin.from("user_plans").update({ is_active: false }).eq("user_id", userId);

  const { data: planRow, error: planError } = await admin
    .from("user_plans")
    .insert({
      user_id: userId,
      book_slug: bookSlug,
      book_title: BOOK_TITLES[bookSlug] ?? "John in 30 days",
      // Only public-domain texts, and only ones we actually hold in full.
      translation: input.tradition === "baptist" ? "KJV" : "WEB",
      tradition: input.tradition ?? "unsure",
      voices: input.voices ?? "classic",
      show_both_sides: input.showBothSides ?? true,
      reader_name: input.readerName ?? null,
      is_active: true,
    })
    .select("id")
    .single();
  if (planError || !planRow) throw new Error(planError?.message ?? "Could not create the plan");

  const periodEnd = new Date(Date.now() + plan.introDays * 86400000).toISOString();
  await admin.from("subscriptions").insert({
    user_id: userId,
    plan_code: plan.code,
    status: "active",
    amount_cents: plan.amountCents,
    current_period_end: periodEnd,
    provider_customer_id: input.providerCustomerId ?? null,
    provider_subscription_id: input.providerSubscriptionId ?? null,
  });

  // Exactly ONE sign-in token per purchase: minting a second one invalidates
  // the first, which is what used to break the emailed link and code.
  const origin = input.origin?.startsWith("http") ? input.origin : undefined;
  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    ...(origin ? { options: { redirectTo: `${origin}/auth` } } : {}),
  });
  const tokenHash = link.data?.properties?.hashed_token ?? null;
  const actionLink = link.data?.properties?.action_link ?? null;

  // Reminders are on from day one, with a one-click way out in every email.
  const { ensurePreferences, sendWelcome } = await import("@/lib/email/dispatch.server");
  await ensurePreferences(userId, email);
  await sendWelcome(userId, email, bookSlug, origin, actionLink);

  return { tokenHash, planId: planRow.id, bookSlug };
}