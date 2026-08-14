import { useState } from "react";

export function BeforeAfter({
  reference,
  before,
  after,
}: {
  reference: string;
  before: string;
  after: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative h-56 select-none">
        <div className="absolute inset-0 grid place-items-center bg-secondary p-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Before</p>
            <p className="mt-2 font-serif text-[17px] leading-relaxed text-muted-foreground">
              {before}
            </p>
          </div>
        </div>
        <div
          className="absolute inset-y-0 left-0 overflow-hidden bg-parchment"
          style={{ width: `${pos}%` }}
        >
          <div className="grid h-full w-screen max-w-none place-items-center p-6 text-center">
            <div className="max-w-[85vw] sm:max-w-md">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">With Verse</p>
              <p className="mt-2 font-serif text-[17px] leading-relaxed text-foreground">{after}</p>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 -ml-4 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-gold text-xs font-bold text-gold-foreground shadow">
            ⇆
          </span>
        </div>
        <input
          aria-label={`Compare ${reference}`}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="border-t border-border px-4 py-3 text-sm font-medium text-muted-foreground">
        {reference}
      </p>
    </div>
  );
}