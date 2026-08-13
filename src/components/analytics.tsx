"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Meet elke paginaweergave via een beacon naar /api/stats. Geen cookies,
// geen persoonsgegevens; de server telt anoniem (dag-hash).
export function Analytics() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    const payload = JSON.stringify({ path: pathname, ref: document.referrer });
    try {
      if (!navigator.sendBeacon?.("/api/stats", new Blob([payload], { type: "application/json" }))) {
        void fetch("/api/stats", { method: "POST", body: payload, keepalive: true });
      }
    } catch {
      // statistiek mag nooit de site breken
    }
  }, [pathname]);

  return null;
}
