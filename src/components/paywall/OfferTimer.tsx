import { useEffect, useRef, useState } from "react";

/**
 * A 10-minute hold on the discounted price. The deadline is kept per browser
 * so a refresh doesn't hand out a fresh countdown.
 */
const KEY = "br_offer_deadline";
const WINDOW_MS = 10 * 60 * 1000;

export function useOfferTimer() {
  const [left, setLeft] = useState(WINDOW_MS);
  const deadline = useRef<number | null>(null);

  useEffect(() => {
    const stored = Number(localStorage.getItem(KEY) ?? 0);
    const valid = stored > Date.now() && stored - Date.now() <= WINDOW_MS;
    deadline.current = valid ? stored : Date.now() + WINDOW_MS;
    localStorage.setItem(KEY, String(deadline.current));

    const tick = () => setLeft(Math.max(0, (deadline.current ?? 0) - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const total = Math.ceil(left / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return { label: `${mm}:${ss}`, expired: left <= 0 };
}

export function OfferTimer() {
  const { label, expired } = useOfferTimer();
  return (
    <div className="sticky top-0 z-30 bg-ink px-4 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-background">
      {expired ? (
        <>
          Discount <span className="text-amber">reserved</span> — checkout to keep it
        </>
      ) : (
        <>
          Your discount is held for <span className="text-amber tabular-nums">{label}</span>
        </>
      )}
    </div>
  );
}
