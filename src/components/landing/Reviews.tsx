const REVIEWS = [
  {
    name: "Olivia",
    initials: "OL",
    text: "I read the Bible for years and quietly understood almost none of it. Plainly explains the verse and the word behind it — in seven minutes I actually get it.",
  },
  {
    name: "Marcus",
    initials: "MA",
    text: "The daily plan is short enough that I never skip. Three weeks in and it's the first habit I've kept since college.",
  },
  {
    name: "Grace",
    initials: "GR",
    text: "The original-language notes are what sold me. It's like having a study Bible that only says the part I needed.",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-teal" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l3 6.6 7 .9-5.1 4.8 1.3 7L12 18l-6.2 3.3 1.3-7L2 9.5l7-.9z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section className="mx-auto w-full max-w-[560px] px-5 py-12">
      <h2 className="text-center text-[26px] leading-tight text-ink">
        See how Plainly changes reading
      </h2>
      <p className="mx-auto mt-2 max-w-[400px] text-center text-[14px] text-muted-foreground">
        Real notes from people who finally stayed in the text
      </p>
      <div className="mt-7 space-y-4">
        {REVIEWS.map((r) => (
          <article key={r.name} className="rounded-2xl border border-border bg-card p-5 shadow-s1">
            <Stars />
            <p className="mt-3 text-[14px] leading-relaxed text-ink2">{r.text}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mono text-[11px] text-ink2">
                {r.initials}
              </span>
              <span className="text-[14px] font-medium text-ink">{r.name}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}