/** Line drawings for post cards, one per subject. Ink hairlines with one signal accent, on the sheet's paper.
 * Strokes with class cover-line draw in when the card is revealed. */

const ink = "var(--ink-2)";
const faint = "var(--line-2)";
const sig = "var(--signal)";

function Grid() {
  const v = [];
  for (let x = 20; x < 320; x += 20) v.push(<line key={`v${x}`} x1={x} x2={x} y1={0} y2={180} stroke="var(--grid)" />);
  for (let y = 20; y < 180; y += 20) v.push(<line key={`h${y}`} x1={0} x2={320} y1={y} y2={y} stroke="var(--grid)" />);
  return <g>{v}</g>;
}

/** Day 1: one TONN layer, slots with their three streams, a residual bar above and below. */
function Layer() {
  const slots = 10;
  return (
    <g fill="none" strokeWidth={1}>
      <line className="cover-line" style={{ ["--len" as string]: 260 }} x1={30} x2={290} y1={34} y2={34} stroke={ink} />
      <line className="cover-line" style={{ ["--len" as string]: 260 }} x1={30} x2={290} y1={150} y2={150} stroke={ink} />
      {Array.from({ length: slots }, (_, i) => {
        const x = 38 + i * 25;
        const mem = i >= slots - 2;
        return (
          <g key={i}>
            {[0, 1, 2].map((s) => (
              <line key={s} className="cover-line" style={{ ["--len" as string]: 40 }} x1={x + s * 5} x2={x + s * 5} y1={50} y2={90} stroke={s === 0 || i % 3 !== 1 ? ink : faint} />
            ))}
            <rect x={x - 3} y={100} width={16} height={16} stroke={mem ? sig : ink} fill={mem ? sig : i < 3 ? "var(--ink-2)" : "none"} className={mem && i === slots - 1 ? "cover-pulse" : undefined} />
            <line className="cover-line" style={{ ["--len" as string]: 20 }} x1={x + 5} x2={x + 5} y1={118} y2={136} stroke={faint} />
          </g>
        );
      })}
    </g>
  );
}

/** Agents and the board: four agents, a board, attention curves from the asker. */
function Board() {
  const rows = [42, 74, 106, 138];
  return (
    <g fill="none" strokeWidth={1}>
      {rows.map((y, i) => (
        <g key={y}>
          <rect x={26} y={y - 9} width={70} height={18} stroke={ink} />
          <rect x={102} y={y - 9} width={70} height={18} stroke={i === 3 ? sig : faint} />
          <circle cx={252} cy={y} r={5} fill={i === 0 ? sig : "var(--ink-3)"} stroke="none" className={i === 0 ? "cover-pulse" : undefined} />
        </g>
      ))}
      <rect x={226} y={22} width={60} height={136} stroke={ink} />
      {rows.map((y, i) => (
        <path key={i} className="cover-line" style={{ ["--len" as string]: 120 }} d={`M 172 138 C 200 138, 216 ${y}, 246 ${y}`} stroke={i === 0 ? sig : faint} strokeWidth={i === 0 ? 2 : 1} />
      ))}
    </g>
  );
}

/** The hybrid stack: plates in a low dimetric view, TONN plates carrying circuits. */
function Stack() {
  const KX = 0.94;
  const KY = 0.3;
  const P = (x: number, y: number, z: number) => [160 + (x - y) * KX, 112 + (x + y) * KY - z] as const;
  const quad = (z: number, w = 120, d = 80) => [P(0, 0, z), P(w, 0, z), P(w, d, z), P(0, d, z)].map((p) => p.join(",")).join(" ");
  const plates = Array.from({ length: 8 }, (_, i) => i);
  return (
    <g fill="none" strokeWidth={1}>
      {plates.map((i) => {
        const tonn = i % 3 === 0;
        return (
          <g key={i}>
            <polygon points={quad(i * 12)} stroke={tonn ? ink : faint} fill={tonn ? "var(--panel)" : "none"} />
            {tonn &&
              [0, 1, 2, 3].map((k) => {
                const [x, y] = P(14 + k * 26, 30, i * 12);
                return <rect key={k} x={x - 7} y={y - 3} width={14} height={6} fill={k === 3 ? sig : "var(--ink-2)"} stroke="none" />;
              })}
          </g>
        );
      })}
      <line className="cover-line" style={{ ["--len" as string]: 130 }} x1={P(60, 40, -10)[0]} x2={P(60, 40, 112)[0]} y1={P(60, 40, -10)[1]} y2={P(60, 40, 112)[1]} stroke={sig} strokeDasharray="3 3" />
    </g>
  );
}

/** Retrieval: chunks scattered by key, the query, lines to the four nearest. */
function Search() {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = Array.from({ length: 34 }, () => ({ x: 24 + r() * 272, y: 20 + r() * 140, a: Math.floor(r() * 5) }));
  const q = { x: 168, y: 92 };
  const near = [...pts].sort((a, b) => (a.x - q.x) ** 2 + (a.y - q.y) ** 2 - ((b.x - q.x) ** 2 + (b.y - q.y) ** 2)).slice(0, 4);
  return (
    <g strokeWidth={1}>
      {near.map((p, i) => (
        <line key={i} className="cover-line" style={{ ["--len" as string]: 140 }} x1={q.x} y1={q.y} x2={p.x} y2={p.y} stroke={i === 0 ? sig : faint} />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.2} fill={p.a === 0 ? sig : "var(--paper)"} stroke={p.a === 0 ? sig : ink} />
      ))}
      <circle cx={q.x} cy={q.y} r={8} fill="none" stroke="var(--ink)" strokeWidth={1.5} className="cover-pulse" />
    </g>
  );
}

/** Pull requests: seven branches merging into main. */
function Merge() {
  const y0 = 120;
  return (
    <g fill="none" strokeWidth={1.2}>
      <line className="cover-line" style={{ ["--len" as string]: 280 }} x1={20} x2={300} y1={y0} y2={y0} stroke={ink} />
      {Array.from({ length: 7 }, (_, i) => {
        const x = 46 + i * 36;
        const top = 40 + (i % 3) * 14;
        const leak = i === 6;
        return (
          <g key={i}>
            <path className="cover-line" style={{ ["--len" as string]: 120 }} d={`M ${x - 20} ${y0} C ${x - 20} ${top}, ${x} ${top}, ${x + 8} ${top} L ${x + 14} ${top} C ${x + 24} ${top}, ${x + 24} ${y0 - 20}, ${x + 26} ${y0}`} stroke={leak ? sig : faint} />
            <circle cx={x + 8} cy={top} r={3.5} fill={leak ? sig : "var(--paper)"} stroke={leak ? sig : ink} className={leak ? "cover-pulse" : undefined} />
            <circle cx={x + 26} cy={y0} r={3} fill="var(--ink)" stroke="none" />
          </g>
        );
      })}
    </g>
  );
}

const KINDS = { layer: Layer, board: Board, stack: Stack, search: Search, merge: Merge } as const;
export type CoverKind = keyof typeof KINDS;

export function PostCover({ kind }: { kind: string }) {
  const K = KINDS[kind as CoverKind] ?? Layer;
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Grid />
      <K />
    </svg>
  );
}
