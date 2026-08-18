/**
 * Imports public-domain KJV text for the books the plans use.
 *   bun scripts/import-kjv.ts
 * Source: aruljohn/Bible-kjv (public domain text).
 */
import { createClient } from "@supabase/supabase-js";

const BOOKS = ["John", "Mark", "Psalms", "Ruth", "Philippians", "Proverbs", "Ephesians"];

const supabase = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
  auth: { persistSession: false },
});

for (const book of BOOKS) {
  const res = await fetch(`https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${book}.json`);
  if (!res.ok) { console.error(`${book}: HTTP ${res.status}`); process.exit(1); }
  const json = (await res.json()) as { chapters: { chapter: string; verses: { verse: string; text: string }[] }[] };
  const rows = json.chapters.flatMap((c) =>
    c.verses.map((v) => ({
      translation: "KJV",
      book,
      chapter: Number(c.chapter),
      verse: Number(v.verse),
      text: v.text.replace(/\s+/g, " ").trim(),
    })),
  );
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase
      .from("verses")
      .upsert(rows.slice(i, i + 500), { onConflict: "translation,book,chapter,verse" });
    if (error) { console.error(`${book}: ${error.message}`); process.exit(1); }
  }
  console.log(`${book}: ${rows.length} KJV verses.`);
}
