import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QuizChrome } from "@/components/quiz/QuizChrome";
import { StepRenderer } from "@/components/quiz/StepRenderer";
import { steps, SECTIONS } from "@/lib/quiz/steps";
import { captureUtm, useAnswers } from "@/lib/quiz/store";
import { useReturningReader } from "@/lib/auth/useReturningReader";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Bible Plan Quiz — 2 minutes, 22 questions" },
      {
        name: "description",
        content:
          "Answer a few honest questions and get a 30-day Bible reading plan matched to your tradition, pace and season of life.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Bible Plan Quiz — 2 minutes" },
      {
        property: "og:description",
        content: "Get a 30-day Bible reading plan built around you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const navigate = useNavigate();
  useReturningReader();
  const { answers, setAnswer, hydrated } = useAnswers();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    captureUtm();
    track("quiz_start", { total_steps: steps.length });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const step = steps[index]!;

  useEffect(() => {
    track("quiz_step_view", { step_index: index + 1, step_id: step.id, step_kind: step.kind });
  }, [index, step.id, step.kind]);

  const next = () => {
    track("quiz_step_complete", { step_index: index + 1, step_id: step.id, step_kind: step.kind });
    if (index >= steps.length - 1) {
      track("quiz_complete", { total_steps: steps.length });
      navigate({ to: "/result" });
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <main className="min-h-screen bg-background">
      {step.kind !== "analysis" ? (
        <QuizChrome
          index={index}
          total={steps.length}
          canBack={index > 0}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
        />
      ) : null}
      <div
        className={cn(
          "relative mx-auto max-w-md px-4 pb-10 pt-6 transition-opacity duration-200",
          !hydrated && "opacity-70"
        )}
        aria-busy={!hydrated}
      >
        <StepRenderer key={step.id} step={step} answers={answers} onAnswer={setAnswer} onNext={next} />
        {!hydrated ? (
          <div className="pointer-events-auto absolute inset-0 z-10 flex items-start justify-center pt-32">
            <span className="sr-only">Loading quiz…</span>
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
          </div>
        ) : null}
      </div>
      <p className="sr-only">{SECTIONS.join(", ")}</p>
    </main>
  );
}