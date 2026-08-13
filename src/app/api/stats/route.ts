import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db, pageViews } from "@/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|monitor|preview|scan/i;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { path?: string; ref?: string };
    const path = String(body.path ?? "").slice(0, 300);
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: false });
    }
    // Eigen bezoeken van ingelogde beheerders tellen niet mee.
    if (verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
      return NextResponse.json({ ok: false });
    }
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua || BOT_RE.test(ua)) return NextResponse.json({ ok: false });

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    // Dag-hash zoals Plausible: niet herleidbaar tot een persoon en elke dag anders.
    const visitorHash = createHash("sha256").update(`${ip}|${ua}|${day}|abs-stats`).digest("hex").slice(0, 20);

    const device = /mobile|iphone|android(?!.*tablet)/i.test(ua)
      ? "mobiel"
      : /ipad|tablet/i.test(ua)
        ? "tablet"
        : "desktop";

    let referrer = "";
    try {
      const ref = String(body.ref ?? "");
      if (ref) {
        const host = new URL(ref).hostname;
        if (host && host !== req.nextUrl.hostname) referrer = host;
      }
    } catch {
      // ongeldige referrer negeren
    }

    await db.insert(pageViews).values({
      path,
      referrer,
      device,
      country: req.headers.get("x-vercel-ip-country") ?? "",
      visitorHash,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
