import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, pages, blocks } from "@/db";
import { BLOCK_TYPES, blockSummary } from "@/lib/blocks";
import { updatePage, deletePage, createBlock, deleteBlock, toggleBlock, moveBlock } from "../../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

export default async function PageDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; fout?: string }>;
}) {
  const { id } = await params;
  const { ok, fout } = await searchParams;
  const page = (await db.select().from(pages).where(eq(pages.id, Number(id))))[0];
  if (!page) notFound();
  const rows = await db
    .select()
    .from(blocks)
    .where(and(eq(blocks.pageId, page.id)))
    .orderBy(asc(blocks.sort), asc(blocks.id));

  return (
    <>
      <p>
        <Link href="/admin/paginas" className="dim" style={{ color: "var(--muted)", fontSize: ".88rem" }}>
          &larr; Alle pagina&apos;s
        </Link>
      </p>
      <h1>{page.title}</h1>
      <p className="adm-sub">
        Live op{" "}
        <Link href={page.slug ? `/${page.slug}` : "/"} target="_blank" style={{ color: "var(--navy)", fontWeight: 600 }}>
          /{page.slug}
        </Link>
      </p>
      {ok ? <p className="adm-flash">Opgeslagen.</p> : null}
      {fout === "homepage" ? <p className="adm-flash err">De homepage kan niet verwijderd worden.</p> : null}

      <h2>Blokken</h2>
      <div className="adm-card">
        {rows.length === 0 && <p className="dim" style={{ color: "var(--muted)" }}>Nog geen blokken.</p>}
        {rows.map((b, i) => (
          <div className="adm-row" key={b.id}>
            <div className="grow">
              <b>{blockSummary(b.type, b.data as Record<string, unknown>)}</b>{" "}
              {!b.visible && <span className="adm-badge off">verborgen</span>}
            </div>
            <form action={moveBlock} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="pageId" value={page.id} />
              <input type="hidden" name="dir" value="up" />
              <button className="adm-btn sec sm" disabled={i === 0} type="submit">↑</button>
            </form>
            <form action={moveBlock} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="pageId" value={page.id} />
              <input type="hidden" name="dir" value="down" />
              <button className="adm-btn sec sm" disabled={i === rows.length - 1} type="submit">↓</button>
            </form>
            <form action={toggleBlock} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="pageId" value={page.id} />
              <button className="adm-btn sec sm" type="submit">{b.visible ? "Verberg" : "Toon"}</button>
            </form>
            <Link className="adm-btn sm" href={`/admin/paginas/${page.id}/blok/${b.id}`}>
              Bewerken
            </Link>
            <form action={deleteBlock} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="pageId" value={page.id} />
              <ConfirmButton className="adm-btn warn sm" message="Dit blok definitief verwijderen?">
                ✕
              </ConfirmButton>
            </form>
          </div>
        ))}
      </div>

      <h2>Blok toevoegen</h2>
      <div className="adm-card">
        <form action={createBlock}>
          <input type="hidden" name="pageId" value={page.id} />
          <div className="adm-field">
            <label htmlFor="type">Soort blok</label>
            <select id="type" name="type">
              {Object.entries(BLOCK_TYPES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
            <span className="help">Na het toevoegen open je direct de editor van het nieuwe blok.</span>
          </div>
          <button className="adm-btn" type="submit">Toevoegen</button>
        </form>
      </div>

      <h2>Pagina-instellingen</h2>
      <div className="adm-card">
        <form action={updatePage}>
          <input type="hidden" name="id" value={page.id} />
          <div className="adm-grid2">
            <div className="adm-field">
              <label htmlFor="title">Titel</label>
              <input id="title" name="title" type="text" defaultValue={page.title} required />
            </div>
            <div className="adm-field">
              <label htmlFor="navLabel">Menunaam (optioneel)</label>
              <input id="navLabel" name="navLabel" type="text" defaultValue={page.navLabel ?? ""} placeholder="Zelfde als titel" />
            </div>
          </div>
          <div className="adm-field">
            <label htmlFor="slug">Adres</label>
            <input id="slug" name="slug" type="text" defaultValue={page.slug} disabled={page.slug === ""} />
            {page.slug === "" ? <span className="help">Dit is de homepage; het adres staat vast.</span> : null}
          </div>
          <label className="adm-check">
            <input type="checkbox" name="inNav" defaultChecked={page.inNav} /> Tonen in het menu
          </label>
          <label className="adm-check">
            <input type="checkbox" name="visible" defaultChecked={page.visible} /> Pagina zichtbaar op de site
          </label>
          <button className="adm-btn" type="submit">Opslaan</button>
        </form>
      </div>

      {page.slug !== "" && (
        <div className="adm-card">
          <form action={deletePage}>
            <input type="hidden" name="id" value={page.id} />
            <ConfirmButton className="adm-btn warn" message={`Pagina "${page.title}" en alle blokken definitief verwijderen?`}>
              Pagina verwijderen
            </ConfirmButton>
          </form>
        </div>
      )}
    </>
  );
}
