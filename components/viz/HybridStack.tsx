"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { CIRCUITS, FAMILY_NAME, MODEL, byId, startingDraw, type Family } from "@/lib/circuits";
import type { Lang } from "@/lib/i18n";

/* An axonometric drawing of the 0.1B model: 14 plates, the five TONN layers carrying their 20 circuits, the residual
   stream as a dashed axis, dimension lines with end ticks. Ink line art on the sheet; signal orange marks the
   memory circuits and the layer in focus. */

const KX = 0.94; // a low dimetric view: plates read as plates, and the circuits on lower plates stay visible
const KY = 0.3;
const W = 250; // plate size along the width axis
const D = 170; // along the depth axis
const GAP = 30; // between plates
const OX = 300; // origin of the bottom plate's back corner
const OY = 448;

const iso = (x: number, y: number, z: number) => [OX + (x - y) * KX, OY + (x + y) * KY - z] as const;
const poly = (pts: (readonly [number, number])[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const quad = (x: number, y: number, w: number, d: number, z: number) => poly([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)]);

export function familyFill(f: Family): { fill: string; stroke: string; dash?: string } {
  switch (f) {
    case "memory":
      return { fill: "var(--signal)", stroke: "var(--signal)" };
    case "local":
      return { fill: "var(--ink)", stroke: "var(--ink)" };
    case "recurrent":
      return { fill: "url(#hatch)", stroke: "var(--ink)" };
    case "gate":
      return { fill: "var(--panel)", stroke: "var(--ink)" };
    case "attention":
      return { fill: "var(--panel)", stroke: "var(--ink)", dash: "2 2" };
  }
}

export function Hatch() {
  return (
    <defs>
      <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="var(--panel)" />
        <line x1="0" y1="0" x2="0" y2="5" stroke="var(--ink)" strokeWidth="1.2" />
      </pattern>
    </defs>
  );
}

const copy = {
  en: {
    overview: "ExeaLM at 0.1B: 14 layers, about 90M parameters.",
    overviewText: "Every third layer is a TONN layer, carrying 20 small circuits. The other nine are full attention. A gated MLP follows every layer.",
    tonn: (i: number) => `Layer ${i}, TONN`,
    tonnText: "20 circuits of 32 channels, one starting draw weighted toward short convolutions. Training swaps circuits. Retrieval (RG) and the agent board (AG), in orange, are pinned in every TONN layer.",
    attn: (i: number) => `Layer ${i}, attention`,
    attnText: "Causal attention with 10 heads of 64 channels and rotary positions. Each dot is one query reading one earlier key.",
    layers: "14 layers",
    width: "640 channels",
    resid: "residual stream",
  },
  ja: {
    overview: "0.1B の ExeaLM：14 層、約 9 千万パラメータ。",
    overviewText: "3 層に 1 層が TONN 層で、小さな回路を 20 個持ちます。残りの 9 層はフルアテンション。各層のあとにゲートつき MLP が続きます。",
    tonn: (i: number) => `第 ${i} 層：TONN`,
    tonnText: "32 チャネルの回路が 20 個。短い畳み込み寄りの初期配置の一例で、学習中に回路が入れ替わります。オレンジの検索（RG）とエージェント掲示板（AG）はすべての TONN 層に固定です。",
    attn: (i: number) => `第 ${i} 層：アテンション`,
    attnText: "64 チャネルのヘッド 10 個、回転位置埋め込みつきの因果アテンション。点ひとつが、1 つのクエリが前のキーを 1 つ読むことを表します。",
    layers: "14 層",
    width: "640 チャネル",
    resid: "残差ストリーム",
  },
};

function TonnCells({ layer, z }: { layer: number; z: number }) {
  const draw = useMemo(() => startingDraw(layer), [layer]);
  const pad = 14;
  const g = 6;
  const cw = (W - 2 * pad - 4 * g) / 5;
  const cd = (D - 2 * pad - 3 * g) / 4;
  return (
    <>
      {draw.map((id, k) => {
        const c = byId[id];
        const st = familyFill(c.family);
        const col = k % 5;
        const row = Math.floor(k / 5);
        return <polygon key={k} points={quad(pad + col * (cw + g), pad + row * (cd + g), cw, cd, z)} fill={st.fill} stroke={st.stroke} strokeWidth={0.9} strokeDasharray={st.dash} />;
      })}
    </>
  );
}

function AttnDots({ z }: { z: number }) {
  const n = 9;
  const dots = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      const [x, y] = iso(20 + (j * (W - 40)) / (n - 1), 18 + (i * (D - 36)) / (n - 1), z);
      dots.push(<circle key={`${i}-${j}`} cx={x} cy={y} r={i === j ? 1.6 : 1.1} fill="var(--ink)" opacity={i === j ? 0.8 : 0.4} />);
    }
  return <>{dots}</>;
}

export function HybridStack({ lang = "en", className = "" }: { lang?: "en" | "ja" | Lang; className?: string }) {
  const L = copy[lang as "en" | "ja"];
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, amount: 0.3 });
  const [focus, setFocus] = useState<number | null>(null);
  const [token, setToken] = useState(0);
  const layers = Array.from({ length: MODEL.layers }, (_, i) => i);
  const isTonn = (i: number) => MODEL.tonnLayers.includes(i);
  const show = seen || !!reduce;

  // a token travels up the residual stream: alive at rest, slow
  useEffect(() => {
    if (reduce || !show) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setToken(((now - t0) / 5200) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, show]);

  const counts = useMemo(() => {
    if (focus === null || !isTonn(focus)) return [];
    const m = new Map<string, number>();
    startingDraw(focus).forEach((id) => m.set(id, (m.get(id) ?? 0) + 1));
    return CIRCUITS.filter((c) => m.has(c.id)).map((c) => ({ c, n: m.get(c.id)! }));
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const top = (MODEL.layers - 1) * GAP;
  const [ax0, ay0] = iso(W / 2, D / 2, -18);
  const [ax1, ay1] = iso(W / 2, D / 2, top + 34);
  const tokZ = -18 + token * (top + 52);
  const [tx, ty] = iso(W / 2, D / 2, tokZ);
  const [r0x, r0y] = iso(W, 0, 0);
  const [r1x, r1y] = iso(W, 0, top);
  const [b0x, b0y] = iso(0, D, 0);
  const [b1x, b1y] = iso(W, D, 0);
  const mono = { fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" };

  return (
    <div ref={box} className={`relative ${className}`}>
      <svg viewBox="0 0 640 640" className="block h-auto w-full" role="img" aria-label={`${L.overview} ${L.overviewText}`} onMouseLeave={() => setFocus(null)}>
        <Hatch />
        <line x1={ax0} y1={ay0} x2={ax1} y2={ay1} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="4 4" />
        <path d={`M ${ax1 - 4} ${ay1 + 8} L ${ax1} ${ay1} L ${ax1 + 4} ${ay1 + 8}`} fill="none" stroke="var(--ink-3)" />
        <text x={ax1 + 10} y={ay1 + 4} style={mono} fill="var(--ink-3)">{L.resid.toUpperCase()}</text>

        {layers.map((i) => {
          const tonn = isTonn(i);
          const z = i * GAP + (focus === i ? 10 : 0);
          const dim = focus !== null && focus !== i;
          const [lx, ly] = iso(0, D, z);
          return (
            <motion.g
              key={i}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={show ? { opacity: dim ? 0.3 : 1, y: 0 } : {}}
              transition={{ opacity: { duration: focus !== null ? 0.2 : 0.5, delay: focus === null && !reduce ? 0.1 + i * 0.05 : 0 }, y: { duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] } }}
              onMouseEnter={() => setFocus(i)}
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus(null)}
              onClick={() => setFocus((f) => (f === i ? null : i))}
              tabIndex={0}
              role="button"
              aria-label={tonn ? L.tonn(i) : L.attn(i)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <polygon points={quad(0, 0, W, D, z)} fill="var(--panel)" fillOpacity={tonn ? 1 : 0.5} stroke={focus === i ? "var(--signal)" : tonn ? "var(--ink)" : "var(--ink-3)"} strokeWidth={focus === i ? 1.6 : tonn ? 1.2 : 0.8} />
              {tonn ? <TonnCells layer={i} z={z} /> : focus === i ? <AttnDots z={z} /> : null}
              <text x={lx - 10} y={ly + 4} textAnchor="end" style={mono} fill={focus === i ? "var(--signal-ink)" : tonn ? "var(--ink)" : "var(--ink-3)"}>
                {String(i).padStart(2, "0")}
                {tonn ? " TONN" : ""}
              </text>
            </motion.g>
          );
        })}

        {!reduce && show && <circle cx={tx} cy={ty} r={3.2} fill="var(--signal)" />}

        <g stroke="var(--ink-3)" strokeWidth={1}>
          <line x1={r0x + 26} y1={r0y} x2={r1x + 26} y2={r1y} />
          <line x1={r0x + 20} y1={r0y} x2={r0x + 32} y2={r0y} />
          <line x1={r1x + 20} y1={r1y} x2={r1x + 32} y2={r1y} />
          <line x1={b0x} y1={b0y + 22} x2={b1x} y2={b1y + 22} />
          <line x1={b0x} y1={b0y + 16} x2={b0x} y2={b0y + 28} />
          <line x1={b1x} y1={b1y + 16} x2={b1x} y2={b1y + 28} />
        </g>
        <text x={r0x + 34} y={(r0y + r1y) / 2} style={mono} fill="var(--ink-2)">{L.layers.toUpperCase()}</text>
        <text x={(b0x + b1x) / 2 + 8} y={(b0y + b1y) / 2 + 40} style={mono} fill="var(--ink-2)">{L.width.toUpperCase()}</text>
      </svg>

      <div className="grid gap-4 border-t border-[var(--line-2)] px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto]" aria-live="polite">
        <div className="min-h-[5.5rem]">
          {focus === null ? (
            <>
              <div className="text-[1.05rem] text-ink">{L.overview}</div>
              <p className="mt-1 text-[0.95rem] leading-snug text-ink-2">{L.overviewText}</p>
            </>
          ) : isTonn(focus) ? (
            <>
              <div className="text-[1.05rem] text-ink">{L.tonn(focus)}</div>
              <p className="mt-1 text-[0.95rem] leading-snug text-ink-2">{L.tonnText}</p>
              <p className="mono mt-2 text-ink-3">{counts.map(({ c, n }) => `${c.id}${n > 1 ? ` ×${n}` : ""}`).join("  ·  ")}</p>
            </>
          ) : (
            <>
              <div className="text-[1.05rem] text-ink">{L.attn(focus)}</div>
              <p className="mt-1 text-[0.95rem] leading-snug text-ink-2">{L.attnText}</p>
            </>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-1.5 self-start md:grid-cols-1" aria-label="Legend">
          {(["memory", "local", "recurrent", "gate", "attention"] as Family[]).map((f) => {
            const st = familyFill(f);
            return (
              <li key={f} className="flex items-center gap-2">
                <svg width="14" height="10" aria-hidden="true">
                  <rect x="0.5" y="0.5" width="13" height="9" fill={st.fill} stroke={st.stroke} strokeDasharray={st.dash} />
                </svg>
                <span className="mono text-ink-3">{FAMILY_NAME[f][lang as "en" | "ja"]}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
