import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { unsubscribeEmails } from "@/lib/email/email.functions";

export const Route = createFileRoute("/unsubscribe")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Email settings — Plainly" },
      { name: "description", content: "Turn off Plainly reminder emails in one click." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Email settings — Plainly" },
      { property: "og:description", content: "Turn off Plainly reminder emails in one click." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const unsubscribe = useServerFn(unsubscribeEmails);
  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState("failed");
      return;
    }
    void unsubscribe({ data: { token } })
      .then((r) => setState(r.ok ? "done" : "failed"))
      .catch(() => setState("failed"));
  }, [token, unsubscribe]);

  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-sm">
        <p className="eyebrow text-muted-foreground">Plainly</p>
        <h1 className="mt-3 font-serif text-3xl">
          {state === "working"
            ? "One moment"
            : state === "done"
              ? "Emails are off"
              : "That link didn't work"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {state === "done"
            ? "No more reminders. Your plan and everything you've written stay exactly as they are."
            : state === "failed"
              ? "You can turn reminders off from your plan instead."
              : "Turning your reminders off."}
        </p>
        <Link to="/plan" className="mt-6 inline-block text-sm underline underline-offset-4">
          Go to my plan
        </Link>
      </div>
    </main>
  );
}