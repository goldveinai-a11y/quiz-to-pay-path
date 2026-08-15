import { ChevronLeft } from "lucide-react";

export function QuizChrome({
  index,
  total,
  canBack,
  onBack,
}: {
  index: number;
  total: number;
  canBack: boolean;
  onBack: () => void;
}) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full text-ink2 transition disabled:opacity-25"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-serif text-[17px] font-semibold tracking-tight">
          Plainly
        </span>
        <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">
          {index + 1}/{total}
        </span>
      </div>
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="h-[3px] w-full rounded-full bg-border">
          <div
            className="h-full rounded-full bg-ink transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
