import { useEffect, useState } from "react";
import { Check, Sunrise, Sandwich, Sunset, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ArtBlock, type ArtTone } from "@/components/art/ArtBlock";
import { ART } from "@/lib/quiz/art";
import type { Answers, Step } from "@/lib/quiz/types";
import { AnalysisStep } from "./AnalysisStep";

type Props = {
  step: Step;
  answers: Answers;
  onAnswer: (id: string, value: string | string[] | number) => void;
  onNext: () => void;
};

const TIME_ICONS: Record<string, typeof Sunrise> = {
  morning: Sunrise,
  lunch: Sandwich,
  evening: Sunset,
  bed: Moon,
};

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/95 px-4 pb-6 pt-3 backdrop-blur">
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}

function CtaButton({
  children,
  ...rest
}: React.ComponentProps<typeof Button> & { children: React.ReactNode }) {
  return (
    <Button
      {...rest}
      className="h-[54px] w-full rounded-2xl bg-ink text-[15px] font-medium text-background shadow-s2 transition hover:bg-ink/90 disabled:opacity-40"
    >
      {children}
    </Button>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
  multi,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
  icon?: typeof Sunrise | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-4 py-[15px] text-left text-[15px] font-medium shadow-s1 transition active:scale-[0.99] ${
        selected ? "border-teal bg-secondary" : "border-border hover:border-faint"
      }`}
    >
      {Icon ? (
        <span
          className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${
            selected ? "bg-teal text-background" : "bg-secondary text-ink2"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      ) : null}
      <span className="flex-1 leading-snug">{label}</span>
      <span
        className={`grid h-[22px] w-[22px] flex-none place-items-center border-2 ${
          multi ? "rounded-md" : "rounded-full"
        } ${selected ? "border-teal bg-teal text-background" : "border-border"}`}
      >
        {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

function ImageCard({
  label,
  image,
  selected,
  onClick,
}: {
  label: string;
  image: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group overflow-hidden rounded-2xl border-2 bg-card text-left shadow-s1 transition active:scale-[0.99] ${
        selected ? "border-teal shadow-s2" : "border-transparent hover:border-border"
      }`}
    >
      <div className="relative">
        <img
          src={ART[image] ?? ART["calm"]!}
          alt=""
          loading="lazy"
          width={640}
          height={512}
          className="h-[104px] w-full object-cover"
        />
        {selected ? (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-teal text-background shadow">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <span className="block px-3 py-[11px] text-[13.5px] font-medium leading-snug">{label}</span>
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
    setTimeout(onNext, 170);
  };

  const toggleMulti = (v: string) => {
    const list = Array.isArray(value) ? [...(value as string[])] : [];
    const idx = list.indexOf(v);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(v);
    onAnswer(step.id, list);
  };

  const heading = (
    <div className="mb-6 text-center">
      <h1 className="font-serif text-[27px] font-semibold leading-[1.18] tracking-tight text-ink">
        {step.title}
      </h1>
      {step.subtitle ? (
        <p className="mx-auto mt-2.5 max-w-[19rem] text-[13.5px] leading-relaxed text-muted-foreground">
          {step.subtitle}
        </p>
      ) : null}
    </div>
  );

  if (step.kind === "single") {
    return (
      <div className="animate-quiz-in">
        {heading}
        <div className="space-y-2.5">
          {step.options?.map((o) => (
            <OptionButton
              key={o.value}
              label={o.label}
              icon={TIME_ICONS[o.value]}
              selected={value === o.value}
              onClick={() => selectSingle(o.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step.kind === "statement") {
    return (
      <div className="animate-quiz-in">
        <div className="mb-7 overflow-hidden rounded-3xl bg-card shadow-s2">
          <ArtBlock tone="indigo" height={112} eyebrow="Honest question" />
          <div className="px-5 py-5">
            <p className="font-serif text-[21px] leading-snug text-ink">{step.title}</p>
          </div>
        </div>
        <div className="space-y-2.5">
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

  if (step.kind === "multi" || step.kind === "cards") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    const single = step.id === "trigger";
    const hasImages = Boolean(step.options?.[0]?.image);
    return (
      <div className="animate-quiz-in pb-28">
        {heading}
        {hasImages ? (
          <div className="grid grid-cols-2 gap-3">
            {step.options?.map((o) => (
              <ImageCard
                key={o.value}
                label={o.label}
                image={o.image!}
                selected={single ? value === o.value : list.includes(o.value)}
                onClick={() => (single ? selectSingle(o.value) : toggleMulti(o.value))}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {step.options?.map((o) => (
              <OptionButton
                key={o.value}
                label={o.label}
                multi={!single}
                selected={single ? value === o.value : list.includes(o.value)}
                onClick={() => (single ? selectSingle(o.value) : toggleMulti(o.value))}
              />
            ))}
          </div>
        )}
        {!single ? (
          <StickyBar>
            <CtaButton disabled={list.length === 0} onClick={onNext}>
              Continue
            </CtaButton>
          </StickyBar>
        ) : null}
      </div>
    );
  }

  if (step.kind === "interstitial") {
    const isFirst = step.id === "break-1";
    const tone: ArtTone = isFirst ? "terra" : "teal";
    const bullets = isFirst
      ? ["4 in 5 want to read more", "2 in 3 don't understand it", "Almost nobody says it out loud"]
      : ["74% finish with a guide", "33% finish without one", "Seven minutes is enough"];
    return (
      <div className="animate-quiz-in pb-28">
        <div className="overflow-hidden rounded-3xl bg-card shadow-s2">
          <ArtBlock tone={tone} height={168} eyebrow={isFirst ? "You're not alone" : "The odds"}>
            <p className="absolute bottom-4 left-5 right-5 font-serif text-[22px] font-semibold leading-tight text-white">
              {step.title}
            </p>
          </ArtBlock>
          <div className="px-5 py-5">
            <p className="text-[14.5px] leading-relaxed text-ink2">{step.subtitle}</p>
            <ul className="mt-4 space-y-2.5 border-t border-border pt-4">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-ink2">
                  <span className="mt-[3px] grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-teal text-background">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            {step.source ? (
              <p className="eyebrow mt-4 text-faint">Source · {step.source}</p>
            ) : null}
          </div>
        </div>
        <StickyBar>
          <CtaButton onClick={onNext}>{step.cta ?? "Continue"}</CtaButton>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "slider") {
    const labels = [
      "Lost most of the time",
      "Mostly lost",
      "I catch fragments",
      "Some of it lands",
      "About half",
      "More often than not",
      "Fairly comfortable",
      "Comfortable",
      "I could explain it",
      "I could teach it",
    ];
    return (
      <div className="animate-quiz-in pb-28">
        {heading}
        <div className="overflow-hidden rounded-3xl bg-card shadow-s2">
          <ArtBlock tone="olive" height={120}>
            <div className="absolute bottom-4 left-5 text-white">
              <span className="font-serif text-[46px] font-semibold leading-none">{slider}</span>
              <span className="ml-1 text-[15px] opacity-70">/ 10</span>
            </div>
            <span className="eyebrow absolute bottom-6 right-5 max-w-[9rem] text-right text-white/80">
              {labels[slider - 1]}
            </span>
          </ArtBlock>
          <div className="px-5 pb-6 pt-6">
            <Slider
              value={[slider]}
              min={1}
              max={10}
              step={1}
              onValueChange={(v) => setSlider(v[0] ?? 1)}
            />
            <div className="mt-4 flex justify-between font-mono text-[10px] uppercase tracking-wider text-faint">
              <span>{step.minLabel}</span>
              <span>{step.maxLabel}</span>
            </div>
          </div>
        </div>
        <StickyBar>
          <CtaButton
            onClick={() => {
              onAnswer(step.id, slider);
              onNext();
            }}
          >
            {step.cta ?? "Continue"}
          </CtaButton>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "demo") {
    return (
      <div className="animate-quiz-in pb-10">
        {heading}
        <div className="overflow-hidden rounded-3xl bg-card shadow-s2">
          <div className="px-5 pt-5">
            <p className="eyebrow text-terra">The passage</p>
            <p className="mt-2 font-serif text-[19px] leading-[1.62] text-ink">
              <sup className="mr-1 font-mono text-[9px] text-faint">16</sup>For God so{" "}
              <span className="border-b-2 border-terra/40">loved</span> the world, that he gave his
              only begotten Son…
            </p>
            <p className="mt-2 font-mono text-[9.5px] tracking-wide text-faint">
              JOHN 3:16 · WORLD ENGLISH BIBLE
            </p>
          </div>
          <div className="mt-5 rounded-t-3xl border-t border-border bg-secondary px-5 pb-6 pt-5">
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-[31px] font-semibold leading-none">ἠγάπησεν</p>
                <p className="mt-1.5 font-mono text-[12px] text-terra">agapaō · Strong's G25</p>
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-success">
                Free
              </span>
            </div>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink2">
              A deliberate, chosen love — not warmth of feeling.{" "}
              <b className="font-semibold text-ink">The tense points to one decisive act</b>, not a
              mood that comes and goes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["aorist", "143 uses", "verb"].map((c) => (
                <span
                  key={c}
                  className="rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              {[
                ["1 JOHN 4:19", "We love him, because he first loved us."],
                ["GALATIANS 2:20", "…the Son of God, who loved me, and gave himself up for me."],
              ].map(([ref, text]) => (
                <div key={ref}>
                  <p className="font-mono text-[9.5px] tracking-wide text-faint">{ref}</p>
                  <p className="font-serif text-[14px] leading-snug text-ink2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-2.5">
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
      <div className="animate-quiz-in pb-28">
        {heading}
        <Input
          autoFocus
          value={name}
          placeholder={step.placeholder}
          onChange={(e) => setName(e.target.value)}
          className="h-14 rounded-2xl border-2 border-border bg-card text-center text-base shadow-s1"
        />
        <StickyBar>
          <CtaButton
            disabled={name.trim().length < 1}
            onClick={() => {
              onAnswer("name", name.trim());
              onNext();
            }}
          >
            {step.cta ?? "Continue"}
          </CtaButton>
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
          className="h-14 rounded-2xl border-2 border-border bg-card text-center text-base shadow-s1"
        />
        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-[13px] leading-relaxed text-ink2">
          <Checkbox checked={optIn} onCheckedChange={(c) => setOptIn(c === true)} />
          <span>Send me a short weekly verse breakdown. You can stop any time.</span>
        </label>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-faint">
          No spam · just your plan
        </p>
        <StickyBar>
          <CtaButton
            disabled={!valid}
            onClick={() => {
              onAnswer("email", email.trim());
              onAnswer("newsletter", optIn ? "yes" : "no");
              track("quiz_email_submit", { newsletter: optIn });
              onNext();
            }}
          >
            {step.cta ?? "Continue"}
          </CtaButton>
        </StickyBar>
      </div>
    );
  }

  if (step.kind === "analysis") {
    return <AnalysisStep answers={answers} onAnswer={onAnswer} onDone={onNext} />;
  }

  return null;
}
