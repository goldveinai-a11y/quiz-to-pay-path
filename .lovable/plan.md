# Segment-first quiz, hero image, step counter

Three fixes from the review. All are frontend-only; the common quiz body, plan logic and analytics stay as they are.

## 1. Segment question first when `?v=` is present

Today the tag survives the click (the Start button forwards the query string), but the segment questions sit in section 2 — so the first screen is still "Which best describes you? Man / Woman". Message match breaks one screen after the landing.

Change the order for tagged traffic only:

```text
now (?v=no-time):  gender → age → tradition → frequency → [segment questions] → ...
after:             [segment questions] → gender → age → tradition → frequency → ...
```

- In `stepsForSegment`, when the segment came from the URL, move the segment's first questions (2 diagnostics + pivot) to the front of the list instead of leaving them in section 2.
- The segment steps keep their own section label so the progress chrome stays coherent; the "You" block (gender/age/tradition) follows straight after the pivot.
- Untagged traffic is unchanged: self-select "What brought you here today?" stays first, and its segment questions stay where they are today (the self-select already delivers message match on screen one).

## 2. Hero image blank on first load

The hero art is a 137 KB JPEG pulled in through the shared art barrel, which also drags 13 other images into the same module graph — on a cold mobile connection the largest element on the deciding screen can stay empty for seconds.

- Import the hero image directly in `Hero.tsx` instead of through the shared `ART` map, so it is a standalone asset the browser can start fetching immediately.
- Add a `<link rel="preload" as="image">` for it in the landing route head.
- Give the image container a solid parchment-tone background so the frame never renders as an empty white rectangle while loading.
- Verify with a throttled cold load (mobile viewport, slow network, empty cache) on both preview and the published domain before calling it done.

## 3. Counter and title mismatch

`/quiz` shows 1/23, `/quiz?v=no-time` shows 1/22, and the page title says "22 questions".

- Drop the number from the quiz page title so it can never drift from the real length.
- Leave the live counter driven by the actual active step list (it is correct — the untagged run genuinely has one extra self-select question).

## Technical notes

- Files touched: `src/lib/quiz/segments.ts` (`stepsForSegment` ordering), `src/components/landing/Hero.tsx` (direct image import, background), `src/routes/index.tsx` (preload link), `src/routes/quiz.tsx` (title).
- Verification: typecheck, production build, and a Playwright pass over all six `?v=` URLs plus untagged `/quiz`, checking the first question and the counter, on preview and on bibleroutine.app.
