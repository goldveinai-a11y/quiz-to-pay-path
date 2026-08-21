import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut } from "lucide-react";
import {
  getAccess,
  cancelAccessNow,
  resumeAccessNow,
  changePlanNow,
  getMyPlan,
  setMyTranslation,
} from "@/lib/product/product.functions";
import { getEmailPrefs, setEmailPrefs } from "@/lib/email/email.functions";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BibleRoutine" },
      { name: "description", content: "Your access, your daily email and your account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings — BibleRoutine" },
      { property: "og:description", content: "Your access, your daily email and your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SettingsPage() {
  const fetchAccess = useServerFn(getAccess);
  const cancelNow = useServerFn(cancelAccessNow);
  const resumeNow = useServerFn(resumeAccessNow);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const changePlan = useServerFn(changePlanNow);
  const fetchPrefs = useServerFn(getEmailPrefs);
  const savePrefs = useServerFn(setEmailPrefs);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: access } = useQuery({ queryKey: ["access"], queryFn: () => fetchAccess() });
  const { data: prefs } = useQuery({ queryKey: ["email-prefs"], queryFn: () => fetchPrefs() });
  const fetchPlan = useServerFn(getMyPlan);
  const saveTranslation = useServerFn(setMyTranslation);
  const { data: plan } = useQuery({ queryKey: ["my-plan"], queryFn: () => fetchPlan() });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="mx-auto max-w-[480px] px-5 pb-10 pt-6">
      <h1 className="font-serif text-3xl font-semibold">Settings</h1>

      {access ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-lg">Your access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {access.planLabel}
            {access.renewsAt
              ? ` · ${access.cancelAtPeriodEnd ? "ends" : "renews"} ${formatDate(access.renewsAt)}`
              : ""}
          </p>
          {access.cancelAtPeriodEnd ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Cancelled. You keep everything until the date above.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await resumeNow();
                    await queryClient.invalidateQueries({ queryKey: ["access"] });
                  } finally {
                    setBusy(false);
                  }
                }}
                className="mt-3 rounded-full border border-foreground bg-foreground px-4 py-2 text-sm text-background transition-opacity duration-150 disabled:opacity-60"
              >
                {busy ? "Restoring…" : "Resume access"}
              </button>
            </>
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
                            data: { planCode: u.code as "1-month" | "3-month" },
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
                {confirmingCancel ? (
                  <div className="mt-3 rounded-xl border border-border p-3">
                    <p className="text-sm">
                      You keep everything until{" "}
                      {access.renewsAt ? formatDate(access.renewsAt) : "the end of the period"}.
                      Cancel renewal?
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingCancel(false)}
                        className="rounded-full border border-foreground bg-foreground px-4 py-2 text-sm text-background"
                      >
                        Keep access
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await cancelNow();
                            await queryClient.invalidateQueries({ queryKey: ["access"] });
                            setConfirmingCancel(false);
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-secondary disabled:opacity-60"
                      >
                        {busy ? "Cancelling…" : "Cancel access"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="mt-3 block text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
                  >
                    Cancel access
                  </button>
                )}
              </details>
            </>
          )}
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-lg">Translation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Both are public domain. WEB reads in today's English; KJV keeps the old cadence.
        </p>
        <div className="mt-3 flex gap-2">
          {(["WEB", "KJV"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={async () => {
                await saveTranslation({ data: { translation: t } });
                await queryClient.invalidateQueries();
              }}
              className={`rounded-full border px-4 py-2 text-sm transition-colors duration-150 ${
                plan?.translation === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg">Daily nudge</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One short email a day, once the next day opens. Nothing else.
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
        <Link to="/terms" className="underline underline-offset-4">Terms</Link>
        <Link to="/privacy" className="underline underline-offset-4">Privacy</Link>
        <Link to="/refund" className="underline underline-offset-4">Refunds</Link>
        <Link to="/contact" className="underline underline-offset-4">Contact</Link>
      </nav>
    </main>
  );
}
