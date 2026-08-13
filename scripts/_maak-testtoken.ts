// Hulpscript voor lokale verificatie: print een geldig admin-sessietoken
// (zelfde HMAC als src/lib/auth.ts). Draaien: npx tsx scripts/_maak-testtoken.ts
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m || process.env[m[1]] !== undefined) continue;
  process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}

const exp = String(Date.now() + 3600_000);
const sig = createHmac("sha256", process.env.ADMIN_PASSWORD!).update(exp).digest("base64url");
console.log(`${exp}.${sig}`);
