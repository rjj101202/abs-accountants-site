import Link from "next/link";
import { moveBlock, toggleBlock, deleteBlock, createBlock } from "@/app/admin/actions";
import { BLOCK_TYPES } from "@/lib/blocks";
import { ConfirmButton } from "@/components/admin/confirm-button";

// Bloktypes met een instelbare witte/beige achtergrond.
const ALT_TYPES = new Set(["text", "cards", "split", "cta", "team", "blog", "contactInfo", "contactForm", "image"]);

// Zwevende knoppenbalk per blok, alleen zichtbaar in bewerkmodus op de site.
export function BlockToolbar({
  blockId,
  pageId,
  path,
  label,
  type,
  visible,
  first,
  last,
}: {
  blockId: number;
  pageId: number;
  path: string;
  label: string;
  type: string;
  visible: boolean;
  first: boolean;
  last: boolean;
}) {
  const hidden = (
    <>
      <input type="hidden" name="id" value={blockId} />
      <input type="hidden" name="pageId" value={pageId} />
      <input type="hidden" name="returnTo" value={path} />
    </>
  );
  return (
    <div className="eb-bar">
      <span className="eb-label">{label}</span>
      <form action={moveBlock}>
        {hidden}
        <input type="hidden" name="dir" value="up" />
        <button className="eb-btn" disabled={first} title="Omhoog verplaatsen" type="submit">↑</button>
      </form>
      <form action={moveBlock}>
        {hidden}
        <input type="hidden" name="dir" value="down" />
        <button className="eb-btn" disabled={last} title="Omlaag verplaatsen" type="submit">↓</button>
      </form>
      <button className="eb-btn eb-txt" type="button" data-op="change-type" title="Dit blok omzetten naar een andere vormgeving">
        Vormgeving
      </button>
      {ALT_TYPES.has(type) && (
        <button className="eb-btn eb-txt" type="button" data-op="toggle-alt" title="Wissel tussen witte en beige achtergrond">
          Achtergrond
        </button>
      )}
      <form action={toggleBlock}>
        {hidden}
        <button className="eb-btn eb-txt" type="submit" title="Voor bezoekers verbergen of tonen">
          {visible ? "Verberg" : "Toon"}
        </button>
      </form>
      {type === "html" && (
        <Link className="eb-btn eb-txt" title="HTML bewerken" href={`${path}?bewerken=1&blok=${blockId}`}>
          HTML
        </Link>
      )}
      <form action={deleteBlock}>
        {hidden}
        <ConfirmButton className="eb-btn eb-txt eb-del" message="Dit hele blok verwijderen? (Definitief zodra je publiceert.)">
          Verwijder
        </ConfirmButton>
      </form>
    </div>
  );
}

// "+ Blok"-knop tussen twee secties: kies een soort en hij verschijnt op die plek.
export function AddBlockButton({ pageId, path, afterSort }: { pageId: number; path: string; afterSort: number }) {
  return (
    <form className="eb-add" action={createBlock}>
      <input type="hidden" name="pageId" value={pageId} />
      <input type="hidden" name="returnTo" value={path} />
      <input type="hidden" name="afterSort" value={afterSort} />
      <select name="type" defaultValue="text" aria-label="Soort blok">
        {Object.entries(BLOCK_TYPES).map(([key, def]) => (
          <option key={key} value={key}>
            {def.label}
          </option>
        ))}
      </select>
      <button type="submit">+ Blok toevoegen</button>
    </form>
  );
}
