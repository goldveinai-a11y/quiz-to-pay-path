import { createFileRoute } from "@tanstack/react-router";

/**
 * Called once a day by the scheduler. Guarded by a shared secret because it
 * lives on a public path.
 */
export const Route = createFileRoute("/api/public/emails/daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided =
          request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");
        if (!provided) return new Response("Unauthorized", { status: 401 });

        const envSecret = process.env["EMAIL_CRON_SECRET"];
        let allowed = Boolean(envSecret) && provided === envSecret;
        if (!allowed) {
          // The database scheduler carries its own key, kept server-side only.
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data } = await supabaseAdmin
            .from("job_secrets")
            .select("value")
            .eq("name", "email_daily")
            .maybeSingle();
          allowed = Boolean(data?.value) && provided === data!.value;
        }
        if (!allowed) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runDailyDispatch, siteUrl } = await import("@/lib/email/dispatch.server");
        const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
        try {
          const summary = await runDailyDispatch(siteUrl(new URL(request.url).origin));
          // Every run leaves a row, so a silent day is visible immediately.
          await admin.from("email_job_runs").insert({
            ok: true,
            daily: summary.daily,
            win_back: summary.winBack,
            finish: summary.finish,
            skipped: summary.skipped,
            reasons: summary.reasons,
          });
          return Response.json({ ok: true, ...summary });
        } catch (error) {
          console.error("Daily email dispatch failed:", error);
          await admin
            .from("email_job_runs")
            .insert({ ok: false, error: error instanceof Error ? error.message : String(error) });
          return new Response("Dispatch failed", { status: 500 });
        }
      },
    },
  },
});