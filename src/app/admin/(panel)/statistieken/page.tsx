import { desc, gte, sql } from "drizzle-orm";
import { db, pageViews } from "@/db";

export const dynamic = "force-dynamic";

const LAND: Record<string, string> = {
  NL: "Nederland", BE: "België", DE: "Duitsland", FR: "Frankrijk", GB: "Verenigd Koninkrijk",
  US: "Verenigde Staten", ES: "Spanje", IT: "Italië", TR: "Turkije", PL: "Polen",
};

export default async function StatsAdmin() {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [perDay, topPages, topReferrers, devices, countries, totals] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(${pageViews.createdAt} at time zone 'Europe/Amsterdam', 'YYYY-MM-DD')`,
        views: sql<number>`count(*)`,
        visitors: sql<number>`count(distinct ${pageViews.visitorHash})`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db
      .select({ path: pageViews.path, views: sql<number>`count(*)` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(pageViews.path)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    db
      .select({ referrer: pageViews.referrer, views: sql<number>`count(*)` })
      .from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${since} and ${pageViews.referrer} <> ''`)
      .groupBy(pageViews.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    db
      .select({ device: pageViews.device, views: sql<number>`count(*)` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(pageViews.device)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({ country: pageViews.country, views: sql<number>`count(*)` })
      .from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${since} and ${pageViews.country} <> ''`)
      .groupBy(pageViews.country)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db
      .select({
        views: sql<number>`count(*)`,
        visitors: sql<number>`count(distinct ${pageViews.visitorHash} || to_char(${pageViews.createdAt}, 'YYYY-MM-DD'))`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since)),
  ]);

  // Volledige reeks van 30 dagen, ook de dagen zonder bezoek.
  const byDay = new Map(perDay.map((d) => [d.day, d]));
  const days: { day: string; views: number; visitors: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    days.push({ day: key, views: Number(row?.views ?? 0), visitors: Number(row?.visitors ?? 0) });
  }
  const maxViews = Math.max(1, ...days.map((d) => d.views));

  return (
    <>
      <h1>Statistieken</h1>
      <p className="adm-sub">
        Bezoek van de afgelopen 30 dagen. Anoniem gemeten (geen tracking-cookies); eigen bezoeken als ingelogde
        beheerder tellen niet mee.
      </p>

      <div className="adm-grid2">
        <div className="adm-card">
          <div style={{ fontSize: "1.9rem", fontWeight: 700 }}>{Number(totals[0]?.views ?? 0)}</div>
          <div style={{ fontWeight: 700 }}>Paginaweergaven</div>
        </div>
        <div className="adm-card">
          <div style={{ fontSize: "1.9rem", fontWeight: 700 }}>{Number(totals[0]?.visitors ?? 0)}</div>
          <div style={{ fontWeight: 700 }}>Bezoeken (unieke bezoekers per dag)</div>
        </div>
      </div>

      <h2>Per dag</h2>
      <div className="adm-card">
        <div className="st-chart">
          {days.map((d) => (
            <div
              className="st-col"
              key={d.day}
              title={`${d.day}: ${d.views} weergaven, ${d.visitors} bezoekers`}
            >
              <div className="st-bar" style={{ height: `${Math.round((d.views / maxViews) * 100)}%` }}></div>
            </div>
          ))}
        </div>
        <div className="st-axis">
          <span>{days[0].day}</span>
          <span>{days[days.length - 1].day}</span>
        </div>
      </div>

      <div className="adm-grid2">
        <div className="adm-card">
          <h2 style={{ marginTop: 0 }}>Populairste pagina&apos;s</h2>
          {topPages.length === 0 && <p style={{ color: "var(--muted)" }}>Nog geen bezoek gemeten.</p>}
          {topPages.map((p) => (
            <div className="adm-row" key={p.path}>
              <div className="grow">{p.path}</div>
              <b>{Number(p.views)}</b>
            </div>
          ))}
        </div>
        <div className="adm-card">
          <h2 style={{ marginTop: 0 }}>Herkomst (verwijzende sites)</h2>
          {topReferrers.length === 0 && <p style={{ color: "var(--muted)" }}>Nog geen verwijzingen gemeten.</p>}
          {topReferrers.map((r) => (
            <div className="adm-row" key={r.referrer}>
              <div className="grow">{r.referrer}</div>
              <b>{Number(r.views)}</b>
            </div>
          ))}
        </div>
        <div className="adm-card">
          <h2 style={{ marginTop: 0 }}>Apparaat</h2>
          {devices.map((d) => (
            <div className="adm-row" key={d.device}>
              <div className="grow">{d.device || "onbekend"}</div>
              <b>{Number(d.views)}</b>
            </div>
          ))}
        </div>
        <div className="adm-card">
          <h2 style={{ marginTop: 0 }}>Land</h2>
          {countries.length === 0 && <p style={{ color: "var(--muted)" }}>Nog geen landen gemeten.</p>}
          {countries.map((c) => (
            <div className="adm-row" key={c.country}>
              <div className="grow">{LAND[c.country] ?? c.country}</div>
              <b>{Number(c.views)}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
