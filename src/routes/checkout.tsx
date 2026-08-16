import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAnswers } from "@/lib/quiz/store";
import { completePurchase } from "@/lib/product/product.functions";
import { supabase } from "@/integrations/supabase/client";
import { THEME_TO_BOOK } from "@/lib/product/types";

type Search = { plan?: string };

const PRICES: Record<string, { label: string; price: number; renews: string }> = {
  "1-week": { label: "1-week trial", price: 6.99, renews: "$29.99 every 3 months after the trial" },
  "1-month": { label: "1-month access", price: 14.99, renews: "$29.99 every 3 months after" },
  "3-month": { label: "3-month access", price: 29.99, renews: "$69.99 every year after" },
};

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
  const purchase = useServerFn(completePurchase);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = PRICES[plan ?? "1-month"] ?? PRICES["1-month"]!;

  useEffect(() => {
    const a = loadAnswers();
    if (typeof a["email"] === "string") setEmail(a["email"] as string);
  }, []);

  const pay = async () => {
    setPending(true);
    setError(null);
    try {
      const answers = loadAnswers();
      const theme = typeof answers["theme"] === "string" ? (answers["theme"] as string) : "";
      const result = await purchase({
        data: {
          email: email.trim().toLowerCase(),
          planCode: plan ?? "1-month",
          bookSlug: THEME_TO_BOOK[theme] ?? "john",
          tradition: typeof answers["tradition"] === "string" ? (answers["tradition"] as string) : "unsure",
          readerName: typeof answers["name"] === "string" ? (answers["name"] as string) : undefined,
          origin: window.location.origin,
        },
      });
      // Same tab, same moment: the buyer is signed in and lands on their plan.
      if (result.tokenHash) {
        await supabase.auth.verifyOtp({ type: "email", token_hash: result.tokenHash });
      }
      navigate({ to: "/plan", replace: true });
    } catch (e) {
      setPending(false);
      setError(e instanceof Error ? e.message : "We couldn't complete that payment.");
    }
  };

  return (
    <main className="min-h-screen bg-ink/60 px-4 py-8 backdrop-blur-sm sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total today</p>
            <p className="font-serif text-4xl font-semibold">${selected.price.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selected.label} · then {selected.renews}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close checkout"
            onClick={() => navigate({ to: "/result" })}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {(
          <>
            <div className="mt-6">
              <label className="text-sm font-medium" htmlFor="checkout-email">
                Email
              </label>
              <Input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1.5 h-12 rounded-xl bg-background"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Your receipt and plan link go here.
              </p>
              {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={pay}
                disabled={pending || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="h-13 w-full rounded-xl py-4 text-base font-semibold"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {pending ? "Processing…" : `Pay $${selected.price.toFixed(2)} now`}
              </Button>
            </div>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Secure payment · cancel any time
            </p>
          </>
        )}
      </div>
    </main>
  );
      }
