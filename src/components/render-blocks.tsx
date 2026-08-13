import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db, teamMembers, blogPosts } from "@/db";
import { getSettings } from "@/lib/settings";
import { Icon } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";
import { ItemX, AddItem, IconBtn, LinkOp, ImageOps } from "@/components/edit/ops";

type Data = Record<string, unknown>;
type Btn = { label?: string; href?: string; style?: string };
type Item = { icon?: string; title?: string; text?: string };
// Props die een element inline bewerkbaar maken (data-edit + contentEditable).
type EditAt = (path: string) => Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v : "");
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const noEdit: EditAt = () => ({});

function paragraphs(body: string) {
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Paragraphs({ body, field, at, className }: { body: string; field: string; at: EditAt; className: string }) {
  return (
    <>
      {paragraphs(body).map((p, i) => (
        <p className={className} key={i} {...at(`${field}[${i}]`)}>
          {p}
        </p>
      ))}
    </>
  );
}

function Buttons({
  data,
  at,
  edit,
  onDark,
  center,
}: {
  data: Data;
  at: EditAt;
  edit: boolean;
  onDark?: boolean;
  center?: boolean;
}) {
  const btns = list<Btn>(data.buttons).filter((b) => b.label && b.href);
  if (btns.length === 0 && !edit) return null;
  return (
    <div className="nm-btns" style={center ? { justifyContent: "center" } : undefined}>
      {btns.map((b, i) => {
        const cls =
          b.style === "gold" ? "nm-btn gold" : b.style === "ghost" ? (onDark ? "nm-btn on-dark ghost" : "nm-btn ghost") : "nm-btn";
        const link = (
          <Link key={i} className={cls} href={b.href!} {...at(`buttons[${i}].label`)}>
            {b.label}
          </Link>
        );
        if (!edit) return link;
        return (
          <span className="eb-btnwrap" key={i}>
            {link}
            <span className="eb-btnops">
              <LinkOp field="buttons" index={i} />
              <ItemX field="buttons" index={i} title="Knop verwijderen" />
            </span>
          </span>
        );
      })}
      {edit && <AddItem field="buttons" def={{ label: "Nieuwe knop", href: "/contact", style: "solid" }} label="Knop" />}
    </div>
  );
}

function Check({ items, field, at, edit }: { items: Item[]; field: string; at: EditAt; edit: boolean }) {
  return (
    <>
      <ul className="nm-check">
        {items.map((c, i) => (
          <li key={i}>
            <Icon name="shield" />
            <div>
              {c.title ? <b {...at(`${field}[${i}].title`)}>{c.title}</b> : null}{" "}
              <span {...at(`${field}[${i}].text`)}>{c.text}</span>
            </div>
            {edit && <ItemX field={field} index={i} title="Punt verwijderen" />}
          </li>
        ))}
      </ul>
      {edit && <AddItem field={field} def={{ title: "Nieuw punt.", text: "Korte toelichting." }} label="Punt" />}
    </>
  );
}

function secClass(data: Data) {
  return data.alt ? "nm-sec alt" : "nm-sec";
}

// Per-blok kleurinstellingen (bgColor/textColor/accentColor in de blokdata)
// als inline stijl + CSS-variabelen, zodat de klant elk blok kan bijkleuren.
function secProps(data: Data, baseClass: string): { className: string; style?: React.CSSProperties } {
  const style: Record<string, string> = {};
  const bg = str(data.bgColor);
  const tx = str(data.textColor);
  const ac = str(data.accentColor);
  if (bg) style.background = bg;
  if (tx) {
    style.color = tx;
    style["--ink"] = tx;
    style["--muted"] = tx;
  }
  if (ac) {
    style["--gold"] = ac;
    style["--gold-d"] = ac;
  }
  const className = tx ? `${baseClass} nm-tinted` : baseClass;
  return Object.keys(style).length > 0
    ? { className, style: style as React.CSSProperties }
    : { className };
}

export async function RenderBlock({
  type,
  data,
  pageSlug,
  pageTitle,
  blockId,
  edit = false,
}: {
  type: string;
  data: Data;
  pageSlug: string;
  pageTitle: string;
  blockId?: number;
  edit?: boolean;
}) {
  // In bewerkmodus krijgt elk tekst-element een data-edit-pad + contentEditable;
  // de EditMode-client leest wijzigingen uit de DOM en slaat ze per blok op.
  const at: EditAt =
    edit && blockId
      ? (path: string) => ({
          "data-edit": `block:${blockId}:${path}`,
          contentEditable: true,
          suppressContentEditableWarning: true,
        })
      : noEdit;
  const memberAt = (id: number, field: string): Record<string, unknown> =>
    edit
      ? { "data-edit": `member:${id}:${field}`, contentEditable: true, suppressContentEditableWarning: true }
      : {};

  switch (type) {
    case "hero": {
      const facts = list<Item>(data.facts);
      return (
        <section {...secProps(data, "nm-hero")}>
          <div className="nm-wrap">
            <div className="nm-hero-in">
              <div>
                {(str(data.eyebrow) || edit) && (
                  <span className="nm-ey on-dark" {...at("eyebrow")}>{str(data.eyebrow)}</span>
                )}
                <h1 className="nm-hero-h" style={{ marginTop: 14 }} {...at("title")}>{str(data.title)}</h1>
                {(str(data.text) || edit) && (
                  <p className="nm-lead" style={{ marginTop: 18 }} {...at("text")}>{str(data.text)}</p>
                )}
                <Buttons data={data} at={at} edit={edit} onDark />
              </div>
              {(str(data.asideTitle) || facts.length > 0 || edit) && (
                <aside className="nm-aside">
                  {(str(data.asideTitle) || edit) && <h3 {...at("asideTitle")}>{str(data.asideTitle)}</h3>}
                  {(str(data.asideSub) || edit) && <p className="sub" {...at("asideSub")}>{str(data.asideSub)}</p>}
                  {facts.map((f, i) => (
                    <div className="nm-fact eb-rel" key={i}>
                      {edit ? <IconBtn field="facts" index={i} name={f.icon} /> : <Icon name={f.icon} />}
                      <div>
                        <b {...at(`facts[${i}].title`)}>{f.title}</b>
                        <span {...at(`facts[${i}].text`)}>{f.text}</span>
                      </div>
                      {edit && <ItemX field="facts" index={i} title="Punt verwijderen" />}
                    </div>
                  ))}
                  {edit && (
                    <AddItem
                      field="facts"
                      def={{ icon: "shield", title: "Nieuw punt", text: "Korte toelichting" }}
                      label="Punt"
                    />
                  )}
                </aside>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "pagehead":
      return (
        <section {...secProps(data, "nm-pagehead")}>
          <div className="nm-wrap">
            <div className="nm-crumb">
              <Link href="/">Home</Link> &rsaquo; {pageTitle}
            </div>
            {(str(data.eyebrow) || edit) && (
              <span className="nm-ey on-dark" {...at("eyebrow")}>{str(data.eyebrow)}</span>
            )}
            <h1 className="nm-h1" style={{ marginTop: 12 }} {...at("title")}>{str(data.title) || pageTitle}</h1>
            {(str(data.text) || edit) && (
              <p className="nm-lead" style={{ marginTop: 16 }} {...at("text")}>{str(data.text)}</p>
            )}
          </div>
        </section>
      );

    case "text":
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            <div className="nm-rule"></div>
            {(str(data.eyebrow) || edit) && <span className="nm-ey" {...at("eyebrow")}>{str(data.eyebrow)}</span>}
            {(str(data.title) || edit) && <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>}
            <div style={{ maxWidth: "68ch" }}>
              <Paragraphs body={str(data.body)} field="body" at={at} className="nm-p" />
            </div>
          </div>
        </section>
      );

    case "cards": {
      const items = list<Item>(data.items);
      const three = str(data.columns) === "3";
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            {(str(data.eyebrow) || str(data.title)) && <div className="nm-rule"></div>}
            {(str(data.eyebrow) || edit) && <span className="nm-ey" {...at("eyebrow")}>{str(data.eyebrow)}</span>}
            {(str(data.title) || edit) && <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>}
            {(str(data.lead) || edit) && <p className="nm-lead" {...at("lead")}>{str(data.lead)}</p>}
            <div className={three ? "nm-cards three" : "nm-cards"}>
              {items.map((c, i) => (
                <div className="nm-card eb-rel" key={i}>
                  <div className="nm-ico">{edit ? <IconBtn field="items" index={i} name={c.icon} /> : <Icon name={c.icon} />}</div>
                  <h3 className="nm-h3" {...at(`items[${i}].title`)}>{c.title}</h3>
                  <p {...at(`items[${i}].text`)}>{c.text}</p>
                  {edit && <ItemX field="items" index={i} title="Kaart verwijderen" />}
                </div>
              ))}
            </div>
            {edit && (
              <div className="eb-oprow">
                <AddItem
                  field="items"
                  def={{ icon: "shield", title: "Nieuwe kaart", text: "Korte tekst over deze dienst of dit punt." }}
                  label="Kaart"
                />
                <button type="button" className="eb-op eb-additem" data-op="set-columns" data-value={three ? "2" : "3"}>
                  Wissel naar {three ? "2" : "3"} kolommen
                </button>
              </div>
            )}
            <Buttons data={data} at={at} edit={edit} />
          </div>
        </section>
      );
    }

    case "split": {
      const checklist = list<Item>(data.checklist);
      const img = str(data.image);
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            <div className={data.reverse ? "nm-split rev" : "nm-split"}>
              <div>
                <div className="nm-rule"></div>
                {(str(data.eyebrow) || edit) && <span className="nm-ey" {...at("eyebrow")}>{str(data.eyebrow)}</span>}
                {(str(data.title) || edit) && <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>}
                <Paragraphs body={str(data.body)} field="body" at={at} className="nm-p" />
                {img && (checklist.length > 0 || edit) && <Check items={checklist} field="checklist" at={at} edit={edit} />}
                <Buttons data={data} at={at} edit={edit} />
              </div>
              <div className="nm-figside">
                {img ? (
                  <div className="nm-fig eb-rel">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={str(data.imageAlt)} />
                    {edit && <ImageOps field="image" hasImage />}
                  </div>
                ) : checklist.length > 0 || edit ? (
                  <div>
                    <Check items={checklist} field="checklist" at={at} edit={edit} />
                    {edit && (
                      <p style={{ marginTop: 14 }}>
                        <ImageOps field="image" hasImage={false} />
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "band":
      return (
        <section {...secProps(data, "nm-sec nm-band")}>
          <div className="nm-wrap" style={{ textAlign: "center" }}>
            <div className="nm-rule" style={{ margin: "0 auto 22px" }}></div>
            <p className="nm-quote" style={{ maxWidth: "28ch", margin: "0 auto" }} {...at("quote")}>{str(data.quote)}</p>
            {((str(data.buttonLabel) && str(data.buttonHref)) || edit) && (
              <div className="nm-btns" style={{ justifyContent: "center" }}>
                <span className={edit ? "eb-btnwrap" : undefined}>
                  <Link className="nm-btn gold" href={str(data.buttonHref) || "/contact"} {...at("buttonLabel")}>
                    {str(data.buttonLabel) || (edit ? "Knoptekst" : "")}
                  </Link>
                  {edit && (
                    <span className="eb-btnops">
                      <LinkOp singleField="buttonHref" />
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </section>
      );

    case "cta":
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            <div className="nm-cta" style={str(data.bgColor) ? { background: str(data.bgColor) } : undefined}>
              <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>
              {(str(data.text) || edit) && <p {...at("text")}>{str(data.text)}</p>}
              {((str(data.buttonLabel) && str(data.buttonHref)) || edit) && (
                <div className="nm-btns">
                  <span className={edit ? "eb-btnwrap" : undefined}>
                    <Link className="nm-btn gold" href={str(data.buttonHref) || "/contact"} {...at("buttonLabel")}>
                      {str(data.buttonLabel) || (edit ? "Knoptekst" : "")}
                    </Link>
                    {edit && (
                      <span className="eb-btnops">
                        <LinkOp singleField="buttonHref" />
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "team": {
      const members = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.visible, true))
        .orderBy(asc(teamMembers.sort), asc(teamMembers.id));
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            {(str(data.eyebrow) || str(data.title)) && <div className="nm-rule"></div>}
            {(str(data.eyebrow) || edit) && <span className="nm-ey" {...at("eyebrow")}>{str(data.eyebrow)}</span>}
            {(str(data.title) || edit) && <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>}
            {(str(data.lead) || edit) && <p className="nm-lead" {...at("lead")}>{str(data.lead)}</p>}
            <div className="nm-team">
              {members.map((m) => (
                <div className="nm-tm eb-rel" key={m.id}>
                  <div className="nm-mono eb-rel">
                    {m.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.photoUrl} alt={m.name} />
                    ) : (
                      m.name
                        .split(/\s+/)
                        .filter((w) => /^[A-ZÀ-Ž]/.test(w))
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                    )}
                    {edit && (
                      <button type="button" className="eb-op eb-fotoop" data-op="member-photo" data-member={m.id}>
                        Foto
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 {...memberAt(m.id, "name")}>{m.name}</h3>
                    <p className="role" {...memberAt(m.id, "role")}>{m.role}</p>
                    <p {...memberAt(m.id, "bio")}>{m.bio}</p>
                  </div>
                </div>
              ))}
            </div>
            {edit && (
              <p className="nm-note" style={{ marginTop: 18 }}>
                Teksten en foto&apos;s bewerk je hier direct. Medewerkers toevoegen, verwijderen of herordenen doe je
                onder <Link href="/admin/team" style={{ fontWeight: 600, textDecoration: "underline" }}>Beheer → Team</Link>.
              </p>
            )}
          </div>
        </section>
      );
    }

    case "blog": {
      const max = Number(str(data.count)) || undefined;
      let q = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.visible, true))
        .orderBy(desc(blogPosts.publishedAt));
      if (max) q = q.slice(0, max);
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            {(str(data.eyebrow) || str(data.title)) && <div className="nm-rule"></div>}
            {(str(data.eyebrow) || edit) && <span className="nm-ey" {...at("eyebrow")}>{str(data.eyebrow)}</span>}
            {(str(data.title) || edit) && <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>}
            {(str(data.lead) || edit) && <p className="nm-lead" {...at("lead")}>{str(data.lead)}</p>}
            <div className="nm-blog">
              {q.map((p) => (
                <Link className="nm-post" key={p.id} href={`/${pageSlug ? pageSlug + "/" : ""}${p.slug}`}>
                  <div className="nm-post-img">
                    {p.coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.coverUrl} alt="" />
                    ) : null}
                  </div>
                  <div className="nm-post-body">
                    <time>
                      {p.publishedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                  </div>
                </Link>
              ))}
              {q.length === 0 && <p className="nm-p">Nog geen berichten.</p>}
            </div>
            {edit && (
              <p className="nm-note" style={{ marginTop: 18 }}>
                Berichten schrijven of bewerken doe je onder{" "}
                <Link href="/admin/blog" style={{ fontWeight: 600, textDecoration: "underline" }}>Beheer → Blog</Link>.
              </p>
            )}
          </div>
        </section>
      );
    }

    case "contactInfo": {
      const s = await getSettings();
      const cards: { icon: string; title: string; body: React.ReactNode }[] = [
        { icon: "phone", title: "Telefoon", body: <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a> },
        { icon: "mail", title: "E-mail", body: <a href={`mailto:${s.email}`}>{s.email}</a> },
        { icon: "pin", title: "Bezoekadres", body: <span>{s.address}</span> },
      ];
      if (s.postal) cards.push({ icon: "doc", title: "Postadres", body: <span>{s.postal}</span> });
      cards.push({
        icon: "shield",
        title: "Bedrijfsgegevens",
        body: (
          <span>
            KvK {s.kvk}
            <br />
            BTW {s.btw}
          </span>
        ),
      });
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            <div className="nm-contact">
              {cards.map((c, i) => (
                <div className="nm-cc" key={i}>
                  <Icon name={c.icon} />
                  <div>
                    <b>{c.title}</b>
                    {c.body}
                  </div>
                </div>
              ))}
            </div>
            {edit && (
              <p className="nm-note" style={{ marginTop: 18 }}>
                Deze gegevens komen uit{" "}
                <Link href="/admin/instellingen" style={{ fontWeight: 600, textDecoration: "underline" }}>
                  Beheer → Instellingen
                </Link>.
              </p>
            )}
          </div>
        </section>
      );
    }

    case "contactForm":
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            <div className="nm-split">
              <div>
                <div className="nm-rule"></div>
                {(str(data.eyebrow) || edit) && <span className="nm-ey" {...at("eyebrow")}>{str(data.eyebrow)}</span>}
                {(str(data.title) || edit) && <h2 className="nm-h2" {...at("title")}>{str(data.title)}</h2>}
                <Paragraphs body={str(data.text)} field="text" at={at} className="nm-p" />
              </div>
              <ContactForm path={pageSlug ? `/${pageSlug}` : "/"} />
            </div>
          </div>
        </section>
      );

    case "image": {
      const img = str(data.image);
      if (!img && !edit) return null;
      return (
        <section {...secProps(data, secClass(data))}>
          <div className="nm-wrap">
            {img ? (
              <div className="nm-fig eb-rel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={str(data.alt)} />
                {edit && <ImageOps field="image" hasImage />}
              </div>
            ) : (
              <div className="eb-imgleeg">
                <ImageOps field="image" hasImage={false} />
              </div>
            )}
            {(str(data.caption) || edit) && <p className="nm-caption" {...at("caption")}>{str(data.caption)}</p>}
          </div>
        </section>
      );
    }

    case "html":
      return (
        <section className="nm-sec">
          <div className="nm-wrap" dangerouslySetInnerHTML={{ __html: str(data.html) }} />
        </section>
      );

    default:
      return null;
  }
}
