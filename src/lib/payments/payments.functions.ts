import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { resolveStripeEnv } from "./env.server";
import { getAccessPlan } from "@/lib/product/pricing";
import { RENEWALS } from "./renewals";
import { ensureIntroPrice, ensureRenewalPrice } from "./catalog.server";

type SessionInput = {
  planCode: string;
  email?: string | undefined;
  bookSlug: string;
  tradition: string;
  readerName?: string | undefined;
  returnUrl: string;
};

type SessionResult = { clientSecret: string } | { error: string };

/**
 * One subscription: the intro amount is billed on the first invoice (so the
 * card is charged today), and the renewal price takes over when the intro
 * period ends.
 */
export const createIntroCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: SessionInput) => {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      throw new Error("Enter a valid email");
    return data;
  })
  .handler(async ({ data }): Promise<SessionResult> => {
    try {
      const environment = resolveStripeEnv();
      const stripe = createStripeClient(environment);
      const plan = getAccessPlan(data.planCode);
      const renewal = RENEWALS[plan.code] ?? RENEWALS["1-month"]!;

      const [introPrice, renewalPrice] = await Promise.all([
        ensureIntroPrice(stripe, plan.code),
        ensureRenewalPrice(stripe, renewal),
      ]);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ui_mode: "embedded_page",
        // One language everywhere; the auto locale made the pay button overflow.
        locale: "en",
        return_url: data.returnUrl,
        ...(data.email ? { customer_email: data.email } : {}),
        line_items: [
          // Charged today, on the first invoice.
          { price: introPrice.id, quantity: 1 },
          // Starts only when the intro period ends, so nothing extra today.
          { price: renewalPrice.id, quantity: 1 },
        ],
        subscription_data: {
          trial_period_days: plan.introDays,
          description: `BibleRoutine — ${plan.label}`,
          metadata: {
            planCode: plan.code,
            bookSlug: data.bookSlug,
            tradition: data.tradition,
            readerName: data.readerName ?? "",
          },
        },
        metadata: {
          planCode: plan.code,
          bookSlug: data.bookSlug,
          tradition: data.tradition,
          readerName: data.readerName ?? "",
        },
        // Stripe takes on tax calculation, collection, filing and remittance.
        managed_payments: { enabled: true },
      } as Stripe.Checkout.SessionCreateParams);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type FinalizeResult =
  | {
      ok: true;
      tokenHash: string | null;
      email: string;
      // Non-identifying purchase facts, used only for analytics on the return screen.
      planCode: string;
      amount: number;
      currency: string;
    }
  | { ok: false; error: string };

/**
 * Runs right after the card clears: verifies the session server-side, then
 * freezes the plan record and signs the buyer in. The webhook does the same
 * work if the buyer closes the tab first; fulfilment is idempotent.
 */
export const finalizePurchase = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; origin: string }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid session");
    return data;
  })
  .handler(async ({ data }): Promise<FinalizeResult> => {
    try {
      const environment = resolveStripeEnv();
      const stripe = createStripeClient(environment);
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
      return {
        ok: true,
        tokenHash: result.tokenHash,
        email,
        planCode: meta["planCode"] ?? "1-month",
        amount: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "usd").toUpperCase(),
      };
    } catch (error) {
      return { ok: false, error: getStripeErrorMessage(error) };
    }
  });
