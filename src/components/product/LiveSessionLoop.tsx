/**
 * A silent, looping demo of one reading session, drawn to fit inside PhoneMock.
 * Three scenes cross-fade on a 9s cycle: read → word study → streak.
 * Each scene is opaque and fills the full 9:19.5 handset height, so no frame of
 * the loop ever shows a half-transparent or half-empty screen.
 * Honours prefers-reduced-motion (first scene only, static).
 */
function Lines({ widths }: { widths: number[] }) {
  return (
    <div className="space-y-2">
      {widths.map((w, i) => (
        <span
          key={i}
          className="block h-[5px] rounded-full"
          style={{ width: `${w}%`, backgroundColor: "rgb(25 23 18 / 0.14)" }}
        />

      ))}
    </div>
  );
}

export function LiveSessionLoop({ book = "John" }: { book?: string }) {
  return (
    <div className="relative h-full w-full bg-parchment">
      {/* Scene 1 — today's reading */}
      <div className="scene-1 absolute inset-0 flex flex-col bg-parchment">
        <div className="art-hatch h-[26%] w-full shrink-0 bg-gradient-to-b from-terra to-gold" />
        <div className="flex flex-1 flex-col p-3.5">
          <p className="eyebrow text-muted-foreground">Day 4</p>
          <p className="mt-1 font-serif text-[15px] leading-tight text-ink">{book} 1:1–11</p>
          <div className="mt-3.5">
            <Lines widths={[100, 88, 94, 62, 96, 90, 78, 92, 58]} />
          </div>
          <div className="mt-4">
            <Lines widths={[84, 96, 70]} />
          </div>
          <span className="mt-auto block h-[30px] shrink-0 rounded-xl bg-ink" />
        </div>
      </div>

      {/* Scene 2 — word study sheet */}
      <div className="scene-2 absolute inset-0 flex flex-col overflow-hidden bg-parchment">
        <div className="flex flex-1 flex-col p-3.5 pt-6">
          <p className="eyebrow text-muted-foreground">John 3:16</p>
          <p className="mt-2 font-serif text-[13.5px] leading-[1.65] text-ink">
            For God so <span className="anim-mark-in px-0.5">loved</span> the world, that he gave
            his one and only Son, that whoever believes in him should not perish, but have eternal
            life.
          </p>
          <div className="mt-3.5">
            <Lines widths={[92, 100, 74]} />
          </div>
          <div className="mt-auto">
            <p className="eyebrow text-muted-foreground">Cross reference</p>
            <div className="mt-2">
              <Lines widths={[96, 82]} />
            </div>
          </div>
        </div>
        <div className="anim-sheet-up shrink-0 rounded-t-2xl bg-card p-3.5 pb-4 shadow-s2">
          <span className="mx-auto mb-2.5 block h-[3px] w-7 rounded-full bg-border" />
          <p className="font-serif text-[19px] leading-none text-ink">ἠγάπησεν</p>
          <p className="mt-1.5 font-mono text-[8px] text-terra">agapaō · G25</p>
          <div className="mt-3">
            <Lines widths={[100, 90, 68]} />
          </div>
        </div>
      </div>

      {/* Scene 3 — streak */}
      <div className="scene-3 absolute inset-0 flex flex-col bg-card p-3.5 pt-6">
        <p className="eyebrow text-muted-foreground">Streak</p>
        <p className="font-serif text-[32px] leading-none text-ink">12</p>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              className={`aspect-square rounded-[3px] ${
                i < 12 ? "bg-teal" : i === 12 ? "anim-dot-pop bg-amber" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-border p-2.5">
          <p className="eyebrow text-muted-foreground">This week</p>
          <div className="mt-2">
            <Lines widths={[88, 96, 64]} />
          </div>
        </div>
        <div className="mt-4">
          <Lines widths={[92, 76]} />
        </div>
        <p className="mt-auto text-[10px] leading-snug text-muted-foreground">
          Day 13 unlocked — keep going.
        </p>
      </div>
    </div>
  );
}
