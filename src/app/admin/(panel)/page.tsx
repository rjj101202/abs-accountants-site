import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db, pages, teamMembers, blogPosts, messages } from "@/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pageCount, memberCount, postCount, unread] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(pages),
    db.select({ n: sql<number>`count(*)` }).from(teamMembers),
    db.select({ n: sql<number>`count(*)` }).from(blogPosts),
    db.select({ n: sql<number>`count(*)` }).from(messages).where(eq(messages.isRead, false)),
  ]);
  const cards = [
    { href: "/admin/paginas", label: "Pagina's", n: pageCount[0].n, sub: "teksten en blokken bewerken" },
    { href: "/admin/team", label: "Teamleden", n: memberCount[0].n, sub: "medewerkers beheren" },
    { href: "/admin/blog", label: "Blogberichten", n: postCount[0].n, sub: "actueel bijhouden" },
    { href: "/admin/berichten", label: "Ongelezen berichten", n: unread[0].n, sub: "via het contactformulier" },
  ];
  return (
    <>
      <h1>Welkom in het beheer</h1>
      <p className="adm-sub">
        Hier beheer je de website: pagina&apos;s en blokken, teamleden, blogberichten, afbeeldingen en de algemene
        gegevens. Wijzigingen staan direct live.
      </p>
      <div className="adm-grid2">
        {cards.map((c) => (
          <Link className="adm-card" key={c.href} href={c.href} style={{ display: "block" }}>
            <div style={{ fontSize: "1.9rem", fontWeight: 700 }}>{c.n}</div>
            <div style={{ fontWeight: 700 }}>{c.label}</div>
            <div className="dim" style={{ color: "var(--muted)", fontSize: ".88rem" }}>{c.sub}</div>
          </Link>
        ))}
      </div>
      <h2>Zo werkt het</h2>
      <div className="adm-card">
        <p style={{ fontSize: ".95rem", color: "var(--muted)" }}>
          Elke pagina bestaat uit <b>blokken</b> (bijvoorbeeld een kop, kaarten of een tekstblok). Onder{" "}
          <Link href="/admin/paginas" style={{ color: "var(--navy)", fontWeight: 600 }}>Pagina&apos;s</Link> kun je per
          pagina blokken bewerken, toevoegen, verplaatsen, verbergen of verwijderen. Teamleden en blogberichten beheer
          je op hun eigen plek; de site toont ze automatisch waar een team- of blogblok staat. Afbeeldingen upload je
          onder <Link href="/admin/afbeeldingen" style={{ color: "var(--navy)", fontWeight: 600 }}>Afbeeldingen</Link>{" "}
          en kies je daarna in de blokken.
        </p>
      </div>
    </>
  );
}
