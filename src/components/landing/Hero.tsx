import { ART } from "@/lib/quiz/art";
import { StartButton } from "./StartButton";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[560px] px-5 pb-10 pt-8 text-center">
      <h1 className="text-balance text-[34px] leading-[1.08] tracking-tight text-ink sm:text-[42px]">
        Understand the Bible — not just read it
      </h1>
      <p className="mx-auto mt-3 max-w-[430px] text-[15px] leading-relaxed text-muted-foreground">
        Seven minutes a day. Every verse explained plainly, in the words behind the words.
      </p>

      <div className="relative mt-7">
        <div className="overflow-hidden rounded-[26px] border border-border shadow-s2">
          <img
            src={ART.hero}
            alt="Engraved illustration of light breaking over open pages"
            className="h-[300px] w-full object-cover sm:h-[360px]"
            loading="eager"
          />
        </div>

        <div className="mx-4 -mt-14 rounded-2xl border border-border bg-card p-4 text-left shadow-s2">
          <p className="eyebrow text-faint">John 3:16 · today</p>
          <p className="mt-2 font-serif text-[19px] leading-snug text-ink">
            “For God so <span className="bg-gold/30 px-1">loved</span> the world…”
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal/10 px-2.5 py-1 font-mono text-[11px] text-teal">
              ἠγάπησεν
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] text-ink2">
              aorist
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] text-ink2">
              143 uses
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            A once-and-for-all act of love — not a feeling, a decision.
          </p>
        </div>
      </div>

      <div className="mt-7">
        <StartButton />
      </div>
      <p className="mt-3 text-[12px] text-faint">2-minute quiz · no card required</p>
    </section>
  );
}