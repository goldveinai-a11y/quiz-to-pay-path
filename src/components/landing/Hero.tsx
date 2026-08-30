import { ART } from "@/lib/quiz/art";
import { StartButton } from "./StartButton";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[560px] px-5 pb-10 pt-8 text-center">
      <h1 className="text-balance text-[34px] leading-[1.08] tracking-tight text-ink sm:text-[42px]">
        Never know where to start with the Bible?
      </h1>
      <p className="mx-auto mt-3 max-w-[430px] text-[15px] leading-relaxed text-muted-foreground">
        Answer a 2-minute quiz and get a simple day-by-day plan made for beginners — no theology
        degree needed.
      </p>

      <div className="relative mt-7">
        <div className="overflow-hidden rounded-[26px] border border-border shadow-s2">
          <img
            src={ART["hero"]}
            alt="Engraved illustration of light breaking over open pages"
            className="h-[300px] w-full object-cover sm:h-[360px]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={560}
            height={360}
          />
        </div>

        <div className="relative z-10 mx-4 -mt-10 rounded-2xl border border-border bg-card p-4 text-left shadow-s2">
          <p className="eyebrow text-faint">John 3:16 · today</p>
          <p className="mt-2 font-serif text-[19px] leading-snug text-ink">
            “For God so <span className="bg-gold/30 px-1">loved</span> the world…”
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Explained in plain English — no confusing Bible-speak.
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
