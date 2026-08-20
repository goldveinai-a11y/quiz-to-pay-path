import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, createStripeClient, verifyWebhook } from "@/lib/stripe.server";

let cached: ReturnType<typeof createClient<Database>> | null = null;
function admin() {
  if (!cached) {
    cached = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return cached;
}

function iso(seconds: number | null | undefined) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function syncSubscription(sub: any, status?: string) {
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  await admin()
    .from("subscriptions")
    .update({
      status: status ?? sub.status,
      current_period_end: iso(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      canceled_at: sub.canceled_at ? iso(sub.canceled_at) : null,
    })
    .eq("provider_subscription_id", sub.id);
}

/**
 * Safety net: if the buyer closes the tab before the return screen finishes,
 * the account and plan are still created here. Fulfilment is idempotent.
 */
async function fulfillFromSession(session: any) {
  if (session.payment_status === "unpaid") return;
  const meta = session.metadata ?? {};
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  if (!email) return;

  const { fulfillPurchase } = await import("@/lib/product/purchase.server");
  await fulfillPurchase({
    email,
    planCode: meta["planCode"] ?? "1-month",
    bookSlug: meta["bookSlug"] ?? "john",
    tradition: meta["tradition"] ?? "unsure",
    readerName: meta["readerName"] || undefined,
    providerCustomerId: typeof session.customer === "string" ? session.customer : null,
    providerSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
  });
}

/** A renewal cleared: push the access date forward from the subscription. */
async function extendFromInvoice(invoice: any, env: StripeEnv) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : (invoice.subscription?.id ??
        invoice.parent?.subscription_details?.subscription ??
        invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription);
  if (typeof subscriptionId !== "string") return;

  const stripe = createStripeClient(env);
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(sub);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
              await fulfillFromSession(event.data.object);
              break;
            case "invoice.paid":
              await extendFromInvoice(event.data.object, env);
              break;
            case "customer.subscription.updated":
              await syncSubscription(event.data.object);
              break;
            case "customer.subscription.deleted":
              await syncSubscription(event.data.object, "canceled");
              break;
            default:
              break;
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
