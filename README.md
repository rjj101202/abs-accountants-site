# ABS Accountants — website met beheeromgeving

Next.js-site voor ABS Accountants & Belastingadviseurs (Spijkenisse) waarin
medewerkers zelf de content beheren via `/admin`: teksten en blokken per
pagina, pagina's toevoegen/verwijderen, teamleden, blogberichten,
afbeeldingen, contactgegevens en berichten uit het contactformulier.

## Stack

- **Next.js (App Router)** — publieke site + beheeromgeving, alles server-rendered
- **Neon Postgres + Drizzle** — alle content (pagina's, blokken, team, blog, instellingen, berichten)
- **Vercel Blob** — afbeeldingsuploads
- Login met één gedeeld wachtwoord (`ADMIN_PASSWORD`), HMAC-cookie van 30 dagen

## Eerste keer opzetten

1. **Database**: maak een (gratis) Neon-project aan op neon.tech en kopieer de
   connection string.
2. **Env vars**: kopieer `.env.example` naar `.env.local` en vul in:
   - `DATABASE_URL` — de Neon connection string
   - `ADMIN_PASSWORD` — zelfgekozen beheerderswachtwoord
   - `BLOB_READ_WRITE_TOKEN` — na stap 6, voor lokaal uploaden (optioneel lokaal)
3. `npm install`
4. `npm run db:push` — maakt de tabellen aan
5. `npm run seed` — vult de startcontent (weigert als er al pagina's zijn)
6. **Vercel**: maak een nieuw Vercel-project op deze repo, voeg onder
   Storage een **Blob store** toe en zet de drie env vars ook in het
   Vercel-project (Production + Preview).
7. Deploy. De site staat op `/`, het beheer op `/admin`.

Lokaal draaien: `npm run dev` (port 3000).

## Hoe de content in elkaar zit

Elke pagina is een rij in `pages` en bestaat uit **blokken** (`blocks`) met
een type (hero, paginakop, tekst, kaarten, twee kolommen, quote-band,
call-to-action, team, blog, contactgegevens, contactformulier, afbeelding,
vrij HTML). De velden per bloktype staan in `src/lib/blocks.ts`; de
weergave in `src/components/render-blocks.tsx`. Nieuw bloktype toevoegen =
in beide bestanden één entry erbij.

Team- en blogblokken tonen automatisch de inhoud van Team-/Blogbeheer.
Blogdetails leven onder de pagina met het blog-blok (bijv.
`/actueel/<slug>`). Het contactformulier schrijft naar `messages` en is
terug te lezen onder Beheer → Berichten.

Alle publieke pagina's zijn `force-dynamic`: een wijziging in het beheer is
direct live, zonder redeploy.

## Beveiliging

- `/admin` is afgeschermd via middleware (edge) én `requireAdmin()` in elke
  pagina en server action (Node) — beide controleren het HMAC-cookie.
- Uploads: alleen ingelogd, alleen afbeeldingen, max 8 MB.
- Het vrije HTML-blok rendert ongefilterde HTML; alleen voor beheerders die
  weten wat ze doen (staat zo in de editor vermeld).
