"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function UploadButton() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastUrl, setLastUrl] = useState("");
  const router = useRouter();

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) throw new Error(await res.text());
      const { url } = (await res.json()) as { url: string };
      setLastUrl(url);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="adm-btn" type="button" disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? "Bezig met uploaden…" : "Afbeelding uploaden"}
      </button>
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
      {error && <p style={{ color: "#a33333", fontSize: ".88rem", marginTop: 8 }}>{error}</p>}
      {lastUrl && (
        <p style={{ fontSize: ".85rem", marginTop: 8, wordBreak: "break-all" }}>
          Geüpload: <code>{lastUrl}</code>
        </p>
      )}
    </div>
  );
}
