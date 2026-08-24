# Fix the enrichment export file

Claude is right that the file is broken, but wrong about the cause: the database has correct data for all 90 sessions. The export script mangled it.

## What I verified in the database

- All 90 sessions (John 30, Mark 30, Psalms 30) have a proper reference, e.g. `John 1:1-5`, plus structured `book / chapter / verse_start / verse_end`.
- Claude's "reconstruction" is not needed — and several of its guesses differ from the real passages (day 4 John is 2:6-11, not 2:1-11; day 7 John is 3:16-21, not 3:19-21; Mark and Psalms have similar shifts).
- `setup` exists for every day; `highlight_word` exists for some days only (many are empty).

The 28 "broken" rows are days whose title contains a comma — the export split the title on the comma and dropped the second half into `reference`.

## What to do

1. Regenerate `sessions-to-enrich.json` directly from the database as real JSON (no CSV-style splitting), one object per session with:
   `book_slug`, `day_number`, `title`, `reference`, `book`, `chapter`, `verse_start`, `verse_end`, `setup`, `highlight_word` (null where absent), `context_body`, `question`.
2. Validate before delivery: 90 objects, every `reference` matches `Book C:V-V`, day numbers 1-30 per book with no gaps, no title truncation.
3. Deliver the file as a downloadable artifact.
4. Update the Claude prompt with one added rule: when `highlight_word` is present, `word_study` must analyse that exact word; when null, Claude picks a word from the given verse range.

Nothing in the app or the database changes — this is only the export and the prompt.
