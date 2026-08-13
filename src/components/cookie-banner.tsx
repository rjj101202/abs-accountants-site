"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("abs-cookies-ok")) setShow(true);
    } catch {
      // localStorage geblokkeerd: melding dan maar niet tonen
    }
  }, []);

  if (!show) return null;
  return (
    <div className="nm-cookies" role="dialog" aria-label="Cookiemelding">
      <p>
        Deze website gebruikt alleen functionele cookies en anonieme bezoekersstatistieken. Er worden geen
        persoonsgegevens opgeslagen of gedeeld met derden.
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem("abs-cookies-ok", "1");
          } catch {
            // niets aan te doen
          }
          setShow(false);
        }}
      >
        Begrepen
      </button>
    </div>
  );
}
