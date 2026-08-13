import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, pages } from "@/db";
import { getSettings } from "@/lib/settings";
import { Analytics } from "@/components/analytics";
import { CookieBanner } from "@/components/cookie-banner";

export async function getNavPages() {
  return db
    .select()
    .from(pages)
    .where(eq(pages.visible, true))
    .orderBy(asc(pages.sort), asc(pages.id));
}

function pageHref(slug: string) {
  return slug === "" ? "/" : `/${slug}`;
}

export async function SiteHeader() {
  const [nav, s] = await Promise.all([getNavPages(), getSettings()]);
  const items = nav.filter((p) => p.inNav);
  const last = items[items.length - 1];
  return (
    <header className="nm-hd">
      <div className="nm-wrap">
        <div className="nm-bar">
          <Link className="nm-logo" href="/">
            {s.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={s.logoUrl} alt={s.siteName} />
            ) : (
              <span className="nm-logo-text">{s.siteName}</span>
            )}
          </Link>
          <input type="checkbox" id="nmnav" className="nm-tgl" />
          <label className="nm-burger" htmlFor="nmnav" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </label>
          <nav className="nm-nav">
            {items.map((p) => (
              <Link key={p.id} className={p.id === last?.id ? "cta" : ""} href={pageHref(p.slug)}>
                {p.navLabel || p.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const [nav, s] = await Promise.all([getNavPages(), getSettings()]);
  return (
    <footer className="nm-ft">
      <div className="nm-wrap">
        <div className="nm-ft-in">
          <div>
            {s.logoUrl ? (
              <span className="nm-ft-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logoUrl} alt={s.siteName} />
              </span>
            ) : (
              <span className="nm-logo-text" style={{ color: "#fff" }}>{s.siteName}</span>
            )}
            <p className="lead">{s.footerText}</p>
            <small>
              KvK {s.kvk} &middot; BTW {s.btw}
            </small>
          </div>
          <div>
            <h4>Pagina&apos;s</h4>
            {nav.map((p) => (
              <Link key={p.id} href={pageHref(p.slug)}>
                {p.navLabel || p.title}
              </Link>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <span style={{ display: "block", padding: "5px 0", color: "#9fb2cc" }}>{s.address}</span>
            <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a>
            <a href={`mailto:${s.email}`}>{s.email}</a>
            {s.postal ? <small>{s.postal}</small> : null}
          </div>
          <div>
            <h4>Openingstijden</h4>
            <small style={{ marginTop: 0 }}>
              Bel of mail ons gerust; we reageren snel. Een afspraak op kantoor is zo gemaakt.
            </small>
          </div>
        </div>
        <div className="nm-ft-bot">
          <span>&copy; {s.siteName}</span>
          <span>Website door Novae Media</span>
        </div>
      </div>
      <Analytics />
      <CookieBanner />
    </footer>
  );
}
