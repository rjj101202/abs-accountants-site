import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return new NextResponse("Niet ingelogd", { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return new NextResponse("Geen bestand ontvangen", { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return new NextResponse("Bestand is groter dan 8 MB", { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return new NextResponse("Alleen afbeeldingen zijn toegestaan", { status: 400 });
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const blob = await put(`uploads/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return NextResponse.json({ url: blob.url });
}
