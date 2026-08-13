import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nm-sec" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 className="nm-h2">Pagina niet gevonden</h1>
        <p className="nm-p">Deze pagina bestaat niet (meer).</p>
        <div className="nm-btns" style={{ justifyContent: "center" }}>
          <Link className="nm-btn" href="/">Naar de homepage</Link>
        </div>
      </div>
    </main>
  );
}
