import { NextRequest, NextResponse } from "next/server";

// Eerste verdedigingslinie voor /admin. De echte HMAC-controle gebeurt in
// requireAdmin() (Node runtime); hier controleren we hetzelfde token met
// Web Crypto zodat niet-ingelogde bezoekers direct worden omgeleid.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }
  const token = req.cookies.get("abs_admin")?.value;
  if (await verify(token)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

async function verify(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.ADMIN_PASSWORD),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(exp));
  let bin = "";
  for (const byte of new Uint8Array(mac)) bin += String.fromCharCode(byte);
  const expected = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return expected === sig;
}

export const config = { matcher: ["/admin/:path*"] };
