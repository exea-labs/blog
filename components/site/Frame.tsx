/** The drawing border: rulers along the top and left edges, registration marks in the corners. */
export function Frame() {
  const reg = (k: string) => (
    <svg key={k} className={`frame__reg frame__reg--${k}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  );
  return <div className="frame no-print" aria-hidden="true">{["tl", "tr", "bl", "br"].map(reg)}</div>;
}
