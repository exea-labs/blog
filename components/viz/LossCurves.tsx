"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import curves from "@/data/curves.json";
import { Axis, C, Swatch, Toggle, useReveal, useWidth } from "./chart";

type Pt = { step: number; secs: number; loss: number };
type Curve = { tag: string; model: string; seed: number; params_M: number; points: Pt[] };

const SETS = {
  "100m": { hybrid: "eqt_100m_hybrid_lr1e3", llama: "eqt_100m_llama", label: { en: "0.1B (90M)", ja: "0.1B（9 千万）" } },
  big: { hybrid: "eqt_big_attn6", llama: "eqt_big_llama", label: { en: "48M", ja: "48M" } },
} as const;

const L = {
  en: { hybrid: "ExeaLM hybrid", llama: "Llama", x: "training time, seconds", y: "training loss", size: "Model size", step: "step" },
  ja: { hybrid: "ExeaLM ハイブリッド", llama: "Llama", x: "学習時間（秒）", y: "学習損失", size: "モデルサイズ", step: "ステップ" },
};

function at(points: Pt[], s: number) {
  if (s <= points[0].secs) return points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i].secs >= s) {
      const a = points[i - 1];
      const b = points[i];
      const f = (s - a.secs) / (b.secs - a.secs);
      return { secs: s, loss: a.loss + f * (b.loss - a.loss), step: Math.round(a.step + f * (b.step - a.step)) };
    }
  }
  return null;
}

export function LossCurves({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const [set, setSet] = useState<keyof typeof SETS>("100m");
  const [hx, setHx] = useState<number | null>(null);
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const h = 320;
  const m = { t: 18, r: 20, b: 40, l: 48 };
  const get = (tag: string) => (curves as Curve[]).find((c) => c.tag === tag);
  const hy = get(SETS[set].hybrid);
  const ll = get(SETS[set].llama);
  const pts = [...(hy?.points ?? []), ...(ll?.points ?? [])];
  const maxS = Math.max(...pts.map((p) => p.secs), 1);
  const x = scaleLinear().domain([0, maxS]).range([m.l, w - m.r]);
  const y = scaleLinear().domain([Math.min(...pts.map((p) => p.loss)) - 0.1, Math.min(7.6, Math.max(...pts.map((p) => p.loss)) + 0.1)]).range([h - m.b, m.t]).nice();
  const mk = useMemo(() => line<Pt>().x((p) => x(p.secs)).y((p) => y(p.loss)).curve(curveMonotoneX), [x, y]);
  if (!hy || !ll) return null;
  const s = hx === null ? null : x.invert(hx);
  const a = s === null ? null : at(hy.points, s);
  const b = s === null ? null : at(ll.points, s);
  const end = (c: Curve, color: string, name: string) => {
    const p = c.points[c.points.length - 1];
    return (
      <motion.g initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
        <circle cx={x(p.secs)} cy={y(p.loss)} r={4} fill={color} />
        <text x={x(p.secs) - 8} y={y(p.loss) + (color === C.exea ? 18 : -10)} textAnchor="end" fontSize="0.6875rem" fill={color}>
          {name} {p.loss.toFixed(3)}
        </text>
      </motion.g>
    );
  };
  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5 text-[0.8rem] text-ink-2">
          <span className="flex items-center gap-2"><Swatch color={C.exea} />{T.hybrid}</span>
          <span className="flex items-center gap-2"><Swatch color={C.llama} />{T.llama}</span>
        </div>
        <Toggle label={T.size} value={set} onChange={setSet} options={(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => ({ v: k, label: SETS[k].label[lang] }))} />
      </div>
      <svg
        ref={ref}
        width={w}
        height={h}
        className="block max-w-full touch-none"
        role="img"
        aria-label={`${T.y} / ${T.x}`}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = e.clientX - r.left;
          setHx(px >= m.l && px <= w - m.r ? px : null);
        }}
        onPointerLeave={() => setHx(null)}
      >
        <Axis x={m.l} y={0} orient="left" ticks={y.ticks(5).map((v) => ({ v, p: y(v) }))} fmt={(v) => v.toFixed(1)} length={w - m.r - m.l} />
        <Axis x={0} y={h - m.b + 6} orient="bottom" ticks={x.ticks(6).map((v) => ({ v, p: x(v) }))} fmt={(v) => `${v}`} length={0} />
        <text x={w - m.r} y={h - 4} textAnchor="end" fontSize="0.6562rem" fill={C.faint}>{T.x}</text>
        <motion.path key={`l-${set}`} d={mk(ll.points) ?? ""} fill="none" stroke={C.llama} strokeWidth={2} initial={{ pathLength: 0 }} animate={show ? { pathLength: 1 } : {}} transition={{ duration: 1.4, ease: "easeOut" }} />
        <motion.path key={`h-${set}`} d={mk(hy.points) ?? ""} fill="none" stroke={C.exea} strokeWidth={2.4} initial={{ pathLength: 0 }} animate={show ? { pathLength: 1 } : {}} transition={{ duration: 1.4, ease: "easeOut" }} />
        {end(hy, C.exea, T.hybrid)}
        {end(ll, C.llama, T.llama)}
        {hx !== null && (
          <g pointerEvents="none">
            <line x1={hx} x2={hx} y1={m.t} y2={h - m.b} stroke="color-mix(in srgb, var(--ink) 30%, transparent)" />
            {a && <circle cx={hx} cy={y(a.loss)} r={4} fill={C.exea} />}
            {b && <circle cx={hx} cy={y(b.loss)} r={4} fill={C.llama} />}
          </g>
        )}
      </svg>
      {hx !== null && s !== null && (
        <div className="pointer-events-none absolute top-14  px-3 py-2 text-[0.78rem] leading-snug" style={{ left: Math.min(hx + 18, w - 190), background: "var(--panel)", boxShadow: "inset 0 0 0 1px var(--line-2)" }}>
          <div className="num text-ink-3">{Math.round(s)} s</div>
          {a && <div style={{ color: C.exea }}>{T.hybrid}: {a.loss.toFixed(3)} <span className="text-ink-3">({T.step} {a.step})</span></div>}
          {b && <div style={{ color: C.llama }}>{T.llama}: {b.loss.toFixed(3)} <span className="text-ink-3">({T.step} {b.step})</span></div>}
        </div>
      )}
    </div>
  );
}
