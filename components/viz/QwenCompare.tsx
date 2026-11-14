"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { scaleLinear } from "d3-scale";
import data from "@/data/qwen.json";
import { Axis, C, DOMAIN_NAMES, Tip, Toggle, useReveal, useWidth } from "./chart";

type Dom = "mean" | "en" | "ja_wiki" | "ja_web" | "code";
type Run = { seed: number; steps: number; secs: number; params_M: number; mean: number; en: number; ja_wiki: number; ja_web: number; code: number };
type Model = { key: string; equal_steps: Run[]; equal_time: Run[] };
type Mode = "equal_steps" | "equal_time";

const NAMES = {
  en: {
    llama: "Llama",
    llama_gate: "Llama + gate + QK-norm",
    qwen35: "Qwen3.5-style",
    hybrid: "ExeaLM hybrid",
    hybrid_gate: "ExeaLM hybrid + gate + QK-norm",
    hybrid_gate_delta: "  + Gated DeltaNet",
  },
  ja: {
    llama: "Llama",
    llama_gate: "Llama＋ゲート＋QK-norm",
    qwen35: "Qwen3.5 型",
    hybrid: "ExeaLM ハイブリッド",
    hybrid_gate: "ExeaLM ハイブリッド＋ゲート＋QK-norm",
    hybrid_gate_delta: "　＋Gated DeltaNet",
  },
} as const;

const L = {
  en: {
    steps: `Equal steps (${data.steps.toLocaleString()})`,
    time: `Equal time (${data.budget_s} s)`,
    mode: "Comparison",
    domain: "Kind of text",
    x: "bits per byte, lower is better",
    better: "← better",
    seed: (n: number) => `seed ${n}`,
    tip: (name: string, r: Run, d: Dom) => `${name.trim()}, seed ${r.seed}: ${r[d].toFixed(3)} bits per byte. ${r.steps.toLocaleString()} steps, ${r.params_M.toFixed(1)}M parameters.`,
    stepsOf: (n: number) => `${n.toLocaleString()} steps`,
  },
  ja: {
    steps: `ステップ数をそろえる（${data.steps.toLocaleString()}）`,
    time: `学習時間をそろえる（${data.budget_s} 秒）`,
    mode: "比較",
    domain: "テキストの種類",
    x: "bpb（低いほど良い）",
    better: "← 良い",
    seed: (n: number) => `シード ${n}`,
    tip: (name: string, r: Run, d: Dom) => `${name.trim()}、シード ${r.seed}：${r[d].toFixed(3)} bpb。${r.steps.toLocaleString()} ステップ、${r.params_M.toFixed(1)}M パラメータ。`,
    stepsOf: (n: number) => `${n.toLocaleString()} ステップ`,
  },
};

const isOurs = (k: string) => k.startsWith("hybrid");
const isDefault = (k: string) => k === "hybrid_gate";

export function QwenCompare({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const N = NAMES[lang] as Record<string, string>;
  const [mode, setMode] = useState<Mode>("equal_steps");
  const [dom, setDom] = useState<Dom>("mean");
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show } = useReveal<SVGSVGElement>();

  const models = (data.models as Model[]).filter((m) => m[mode].length > 0);
  const narrow = w < 560;
  const labelW = narrow ? 0 : lang === "ja" ? 300 : 236;
  const rowH = narrow ? 52 : 38;
  const m = { t: 10, r: mode === "equal_time" ? 84 : 64, b: 40, l: labelW + 12 };
  const h = m.t + m.b + rowH * models.length;
  const all = models.flatMap((md) => md[mode].map((r) => r[dom]));
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = Math.max(0.004, (hi - lo) * 0.12);
  const x = scaleLinear().domain([lo - pad, hi + pad]).range([m.l, w - m.r]).nice();
  const ticks = x.ticks(narrow ? 4 : 6).map((v) => ({ v, p: x(v) }));
  const mean = (rs: Run[]) => rs.reduce((a, r) => a + r[dom], 0) / rs.length;

  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Toggle label={T.mode} value={mode} onChange={setMode} options={[{ v: "equal_steps", label: T.steps }, { v: "equal_time", label: T.time }]} />
        <Toggle
          label={T.domain}
          value={dom}
          onChange={setDom}
          options={(["mean", "en", "ja_wiki", "ja_web", "code"] as Dom[]).map((d) => ({ v: d, label: DOMAIN_NAMES[lang][d] }))}
        />
      </div>
      <svg ref={ref} width={w} height={h} role="img" aria-label={T.x} className="block max-w-full overflow-visible">
        {ticks.map((t) => (
          <line key={t.v} x1={t.p} x2={t.p} y1={m.t} y2={h - m.b} stroke={C.grid} />
        ))}
        <Axis x={0} y={h - m.b + 4} orient="bottom" ticks={ticks} fmt={(v) => v.toFixed(3)} length={0} />
        <text x={m.l} y={h - 6} fontSize="0.6562rem" fill={C.mute}>{T.better}</text>
        <text x={w - m.r} y={h - 6} textAnchor="end" fontSize="0.6562rem" fill={C.mute}>{T.x}</text>
        {models.map((md, i) => {
          const runs = md[mode];
          const cy = m.t + rowH * i + (narrow ? rowH - 16 : rowH / 2);
          const color = isOurs(md.key) ? C.exea : md.key === "qwen35" ? C.oracle : C.llama;
          const mu = mean(runs);
          const name = N[md.key];
          return (
            <g key={md.key}>
              <text
                x={narrow ? m.l : labelW}
                y={narrow ? cy - 14 : cy + 4}
                textAnchor={narrow ? "start" : "end"}
                fontSize="0.78rem"
                fontWeight={isDefault(md.key) ? 700 : 400}
                fill={isOurs(md.key) ? "var(--signal-ink, var(--signal))" : "var(--ink-2)"}
                style={{ whiteSpace: "pre" }}
              >
                {name}
              </text>
              <line x1={m.l} x2={w - m.r} y1={cy} y2={cy} stroke={C.grid} strokeDasharray="1 5" />
              <motion.line
                y1={cy - 9}
                y2={cy + 9}
                stroke={color}
                strokeWidth={2.5}
                initial={{ x1: x(mu), x2: x(mu), opacity: 0 }}
                animate={show ? { x1: x(mu), x2: x(mu), opacity: 1 } : {}}
                transition={{ type: "spring", stiffness: 260, damping: 26, delay: show ? 0 : 0.15 + i * 0.06 }}
              />
              {runs.map((r) => (
                <g key={r.seed}>
                  <motion.circle
                    r={5}
                    fill={r.seed === 0 ? color : "var(--panel)"}
                    stroke={color}
                    strokeWidth={2}
                    initial={{ cx: x(r[dom]), cy, opacity: 0 }}
                    animate={show ? { cx: x(r[dom]), cy, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  />
                  <circle
                    cx={x(r[dom])}
                    cy={cy}
                    r={12}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={T.tip(name, r, dom)}
                    onMouseEnter={() => setHover({ x: x(r[dom]), y: cy, text: T.tip(name, r, dom) })}
                    onFocus={() => setHover({ x: x(r[dom]), y: cy, text: T.tip(name, r, dom) })}
                    onMouseLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    className="cursor-pointer outline-none"
                  />
                </g>
              ))}
              <text x={w - m.r + 8} y={cy + 4} fontSize="0.72rem" fill={color} fontFamily="var(--font-mono)">
                {mu.toFixed(3)}
              </text>
              {mode === "equal_time" && (
                <text x={w - m.r + 8} y={cy + 17} fontSize="0.6rem" fill={C.mute} fontFamily="var(--font-mono)">
                  {T.stepsOf(runs[0].steps)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[0.76rem] text-ink-3">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill={C.llama} stroke={C.llama} strokeWidth="2" /></svg>
          {T.seed(0)}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="var(--panel)" stroke={C.llama} strokeWidth="2" /></svg>
          {T.seed(1)}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden="true"><line x1="6" x2="6" y1="1" y2="11" stroke={C.llama} strokeWidth="2.5" /></svg>
          {lang === "ja" ? "平均" : "mean of the seeds run"}
        </span>
      </div>
      {hover && <Tip x={hover.x} y={hover.y} w={w}>{hover.text}</Tip>}
    </div>
  );
}
