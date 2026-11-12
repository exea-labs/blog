"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { scaleLinear, scalePoint } from "d3-scale";
import { line } from "d3-shape";
import data from "@/data/comparisons.json";
import { Axis, C, DOMAIN_NAMES, Swatch, Tip, Toggle, useReveal, useWidth } from "./chart";

type Res = { en: number; ja_wiki: number; ja_web: number; code: number; mean: number; steps: number; seeds: number[] };
type Cmp = { size: string; budget?: number; hybrid: Res; llama: Res; note: string };
type Dom = "mean" | "en" | "ja_wiki" | "ja_web" | "code";

const L = {
  en: {
    steps: "Equal steps",
    time: "Equal compute (same training time)",
    first: "48M, first try (half attention)",
    alt: "0.1B, hybrid at lr 1.5e-3",
    y: "Hybrid's lead over Llama, bits per byte",
    better: "hybrid better",
    worse: "Llama better",
    domain: "Kind of text",
    seeds: (n: number) => (n === 1 ? "1 seed" : `${n} seeds`),
    tip: (c: Cmp, kind: string, d: Dom) =>
      `${c.size}, ${kind}: hybrid ${c.hybrid[d].toFixed(3)}, Llama ${c.llama[d].toFixed(3)}. Steps ${c.hybrid.steps.toLocaleString()} vs ${c.llama.steps.toLocaleString()}.`,
  },
  ja: {
    steps: "ステップ数をそろえた比較",
    time: "計算量をそろえた比較（同じ学習時間）",
    first: "48M の最初の試み（アテンション半分）",
    alt: "0.1B、ハイブリッドの学習率 1.5e-3",
    y: "Llama に対するハイブリッドのリード（bpb）",
    better: "ハイブリッドが良い",
    worse: "Llama が良い",
    domain: "テキストの種類",
    seeds: (n: number) => `シード ${n} 個`,
    tip: (c: Cmp, kind: string, d: Dom) =>
      `${c.size}、${kind}：ハイブリッド ${c.hybrid[d].toFixed(3)}、Llama ${c.llama[d].toFixed(3)}。ステップ ${c.hybrid.steps.toLocaleString()} 対 ${c.llama.steps.toLocaleString()}。`,
  },
};

export function EqualCompute({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const [dom, setDom] = useState<Dom>("mean");
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const h = 340;
  const m = { t: 24, r: 24, b: 40, l: 54 };
  const sizes = ["13M", "27M", "48M", "90M"];
  const x = scalePoint<string>().domain(sizes).range([m.l + 30, w - m.r - 30]);
  const lead = (c: Cmp) => c.llama[dom] - c.hybrid[dom];
  const steps = data.equal_steps as Cmp[];
  const time = data.equal_time as Cmp[];
  const first = data.first_48M as Cmp;
  const alt = data.alt_90M as Cmp;
  const all = [...steps, ...time, first, alt].map(lead);
  const lo = Math.min(-0.025, ...all) - 0.005;
  const hi = Math.max(0.05, ...all) + 0.005;
  const y = scaleLinear().domain([lo, hi]).range([h - m.b, m.t]).nice();
  const ticks = y.ticks(6).map((v) => ({ v, p: y(v) }));
  const path = useMemo(() => line<Cmp>().x((c) => x(c.size)!).y((c) => y(lead(c))), [x, y, dom]); // eslint-disable-line react-hooks/exhaustive-deps

  const point = (c: Cmp, kind: string, color: string, hollow: boolean, i: number) => {
    const cx = x(c.size)!;
    const cy = y(lead(c));
    return (
      <g key={`${kind}-${c.size}-${hollow}`}>
        <motion.circle
          cx={cx}
          cy={cy}
          fill={hollow ? "var(--panel)" : color}
          stroke={color}
          strokeWidth={2}
          initial={{ r: 0 }}
          animate={show ? { r: hollow ? 5.5 : 6 } : {}}
          transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill="transparent"
          tabIndex={0}
          aria-label={`${T.tip(c, kind, dom)} ${T.seeds(c.hybrid.seeds.length)}.`}
          onMouseEnter={() => setHover({ x: cx, y: cy, text: `${T.tip(c, kind, dom)} ${T.seeds(c.hybrid.seeds.length)}.` })}
          onFocus={() => setHover({ x: cx, y: cy, text: `${T.tip(c, kind, dom)} ${T.seeds(c.hybrid.seeds.length)}.` })}
          onMouseLeave={() => setHover(null)}
          onBlur={() => setHover(null)}
          className="cursor-pointer outline-none"
        />
      </g>
    );
  };

  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.8rem] text-ink-2">
          <span className="flex items-center gap-2"><Swatch color={C.exea} />{T.time}</span>
          <span className="flex items-center gap-2"><Swatch color={C.oracle} dashed />{T.steps}</span>
        </div>
        <Toggle
          label={T.domain}
          value={dom}
          onChange={setDom}
          options={(["mean", "en", "ja_wiki", "ja_web", "code"] as Dom[]).map((d) => ({ v: d, label: DOMAIN_NAMES[lang][d] }))}
        />
      </div>
      <svg ref={ref} width={w} height={h} role="img" aria-label={T.y} className="block max-w-full overflow-visible">
        <Axis x={m.l} y={0} orient="left" ticks={ticks} fmt={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))} length={w - m.r - m.l} />
        <line x1={m.l} x2={w - m.r} y1={y(0)} y2={y(0)} stroke="color-mix(in srgb, var(--ink) 35%, transparent)" />
        <text x={w - m.r} y={y(0) - 7} textAnchor="end" fontSize={10.5} fill={C.mute}>{T.better} ↑</text>
        <text x={w - m.r} y={y(0) + 15} textAnchor="end" fontSize={10.5} fill={C.mute}>{T.worse} ↓</text>
        <Axis x={0} y={h - m.b + 6} orient="bottom" ticks={sizes.map((s, i) => ({ v: i, p: x(s)! }))} fmt={(i) => sizes[i]} length={0} />
        <motion.path d={path(steps) ?? ""} fill="none" stroke={C.oracle} strokeWidth={1.8} strokeDasharray="4 5" initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ duration: 0.9 }} />
        <motion.path d={path(time) ?? ""} fill="none" stroke={C.exea} strokeWidth={2.4} initial={{ pathLength: 0 }} animate={show ? { pathLength: 1 } : {}} transition={{ duration: 1.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
        
        {steps.map((c, i) => point(c, T.steps, C.oracle, false, i))}
        {time.map((c, i) => point(c, T.time, C.exea, false, i + 1))}
        {point(first, T.first, C.control, true, 5)}
        {point(alt, T.alt, C.exea, true, 6)}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[0.76rem] text-ink-3">
        <span className="flex items-center gap-1.5"><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="var(--panel)" stroke={C.control} strokeWidth="2" /></svg>{T.first}</span>
        <span className="flex items-center gap-1.5"><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="var(--panel)" stroke={C.exea} strokeWidth="2" /></svg>{T.alt}</span>
      </div>
      {hover && <Tip x={hover.x} y={hover.y} w={w}>{hover.text}</Tip>}
    </div>
  );
}
