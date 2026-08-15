import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, Star, Lock, BookOpen, Languages, MessageCircleQuestion, Flame } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BeforeAfter } from "@/components/paywall/BeforeAfter";
import { GrowthChart } from "@/components/paywall/GrowthChart";
import { PhoneMock } from "@/components/paywall/PhoneMock";
import { ART } from "@/lib/quiz/art";
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
  { id: "1-week", label: "1-week trial", per: "1.00", price: 6.99, old: 14.99 },
  { id: "1-month", label: "1-month access", per: "0.50", price: 14.99, old: 29.99, best: true },
  { id: "3-month", label: "3-month access", per: "0.33", price: 29.99, old: 69.99 },
];

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <>
      <p className="eyebrow text-terra">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-[25px] font-semibold leading-[1.2] tracking-tight text-ink">
        {children}
      </h2>
    </>
  );
}

function ResultPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [selected, setSelected] = useState("1-month");

  useEffect(() => {
    setPlan(buildPlan(loadAnswers()));
  }, []);

  const selectedPlan = useMemo(() => PLANS.find((p) => p.id === selected)!, [selected]);

  if (!plan) return <div className="min-h-screen bg-background" />;

  const go = () => navigate({ to: "/checkout", search: { plan: selected } });

  return (
    <main className="paper-grain min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-30 bg-ink px-4 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-background">
        Code <span className="text-amber">SUMMER_2026</span> applied
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[268px] w-full overflow-hidden rounded-b-[28px]">
          <img
            src={ART["hero"]!}
            alt="Engraved sunrise over hills"
            className="h-full w-full object-cover"
          />
          <span
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,rgba(18,20,42,0.10) 0%,rgba(18,20,42,0.30) 38%,rgba(18,20,42,0.78) 70%,rgba(18,20,42,0.93) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-6 mx-auto max-w-md px-5 text-center">
            <p className="eyebrow text-white/75">{plan.name ? `${plan.name}'s plan` : "Your plan"}</p>
            <h1 className="mt-2 font-serif text-[32px] font-semibold leading-[1.12] tracking-tight text-white">
              Your 30-day plan is ready
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-md px-4">
        <p className="mt-5 text-center text-[14px] leading-relaxed text-ink2">
          {plan.sessions} sessions a week · {plan.minutes} minutes · in the {plan.timeOfDay}
        </p>

        {/* Plan card */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-card shadow-s2">
          <div className="flex items-stretch gap-4 border-b border-border p-5">
            <div className="flex-1">
              <p className="eyebrow text-faint">Starting book</p>
              <p className="mt-1 font-serif text-[28px] font-semibold leading-none text-ink">
                {plan.book}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink2">{plan.bookWhy}</p>
            </div>
            <div className="w-[86px] flex-none overflow-hidden rounded-2xl">
              <img src={ART["understand"]!} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <dl className="divide-y divide-border">
            {[
              ["Translation", plan.translation],
              ["Voices you'll hear", plan.voices],
              ["Pace", `${plan.daysPerWeek} days · ${plan.minutes} min`],
              [
                "Where traditions differ",
                plan.showBothSides ? "Both sides shown" : "Your tradition only",
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-5 px-5 py-3.5">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-faint">{k}</dt>
                <dd className="text-right text-[14px] font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Chart */}
        <section className="mt-4 rounded-3xl bg-card p-5 shadow-s1">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow text-faint">Understanding</p>
              <p className="mt-1 font-serif text-[20px] font-semibold text-ink">
                {plan.understandingNow} → {plan.understandingAfter} out of 10
              </p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink2">
              30 days
            </span>
          </div>
          <div className="mt-3">
            <GrowthChart now={plan.understandingNow} after={plan.understandingAfter} />
          </div>
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-faint">
            <span>Today</span>
            <span>Day 30</span>
          </div>
          <p className="mt-3 border-t border-border pt-3 text-[12px] leading-relaxed text-muted-foreground">
            Projection based on readers with your pace who finished their first 30 days.
          </p>
        </section>

        {plan.themes.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {plan.themes.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink2"
              >
                {THEME_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        ) : null}

        {/* Plans */}
        <section className="pt-11">
          <SectionTitle eyebrow="Step two">Choose your access</SectionTitle>
          <div className="mt-5 space-y-3">
            {PLANS.map((p) => {
              const on = selected === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`relative flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition ${
                    on ? "border-teal shadow-s2" : "border-border"
                  }`}
                >
                  {p.best ? (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-terra px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  ) : null}
                  <span
                    className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 ${
                      on ? "border-teal bg-teal text-background" : "border-border"
                    }`}
                  >
                    {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{p.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                      <span className="line-through">${p.old.toFixed(2)}</span>{" "}
                      <span className="font-semibold text-terra">${p.price.toFixed(2)}</span>
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-serif text-[22px] font-semibold leading-none text-ink">
                      ${p.per}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-faint">
                      per day
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={go}
            className="mt-5 h-[54px] w-full rounded-2xl bg-ink text-[15px] font-medium text-background shadow-s2 transition hover:bg-ink/90"
          >
            Start my plan
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-faint">
            <Lock className="h-3 w-3" /> Cancel any time · no hidden charges
          </p>
        </section>

        {/* Inside */}
        <section className="pt-12">
          <SectionTitle eyebrow="What's inside">Everything you need, nothing you don't</SectionTitle>
          <ul className="mt-5 divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-s1">
            {[
              `Your 30-day plan through ${plan.book}, one ${plan.minutes}-minute session at a time`,
              "Plain-English context before every passage — who's speaking, and why it matters",
              "Tap any word for the original Greek or Hebrew. Free, forever.",
              "Ask any question, however basic. No one is watching.",
              plan.showBothSides
                ? "See how Catholic, Orthodox and Protestant readings differ, side by side"
                : "Commentary from your own tradition only",
              "Notes, highlights and a streak that survives a missed day",
            ].map((f) => (
              <li key={f} className="flex gap-3 px-5 py-3.5 text-[14px] leading-relaxed text-ink2">
                <span className="mt-[3px] grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-teal text-background">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Before / after */}
        <section className="pt-12">
          <SectionTitle eyebrow="Before / after">
            No more reading words you don't understand
          </SectionTitle>
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
          <SectionTitle eyebrow="The app">Your Bible, finally readable</SectionTitle>
          <div className="mt-6 flex items-end justify-center gap-3">
            <PhoneMock className="h-[228px] w-[132px] translate-y-3">
              <div className="flex h-full flex-col">
                <img src={ART["habit"]!} alt="" className="h-[86px] w-full object-cover" />
                <div className="flex-1 p-2.5">
                  <p className="font-mono text-[7px] uppercase tracking-wider text-faint">Day 4</p>
                  <p className="font-serif text-[13px] font-semibold leading-tight">
                    {plan.book} 1:1–11
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[100, 82, 92, 60].map((w, i) => (
                      <span
                        key={i}
                        className="block h-[4px] rounded-full bg-secondary"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  <span className="mt-3 block h-[22px] rounded-lg bg-ink" />
                </div>
              </div>
            </PhoneMock>
            <PhoneMock className="h-[262px] w-[148px]">
              <div className="flex h-full flex-col bg-parchment">
                <div className="p-3 pt-5">
                  <p className="font-serif text-[12px] leading-[1.55]">
                    For God so <span className="border-b-2 border-terra/50">loved</span> the world…
                  </p>
                </div>
                <div className="mt-auto rounded-t-2xl bg-card p-3 shadow-s2">
                  <span className="mx-auto mb-2 block h-[3px] w-6 rounded-full bg-border" />
                  <p className="font-serif text-[17px] font-semibold leading-none">ἠγάπησεν</p>
                  <p className="mt-1 font-mono text-[7.5px] text-terra">agapaō · G25</p>
                  <div className="mt-2 space-y-1.5">
                    {[100, 90, 70].map((w, i) => (
                      <span
                        key={i}
                        className="block h-[4px] rounded-full bg-secondary"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PhoneMock>
            <PhoneMock className="h-[228px] w-[132px] translate-y-3">
              <div className="flex h-full flex-col p-2.5 pt-5">
                <p className="font-mono text-[7px] uppercase tracking-wider text-faint">Streak</p>
                <p className="font-serif text-[26px] font-semibold leading-none">12</p>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className={`aspect-square rounded-[3px] ${
                        i < 12 ? "bg-teal" : i === 12 ? "bg-amber" : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </PhoneMock>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {[
              { t: "Daily reading", d: `${plan.minutes} minutes, guided`, I: BookOpen },
              { t: "Word study", d: "Greek & Hebrew, one tap", I: Languages },
              { t: "Ask anything", d: "No question too basic", I: MessageCircleQuestion },
              { t: "Streak & notes", d: "Progress that survives a slip", I: Flame },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl bg-card p-4 shadow-s1">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-teal">
                  <c.I className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-2.5 text-[14px] font-semibold text-ink">{c.t}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="pt-12">
          <SectionTitle eyebrow="Readers">People who were stuck too</SectionTitle>
          <div className="mt-5 space-y-3">
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
              <figure key={r.n} className="rounded-2xl bg-card p-5 shadow-s1">
                <div className="flex gap-0.5 text-amber">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-2.5 font-serif text-[16px] leading-relaxed text-ink">
                  “{r.t}”
                </blockquote>
                <figcaption className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-faint">
                  {r.n}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Guarantee */}
        <section className="pt-12">
          <div className="overflow-hidden rounded-3xl bg-card shadow-s2">
            <div
              className="art-hatch relative h-[104px]"
              style={{ background: "linear-gradient(150deg,#2B6A61,#123C36 62%,#0C2A26)" }}
            >
              <span className="absolute inset-0 grid place-items-center">
                <ShieldCheck className="h-10 w-10 text-amber" />
              </span>
            </div>
            <div className="p-6 text-center">
              <h2 className="font-serif text-[23px] font-semibold leading-tight text-ink">
                100% money-back guarantee
              </h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink2">
                Follow your plan for 30 days. If you don't understand the Bible better than the day
                you started, write to us and we'll refund every cent. No forms, no argument — we
                just ask that you actually showed up.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-12">
          <SectionTitle eyebrow="FAQ">Questions people ask</SectionTitle>
          <Accordion type="single" collapsible className="mt-3">
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
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="text-left text-[14.5px] font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13.5px] leading-relaxed text-ink2">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <p className="pt-10 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to be charged ${selectedPlan.price.toFixed(2)} today and to the
          renewal terms of your plan. Cancel any time before renewal.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 px-4 pb-6 pt-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={go}
            className="h-[54px] w-full rounded-2xl bg-ink text-[15px] font-medium text-background shadow-s2 transition hover:bg-ink/90"
          >
            Start my plan · ${selectedPlan.price.toFixed(2)}
          </button>
        </div>
      </div>
    </main>
  );
}
