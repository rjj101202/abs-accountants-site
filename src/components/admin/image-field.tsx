"use client";

import { useRef, useState } from "react";

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) throw new Error(await res.text());
      const { url } = (await res.json()) as { url: string };
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={value}
          placeholder="https://… of upload een bestand"
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="adm-btn sec sm" type="button" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? "Bezig…" : "Upload"}
        </button>
        {value && (
          <button className="adm-btn warn sm" type="button" onClick={() => onChange("")}>
            ✕
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
      {error && <span className="help" style={{ color: "#a33333" }}>{error}</span>}
      {value ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className="adm-img-prev" src={value} alt="" style={{ marginTop: 6, alignSelf: "start" }} />
      ) : null}
    </div>
  );
}
