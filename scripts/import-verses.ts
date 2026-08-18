/**
 * Imports WEB verse text for whole books into public.verses.
 *   bun scripts/import-verses.ts "Ruth:4" "Philippians:4"
 * Only WEB is fetched; no other translation is ever written by this script.
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
  auth: { persistSession: false },
});

const args = process.argv.slice(2);
if (!args.length) {
  console.error('usage: bun scripts/import-verses.ts "Ruth:4" "Proverbs:31"');
  process.exit(1);
}

for (const arg of args) {
  const [book, chaptersRaw] = arg.split(":");
  const chapters = Number(chaptersRaw);
  if (!book || !Number.isFinite(chapters)) { console.error(`bad argument: ${arg}`); process.exit(1); }
  let total = 0;
  for (let c = 1; c <= chapters; c++) {
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${c}?translation=web`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`${book} ${c}: HTTP ${res.status}`); process.exit(1); }
    const json = (await res.json()) as { verses: { chapter: number; verse: number; text: string }[] };
    const rows = json.verses.map((v) => ({
      translation: "WEB",
      book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.replace(/\s+/g, " ").trim(),
    }));
    const { error } = await supabase.from("verses").upsert(rows, { onConflict: "translation,book,chapter,verse" });
    if (error) { console.error(`${book} ${c}: ${error.message}`); process.exit(1); }
    total += rows.length;
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`${book}: ${total} verses.`);
}
