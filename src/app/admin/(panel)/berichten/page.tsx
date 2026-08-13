import { desc } from "drizzle-orm";
import { db, messages } from "@/db";
import { markMessageRead, deleteMessage } from "../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const dynamic = "force-dynamic";

export default async function MessagesAdmin() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
  return (
    <>
      <h1>Berichten</h1>
      <p className="adm-sub">Inzendingen via het contactformulier op de site.</p>
      {rows.length === 0 && (
        <div className="adm-card">
          <p style={{ color: "var(--muted)" }}>Nog geen berichten ontvangen.</p>
        </div>
      )}
      {rows.map((m) => (
        <div className="adm-card" key={m.id} style={m.isRead ? { opacity: 0.75 } : undefined}>
          <div className="adm-row" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <div className="grow">
              <b>{m.name || "Zonder naam"}</b> {!m.isRead && <span className="adm-badge">nieuw</span>}
              <div className="dim">
                {m.contact} ·{" "}
                {m.createdAt.toLocaleString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{m.message}</p>
            </div>
            <form action={markMessageRead}>
              <input type="hidden" name="id" value={m.id} />
              {!m.isRead && (
                <button className="adm-btn sec sm" type="submit">
                  Markeer gelezen
                </button>
              )}
            </form>
            <form action={deleteMessage}>
              <input type="hidden" name="id" value={m.id} />
              <ConfirmButton className="adm-btn warn sm" message="Bericht verwijderen?">
                ✕
              </ConfirmButton>
            </form>
          </div>
        </div>
      ))}
    </>
  );
}
