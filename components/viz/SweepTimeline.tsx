"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { scaleTime } from "d3-scale";
import timeline from "@/data/timeline.json";
import board from "@/data/leaderboard.json";
import { C, Tip, useReveal, useWidth } from "./chart";

type Run = { name: string; start: string; end: string | null; group: string };

const GROUPS: { id: string; color: string; en: string; ja: string }[] = [
  { id: "Hybrid layers, random start", color: C.tonn, en: "Hybrid layers, random start", ja: "ハイブリッド層（ランダムな初期配置）" },
  { id: "Convolution-heavy start", color: C.llama, en: "Convolution-heavy start", ja: "畳み込み寄りの初期配置" },
  { id: "Learning rates, longer runs", color: C.llama, en: "Learning rates, longer runs", ja: "学習率と長い学習" },
  { id: "Bigger models, equal steps", color: C.oracle, en: "Bigger models, equal steps", ja: "大きいモデル（ステップ数をそろえる）" },
  { id: "Equal compute", color: C.exea, en: "Equal compute", ja: "計算量をそろえた比較" },
  { id: "Layouts", color: C.tonn, en: "Layouts", ja: "層の並べ方" },
  { id: "Retrieval and swarms", color: C.control, en: "Retrieval and swarms on the hybrid", ja: "ハイブリッドでの検索とスウォーム" },
  { id: "Speed", color: C.llama, en: "Speed", ja: "速度" },
];

const L = {
  en: { running: "running", result: (m: string, s: number, v: number) => `${m}, seed ${s}: mean ${v.toFixed(3)} bits per byte`, minutes: (n: number) => `${n} min` },
  ja: { running: "実行中", result: (m: string, s: number, v: number) => `${m}、シード ${s}：平均 ${v.toFixed(3)} bpb`, minutes: (n: number) => `${n} 分` },
};

const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export function SweepTimeline({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const runs = timeline as Run[];
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>(0.25);
  const [hover, setHover] = useState<{ x: number; y: number; r: Run } | null>(null);
  const t0 = new Date(runs[0].start);
  const lastEnd = runs.reduce((a, r) => Math.max(a, new Date(r.end ?? r.start).getTime() + (r.end ? 0 : 50 * 60e3)), 0);
  const m = { l: 8, r: 8, t: 6, b: 26 };
  const lane = 38;
  const used = GROUPS.filter((g) => runs.some((r) => r.group === g.id));
  const h = used.length * lane + m.t + m.b;
  const x = scaleTime().domain([t0, new Date(lastEnd)]).range([m.l, w - m.r]);
  const ticks = x.ticks(w < 520 ? 4 : 8);
  const results = useMemo(() => {
    const byTag = new Map<string, { model: string; seed: number; mean: number }[]>();
    for (const r of board.rows) byTag.set(r.tag, [...(byTag.get(r.tag) ?? []), r]);
    return byTag;
  }, []);
  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <svg ref={ref} width={w} height={h} className="block max-w-full" role="img" aria-label="Sweep timeline">
        {ticks.map((t) => (
          <g key={t.getTime()}>
            <line x1={x(t)} x2={x(t)} y1={m.t} y2={h - m.b} stroke={C.grid} />
            <text x={x(t)} y={h - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10.5} fill={C.faint} style={{ fontStretch: "80%" }}>
              {fmtTime(t)}
            </text>
          </g>
        ))}
        {used.map((g, gi) => (
          <g key={g.id} transform={`translate(0, ${m.t + gi * lane})`}>
            <text x={m.l} y={11} fontSize={11} fill={C.mute}>
              {g[lang]}
            </text>
            {runs
              .filter((r) => r.group === g.id)
              .map((r) => {
                const s = new Date(r.start);
                const e = r.end ? new Date(r.end) : new Date(s.getTime() + 50 * 60e3);
                const x0 = x(s);
                const bw = Math.max(3, x(e) - x0 - 1.5);
                const order = runs.indexOf(r);
                return (
                  <motion.rect
                    key={r.name}
                    x={x0}
                    y={17}
                    height={14}
                    rx={1}
                    fill={g.color}
                    fillOpacity={r.end ? 0.85 : 0.35}
                    stroke={r.end ? "none" : g.color}
                    strokeDasharray={r.end ? undefined : "3 3"}
                    initial={{ width: 0, opacity: 0 }}
                    animate={show ? { width: bw, opacity: hover && hover.r.name !== r.name ? 0.45 : 1 } : {}}
                    transition={{ width: { delay: 0.1 + order * 0.035, duration: 0.45, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
                    onMouseEnter={() => setHover({ x: x0, y: m.t + gi * lane + 34, r })}
                    onMouseLeave={() => setHover(null)}
                    tabIndex={0}
                    onFocus={() => setHover({ x: x0, y: m.t + gi * lane + 34, r })}
                    onBlur={() => setHover(null)}
                    className="cursor-pointer outline-none"
                  />
                );
              })}
          </g>
        ))}
      </svg>
      {hover && (
        <Tip x={hover.x} y={hover.y} w={w}>
          <div className="font-mono text-[0.76rem] text-ink" style={{ fontStretch: "87.5%" }}>{hover.r.name}</div>
          <div className="num mt-0.5 text-[0.72rem] text-ink-3">
            {fmtTime(new Date(hover.r.start))}–{hover.r.end ? fmtTime(new Date(hover.r.end)) : T.running}
            {hover.r.end ? `, ${T.minutes(Math.round((new Date(hover.r.end).getTime() - new Date(hover.r.start).getTime()) / 60e3))}` : ""}
          </div>
          {(results.get(hover.r.name) ?? []).map((x) => (
            <div key={`${x.model}-${x.seed}`} className="mt-1 text-[0.76rem]" style={{ color: x.model === "llama" ? C.llama : C.exea }}>
              {T.result(x.model === "llama" ? "Llama" : "ExeaLM", x.seed, x.mean)}
            </div>
          ))}
        </Tip>
      )}
    </div>
  );
}
