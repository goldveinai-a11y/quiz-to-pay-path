import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { FeatureRow } from "@/components/landing/FeatureRow";
import { Reviews } from "@/components/landing/Reviews";
import { Faq } from "@/components/landing/Faq";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { StartButton } from "@/components/landing/StartButton";
import { ArtBlock } from "@/components/art/ArtBlock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BibleRoutine — understand the Bible in 7 minutes a day" },
      {
        name: "description",
        content:
          "Take the 2-minute quiz and get a 30-day Bible reading plan matched to your tradition, your pace and what you're going through.",
      },
      { property: "og:title", content: "BibleRoutine — understand the Bible in 7 minutes a day" },
      {
        property: "og:description",
        content: "A 30-day Bible plan built around your tradition, your pace and your questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center justify-center px-5">
          <span className="font-serif text-[20px] tracking-tight text-ink">BibleRoutine</span>
        </div>
      </header>

      <Hero />
      <SocialProof />

      <section className="bg-parchment py-14">
        <div className="mx-auto w-full max-w-[560px] px-5">
          <h2 className="text-center text-[26px] leading-tight text-ink">Why people choose BibleRoutine</h2>
          <p className="mx-auto mb-10 mt-2 max-w-[400px] text-center text-[14px] text-muted-foreground">
            Short daily readings, real explanation, no theology degree required
          </p>

          <FeatureRow
            title="Seven minutes, every morning"
            text="One passage a day, sized to the time you actually have. The streak does the rest."
          >
            <div className="flex h-full flex-col bg-card">
              <ArtBlock tone="teal" height={110} eyebrow="Day 4" />
              <div className="p-4">
                <p className="font-serif text-[16px] leading-snug text-ink">Psalm 23</p>
                <p className="mt-1 text-[12px] text-muted-foreground">6 min · shepherd imagery</p>
                <div className="mt-4 space-y-2">
                  {["Read", "Explain", "Reflect"].map((s) => (
                    <div key={s} className="rounded-lg bg-secondary px-3 py-2 text-[12px] text-ink2">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FeatureRow>

          <FeatureRow
            title="The word behind the word"
            text="Hebrew and Greek made readable — what the word meant, how often it appears, why it matters here."
          >
            <div className="h-full bg-card p-4 pt-7">
              <p className="eyebrow text-faint">Greek · verb</p>
              <p className="mt-2 font-serif text-[26px] text-ink">ἠγάπησεν</p>
              <p className="mt-1 font-mono text-[11px] text-teal">ēgapēsen</p>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                Aorist tense: a single, completed act of love — a decision, not a mood.
              </p>
              <div className="mt-4 space-y-2">
                {["Romans 5:8", "1 John 4:10", "Ephesians 2:4"].map((v) => (
                  <div key={v} className="rounded-lg border border-border px-3 py-2 font-mono text-[11px] text-ink2">
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </FeatureRow>

          <FeatureRow
            title="Context that stays with you"
            text="Who wrote it, to whom, and what came before — so the next chapter isn't a cold start."
          >
            <div className="flex h-full flex-col bg-card">
              <ArtBlock tone="terra" height={100} eyebrow="Context" />
              <div className="p-4">
                <p className="font-serif text-[16px] text-ink">Letter to Rome, ~57 AD</p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  Paul writes to a church he has never visited, arguing that grace reaches Jew and
                  Gentile on the same terms.
                </p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-secondary">
                  <div className="h-1.5 w-2/3 rounded-full bg-teal" />
                </div>
                <p className="mt-2 font-mono text-[10px] text-faint">CHAPTER 9 OF 16</p>
              </div>
            </div>
          </FeatureRow>
        </div>
      </section>

      <Reviews />
      <Faq />

      <section className="mx-auto w-full max-w-[560px] px-5 py-14 text-center">
        <h2 className="text-[28px] leading-tight text-ink">Start today</h2>
        <p className="mx-auto mt-2 max-w-[380px] text-[14px] text-muted-foreground">
          Answer 2 minutes of questions and get your 30-day plan.
        </p>
        <div className="mt-6">
          <StartButton label="Start the quiz" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
