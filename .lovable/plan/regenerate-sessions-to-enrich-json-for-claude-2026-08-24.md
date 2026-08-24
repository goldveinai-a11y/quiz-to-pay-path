# Regenerate sessions-to-enrich.json for Claude

## Goal
Produce a clean, downloadable JSON file with all 90 sessions (John, Mark, Psalms) exported directly from the database — no CSV-style comma splitting, so titles and references stay intact.

## What will be done
1. Write a small export script that reads the 90 study sessions straight from the database and serialises them as real JSON (one object per session).
2. Fields per object:
   - `book_slug`, `day_number`, `title`
   - `reference`, `book`, `chapter`, `verse_start`, `verse_end`
   - `setup`, `highlight_word` (null when absent), `context_body`, `question`
3. Validation before delivery:
   - exactly 90 objects (30 per book)
   - `day_number` 1–30 with no gaps in each book
   - every `reference` matches the pattern "Book C:V-V" (or "Book C:V")
   - no truncated titles (compare against the database values)
4. Save the file to the downloadable documents area and attach it in chat.
5. Restate the Claude prompt: use `highlight_word` for `word_study` when present, otherwise pick a word from the verse range; fill `word_study`, `cross_reference`, `application`, `voices`, `quiz`; never quote Bible text; WEB/KJV/ASV only.

## Notes
No app code or database content changes — this is an export-only task.
