import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, Star, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BeforeAfter } from "@/components/paywall/BeforeAfter";
import { loadAnswers } from "@/lib/quiz/store";
import { buildPlan, THEME_LABELS, type PlanResult } from "@/lib/quiz/plan";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Your 30-Day Bible Plan is ready" },
      {
        name: "description",
        content:
          "Your personal 30-day Bible reading plan: a starting book, a translation matched to your tradition and 7-minute daily sessions.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your 30-Day Bible Plan is ready" },
      {
        property: "og:description",
        content: "A plan built around your tradition, your pace and your questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultPage,
});

const PLANS = [
  { id: "1-week", label: "1-WEEK TRIAL", per: "€0.14 per day", price: 1, old: 6.99 },
  { id: "1-month", label: "1-MONTH ACCESS", per: "€0.16 per day", price: 4.99, old: 14.99, best: true },
  { id: "3-month", label: "3-MONTH ACCESS", per: "€0.11 per day", price: 9.99, old: 29.99 },
];

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function ResultPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [selected, setSelected] = useState("1-month");
  const timer = useCountdown(10 * 60);

  useEffect(() => {
    setPlan(buildPlan(loadAnswers()));
  }, []);

  const selectedPlan = useMemo(() => PLANS.find((p) => p.id === selected)!, [selected]);

  if (!plan) return <div className="min-h-screen bg-background" />;

  const go = () => navigate({ to: "/checkout", search: { plan: selected } });

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="bg-ink px-4 py-2 text-center text-[13px] font-semibold text-background">
        Discount <span className="text-gold">SUMMER_2026</span> applied · reserved for {timer}
      </div>

      <div className="mx-auto max-w-md px-4">
        {/* Report */}
        <section className="pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {plan.name}'s plan
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight">
            Your 30-Day Bible Plan is ready
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Built from your answers — {plan.sessions} sessions a week, {plan.minutes} minutes each,
            in the {plan.timeOfDay}.
          </p>

          <div className="mt-6 rounded-3xl border border-border bg-card p-5">
            <Row label="Starting book" value={plan.book} />
            <p className="-mt-2 mb-3 text-sm text-muted-foreground">{plan.bookWhy}</p>
            <Row label="Translation" value={plan.translation} />
            <Row label="Voices you'll hear" value={plan.voices} />
            <Row label="Pace" value={`${plan.daysPerWeek} days a week · ${plan.minutes} min`} />
            <Row
              label="Both sides shown"
              value={plan.showBothSides ? "Yes, where traditions differ" : "Your tradition only"}
            />
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Your understanding</p>
            <div className="mt-4 flex items-end gap-4">
              <Bar value={plan.understandingNow} label="Today" tone="muted" />
              <div className="mb-8 flex-1 border-t border-dashed border-gold" />
              <Bar value={plan.understandingAfter} label="Day 30" tone="gold" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Projection based on people with your pace who finished the first 30 days.
            </p>
          </div>

          {plan.themes.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.themes.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-gold/50 bg-accent px-3 py-1 text-xs font-medium"
                >
                  {THEME_LABELS[t] ?? t}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {/* Plans */}
        <section className="pt-10">
          <h2 className="text-[22px] font-semibold">Choose your access</h2>
          <div className="mt-4 space-y-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                  selected === p.id ? "border-gold bg-accent" : "border-border bg-card"
                }`}
              >
                {p.best ? (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-foreground">
                    Most popular
                  </span>
                ) : null}
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                    selected === p.id ? "border-gold bg-gold" : "border-border"
                  }`}
                >
                  {selected === p.id ? <Check className="h-3 w-3 text-gold-foreground" /> : null}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold tracking-wide">{p.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    <span className="line-through">€{p.old.toFixed(2)}</span> €{p.price.toFixed(2)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-serif text-xl font-semibold">{p.per.split(" ")[0]}</span>
                  <span className="block text-[11px] text-muted-foreground">per day</span>
                </span>
              </button>
            ))}
          </div>
          <Button size="lg" onClick={go} className="mt-5 h-14 w-full rounded-full text-base font-semibold">
            Start my plan
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Cancel any time. No hidden charges.
          </p>
        </section>

        {/* Inside */}
        <section className="pt-12">
          <h2 className="text-[22px] font-semibold">What's inside</h2>
          <ul className="mt-4 space-y-3">
            {[
              `Your 30-day plan through ${plan.book}, one ${plan.minutes}-minute session at a time`,
              "Plain-English explanation before every passage — context, who's speaking, why it matters",
              "Tap any word for the original Greek or Hebrew, free forever",
              "Ask any question, however basic. No one is watching.",
              plan.showBothSides
                ? "See how Catholic, Orthodox and Protestant readings differ, side by side"
                : "Commentary from your own tradition only",
              "Notes, highlights and streaks that survive a missed day",
            ].map((f) => (
              <li key={f} className="flex gap-3 text-[15px] leading-relaxed">
                <Check className="mt-1 h-4 w-4 shrink-0 text-success" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Before / after */}
        <section className="pt-12">
          <h2 className="text-[22px] font-semibold leading-tight">
            No more reading words you don't understand
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Drag to compare.</p>
          <div className="mt-5 space-y-4">
            <BeforeAfter
              reference="Romans 3:25"
              before="…whom God put forward as a propitiation by his blood, to be received by faith."
              after="Propitiation = the sacrifice that turns anger into peace. Paul borrows the image from the temple: the debt is paid, and not by you."
            />
            <BeforeAfter
              reference="Psalm 23:5"
              before="You prepare a table before me in the presence of my enemies."
              after="A shepherd's table set in the open, in full view of what's hunting you. The point isn't safety from trouble — it's rest inside it."
            />
            <BeforeAfter
              reference="John 1:1"
              before="In the beginning was the Word, and the Word was with God…"
              after="'Word' is logos — the reason and order behind everything. John is claiming the logic of the universe has a face."
            />
          </div>
        </section>

        {/* Product */}
        <section className="pt-12">
          <h2 className="text-[22px] font-semibold">Your Bible, finally readable</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { t: "Today's session", d: `${plan.minutes} min · ${plan.book} 1`, e: "📖" },
              { t: "Word study", d: "Greek & Hebrew, tap any word", e: "🔤" },
              { t: "Ask anything", d: "No question too basic", e: "💬" },
              { t: "Streak & notes", d: "Progress that survives a slip", e: "🔥" },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-border bg-card p-4">
                <span className="text-2xl">{c.e}</span>
                <p className="mt-2 text-sm font-semibold">{c.t}</p>
                <p className="text-xs text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="pt-12">
          <h2 className="text-[22px] font-semibold">People who were stuck too</h2>
          <div className="mt-4 space-y-3">
            {[
              {
                n: "Marta, 34",
                t: "I'd started Genesis four times and quit at Leviticus. This is the first plan I've finished.",
              },
              {
                n: "Daniel, 47",
                t: "I never asked questions at church because I felt stupid. Here I ask ten a week.",
              },
              {
                n: "Grace, 26",
                t: "Seven minutes before bed. Thirty days later I actually know what Paul is arguing.",
              },
            ].map((r) => (
              <div key={r.n} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-[15px] leading-relaxed">{r.t}</p>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">{r.n}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantee */}
        <section className="pt-12">
          <div className="rounded-3xl border-2 border-gold/50 bg-parchment p-6 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-3 text-[22px] font-semibold">100% money-back guarantee</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Follow your plan for 30 days. If you don't understand the Bible better than the day
              you started, write to us and we'll refund every cent. No forms, no argument — we just
              ask that you actually showed up.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-12">
          <h2 className="text-[22px] font-semibold">Questions</h2>
          <Accordion type="single" collapsible className="mt-2">
            {[
              {
                q: "Is this a church or a denomination?",
                a: "No. We match your tradition's translation and commentators, and we tell you plainly where traditions disagree.",
              },
              {
                q: "What if I miss a day?",
                a: "The plan re-paces itself. Missing days is expected — quitting is what we're built to prevent.",
              },
              {
                q: "How do I cancel?",
                a: "One tap in settings, any time. Your trial converts only if you keep it.",
              },
              {
                q: "Do I need to know anything to start?",
                a: "No. The first session assumes you've never opened a Bible.",
              },
            ].map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-[15px]">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <p className="pt-10 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to be charged €{selectedPlan.price.toFixed(2)} today and to the
          renewal terms of your plan. Cancel any time before renewal.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 pb-6 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Clock className="h-3.5 w-3.5" /> {timer}
          </div>
          <Button onClick={go} size="lg" className="h-14 w-full rounded-full text-base font-semibold">
            Start my plan · €{selectedPlan.price.toFixed(2)}
          </Button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-[15px] font-semibold">{value}</span>
    </div>
  );
}

function Bar({ value, label, tone }: { value: number; label: string; tone: "muted" | "gold" }) {
  return (
    <div className="flex w-16 flex-col items-center">
      <span className="mb-1 text-sm font-semibold">{value}/10</span>
      <div className="flex h-24 w-10 items-end rounded-xl bg-secondary">
        <div
          className={`w-full rounded-xl ${tone === "gold" ? "bg-gold" : "bg-muted-foreground/40"}`}
          style={{ height: `${value * 10}%` }}
        />
      </div>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}