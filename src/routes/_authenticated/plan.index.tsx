import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Lock, ArrowRight, LogOut, Flame, NotebookPen } from "lucide-react";
import {
  getMyPlan,
  startBook,
  getAccess,
  cancelAccessNow,
  changePlanNow,
} from "@/lib/product/product.functions";
import { getEmailPrefs, setEmailPrefs } from "@/lib/email/email.functions";
import { Plate } from "@/components/product/Plate";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/plan/")({
  head: () => ({
    meta: [
      { title: "My plan — BibleRoutine" },
      { name: "description", content: "Your 30-day reading plan, one session a day." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My plan — BibleRoutine" },
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
  const fetchPrefs = useServerFn(getEmailPrefs);
  const savePrefs = useServerFn(setEmailPrefs);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["my-plan"], queryFn: () => fetchPlan() });
  const { data: access } = useQuery({ queryKey: ["access"], queryFn: () => fetchAccess() });
  const { data: prefs } = useQuery({ queryKey: ["email-prefs"], queryFn: () => fetchPrefs() });

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
        <p className="eyebrow text-muted-foreground">BibleRoutine</p>
        <div className="flex items-center gap-4">
          {data.streak.current > 0 ? (
            <span className="eyebrow flex items-center gap-1.5 text-terra">
              <Flame className="h-3.5 w-3.5" /> {data.streak.current} day
              {data.streak.current === 1 ? "" : "s"}
            </span>
          ) : null}
          <Link
            to="/notes"
            className="eyebrow flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <NotebookPen className="h-3.5 w-3.5" /> Notes
          </Link>
        </div>
      </header>

      {data.complete ? (
        <section className="mt-4 rounded-3xl border border-terra/30 bg-terra/5 p-5">
          <h2 className="font-serif text-xl font-semibold">You finished {data.bookTitle}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {data.total} sessions, {data.notesCount} written in your own words. Longest run:{" "}
            {data.streak.longest} days.
          </p>
          <Link to="/notes">
            <Button className="mt-4 h-11 w-full rounded-xl bg-ink text-background hover:bg-ink/90">
              Read back what you wrote
            </Button>
          </Link>
        </section>
      ) : null}

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
                  <span className="eyebrow">Day {d.day - 1} first</span>
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
              {b.finished > 0 ? (
                <span className="eyebrow ml-2 text-muted-foreground">{b.finished} done</span>
              ) : null}
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
            <>
              {access.upgrades?.length ? (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Move to a longer cycle — less per day, nothing interrupted.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {access.upgrades.map((u) => (
                      <button
                        key={u.code}
                        type="button"
                        onClick={async () => {
                          await changePlan({
                            data: { planCode: u.code as "1-month" | "3-month", environment: getStripeEnvironment() },
                          });
                          await queryClient.invalidateQueries({ queryKey: ["access"] });
                        }}
                        className="rounded-full border border-border px-4 py-2 text-sm transition-colors duration-150 hover:bg-secondary"
                      >
                        {u.label} · {u.renews}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <details className="mt-4 border-t border-border pt-3">
                <summary className="eyebrow cursor-pointer list-none text-muted-foreground">
                  Manage billing
                </summary>
                <button
                  type="button"
                  onClick={async () => {
                    await cancelNow({ data: { environment: getStripeEnvironment() } });
                    await queryClient.invalidateQueries({ queryKey: ["access"] });
                  }}
                  className="mt-3 block text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
                >
                  Cancel access
                </button>
              </details>
            </>
          )}
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg">Daily nudge</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One short email when the next day opens. Nothing else.
            </p>
          </div>
          <Switch
            checked={prefs?.daily_reminder ?? true}
            onCheckedChange={async (checked) => {
              await savePrefs({ data: { dailyReminder: checked } });
              await queryClient.invalidateQueries({ queryKey: ["email-prefs"] });
            }}
          />
        </div>
        <button
          type="button"
          onClick={signOut}
          className="eyebrow mt-5 flex items-center gap-1.5 border-t border-border pt-4 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </section>

      <nav className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 pb-2 text-[12px] text-muted-foreground">
        <Link to="/terms" className="underline underline-offset-4">
          Terms
        </Link>
        <Link to="/privacy" className="underline underline-offset-4">
          Privacy
        </Link>
        <Link to="/refund" className="underline underline-offset-4">
          Refunds
        </Link>
        <Link to="/contact" className="underline underline-offset-4">
          Contact
        </Link>
      </nav>
    </main>
  );
}