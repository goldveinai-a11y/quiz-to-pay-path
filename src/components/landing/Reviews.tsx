import { LANDING_REVIEWS } from "@/lib/reviews";

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
        See how BibleRoutine changes reading
      </h2>
      <p className="mx-auto mt-2 max-w-[400px] text-center text-[14px] text-muted-foreground">
        Real notes from people who finally stayed in the text
      </p>
      <div className="mt-7 space-y-4">
        {LANDING_REVIEWS.map((r) => (
          <article key={r.name} className="rounded-2xl border border-border bg-card p-5 shadow-s1">
            <Stars />
            <p className="mt-3 text-[14px] leading-relaxed text-ink2">{r.text}</p>
            <div className="mt-4 flex items-center gap-3">
              <img
                src={r.face}
                alt={`${r.name}, BibleRoutine reader`}
                loading="lazy"
                width={128}
                height={128}
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
              <span className="text-[14px] font-medium text-ink">{r.name}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}