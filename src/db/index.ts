import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy: de verbinding wordt pas opgezet bij het eerste gebruik, zodat
// `next build` ook slaagt als DATABASE_URL (nog) niet is ingesteld.
type Db = ReturnType<typeof createDb>;

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is niet ingesteld (zie .env.example / Vercel env vars)");
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}

let instance: Db | undefined;

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    instance ??= createDb();
    return Reflect.get(instance, prop);
  },
});

export * from "./schema";
