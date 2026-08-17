import { ArrowDown } from "lucide-react";

export function BeforeAfter({
  reference,
  before,
  after,
}: {
  reference: string;
  before: string;
  after: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-s1">
      <div className="relative bg-secondary px-5 pb-7 pt-5">
        <p className="eyebrow text-faint">On its own</p>
        <p className="mt-2 font-serif text-[16px] leading-[1.6] text-muted-foreground">{before}</p>
        <span className="absolute -bottom-[15px] left-5 z-10 grid h-[30px] w-[30px] place-items-center rounded-full bg-terra text-white shadow-s2">
          <ArrowDown className="h-4 w-4" />
        </span>
      </div>
      <div className="px-5 pb-5 pt-7">
        <p className="eyebrow text-terra">With BibleRoutine</p>
        <p className="mt-2 font-serif text-[16px] leading-[1.6] text-ink">{after}</p>
      </div>
      <p className="border-t border-border px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-faint">
        {reference}
      </p>
    </div>
  );
}
