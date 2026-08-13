import { list } from "@vercel/blob";
import { deleteImage } from "../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { UploadButton } from "@/components/admin/upload-button";

export const dynamic = "force-dynamic";

export default async function ImagesAdmin() {
  let items: { url: string; pathname: string }[] = [];
  let error = "";
  try {
    const res = await list({ limit: 500 });
    items = res.blobs;
  } catch {
    error = "Kan de afbeeldingenopslag niet bereiken. Controleer of BLOB_READ_WRITE_TOKEN is ingesteld.";
  }
  return (
    <>
      <h1>Afbeeldingen</h1>
      <p className="adm-sub">
        Upload hier afbeeldingen en kopieer de link, of upload direct vanuit een blok- of fotoveld.
      </p>
      {error ? <p className="adm-flash err">{error}</p> : null}
      <div className="adm-card">
        <UploadButton />
      </div>
      <div className="adm-imgs">
        {items.map((b) => (
          <figure key={b.url}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt="" loading="lazy" />
            <figcaption>
              {b.pathname.replace(/^uploads\//, "")}
              <form action={deleteImage} style={{ marginTop: 6 }}>
                <input type="hidden" name="url" value={b.url} />
                <ConfirmButton className="adm-btn warn sm" message="Afbeelding verwijderen? Blokken die hem gebruiken tonen hem daarna niet meer.">
                  Verwijderen
                </ConfirmButton>
              </form>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
