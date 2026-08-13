// Tijdelijke test van de concept-flow: zet of wist een draft-titel op het
// hero-blok van de homepage.
//   npx tsx scripts/_test-draft.ts set   -> draftData met testtitel
//   npx tsx scripts/_test-draft.ts clear -> concept wissen
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m || process.env[m[1]] !== undefined) continue;
  process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}

const sql = neon(process.env.DATABASE_URL!);
const mode = process.argv[2] ?? "set";

async function main() {
  const rows = await sql`
    SELECT b.id, b.data FROM blocks b JOIN pages p ON p.id = b.page_id
    WHERE p.slug = '' AND b.type = 'hero' LIMIT 1
  `;
  const hero = rows[0];
  if (!hero) throw new Error("geen hero-blok gevonden");
  if (mode === "set") {
    const draft = { ...(hero.data as Record<string, unknown>), title: "TEST-CONCEPT: alleen zichtbaar in bewerkmodus" };
    await sql`UPDATE blocks SET draft_data = ${JSON.stringify(draft)}::jsonb WHERE id = ${hero.id}`;
    console.log(`draft gezet op blok ${hero.id}`);
  } else {
    await sql`UPDATE blocks SET draft_data = NULL WHERE id = ${hero.id}`;
    console.log(`draft gewist op blok ${hero.id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
