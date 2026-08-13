import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABS Accountants & Belastingadviseurs",
  description:
    "Persoonlijk accountantskantoor in Spijkenisse: accountancy op AA-niveau, fiscale advisering en begeleiding van ondernemers en familiebedrijven.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
