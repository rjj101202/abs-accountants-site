import { getSettings } from "@/lib/settings";
import { saveSettings } from "../../actions";
import { FormImageField } from "@/components/admin/form-image-field";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const s = await getSettings();
  return (
    <>
      <h1>Instellingen</h1>
      <p className="adm-sub">Algemene gegevens die overal op de site gebruikt worden (koptekst, voettekst, contactblokken).</p>
      {ok ? <p className="adm-flash">Opgeslagen.</p> : null}
      <div className="adm-card">
        <form action={saveSettings}>
          <div className="adm-field">
            <label>Naam van het kantoor</label>
            <input name="siteName" type="text" defaultValue={s.siteName} required />
          </div>
          <div className="adm-field">
            <label>Ondertitel</label>
            <input name="tagline" type="text" defaultValue={s.tagline} />
          </div>
          <FormImageField name="logoUrl" label="Logo (leeg = naam als tekst)" defaultValue={s.logoUrl} />
          <div className="adm-grid2">
            <div className="adm-field">
              <label>Telefoon</label>
              <input name="phone" type="text" defaultValue={s.phone} />
            </div>
            <div className="adm-field">
              <label>E-mail</label>
              <input name="email" type="text" defaultValue={s.email} />
            </div>
            <div className="adm-field">
              <label>Bezoekadres</label>
              <input name="address" type="text" defaultValue={s.address} />
            </div>
            <div className="adm-field">
              <label>Postadres</label>
              <input name="postal" type="text" defaultValue={s.postal} />
            </div>
            <div className="adm-field">
              <label>KvK-nummer</label>
              <input name="kvk" type="text" defaultValue={s.kvk} />
            </div>
            <div className="adm-field">
              <label>BTW-nummer</label>
              <input name="btw" type="text" defaultValue={s.btw} />
            </div>
          </div>
          <div className="adm-field">
            <label>Tekst in de voettekst</label>
            <textarea name="footerText" rows={3} defaultValue={s.footerText} />
          </div>
          <button className="adm-btn" type="submit">Opslaan</button>
        </form>
      </div>
    </>
  );
}
