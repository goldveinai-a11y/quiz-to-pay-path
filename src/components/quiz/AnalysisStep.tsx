import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Answers } from "@/lib/quiz/types";

const LINES = [
  "Matching your tradition…",
  "Choosing a starting book…",
  "Setting the pace…",
  "Checking every reference…",
];

export function AnalysisStep({
  answers,
  onAnswer,
  onDone,
}: {
  answers: Answers;
  onAnswer: (id: string, value: string) => void;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [askDepth, setAskDepth] = useState(false);
  const [answeredDepth, setAnsweredDepth] = useState(false);

  const days = (answers["days"] as string) ?? "4-5";
  const lines = [...LINES];
  lines[2] = `Setting the pace to ${days.replace("-", "–")} days a week…`;

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / 7000) * 100);
      setProgress(pct);
      if (elapsed > 3800 && !answeredDepth) setAskDepth(true);
      if (pct >= 100 && (answeredDepth || elapsed > 12000)) {
        window.clearInterval(id);
        onDone();
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [answeredDepth, onDone]);

  const active = Math.min(lines.length - 1, Math.floor((progress / 100) * lines.length));
  const r = 68;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={r} className="fill-none stroke-secondary" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r={r}
            className="fill-none stroke-gold transition-all duration-150"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (progress / 100) * c}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-serif text-4xl font-semibold">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="mt-8 w-full max-w-xs space-y-3 text-left">
        {lines.map((line, i) => (
          <div
            key={line}
            className={`flex items-center gap-3 text-sm transition ${
              i <= active ? "text-foreground" : "text-muted-foreground/50"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${
                i < active ? "border-success bg-success text-white" : "border-border"
              }`}
            >
              {i < active ? <Check className="h-3 w-3" /> : null}
            </span>
            {line}
          </div>
        ))}
      </div>

      {askDepth && !answeredDepth ? (
        <div className="fixed inset-0 z-30 grid place-items-end bg-ink/40 p-4 backdrop-blur-sm sm:place-items-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-left shadow-xl">
            <h2 className="text-xl font-semibold">One last thing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Do you prefer shorter sessions or deeper ones?
            </p>
            <div className="mt-5 space-y-3">
              {[
                { v: "shorter", l: "Shorter — 7 minutes, in and out" },
                { v: "deeper", l: "Deeper — 12 minutes, go further" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => {
                    onAnswer("analysis_depth", o.v);
                    setAnsweredDepth(true);
                    setAskDepth(false);
                  }}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-left text-[15px] font-medium transition hover:border-gold"
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}