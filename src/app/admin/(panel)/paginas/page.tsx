import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, pages } from "@/db";
import { createPage, movePage } from "../../actions";

export const dynamic = "force-dynamic";

export default async function PagesAdmin() {
  const rows = await db.select().from(pages).orderBy(asc(pages.sort), asc(pages.id));
  return (
    <>
      <h1>Pagina&apos;s</h1>
      <p className="adm-sub">De volgorde hieronder is ook de volgorde in het menu.</p>
      <div className="adm-card">
        {rows.map((p, i) => (
          <div className="adm-row" key={p.id}>
            <div className="grow">
              <b>{p.title}</b>{" "}
              {!p.visible && <span className="adm-badge off">verborgen</span>}{" "}
              {!p.inNav && p.visible && <span className="adm-badge">niet in menu</span>}
              <div className="dim">/{p.slug}</div>
            </div>
            <form action={movePage} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="dir" value="up" />
              <button className="adm-btn sec sm" disabled={i === 0} type="submit">↑</button>
            </form>
            <form action={movePage} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="dir" value="down" />
              <button className="adm-btn sec sm" disabled={i === rows.length - 1} type="submit">↓</button>
            </form>
            <Link className="adm-btn sm" href={`/admin/paginas/${p.id}`}>
              Bewerken
            </Link>
          </div>
        ))}
      </div>
      <h2>Nieuwe pagina</h2>
      <div className="adm-card">
        <form action={createPage}>
          <div className="adm-grid2">
            <div className="adm-field">
              <label htmlFor="title">Titel</label>
              <input id="title" name="title" type="text" required placeholder="Bijv. Tarieven" />
            </div>
            <div className="adm-field">
              <label htmlFor="slug">Adres (optioneel)</label>
              <input id="slug" name="slug" type="text" placeholder="bijv. tarieven" />
            </div>
          </div>
          <button className="adm-btn" type="submit">Pagina toevoegen</button>
        </form>
      </div>
    </>
  );
}
