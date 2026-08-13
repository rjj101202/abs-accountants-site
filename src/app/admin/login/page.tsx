import { login } from "../actions";

export const metadata = { title: "Inloggen | Beheer" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fout?: string }>;
}) {
  const { fout } = await searchParams;
  return (
    <div className="adm-login">
      <form action={login}>
        <h1>Beheer ABS Accountants</h1>
        {fout ? <p className="adm-flash err">Onjuist wachtwoord, probeer het opnieuw.</p> : null}
        <div className="adm-field">
          <label htmlFor="password">Wachtwoord</label>
          <input id="password" name="password" type="password" autoFocus required />
        </div>
        <button className="adm-btn" type="submit">Inloggen</button>
      </form>
    </div>
  );
}
