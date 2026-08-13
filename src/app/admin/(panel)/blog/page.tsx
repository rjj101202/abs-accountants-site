import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, blogPosts } from "@/db";
import { createBlogPost } from "../../actions";

export const dynamic = "force-dynamic";

export default async function BlogAdmin() {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  return (
    <>
      <h1>Blog / actueel</h1>
      <p className="adm-sub">
        Berichten verschijnen automatisch op elke pagina met een blog-blok, nieuwste eerst.
      </p>
      <div className="adm-card">
        <form action={createBlogPost} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <div className="adm-field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
            <label htmlFor="title">Titel van het nieuwe bericht</label>
            <input id="title" name="title" type="text" required />
          </div>
          <button className="adm-btn" type="submit">Aanmaken</button>
        </form>
      </div>
      <div className="adm-card">
        {rows.length === 0 && <p style={{ color: "var(--muted)" }}>Nog geen berichten.</p>}
        {rows.map((p) => (
          <div className="adm-row" key={p.id}>
            <div className="grow">
              <b>{p.title}</b> {!p.visible && <span className="adm-badge off">concept</span>}
              <div className="dim">
                {p.publishedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} · /
                {p.slug}
              </div>
            </div>
            <Link className="adm-btn sm" href={`/admin/blog/${p.id}`}>
              Bewerken
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
