import { db, settings } from "@/db";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  postal: string;
  kvk: string;
  btw: string;
  footerText: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "ABS Accountants & Belastingadviseurs",
  tagline: "Accountants & Belastingadviseurs · Spijkenisse",
  logoUrl: "",
  phone: "0181 - 621729",
  email: "info@absaccountants.nl",
  address: "Curieweg 11c, 3208 KJ Spijkenisse",
  postal: "Postbus 605, 3200 AN Spijkenisse",
  kvk: "24268440",
  btw: "NL8030.84.262.B01",
  footerText:
    "Persoonlijk accountantskantoor in Spijkenisse. Al bijna twintig jaar begeleiden we ondernemers en familiebedrijven in de regio met accountancy op AA-niveau, fiscale advisering en administratie.",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(settings);
  const merged = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in merged) {
      (merged as Record<string, unknown>)[row.key] = row.value;
    }
  }
  return merged;
}
