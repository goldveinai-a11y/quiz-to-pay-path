import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

export function BeforeAfter({
  reference,
  before,
  after,
}: {
  reference: string;
  before: string;
  after: string;
}) {
  const [pos, setPos] = useState(52);
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-s1">
      <div className="relative h-60 select-none">
        {/* Before */}
        <div className="absolute inset-0 grid place-items-center bg-secondary px-6 text-center">
          <div>
            <p className="eyebrow text-faint">Before</p>
            <p className="mt-2.5 font-serif text-[16px] leading-[1.6] text-muted-foreground">
              {before}
            </p>
          </div>
        </div>
        {/* After */}
        <div
          className="absolute inset-0 grid place-items-center bg-parchment px-6 text-center"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <div>
            <p className="eyebrow text-terra">With Plainly</p>
            <p className="mt-2.5 font-serif text-[16px] leading-[1.6] text-ink">{after}</p>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-terra"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 -ml-[17px] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-terra text-white shadow-s2">
            <MoveHorizontal className="h-4 w-4" />
          </span>
        </div>
        <input
          aria-label={`Compare ${reference}`}
          type="range"
          min={8}
          max={92}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="border-t border-border px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-faint">
        {reference}
      </p>
    </div>
  );
}
