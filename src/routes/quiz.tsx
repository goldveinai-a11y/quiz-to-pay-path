import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QuizChrome } from "@/components/quiz/QuizChrome";
import { StepRenderer } from "@/components/quiz/StepRenderer";
import { steps, SECTIONS } from "@/lib/quiz/steps";
import { captureUtm, useAnswers } from "@/lib/quiz/store";

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
  const { answers, setAnswer, hydrated } = useAnswers();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    captureUtm();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const step = steps[index]!;
  const sectionSteps = steps.filter((s) => s.section === step.section);
  const sectionProgress = (sectionSteps.indexOf(step) + 1) / sectionSteps.length;

  const next = () => {
    if (index >= steps.length - 1) {
      navigate({ to: "/result" });
      return;
    }
    setIndex((i) => i + 1);
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="min-h-screen bg-background">
      {step.kind !== "analysis" ? (
        <QuizChrome
          section={step.section}
          progress={sectionProgress}
          canBack={index > 0}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
        />
      ) : null}
      <div className="mx-auto max-w-md px-4 py-7">
        <StepRenderer key={step.id} step={step} answers={answers} onAnswer={setAnswer} onNext={next} />
      </div>
      <p className="sr-only">{SECTIONS.join(", ")}</p>
    </main>
  );
}