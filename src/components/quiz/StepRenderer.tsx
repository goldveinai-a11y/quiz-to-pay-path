import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import type { Answers, Step } from "@/lib/quiz/types";
import { AnalysisStep } from "./AnalysisStep";

type Props = {
  step: Step;
  answers: Answers;
  onAnswer: (id: string, value: string | string[] | number) => void;
  onNext: () => void;
};

function OptionButton({
  label,
  emoji,
  selected,
  onClick,
  multi,
}: {
  label: string;
  emoji?: string | undefined;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition active:scale-[0.99] ${
        selected
          ? "border-gold bg-accent text-accent-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:border-gold/60"
      }`}
    >
      {emoji ? <span className="text-xl">{emoji}</span> : null}
      <span className="flex-1">{label}</span>
      {multi ? (
        <span
          className={`grid h-5 w-5 place-items-center rounded-md border ${
            selected ? "border-gold bg-gold text-gold-foreground" : "border-border"
          }`}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : null}
        </span>
      ) : null}
    </button>
  );
}

export function StepRenderer({ step, answers, onAnswer, onNext }: Props) {
  const value = answers[step.id];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [slider, setSlider] = useState<number>(typeof value === "number" ? value : 4);

  useEffect(() => {
    setName(typeof answers["name"] === "string" ? (answers["name"] as string) : "");
    setEmail(typeof answers["email"] === "string" ? (answers["email"] as string) : "");
  }, [answers, step.id]);

  const selectSingle = (v: string) => {
    onAnswer(step.id, v);
    setTimeout(onNext, 160);
  };

  const toggleMulti = (v: string) => {
    const list = Array.isArray(value) ? [...(value as string[])] : [];
    const idx = list.indexOf(v);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(v);
    onAnswer(step.id, list);
  };

  const heading = (
    <div className="mb-6">
      <h1 className="text-[26px] font-semibold leading-tight text-foreground">{step.title}</h1>
      {step.subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.subtitle}</p>
      ) : null}
    </div>
  );

  if (step.kind === "single" || step.kind === "statement") {
    return (
      <div className="animate-quiz-in">
        {step.kind === "statement" ? (
          <div className="mb-6 rounded-2xl border border-gold/40 bg-parchment p-5">
            <h1 className="font-serif text-[22px] leading-snug text-foreground">{step.title}</h1>
          </div>
        ) : (
          heading
        )}
        <div className="space-y-3">
          {step.options?.map((o) => (
            <OptionButton
              key={o.value}
              label={o.label}
              emoji={o.emoji}
              selected={value === o.value}
              onClick={() => selectSingle(o.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step.kind === "multi" || step.kind === "cards") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    const isCards = step.kind === "cards";
    const single = step.id === "trigger";
    return (
      <div className="animate-quiz-in pb-24">
        {heading}
        <div className={isCards && !single ? "grid grid-cols-2 gap-3" : "space-y-3"}>
          {step.options?.map((o) =>
            isCards && !single ? (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleMulti(o.value)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                  list.includes(o.value)
                    ? "border-gold bg-accent shadow-sm"
                    : "border-border bg-card hover:border-gold/60"
                }`}
              >
                <span className="text-2xl">{o.emoji}</span>
                <span className="text-sm font-medium">{o.label}</span>
              </button>
            ) : (
              <OptionButton
                key={o.value}
                label={o.label}
                emoji={o.emoji}
                multi={!single}
                selected={single ? value === o.value : list.includes(o.value)}
                onClick={() => (single ? selectSingle(o.value) : toggleMulti(o.value))}
              />
            ),
          )}
        </div>
        {!single ? (
          <StickyBar>
            <Button
              size="lg"
              disabled={list.length === 0}
              onClick={onNext}
              className="w-full rounded-full bg-primary text-base"
            >
              Continue
            </Button>
          </StickyBar>
        ) : null}
      </div>
    );
  }

  if (step.kind === "interstitial") {
    return (
      <div className="animate-quiz-in flex min-h-[60vh] flex-col justify-center text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-accent text-3xl">
          🕊️
        </div>
        <h1 className="text-[28px] font-semibold leading-tight">{step.title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{step.subtitle}</p>
        {step.source ? (
          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground/70">
            Source: {step.source}
          </p>
        ) : null}
        <StickyBar>
          <Button size="lg" onClick={onNext} className="w-full rounded-full text-base">
            {step.cta ?? "Continue"}
          </Button>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "slider") {
    return (
      <div className="animate-quiz-in pb-24">
        {heading}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 text-center">
            <span className="font-serif text-5xl font-semibold text-foreground">{slider}</span>
            <span className="text-lg text-muted-foreground">/10</span>
          </div>
          <Slider
            value={[slider]}
            min={1}
            max={10}
            step={1}
            onValueChange={(v) => setSlider(v[0] ?? 1)}
          />
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{step.minLabel}</span>
            <span>{step.maxLabel}</span>
          </div>
        </div>
        <StickyBar>
          <Button
            size="lg"
            onClick={() => {
              onAnswer(step.id, slider);
              onNext();
            }}
            className="w-full rounded-full text-base"
          >
            {step.cta ?? "Continue"}
          </Button>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "demo") {
    return (
      <div className="animate-quiz-in pb-24">
        {heading}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">John 3:16</p>
          <p className="mt-2 font-serif text-lg leading-relaxed">
            For God so{" "}
            <span className="rounded bg-accent px-1 underline decoration-gold decoration-2 underline-offset-4">
              loved
            </span>{" "}
            the world…
          </p>
          <div className="mt-4 rounded-xl border border-gold/40 bg-parchment p-4">
            <p className="font-serif text-2xl">ἠγάπησεν</p>
            <p className="text-sm text-muted-foreground">agapaō · aorist, active</p>
            <p className="mt-2 text-sm leading-relaxed">
              A deliberate choice, not a warmth of feeling. The tense points to one decisive act,
              not a mood that comes and goes.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {step.options?.map((o) => (
            <OptionButton
              key={o.value}
              label={o.label}
              selected={value === o.value}
              onClick={() => selectSingle(o.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step.kind === "text") {
    return (
      <div className="animate-quiz-in pb-24">
        {heading}
        <Input
          autoFocus
          value={name}
          placeholder={step.placeholder}
          onChange={(e) => setName(e.target.value)}
          className="h-14 rounded-2xl bg-card text-base"
        />
        <StickyBar>
          <Button
            size="lg"
            disabled={name.trim().length < 1}
            onClick={() => {
              onAnswer("name", name.trim());
              onNext();
            }}
            className="w-full rounded-full text-base"
          >
            {step.cta ?? "Continue"}
          </Button>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "email") {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return (
      <div className="animate-quiz-in pb-28">
        {heading}
        <Input
          autoFocus
          type="email"
          inputMode="email"
          value={email}
          placeholder={step.placeholder}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 rounded-2xl bg-card text-base"
        />
        <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
          <Checkbox checked={optIn} onCheckedChange={(c) => setOptIn(c === true)} />
          <span>Send me a short weekly verse breakdown. You can stop any time.</span>
        </label>
        <p className="mt-4 text-xs text-muted-foreground">
          We never share your email. No spam — just your plan.
        </p>
        <StickyBar>
          <Button
            size="lg"
            disabled={!valid}
            onClick={() => {
              onAnswer("email", email.trim());
              onAnswer("newsletter", optIn ? "yes" : "no");
              onNext();
            }}
            className="w-full rounded-full text-base"
          >
            {step.cta ?? "Continue"}
          </Button>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "analysis") {
    return <AnalysisStep answers={answers} onAnswer={onAnswer} onDone={onNext} />;
  }

  return null;
}

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 px-4 pb-6 pt-3 backdrop-blur">
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}