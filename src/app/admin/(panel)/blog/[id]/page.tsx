import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, blogPosts } from "@/db";
import { updateBlogPost, deleteBlogPost } from "../../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormImageField } from "@/components/admin/form-image-field";

export const dynamic = "force-dynamic";

export default async function BlogEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const post = (await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id))))[0];
  if (!post) notFound();
  const dateValue = post.publishedAt.toISOString().slice(0, 10);
  return (
    <>
      <p>
        <Link href="/admin/blog" style={{ color: "var(--muted)", fontSize: ".88rem" }}>
          &larr; Alle berichten
        </Link>
      </p>
      <h1>Bericht bewerken</h1>
      {ok ? <p className="adm-flash">Opgeslagen.</p> : null}
      <div className="adm-card">
        <form action={updateBlogPost}>
          <input type="hidden" name="id" value={post.id} />
          <div className="adm-field">
            <label>Titel</label>
            <input name="title" type="text" defaultValue={post.title} required />
          </div>
          <div className="adm-grid2">
            <div className="adm-field">
              <label>Adres (slug)</label>
              <input name="slug" type="text" defaultValue={post.slug} />
            </div>
            <div className="adm-field">
              <label>Datum</label>
              <input name="publishedAt" type="date" defaultValue={dateValue} />
            </div>
          </div>
          <div className="adm-field">
            <label>Korte samenvatting (voor het overzicht)</label>
            <textarea name="excerpt" rows={2} defaultValue={post.excerpt} />
          </div>
          <div className="adm-field">
            <label>Tekst</label>
            <textarea name="body" rows={16} defaultValue={post.body} />
            <span className="help">
              Lege regel = nieuwe alinea. Begin een regel met &quot;## &quot; voor een tussenkop, of &quot;- &quot; voor
              een opsomming.
            </span>
          </div>
          <FormImageField name="coverUrl" label="Omslagfoto (optioneel)" defaultValue={post.coverUrl} />
          <label className="adm-check">
            <input type="checkbox" name="visible" defaultChecked={post.visible} /> Gepubliceerd (zichtbaar op de site)
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="adm-btn" type="submit">Opslaan</button>
            <ConfirmButton className="adm-btn warn" message="Dit bericht definitief verwijderen?" formAction={deleteBlogPost}>
              Verwijderen
            </ConfirmButton>
          </div>
        </form>
      </div>
    </>
  );
}
