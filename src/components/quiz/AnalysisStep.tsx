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
    <div className="art-hatch fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(160deg,#39406F,#1A1E3C 62%,#12142A)" }}
    >
      <span
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-70 blur-[3px]"
        style={{ background: "radial-gradient(circle,#EBCB8B,#D9973F 50%,transparent 72%)" }}
      />
      <p className="eyebrow relative z-10 mb-8 text-white/60">Building your plan</p>
      <div className="relative z-10 h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={r} className="fill-none stroke-white/15" strokeWidth="8" />
          <circle
            cx="80"
            cy="80"
            r={r}
            className="fill-none stroke-amber transition-all duration-150"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (progress / 100) * c}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-serif text-[42px] font-semibold text-white">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-9 w-full max-w-xs space-y-3 text-left">
        {lines.map((line, i) => (
          <div
            key={line}
            className={`flex items-center gap-3 text-[13.5px] transition ${
              i <= active ? "text-white" : "text-white/35"
            }`}
          >
            <span
              className={`grid h-[18px] w-[18px] flex-none place-items-center rounded-full border ${
                i < active ? "border-amber bg-amber text-ink" : "border-white/30"
              }`}
            >
              {i < active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
            </span>
            {line}
          </div>
        ))}
      </div>

      {askDepth && !answeredDepth ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/50 p-4 backdrop-blur-sm sm:place-items-center">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 text-left shadow-s3">
            <p className="eyebrow text-terra">One last thing</p>
            <h2 className="mt-2 font-serif text-[22px] font-semibold leading-snug">
              Do you prefer shorter sessions or deeper ones?
            </h2>
            <div className="mt-5 space-y-2.5">
              {[
                { v: "shorter", l: "Shorter", d: "7 minutes, in and out" },
                { v: "deeper", l: "Deeper", d: "12 minutes, go further" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => {
                    onAnswer("analysis_depth", o.v);
                    setAnsweredDepth(true);
                    setAskDepth(false);
                  }}
                  className="w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-left transition hover:border-teal"
                >
                  <span className="block text-[15px] font-semibold">{o.l}</span>
                  <span className="block text-[12.5px] text-muted-foreground">{o.d}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
