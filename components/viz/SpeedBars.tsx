"use client";
import { motion } from "motion/react";
import speed from "@/data/speed.json";
import { C, useReveal } from "./chart";

const L = {
  en: {
    circuits: "One layer, forward and backward (ms)",
    before: "before",
    after: "after the prefix scan",
    attention: "attention block",
    models: "Training cost per token, relative to Llama (0.1B)",
    idle: "memory circuits idle",
    rag: "retrieval on",
    rows: { pure_tonn: "Pure TONN", hybrid_1to1: "Hybrid, half attention", hybrid_2to1: "Hybrid 2:1 (default)" } as Record<string, string>,
    llama: "Llama",
  },
  ja: {
    circuits: "1 層の順伝播と逆伝播（ミリ秒）",
    before: "改善前",
    after: "プレフィックススキャン後",
    attention: "アテンションブロック",
    models: "トークンあたりの学習コスト（Llama を 1 とした値、0.1B）",
    idle: "メモリ回路は休止",
    rag: "検索あり",
    rows: { pure_tonn: "純粋な TONN", hybrid_1to1: "ハイブリッド（アテンション半分）", hybrid_2to1: "ハイブリッド 2:1（標準）" } as Record<string, string>,
    llama: "Llama",
  },
};

type Row = { name: string; tokens_per_sec: number };

export function SpeedBars({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const { ref, show } = useReveal<HTMLDivElement>();
  const ms = speed.circuits_ms;
  const maxMs = 150;
  const circ = [
    { id: "GI", before: ms.before.GI, after: ms.after.GI },
    { id: "SM", before: ms.before.SM, after: ms.after.SM },
  ];
  const models = (["pure_tonn", "hybrid_1to1", "hybrid_2to1"] as const).map((k) => {
    const rows = (speed as unknown as Record<string, { rows: Row[] }>)[k].rows;
    const base = rows.find((r) => r.name === "llama")!.tokens_per_sec;
    const idle = base / rows.find((r) => r.name === "tonn, memory idle")!.tokens_per_sec;
    const rag = base / rows.find((r) => r.name === "tonn, retrieval on")!.tokens_per_sec;
    return { k, idle, rag };
  });
  const maxRel = 2.8;
  const bar = (v: number, max: number) => `${(100 * v) / max}%`;
  return (
    <div ref={ref} className="grid gap-8 p-3 sm:p-5 md:grid-cols-2">
      <div>
        <div className="text-[0.86rem] font-[560] text-ink">{T.circuits}</div>
        <div className="mt-4 space-y-4">
          {circ.map((c, i) => (
            <div key={c.id}>
              <div className="mb-1.5 flex items-baseline justify-between text-[0.8rem]">
                <span className="font-mono text-ink" style={{ fontStretch: "87.5%" }}>{c.id}</span>
                <span className="num text-ink-2">
                  {c.before} → <span className="text-signal-ink">{c.after}</span> ms
                </span>
              </div>
              <div className="relative h-[22px]  bg-[var(--line)]">
                <motion.div className="absolute inset-y-0 left-0 " style={{ background: "color-mix(in srgb, var(--ink) 28%, transparent)" }} initial={{ width: 0 }} animate={show ? { width: bar(c.before, maxMs) } : {}} transition={{ duration: 0.8, delay: 0.1 + i * 0.1 }} />
                <motion.div className="absolute inset-y-[4px] left-[4px] " style={{ background: C.exea }} initial={{ width: 0 }} animate={show ? { width: `calc(${bar(c.after, maxMs)} - 4px)` } : {}} transition={{ duration: 0.8, delay: 0.9 + i * 0.1, ease: [0.22, 1, 0.36, 1] }} />
                <div className="absolute inset-y-[-4px] w-px bg-[var(--bone)] opacity-50" style={{ left: bar(ms.attention, maxMs) }} />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.74rem] text-ink-3">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 " style={{ background: "color-mix(in srgb, var(--ink) 45%, transparent)" }} />{T.before}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 " style={{ background: C.exea }} />{T.after}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-[var(--bone)] opacity-60" />{T.attention} {ms.attention} ms</span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-[0.86rem] font-[560] text-ink">{T.models}</div>
        <div className="mt-4 space-y-3.5">
          {models.map((r, i) => (
            <div key={r.k}>
              <div className="mb-1.5 flex items-baseline justify-between text-[0.8rem]">
                <span className={r.k === "hybrid_2to1" ? "text-ink" : "text-ink-2"}>{T.rows[r.k]}</span>
                <span className="num text-ink-2">
                  <span className={r.k === "hybrid_2to1" ? "text-signal-ink" : "text-ink-2"}>{r.idle.toFixed(2)}×</span>
                  <span className="text-ink-3"> / {r.rag.toFixed(2)}×</span>
                </span>
              </div>
              <div className="relative h-[22px]  bg-[var(--line)]">
                <motion.div className="absolute inset-y-0 left-0 " style={{ background: "color-mix(in srgb, var(--ink) 20%, transparent)" }} initial={{ width: 0 }} animate={show ? { width: bar(r.rag, maxRel) } : {}} transition={{ duration: 0.8, delay: 0.2 + i * 0.12 }} />
                <motion.div className="absolute inset-y-[4px] left-[4px] " style={{ background: r.k === "hybrid_2to1" ? C.exea : C.tonn }} initial={{ width: 0 }} animate={show ? { width: `calc(${bar(r.idle, maxRel)} - 4px)` } : {}} transition={{ duration: 0.8, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }} />
                <div className="absolute inset-y-[-4px] w-px bg-[var(--silver)]" style={{ left: bar(1, maxRel) }} />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.74rem] text-ink-3">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 " style={{ background: C.tonn }} />{T.idle}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 " style={{ background: "color-mix(in srgb, var(--ink) 35%, transparent)" }} />{T.rag}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-[var(--silver)]" />{T.llama} = 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
