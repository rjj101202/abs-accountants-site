import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, pages, blocks } from "@/db";
import { BLOCK_TYPES } from "@/lib/blocks";
import { saveBlock } from "../../../../../actions";
import { BlockForm } from "@/components/admin/block-form";

export const dynamic = "force-dynamic";

export default async function BlockEditor({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>;
}) {
  const { id, blockId } = await params;
  const page = (await db.select().from(pages).where(eq(pages.id, Number(id))))[0];
  const block = (
    await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, Number(blockId)), eq(blocks.pageId, Number(id))))
  )[0];
  if (!page || !block) notFound();
  const def = BLOCK_TYPES[block.type];
  if (!def) notFound();

  return (
    <>
      <p>
        <Link href={`/admin/paginas/${page.id}`} style={{ color: "var(--muted)", fontSize: ".88rem" }}>
          &larr; Terug naar {page.title}
        </Link>
      </p>
      <h1>{def.label}</h1>
      <p className="adm-sub">{def.description}</p>
      <div className="adm-card">
        <BlockForm
          pageId={page.id}
          blockId={block.id}
          fields={def.fields}
          initialData={(block.draftData ?? block.data) as Record<string, unknown>}
          save={saveBlock}
        />
      </div>
    </>
  );
}
