# Clarify the locked-day label in the plan list

## What you saw

On the plan list, card **14** shows a lock with the text `DAY 13 FIRST`, while day 13 is the highlighted current day (not finished yet). The wording reads as if day 13 were already completed, which is confusing.

## What is actually happening

The unlock rule is correct: a day opens only after the previous day is finished. Day 13 is your current, unfinished session — so day 14 is still locked. Only the label text is misleading: it says `Day 13 first` instead of clearly stating that day 13 must be completed.

## The change

- Replace the lock label with `Finish day 13 first` (verb included), so the number is understood as a requirement, not as a completion.
- Same styling, same lock icon, same position — text only.

## Technical detail

Single edit in `src/routes/_authenticated/plan.all.tsx`: change the locked-row label from `Day {d.day - 1} first` to `Finish day {d.day - 1} first`. No changes to unlock logic in `src/lib/product/read.server.ts`.
