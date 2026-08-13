import { asc } from "drizzle-orm";
import { db, teamMembers } from "@/db";
import { saveTeamMember, deleteTeamMember, moveTeamMember } from "../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormImageField } from "@/components/admin/form-image-field";

export const dynamic = "force-dynamic";

export default async function TeamAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.sort), asc(teamMembers.id));
  return (
    <>
      <h1>Team</h1>
      <p className="adm-sub">
        Deze medewerkers verschijnen automatisch op elke pagina met een team-blok, in de volgorde hieronder.
      </p>
      {ok ? <p className="adm-flash">Opgeslagen.</p> : null}
      {rows.map((m, i) => (
        <div className="adm-card" key={m.id}>
          <form action={saveTeamMember}>
            <input type="hidden" name="id" value={m.id} />
            <div className="adm-grid2">
              <div className="adm-field">
                <label>Naam</label>
                <input name="name" type="text" defaultValue={m.name} required />
              </div>
              <div className="adm-field">
                <label>Functie</label>
                <input name="role" type="text" defaultValue={m.role} placeholder="Bijv. AA-accountant" />
              </div>
            </div>
            <div className="adm-field">
              <label>Omschrijving</label>
              <textarea name="bio" rows={3} defaultValue={m.bio} />
            </div>
            <FormImageField name="photoUrl" label="Foto (leeg = initialen)" defaultValue={m.photoUrl} />
            <label className="adm-check">
              <input type="checkbox" name="visible" defaultChecked={m.visible} /> Zichtbaar op de site
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="adm-btn" type="submit">Opslaan</button>
              <button className="adm-btn sec sm" formAction={moveTeamMember} name="dir" value="up" disabled={i === 0}>
                ↑
              </button>
              <button
                className="adm-btn sec sm"
                formAction={moveTeamMember}
                name="dir"
                value="down"
                disabled={i === rows.length - 1}
              >
                ↓
              </button>
              <ConfirmButton className="adm-btn warn sm" message={`${m.name} verwijderen?`} formAction={deleteTeamMember}>
                Verwijderen
              </ConfirmButton>
            </div>
          </form>
        </div>
      ))}
      <h2>Nieuwe medewerker</h2>
      <div className="adm-card">
        <form action={saveTeamMember}>
          <div className="adm-grid2">
            <div className="adm-field">
              <label>Naam</label>
              <input name="name" type="text" required />
            </div>
            <div className="adm-field">
              <label>Functie</label>
              <input name="role" type="text" />
            </div>
          </div>
          <div className="adm-field">
            <label>Omschrijving</label>
            <textarea name="bio" rows={3} />
          </div>
          <FormImageField name="photoUrl" label="Foto (optioneel)" defaultValue="" />
          <label className="adm-check">
            <input type="checkbox" name="visible" defaultChecked /> Zichtbaar op de site
          </label>
          <button className="adm-btn" type="submit">Toevoegen</button>
        </form>
      </div>
    </>
  );
}
