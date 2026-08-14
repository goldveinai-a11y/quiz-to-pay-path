import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Lock, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAnswers } from "@/lib/quiz/store";

type Search = { plan?: string };

const PRICES: Record<string, { label: string; price: number; renews: string }> = {
  "1-week": { label: "1-week trial", price: 1, renews: "€6.99 every week after the trial" },
  "1-month": { label: "1-month access", price: 4.99, renews: "€14.99 every month after" },
  "3-month": { label: "3-month access", price: 9.99, renews: "€29.99 every 3 months after" },
};

export const Route = createFileRoute("/checkout")({
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
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const selected = PRICES[plan ?? "1-month"] ?? PRICES["1-month"]!;

  useEffect(() => {
    const a = loadAnswers();
    if (typeof a["email"] === "string") setEmail(a["email"] as string);
  }, []);

  const pay = () => {
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setDone(true);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-ink/60 px-4 py-8 backdrop-blur-sm sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total today</p>
            <p className="font-serif text-4xl font-semibold">€{selected.price.toFixed(2)}</p>
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

        {done ? (
          <div className="mt-8 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-3 text-2xl font-semibold">Payments coming soon</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This is the checkout preview. Real billing, accounts and the reading app are the next
              step — your answers and plan are saved.
            </p>
            <Button
              onClick={() => navigate({ to: "/result" })}
              className="mt-6 h-12 w-full rounded-full"
            >
              Back to my plan
            </Button>
          </div>
        ) : (
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
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={pay}
                className="h-12 w-full rounded-xl bg-ink text-sm font-semibold text-background"
              >
                 Pay
              </button>
              <button
                type="button"
                onClick={pay}
                className="h-12 w-full rounded-xl border border-border bg-background text-sm font-semibold"
              >
                G Pay
              </button>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or pay with card</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Button
                onClick={pay}
                disabled={pending || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="h-13 w-full rounded-xl py-4 text-base font-semibold"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {pending ? "Processing…" : `Pay €${selected.price.toFixed(2)}`}
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