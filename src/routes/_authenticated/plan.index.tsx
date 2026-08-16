import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Lock, ArrowRight, LogOut } from "lucide-react";
import {
  getMyPlan,
  startBook,
  getAccess,
  cancelAccessNow,
  changePlanNow,
} from "@/lib/product/product.functions";
import { Plate } from "@/components/product/Plate";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/plan/")({
  head: () => ({
    meta: [
      { title: "My plan — Plainly" },
      { name: "description", content: "Your 30-day reading plan, one session a day." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My plan — Plainly" },
      { property: "og:description", content: "Your 30-day reading plan, one session a day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <main className="mx-auto grid min-h-screen max-w-[480px] place-items-center px-5 text-center">
      <div>
        <h1 className="font-serif text-2xl">Your plan didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </main>
  ),
  component: PlanPage,
});

function formatUnlock(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PlanPage() {
  const fetchPlan = useServerFn(getMyPlan);
  const switchBook = useServerFn(startBook);
  const fetchAccess = useServerFn(getAccess);
  const cancelNow = useServerFn(cancelAccessNow);
  const changePlan = useServerFn(changePlanNow);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["my-plan"], queryFn: () => fetchPlan() });
  const { data: access } = useQuery({ queryKey: ["access"], queryFn: () => fetchAccess() });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (isLoading || !data) {
    return (
      <main className="mx-auto max-w-[480px] px-5 py-10">
        <div className="h-64 animate-pulse rounded-3xl bg-secondary" />
      </main>
    );
  }

  const hero = data.hero;

  return (
    <main className="mx-auto max-w-[480px] px-5 pb-20 pt-6">
      <header className="flex items-center justify-between">
        <p className="eyebrow text-muted-foreground">Plainly</p>
        <button
          type="button"
          onClick={signOut}
          className="eyebrow flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </header>

      {hero ? (
        <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-s2">
          <Plate day={hero.day} tone={hero.tone} className="h-44">
            <div className="flex h-44 flex-col justify-end p-5">
              <p className="eyebrow text-white/70">
                Day {hero.day} · {data.bookTitle}
              </p>
              <p className="font-serif text-5xl font-semibold leading-none text-white">
                Day {hero.day}
              </p>
            </div>
          </Plate>
          <div className="p-5">
            <h1 className="font-serif text-2xl font-semibold leading-snug">{hero.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hero.setup}</p>
            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-terra transition-[width] duration-150"
                style={{ width: `${Math.round((data.finished / data.total) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="eyebrow text-muted-foreground">
                Day {data.currentDay} of {data.total}
              </p>
              <p className="eyebrow text-muted-foreground">{data.finished} {data.finished === 1 ? "session" : "sessions"} finished</p>
            </div>
            <Link to="/plan/$day" params={{ day: String(hero.day) }}>
              <Button className="mt-5 h-13 w-full rounded-xl bg-ink py-4 text-base font-semibold text-background hover:bg-ink/90">
                {hero.complete ? "Read again" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      ) : null}

      <h2 className="eyebrow mt-9 text-muted-foreground">The 30 days</h2>
      <ol className="mt-3 space-y-1.5">
        {data.days.map((d) => {
          const isToday = d.day === data.currentDay;
          const row = (
            <div
              className={cn(
                "flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-colors duration-150",
                isToday
                  ? "border-terra/40 bg-terra/5"
                  : d.unlocked
                    ? "border-border bg-card hover:bg-secondary/60"
                    : "border-transparent bg-secondary/40",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs",
                  d.done
                    ? "bg-success/15 text-success"
                    : isToday
                      ? "bg-terra text-white"
                      : d.unlocked
                        ? "bg-secondary text-foreground"
                        : "bg-transparent text-muted-foreground",
                )}
              >
                {d.done ? <Check className="h-4 w-4" /> : d.day}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-sm font-medium",
                    d.unlocked ? "" : "text-muted-foreground",
                  )}
                >
                  {d.title}
                </span>
                <span className="eyebrow block text-muted-foreground">{d.reference}</span>
              </span>
              {d.unlocked ? null : (
                <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="eyebrow">{formatUnlock(d.unlockAt)}</span>
                </span>
              )}
            </div>
          );
          return (
            <li key={d.day}>
              {d.unlocked ? (
                <Link to="/plan/$day" params={{ day: String(d.day) }} className="block">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ol>

      <section className="mt-10 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-lg">After this book</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start a different 30 days whenever you like. Your finished sessions stay.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.otherBooks.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={async () => {
                await switchBook({ data: { bookSlug: b.slug } });
                await queryClient.invalidateQueries({ queryKey: ["my-plan"] });
              }}
              className="rounded-full border border-border px-4 py-2 text-sm transition-colors duration-150 hover:bg-secondary"
            >
              {b.title}
            </button>
          ))}
        </div>
      </section>

      {access ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-lg">Your access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {access.planLabel}
            {access.renewsAt
              ? ` · ${access.cancelAtPeriodEnd ? "ends" : "renews"} ${formatUnlock(access.renewsAt)}`
              : ""}
          </p>
          {access.cancelAtPeriodEnd ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Cancelled. You keep everything until the date above.
            </p>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await cancelNow({ data: { environment: getStripeEnvironment() } });
                await queryClient.invalidateQueries({ queryKey: ["access"] });
              }}
              className="mt-3 text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              Cancel access
            </button>
          )}
        </section>
      ) : null}
    </main>
  );
}