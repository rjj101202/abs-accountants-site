"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InlineEdits } from "@/app/admin/actions";

// Client-kant van de bewerkmodus: maakt de door de server geannoteerde
// [data-edit]-elementen echt bewerkbaar, houdt wijzigingen bij en slaat ze
// per blok/medewerker op via de saveInlineEdits server action.
export function EditMode({
  path,
  save,
}: {
  path: string;
  save: (edits: InlineEdits) => Promise<void>;
}) {
  const [dirty, setDirty] = useState(0);
  const dirtyBlocks = useRef(new Set<HTMLElement>());
  const dirtyMembers = useRef(new Map<string, string>());
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onInput(e: Event) {
      const el = e.target as HTMLElement;
      const target = el.closest?.("[data-edit]") as HTMLElement | null;
      if (!target) return;
      const spec = target.getAttribute("data-edit")!;
      if (spec.startsWith("block:")) {
        const wrap = target.closest("[data-block-id]") as HTMLElement | null;
        if (wrap) dirtyBlocks.current.add(wrap);
      } else if (spec.startsWith("member:")) {
        dirtyMembers.current.set(spec, target.innerText);
      }
      setDirty(dirtyBlocks.current.size + dirtyMembers.current.size);
      setSavedFlash(false);
    }
    // Links met data-edit (knoplabels) mogen tijdens het bewerken niet navigeren.
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest?.("a[data-edit]");
      if (a) e.preventDefault();
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyBlocks.current.size + dirtyMembers.current.size > 0) e.preventDefault();
    }
    document.addEventListener("input", onInput, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  function collectBlock(wrap: HTMLElement): { id: number; pageId: number; data: Record<string, unknown> } {
    const data = JSON.parse(wrap.getAttribute("data-block-json") ?? "{}") as Record<string, unknown>;
    // Alinea-velden (body[0], body[1], …) worden verzameld en weer samengevoegd.
    const paras = new Map<string, Map<number, string>>();
    for (const el of Array.from(wrap.querySelectorAll<HTMLElement>("[data-edit]"))) {
      const spec = el.getAttribute("data-edit")!;
      const m = spec.match(/^block:(\d+):([a-zA-Z]+)(?:\[(\d+)\])?(?:\.([a-zA-Z]+))?$/);
      if (!m || Number(m[1]) !== Number(wrap.getAttribute("data-block-id"))) continue;
      const [, , field, idxRaw, sub] = m;
      const text = el.innerText.trim();
      if (idxRaw === undefined) {
        data[field] = text;
      } else if (sub === undefined) {
        if (!paras.has(field)) paras.set(field, new Map());
        paras.get(field)!.set(Number(idxRaw), text);
      } else {
        const arr = data[field];
        if (Array.isArray(arr) && arr[Number(idxRaw)] && typeof arr[Number(idxRaw)] === "object") {
          (arr[Number(idxRaw)] as Record<string, unknown>)[sub] = text;
        }
      }
    }
    for (const [field, parts] of paras) {
      data[field] = Array.from(parts.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, t]) => t)
        .filter(Boolean)
        .join("\n\n");
    }
    return {
      id: Number(wrap.getAttribute("data-block-id")),
      pageId: Number(wrap.getAttribute("data-page-id")),
      data,
    };
  }

  function onSave() {
    const edits: InlineEdits = {
      blocks: Array.from(dirtyBlocks.current).map(collectBlock),
      members: Array.from(dirtyMembers.current.entries()).map(([spec, value]) => {
        const [, id, field] = spec.split(":");
        return { id: Number(id), field, value };
      }),
    };
    startTransition(async () => {
      await save(edits);
      dirtyBlocks.current.clear();
      dirtyMembers.current.clear();
      setDirty(0);
      setSavedFlash(true);
      router.refresh();
    });
  }

  return (
    <div className="eb-savebar">
      <span className="eb-hint">
        Bewerkmodus: klik op een tekst en typ. Blokken verplaats of verwijder je met de knopjes per blok.
      </span>
      <button className="eb-save" onClick={onSave} disabled={pending || dirty === 0} type="button">
        {pending ? "Opslaan…" : dirty > 0 ? `Opslaan (${dirty})` : savedFlash ? "Opgeslagen ✓" : "Opslaan"}
      </button>
      <a
        className="eb-done"
        href={path}
        onClick={(e) => {
          if (dirty > 0 && !window.confirm("Je hebt niet-opgeslagen wijzigingen. Toch stoppen?")) e.preventDefault();
        }}
      >
        Klaar
      </a>
      <a className="eb-admin" href="/admin" title="Team, blog, instellingen en berichten">
        Beheer
      </a>
    </div>
  );
}
