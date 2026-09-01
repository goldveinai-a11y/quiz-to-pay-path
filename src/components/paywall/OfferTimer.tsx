/**
 * A calm price hold. This category punishes countdowns and scarcity theatre
 * harder than any other, so the price is simply stated as held for this plan —
 * no clock, no red numbers.
 */
export function OfferTimer() {
  return (
    <div className="sticky top-0 z-30 bg-ink px-4 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-background">
      This price is <span className="text-amber">held for your plan</span> — no countdown, no pressure
    </div>
  );
}
