import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, ArrowRight, Check, MessageCircleQuestion, Loader2 } from "lucide-react";
import { getSessionDay, saveStep, completeDay } from "@/lib/product/product.functions";
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
  const restored = useRef(false);

  const steps = useMemo(() => {
    const list: SessionStep[] = ["passage", "insight", "context"];
    if (data?.divide) list.push("divide");
    list.push("question", "close");
    return list;
  }, [data?.divide]);

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

  const finish = async () => {
    await finishDay({ data: { day, note: note.trim() ? note.trim() : null } });
    setDone(true);
    await queryClient.invalidateQueries({ queryKey: ["my-plan"] });
    navigate({ to: "/plan" });
  };

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

      <div className="flex-1 py-8">
        {current === "passage" ? <PassageStep data={data} onWord={setOpenWord} /> : null}
        {current === "insight" ? <InsightStep data={data} /> : null}
        {current === "context" ? <ContextStep data={data} /> : null}
        {current === "divide" ? <DivideStep data={data} /> : null}
        {current === "question" ? (
          <QuestionStep data={data} note={note} onNote={setNote} />
        ) : null}
        {current === "close" ? <CloseStep data={data} done={done} /> : null}
        {current === "close" ? null : <AskPanel data={data} />}
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

type SessionStep = "passage" | "insight" | "context" | "divide" | "question" | "close";

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
  return (
    <section>
      <p className="eyebrow text-muted-foreground">
        {data.reference} · {data.translation}
      </p>
      <h1 className="mt-3 font-serif text-2xl font-semibold leading-snug">{data.title}</h1>
      <div className="mt-6 space-y-4">
        {data.verses.map((v) => (
            <p key={v.verse} className="font-serif text-xl leading-relaxed">
              <span className="mr-2 align-super font-mono text-[0.6rem] text-muted-foreground">
                {v.verse}
              </span>
            <VerseText text={v.text} words={words} onWord={onWord} />
            </p>
        ))}
      </div>
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