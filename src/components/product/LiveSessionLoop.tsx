/**
 * A silent, looping demo of one reading session, drawn to fit inside PhoneMock.
 * Three scenes cross-fade on a 9s cycle: read → word study → streak.
 * Honours prefers-reduced-motion (first scene only, static).
 */
export function LiveSessionLoop({ book = "John" }: { book?: string }) {
  return (
    <div className="relative h-full w-full bg-parchment">
      {/* Scene 1 — today's reading */}
      <div className="scene-1 absolute inset-0 flex flex-col">
        <div className="art-hatch h-[34%] w-full bg-gradient-to-b from-terra to-gold" />
        <div className="flex-1 p-3">
          <p className="eyebrow text-faint">Day 4</p>
          <p className="mt-1 font-serif text-[14px] leading-tight text-ink">{book} 1:1–11</p>
          <div className="mt-3 space-y-1.5">
            {[100, 88, 94, 62].map((w, i) => (
              <span
                key={i}
                className="block h-[4px] rounded-full bg-secondary"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <span className="mt-4 block h-[26px] rounded-xl bg-ink" />
        </div>
      </div>

      {/* Scene 2 — word study sheet */}
      <div className="scene-2 absolute inset-0 flex flex-col overflow-hidden">
        <div className="p-3 pt-6">
          <p className="font-serif text-[13px] leading-[1.6] text-ink">
            For God so <span className="anim-mark-in px-0.5">loved</span> the world…
          </p>
        </div>
        <div className="anim-sheet-up mt-auto rounded-t-2xl bg-card p-3 shadow-s2">
          <span className="mx-auto mb-2 block h-[3px] w-7 rounded-full bg-border" />
          <p className="font-serif text-[18px] leading-none text-ink">ἠγάπησεν</p>
          <p className="mt-1 font-mono text-[8px] text-terra">agapaō · G25</p>
          <div className="mt-2.5 space-y-1.5">
            {[100, 90, 68].map((w, i) => (
              <span
                key={i}
                className="block h-[4px] rounded-full bg-secondary"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scene 3 — streak */}
      <div className="scene-3 absolute inset-0 flex flex-col bg-card p-3 pt-6">
        <p className="eyebrow text-faint">Streak</p>
        <p className="font-serif text-[30px] leading-none text-ink">12</p>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className={`aspect-square rounded-[3px] ${
                i < 12 ? "bg-teal" : i === 12 ? "anim-dot-pop bg-amber" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <p className="mt-auto text-[10px] leading-snug text-muted-foreground">
          Day 13 unlocked — keep going.
        </p>
      </div>
    </div>
  );
}
