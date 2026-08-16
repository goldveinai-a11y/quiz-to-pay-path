import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { finalizePurchase } from "@/lib/payments/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout/return")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Opening your plan — Plainly" },
      { name: "description", content: "Your 30 days are being prepared." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Opening your plan — Plainly" },
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
        data: { sessionId, environment: getStripeEnvironment(), origin: window.location.origin },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.tokenHash) {
        await supabase.auth.verifyOtp({ type: "email", token_hash: result.tokenHash });
      }
      navigate({ to: "/plan", replace: true });
    })();
  }, [sessionId, finalize, navigate]);

  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow text-muted-foreground">Plainly</p>
        <h1 className="mt-3 font-serif text-3xl">
          {error ? "Something went wrong" : "Setting up your 30 days"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "One moment — Day 1 opens next."}
        </p>
      </div>
    </main>
  );
}