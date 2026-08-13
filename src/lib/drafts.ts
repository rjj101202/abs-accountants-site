// Hulpjes voor het concept/publiceer-model van blokken.
import type { blocks } from "@/db/schema";

export type BlockRow = typeof blocks.$inferSelect;

export function blockHasDraft(b: BlockRow): boolean {
  return b.draftData !== null || b.draftSort !== null || b.draftVisible !== null || b.draftDeleted || b.isNew;
}

// De concept-staat zoals beheerders die zien (en die publicatie live zet).
export function effectiveBlock(b: BlockRow) {
  return {
    ...b,
    data: (b.draftData ?? b.data) as Record<string, unknown>,
    sort: b.draftSort ?? b.sort,
    visible: b.draftVisible ?? b.visible,
  };
}
