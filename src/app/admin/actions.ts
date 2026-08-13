"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, asc, eq, sql } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db, pages, blocks, teamMembers, blogPosts, settings, messages } from "@/db";
import { requireAdmin, checkPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { BLOCK_TYPES, DEFAULT_BLOCK_DATA } from "@/lib/blocks";

function bust() {
  // Alle publieke pagina's zijn dynamisch; dit ruimt eventuele router-cache op.
  revalidatePath("/", "layout");
}

// ---------- inloggen ----------

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    redirect("/admin/login?fout=1");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  redirect("/admin");
}

export async function logout() {
  await requireAdmin();
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- pagina's ----------

function cleanSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createPage(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "Nieuwe pagina";
  const slug = cleanSlug(String(formData.get("slug") ?? "")) || cleanSlug(title);
  const max = await db.select({ m: sql<number>`coalesce(max(${pages.sort}),0)` }).from(pages);
  const [row] = await db
    .insert(pages)
    .values({ title, slug, sort: (max[0]?.m ?? 0) + 1 })
    .returning();
  bust();
  redirect(`/admin/paginas/${row.id}`);
}

export async function updatePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const navLabel = String(formData.get("navLabel") ?? "").trim();
  const current = (await db.select().from(pages).where(eq(pages.id, id)))[0];
  let slug = cleanSlug(String(formData.get("slug") ?? ""));
  // Alleen de homepage mag een leeg adres hebben; val anders terug op het oude.
  if (slug === "" && current && current.slug !== "") slug = current.slug;
  await db
    .update(pages)
    .set({
      title: title || "Zonder titel",
      navLabel: navLabel || null,
      slug,
      inNav: formData.get("inNav") === "on",
      visible: formData.get("visible") === "on",
    })
    .where(eq(pages.id, id));
  bust();
  redirect(`/admin/paginas/${id}?ok=1`);
}

export async function deletePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const page = (await db.select().from(pages).where(eq(pages.id, id)))[0];
  if (page?.slug === "") redirect(`/admin/paginas/${id}?fout=homepage`);
  await db.delete(pages).where(eq(pages.id, id));
  bust();
  redirect("/admin/paginas");
}

export async function movePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const dir = String(formData.get("dir"));
  await swapSort(pages, id, dir === "up");
  bust();
  redirect("/admin/paginas");
}

// Wissel de sort-waarde met de buurman erboven/eronder.
async function swapSort(
  table: typeof pages | typeof blocks | typeof teamMembers,
  id: number,
  up: boolean,
  scope?: { pageId: number },
) {
  const rows = await db
    .select()
    .from(table as typeof pages)
    .orderBy(asc((table as typeof pages).sort), asc((table as typeof pages).id));
  const inScope = scope
    ? (rows as Array<{ id: number; sort: number; pageId?: number }>).filter((r) => r.pageId === scope.pageId)
    : (rows as Array<{ id: number; sort: number }>);
  const idx = inScope.findIndex((r) => r.id === id);
  const other = up ? inScope[idx - 1] : inScope[idx + 1];
  if (idx < 0 || !other) return;
  const cur = inScope[idx];
  // Bij gelijke sorts eerst hernummeren, anders heeft wisselen geen effect.
  if (cur.sort === other.sort) {
    for (let i = 0; i < inScope.length; i++) {
      await db.update(table as typeof pages).set({ sort: i + 1 }).where(eq((table as typeof pages).id, inScope[i].id));
      inScope[i].sort = i + 1;
    }
  }
  await db.update(table as typeof pages).set({ sort: other.sort }).where(eq((table as typeof pages).id, cur.id));
  await db.update(table as typeof pages).set({ sort: cur.sort }).where(eq((table as typeof pages).id, other.id));
}

// ---------- blokken ----------

// "returnTo" (padded pad van de publieke pagina) stuurt na een blok-actie
// terug naar de bewerkmodus op de site zelf i.p.v. naar /admin.
function editReturn(formData: FormData): string | null {
  const r = String(formData.get("returnTo") ?? "");
  return r.startsWith("/") && !r.includes("//") ? r : null;
}

export async function createBlock(formData: FormData) {
  await requireAdmin();
  const pageId = Number(formData.get("pageId"));
  const type = String(formData.get("type"));
  const returnTo = editReturn(formData);
  if (!BLOCK_TYPES[type]) redirect(returnTo ? `${returnTo}?bewerken=1` : `/admin/paginas/${pageId}`);
  const afterSortRaw = formData.get("afterSort");
  let sort: number;
  if (afterSortRaw !== null && afterSortRaw !== "") {
    // Invoegen direct ná een bestaand blok: schuif alles erachter één op.
    const afterSort = Number(afterSortRaw);
    await db
      .update(blocks)
      .set({ sort: sql`${blocks.sort} + 1` })
      .where(and(eq(blocks.pageId, pageId), sql`${blocks.sort} > ${afterSort}`));
    sort = afterSort + 1;
  } else {
    const max = await db
      .select({ m: sql<number>`coalesce(max(${blocks.sort}),0)` })
      .from(blocks)
      .where(eq(blocks.pageId, pageId));
    sort = (max[0]?.m ?? 0) + 1;
  }
  const [row] = await db
    .insert(blocks)
    .values({ pageId, type, data: DEFAULT_BLOCK_DATA[type] ?? {}, sort })
    .returning();
  bust();
  // Alleen het vrije HTML-blok heeft het formulier-paneel nodig; alle andere
  // blokken zijn direct op de pagina zelf te bewerken.
  const panel = type === "html" ? `&blok=${row.id}` : "";
  redirect(returnTo ? `${returnTo}?bewerken=1${panel}` : `/admin/paginas/${pageId}/blok/${row.id}`);
}

export async function saveBlock(pageId: number, blockId: number, data: Record<string, unknown>) {
  await requireAdmin();
  await db.update(blocks).set({ data }).where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)));
  bust();
}

export async function deleteBlock(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const pageId = Number(formData.get("pageId"));
  const returnTo = editReturn(formData);
  await db.delete(blocks).where(eq(blocks.id, id));
  bust();
  redirect(returnTo ? `${returnTo}?bewerken=1` : `/admin/paginas/${pageId}`);
}

export async function toggleBlock(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const pageId = Number(formData.get("pageId"));
  const returnTo = editReturn(formData);
  const row = (await db.select().from(blocks).where(eq(blocks.id, id)))[0];
  if (row) await db.update(blocks).set({ visible: !row.visible }).where(eq(blocks.id, id));
  bust();
  redirect(returnTo ? `${returnTo}?bewerken=1` : `/admin/paginas/${pageId}`);
}

export async function moveBlock(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const pageId = Number(formData.get("pageId"));
  const dir = String(formData.get("dir"));
  const returnTo = editReturn(formData);
  await swapSort(blocks, id, dir === "up", { pageId });
  bust();
  redirect(returnTo ? `${returnTo}?bewerken=1` : `/admin/paginas/${pageId}`);
}

// ---------- inline bewerken op de site zelf ----------

const MEMBER_FIELDS = new Set(["name", "role", "bio", "photoUrl"]);

export type InlineEdits = {
  blocks: { id: number; pageId: number; data: Record<string, unknown> }[];
  members: { id: number; field: string; value: string }[];
};

export async function saveInlineEdits(edits: InlineEdits) {
  await requireAdmin();
  for (const b of edits.blocks) {
    await db
      .update(blocks)
      .set({ data: b.data })
      .where(and(eq(blocks.id, b.id), eq(blocks.pageId, b.pageId)));
  }
  for (const m of edits.members) {
    if (!MEMBER_FIELDS.has(m.field)) continue;
    await db
      .update(teamMembers)
      .set({ [m.field]: m.value.slice(0, 5000) })
      .where(eq(teamMembers.id, m.id));
  }
  bust();
}

// ---------- team ----------

export async function saveTeamMember(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const values = {
    name: String(formData.get("name") ?? "").trim() || "Naam",
    role: String(formData.get("role") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    photoUrl: String(formData.get("photoUrl") ?? "").trim(),
    visible: formData.get("visible") === "on",
  };
  if (id) {
    await db.update(teamMembers).set(values).where(eq(teamMembers.id, id));
  } else {
    const max = await db.select({ m: sql<number>`coalesce(max(${teamMembers.sort}),0)` }).from(teamMembers);
    await db.insert(teamMembers).values({ ...values, sort: (max[0]?.m ?? 0) + 1 });
  }
  bust();
  redirect("/admin/team?ok=1");
}

export async function deleteTeamMember(formData: FormData) {
  await requireAdmin();
  await db.delete(teamMembers).where(eq(teamMembers.id, Number(formData.get("id"))));
  bust();
  redirect("/admin/team");
}

export async function moveTeamMember(formData: FormData) {
  await requireAdmin();
  await swapSort(teamMembers, Number(formData.get("id")), String(formData.get("dir")) === "up");
  bust();
  redirect("/admin/team");
}

// ---------- blog ----------

export async function createBlogPost(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "Nieuw bericht";
  let slug = cleanSlug(title) || "bericht";
  const clash = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  if (clash.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
  const [row] = await db.insert(blogPosts).values({ title, slug, visible: false }).returning();
  bust();
  redirect(`/admin/blog/${row.id}`);
}

export async function updateBlogPost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const publishedRaw = String(formData.get("publishedAt") ?? "").trim();
  await db
    .update(blogPosts)
    .set({
      title: String(formData.get("title") ?? "").trim() || "Zonder titel",
      slug: cleanSlug(String(formData.get("slug") ?? "")) || `bericht-${id}`,
      excerpt: String(formData.get("excerpt") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      coverUrl: String(formData.get("coverUrl") ?? "").trim(),
      publishedAt: publishedRaw ? new Date(publishedRaw) : new Date(),
      visible: formData.get("visible") === "on",
    })
    .where(eq(blogPosts.id, id));
  bust();
  redirect(`/admin/blog/${id}?ok=1`);
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();
  await db.delete(blogPosts).where(eq(blogPosts.id, Number(formData.get("id"))));
  bust();
  redirect("/admin/blog");
}

// ---------- instellingen ----------

const SETTING_KEYS = [
  "siteName",
  "tagline",
  "logoUrl",
  "phone",
  "email",
  "address",
  "postal",
  "kvk",
  "btw",
  "footerText",
] as const;

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  for (const key of SETTING_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  bust();
  redirect("/admin/instellingen?ok=1");
}

// ---------- berichten ----------

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  redirect("/admin/berichten");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, Number(formData.get("id"))));
  redirect("/admin/berichten");
}

// ---------- afbeeldingen ----------

export async function deleteImage(formData: FormData) {
  await requireAdmin();
  const url = String(formData.get("url") ?? "");
  if (url) await del(url);
  redirect("/admin/afbeeldingen");
}
