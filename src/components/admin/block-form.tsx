"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef } from "@/lib/blocks";
import { ImageField } from "./image-field";

type Data = Record<string, unknown>;

export function BlockForm({
  pageId,
  blockId,
  fields,
  initialData,
  save,
}: {
  pageId: number;
  blockId: number;
  fields: FieldDef[];
  initialData: Data;
  save: (pageId: number, blockId: number, data: Data) => Promise<void>;
}) {
  const [data, setData] = useState<Data>(initialData);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set(key: string, value: unknown) {
    setSaved(false);
    setData((d) => ({ ...d, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      await save(pageId, blockId, data);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div>
      {fields.map((f) => (
        <Field key={f.key} def={f} value={data[f.key]} onChange={(v) => set(f.key, v)} />
      ))}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        <button className="adm-btn" onClick={onSave} disabled={pending} type="button">
          {pending ? "Opslaan…" : "Opslaan"}
        </button>
        <button className="adm-btn sec" type="button" onClick={() => router.push(`/admin/paginas/${pageId}`)}>
          Terug naar de pagina
        </button>
        {saved && <span style={{ color: "#295c29", fontWeight: 600, fontSize: ".9rem" }}>Opgeslagen ✓</span>}
      </div>
    </div>
  );
}

function Field({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${def.key}`;
  switch (def.type) {
    case "text":
      return (
        <div className="adm-field">
          <label htmlFor={id}>{def.label}</label>
          <input id={id} type="text" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          {def.help && <span className="help">{def.help}</span>}
        </div>
      );
    case "textarea":
      return (
        <div className="adm-field">
          <label htmlFor={id}>{def.label}</label>
          <textarea id={id} rows={6} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          {def.help && <span className="help">{def.help}</span>}
        </div>
      );
    case "select":
      return (
        <div className="adm-field">
          <label htmlFor={id}>{def.label}</label>
          <select id={id} value={(value as string) ?? def.options?.[0]?.value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {def.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "checkbox":
      return (
        <label className="adm-check">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {def.label}
        </label>
      );
    case "image":
      return <ImageField label={def.label} value={(value as string) ?? ""} onChange={onChange} />;
    case "list": {
      const items = Array.isArray(value) ? (value as Data[]) : [];
      const move = (i: number, d: number) => {
        const next = [...items];
        const [it] = next.splice(i, 1);
        next.splice(i + d, 0, it);
        onChange(next);
      };
      return (
        <div className="adm-field">
          <label>{def.label}</label>
          {items.map((item, i) => (
            <div className="adm-list-item" key={i}>
              <div className="adm-list-head">
                <span>
                  {def.itemLabel ?? "Item"} {i + 1}
                </span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button className="adm-btn sec sm" type="button" disabled={i === 0} onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button
                    className="adm-btn sec sm"
                    type="button"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className="adm-btn warn sm"
                    type="button"
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </span>
              </div>
              {def.itemFields?.map((sub) => (
                <Field
                  key={sub.key}
                  def={sub}
                  value={item[sub.key]}
                  onChange={(v) => {
                    const next = [...items];
                    next[i] = { ...next[i], [sub.key]: v };
                    onChange(next);
                  }}
                />
              ))}
            </div>
          ))}
          <div>
            <button className="adm-btn sec sm" type="button" onClick={() => onChange([...items, {}])}>
              + {def.itemLabel ?? "Item"} toevoegen
            </button>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}
