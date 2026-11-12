"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/** Fixed series styles: ExeaLM is the signal, Llama is ink, everything else is told apart by dashes. */
export const C = {
  exea: "var(--signal)", // ExeaLM hybrid
  llama: "var(--ink-2)", // Llama baseline
  tonn: "var(--ink-3)", // pure TONN
  control: "var(--ink-3)", // controls
  oracle: "var(--ink)", // oracle, references
  text: "var(--ink-2)",
  mute: "var(--ink-3)",
  faint: "var(--ink-3)",
  grid: "var(--line)",
};

export const DOMAIN_NAMES = {
  en: { en: "English", ja_wiki: "Japanese wiki", ja_web: "Japanese web", code: "Code", mean: "Mean" },
  ja: { en: "英語", ja_wiki: "日本語 Wikipedia", ja_web: "日本語 Web", code: "コード", mean: "平均" },
} as const;

/** Becomes true once the element has been on screen; charts draw in then. */
export function useReveal<T extends Element>(amount = 0.35) {
  const ref = useRef<T>(null);
  const seen = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();
  return { ref, show: seen || !!reduce, reduce: !!reduce };
}

/** Width of a container, for charts that redraw to fit. */
export function useWidth<T extends HTMLElement>(fallback = 720) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

export function Axis({ x, y, ticks, fmt, orient, length }: { x: number; y: number; ticks: { v: number; p: number }[]; fmt: (v: number) => string; orient: "bottom" | "left"; length: number }) {
  return (
    <g transform={`translate(${x},${y})`} fill="var(--ink-3)" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6562rem" }}>
      {orient === "bottom" ? (
        <>
          {ticks.map((t) => (
            <text key={t.v} x={t.p} y={16} textAnchor="middle">
              {fmt(t.v)}
            </text>
          ))}
        </>
      ) : (
        <>
          {ticks.map((t) => (
            <g key={t.v}>
              <line x1={0} x2={length} y1={t.p} y2={t.p} stroke={C.grid} />
              <text x={-8} y={t.p + 3.5} textAnchor="end">
                {fmt(t.v)}
              </text>
            </g>
          ))}
        </>
      )}
    </g>
  );
}

/** A set of chips; one is on. */
export function Toggle<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="chips">
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)} className="chip">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Swatch({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <svg width="18" height="8" aria-hidden="true" className="inline-block">
      <line x1="1" x2="17" y1="4" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={dashed ? "3 3" : undefined} />
    </svg>
  );
}

export function Tip({ x, y, w, children }: { x: number; y: number; w: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(8, x + 14), w - 236);
  return (
    <div className="pointer-events-none absolute z-10 w-[224px] border border-ink bg-panel px-3 py-2 text-[0.84rem] leading-snug text-ink-2" style={{ left, top: Math.max(4, y - 10), boxShadow: "6px 6px 0 var(--line)" }}>
      {children}
    </div>
  );
}
