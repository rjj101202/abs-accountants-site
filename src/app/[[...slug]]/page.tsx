import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, pages, blocks, blogPosts } from "@/db";
import { getSettings } from "@/lib/settings";
import { SiteHeader, SiteFooter } from "@/components/chrome";
import { RenderBlock } from "@/components/render-blocks";

// Content komt uit de database en moet direct na een wijziging zichtbaar zijn.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug?: string[] }> };

async function findPage(slugPath: string) {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slugPath), eq(pages.visible, true)))
    .limit(1);
  return rows[0];
}

export async function generateMetadata({ params }: Props) {
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

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const slugPath = slug.join("/");

  const page = await findPage(slugPath);
  if (page) {
    const pageBlocks = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.pageId, page.id), eq(blocks.visible, true)))
      .orderBy(asc(blocks.sort), asc(blocks.id));
    return (
      <>
        <SiteHeader />
        <main>
          {pageBlocks.map((b) => (
            <RenderBlock
              key={b.id}
              type={b.type}
              data={b.data as Record<string, unknown>}
              pageSlug={page.slug}
              pageTitle={page.title}
              isHome={page.slug === ""}
            />
          ))}
        </main>
        <SiteFooter />
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
