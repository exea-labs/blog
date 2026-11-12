"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { CIRCUITS, FAMILY_NAME, type Circuit } from "@/lib/circuits";
import { Hatch, familyFill } from "./HybridStack";

const N = 40;

/** One fixed toy input: three streams, deterministic. */
function streams() {
  let s = 12345;
  const r = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648 - 0.5;
  };
  const A = Array.from({ length: N }, (_, t) => 0.9 * Math.sin(t / 3.1) + 0.6 * r());
  const B = Array.from({ length: N }, (_, t) => 0.8 * Math.cos(t / 4.3) + 0.5 * r());
  const Cc = Array.from({ length: N }, (_, t) => 0.7 * Math.sin(t / 2.2 + 1) + 0.4 * r());
  return { A, B, C: Cc };
}

const silu = (x: number) => x / (1 + Math.exp(-x));
const sig = (x: number) => 1 / (1 + Math.exp(-x));

/** The real computation of each circuit type on the toy input (one channel; lags and decays fixed). */
function compute(id: string, { A, B, C }: { A: number[]; B: number[]; C: number[] }): number[] {
  const lag = (u: number[], k: number) => u.map((_, t) => (t - k >= 0 ? u[t - k] : 0));
  const leaky = (u: number[], lam: number) => {
    let s = 0;
    return u.map((v) => (s = lam * s + v));
  };
  switch (id) {
    case "D":
      return lag(A, 4);
    case "I":
      return leaky(A, 0.8).map((v) => v * 0.35);
    case "GI": {
      let s = 0;
      return A.map((a, t) => (s = sig(B[t] * 3 + 1) * s + a)).map((v) => v * 0.3);
    }
    case "M":
      return lag(A, 2).map((a, t) => a * B[t] * 1.6);
    case "MI":
      return leaky(lag(A, 2).map((a, t) => a * B[t]), 0.8).map((v) => v * 0.6);
    case "MIM":
      return leaky(lag(A, 2).map((a, t) => a * B[t]), 0.85).map((v, t) => v * C[t] * 1.2);
    case "EP": {
      let num = 0;
      let den = 0;
      return A.map((a, t) => {
        num = 0.9 * num + Math.exp(2 * a) * B[t];
        den = 0.9 * den + Math.exp(2 * a);
        return num / den;
      });
    }
    case "G":
      return A.map((a, t) => silu(2 * a) * B[t]);
    case "C":
      return A.map((a, t) => silu(1.4 * (a + (t >= 2 ? B[t - 2] : 0) + (t >= 4 ? C[t - 4] : 0))) * 0.7);
    case "RP":
      return A.map((a, t) => {
        let z = 0;
        let o = 0;
        for (let j = 0; j <= t; j++) {
          const w = Math.exp(3 * a * B[j] * Math.cos((t - j) / 6));
          z += w;
          o += w * C[j];
        }
        return o / z;
      });
    case "SM": {
      let s = 0;
      return A.map((a, t) => {
        const dt = Math.log(1 + Math.exp(2 * B[t]));
        s = Math.exp(-dt) * s + dt * a;
        return s;
      });
    }
    case "OS": {
      let re = 0;
      let im = 0;
      const r = 0.9;
      const w = 0.55;
      return A.map((a, t) => {
        const nr = r * (Math.cos(w) * re - Math.sin(w) * im) + a;
        const ni = r * (Math.sin(w) * re + Math.cos(w) * im);
        re = nr;
        im = ni;
        return re * sig(2 * B[t]) * 0.45;
      });
    }
    case "RG": {
      // once per chunk of 8: look up the library row whose key best matches the previous chunk, read its value
      const lib = [0.8, -0.6, 0.3, -0.9, 0.55];
      let cur = 0;
      return A.map((_, t) => {
        if (t % 8 === 0 && t > 0) {
          const q = A.slice(t - 8, t).reduce((p, v) => p + v, 0) / 8;
          cur = lib.reduce((best, v) => (Math.abs(v - q * 2) < Math.abs(best - q * 2) ? v : best), lib[0]);
        }
        return cur;
      });
    }
    case "AG": {
      // a teammate posts the mean of its chunk; this agent reads the latest post from the next chunk on
      let cur = 0;
      return A.map((_, t) => {
        if (t % 8 === 0 && t > 0) cur = B.slice(t - 8, t).reduce((p, v) => p + v, 0) / 8 * 1.6;
        return cur;
      });
    }
  }
  return A;
}

function Card({ c, lang, run }: { c: Circuit; lang: "en" | "ja"; run: boolean }) {
  const s = useMemo(streams, []);
  const out = useMemo(() => compute(c.id, s), [c.id, s]);
  const [t, setT] = useState(N);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const raf = useRef(0);
  useEffect(() => {
    if (reduce || !(run || hover)) {
      setT(N);
      return;
    }
    let start = 0;
    const dur = hover ? 2600 : 4200;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = ((now - start) % (dur + 900)) / dur;
      setT(Math.min(N, Math.floor(p * N) + 1));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [run, hover, reduce]);
  const W = 240;
  const H = 74;
  const sx = (i: number) => 6 + (i * (W - 12)) / (N - 1);
  const sy = (v: number) => H / 2 - v * 22;
  const color = "var(--signal)";
  const st = familyFill(c.family);
  const path = out.slice(0, t).map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${Math.max(3, Math.min(H - 3, sy(v))).toFixed(1)}`).join("");
  const chunked = c.id === "RG" || c.id === "AG";
  return (
    <div tabIndex={0} className="circuit-card bg-panel p-1 outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_4%,var(--panel))]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="flex items-start justify-between gap-2 px-2 pt-2">
        <div>
          <div className="text-[1rem] leading-tight text-ink">{c.name[lang]}</div>
          <div className="mt-0.5 text-[0.72rem] text-ink-3">{FAMILY_NAME[c.family][lang]}</div>
        </div>
        <span className="flex items-center gap-2">
          <svg width="14" height="10" aria-hidden="true">
            <rect x="0.5" y="0.5" width="13" height="9" fill={st.fill} stroke={st.stroke} strokeDasharray={st.dash} />
          </svg>
          <span className="mono text-ink">{c.id}</span>
        </span>
      </div>
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-[74px] w-full bg-paper" aria-hidden="true">
        {chunked && [8, 16, 24, 32].map((k) => <line key={k} x1={sx(k)} x2={sx(k)} y1={4} y2={H - 4} stroke="var(--line-2)" strokeDasharray="2 3" />)}
        {s.A.map((v, i) => (
          <rect key={i} x={sx(i) - 2} width={4} y={v > 0 ? sy(v) : H / 2} height={Math.abs(v) * 22} rx={1.5} fill="var(--line-2)" />
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {t < N && <line x1={sx(t - 1)} x2={sx(t - 1)} y1={3} y2={H - 3} stroke="color-mix(in srgb, var(--ink) 45%, transparent)" />}
      </svg>
      <p className="circuit-what">{c.what[lang]}</p>
      </div>
    </div>
  );
}

export function CircuitMenu({ lang = "en" }: { lang?: "en" | "ja" }) {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.15 });
  return (
    <div ref={box} className="grid gap-px bg-[var(--line-2)] sm:grid-cols-2 lg:grid-cols-3">
      <svg width="0" height="0" className="absolute" aria-hidden="true"><Hatch /></svg>
      {CIRCUITS.map((c) => (
        <Card key={c.id} c={c} lang={lang} run={inView} />
      ))}
      <div className="hidden bg-panel lg:block" aria-hidden="true" />
    </div>
  );
}
