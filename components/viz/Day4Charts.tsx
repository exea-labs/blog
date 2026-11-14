"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { scaleLinear, scalePoint } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import full from "@/data/full_small.json";
import irl from "@/data/irl.json";
import reruns from "@/data/swarm_reruns.json";
import { Axis, C, DOMAIN_NAMES, Swatch, Tip, Toggle, useReveal, useWidth } from "./chart";

type Lang = "en" | "ja";
type Dom = "mean" | "en" | "ja_wiki" | "ja_web" | "code";
const DOMS = ["en", "ja_wiki", "ja_web", "code"] as const;
const sign = (v: number, d = 3) => (v > 0 ? `+${v.toFixed(d)}` : v.toFixed(d));

/* ---------------------------------------------------------------- the full 18M model: lead over Llama during training */

type Pt = { step: number; en: number; ja_wiki: number; ja_web: number; code: number };
type FullRun = { recipe: string; seed: number; curve: Pt[] };

export function GateCurves({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? { gated: "ExeaLM＋ゲート＋QK-norm", plain: "ExeaLM", search: "ExeaLM＋回路の探索", y: "同じバッチの Llama（ゲートなし）に対するリード（bpb）", x: "学習ステップ", domain: "テキストの種類", better: "Llama より良い ↑", gain: "ゲートの改善" }
      : { gated: "ExeaLM + gate + QK-norm", plain: "ExeaLM", search: "ExeaLM + circuit search", y: "lead over Llama on the same batches (no gate), bits per byte", x: "training step", domain: "Kind of text", better: "better than Llama ↑", gain: "gain from the gate" };
  const [dom, setDom] = useState<Dom>("mean");
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const runs = full.runs as FullRun[];
  const get = (recipe: string) => runs.find((r) => r.recipe === recipe && r.seed === 0)!;
  const r3 = (v: number) => Math.round((v + 1e-9) * 1000) / 1000;            // the tables subtract values rounded to 3 decimals
  const val = (p: Pt) => r3(dom === "mean" ? DOMS.reduce((a, d) => a + p[d], 0) / 4 : p[dom]);
  const llama = new Map(get("llama").curve.map((p) => [p.step, val(p)]));
  const lead = (recipe: string) => get(recipe).curve.filter((p) => llama.has(p.step)).map((p) => ({ step: p.step, v: llama.get(p.step)! - val(p) }));
  const series = [
    { k: "together_search", label: T.search, color: C.control, dash: "2 4", width: 1.8, pts: lead("together_search") },
    { k: "together", label: T.plain, color: C.exea, dash: "6 5", width: 2, pts: lead("together") },
    { k: "together_gated", label: T.gated, color: C.exea, dash: undefined, width: 2.6, pts: lead("together_gated") },
  ];
  const all = series.flatMap((s) => s.pts.map((p) => p.v));
  const h = 300;
  const m = { t: 18, r: 64, b: 38, l: 52 };
  const x = scaleLinear().domain([3000, 24000]).range([m.l, w - m.r]);
  const y = scaleLinear().domain([Math.min(0, ...all), Math.max(...all)]).range([h - m.b, m.t]).nice();
  const mk = line<{ step: number; v: number }>().x((p) => x(p.step)).y((p) => y(p.v)).curve(curveMonotoneX);
  const end = (s: (typeof series)[number]) => s.pts[s.pts.length - 1];
  const g = series[2].pts;
  const u = series[1].pts;
  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.8rem] text-ink-2">
          {[...series].reverse().map((s) => (
            <span key={s.k} className="flex items-center gap-2"><Swatch color={s.color} dashed={!!s.dash} />{s.label}</span>
          ))}
        </div>
        <Toggle label={T.domain} value={dom} onChange={setDom} options={(["mean", ...DOMS] as Dom[]).map((d) => ({ v: d, label: DOMAIN_NAMES[lang][d] }))} />
      </div>
      <svg ref={ref} width={w} height={h} role="img" aria-label={T.y} className="block max-w-full overflow-visible">
        <Axis x={m.l} y={0} orient="left" ticks={y.ticks(5).map((v) => ({ v, p: y(v) }))} fmt={(v) => sign(v, 2)} length={w - m.r - m.l} />
        <Axis x={0} y={h - m.b + 6} orient="bottom" ticks={(w < 560 ? [3000, 12000, 24000] : [3000, 6000, 12000, 18000, 24000]).map((v) => ({ v, p: x(v) }))} fmt={(v) => v.toLocaleString()} length={0} />
        <line x1={m.l} x2={w - m.r} y1={y(0)} y2={y(0)} stroke="color-mix(in srgb, var(--ink) 35%, transparent)" />
        <text x={m.l + 6} y={m.t + 4} fontSize="0.6562rem" fill={C.mute}>{T.better}</text>
        {/* the gate's gain: the band between the two ExeaLM lines */}
        <motion.path
          d={`${mk(g) ?? ""} L ${x(u[u.length - 1].step)} ${y(u[u.length - 1].v)} ${(mk([...u].reverse()) ?? "").replace(/^M/, "L")} Z`}
          fill="color-mix(in srgb, var(--signal) 14%, transparent)"
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
        />
        {series.map((s, i) => (
          <motion.path key={s.k} d={mk(s.pts) ?? ""} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} initial={s.dash ? { opacity: 0 } : { pathLength: 0 }} animate={show ? (s.dash ? { opacity: 1 } : { pathLength: 1 }) : {}} transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }} />
        ))}
        {series.map((s) =>
          s.pts.map((p) => (
            <circle
              key={`${s.k}${p.step}`}
              cx={x(p.step)}
              cy={y(p.v)}
              r={9}
              fill="transparent"
              tabIndex={0}
              className="cursor-pointer outline-none"
              aria-label={`${s.label}, ${p.step.toLocaleString()}: ${sign(p.v)}`}
              onMouseEnter={() => setHover({ x: x(p.step), y: y(p.v), text: `${s.label}, ${p.step.toLocaleString()}: ${sign(p.v)}` })}
              onFocus={() => setHover({ x: x(p.step), y: y(p.v), text: `${s.label}, ${p.step.toLocaleString()}: ${sign(p.v)}` })}
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
            />
          )),
        )}
        {(() => {
          const ends = [...series].map((s) => ({ s, py: y(end(s).v) + 4 })).sort((a, b) => a.py - b.py);
          for (let i = 1; i < ends.length; i++) ends[i].py = Math.max(ends[i].py, ends[i - 1].py + 13);
          return ends.map(({ s, py }) => (
            <text key={s.k} x={w - m.r + 8} y={py} fontSize="0.72rem" fontFamily="var(--font-mono)" fill={s.k === "together_search" ? C.mute : C.exea}>{sign(end(s).v)}</text>
          ));
        })()}
        <text x={x(g[3].step)} y={(y(g[3].v) + y(u[3].v)) / 2 + 4} textAnchor="middle" fontSize="0.66rem" fill="var(--signal-ink)">{T.gain}</text>
      </svg>
      <div className="mt-1 px-1 text-[0.76rem] text-ink-3">{T.x}</div>
      {hover && <Tip x={hover.x} y={hover.y} w={w}>{hover.text}</Tip>}
    </div>
  );
}

/* ---------------------------------------------------------------- the real-text test: gain per fine-tune and path */

type IrlRow = { key: string; none: number; gain: Record<string, number>; four_choice: Record<string, number | null>; baselines: Record<string, number> };
const PATHS = ["library", "library, perfect search", "board, live (swarm of 2)", "notes, own article", "notes, all articles"] as const;
type Path = (typeof PATHS)[number];

export function IrlGains({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? {
          rows: { start: "出発点（微調整なし）", control: "対照：元の組み合わせ、4,000 ステップ", practice: "実テキストの練習、4,000 ステップ", practice_bm25: "練習、学習中の検索に BM25", practice_null: "練習、「何も読まない」項目", wide_2k: "回路 3＋3、2,000 ステップ", wide_8k: "回路 3＋3、8,000 ステップ" } as Record<string, string>,
          paths: { library: "ライブラリ", "library, perfect search": "ライブラリ、完全な検索", "board, live (swarm of 2)": "掲示板、ライブ", "notes, own article": "ノート、自分の記事", "notes, all articles": "ノート、すべての記事" } as Record<Path, string>,
          path: "経路",
          x: "メモリなしに対する、再登場語あたりの改善（ビット）",
          better: "良い →",
          rag: (lo: string, hi: string) => `比較：BM25 RAG は +${lo}〜+${hi}、前半をコンテキストに入れると約 1.0（軸の外）`,
          four: (v: number) => `4 択 ${v.toFixed(2)}`,
        }
      : {
          rows: { start: "Start (no fine-tune)", control: "Control: old mix, 4,000 steps", practice: "Real-text practice, 4,000 steps", practice_bm25: "Practice, BM25 search", practice_null: "Practice, read-nothing entry", wide_2k: "3 + 3 circuits, 2,000 steps", wide_8k: "3 + 3 circuits, 8,000 steps" } as Record<string, string>,
          paths: { library: "Library, own search", "library, perfect search": "Library, perfect search", "board, live (swarm of 2)": "Board, live", "notes, own article": "Notes, own article", "notes, all articles": "Notes, all articles" } as Record<Path, string>,
          path: "Memory path",
          x: "gain in bits per re-mention against no memory",
          better: "better →",
          rag: (lo: string, hi: string) => `For scale: BM25 RAG gains +${lo} to +${hi}, the first half in context about 1.0 (off this scale)`,
          four: (v: number) => `four-choice ${v.toFixed(2)}`,
        };
  const [path, setPath] = useState<Path>("notes, own article");
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const rows = irl as IrlRow[];
  const narrow = w < 560;
  const labelW = narrow ? 0 : lang === "ja" ? 280 : 214;
  const rowH = narrow ? 44 : 32;
  const m = { t: 8, r: 70, b: 46, l: labelW + 12 };
  const h = m.t + m.b + rowH * rows.length;
  const vals = rows.map((r) => r.gain[path] ?? 0);
  const lo = Math.min(0, ...vals);
  const hi = Math.max(0, ...vals);
  const pad = Math.max(0.004, (hi - lo) * 0.08);
  const x = scaleLinear().domain([lo - (lo < 0 ? pad : 0), hi + (hi > 0 ? pad : 0)]).range([m.l, w - m.r]).nice();
  const rag = rows.map((r) => r.baselines.bm25_rag_64_255).filter((v) => v !== undefined);
  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <div className="mb-3">
        <Toggle label={T.path} value={path} onChange={setPath} options={PATHS.map((p) => ({ v: p, label: T.paths[p] }))} />
      </div>
      <svg ref={ref} width={w} height={h} role="img" aria-label={T.x} className="block max-w-full overflow-visible">
        {x.ticks(narrow ? 4 : 6).map((v) => (
          <line key={v} x1={x(v)} x2={x(v)} y1={m.t} y2={h - m.b} stroke={C.grid} />
        ))}
        <Axis x={0} y={h - m.b + 4} orient="bottom" ticks={x.ticks(narrow ? 4 : 6).map((v) => ({ v, p: x(v) }))} fmt={(v) => sign(v, Math.abs(hi - lo) > 1 ? 0 : Math.abs(hi - lo) > 0.2 ? 1 : 2)} length={0} />
        <line x1={x(0)} x2={x(0)} y1={m.t} y2={h - m.b} stroke="color-mix(in srgb, var(--ink) 45%, transparent)" />
        <text x={w - m.r} y={h - 4} textAnchor="end" fontSize="0.6562rem" fill={C.mute}>{T.better}</text>
        {rows.map((r, i) => {
          const v = r.gain[path] ?? 0;
          const cy = m.t + rowH * i + (narrow ? rowH - 14 : rowH / 2);
          const color = v > 0 ? C.exea : C.llama;
          const x0 = x(Math.min(0, v));
          const bw = Math.abs(x(v) - x(0));
          const fc = r.four_choice[path];
          const tip = `${T.rows[r.key]}: ${sign(v)}${fc ? `, ${T.four(fc)}` : ""}`;
          return (
            <g key={r.key}>
              <text x={narrow ? m.l : labelW} y={narrow ? cy - 11 : cy + 4} textAnchor={narrow ? "start" : "end"} fontSize="0.76rem" fill="var(--ink-2)">{T.rows[r.key]}</text>
              <motion.rect
                y={cy - 7}
                height={14}
                fill={color}
                initial={{ x: x(0), width: 0 }}
                animate={show ? { x: x0, width: Math.max(1, bw) } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 26, delay: show ? i * 0.03 : 0 }}
              />
              <rect x={m.l} y={cy - rowH / 2} width={w - m.l - m.r} height={rowH} fill="transparent" tabIndex={0} aria-label={tip} className="cursor-pointer outline-none"
                onMouseEnter={() => setHover({ x: x(v), y: cy, text: tip })} onFocus={() => setHover({ x: x(v), y: cy, text: tip })} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)} />
              <text x={w - m.r + 8} y={cy + 4} fontSize="0.72rem" fontFamily="var(--font-mono)" fill={v > 0 ? "var(--signal-ink)" : "var(--ink-2)"}>{sign(v)}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 px-1 text-[0.76rem] text-ink-3">{T.rag(Math.min(...rag).toFixed(2), Math.max(...rag).toFixed(2))}</div>
      {hover && <Tip x={hover.x} y={hover.y} w={w}>{hover.text}</Tip>}
    </div>
  );
}

/* ---------------------------------------------------------------- the swarm reruns against run-to-run noise */

type Rerun = { model: string; seam: string; seed: number; diff: number; swarm: number; control: number };

export function SwarmReruns({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? {
          row: (r: { model: string; seam: string }) => `${r.model === "hybrid" ? "ハイブリッド" : "TONN のみ"}、継ぎ目を${r.seam === "hidden" ? "隠す" : r.seam === "kept" ? "残す（元）" : "残す（再実行）"}`,
          x: "スウォーム − 対照（bpb）",
          better: "← スウォームが良い",
          worse: "対照が良い →",
          band: (v: string) => `同じ設定を 2 回学習したときの差（最大 ${v}）`,
          seed: (s: number) => `シード ${s}`,
        }
      : {
          row: (r: { model: string; seam: string }) => `${r.model === "hybrid" ? "Hybrid" : "Pure TONN"}, seams ${r.seam === "hidden" ? "hidden" : r.seam === "kept" ? "kept (original)" : "kept, rerun"}`,
          x: "swarm minus control, bits per byte",
          better: "← swarm better",
          worse: "control better →",
          band: (v: string) => `spread between two runs of the same setup (up to ${v})`,
          seed: (s: number) => `seed ${s}`,
        };
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const rows = reruns.rows as Rerun[];
  const groups = Array.from(new Map(rows.map((r) => [`${r.model}|${r.seam}`, { model: r.model, seam: r.seam }])).values());
  const narrow = w < 560;
  const labelW = narrow ? 0 : lang === "ja" ? 290 : 236;
  const rowH = narrow ? 44 : 34;
  const m = { t: 30, r: 20, b: 46, l: labelW + 12 };
  const h = m.t + m.b + rowH * groups.length;
  const lim = Math.max(...rows.map((r) => Math.abs(r.diff))) + 0.006;
  const x = scaleLinear().domain([-lim, lim]).range([m.l, w - m.r]).nice();
  const yk = scalePoint<string>().domain(groups.map((g) => `${g.model}|${g.seam}`)).range([m.t + rowH / 2, h - m.b - rowH / 2]);
  const noise = reruns.noise as number;
  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <svg ref={ref} width={w} height={h} role="img" aria-label={T.x} className="block max-w-full overflow-visible">
        <motion.rect x={x(-noise)} y={m.t - 8} width={x(noise) - x(-noise)} height={h - m.b - m.t + 8} fill="color-mix(in srgb, var(--ink) 9%, transparent)" initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ duration: 0.8 }} />
        <text x={x(0)} y={m.t - 14} textAnchor="middle" fontSize="0.64rem" fill={C.mute}>{T.band(noise.toFixed(3))}</text>
        {x.ticks(6).map((v) => (
          <line key={v} x1={x(v)} x2={x(v)} y1={m.t - 8} y2={h - m.b} stroke={C.grid} />
        ))}
        <line x1={x(0)} x2={x(0)} y1={m.t - 8} y2={h - m.b} stroke="color-mix(in srgb, var(--ink) 45%, transparent)" />
        <Axis x={0} y={h - m.b + 4} orient="bottom" ticks={x.ticks(narrow ? 4 : 6).map((v) => ({ v, p: x(v) }))} fmt={(v) => sign(v, 2)} length={0} />
        <text x={m.l} y={h - 4} fontSize="0.6562rem" fill={C.mute}>{T.better}</text>
        <text x={w - m.r} y={h - 4} textAnchor="end" fontSize="0.6562rem" fill={C.mute}>{T.worse}</text>
        {groups.map((g, i) => {
          const cy = yk(`${g.model}|${g.seam}`)!;
          const ours = g.model === "hybrid";
          return (
            <g key={i}>
              <text x={narrow ? m.l : labelW} y={narrow ? cy - 12 : cy + 4} textAnchor={narrow ? "start" : "end"} fontSize="0.76rem" fill="var(--ink-2)">{T.row(g)}</text>
              <line x1={m.l} x2={w - m.r} y1={cy} y2={cy} stroke={C.grid} strokeDasharray="1 5" />
              {rows.filter((r) => r.model === g.model && r.seam === g.seam).map((r) => {
                const tip = `${T.row(g)}, ${T.seed(r.seed)}: ${sign(r.diff)} (${r.swarm.toFixed(3)} − ${r.control.toFixed(3)})`;
                return (
                  <g key={r.seed}>
                    <motion.circle r={6} cy={cy} fill={r.seed === 0 ? (ours ? C.exea : C.llama) : "var(--panel)"} stroke={ours ? C.exea : C.llama} strokeWidth={2} initial={{ cx: x(0), opacity: 0 }} animate={show ? { cx: x(r.diff), opacity: 1 } : {}} transition={{ type: "spring", stiffness: 180, damping: 22, delay: show ? 0.2 + i * 0.08 : 0 }} />
                    <circle cx={x(r.diff)} cy={cy} r={12} fill="transparent" tabIndex={0} aria-label={tip} className="cursor-pointer outline-none"
                      onMouseEnter={() => setHover({ x: x(r.diff), y: cy, text: tip })} onFocus={() => setHover({ x: x(r.diff), y: cy, text: tip })} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[0.76rem] text-ink-3">
        <span className="flex items-center gap-1.5"><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill={C.exea} stroke={C.exea} strokeWidth="2" /></svg>{T.seed(0)}</span>
        <span className="flex items-center gap-1.5"><svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="var(--panel)" stroke={C.exea} strokeWidth="2" /></svg>{T.seed(1)}</span>
        <span>{T.x}</span>
      </div>
      {hover && <Tip x={hover.x} y={hover.y} w={w}>{hover.text}</Tip>}
    </div>
  );
}
