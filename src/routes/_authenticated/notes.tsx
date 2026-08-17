import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { getMyNotes } from "@/lib/product/product.functions";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "My notes — BibleRoutine" },
      { name: "description", content: "Everything you wrote across your 30 days, in one place." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My notes — BibleRoutine" },
      { property: "og:description", content: "Everything you wrote across your 30 days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <main className="mx-auto grid min-h-screen max-w-[480px] place-items-center px-5 text-center">
      <div>
        <h1 className="font-serif text-2xl">Your notes didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </main>
  ),
  component: NotesPage,
});

function NotesPage() {
  const fetchNotes = useServerFn(getMyNotes);
  const { data, isLoading } = useQuery({ queryKey: ["my-notes"], queryFn: () => fetchNotes() });

  return (
    <main className="mx-auto max-w-[480px] px-5 pb-20 pt-6">
      <Link
        to="/plan"
        className="eyebrow inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> My plan
      </Link>
      <h1 className="mt-5 font-serif text-3xl font-semibold">In your own words</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything you wrote, kept together. Nobody else can read this.
      </p>

      {isLoading ? (
        <div className="mt-8 h-40 animate-pulse rounded-3xl bg-secondary" />
      ) : data && data.length > 0 ? (
        <ol className="mt-7 space-y-3">
          {data.map((n) => (
            <li key={n.day} className="rounded-2xl border border-border bg-card p-5">
              <p className="eyebrow text-muted-foreground">
                Day {n.day} · {n.reference}
              </p>
              <p className="mt-1.5 font-serif text-lg leading-snug">{n.question || n.title}</p>
              <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed">{n.note}</p>
              <Link
                to="/plan/$day"
                params={{ day: String(n.day) }}
                className="eyebrow mt-4 inline-block text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Open day {n.day}
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nothing written yet. The last step of each session asks one question — anything you type
          there lands here.
        </p>
      )}
    </main>
  );
}