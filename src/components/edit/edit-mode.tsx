"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishAllNow, discardDraftsNow, changeBlockTypeNow, type InlineEdits } from "@/app/admin/actions";
import { ICON_OPTIONS, BLOCK_TYPES } from "@/lib/blocks";
import { Icon } from "@/components/icons";

type Data = Record<string, unknown>;
type BlockEdit = { id: number; pageId: number; data: Data };

// Popover-context voor icoonkiezer, link-editor en vormgeving-kiezer.
type Popover =
  | { kind: "icon"; wrap: HTMLElement; field: string; index: number; x: number; y: number }
  | { kind: "type"; wrap: HTMLElement; x: number; y: number }
  | {
      kind: "link";
      wrap: HTMLElement;
      field?: string;
      index?: number;
      singleField?: string;
      href: string;
      style: string;
      x: number;
      y: number;
    };

// Client-kant van de bewerkmodus: inline tekst bewerken, plus alle
// structurele acties (verwijderen/toevoegen/afbeeldingen/iconen/links)
// rechtstreeks op de pagina via [data-op]-knopjes.
export function EditMode({
  path,
  save,
  pending: pendingDrafts,
}: {
  path: string;
  save: (edits: InlineEdits) => Promise<void>;
  pending: number;
}) {
  const [dirty, setDirty] = useState(0);
  const dirtyBlocks = useRef(new Set<HTMLElement>());
  const dirtyMembers = useRef(new Map<string, string>());
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const [popover, setPopover] = useState<Popover | null>(null);
  const [textX, setTextX] = useState<{ el: HTMLElement; x: number; y: number } | null>(null);
  const fileTarget = useRef<{ wrap: HTMLElement; field: string } | { memberId: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function markDirty(target: HTMLElement) {
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

  useEffect(() => {
    function onInput(e: Event) {
      const el = e.target as HTMLElement;
      const target = el.closest?.("[data-edit]") as HTMLElement | null;
      if (target) markDirty(target);
    }
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement;
      // Knoplabels met data-edit mogen tijdens het bewerken niet navigeren.
      const a = t.closest?.("a[data-edit]");
      if (a) e.preventDefault();
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyBlocks.current.size + dirtyMembers.current.size > 0) e.preventDefault();
    }
    // Zweef-kruisje bij elk bewerkbaar tekstelement om het leeg te maken.
    function onMouseOver(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest?.(".eb-floatx")) return;
      const el = t.closest?.("[data-edit]") as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setTextX({ el, x: Math.min(r.right - 8, window.innerWidth - 30), y: Math.max(4, r.top - 10) });
      } else {
        setTextX(null);
      }
    }
    function onScroll() {
      setTextX(null);
    }
    document.addEventListener("input", onInput, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseover", onMouseOver, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseover", onMouseOver, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // Aparte listener voor de op-knopjes (verwijderen, toevoegen, enz.).
  useEffect(() => {
    function onOpClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest?.("[data-op]") as HTMLElement | null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const op = btn.getAttribute("data-op")!;
      const wrap = btn.closest("[data-block-id]") as HTMLElement | null;
      const field = btn.getAttribute("data-field") ?? "";
      const index = Number(btn.getAttribute("data-index") ?? -1);

      if (op === "member-photo") {
        fileTarget.current = { memberId: Number(btn.getAttribute("data-member")) };
        fileRef.current?.click();
        return;
      }
      if (!wrap) return;

      switch (op) {
        case "remove-item":
          if (!window.confirm("Dit onderdeel verwijderen?")) return;
          mutateAndSave(wrap, (d) => {
            const arr = d[field];
            if (Array.isArray(arr)) arr.splice(index, 1);
          });
          break;
        case "add-item":
          mutateAndSave(wrap, (d) => {
            const def = JSON.parse(btn.getAttribute("data-default") ?? "{}") as Data;
            const arr = Array.isArray(d[field]) ? (d[field] as Data[]) : [];
            arr.push(def);
            d[field] = arr;
          });
          break;
        case "set-columns":
          mutateAndSave(wrap, (d) => {
            d.columns = btn.getAttribute("data-value") ?? "2";
          });
          break;
        case "toggle-alt":
          mutateAndSave(wrap, (d) => {
            d.alt = !d.alt;
          });
          break;
        case "set-image":
          fileTarget.current = { wrap, field };
          fileRef.current?.click();
          break;
        case "clear-image":
          if (!window.confirm("Afbeelding weghalen?")) return;
          mutateAndSave(wrap, (d) => {
            d[field] = "";
          });
          break;
        case "pick-icon": {
          const r = btn.getBoundingClientRect();
          setPopover({ kind: "icon", wrap, field, index, x: r.left, y: r.bottom + 6 });
          break;
        }
        case "change-type": {
          const r = btn.getBoundingClientRect();
          setPopover({ kind: "type", wrap, x: Math.max(12, r.right - 300), y: r.bottom + 6 });
          break;
        }
        case "edit-link": {
          const r = btn.getBoundingClientRect();
          const data = JSON.parse(wrap.getAttribute("data-block-json") ?? "{}") as Data;
          const singleField = btn.getAttribute("data-single-field") ?? undefined;
          let href = "";
          let style = "solid";
          if (singleField) {
            href = String(data[singleField] ?? "");
          } else {
            const arr = data[field] as Data[] | undefined;
            href = String(arr?.[index]?.href ?? "");
            style = String(arr?.[index]?.style ?? "solid");
          }
          setPopover({ kind: "link", wrap, field, index, singleField, href, style, x: r.left, y: r.bottom + 6 });
          break;
        }
      }
    }
    document.addEventListener("click", onOpClick, true);
    return () => document.removeEventListener("click", onOpClick, true);
  }, []);

  function collectBlock(wrap: HTMLElement): BlockEdit {
    const data = JSON.parse(wrap.getAttribute("data-block-json") ?? "{}") as Data;
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
          (arr[Number(idxRaw)] as Data)[sub] = text;
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

  function collectMembers() {
    return Array.from(dirtyMembers.current.entries()).map(([spec, value]) => {
      const [, id, f] = spec.split(":");
      return { id: Number(id), field: f, value };
    });
  }

  // Voert een structurele wijziging uit en bewaart daarbij ook alle nog
  // niet opgeslagen tekstwijzigingen (die staan immers in de DOM).
  function mutateAndSave(wrap: HTMLElement, mutate: (data: Data) => void, extraMembers?: InlineEdits["members"]) {
    const wraps = new Set(dirtyBlocks.current);
    if (wrap) wraps.add(wrap);
    const blocks = Array.from(wraps).map(collectBlock);
    if (wrap) {
      const target = blocks.find((b) => b.id === Number(wrap.getAttribute("data-block-id")));
      if (target) mutate(target.data);
    }
    const members = [...collectMembers(), ...(extraMembers ?? [])];
    startTransition(async () => {
      await save({ blocks, members });
      dirtyBlocks.current.clear();
      dirtyMembers.current.clear();
      setDirty(0);
      setSavedFlash(true);
      setPopover(null);
      router.refresh();
    });
  }

  async function onFileChosen(file: File) {
    const target = fileTarget.current;
    fileTarget.current = null;
    if (!target) return;
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    if (!res.ok) {
      window.alert(`Upload mislukt: ${await res.text()}`);
      return;
    }
    const { url } = (await res.json()) as { url: string };
    if ("memberId" in target) {
      mutateAndSave(null as unknown as HTMLElement, () => undefined, [
        { id: target.memberId, field: "photoUrl", value: url },
      ]);
    } else {
      mutateAndSave(target.wrap, (d) => {
        d[target.field] = url;
      });
    }
  }

  function onSave() {
    const blocks = Array.from(dirtyBlocks.current).map(collectBlock);
    const members = collectMembers();
    startTransition(async () => {
      await save({ blocks, members });
      dirtyBlocks.current.clear();
      dirtyMembers.current.clear();
      setDirty(0);
      setSavedFlash(true);
      router.refresh();
    });
  }

  // Publiceren vanuit de bewerkmodus: eerst openstaande tekstwijzigingen als
  // concept opslaan, daarna alles live zetten.
  function onPublish() {
    if (!window.confirm("Alles publiceren? Bezoekers zien de wijzigingen daarna direct.")) return;
    startTransition(async () => {
      if (dirtyBlocks.current.size + dirtyMembers.current.size > 0) {
        await save({ blocks: Array.from(dirtyBlocks.current).map(collectBlock), members: collectMembers() });
        dirtyBlocks.current.clear();
        dirtyMembers.current.clear();
      }
      await publishAllNow();
      setDirty(0);
      setSavedFlash(false);
      router.refresh();
    });
  }

  function onDiscard() {
    if (!window.confirm("Alle conceptwijzigingen verwerpen en terug naar de gepubliceerde versie?")) return;
    startTransition(async () => {
      await discardDraftsNow();
      dirtyBlocks.current.clear();
      dirtyMembers.current.clear();
      setDirty(0);
      router.refresh();
    });
  }

  const hasWork = pendingDrafts > 0 || dirty > 0;

  return (
    <>
      <div className="eb-savebar">
        <span className="eb-hint">
          {hasWork
            ? `Concept: ${pendingDrafts + dirty} ${pendingDrafts + dirty === 1 ? "wijziging" : "wijzigingen"}, nog niet zichtbaar voor bezoekers.`
            : "Bewerkmodus: klik op teksten om te typen, op iconen of foto's om ze te wisselen."}
        </span>
        <button className="eb-savesec" onClick={onSave} disabled={pending || dirty === 0} type="button">
          {pending ? "Bezig…" : dirty > 0 ? `Concept opslaan (${dirty})` : savedFlash ? "Concept opgeslagen ✓" : "Concept opslaan"}
        </button>
        <button className="eb-save" onClick={onPublish} disabled={pending || !hasWork} type="button">
          Publiceer
        </button>
        {pendingDrafts > 0 && (
          <button className="eb-discard" onClick={onDiscard} disabled={pending} type="button" title="Concept weggooien, terug naar de live versie">
            Verwerp
          </button>
        )}
        <a
          className="eb-done"
          href={path}
          onClick={(e) => {
            if (dirty > 0 && !window.confirm("Je hebt niet-opgeslagen wijzigingen. Toch stoppen?")) e.preventDefault();
          }}
        >
          Klaar
        </a>
        <a className="eb-admin" href="/admin" title="Team, blog, statistieken en instellingen">
          Beheer
        </a>
      </div>

      {textX && (
        <button
          type="button"
          className="eb-op eb-x eb-floatx"
          style={{ left: textX.x, top: textX.y }}
          title="Deze tekst weghalen"
          onClick={() => {
            textX.el.innerText = "";
            markDirty(textX.el);
            setTextX(null);
          }}
        >
          ✕
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFileChosen(f);
          e.target.value = "";
        }}
      />

      {popover && (
        <div className="eb-popover-scrim" onClick={() => setPopover(null)}>
          <div
            className="eb-popover"
            style={{
              left: Math.min(popover.x, typeof window !== "undefined" ? window.innerWidth - 300 : popover.x),
              top: popover.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {popover.kind === "type" ? (
              <>
                <b>Vormgeving van dit blok</b>
                <div className="eb-typelist">
                  {Object.entries(BLOCK_TYPES)
                    .filter(([key]) => key !== "html")
                    .map(([key, def]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const wrap = popover.wrap;
                          startTransition(async () => {
                            // Eventuele tekstwijzigingen in dit blok eerst bewaren.
                            if (dirtyBlocks.current.size + dirtyMembers.current.size > 0) {
                              await save({
                                blocks: Array.from(dirtyBlocks.current).map(collectBlock),
                                members: collectMembers(),
                              });
                              dirtyBlocks.current.clear();
                              dirtyMembers.current.clear();
                              setDirty(0);
                            }
                            await changeBlockTypeNow(
                              Number(wrap.getAttribute("data-page-id")),
                              Number(wrap.getAttribute("data-block-id")),
                              key,
                            );
                            setPopover(null);
                            router.refresh();
                          });
                        }}
                      >
                        <b>{def.label}</b>
                        <span>{def.description}</span>
                      </button>
                    ))}
                </div>
              </>
            ) : popover.kind === "icon" ? (
              <>
                <b>Kies een icoon</b>
                <div className="eb-icongrid">
                  {ICON_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      title={o.label}
                      onClick={() =>
                        mutateAndSave(popover.wrap, (d) => {
                          const arr = d[popover.field];
                          if (Array.isArray(arr) && arr[popover.index]) {
                            (arr[popover.index] as Data).icon = o.value;
                          }
                        })
                      }
                    >
                      <Icon name={o.value} size={22} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <LinkEditor popover={popover} onApply={(href, style) => {
                mutateAndSave(popover.wrap, (d) => {
                  if (popover.singleField) {
                    d[popover.singleField] = href;
                  } else if (popover.field !== undefined && popover.index !== undefined) {
                    const arr = d[popover.field];
                    if (Array.isArray(arr) && arr[popover.index]) {
                      (arr[popover.index] as Data).href = href;
                      (arr[popover.index] as Data).style = style;
                    }
                  }
                });
              }} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function LinkEditor({
  popover,
  onApply,
}: {
  popover: Extract<Popover, { kind: "link" }>;
  onApply: (href: string, style: string) => void;
}) {
  const [href, setHref] = useState(popover.href);
  const [style, setStyle] = useState(popover.style);
  return (
    <>
      <b>Knop aanpassen</b>
      <label className="eb-poplabel">
        Link (bijv. /contact)
        <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/contact" />
      </label>
      {!popover.singleField && (
        <label className="eb-poplabel">
          Stijl
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="solid">Donkerblauw</option>
            <option value="gold">Goud</option>
            <option value="ghost">Omlijnd</option>
          </select>
        </label>
      )}
      <button type="button" className="eb-save" style={{ marginTop: 8 }} onClick={() => onApply(href, style)}>
        Toepassen
      </button>
    </>
  );
}
