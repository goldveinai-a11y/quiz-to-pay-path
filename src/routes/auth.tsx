import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Plainly" },
      { name: "description", content: "Open your 30-day Bible plan with a link sent to your email." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sign in — Plainly" },
      { property: "og:description", content: "Open your 30-day Bible plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const code = url.searchParams.get("code");
      if (hash.get("access_token") && hash.get("refresh_token")) {
        await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });
      } else if (tokenHash) {
        await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
      } else if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        navigate({ to: "/plan", replace: true });
        return;
      }
      setChecking(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const send = async () => {
    setPending(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth` },
    });
    setPending(false);
    if (err) setError("We couldn't find that email. Use the address you paid with.");
    else setSent(true);
  };

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <p className="eyebrow text-muted-foreground">Plainly</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Open your plan</h1>

        {checking ? (
          <p className="mt-6 text-sm text-muted-foreground">Checking your link…</p>
        ) : sent ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-s1">
            <Check className="h-8 w-8 text-success" />
            <p className="mt-3 font-serif text-xl">Check your email</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              We sent a link to <span className="text-foreground">{email}</span>. Opening it signs you
              in — on this device or any other.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No password. Enter the email you paid with and we'll send a link that signs you in.
            </p>
            <div className="mt-6 space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-12 rounded-xl bg-card"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                onClick={send}
                disabled={pending || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="h-12 w-full rounded-xl text-base"
              >
                <Mail className="mr-2 h-4 w-4" />
                {pending ? "Sending…" : "Email me a link"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}