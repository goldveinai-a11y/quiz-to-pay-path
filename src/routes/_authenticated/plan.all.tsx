import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Lock } from "lucide-react";
import { getMyPlan, startBook } from "@/lib/product/product.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/plan/all")({
  head: () => ({
    meta: [
      { title: "The 30 days — BibleRoutine" },
      { name: "description", content: "Every session in your plan, and the books you can start next." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "The 30 days — BibleRoutine" },
      { property: "og:description", content: "Every session in your plan, in one list." },
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
  component: AllDaysPage,
});

function AllDaysPage() {
  const fetchPlan = useServerFn(getMyPlan);
  const switchBook = useServerFn(startBook);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["my-plan"], queryFn: () => fetchPlan() });

  if (isLoading || !data) {
    return (
      <main className="mx-auto max-w-[480px] px-5 py-10">
        <div className="h-64 animate-pulse rounded-3xl bg-secondary" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[480px] px-5 pb-10 pt-6">
      <h1 className="font-serif text-3xl font-semibold">{data.bookTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {data.finished} of {data.total} sessions finished.
      </p>

      <ol className="mt-6 space-y-1.5">
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

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
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
    </main>
  );
}
