import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { X, Lock } from "lucide-react";
import { loadAnswers } from "@/lib/quiz/store";
import { createIntroCheckout } from "@/lib/payments/payments.functions";
import { getStripe } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { THEME_TO_BOOK } from "@/lib/product/types";
import { track } from "@/lib/analytics";
import { getAccessPlan } from "@/lib/product/pricing";

type Search = { plan?: string };

export const Route = createFileRoute("/checkout")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => ({
    plan: typeof search["plan"] === "string" ? search["plan"] : "1-month",
  }),
  head: () => ({
    meta: [
      { title: "Checkout — start your 30-day Bible plan" },
      {
        name: "description",
        content: "Confirm your plan and start reading today. Cancel any time.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Checkout — start your 30-day Bible plan" },
      { property: "og:description", content: "Confirm your plan and start reading today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const startCheckout = useServerFn(createIntroCheckout);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // One source of truth for prices: the same table the payment catalog is built from.
  const selected = getAccessPlan(plan);
  const price = selected.amountCents / 100;

  // The payment form is opened straight away: no email step, no extra click.
  useEffect(() => {
    let cancelled = false;
    const answers = loadAnswers();
    const theme = typeof answers["theme"] === "string" ? (answers["theme"] as string) : "";
    const email = typeof answers["email"] === "string" ? (answers["email"] as string).trim() : "";
    setError(null);
    setClientSecret(null);
    track("checkout_email_submit", {
      plan: plan ?? "1-month",
      value: price,
      currency: "USD",
    });
    startCheckout({
      data: {
        ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { email: email.toLowerCase() } : {}),
        planCode: plan ?? "1-month",
        bookSlug: THEME_TO_BOOK[theme] ?? "john",
        tradition:
          typeof answers["tradition"] === "string" ? (answers["tradition"] as string) : "unsure",
        readerName: typeof answers["name"] === "string" ? (answers["name"] as string) : undefined,
        returnUrl: `${window.location.origin}/checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
      },
    })
      .then((result) => {
        if (cancelled) return;
        if ("error" in result) throw new Error(result.error);
        setClientSecret(result.clientSecret);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        track("checkout_error", { plan: plan ?? "1-month" });
        setError(e instanceof Error ? e.message : "We couldn't open the payment form.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, attempt]);

  return (
    <main className="min-h-screen bg-ink/60 px-4 py-8 backdrop-blur-sm sm:grid sm:place-items-center">
      <PaymentTestModeBanner />
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.label} · cancel any time
          </p>
          <button
            type="button"
            aria-label="Close checkout"
            onClick={() => navigate({ to: "/result" })}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-destructive">{error}</p>
        ) : clientSecret ? (
          <div className="mt-6">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Opening secure payment…
          </div>
        )}
      </div>
    </main>
  );
}
