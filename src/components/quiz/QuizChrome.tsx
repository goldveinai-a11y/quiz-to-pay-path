import { ChevronLeft } from "lucide-react";
import { SECTIONS } from "@/lib/quiz/steps";

export function QuizChrome({
  section,
  progress,
  onBack,
  canBack,
}: {
  section: string;
  progress: number;
  onBack: () => void;
  canBack: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Go back"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex gap-1">
            {SECTIONS.map((s) => {
              const index = SECTIONS.indexOf(s);
              const current = SECTIONS.indexOf(section as (typeof SECTIONS)[number]);
              const fill = index < current ? 1 : index === current ? progress : 0;
              return (
                <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${fill * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {section}
          </p>
        </div>
      </div>
    </header>
  );
}