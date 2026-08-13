// Blokdefinities: één bron van waarheid voor zowel de editor (welke velden
// krijgt de beheerder te zien) als de renderer (wat betekent de data).

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "image" | "checkbox" | "list";
  help?: string;
  options?: { value: string; label: string }[];
  // Alleen bij type "list": de velden van één item in de lijst.
  itemFields?: FieldDef[];
  itemLabel?: string;
};

export const ICON_OPTIONS = [
  { value: "chart", label: "Grafiek (cijfers)" },
  { value: "scale", label: "Weegschaal (fiscaal)" },
  { value: "users", label: "Personen" },
  { value: "building", label: "Gebouw (familiebedrijf)" },
  { value: "doc", label: "Document" },
  { value: "wallet", label: "Betaalpas (salaris)" },
  { value: "pin", label: "Locatiespeld" },
  { value: "shield", label: "Schild (vinkje)" },
  { value: "clock", label: "Klok" },
  { value: "growth", label: "Groeipijl" },
  { value: "sprout", label: "Plantje (starters)" },
  { value: "mail", label: "Envelop" },
  { value: "phone", label: "Telefoon" },
  { value: "handshake", label: "Bruggetje (advies)" },
];

const buttonStyleOptions = [
  { value: "solid", label: "Donkerblauw" },
  { value: "gold", label: "Goud" },
  { value: "ghost", label: "Omlijnd" },
];

const buttonFields: FieldDef[] = [
  { key: "label", label: "Knoptekst", type: "text" },
  { key: "href", label: "Link (bijv. /contact)", type: "text" },
  { key: "style", label: "Stijl", type: "select", options: buttonStyleOptions },
];

export type BlockTypeDef = {
  label: string;
  description: string;
  fields: FieldDef[];
};

export const BLOCK_TYPES: Record<string, BlockTypeDef> = {
  hero: {
    label: "Hero (grote kop met zijpaneel)",
    description: "Donkerblauw openingsblok voor de homepage, met knoppen en feitjes in een zijpaneel.",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "text", label: "Introtekst", type: "textarea" },
      { key: "buttons", label: "Knoppen", type: "list", itemLabel: "Knop", itemFields: buttonFields },
      { key: "asideTitle", label: "Zijpaneel: kop", type: "text" },
      { key: "asideSub", label: "Zijpaneel: subregel", type: "text" },
      {
        key: "facts", label: "Zijpaneel: punten", type: "list", itemLabel: "Punt",
        itemFields: [
          { key: "icon", label: "Icoon", type: "select", options: ICON_OPTIONS },
          { key: "title", label: "Titel", type: "text" },
          { key: "text", label: "Toelichting", type: "text" },
        ],
      },
    ],
  },
  pagehead: {
    label: "Paginakop",
    description: "Donkerblauwe kop bovenaan een subpagina, met broodkruimel.",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "text", label: "Introtekst", type: "textarea" },
    ],
  },
  text: {
    label: "Tekst",
    description: "Kop met een of meer alinea's. Lege regel = nieuwe alinea.",
    fields: [
      { key: "eyebrow", label: "Bovenregel (optioneel)", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "body", label: "Tekst", type: "textarea", help: "Lege regel begint een nieuwe alinea." },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  cards: {
    label: "Kaarten (diensten/punten)",
    description: "Raster van kaarten met icoon, titel en tekst.",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "lead", label: "Introtekst", type: "textarea" },
      {
        key: "columns", label: "Kolommen (breed scherm)", type: "select",
        options: [{ value: "2", label: "2" }, { value: "3", label: "3" }],
      },
      {
        key: "items", label: "Kaarten", type: "list", itemLabel: "Kaart",
        itemFields: [
          { key: "icon", label: "Icoon", type: "select", options: ICON_OPTIONS },
          { key: "title", label: "Titel", type: "text" },
          { key: "text", label: "Tekst", type: "textarea" },
        ],
      },
      { key: "buttons", label: "Knoppen onder het raster", type: "list", itemLabel: "Knop", itemFields: buttonFields },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  split: {
    label: "Twee kolommen (tekst + checklist)",
    description: "Tekst links, checklist of afbeelding rechts (of andersom).",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "body", label: "Tekst", type: "textarea", help: "Lege regel begint een nieuwe alinea." },
      {
        key: "checklist", label: "Checklist", type: "list", itemLabel: "Punt",
        itemFields: [
          { key: "title", label: "Dikgedrukt begin", type: "text" },
          { key: "text", label: "Vervolgtekst", type: "text" },
        ],
      },
      { key: "image", label: "Afbeelding (i.p.v. checklist)", type: "image" },
      { key: "imageAlt", label: "Afbeelding: beschrijving", type: "text" },
      { key: "buttons", label: "Knoppen", type: "list", itemLabel: "Knop", itemFields: buttonFields },
      { key: "reverse", label: "Kolommen omdraaien", type: "checkbox" },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  band: {
    label: "Donkere band met quote",
    description: "Donkerblauwe band met een korte uitspraak en optionele knop.",
    fields: [
      { key: "quote", label: "Uitspraak", type: "textarea" },
      { key: "buttonLabel", label: "Knoptekst (optioneel)", type: "text" },
      { key: "buttonHref", label: "Knoplink", type: "text" },
    ],
  },
  cta: {
    label: "Call-to-action",
    description: "Donkerblauw afsluitblok met kop, tekst en knop.",
    fields: [
      { key: "title", label: "Kop", type: "text" },
      { key: "text", label: "Tekst", type: "textarea" },
      { key: "buttonLabel", label: "Knoptekst", type: "text" },
      { key: "buttonHref", label: "Knoplink", type: "text" },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  team: {
    label: "Team",
    description: "Toont automatisch alle medewerkers uit Team-beheer.",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "lead", label: "Introtekst", type: "textarea" },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  blog: {
    label: "Actueel / blog",
    description: "Toont automatisch de nieuwste blogberichten uit Blog-beheer.",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "lead", label: "Introtekst", type: "textarea" },
      { key: "count", label: "Maximum aantal (leeg = alle)", type: "text" },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  contactInfo: {
    label: "Contactgegevens",
    description: "Kaartjes met telefoon, e-mail en adres uit de instellingen.",
    fields: [{ key: "alt", label: "Witte achtergrond", type: "checkbox" }],
  },
  contactForm: {
    label: "Contactformulier",
    description: "Formulier; inzendingen verschijnen onder Berichten in het beheer.",
    fields: [
      { key: "eyebrow", label: "Bovenregel", type: "text" },
      { key: "title", label: "Kop", type: "text" },
      { key: "text", label: "Tekst naast het formulier", type: "textarea" },
      { key: "alt", label: "Witte achtergrond", type: "checkbox" },
    ],
  },
  image: {
    label: "Afbeelding",
    description: "Eén afbeelding over de volle breedte van de contentkolom.",
    fields: [
      { key: "image", label: "Afbeelding", type: "image" },
      { key: "alt", label: "Beschrijving (alt-tekst)", type: "text" },
      { key: "caption", label: "Onderschrift (optioneel)", type: "text" },
    ],
  },
  html: {
    label: "Vrij HTML-blok (gevorderd)",
    description: "Eigen HTML voor bijzondere gevallen. Alleen gebruiken als je weet wat je doet.",
    fields: [{ key: "html", label: "HTML", type: "textarea" }],
  },
};

export type BlockData = Record<string, unknown>;

// Startinhoud voor een vers blok, zodat het direct zichtbaar en op de
// pagina zelf aanklikbaar/bewerkbaar is.
export const DEFAULT_BLOCK_DATA: Record<string, BlockData> = {
  hero: {
    eyebrow: "Bovenregel",
    title: "Nieuwe kop",
    text: "Introtekst: klik om te bewerken.",
    buttons: [{ label: "Neem contact op", href: "/contact", style: "gold" }],
    asideTitle: "Zijpaneel",
    asideSub: "Subregel",
    facts: [{ icon: "shield", title: "Nieuw punt", text: "Korte toelichting" }],
  },
  pagehead: { eyebrow: "Bovenregel", title: "Nieuwe pagina", text: "Introtekst: klik om te bewerken." },
  text: { title: "Nieuwe kop", body: "Nieuwe tekst: klik om te bewerken.\n\nEen lege regel begint een nieuwe alinea." },
  cards: {
    title: "Nieuwe kop",
    lead: "Introtekst: klik om te bewerken.",
    columns: "3",
    items: [
      { icon: "shield", title: "Eerste kaart", text: "Korte tekst over dit punt." },
      { icon: "chart", title: "Tweede kaart", text: "Korte tekst over dit punt." },
      { icon: "users", title: "Derde kaart", text: "Korte tekst over dit punt." },
    ],
  },
  split: {
    title: "Nieuwe kop",
    body: "Nieuwe tekst: klik om te bewerken.",
    checklist: [
      { title: "Eerste punt.", text: "Korte toelichting." },
      { title: "Tweede punt.", text: "Korte toelichting." },
    ],
  },
  band: { quote: "Een korte, krachtige uitspraak.", buttonLabel: "Neem contact op", buttonHref: "/contact" },
  cta: {
    title: "Nieuwe kop",
    text: "Korte uitnodigende tekst.",
    buttonLabel: "Neem contact op",
    buttonHref: "/contact",
  },
  team: { eyebrow: "Ons team", title: "De mensen achter het kantoor" },
  blog: { eyebrow: "Actueel", title: "Nieuws en tips" },
  contactInfo: {},
  contactForm: {
    eyebrow: "Stuur een bericht",
    title: "We horen graag van je",
    text: "Laat je gegevens achter, dan nemen we snel contact op.",
  },
  image: {},
  html: { html: "<p>Eigen HTML: bewerk dit via de HTML-knop in de blokbalk.</p>" },
};

export function blockSummary(type: string, data: BlockData): string {
  const def = BLOCK_TYPES[type];
  const title = (data.title as string) || (data.quote as string) || "";
  return `${def?.label ?? type}${title ? ` — ${title.slice(0, 60)}` : ""}`;
}

// Zet blokdata om naar een ander bloktype: gedeelde velden gaan mee,
// verwante velden worden vertaald, de rest komt uit de standaardinhoud.
export function convertBlockData(from: BlockData, toType: string): BlockData {
  const target = BLOCK_TYPES[toType];
  const out: BlockData = { ...(DEFAULT_BLOCK_DATA[toType] ?? {}) };
  if (!target) return out;
  const targetKeys = new Set(target.fields.map((f) => f.key));

  // 1) Zelfde veldnaam: rechtstreeks overnemen.
  for (const key of targetKeys) {
    if (from[key] !== undefined && from[key] !== "") out[key] = from[key];
  }

  // 2) Verwante tekstvelden vertalen.
  const firstText = (keys: string[]) => {
    for (const k of keys) {
      const v = from[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return undefined;
  };
  if (targetKeys.has("body") && out.body === (DEFAULT_BLOCK_DATA[toType] ?? {}).body) {
    const t = firstText(["body", "text", "lead"]);
    if (t) out.body = t;
  }
  if (targetKeys.has("text") && out.text === (DEFAULT_BLOCK_DATA[toType] ?? {}).text) {
    const t = firstText(["text", "lead", "body"]);
    if (t) out.text = t;
  }
  if (targetKeys.has("lead") && out.lead === (DEFAULT_BLOCK_DATA[toType] ?? {}).lead) {
    const t = firstText(["lead", "text", "body"]);
    if (t) out.lead = t;
  }
  if (targetKeys.has("quote") && out.quote === (DEFAULT_BLOCK_DATA[toType] ?? {}).quote) {
    const t = firstText(["quote", "title", "text"]);
    if (t) out.quote = t;
  }
  if (targetKeys.has("title") && out.title === (DEFAULT_BLOCK_DATA[toType] ?? {}).title) {
    const t = firstText(["title", "quote"]);
    if (t) out.title = t;
  }

  // 3) Lijsten met dezelfde vorm (icon/title/text) over en weer.
  const firstList = (keys: string[]) => {
    for (const k of keys) {
      const v = from[k];
      if (Array.isArray(v) && v.length > 0) return v;
    }
    return undefined;
  };
  for (const listKey of ["items", "facts", "checklist"] as const) {
    if (targetKeys.has(listKey)) {
      const l = firstList([listKey, "items", "facts", "checklist"]);
      if (l) out[listKey] = l;
    }
  }
  return out;
}
