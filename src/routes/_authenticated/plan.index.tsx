import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Flame, Settings } from "lucide-react";
import { getMyPlan } from "@/lib/product/product.functions";
import { Plate } from "@/components/product/Plate";
import { Button } from "@/components/ui/button";
import { track, trackReturnVisit } from "@/lib/analytics";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/plan/")({
  head: () => ({
    meta: [
      { title: "Today — BibleRoutine" },
      { name: "description", content: "Your session for today. One passage, one insight, one question." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Today — BibleRoutine" },
      { property: "og:description", content: "Your session for today. One passage, one insight, one question." },
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
  component: TodayPage,
});

function TodayPage() {
  const fetchPlan = useServerFn(getMyPlan);
  const { data, isLoading } = useQuery({ queryKey: ["my-plan"], queryFn: () => fetchPlan() });

  useEffect(() => {
    trackReturnVisit();
  }, []);

  useEffect(() => {
    if (!data) return;
    track("plan_view", {
      current_day: data.currentDay,
      finished: data.finished,
      streak: data.streak.current,
      complete: data.complete,
    });
  }, [data]);

  if (isLoading || !data) {
    return (
      <main className="mx-auto max-w-[480px] px-5 py-10">
        <div className="h-64 animate-pulse rounded-3xl bg-secondary" />
      </main>
    );
  }

  const hero = data.hero;

  return (
    <main className="mx-auto max-w-[480px] px-5 pb-6 pt-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <p className="eyebrow truncate text-muted-foreground">BibleRoutine</p>
        <div className="flex shrink-0 items-center gap-4">
          {data.streak.current > 0 ? (
            <span className="eyebrow flex items-center gap-1.5 text-terra">
              <Flame className="h-3.5 w-3.5" /> {data.streak.current} day
              {data.streak.current === 1 ? "" : "s"}
            </span>
          ) : null}
          <Link
            to="/settings"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4.5 w-4.5" />
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
              <p className="eyebrow text-muted-foreground">
                {data.finished} {data.finished === 1 ? "session" : "sessions"} finished
              </p>
            </div>
            <Link to="/plan/$day" params={{ day: String(hero.day) }}>
              <Button
                onClick={() => track("session_start", { day: hero.day, replay: hero.complete })}
                className="mt-5 h-13 w-full rounded-xl bg-ink py-4 text-base font-semibold text-background hover:bg-ink/90"
              >
                {hero.complete ? "Read again" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="eyebrow mt-3 text-center text-muted-foreground">About {hero.minutes} minutes</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
