import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const metadata = { title: "Beheer | ABS Accountants" };

const NAV = [
  { href: "/admin", label: "Overzicht" },
  { href: "/admin/paginas", label: "Pagina's" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/blog", label: "Blog / actueel" },
  { href: "/admin/afbeeldingen", label: "Afbeeldingen" },
  { href: "/admin/berichten", label: "Berichten" },
  { href: "/admin/instellingen", label: "Instellingen" },
];

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm">
      <aside className="adm-side">
        <span className="brand">ABS · Beheer</span>
        <Link className="adm-editsite" href="/?bewerken=1">
          Site bewerken
        </Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}>
            {n.label}
          </Link>
        ))}
        <div className="sep"></div>
        <Link href="/" target="_blank">
          Bekijk de site ↗
        </Link>
        <form action={logout}>
          <button
            type="submit"
            style={{
              all: "unset",
              display: "block",
              padding: "11px 22px",
              color: "#9fb2cc",
              fontSize: ".95rem",
              cursor: "pointer",
            }}
          >
            Uitloggen
          </button>
        </form>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
