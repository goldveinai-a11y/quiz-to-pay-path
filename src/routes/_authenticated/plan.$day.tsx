import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight, Check, Flame, MessageCircleQuestion, Loader2, Highlighter } from "lucide-react";
import { getSessionDay, saveStep, completeDay, toggleVerseHighlight } from "@/lib/product/product.functions";
import { askAboutPassage } from "@/lib/product/ask.functions";
import { Input } from "@/components/ui/input";
import { Plate } from "@/components/product/Plate";
import { WordSheet } from "@/components/product/WordSheet";
import { ShareCard } from "@/components/product/ShareCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SessionDay, WordNote } from "@/lib/product/types";

export const Route = createFileRoute("/_authenticated/plan/$day")({
  head: () => ({
    meta: [
      { title: "Today's session — BibleRoutine" },
      { name: "description", content: "One passage, one insight, one question. About seven minutes." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Today's session — BibleRoutine" },
      { property: "og:description", content: "One passage, one insight, one question." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <main className="mx-auto grid min-h-screen max-w-[480px] place-items-center px-5 text-center">
      <div>
        <h1 className="font-serif text-2xl">This session isn't open</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </main>
  ),
  component: SessionPage,
});

/** Splits a verse so any word with a lexicon note becomes tappable. */
function VerseText({
  text,
  words,
  onWord,
}: {
  text: string;
  words: Map<string, WordNote>;
  onWord: (note: WordNote) => void;
}) {
  if (words.size === 0) return <>{text}</>;
  const parts = text.split(/([A-Za-z’']+)/);
  return (
    <>
      {parts.map((part, i) => {
        const note = words.get(part.toLowerCase());
        if (!note) return <span key={i}>{part}</span>;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onWord(note)}
            className="underline decoration-terra/60 decoration-2 underline-offset-4 transition-colors duration-150 hover:text-terra"
          >
            {part}
          </button>
        );
      })}
    </>
  );
}

function SessionPage() {
  const { day: dayParam } = Route.useParams();
  const day = Number(dayParam);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchDay = useServerFn(getSessionDay);
  const putStep = useServerFn(saveStep);
  const finishDay = useServerFn(completeDay);

  const { data, isLoading } = useQuery({
    queryKey: ["session-day", day],
    queryFn: () => fetchDay({ data: { day } }),
    enabled: Number.isFinite(day),
  });

  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [openWord, setOpenWord] = useState<WordNote | null>(null);
  const [celebrate, setCelebrate] = useState<{ streak: number; left: number } | null>(null);
  const restored = useRef(false);
  // Kept above the loading early-return so hook order never changes.
  const goRef = useRef<(next: number) => void>(() => {});
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Reading should feel like turning pages: tap the edge, swipe, or use arrows.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /INPUT|TEXTAREA/.test(target.tagName)) return;
      if (e.key === "ArrowLeft") goRef.current(-1);
      if (e.key === "ArrowRight") goRef.current(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const steps = useMemo(() => {
    const list: SessionStep[] = ["passage", "insight", "context"];
    if (data?.divide) list.push("divide");
    if (data?.voices?.length) list.push("voices");
    if (data?.application) list.push("apply");
    list.push("question");
    if (data?.quiz) list.push("quiz");
    list.push("close");
    return list;
  }, [data?.divide, data?.quiz, data?.voices, data?.application]);

  useEffect(() => {
    if (!data || restored.current) return;
    restored.current = true;
    setNote(data.note ?? "");
    setDone(data.done);
    const saved = Math.min(Math.max(data.step, 1), steps.length);
    setIndex(saved - 1);
  }, [data, steps.length]);

  if (isLoading || !data) {
    return (
      <main className="mx-auto max-w-[480px] px-5 py-10">
        <div className="h-72 animate-pulse rounded-3xl bg-secondary" />
      </main>
    );
  }

  const current = steps[index]!;

  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), steps.length - 1);
    setIndex(clamped);
    void putStep({ data: { day, step: clamped + 1 } });
  };

  const close = () => navigate({ to: "/plan" });
  goRef.current = (delta: number) => go(index + delta);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]!;
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0]!;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    go(dx > 0 ? index - 1 : index + 1);
  };

  // Tapping the outer fifth of the page turns it; interactive elements keep their own clicks.
  const onAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, label, [role='button']")) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    if (x < box.width * 0.22) go(index - 1);
    else if (x > box.width * 0.78) go(index + 1);
  };

  const finish = async () => {
    const result = await finishDay({ data: { day, note: note.trim() ? note.trim() : null } });
    setDone(true);
    await queryClient.invalidateQueries({ queryKey: ["my-plan"] });
    const streak = result?.streak?.current ?? 0;
    setCelebrate({ streak, left: Math.max(0, 30 - day) });
  };

  if (celebrate) {
    return (
      <DayFinished
        day={day}
        streak={celebrate.streak}
        left={celebrate.left}
        data={data}
        onHome={() => navigate({ to: "/plan" })}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col px-5 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Close session"
          onClick={close}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Previous screen"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-secondary disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-150",
                i <= index ? "bg-terra" : "bg-secondary",
              )}
            />
          ))}
        </div>
        <span className="eyebrow shrink-0 text-muted-foreground">
          {index + 1}/{steps.length}
        </span>
      </header>

      <div
        className="relative flex-1 py-8"
        onClick={onAreaClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div>
          {current === "passage" ? <PassageStep data={data} onWord={setOpenWord} /> : null}
          {current === "insight" ? <InsightStep data={data} /> : null}
          {current === "context" ? <ContextStep data={data} /> : null}
          {current === "divide" ? <DivideStep data={data} /> : null}
          {current === "voices" ? <VoicesStep data={data} /> : null}
          {current === "apply" ? <ApplyStep data={data} /> : null}
          {current === "question" ? (
            <QuestionStep data={data} note={note} onNote={setNote} />
          ) : null}
          {current === "quiz" ? <QuizStep data={data} /> : null}
          {current === "close" ? <CloseStep data={data} done={done} /> : null}
          {current === "close" ? null : <AskPanel data={data} />}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background pb-2 pt-3">
        {current === "close" ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="eyebrow px-2 py-3 text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Back
            </button>
            <Button
              onClick={finish}
              className="h-13 flex-1 rounded-xl bg-ink py-4 text-base font-semibold text-background hover:bg-ink/90"
            >
              {done ? "Back to my plan" : "Mark today done"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="eyebrow px-2 py-3 text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                Back
              </button>
            ) : null}
            <Button
              onClick={() => go(index + 1)}
              className="h-13 flex-1 rounded-xl bg-ink py-4 text-base font-semibold text-background hover:bg-ink/90"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <WordSheet note={openWord} onClose={() => setOpenWord(null)} />
    </main>
  );
}

type SessionStep =
  | "passage"
  | "insight"
  | "context"
  | "divide"
  | "voices"
  | "apply"
  | "question"
  | "quiz"
  | "close";

/** Commentary in the reader's own tradition — or all of them, if they asked. */
function VoicesStep({ data }: { data: SessionDay }) {
  if (!data.voices.length) return null;
  const single = data.voices.length === 1;
  return (
    <section>
      <p className="eyebrow text-muted-foreground">
        {single ? `Read in your tradition` : "How the traditions read it"}
      </p>
      <div className="mt-5 space-y-4">
        {data.voices.map((v) => (
          <div key={v.tradition} className="rounded-2xl border border-border bg-card p-5">
            <p className="eyebrow text-terra">{v.tradition}</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed">{v.reading}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The bridge from the passage to this week — the promise of a 7-minute session. */
function ApplyStep({ data }: { data: SessionDay }) {
  if (!data.application) return null;
  return (
    <section>
      <p className="eyebrow text-muted-foreground">What it means today</p>
      <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug">
        {data.application.prompt}
      </h2>
      <p className="mt-4 text-[0.95rem] leading-relaxed">{data.application.body}</p>
    </section>
  );
}

/** One question, no score, no punishment — just a moment of active recall. */
function QuizStep({ data }: { data: SessionDay }) {
  const quiz = data.quiz;
  const [picked, setPicked] = useState<number | null>(null);
  if (!quiz) return null;
  return (
    <section>
      <p className="eyebrow text-muted-foreground">Did it land?</p>
      <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug">{quiz.question}</h2>
      <div className="mt-6 space-y-2.5">
        {quiz.options.map((option, i) => {
          const chosen = picked === i;
          const correct = i === quiz.correctIndex;
          const reveal = picked !== null;
          return (
            <button
              key={option}
              type="button"
              disabled={reveal}
              onClick={() => setPicked(i)}
              className={cn(
                "w-full rounded-2xl border px-4 py-3.5 text-left text-[0.95rem] leading-relaxed transition-colors duration-200",
                reveal && correct
                  ? "border-success/50 bg-success/10"
                  : reveal && chosen
                    ? "border-border bg-secondary/60 text-muted-foreground"
                    : "border-border bg-card hover:bg-secondary/60",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <p className="mt-5 animate-fade-in rounded-2xl border border-border bg-card p-4 text-[0.95rem] leading-relaxed">
          {picked === quiz.correctIndex ? "That's it. " : "Not quite. "}
          {quiz.explanation}
        </p>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Nothing is scored. Pick the one that fits what you just read.
        </p>
      )}
    </section>
  );
}

/** The one moment of quiet reward: the day closes and the streak rolls over. */
function DayFinished({
  day,
  streak,
  left,
  data,
  onHome,
}: {
  day: number;
  streak: number;
  left: number;
  data: SessionDay;
  onHome: () => void;
}) {
  const verse = data.verses[0];
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center px-5 py-10">
      <div className="animate-fade-in">
        <p className="eyebrow text-muted-foreground">Day {day} closed</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">{data.title}</h1>
        {streak > 0 ? (
          <p className="mt-6 flex items-baseline gap-2 text-terra">
            <Flame className="h-6 w-6 shrink-0 self-center" />
            <span key={streak} className="animate-scale-in font-serif text-5xl font-semibold">
              {streak}
            </span>
            <span className="eyebrow">day{streak === 1 ? "" : "s"} in a row</span>
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted-foreground">
          {left > 0 ? `${left} day${left === 1 ? "" : "s"} left in ${data.bookTitle}.` : `That was the last day of ${data.bookTitle}.`}
        </p>
        {verse ? (
          <div className="mt-8">
            <ShareCard text={verse.text} reference={data.reference} translation={data.translation} />
          </div>
        ) : null}
        <Button
          onClick={onHome}
          className="mt-8 h-13 w-full rounded-xl bg-ink py-4 text-base font-semibold text-background hover:bg-ink/90"
        >
          Back to today
        </Button>
      </div>
    </main>
  );
}

/** Ask anything about the passage — the promise the funnel makes. */
function AskPanel({ data }: { data: SessionDay }) {
  const ask = useServerFn(askAboutPassage);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const send = async () => {
    setPending(true);
    setError(null);
    setAnswer(null);
    try {
      const result = await ask({
        data: {
          day: data.day,
          question,
          reference: data.reference,
          passage: data.verses.map((v) => `${v.verse}. ${v.text}`).join(" "),
          context: data.context,
        },
      });
      if ("error" in result) setError(result.error);
      else {
        setAnswer(result.answer);
        setQuestion("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't answer that just now.");
    }
    setPending(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <MessageCircleQuestion className="h-4 w-4" />
        Ask anything about this passage
      </button>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-4">
      <p className="eyebrow text-muted-foreground">Ask about {data.reference}</p>
      <div className="mt-3 flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && question.trim().length > 2 && !pending) void send();
          }}
          placeholder="Who is he talking to here?"
          className="h-11 rounded-xl bg-background"
        />
        <Button
          onClick={send}
          disabled={pending || question.trim().length < 3}
          className="h-11 rounded-xl px-4"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        No question is too basic. Answers stay with this passage.
      </p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {answer ? (
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{answer}</p>
      ) : null}
    </section>
  );
}

function PassageStep({ data, onWord }: { data: SessionDay; onWord: (w: WordNote) => void }) {
  const words = new Map(data.words.map((w) => [w.word.toLowerCase(), w]));
  const toggle = useServerFn(toggleVerseHighlight);
  const [kept, setKept] = useState<number[]>(data.highlights);
  const flip = (verse: number) => {
    setKept((prev) => (prev.includes(verse) ? prev.filter((v) => v !== verse) : [...prev, verse]));
    void toggle({ data: { day: data.day, verse } });
  };
  return (
    <section>
      <p className="eyebrow text-muted-foreground">
        {data.reference} · {data.translation}
      </p>
      <p className="eyebrow mt-1 text-muted-foreground">About {data.minutes} minutes</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold leading-snug">{data.title}</h1>
      <div className="mt-6 space-y-4">
        {data.verses.map((v) => (
            <p
              key={v.verse}
              onDoubleClick={() => flip(v.verse)}
              className={cn(
                "rounded-lg font-serif text-xl leading-relaxed transition-colors duration-200",
                kept.includes(v.verse) && "bg-terra/15 px-2 py-1",
              )}
            >
              <span className="mr-2 align-super font-mono text-[0.6rem] text-muted-foreground">
                {v.verse}
              </span>
            <VerseText text={v.text} words={words} onWord={onWord} />
            <button
              type="button"
              aria-label={kept.includes(v.verse) ? `Remove highlight on verse ${v.verse}` : `Highlight verse ${v.verse}`}
              onClick={() => flip(v.verse)}
              className={cn(
                "ml-2 align-middle text-muted-foreground transition-colors duration-150 hover:text-terra",
                kept.includes(v.verse) && "text-terra",
              )}
            >
              <Highlighter className="inline h-4 w-4" />
            </button>
            </p>
        ))}
      </div>
      <p className="eyebrow mt-6 text-muted-foreground">
        Tap the marker to keep a verse — it lands in your notes
      </p>
      {words.size > 0 ? (
        <p className="eyebrow mt-6 text-muted-foreground">
          Tap an underlined word for the {data.words[0]?.language ?? "original"} behind it
        </p>
      ) : null}
    </section>
  );
}

function InsightStep({ data }: { data: SessionDay }) {
  const initials = data.insight.author
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-s2">
      <Plate day={data.day} tone={data.tone} className="h-32" />
      <div className="p-5">
        <p className="eyebrow text-muted-foreground">One thing that changes it</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold leading-snug">
          {data.insight.title}
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed">{data.insight.body}</p>
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs">
            {initials}
          </span>
          <p className="eyebrow text-muted-foreground">
            Condensed from {data.insight.author}, {data.insight.year} · public domain
          </p>
        </div>
      </div>
    </section>
  );
}

function ContextStep({ data }: { data: SessionDay }) {
  return (
    <section>
      <p className="eyebrow text-muted-foreground">What it meant then</p>
      <div className="mt-4 space-y-4">
        {data.context.split(/\n{2,}/).map((p, i) => (
          <p key={i} className="text-[0.95rem] leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      {data.crossReference ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="eyebrow text-muted-foreground">See also · {data.crossReference.reference}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed">{data.crossReference.note}</p>
        </div>
      ) : null}
    </section>
  );
}

function DivideStep({ data }: { data: SessionDay }) {
  if (!data.divide) return null;
  return (
    <section className="rounded-3xl border border-indigo/25 bg-indigo/5 p-5">
      <p className="eyebrow text-indigo">Where traditions differ</p>
      <h2 className="mt-2 font-serif text-xl font-semibold leading-snug">
        {data.divide.question}
      </h2>
      <div className="mt-5 space-y-4">
        {data.divide.readings.map((r) => (
          <div key={r.tradition}>
            <p className="eyebrow text-muted-foreground">{r.tradition}</p>
            <p className="mt-1 text-[0.95rem] leading-relaxed">{r.reading}</p>
            {r.verses ? <p className="eyebrow mt-1 text-muted-foreground">{r.verses}</p> : null}
          </div>
        ))}
      </div>
      {data.divide.common ? (
        <p className="mt-5 border-t border-indigo/20 pt-4 text-sm leading-relaxed text-muted-foreground">
          {data.divide.common}
        </p>
      ) : null}
    </section>
  );
}

function QuestionStep({
  data,
  note,
  onNote,
}: {
  data: SessionDay;
  note: string;
  onNote: (v: string) => void;
}) {
  return (
    <section className="flex min-h-[50vh] flex-col justify-center text-center">
      <p className="eyebrow text-muted-foreground">One question</p>
      <h2 className="mt-6 font-serif text-2xl leading-snug">{data.question}</h2>
      <Textarea
        value={note}
        onChange={(e) => onNote(e.target.value)}
        placeholder="Write something, or don't."
        className="mt-8 min-h-28 rounded-2xl bg-card text-left"
      />
    </section>
  );
}

function CloseStep({ data, done }: { data: SessionDay; done: boolean }) {
  const verse = data.verses[0];
  return (
    <section>
      <p className="eyebrow text-muted-foreground">Take it with you</p>
      <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug">{data.title}</h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
        {done ? "Day " + data.day + " is finished." : "That's the whole of day " + data.day + "."}
      </p>
      {verse ? (
        <div className="mt-6">
          <ShareCard text={verse.text} reference={data.reference} translation={data.translation} />
        </div>
      ) : null}
      {data.next ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="eyebrow text-muted-foreground">Tomorrow · day {data.next.day}</p>
          <p className="mt-1.5 font-serif text-lg leading-snug">{data.next.title}</p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="font-serif text-lg">That's the last day of {data.bookTitle}.</p>
        </div>
      )}
    </section>
  );
}