/**
 * Enrichment-only import: adds word_study / cross_reference / application /
 * voices / quiz to sessions that already exist. Nothing else is touched.
 *
 *   bun scripts/import-enrichment.ts path/to/enrichment.json
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const FORBIDDEN = ["NIV", "ESV", "NLT", "NASB", "CSB", "NKJV", "NABRE", "The Message"];
const BOOKS = new Set(["john", "mark", "psalms", "philippians", "ruth", "proverbs", "ephesians"]);

type Item = {
  book_slug: string;
  day_number: number;
  word_study?: { word: string; original: string; language: string; gloss: string; body: string } | null;
  cross_reference?: { reference: string; note: string } | null;
  application?: { prompt: string; body: string } | null;
  voices?: { tradition: string; reading: string }[] | null;
  quiz?: { question: string; options: string[]; answer_index: number; explanation: string } | null;
};

const file = process.argv[2];
if (!file) {
  console.error("usage: bun scripts/import-enrichment.ts <enrichment.json>");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
for (const bad of FORBIDDEN) {
  if (new RegExp(`\\b${bad}\\b`).test(raw)) {
    console.error(`Rejected: the file mentions ${bad}. Only WEB, KJV and ASV are permitted.`);
    process.exit(1);
  }
}

const items = JSON.parse(raw) as Item[];
const supabase = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
  auth: { persistSession: false },
});

const rejected: string[] = [];
let updated = 0;
const quizRows: Record<string, unknown>[] = [];

for (const it of items) {
  const where = `${it?.book_slug}/${it?.day_number}`;
  if (!BOOKS.has(it?.book_slug ?? "")) { rejected.push(`${where}: unknown book_slug`); continue; }
  if (!(it.day_number >= 1 && it.day_number <= 30)) { rejected.push(`${where}: day_number out of range`); continue; }

  const patch: Record<string, unknown> = {};
  if (it.word_study) patch["word_study"] = it.word_study;
  if (it.cross_reference) patch["cross_reference"] = it.cross_reference;
  if (it.application) patch["application"] = it.application;
  if (it.voices?.length) patch["voices"] = it.voices;

  if (Object.keys(patch).length) {
    const { data, error } = await supabase
      .from("study_sessions")
      .update(patch)
      .eq("book_slug", it.book_slug)
      .eq("day_number", it.day_number)
      .select("id");
    if (error) { rejected.push(`${where}: ${error.message}`); continue; }
    if (!data?.length) { rejected.push(`${where}: no existing session to enrich`); continue; }
    updated += 1;
  }

  const q = it.quiz;
  if (q && Array.isArray(q.options) && q.options.length >= 2) {
    if (q.answer_index < 0 || q.answer_index >= q.options.length) {
      rejected.push(`${where}: quiz answer_index out of range`);
    } else {
      quizRows.push({
        book_slug: it.book_slug,
        day_number: it.day_number,
        question: q.question,
        options: q.options,
        correct_index: q.answer_index,
        explanation: q.explanation,
      });
    }
  }
}

if (quizRows.length) {
  const { error } = await supabase.from("session_quiz").upsert(quizRows, { onConflict: "book_slug,day_number" });
  if (error) { console.error("Quiz import failed:", error.message); process.exit(1); }
}

console.log(`Enriched ${updated} session(s), upserted ${quizRows.length} quiz question(s).`);
if (rejected.length) {
  console.log(`Rejected ${rejected.length}:`);
  for (const r of rejected) console.log(" -", r);
}
