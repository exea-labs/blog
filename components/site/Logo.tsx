/** The Exea mark, /E/, drawn from the logo file (public/exea-logo.png) as paths so it takes the ink colour. */
export function ExeaMark({ height = 14, className = "" }: { height?: number; className?: string }) {
  return (
    <svg viewBox="0 0 474 216" height={height} width={(height * 474) / 216} className={className} aria-hidden="true" fill="currentColor">
      <polygon points="0,216 52,216 139,0 87,0" />
      <path d="M156 0h150v42H198v45h94v42h-94v45h108v42H156z" />
      <polygon points="335,216 387,216 474,0 422,0" />
    </svg>
  );
}
