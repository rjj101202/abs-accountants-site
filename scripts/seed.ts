/**
 * Vult een lege database met de startcontent van absaccountants.nl
 * (gebaseerd op de goedgekeurde demo, inclusief de onderscheidende punten:
 * persoonlijke begeleiding, fiscale advisering, AA-niveau, familiebedrijven,
 * bedrijfsopvolging & herstructureringen, regionale betrokkenheid).
 *
 *   npm run seed
 *
 * Het script weigert te draaien als er al pagina's bestaan.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
}

async function main() {
  const { db, pages, blocks, teamMembers, blogPosts } = await import("../src/db");

  const existing = await db.select().from(pages);
  if (existing.length > 0) {
    console.log(`Er bestaan al ${existing.length} pagina's; seed wordt overgeslagen.`);
    return;
  }

  // ---------- pagina's ----------
  const [home] = await db.insert(pages).values({ slug: "", title: "Home", sort: 1 }).returning();
  const [diensten] = await db.insert(pages).values({ slug: "diensten", title: "Diensten", sort: 2 }).returning();
  const [online] = await db
    .insert(pages)
    .values({ slug: "online-diensten", title: "Online diensten", sort: 3 })
    .returning();
  const [team] = await db.insert(pages).values({ slug: "team", title: "Team", sort: 4 }).returning();
  const [actueel] = await db.insert(pages).values({ slug: "actueel", title: "Actueel", sort: 5 }).returning();
  const [contact] = await db.insert(pages).values({ slug: "contact", title: "Contact", sort: 6 }).returning();

  let sortCounter = 0;
  const blok = (pageId: number, type: string, data: Record<string, unknown>) => ({
    pageId,
    type,
    data,
    sort: ++sortCounter,
  });

  // ---------- home ----------
  await db.insert(blocks).values([
    blok(home.id, "hero", {
      eyebrow: "Accountants & Belastingadviseurs · Spijkenisse",
      title: "Persoonlijk betrokken bij ondernemers en familiebedrijven",
      text: "Al bijna twintig jaar begeleiden we ondernemers in de regio Spijkenisse persoonlijk: accountancy op AA-niveau, scherpe fiscale advisering en een vast aanspreekpunt dat je onderneming door en door kent. Van de dagelijkse cijfers tot bedrijfsopvolging.",
      buttons: [
        { label: "Maak kennis met ons", href: "/contact", style: "gold" },
        { label: "Bekijk onze diensten", href: "/diensten", style: "ghost" },
      ],
      asideTitle: "Waarom ondernemers voor ABS kiezen",
      asideSub: "Wat ons onderscheidt van andere kantoren",
      facts: [
        { icon: "users", title: "Persoonlijke begeleiding", text: "Een vast aanspreekpunt dat met je meedenkt" },
        { icon: "shield", title: "Accountancy op AA-niveau", text: "Twee AA-accountants met ruime MKB-ervaring" },
        { icon: "scale", title: "Fiscale advisering", text: "Proactief meedenken over fiscale keuzes" },
        { icon: "building", title: "Thuis in familiebedrijven", text: "Ook bij bedrijfsopvolging en herstructurering" },
        { icon: "pin", title: "Regionaal betrokken", text: "Langdurige klantrelaties in Spijkenisse en omstreken" },
      ],
    }),
    blok(home.id, "cards", {
      eyebrow: "Onze diensten",
      title: "Meer dan de jaarrekening alleen",
      lead: "Accountancy op AA-niveau en fiscale advisering vormen de kern. Daaromheen begeleiden we ondernemers bij alles wat op hun pad komt, van de dagelijkse administratie tot de overdracht van het familiebedrijf.",
      columns: "3",
      items: [
        { icon: "chart", title: "Accountancy op AA-niveau", text: "Je jaarrekening en tussentijdse cijfers, samengesteld door onze AA-accountants zelf, met heldere uitleg over wat de getallen voor je onderneming betekenen." },
        { icon: "scale", title: "Fiscale advisering", text: "Meer dan de aangifte: we denken vooruit over fiscale keuzes rond je onderneming, je bv-structuur en je privésituatie, zodat je niet meer betaalt dan nodig." },
        { icon: "building", title: "Familiebedrijven", text: "We kennen de dynamiek van het familiebedrijf: zakelijk en privé lopen door elkaar. We adviseren met oog voor de familie én voor de continuïteit van het bedrijf." },
        { icon: "growth", title: "Bedrijfsopvolging & herstructurering", text: "Overdracht binnen de familie, verkoop of een nieuwe structuur: we begeleiden het hele traject, fiscaal en financieel doordacht." },
        { icon: "doc", title: "Administratie", text: "Een verzorgde boekhouding als betrouwbare basis, of je die nu volledig uitbesteedt of samen met ons online bijhoudt." },
        { icon: "wallet", title: "Salarisadministratie", text: "Loonstroken, aangiften en de administratie rond je personeel, correct en op tijd geregeld." },
      ],
      buttons: [{ label: "Alle diensten bekijken", href: "/diensten", style: "ghost" }],
    }),
    blok(home.id, "split", {
      eyebrow: "Over ABS",
      title: "Een kantoor met een naam in de regio",
      body: "ABS Accountants B.V. komt voort uit een regionaal bekend administratiekantoor, ABS (Administratie Belastingadviesbureau Schuijff), vooral bekend in de regio Spijkenisse. Sinds 2006 wordt het kantoor geleid door Cees-Jan Kieviet AA, die zich naast administratie en belastingadvies ook richt op accountancy. Sinds 2010 versterkt Mateï Guttenberg AA het kantoor als tweede accountant.\n\nBeide accountants zijn al bijna twee decennia werkzaam voor uiteenlopende ondernemingen in het MKB, met een groot deel van de cliënten uit de regio Spijkenisse en Rotterdam. Veel van die relaties bestaan al jaren; sommige cliënten begeleiden we inmiddels in de tweede generatie. Die regionale betrokkenheid en dat langdurige vertrouwen zijn waar het kantoor op is gebouwd.",
      checklist: [
        { title: "Persoonlijke begeleiding.", text: "Je spreekt je eigen accountant, niet steeds iemand anders." },
        { title: "Langdurige relaties.", text: "Veel cliënten zijn al jaren, soms generaties, aan ons verbonden." },
        { title: "Deskundig op niveau.", text: "Accountancy op AA-niveau en fiscale advisering onder één dak." },
      ],
      buttons: [{ label: "Maak kennis met het team", href: "/team", style: "solid" }],
      alt: true,
    }),
    blok(home.id, "split", {
      eyebrow: "Familiebedrijven",
      title: "Van generatie op generatie",
      body: "In een familiebedrijf lopen onderneming, familie en vermogen door elkaar. Dat vraagt om een adviseur die verder kijkt dan de cijfers van dit jaar. ABS begeleidt familiebedrijven in de regio al bijna twintig jaar, van de dagelijkse administratie tot de grote momenten.",
      checklist: [
        { title: "Bedrijfsopvolging.", text: "Tijdig en fiscaal doordacht overdragen aan de volgende generatie of een koper." },
        { title: "Herstructureringen.", text: "Een bv-structuur die past bij waar je onderneming nu staat en straks naartoe wil." },
        { title: "Eén vertrouwd gezicht.", text: "Dezelfde accountant die het bedrijf én de familie kent." },
      ],
      buttons: [{ label: "Lees meer over onze aanpak", href: "/diensten", style: "solid" }],
      reverse: true,
    }),
    blok(home.id, "band", {
      quote: "Geen kantoor op afstand, maar een vaste adviseur die je onderneming écht kent.",
      buttonLabel: "Plan een kennismaking",
      buttonHref: "/contact",
    }),

    // ---------- diensten ----------
    blok(diensten.id, "pagehead", {
      eyebrow: "Onze diensten",
      title: "Deskundig advies, van cijfers tot fiscaliteit",
      text: "Accountancy op AA-niveau, fiscale advisering en persoonlijke begeleiding van ondernemers, onder één dak. Met bijzondere aandacht voor familiebedrijven, bedrijfsopvolging en herstructureringen.",
    }),
    blok(diensten.id, "cards", {
      columns: "2",
      items: [
        { icon: "chart", title: "Accountancy op AA-niveau", text: "Je jaarrekening en tussentijdse cijfers worden samengesteld door onze AA-accountants zelf. We bespreken de cijfers persoonlijk en vertellen je wat ze betekenen voor je onderneming." },
        { icon: "scale", title: "Fiscale advisering", text: "Van je aangiften tot strategisch fiscaal advies over je bv-structuur, investeringen en privésituatie. We denken vooruit, zodat je goed voorbereid bent en niet meer betaalt dan nodig." },
        { icon: "users", title: "Persoonlijke begeleiding", text: "Een vast aanspreekpunt en een klankbord bij elke ondernemersvraag: een investering, financiering of gewoon even sparren. Wij kennen je onderneming, jij kent ons." },
        { icon: "building", title: "Familiebedrijven", text: "Onderneming, familie en vermogen lopen in een familiebedrijf door elkaar. We adviseren met oog voor beide: de mensen én de continuïteit van het bedrijf." },
        { icon: "growth", title: "Bedrijfsopvolging & herstructurering", text: "Overdracht aan de volgende generatie, verkoop of een nieuwe bv-structuur. We begeleiden het hele traject: waardering, fiscale route en de uitvoering." },
        { icon: "doc", title: "Administratie", text: "Een ordelijke boekhouding is de basis voor elk goed advies. Je besteedt je administratie volledig uit of houdt die samen met ons online bij." },
        { icon: "wallet", title: "Salarisadministratie", text: "Loonstroken, loonaangiften en de administratieve verplichtingen rond je personeel, correct verzorgd en op tijd ingediend." },
        { icon: "sprout", title: "Startende ondernemers", text: "Net begonnen of van plan te starten? We helpen je op weg met de juiste administratie en een heldere fiscale start." },
      ],
    }),
    blok(diensten.id, "split", {
      eyebrow: "Bedrijfsopvolging & herstructurering",
      title: "Het bedrijf overdragen doe je maar één keer",
      body: "Of het nu gaat om overdracht binnen de familie, verkoop aan een medewerker of een externe koper: bedrijfsopvolging vraagt om tijdige voorbereiding en een fiscaal doordachte route. Als kantoor dat veel familiebedrijven begeleidt, kennen we dit traject van dichtbij.\n\nOok zonder concrete opvolgingsplannen loont het om de structuur van je onderneming periodiek tegen het licht te houden. Een holding, splitsing of herstructurering kan risico's afschermen en fiscale voordelen veiligstellen.",
      checklist: [
        { title: "Tijdig plannen.", text: "Fiscale faciliteiten voor bedrijfsopvolging vragen vaak jaren voorbereiding." },
        { title: "Waardering en structuur.", text: "Inzicht in wat het bedrijf waard is en welke structuur past." },
        { title: "Begeleiding van A tot Z.", text: "Eén vertrouwd aanspreekpunt gedurende het hele traject." },
      ],
      alt: true,
    }),
    blok(diensten.id, "cta", {
      title: "Benieuwd wat we voor jouw onderneming kunnen doen?",
      text: "In een vrijblijvend kennismakingsgesprek brengen we in kaart waar je nu staat en hoe we je kunnen ontzorgen.",
      buttonLabel: "Neem contact op",
      buttonHref: "/contact",
    }),

    // ---------- online diensten ----------
    blok(online.id, "pagehead", {
      eyebrow: "Online diensten",
      title: "Je administratie, altijd binnen handbereik",
      text: "Steeds meer cliënten werken met ons online samen. Je houdt je administratie eenvoudig bij en hebt op elk moment inzicht in je cijfers, terwijl wij meekijken en adviseren. Online gemak, met de persoonlijke begeleiding die je van ons gewend bent.",
    }),
    blok(online.id, "split", {
      title: "Samenwerken in de cloud",
      body: "We werken met online boekhoudpakketten zoals Exact Online. Facturen maken, bonnetjes verwerken en je administratie bijhouden kan overal, en je accountant heeft dezelfde actuele cijfers voor zich. Zo houden we samen grip op je onderneming.",
      checklist: [
        { title: "Altijd actueel.", text: "Jij en je accountant kijken naar dezelfde, up-to-date administratie." },
        { title: "Minder papierwerk.", text: "Documenten en bonnen upload je digitaal." },
        { title: "Veilig inloggen.", text: "Je gegevens staan achter een beveiligde omgeving." },
      ],
    }),
    blok(online.id, "cards", {
      eyebrow: "Zo werkt het",
      title: "In drie stappen online",
      columns: "3",
      items: [
        { icon: "users", title: "1. Kennismaken", text: "We bespreken je onderneming en kiezen samen de manier van samenwerken die bij je past." },
        { icon: "doc", title: "2. Inrichten", text: "We richten je online omgeving in en helpen je op weg, zodat je snel zelf aan de slag kunt." },
        { icon: "chart", title: "3. Inzicht & advies", text: "Jij houdt bij, wij kijken mee en adviseren op basis van actuele cijfers." },
      ],
      buttons: [{ label: "Vraag naar de mogelijkheden", href: "/contact", style: "solid" }],
      alt: true,
    }),

    // ---------- team ----------
    blok(team.id, "pagehead", {
      eyebrow: "Ons team",
      title: "De mensen achter ABS Accountants",
      text: "Bij ABS ken je je accountant persoonlijk. Twee ervaren AA-accountants, geworteld in de regio Spijkenisse, begeleiden ondernemers en familiebedrijven vaak al vele jaren.",
    }),
    blok(team.id, "team", {}),
    blok(team.id, "split", {
      title: "Langdurige relaties, persoonlijke begeleiding",
      body: "We geloven in een sterke, langdurige relatie met onze cliënten. Veel ondernemers en familiebedrijven begeleiden we al jaren, sommige inmiddels in de tweede generatie. Doordat je een vast aanspreekpunt hebt dat je onderneming door en door kent, is advies altijd persoonlijk en to the point.",
      checklist: [
        { title: "Vast aanspreekpunt", text: "dat je situatie én je historie kent." },
        { title: "Regionaal betrokken", text: "bij ondernemers in Spijkenisse en omstreken." },
        { title: "Deskundig op AA-niveau", text: "in accountancy en fiscaliteit." },
      ],
      alt: true,
    }),
    blok(team.id, "cta", {
      title: "Persoonlijk kennismaken?",
      text: "We vertellen je graag hoe we werken en wat we voor jouw onderneming kunnen betekenen. Loop gerust eens binnen of bel voor een afspraak.",
      buttonLabel: "Plan een gesprek",
      buttonHref: "/contact",
    }),

    // ---------- actueel ----------
    blok(actueel.id, "pagehead", {
      eyebrow: "Actueel",
      title: "Nieuws en tips voor ondernemers",
      text: "Fiscale wijzigingen, deadlines en praktische tips: hier houden we je op de hoogte van wat er speelt.",
    }),
    blok(actueel.id, "blog", {}),

    // ---------- contact ----------
    blok(contact.id, "pagehead", {
      eyebrow: "Contact",
      title: "Neem contact op met ABS Accountants",
      text: "Een vraag, of benieuwd wat we voor je kunnen betekenen? Bel of mail ons, of loop gerust binnen aan de Curieweg in Spijkenisse. We nemen graag de tijd voor een goede, persoonlijke kennismaking.",
    }),
    blok(contact.id, "contactInfo", {}),
    blok(contact.id, "contactForm", {
      eyebrow: "Stuur een bericht",
      title: "We horen graag van je",
      text: "Laat je gegevens achter en omschrijf kort je vraag, dan nemen we snel contact met je op. Liever direct persoonlijk contact? Bel ons gerust tijdens kantooruren.",
      alt: true,
    }),
  ]);

  // ---------- team ----------
  await db.insert(teamMembers).values([
    {
      name: "C.W.L. Kieviet",
      role: "AA-accountant",
      bio: "Leidt het kantoor sinds 2006 en richt zich naast administratieve dienstverlening en belastingadvies op accountancy. Al bijna twee decennia actief voor MKB-ondernemingen in de regio.",
      sort: 1,
    },
    {
      name: "M. Guttenberg",
      role: "AA-accountant",
      bio: "Sinds 2010 als tweede accountant verbonden aan ABS. Ruime ervaring met uiteenlopende ondernemingen in het MKB, met een persoonlijke en praktische aanpak.",
      sort: 2,
    },
  ]);

  // ---------- voorbeeldbericht ----------
  await db.insert(blogPosts).values({
    slug: "welkom-op-onze-nieuwe-website",
    title: "Welkom op onze nieuwe website",
    excerpt: "Een frisse website, dezelfde vertrouwde begeleiding. Lees wat er nieuw is.",
    body: "Onze website is vernieuwd. Je vindt er voortaan niet alleen onze diensten en contactgegevens, maar ook actuele berichten over fiscale wijzigingen en praktische tips voor ondernemers.\n\n## Wat je hier gaat vinden\n\n- Belangrijke fiscale deadlines en wijzigingen\n- Praktische tips voor je administratie\n- Nieuws over ons kantoor\n\nHeb je een vraag naar aanleiding van een bericht? Bel of mail ons gerust.",
    visible: true,
  });

  console.log("Seed voltooid: 6 pagina's, blokken, 2 teamleden en 1 blogbericht.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
