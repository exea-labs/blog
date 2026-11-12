"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { FAMILY_NAME, byId, startingDraw } from "@/lib/circuits";
import { Hatch, familyFill } from "./HybridStack";
import { useReveal, useWidth } from "./chart";

const L = {
  en: {
    stages: [
      "Residual stream, 640 channels",
      "Input projection",
      "20 slots × streams A, B, C (32 channels each)",
      "One circuit per slot",
      "Unit scale per slot",
      "Mask (the search switches slots off to measure them)",
      "Output projection",
      "Add back to the residual stream",
      "Gated MLP",
    ],
    narrow: "Showing 10 of the 20 slots.",
    reads: (n: number) => (n === 1 ? "reads stream A" : n === 2 ? "reads streams A and B" : "reads streams A, B and C"),
    pick: "Point at a circuit to see what it computes and which streams it reads.",
    replay: "Replay",
    next: "to the next layer",
  },
  ja: {
    stages: [
      "残差ストリーム（640 チャネル）",
      "入力射影",
      "20 スロット × ストリーム A・B・C（各 32 チャネル）",
      "スロットごとに 1 つの回路",
      "スロットごとの単位スケール",
      "マスク（探索がスロットを止めて価値を測る）",
      "出力射影",
      "残差ストリームに足し戻す",
      "ゲートつき MLP",
    ],
    narrow: "20 スロットのうち 10 個を表示しています。",
    reads: (n: number) => (n === 1 ? "ストリーム A を読む" : n === 2 ? "ストリーム A と B を読む" : "ストリーム A・B・C を読む"),
    pick: "回路にカーソルを合わせると、計算の中身と読むストリームが表示されます。",
    replay: "もう一度再生",
    next: "次の層へ",
  },
};

const STREAM = ["var(--ink)", "var(--ink-2)", "var(--ink-3)"];

export function TonnLayer({ lang = "en", layer = 6 }: { lang?: "en" | "ja"; layer?: number }) {
  const T = L[lang];
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show, reduce } = useReveal<SVGSVGElement>(0.3);
  const [sel, setSel] = useState<number | null>(null);
  const [stage, setStage] = useState(-1);
  const sweep = useAnimationControls();
  const narrow = w < 600;
  const draw = useMemo(() => {
    const d = startingDraw(layer);
    return narrow ? d.filter((_, i) => i % 2 === 0) : d;
  }, [layer, narrow]);
  const N = draw.length;
  const padX = 14;
  const U = w - 2 * padX - 22; // leave room for the skip connection on the left
  const x0 = padX + 22;
  const g = U / N;
  const lw = Math.max(2, Math.min(7, (g - 10) / 3));
  const Y = { res: 30, inTop: 58, inBot: 112, lanesTop: 134, lanesBot: 198, cell: 222, cellH: 34, scale: 274, mask: 294, outTop: 322, outBot: 372, add: 400, mlp: 426, mlpH: 44, next: 500 };
  const h = 520;
  const stageY = [Y.res, (Y.inTop + Y.inBot) / 2, (Y.lanesTop + Y.lanesBot) / 2, Y.cell + Y.cellH / 2, Y.scale, Y.mask, (Y.outTop + Y.outBot) / 2, Y.add, Y.mlp + Y.mlpH / 2];

  const play = async () => {
    if (reduce) return setStage(8);
    setStage(-1);
    for (let i = 0; i < 9; i++) {
      setStage(i);
      await new Promise((r) => setTimeout(r, 420));
    }
  };
  useEffect(() => {
    if (show) play();
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (stage >= 0) sweep.start({ y: stageY[stage] + 14, opacity: 0.8, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } });
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const lit = (i: number) => stage >= i;
  const c = sel !== null ? byId[draw[sel]] : null;
  const fan = (top: number, bot: number, down: boolean) => {
    const a = `${x0},${down ? top : bot}`;
    const b = `${x0 + U},${down ? top : bot}`;
    const inset = U * 0.02;
    return `${a} ${b} ${x0 + U - inset},${down ? bot : top} ${x0 + inset},${down ? bot : top}`;
  };
  return (
    <div ref={box} className="relative p-2 sm:p-4">
      <svg ref={ref} width={w} height={h} className="block max-w-full" role="img" aria-label={T.stages.join(", ")}>
        <Hatch />
        <defs>
          <linearGradient id="tl-fan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ink)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--ink)" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="tl-fan-up" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="var(--ink)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--ink)" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="tl-sweep" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--signal)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--signal)" stopOpacity="0.1" />
            <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.rect x={0} width={w} height={1} fill="var(--signal)" initial={{ y: -40, opacity: 0 }} animate={sweep} />

        {/* skip connection */}
        <motion.path d={`M ${x0} ${Y.res} H ${padX + 6} V ${Y.add} H ${x0 - 12}`} fill="none" stroke="color-mix(in srgb, var(--ink) 35%, transparent)" strokeWidth={1.4} initial={{ pathLength: 0 }} animate={{ pathLength: lit(7) ? 1 : 0 }} transition={{ duration: 0.5 }} />

        {/* residual in */}
        <rect x={x0} y={Y.res - 6} width={U} height={12} rx={6} fill="color-mix(in srgb, var(--ink) 10%, transparent)" stroke={lit(0) ? "color-mix(in srgb, var(--ink) 50%, transparent)" : "color-mix(in srgb, var(--ink) 15%, transparent)"} />

        {/* input projection */}
        <motion.polygon points={fan(Y.inTop, Y.inBot, true)} fill="url(#tl-fan)" initial={{ opacity: 0 }} animate={{ opacity: lit(1) ? 1 : 0.15 }} />

        {draw.map((id, i) => {
          const cx = x0 + g * i + g / 2;
          const cc = byId[id];
          const used = cc.streams;
          const on = sel === null || sel === i;
          return (
            <g key={i} onMouseEnter={() => setSel(i)} onMouseLeave={() => setSel(null)} onFocus={() => setSel(i)} onBlur={() => setSel(null)} tabIndex={0} className="cursor-pointer outline-none">
              {[0, 1, 2].map((s) => {
                const lx = cx - (3 * lw + 4) / 2 + s * (lw + 2);
                const usedS = s < used;
                return (
                  <motion.rect
                    key={s}
                    x={lx}
                    width={lw}
                    rx={lw / 2}
                    fill={STREAM[s]}
                    initial={{ y: Y.lanesTop, height: 0, opacity: 0 }}
                    animate={{ y: Y.lanesTop, height: lit(2) ? Y.lanesBot - Y.lanesTop : 0, opacity: lit(2) ? (on ? (usedS ? 0.85 : 0.14) : 0.12) : 0 }}
                    transition={{ height: { delay: i * 0.012, duration: 0.4 }, opacity: { duration: 0.2 } }}
                  />
                );
              })}
              <motion.rect
                x={cx - (g - 6) / 2}
                y={Y.cell}
                width={g - 6}
                height={Y.cellH}
                rx={0}
                fill={familyFill(cc.family).fill}
                stroke={familyFill(cc.family).stroke}
                strokeDasharray={familyFill(cc.family).dash}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: lit(3) ? (on ? 0.95 : 0.3) : 0, scale: lit(3) ? (sel === i ? 1.08 : 1) : 0.6 }}
                transition={{ delay: lit(3) && stage === 3 ? i * 0.02 : 0, type: "spring", stiffness: 320, damping: 22 }}
                style={{ transformOrigin: `${cx}px ${Y.cell + Y.cellH / 2}px` }}
              />
              {g > 22 && (
                <motion.text x={cx} y={Y.cell + Y.cellH / 2 + 3.5} textAnchor="middle" fontSize={g > 30 ? 10 : 8.5} fontWeight={600} fill={cc.family === "memory" || cc.family === "local" ? "var(--panel)" : "var(--ink)"} fontFamily="var(--font-mono)" initial={{ opacity: 0 }} animate={{ opacity: lit(3) ? 0.85 : 0 }} style={{ fontStretch: "80%" }}>
                  {id}
                </motion.text>
              )}
              <motion.circle cx={cx} cy={Y.scale} r={Math.min(5, g / 5)} fill="none" stroke="var(--ink-2)" strokeWidth={1.3} initial={{ opacity: 0 }} animate={{ opacity: lit(4) ? (on ? 0.9 : 0.3) : 0 }} />
              <motion.rect x={cx - Math.min(4, g / 6)} y={Y.mask - 4} width={Math.min(8, g / 3)} height={8} rx={2.5} fill="var(--ink-2)" initial={{ opacity: 0 }} animate={{ opacity: lit(5) ? (on ? 0.8 : 0.25) : 0 }} />
              <rect x={cx - g / 2} y={Y.lanesTop} width={g} height={Y.mask - Y.lanesTop + 8} fill="transparent" />
            </g>
          );
        })}

        {/* output projection */}
        <motion.polygon points={fan(Y.outTop, Y.outBot, false)} fill="url(#tl-fan-up)" initial={{ opacity: 0 }} animate={{ opacity: lit(6) ? 1 : 0.15 }} />

        {/* add */}
        <rect x={x0} y={Y.add - 6} width={U} height={12} rx={6} fill="color-mix(in srgb, var(--ink) 10%, transparent)" stroke={lit(7) ? "color-mix(in srgb, var(--ink) 50%, transparent)" : "color-mix(in srgb, var(--ink) 15%, transparent)"} />
        <circle cx={x0 - 12} cy={Y.add} r={9} fill="var(--panel)" stroke={lit(7) ? "var(--ink)" : "color-mix(in srgb, var(--ink) 30%, transparent)"} strokeWidth={1.3} />
        <path d={`M ${x0 - 16} ${Y.add} h 8 M ${x0 - 12} ${Y.add - 4} v 8`} stroke="var(--ink)" strokeWidth={1.3} />

        {/* MLP */}
        <motion.rect x={x0 + U * 0.18} y={Y.mlp} width={U * 0.64} height={Y.mlpH} rx={0} fill="color-mix(in srgb, var(--ink) 05%, transparent)" stroke={lit(8) ? "color-mix(in srgb, var(--ink) 70%, transparent)" : "color-mix(in srgb, var(--ink) 15%, transparent)"} animate={{ opacity: lit(8) ? 1 : 0.4 }} />
        <line x1={x0 + U / 2} x2={x0 + U / 2} y1={Y.add + 6} y2={Y.mlp} stroke="color-mix(in srgb, var(--ink) 25%, transparent)" />
        <line x1={x0 + U / 2} x2={x0 + U / 2} y1={Y.mlp + Y.mlpH} y2={Y.next - 8} stroke="color-mix(in srgb, var(--ink) 25%, transparent)" />
        <text x={x0 + U / 2} y={Y.next + 6} textAnchor="middle" fontSize={11} fill="var(--ink-3)">{T.next}</text>

        {/* stage labels */}
        {T.stages.map((s, i) => (
          <motion.text
            key={i}
            x={i === 8 ? x0 + U / 2 : x0 + 6}
            y={i === 8 ? Y.mlp + Y.mlpH / 2 + 4 : [Y.res - 12, Y.inTop - 6, Y.lanesTop - 8, Y.cell - 8, Y.scale + 4, Y.mask + 4, Y.outTop - 6, Y.add - 12][i]}
            dx={i === 4 || i === 5 ? U * 0 : 0}
            textAnchor={i === 8 ? "middle" : "start"}
            fontSize={11.5}
            fill={stage === i ? "var(--ink)" : "var(--ink-3)"}
            animate={{ opacity: i === 4 || i === 5 ? 0 : lit(i) ? 1 : 0.35 }}
            style={{ paintOrder: "stroke", stroke: "var(--panel)", strokeWidth: 4, fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.04em" }}
            pointerEvents="none"
          >
            {s}
          </motion.text>
        ))}
      </svg>

      <div className="mt-1 flex flex-wrap items-start justify-between gap-3 px-1">
        <div className="min-h-[64px] max-w-[60ch] text-[0.84rem] leading-snug" aria-live="polite">
          {c ? (
            <>
              <div className="flex items-center gap-2 text-ink">
                <svg width="12" height="10" aria-hidden="true"><rect x="0.5" y="0.5" width="11" height="9" fill={familyFill(c.family).fill} stroke={familyFill(c.family).stroke} strokeDasharray={familyFill(c.family).dash} /></svg>
                <span className="font-[600]">{c.name[lang]}</span>
                <span className="num text-ink-3">{c.id}</span>
                <span className="text-ink-3">{FAMILY_NAME[c.family][lang]}, {T.reads(c.streams)}</span>
              </div>
              <div className="mt-1 text-ink-2">{c.what[lang]}</div>
            </>
          ) : (
            <div className="text-ink-3">
              {T.pick} {narrow ? T.narrow : ""}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.74rem] text-ink-3">
            <span>{T.stages[4]}: <span className="text-signal-ink">○</span></span>
            <span>{T.stages[5]}: <span className="text-signal-ink">▪</span></span>
          </div>
        </div>
        <button type="button" onClick={play} className="rounded-full px-3.5 py-1.5 text-[0.8rem] text-ink-2 border border-[var(--line-2)] hover:text-ink">
          {T.replay}
        </button>
      </div>
    </div>
  );
}
