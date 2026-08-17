import { createServerFn } from "@tanstack/react-start";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";
import { getAccessPlan } from "@/lib/product/pricing";
import { RENEWALS } from "./renewals";

type SessionInput = {
  planCode: string;
  email: string;
  bookSlug: string;
  tradition: string;
  readerName?: string | undefined;
  returnUrl: string;
  environment: StripeEnv;
};

type SessionResult = { clientSecret: string } | { error: string };

/**
 * One session: the intro amount is charged immediately as a one-off line item,
 * and the renewal price starts only after the intro period ends.
 */
export const createIntroCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: SessionInput) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error("Enter a valid email");
    return data;
  })
  .handler(async ({ data }): Promise<SessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const plan = getAccessPlan(data.planCode);
      const renewal = RENEWALS[plan.code] ?? RENEWALS["1-month"]!;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer_email: data.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: plan.amountCents,
              product_data: { name: `BibleRoutine — ${plan.label}` },
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: renewal.amountCents,
              recurring: {
                interval: renewal.interval,
                interval_count: renewal.intervalCount,
              },
              product_data: { name: "BibleRoutine — continued access" },
            },
          },
        ],
        subscription_data: {
          trial_period_days: plan.introDays,
          metadata: { planCode: plan.code },
        },
        metadata: {
          planCode: plan.code,
          bookSlug: data.bookSlug,
          tradition: data.tradition,
          readerName: data.readerName ?? "",
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type FinalizeResult =
  | { ok: true; tokenHash: string | null }
  | { ok: false; error: string };

/**
 * Runs once, right after the card clears: verifies the session server-side,
 * then freezes the plan record and signs the buyer in.
 */
export const finalizePurchase = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv; origin: string }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid session");
    return data;
  })
  .handler(async ({ data }): Promise<FinalizeResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      if (session.payment_status === "unpaid") return { ok: false, error: "Payment not completed" };

      const meta = session.metadata ?? {};
      const email = session.customer_details?.email ?? session.customer_email ?? "";
      if (!email) return { ok: false, error: "No email on the payment" };

      const { fulfillPurchase } = await import("@/lib/product/purchase.server");
      const result = await fulfillPurchase({
        email,
        planCode: meta["planCode"] ?? "1-month",
        bookSlug: meta["bookSlug"] ?? "john",
        tradition: meta["tradition"] ?? "unsure",
        readerName: meta["readerName"] || undefined,
        origin: data.origin,
        providerCustomerId:
          typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
        providerSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null),
      });
      return { ok: true, tokenHash: result.tokenHash };
    } catch (error) {
      return { ok: false, error: getStripeErrorMessage(error) };
    }
  });