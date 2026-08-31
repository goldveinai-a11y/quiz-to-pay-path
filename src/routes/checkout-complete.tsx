import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { finalizePurchase } from "@/lib/payments/payments.functions";
import { trackOnce } from "@/lib/analytics";
import { trackMetaPurchase } from "@/lib/meta-pixel";

export const Route = createFileRoute("/checkout-complete")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Opening your plan — BibleRoutine" },
      { name: "description", content: "Your 30 days are being prepared." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Opening your plan — BibleRoutine" },
      { property: "og:description", content: "Your 30 days are being prepared." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const navigate = useNavigate();
  const finalize = useServerFn(finalizePurchase);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !sessionId) return;
    ran.current = true;
    void (async () => {
      const result = await finalize({
        data: { sessionId, origin: window.location.origin },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Keyed by session id so a refresh of this URL never double-counts revenue.
      trackOnce(`purchase-${sessionId}`, "purchase", {
        transaction_id: sessionId,
        plan: result.planCode,
        value: result.amount,
        currency: result.currency,
      });
      // Not gated by trackOnce: a refresh of this URL would fire it again, but
      // metaEventId is deterministic per subscription (see purchase.server.ts)
      // and matches the server-side Conversions API call for the same
      // purchase, so Meta dedupes repeats by event id instead of double
      // counting revenue.
      trackMetaPurchase(result.metaEventId, result.amount, result.currency);
      // Remembering the address makes the sign-in screen one tap if anything fails.
      if (result.email) window.localStorage.setItem("br:email", result.email);
      if (result.tokenHash) {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.auth.verifyOtp({ type: "email", token_hash: result.tokenHash });
        navigate({ to: "/plan", replace: true });
        return;
      }
      // Already fulfilled elsewhere (e.g. the payment webhook) — sign in by link.
      navigate({ to: "/auth", replace: true });
    })();
  }, [sessionId, finalize, navigate]);

  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-muted-foreground">BibleRoutine</p>
        <h1 className="mt-3 font-serif text-3xl">
          {error ? "We couldn't open your plan" : "Setting up your 30 days"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "One moment — Day 1 opens next."}
        </p>
        {error ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              If your payment went through, your plan is safe — sign in with your email and it will
              be waiting.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/auth" })}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Sign in to my plan
            </button>
            <a
              href="mailto:hello@bibleroutine.app"
              className="block text-sm underline underline-offset-4 text-muted-foreground"
            >
              Email us and we'll fix it
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
