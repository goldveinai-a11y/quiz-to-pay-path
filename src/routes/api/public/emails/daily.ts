import { createFileRoute } from "@tanstack/react-router";

/**
 * Called once a day by the scheduler. Guarded by a shared secret because it
 * lives on a public path.
 */
export const Route = createFileRoute("/api/public/emails/daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["EMAIL_CRON_SECRET"];
        const provided =
          request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");
        if (!secret || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runDailyDispatch, siteUrl } = await import("@/lib/email/dispatch.server");
        try {
          const summary = await runDailyDispatch(siteUrl(new URL(request.url).origin));
          return Response.json({ ok: true, ...summary });
        } catch (error) {
          console.error("Daily email dispatch failed:", error);
          return new Response("Dispatch failed", { status: 500 });
        }
      },
    },
  },
});