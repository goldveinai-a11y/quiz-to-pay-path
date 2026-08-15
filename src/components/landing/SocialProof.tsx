const PEOPLE = ["MR", "JL", "AK", "TS", "DP"];

export function SocialProof() {
  return (
    <section className="mx-auto w-full max-w-[560px] px-5 pb-12 text-center">
      <div className="flex justify-center">
        {PEOPLE.map((p, i) => (
          <span
            key={p}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-secondary font-mono text-[11px] text-ink2"
            style={{ marginLeft: i === 0 ? 0 : -10 }}
          >
            {p}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-muted-foreground">
        Over 40 000 people read the Bible daily with Plainly
      </p>
    </section>
  );
}