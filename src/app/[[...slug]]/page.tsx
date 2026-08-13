import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, pages, blocks, blogPosts } from "@/db";
import { getSettings } from "@/lib/settings";
import { isAdmin } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/chrome";
import { RenderBlock } from "@/components/render-blocks";
import { BlockToolbar, AddBlockButton } from "@/components/edit/block-toolbar";
import { AdminBar, PreviewBar } from "@/components/edit/admin-bar";
import { EditMode } from "@/components/edit/edit-mode";
import { BlockForm } from "@/components/admin/block-form";
import { BLOCK_TYPES, blockSummary } from "@/lib/blocks";
import { blockHasDraft, effectiveBlock } from "@/lib/drafts";
import { saveBlock, saveInlineEdits } from "@/app/admin/actions";

// Content komt uit de database en moet direct na een wijziging zichtbaar zijn.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ bewerken?: string; blok?: string; voorvertoning?: string; gepubliceerd?: string }>;
};

async function findPage(slugPath: string) {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slugPath), eq(pages.visible, true)))
    .limit(1);
  return rows[0];
}

export async function generateMetadata({ params }: { params: Props["params"] }) {
  const { slug = [] } = await params;
  const s = await getSettings();
  if (slug.length === 0) return { title: `${s.siteName} | Spijkenisse` };
  const page = await findPage(slug.join("/"));
  if (page) return { title: `${page.title} | ${s.siteName}` };
  if (slug.length === 2) {
    const post = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug[1])).limit(1);
    if (post[0]) return { title: `${post[0].title} | ${s.siteName}` };
  }
  return { title: s.siteName };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug = [] } = await params;
  const { bewerken, blok, voorvertoning, gepubliceerd } = await searchParams;
  const slugPath = slug.join("/");
  const path = slugPath ? `/${slugPath}` : "/";

  const admin = await isAdmin();
  const edit = admin && bewerken === "1";
  const preview = admin && !edit && voorvertoning === "1";

  // Hoeveel conceptwijzigingen staan er (site-breed) klaar om te publiceren?
  const pending = admin ? (await db.select().from(blocks)).filter(blockHasDraft).length : 0;

  const page = await findPage(slugPath);
  if (page) {
    const rows = await db
      .select()
      .from(blocks)
      .where(eq(blocks.pageId, page.id))
      .orderBy(asc(blocks.sort), asc(blocks.id));

    // Drie standen: bezoekers zien de gepubliceerde staat; bewerken en
    // voorvertoning tonen het concept (draft-waarden waar aanwezig).
    let pageBlocks;
    if (edit || preview) {
      pageBlocks = rows
        .filter((b) => !b.draftDeleted)
        .map(effectiveBlock)
        .sort((a, b) => a.sort - b.sort || a.id - b.id);
      if (preview) pageBlocks = pageBlocks.filter((b) => b.visible);
    } else {
      pageBlocks = rows.filter((b) => !b.isNew && b.visible);
    }

    // Bewerk-paneel: volledig blokformulier als overlay op de site zelf.
    const overlayBlock = edit && blok ? pageBlocks.find((b) => b.id === Number(blok)) : undefined;

    return (
      <>
        <SiteHeader />
        <main>
          {edit && pageBlocks.length > 0 && (
            <AddBlockButton pageId={page.id} path={path} afterSort={Math.min(...pageBlocks.map((b) => b.sort)) - 1} />
          )}
          {pageBlocks.map((b, i) => {
            const rendered = (
              <RenderBlock
                key={b.id}
                type={b.type}
                data={b.data as Record<string, unknown>}
                pageSlug={page.slug}
                pageTitle={page.title}
                blockId={b.id}
                edit={edit}
              />
            );
            if (!edit) return rendered;
            return (
              <div
                key={b.id}
                className={b.visible ? "eb" : "eb eb-hidden"}
                data-block-id={b.id}
                data-page-id={page.id}
                data-block-json={JSON.stringify(b.data)}
              >
                <BlockToolbar
                  blockId={b.id}
                  pageId={page.id}
                  path={path}
                  label={blockSummary(b.type, b.data as Record<string, unknown>).split(" — ")[0]}
                  type={b.type}
                  visible={b.visible}
                  first={i === 0}
                  last={i === pageBlocks.length - 1}
                />
                {rendered}
                <AddBlockButton pageId={page.id} path={path} afterSort={b.sort} />
              </div>
            );
          })}
          {edit && pageBlocks.length === 0 && (
            <div className="nm-sec">
              <div className="nm-wrap">
                <p className="nm-p">Deze pagina heeft nog geen blokken.</p>
                <AddBlockButton pageId={page.id} path={path} afterSort={0} />
              </div>
            </div>
          )}
        </main>
        <SiteFooter />
        {preview && <PreviewBar path={path} pending={pending} />}
        {admin && !edit && !preview && (
          <AdminBar
            path={path}
            editHref={`${path}?bewerken=1`}
            editLabel="Site bewerken"
            pending={pending}
            published={gepubliceerd === "1"}
          />
        )}
        {edit && <EditMode path={path} save={saveInlineEdits} pending={pending} />}
        {overlayBlock && (
          <div className="eb-overlay">
            <div className="eb-panel">
              <div className="eb-panel-head">
                <b>{BLOCK_TYPES[overlayBlock.type]?.label ?? overlayBlock.type}</b>
                <Link href={`${path}?bewerken=1`} className="eb-btn" title="Sluiten">✕</Link>
              </div>
              <p className="adm-sub">{BLOCK_TYPES[overlayBlock.type]?.description}</p>
              <BlockForm
                pageId={page.id}
                blockId={overlayBlock.id}
                fields={BLOCK_TYPES[overlayBlock.type]?.fields ?? []}
                initialData={overlayBlock.data as Record<string, unknown>}
                save={saveBlock}
                backHref={`${path}?bewerken=1`}
                backLabel="Sluiten"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Geen pagina: mogelijk een blogbericht onder een pagina met een blog-blok
  // (bijv. /actueel/nieuwe-regels-2027).
  if (slug.length === 2) {
    const parent = await findPage(slug[0]);
    const post = (
      await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug[1]), eq(blogPosts.visible, true)))
        .limit(1)
    )[0];
    if (parent && post) {
      return (
        <>
          <SiteHeader />
          <main>
            <section className="nm-pagehead">
              <div className="nm-wrap">
                <div className="nm-crumb">
                  <Link href="/">Home</Link> &rsaquo; <Link href={`/${parent.slug}`}>{parent.title}</Link> &rsaquo;{" "}
                  {post.title}
                </div>
                <span className="nm-ey on-dark">
                  {post.publishedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <h1 className="nm-h1" style={{ marginTop: 12 }}>{post.title}</h1>
              </div>
            </section>
            <section className="nm-sec">
              <div className="nm-wrap">
                <article className="nm-article">
                  {post.coverUrl ? (
                    <div className="nm-fig" style={{ marginBottom: 28 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.coverUrl} alt="" />
                    </div>
                  ) : null}
                  {renderBody(post.body)}
                  <p style={{ marginTop: 36 }}>
                    <Link className="nm-btn ghost" href={`/${parent.slug}`}>
                      &larr; Terug naar {parent.title.toLowerCase()}
                    </Link>
                  </p>
                </article>
              </div>
            </section>
          </main>
          <SiteFooter />
          {admin && (
            <AdminBar path={`/${parent.slug}/${post.slug}`} editHref={`/admin/blog/${post.id}`} editLabel="Bericht bewerken" pending={pending} />
          )}
        </>
      );
    }
  }

  notFound();
}

// Eenvoudige opmaak: lege regel = alinea, "## " = tussenkop, "- " = lijst.
function renderBody(body: string) {
  const parts = body.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("## ")) return <h2 key={i}>{part.slice(3)}</h2>;
    const lines = part.split(/\r?\n/);
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i}>
          {lines.map((l, j) => (
            <li key={j}>{l.trim().slice(2)}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{part}</p>;
  });
}
