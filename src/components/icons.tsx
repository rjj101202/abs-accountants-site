// Vaste iconenset (lijnstijl, past bij de huisstijl). Beheerders kiezen een
// icoon op naam in de editor; onbekende namen vallen terug op "shield".

const PATHS: Record<string, React.ReactNode> = {
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <rect x="7" y="12" width="3" height="5" />
      <rect x="12" y="8" width="3" height="9" />
      <rect x="17" y="5" width="3" height="12" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M7 21h10M5 7h14l-2-3H7L5 7Z" />
      <path d="M5 7 2 13a3 3 0 0 0 6 0L5 7ZM19 7l-3 6a3 3 0 0 0 6 0l-3-6Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20a5 5 0 0 1 10 0" />
      <path d="M16 6a3 3 0 0 1 0 6M20 20a5 5 0 0 0-3-4.6" />
    </>
  ),
  building: <path d="M3 21V9l6-5 6 5M9 21v-6h4v6M15 21V11l6 4v6" />,
  doc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h4M16 15v4" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 12h.01M3 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4 3 7 7 8 4-1 7-4 7-8V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  growth: (
    <>
      <path d="M17 3h4v4M21 3l-7 7-4-4-7 7" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  sprout: <path d="M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7ZM12 13c0-3 2-5 5-5 0 3-2 5-5 5Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M4 5c0-1 1-2 2-2h2l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5V18c0 1-1 2-2 2A15 15 0 0 1 4 5Z" />
  ),
  handshake: (
    <>
      <path d="M8 12 5 9l4-4 3 2 3-2 4 4-3 3" />
      <path d="m11 13 2 2 2-2 2 2" />
    </>
  ),
};

export function Icon({ name, size = 26 }: { name?: string; size?: number }) {
  const paths = PATHS[name ?? ""] ?? PATHS.shield;
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}
