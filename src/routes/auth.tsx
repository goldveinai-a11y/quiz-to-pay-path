import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — BibleRoutine" },
      { name: "description", content: "Open your 30-day Bible plan with a link sent to your email." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sign in — BibleRoutine" },
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
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // The address is remembered so coming back is one tap, not a retype.
      const remembered = window.localStorage.getItem("br:email");
      if (remembered) setEmail(remembered);
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
        track("login_success", { method: "link" });
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
    const address = email.trim().toLowerCase();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth` },
    });
    setPending(false);
    if (err) {
      // One generic message used to hide rate limits as "email not found".
      const message = err.message.toLowerCase();
      if (err.status === 429 || message.includes("seconds")) {
        const seconds = Number(message.match(/(\d+)\s*second/)?.[1] ?? 60);
        setCooldown(seconds);
        setError(`Too many requests. Try again in ${seconds} seconds.`);
      } else if (message.includes("signups not allowed") || message.includes("not found")) {
        setError("We couldn't find that email. Use the address you paid with.");
      } else {
        setError(err.message);
      }
      return;
    }
    window.localStorage.setItem("br:email", address);
    track("login_link_request");
    setCooldown(60);
    setSent(true);
  };

  const verify = async (value = code) => {
    setPending(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: value.trim(),
      type: "email",
    });
    setPending(false);
    if (err) {
      const message = err.message.toLowerCase();
      if (message.includes("expired"))
        setError("That code has expired. Send a fresh link and use the newest code.");
      else if (err.status === 429) setError("Too many tries. Wait a minute and try again.");
      else setError("That code didn't work. Use the code from the most recent email.");
      return;
    }
    track("login_success", { method: "code" });
    navigate({ to: "/plan", replace: true });
  };

  // Codes are 6-10 digits depending on the provider setting; never hard-cap at 6.
  const onCode = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    setCode(digits);
  };

  const codeBlock = (
    <div>
      <p className="text-sm text-muted-foreground">
        Type the code from that email — it's 6 to 8 digits.
      </p>
      <Input
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => onCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && code.length >= 6 && !pending) void verify();
        }}
        placeholder="123456"
        className="mt-3 h-12 rounded-xl bg-background text-center font-mono text-lg tracking-[0.3em]"
      />
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <Button
        onClick={() => verify()}
        disabled={pending || code.length < 6}
        className="mt-3 h-12 w-full rounded-xl text-base"
      >
        {pending ? "Checking…" : "Open my plan"}
      </Button>
      <button
        type="button"
        onClick={send}
        disabled={pending || cooldown > 0}
        className="mt-3 w-full text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-60"
      >
        {cooldown > 0 ? `Send a new email in ${cooldown}s` : "Send me a new email"}
      </button>
    </div>
  );

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <p className="eyebrow text-muted-foreground">BibleRoutine</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Open your plan</h1>

        {checking ? (
          <p className="mt-6 text-sm text-muted-foreground">Checking your link…</p>
        ) : sent || codeMode ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-s1">
            {sent ? (
              <>
                <Check className="h-8 w-8 text-success" />
                <p className="mt-3 font-serif text-xl">Check your email</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  We sent a link to <span className="text-foreground">{email}</span>. Opening it
                  signs you in — on this device or any other.
                </p>
              </>
            ) : (
              <>
                <p className="font-serif text-xl">Enter your code</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  For <span className="text-foreground">{email || "your email"}</span>. Only the code
                  from the newest email works.
                </p>
              </>
            )}
            <div className="mt-5 border-t border-border pt-4">{codeBlock}</div>
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
              <button
                type="button"
                onClick={() => setCodeMode(true)}
                className="w-full pt-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                I already have a code
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}