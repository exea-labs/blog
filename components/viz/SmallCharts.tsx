"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { scaleLinear, scalePoint } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import relay from "@/data/relay.json";
import lookup from "@/data/lookup.json";
import swarm from "@/data/swarm_text.json";
import tok from "@/data/tokenizer.json";
import wiki from "@/data/rag_wiki.json";
import { Axis, C, DOMAIN_NAMES, Swatch, Toggle, useReveal, useWidth } from "./chart";

type Lang = "en" | "ja";
const pct = (v: number) => `${Math.round(v * 100)}%`;

function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.8rem] text-ink-2">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <Swatch color={i.color} dashed={i.dashed} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- relay */

export function RelayChart({ lang = "en" }: { lang?: Lang }) {
  const T = lang === "ja"
    ? { shared: "スウォームで学習、掲示板あり", cut: "同じモデル、テスト時に掲示板を切断", solo: "単独で学習", chance: "偶然（1.6%）", x: "学習ステップ", y: "正答率" }
    : { shared: "Trained as a swarm, board shared", cut: "Same model, board cut at test time", solo: "Trained alone", chance: "chance (1.6%)", x: "training step", y: "accuracy" };
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const runs = relay.runs.filter((r) => r.file === "relay_seed0.json");
  const sw = runs.find((r) => r.arm === "swarm")!;
  const so = runs.find((r) => r.arm === "solo")!;
  const h = 280;
  const m = { t: 14, r: 16, b: 36, l: 48 };
  const maxStep = Math.max(...sw.curve.map((c) => c.step));
  const x = scaleLinear().domain([0, maxStep]).range([m.l, w - m.r]);
  const y = scaleLinear().domain([0, 1]).range([h - m.b, m.t]);
  type P = { step: number; v: number };
  const mk = line<P>().x((p) => x(p.step)).y((p) => y(p.v)).curve(curveMonotoneX);
  const series = [
    { pts: [{ step: 0, v: relay.chance }, ...sw.curve.map((c) => ({ step: c.step, v: c.shared }))], color: C.exea, w: 2.4, dash: undefined },
    { pts: [{ step: 0, v: relay.chance }, ...sw.curve.map((c) => ({ step: c.step, v: c.cut }))], color: C.control, w: 2, dash: "5 4" },
    { pts: [{ step: 0, v: relay.chance }, ...so.curve.map((c) => ({ step: c.step, v: c.shared }))], color: C.llama, w: 2, dash: undefined },
  ];
  return (
    <div ref={box} className="p-2 sm:p-4">
      <Legend items={[{ color: C.exea, label: T.shared }, { color: C.control, label: T.cut, dashed: true }, { color: C.llama, label: T.solo }]} />
      <svg ref={ref} width={w} height={h} className="block max-w-full" role="img" aria-label={`${T.y} / ${T.x}`}>
        <Axis x={m.l} y={0} orient="left" ticks={[0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, p: y(v) }))} fmt={pct} length={w - m.r - m.l} />
        <Axis x={0} y={h - m.b + 6} orient="bottom" ticks={x.ticks(6).map((v) => ({ v, p: x(v) }))} fmt={(v) => v.toLocaleString()} length={0} />
        <line x1={m.l} x2={w - m.r} y1={y(relay.chance)} y2={y(relay.chance)} stroke={C.mute} strokeDasharray="2 4" />
        <text x={w - m.r} y={y(relay.chance) - 6} textAnchor="end" fontSize={10.5} fill={C.mute}>{T.chance}</text>
        {series.map((s, i) => (
          <motion.path key={i} d={mk(s.pts) ?? ""} fill="none" stroke={s.color} strokeWidth={s.w} strokeDasharray={s.dash} initial={s.dash ? { opacity: 0 } : { pathLength: 0 }} animate={show ? (s.dash ? { opacity: 1 } : { pathLength: 1 }) : {}} transition={{ duration: 1.3, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }} />
        ))}
        <text x={w - m.r} y={y(sw.shared) + 16} textAnchor="end" fontSize={11} fill={C.exea}>{pct(sw.shared)}</text>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- swarms on text */

export function SwarmTextChart({ lang = "en" }: { lang?: Lang }) {
  const T = lang === "ja"
    ? { shared: "スウォーム（掲示板あり）", cut: "スウォーム（テスト時に掲示板を切断）", ctrl: "対照（学習中も掲示板を切断）", x: "スウォーム内の位置", y: "bpb（低いほど良い）", seed: "シード", avg: "平均", agent: (i: number) => `${i} 番目` }
    : { shared: "Swarm, board shared", cut: "Swarm, board cut at test time", ctrl: "Control, board cut in training", x: "position in the swarm", y: "bits per byte (lower is better)", seed: "Seed", avg: "Average", agent: (i: number) => `agent ${i}` };
  const [seed, setSeed] = useState<"0" | "1" | "avg">("avg");
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const hy = swarm.filter((r) => r.kind === "hybrid");
  const pick = (arm: string, key: "shared_per_agent" | "cut_per_agent") => {
    const rows = hy.filter((r) => r.arm === arm && (seed === "avg" || String(r.seed) === seed));
    return [0, 1, 2, 3].map((i) => rows.reduce((a, r) => a + (r[key] as number[])[i], 0) / rows.length);
  };
  const s = { shared: pick("split", "shared_per_agent"), cut: pick("split", "cut_per_agent"), ctrl: pick("split_solo", "cut_per_agent") };
  const all = [...s.shared, ...s.cut, ...s.ctrl];
  const h = 280;
  const m = { t: 14, r: 20, b: 36, l: 54 };
  const x = scalePoint<number>().domain([0, 1, 2, 3]).range([m.l + 30, w - m.r - 30]);
  const y = scaleLinear().domain([Math.min(...all) - 0.003, Math.max(...all) + 0.003]).range([h - m.b, m.t]).nice();
  const mk = line<number>().x((_, i) => x(i)!).y((v) => y(v));
  const ser = [
    { k: "ctrl", v: s.ctrl, color: C.control, dash: undefined },
    { k: "cut", v: s.cut, color: C.exea, dash: "5 4" },
    { k: "shared", v: s.shared, color: C.exea, dash: undefined },
  ];
  const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
  return (
    <div ref={box} className="p-2 sm:p-4">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <Legend items={[{ color: C.exea, label: T.shared }, { color: C.exea, label: T.cut, dashed: true }, { color: C.control, label: T.ctrl }]} />
        <Toggle label={T.seed} value={seed} onChange={setSeed} options={[{ v: "0", label: `${T.seed} 0` }, { v: "1", label: `${T.seed} 1` }, { v: "avg", label: T.avg }]} />
      </div>
      <svg ref={ref} width={w} height={h} className="block max-w-full" role="img" aria-label={T.y}>
        <Axis x={m.l} y={0} orient="left" ticks={y.ticks(5).map((v) => ({ v, p: y(v) }))} fmt={(v) => v.toFixed(3)} length={w - m.r - m.l} />
        <Axis x={0} y={h - m.b + 6} orient="bottom" ticks={[0, 1, 2, 3].map((i) => ({ v: i, p: x(i)! }))} fmt={(i) => T.agent(i + 1)} length={0} />
        {ser.map((r, i) => (
          <g key={r.k}>
            <motion.path d={mk(r.v) ?? ""} fill="none" stroke={r.color} strokeWidth={2.2} strokeDasharray={r.dash} initial={{ opacity: 0 }} animate={show ? { opacity: 1, d: mk(r.v) ?? "" } : {}} transition={{ duration: 0.6, delay: i * 0.12 }} />
            {r.v.map((v, j) => (
              <motion.circle key={j} r={3.5} fill={r.dash ? "var(--panel)" : r.color} stroke={r.color} strokeWidth={1.6} initial={{ cx: x(j), cy: y(v), opacity: 0 }} animate={show ? { cx: x(j), cy: y(v), opacity: 1 } : {}} transition={{ delay: 0.5 + j * 0.05, type: "spring", stiffness: 260, damping: 24 }} />
            ))}
          </g>
        ))}
        <text x={w - m.r} y={m.t + 10} textAnchor="end" fontSize={11} fill={C.mute}>
          {lang === "ja" ? "対照との差" : "gain over control"}: <tspan fill={C.exea}>{(mean(s.ctrl) - mean(s.shared)).toFixed(3)}</tspan>
        </text>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- lookup */

export function LookupChart({ lang = "en" }: { lang?: Lang }) {
  const T = lang === "ja"
    ? { rag: "ライブラリあり", none: "ライブラリなしで学習したモデル", lib: (n: number) => `${n} 件`, x: "学習ステップ", y: "正答率" }
    : { rag: "Library attached", none: "Same model trained without a library", lib: (n: number) => `${n} facts`, x: "training step", y: "accuracy" };
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();
  const run = lookup.filter((r) => r.facts === 1024);
  const rag = run.find((r) => r.arm === "rag")!;
  const none = run.find((r) => r.arm === "none")!;
  const h = 280;
  const m = { t: 30, r: 16, b: 36, l: 48 };
  const x = scaleLinear().domain([0, 4000]).range([m.l, w - m.r]);
  const y = scaleLinear().domain([0, 1]).range([h - m.b, m.t]);
  type P = { step: number; v: number };
  const mk = line<P>().x((p) => x(p.step)).y((p) => y(p.v)).curve(curveMonotoneX);
  const start = { step: 0, v: 1 / 64 };
  return (
    <div ref={box} className="p-2 sm:p-4">
      <Legend items={[{ color: C.exea, label: T.rag }, { color: C.llama, label: T.none }]} />
      <svg ref={ref} width={w} height={h} className="block max-w-full" role="img" aria-label={`${T.y} / ${T.x}`}>
        <Axis x={m.l} y={0} orient="left" ticks={[0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, p: y(v) }))} fmt={pct} length={w - m.r - m.l} />
        <Axis x={0} y={h - m.b + 6} orient="bottom" ticks={x.ticks(5).map((v) => ({ v, p: x(v) }))} fmt={(v) => v.toLocaleString()} length={0} />
        {rag.curve.map((c, i) =>
          i === 0 || c.kb !== rag.curve[i - 1].kb ? (
            <motion.g key={c.step} initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: 0.3 + i * 0.12 }}>
              <line x1={x(c.step)} x2={x(c.step)} y1={m.t - 6} y2={h - m.b} stroke={C.grid} />
              <text x={x(c.step)} y={m.t - 12} textAnchor="middle" fontSize={10} fill={C.faint} fontFamily="var(--font-mono)" style={{ fontStretch: "80%" }}>
                {T.lib(c.kb ?? 0)}
              </text>
            </motion.g>
          ) : null,
        )}
        <motion.path d={mk([start, ...none.curve.map((c) => ({ step: c.step, v: c.attached }))]) ?? ""} fill="none" stroke={C.llama} strokeWidth={2} initial={{ pathLength: 0 }} animate={show ? { pathLength: 1 } : {}} transition={{ duration: 1.2 }} />
        <motion.path d={mk([start, ...rag.curve.map((c) => ({ step: c.step, v: c.attached }))]) ?? ""} fill="none" stroke={C.exea} strokeWidth={2.4} initial={{ pathLength: 0 }} animate={show ? { pathLength: 1 } : {}} transition={{ duration: 1.4, delay: 0.2 }} />
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- tokenizer */

export function TokenizerChart({ lang = "en" }: { lang?: Lang }) {
  const T = lang === "ja" ? { bpt: "1 トークンあたりのバイト数（多いほど詰め込める）", bpb: "13M モデルの bpb（低いほど良い）" } : { bpt: "Bytes per token (higher packs more text)", bpb: "Bits per byte of a 13M model (lower is better)" };
  const { ref, show } = useReveal<HTMLDivElement>();
  const doms = ["en", "ja_wiki", "ja_web", "code"] as const;
  const vocabs = [32768, 49152, 65536];
  const name = (v: number) => `${Math.round(v / 1024)}k`;
  const cmp = tok.compare as Record<string, number>[];
  const lm = tok.lm as { vocab: number; bits_per_byte: Record<string, number> }[];
  const maxB = 6.2;
  return (
    <div ref={ref} className="grid gap-6 p-3 sm:p-5 md:grid-cols-2">
      <div>
        <div className="mb-3 text-[0.84rem] font-[560] text-ink">{T.bpt}</div>
        <div className="space-y-3">
          {doms.map((d, di) => (
            <div key={d}>
              <div className="mb-1 text-[0.76rem] text-ink-2">{DOMAIN_NAMES[lang][d]}</div>
              {vocabs.map((v, vi) => {
                const val = cmp.find((r) => r.vocab === v)![`bytes_per_token_${d}`];
                return (
                  <div key={v} className="mb-[3px] flex items-center gap-2">
                    <span className="num w-7 text-[0.7rem] text-ink-3">{name(v)}</span>
                    <div className="relative h-[9px] flex-1 rounded-full bg-[var(--line)]">
                      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: v === 32768 ? C.exea : "color-mix(in srgb, var(--ink) 55%, transparent)" }} initial={{ width: 0 }} animate={show ? { width: `${(100 * val) / maxB}%` } : {}} transition={{ delay: 0.05 * (di * 3 + vi), duration: 0.6 }} />
                    </div>
                    <span className="num w-9 text-right text-[0.7rem] text-ink-2">{val.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3 text-[0.84rem] font-[560] text-ink">{T.bpb}</div>
        <div className="space-y-3">
          {doms.map((d, di) => {
            const vals = vocabs.map((v) => lm.find((r) => r.vocab === v)?.bits_per_byte[d] ?? NaN);
            const lo = Math.min(...vals);
            const hi = Math.max(...vals);
            return (
              <div key={d}>
                <div className="mb-1 text-[0.76rem] text-ink-2">{DOMAIN_NAMES[lang][d]}</div>
                <div className="relative h-[42px]  bg-[var(--line)]">
                  {vals.map((v, i) => {
                    const left = hi === lo ? 50 : 8 + (84 * (v - lo)) / (hi - lo);
                    return (
                      <motion.div key={i} className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${left}%` }} initial={{ opacity: 0, y: 6 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + di * 0.08 + i * 0.05 }}>
                        <span className="h-[10px] w-[10px] rounded-full" style={{ background: i === 0 ? C.exea : C.llama, boxShadow: v === lo ? "0 0 0 3px color-mix(in srgb, var(--signal) 25%, transparent)" : "none" }} />
                        <span className="num mt-0.5 text-[0.64rem] text-ink-3">{name(vocabs[i])} {v.toFixed(3)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- hit rate */

export function HitRate({ lang = "en" }: { lang?: Lang }) {
  const { ref, show } = useReveal<HTMLDivElement>();
  const find = (f: string) => wiki.find((r) => r.file === f)?.final.same_article_hits as number | undefined;
  const rows = [
    { label: lang === "ja" ? "学習したキー" : "Learned keys", v: find("rag_wiki_split_k128_seed0.json"), color: C.llama },
    { label: lang === "ja" ? "学習したキー＋近傍損失" : "Learned keys + neighbour loss", v: find("rag_wiki_split_ict_seed0.json"), color: C.llama },
    { label: lang === "ja" ? "学習したキー＋強い近傍損失" : "Learned keys + strong neighbour loss", v: find("rag_wiki_split_k128n1_seed0.json"), color: C.llama },
    { label: lang === "ja" ? "＋希少語キー（シード 0）" : "+ rare-word keys, seed 0", v: find("rag_wiki_split_lex_seed0.json"), color: C.exea },
    { label: lang === "ja" ? "＋希少語キー（シード 1）" : "+ rare-word keys, seed 1", v: (wiki.find((r) => r.file === "rag_wiki_split_lex_seed1.json" && r.arm === "rag")?.final.same_article_hits as number), color: C.exea },
    { label: lang === "ja" ? "オラクル検索（構造上 100%）" : "Oracle search (100% by construction)", v: 1, color: C.oracle },
  ];
  return (
    <div ref={ref} className="space-y-3 p-3 sm:p-5">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between text-[0.8rem]">
            <span className="text-ink-2">{r.label}</span>
            <span className="num" style={{ color: r.color }}>{r.v !== undefined ? `${(r.v * 100).toFixed(1)}%` : ""}</span>
          </div>
          <div className="relative h-[14px]  bg-[var(--line)]">
            <motion.div className="absolute inset-y-0 left-0 " style={{ background: r.color, opacity: r.color === C.oracle ? 0.5 : 0.9 }} initial={{ width: 0 }} animate={show ? { width: `${(r.v ?? 0) * 100}%` } : {}} transition={{ delay: 0.1 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </div>
      ))}
    </div>
  );
}
