// Slanke beheerbalk onderaan voor ingelogde beheerders (buiten bewerkmodus),
// naar het voorbeeld van gangbare CMS'en: status links, acties rechts.
export function AdminBar({ editHref, editLabel }: { editHref: string; editLabel: string }) {
  return (
    <div className="eb-adminbar">
      <span className="eb-adminbar-status">
        <span className="eb-dot" aria-hidden="true"></span>
        Ingelogd als beheerder
      </span>
      <span className="eb-adminbar-actions">
        <a className="eb-adminbar-link" href="/admin">Beheer</a>
        <a className="eb-adminbar-cta" href={editHref}>{editLabel}</a>
      </span>
    </div>
  );
}
