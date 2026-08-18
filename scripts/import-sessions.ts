/**
 * Imports study sessions from a seed file. Nothing is generated here.
 *
 *   bun scripts/import-sessions.ts path/to/seed.json
 *
 * Verse text is never taken from the seed: the seed names a passage and the
 * app reads the words from the `verses` table (WEB only).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BOOKS: Record<string, string> = {
  john: "John",
  mark: "Mark",
  psalms: "Psalms",
  philippians: "Philippians",
  ruth: "Ruth",
  proverbs: "Proverbs",
  ephesians: "Ephesians",
};
const AUTHORS: Record<string, string> = {
  "Matthew Henry": "1710",
  "John Gill": "1746",
  "Albert Barnes": "1834",
};
const TONES = new Set(["teal", "terra", "indigo", "olive"]);
const FORBIDDEN = ["NIV", "ESV", "NLT", "NASB", "CSB", "NKJV", "NABRE", "The Message"];

type Reading = { tradition: string; reading: string; verses?: string };
type Seed = {
  book_slug: string;
  day_number: number;
  title: string;
  setup: string;
  passage: { book: string; chapter: number; verse_start: number; verse_end: number; reference?: string };
  highlight_word?: string | null;
  insight: { title: string; body: string; author: string; year: string };
  context: string;
  divergence?: { question: string; readings: Reading[]; common: string } | null;
  question: string;
  art_tone?: string;
  word_study?: { word: string; original: string; language: string; gloss: string; body: string } | null;
  cross_reference?: { reference: string; note: string } | null;
  application?: { prompt: string; body: string } | null;
  voices?: { tradition: string; reading: string }[] | null;
  quiz?: { question: string; options: string[]; answer_index: number; explanation: string } | null;
};

const file = process.argv[2];
if (!file) {
  console.error("usage: bun scripts/import-sessions.ts <seed.json>");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
for (const bad of FORBIDDEN) {
  if (new RegExp(`\\b${bad}\\b`).test(raw)) {
    console.error(`Rejected: the file mentions ${bad}. Only WEB, KJV and ASV are permitted.`);
    process.exit(1);
  }
}

const seeds = JSON.parse(raw) as Seed[];
const supabase = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
  auth: { persistSession: false },
});

const rejected: string[] = [];
const rows: Record<string, unknown>[] = [];
const quizRows: Record<string, unknown>[] = [];

for (const s of seeds) {
  const where = `${s?.book_slug}/${s?.day_number}`;
  const book = BOOKS[s?.book_slug ?? ""];
  if (!book) { rejected.push(`${where}: unknown book_slug`); continue; }
  if (!(s.day_number >= 1 && s.day_number <= 30)) { rejected.push(`${where}: day_number out of range`); continue; }
  if (AUTHORS[s.insight?.author ?? ""] !== s.insight?.year) {
    rejected.push(`${where}: author/year not a permitted public-domain pair`);
    continue;
  }
  const p = s.passage;
  const { data: verses, error } = await supabase
    .from("verses")
    .select("verse, text")
    .eq("translation", "WEB")
    .eq("book", book)
    .eq("chapter", p.chapter)
    .gte("verse", p.verse_start)
    .lte("verse", p.verse_end)
    .order("verse");
  if (error) { rejected.push(`${where}: ${error.message}`); continue; }
  if (!verses || verses.length === 0) { rejected.push(`${where}: passage resolves to no verses`); continue; }

  const joined = verses.map((v) => v.text).join(" ").toLowerCase();
  const word = s.highlight_word && joined.includes(s.highlight_word.toLowerCase()) ? s.highlight_word : null;
  const divergence = s.divergence?.readings?.length ? s.divergence : null;

  rows.push({
    book_slug: s.book_slug,
    day_number: s.day_number,
    title: s.title,
    setup: s.setup,
    reference: p.reference ?? `${book} ${p.chapter}:${p.verse_start}-${p.verse_end}`,
    book,
    chapter: p.chapter,
    verse_start: p.verse_start,
    verse_end: p.verse_end,
    highlight_word: word,
    insight_title: s.insight.title,
    insight_body: s.insight.body,
    insight_author: s.insight.author,
    insight_year: s.insight.year,
    context_body: s.context,
    divides: Boolean(divergence),
    divide_question: divergence?.question ?? null,
    divide_readings: divergence?.readings ?? null,
    divide_common: divergence?.common ?? null,
    question: s.question,
    art_tone: TONES.has(s.art_tone ?? "") ? s.art_tone : "teal",
    word_study: s.word_study ?? null,
    cross_reference: s.cross_reference ?? null,
    application: s.application ?? null,
    voices: s.voices?.length ? s.voices : null,
  });

  const q = s.quiz;
  if (q && Array.isArray(q.options) && q.options.length >= 2) {
    if (q.answer_index < 0 || q.answer_index >= q.options.length) {
      rejected.push(`${where}: quiz answer_index out of range`);
    } else {
      quizRows.push({
        book_slug: s.book_slug,
        day_number: s.day_number,
        question: q.question,
        options: q.options,
        correct_index: q.answer_index,
        explanation: q.explanation,
      });
    }
  }
}

if (rows.length) {
  const { error } = await supabase.from("study_sessions").upsert(rows, { onConflict: "book_slug,day_number" });
  if (error) { console.error("Import failed:", error.message); process.exit(1); }
}

if (quizRows.length) {
  const { error } = await supabase.from("session_quiz").upsert(quizRows, { onConflict: "book_slug,day_number" });
  if (error) { console.error("Quiz import failed:", error.message); process.exit(1); }
}

console.log(`Imported ${rows.length} session(s), ${quizRows.length} quiz question(s).`);
if (rejected.length) {
  console.log(`Rejected ${rejected.length}:`);
  for (const r of rejected) console.log(" -", r);
}