"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import board from "@/data/leaderboard.json";
import { C, DOMAIN_NAMES, Toggle } from "./chart";

type Row = (typeof board.rows)[number];
type Key = "mean" | "en" | "ja_wiki" | "ja_web" | "code";

const sizeOf = (r: Row) => {
  const p = r.params_M ?? 0;
  if (p > 70) return "90M";
  if (p > 35) return "48M";
  if (p > 20) return "27M";
  return "13M";
};

const L = {
  en: {
    size: "Size",
    all: "All",
    model: (r: Row) => (r.model === "llama" ? "Llama" : r.model === "tonn_core_search" ? "TONN + search" : r.model === "tonn" ? "TONN + memory" : "TONN"),
    layout: (r: Row) => {
      const c = r.cfg as { attn_layers?: number[]; delta_layers?: number[]; attn_gate?: boolean; qk_norm?: boolean };
      const q = c.attn_gate || c.qk_norm ? ", gated + QK-norm" : "";
      if (r.model === "llama") return (c.delta_layers?.length ? `DeltaNet at ${c.delta_layers.join(", ")}` : "all attention") + q;
      if (!c.attn_layers) return "all TONN";
      return `attention at ${c.attn_layers.join(", ")}${q}` + (c.delta_layers?.length ? `, DeltaNet at ${c.delta_layers.join(", ")}` : "");
    },
    start: (r: Row) => ((r.cfg as { init_weights?: Record<string, number> }).init_weights?.C ? "conv start" : ""),
    budget: (r: Row) => (r.budget ? `${r.budget.toLocaleString()} s` : `${(r.steps ?? 3000).toLocaleString()} steps`),
    cols: ["Run", "Model", "Layout", "Budget", "lr", "Seed"],
    sort: "Sort by",
    note: "Bits per byte on held-out text, lower is better. Each row is one training run. Point at a column name to sort.",
  },
  ja: {
    size: "サイズ",
    all: "すべて",
    model: (r: Row) => (r.model === "llama" ? "Llama" : r.model === "tonn_core_search" ? "TONN＋探索" : r.model === "tonn" ? "TONN＋メモリ" : "TONN"),
    layout: (r: Row) => {
      const c = r.cfg as { attn_layers?: number[]; delta_layers?: number[]; attn_gate?: boolean; qk_norm?: boolean };
      const q = c.attn_gate || c.qk_norm ? "、ゲート＋QK-norm" : "";
      if (r.model === "llama") return (c.delta_layers?.length ? `DeltaNet：${c.delta_layers.join(", ")}` : "すべてアテンション") + q;
      if (!c.attn_layers) return "すべて TONN";
      return `アテンション：${c.attn_layers.join(", ")}${q}` + (c.delta_layers?.length ? `、DeltaNet：${c.delta_layers.join(", ")}` : "");
    },
    start: (r: Row) => ((r.cfg as { init_weights?: Record<string, number> }).init_weights?.C ? "畳み込み寄り" : ""),
    budget: (r: Row) => (r.budget ? `${r.budget.toLocaleString()} 秒` : `${(r.steps ?? 3000).toLocaleString()} ステップ`),
    cols: ["実行", "モデル", "層の構成", "予算", "学習率", "シード"],
    sort: "並べ替え",
    note: "評価用テキストのバイトあたりビット数。低いほど良い。1 行が 1 回の学習です。列名を押すと並べ替えます。",
  },
};

export function Leaderboard({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const [size, setSize] = useState<string>("all");
  const [key, setKey] = useState<Key>("mean");
  const rows = useMemo(() => (board.rows as Row[]).filter((r) => size === "all" || sizeOf(r) === size).sort((a, b) => (key === "mean" ? a.mean - b.mean : a.bpb[key] - b.bpb[key])), [size, key]);
  const vals = rows.map((r) => (key === "mean" ? r.mean : r.bpb[key]));
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return (
    <div className="p-2 sm:p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <Toggle label={T.size} value={size} onChange={setSize} options={[{ v: "all", label: T.all }, ...["13M", "27M", "48M", "90M"].map((s) => ({ v: s, label: s }))]} />
        <p className="max-w-[46ch] text-[0.76rem] text-ink-3">{T.note}</p>
      </div>
      <div className="overflow-x-auto  border border-[var(--line-2)]">
        <table className="w-full min-w-[66rem] border-collapse text-[0.8rem]">
          <thead>
            <tr className="text-left text-ink-2">
              <th className="px-3 py-2.5 font-[560]">#</th>
              {T.cols.map((c) => (
                <th key={c} className="px-3 py-2.5 font-[560]">{c}</th>
              ))}
              {(["en", "ja_wiki", "ja_web", "code", "mean"] as Key[]).map((k) => (
                <th key={k} className="px-3 py-2.5 font-[560]">
                  <button type="button" onClick={() => setKey(k)} className={`whitespace-nowrap ${key === k ? "text-signal-ink" : "hover:text-ink"}`} aria-pressed={key === k}>
                    {DOMAIN_NAMES[lang][k]}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const v = key === "mean" ? r.mean : r.bpb[key];
              const color = r.model === "llama" ? C.llama : C.exea;
              return (
                <motion.tr key={`${r.tag}-${r.model}-${r.seed}-${r.lr}`} layout transition={{ type: "spring", stiffness: 500, damping: 40 }} className="border-t border-[rgb(255_214_214/0.05)] hover:bg-[color-mix(in_srgb,var(--signal)_12%,transparent)]">
                  <td className="num px-3 py-2 text-ink-3">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-[0.74rem] text-ink-2" style={{ fontStretch: "80%" }}>
                    <a href={`https://github.com/exea-labs/ExeaLM/blob/main/${r.source}`} className="hover:text-signal-ink">{r.tag}</a>
                  </td>
                  <td className="px-3 py-2" style={{ color }}>{T.model(r)}</td>
                  <td className="px-3 py-2 text-ink-2">
                    {T.layout(r)}
                    {T.start(r) && <span className="ml-1.5 text-ink-3">{T.start(r)}</span>}
                  </td>
                  <td className="num px-3 py-2 text-ink-2">{T.budget(r)}</td>
                  <td className="num px-3 py-2 text-ink-2">{r.lr}</td>
                  <td className="num px-3 py-2 text-ink-2">{r.seed}</td>
                  {(["en", "ja_wiki", "ja_web", "code", "mean"] as Key[]).map((k) => (
                    <td key={k} className={`num px-3 py-2 ${k === key ? "text-ink" : "text-ink-2"}`}>
                      {k === key ? (
                        <span className="relative inline-flex items-center gap-2">
                          <span className="inline-block h-[6px] rounded-full" style={{ width: 8 + (36 * (hi - v)) / Math.max(1e-6, hi - lo), background: color, opacity: 0.8 }} />
                          {v.toFixed(3)}
                        </span>
                      ) : (
                        (k === "mean" ? r.mean : r.bpb[k]).toFixed(3)
                      )}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
