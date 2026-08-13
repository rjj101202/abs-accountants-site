import { redirect } from "next/navigation";
import { db, messages } from "@/db";

async function sendMessage(formData: FormData) {
  "use server";
  const name = String(formData.get("naam") ?? "").slice(0, 200);
  const contact = String(formData.get("contact") ?? "").slice(0, 200);
  const message = String(formData.get("bericht") ?? "").slice(0, 5000);
  const path = String(formData.get("pad") ?? "/");
  if (message.trim() || contact.trim()) {
    await db.insert(messages).values({ name, contact, message });
  }
  // Succesmelding werkt zonder JavaScript via het :target-anker.
  redirect(`${path}#bericht-verzonden`);
}

export function ContactForm({ path }: { path: string }) {
  return (
    <form className="nm-form" action={sendMessage} id="contactformulier">
      <input type="hidden" name="pad" value={path} />
      <p
        id="bericht-verzonden"
        style={{ background: "#e8f4e8", border: "1px solid #bcd9bc", color: "#295c29", borderRadius: 8, padding: "12px 16px" }}
        className="form-ok"
      >
        Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.
      </p>
      <div className="nm-field">
        <label htmlFor="naam">Naam</label>
        <input id="naam" name="naam" type="text" placeholder="Je naam of bedrijfsnaam" />
      </div>
      <div className="nm-field">
        <label htmlFor="contact">E-mail of telefoon</label>
        <input id="contact" name="contact" type="text" placeholder="Zodat we je kunnen bereiken" required />
      </div>
      <div className="nm-field">
        <label htmlFor="bericht">Je bericht</label>
        <textarea id="bericht" name="bericht" rows={4} placeholder="Waarmee kunnen we je helpen?" required />
      </div>
      <button className="nm-btn" type="submit">Verstuur bericht</button>
    </form>
  );
}
