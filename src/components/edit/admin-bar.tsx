import { publishAll } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

// Slanke beheerbalk onderaan voor ingelogde beheerders (buiten bewerkmodus):
// status links, acties rechts. Toont hoeveel conceptwijzigingen klaarstaan.
export function AdminBar({
  path,
  editHref,
  editLabel,
  pending,
  published,
}: {
  path: string;
  editHref: string;
  editLabel: string;
  pending: number;
  published?: boolean;
}) {
  return (
    <div className="eb-adminbar">
      <span className="eb-adminbar-status">
        <span className="eb-dot" aria-hidden="true"></span>
        {published
          ? "Wijzigingen gepubliceerd"
          : pending > 0
            ? `${pending} ${pending === 1 ? "wijziging" : "wijzigingen"} in concept, nog niet zichtbaar voor bezoekers`
            : "Ingelogd als beheerder"}
      </span>
      <span className="eb-adminbar-actions">
        <a className="eb-adminbar-link" href="/admin">Beheer</a>
        {pending > 0 && (
          <>
            <a className="eb-adminbar-link" href={`${path}?voorvertoning=1`}>Voorvertoning</a>
            <form action={publishAll} style={{ display: "contents" }}>
              <input type="hidden" name="returnTo" value={path} />
              <ConfirmButton
                className="eb-adminbar-pub"
                message={`${pending} ${pending === 1 ? "wijziging" : "wijzigingen"} publiceren? Bezoekers zien het daarna direct.`}
              >
                Publiceer ({pending})
              </ConfirmButton>
            </form>
          </>
        )}
        <a className="eb-adminbar-cta" href={editHref}>{editLabel}</a>
      </span>
    </div>
  );
}

// Balk in voorvertoning-stand: je kijkt naar het concept zoals het na
// publicatie wordt; bezoekers zien dit nog niet.
export function PreviewBar({ path, pending }: { path: string; pending: number }) {
  return (
    <div className="eb-adminbar eb-preview">
      <span className="eb-adminbar-status">
        <span className="eb-dot eb-dot-orange" aria-hidden="true"></span>
        Voorvertoning: zo wordt de site na publicatie ({pending}{" "}
        {pending === 1 ? "wijziging" : "wijzigingen"})
      </span>
      <span className="eb-adminbar-actions">
        <a className="eb-adminbar-link" href={path}>Bekijk live versie</a>
        <a className="eb-adminbar-link" href={`${path}?bewerken=1`}>Verder bewerken</a>
        <form action={publishAll} style={{ display: "contents" }}>
          <input type="hidden" name="returnTo" value={path} />
          <ConfirmButton
            className="eb-adminbar-pub"
            message="Alle conceptwijzigingen publiceren? Bezoekers zien het daarna direct."
          >
            Publiceer ({pending})
          </ConfirmButton>
        </form>
      </span>
    </div>
  );
}
