"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { C, Toggle, useReveal, useWidth } from "./chart";

const L = {
  en: {
    agents: ["Agent 1", "Agent 2", "Agent 3", "Asker"],
    chunk: (i: number) => `chunk ${i}`,
    board: "Board",
    empty: "nothing",
    shared: "Board shared",
    cut: "Board cut",
    mode: "Board",
    chance: "a guess: 1 in 64",
    step: ["Every agent reads its first chunk.", "Each posts one message to the board.", "In chunk 2 the asker reads the board with attention and answers.", ""],
    cutStep: "With the board cut, the asker can only read the empty entry, so it guesses.",
  },
  ja: {
    agents: ["エージェント 1", "エージェント 2", "エージェント 3", "質問役"],
    chunk: (i: number) => `チャンク ${i}`,
    board: "掲示板",
    empty: "なし",
    shared: "掲示板あり",
    cut: "掲示板を切断",
    mode: "掲示板",
    chance: "当て推量：64 分の 1",
    step: ["全エージェントが最初のチャンクを読みます。", "それぞれが掲示板にメッセージを 1 つ投稿します。", "チャンク 2 で質問役が掲示板をアテンションで読み、答えます。", ""],
    cutStep: "掲示板を切ると、質問役は空のエントリしか読めないので当て推量になります。",
  },
};

const FACTS = ["FACT k7 42", "FACT k3 19", "FACT k5 8", "ASK k7 ?"];
const SECOND = ["FACT k2 61", "FACT k9 30", "FACT k1 5", "ANS"];
const WEIGHTS = [0.86, 0.05, 0.04, 0.02]; // where the asker's attention goes: the agent that holds k7

export function SwarmBoard({ lang = "en" }: { lang?: "en" | "ja" }) {
  const T = L[lang];
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const { ref, show, reduce } = useReveal<SVGSVGElement>(0.4);
  const [mode, setMode] = useState<"shared" | "cut">("shared");
  const [phase, setPhase] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (!show) return;
    if (reduce) return setPhase(3);
    let p = 0;
    setPhase(0);
    const id = setInterval(() => {
      p = (p + 1) % 5;
      setPhase(Math.min(p, 3));
    }, 1500);
    return () => clearInterval(id);
  }, [show, reduce, mode]);

  const narrow = w < 560;
  const labelW = narrow ? 74 : 104;
  const boardW = narrow ? 92 : 150;
  const gap = 18;
  const laneX = labelW;
  const laneW = w - labelW - boardW - gap - 16;
  const chunkW = (laneW - 8) / 2;
  const rowH = 52;
  const top = 34;
  const h = top + 4 * rowH + 30;
  const bx = w - boardW - 8;
  const postX = bx + boardW / 2 + 14;
  const emptyY = top - 14;
  const rowY = (i: number) => top + i * rowH + rowH / 2;
  const cut = mode === "cut";

  return (
    <div ref={box} className="p-2 sm:p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <p className="min-h-[2.6em] max-w-[52ch] text-[0.82rem] leading-snug text-ink-2" aria-live="polite">
          {phase >= 2 && cut ? T.cutStep : T.step[Math.min(phase, 2)]}
        </p>
        <Toggle label={T.mode} value={mode} onChange={setMode} options={[{ v: "shared", label: T.shared }, { v: "cut", label: T.cut }]} />
      </div>
      <svg ref={ref} width={w} height={h} className="block max-w-full" role="img" aria-label={T.step.join(" ")}>
        {/* the board */}
        <rect x={bx} y={top - 30} width={boardW} height={4 * rowH + 34} rx={0} fill="var(--paper)" stroke={cut ? "color-mix(in srgb, var(--ink) 45%, transparent)" : "color-mix(in srgb, var(--signal) 35%, transparent)"} strokeDasharray={cut ? "4 4" : undefined} />
        <text x={bx + 14} y={h - 6} fontSize="0.6875rem" fill={C.mute}>{T.board}</text>
        <circle cx={bx + 22} cy={emptyY} r={6} fill="none" stroke={C.mute} strokeDasharray="2 2" />
        <text x={bx + 34} y={emptyY + 4} fontSize="0.6562rem" fill={C.faint}>{T.empty}</text>

        {T.agents.map((name, i) => (
          <g key={i}>
            <text x={0} y={rowY(i) + 4} fontSize={`${(narrow ? 10.5 : 12) / 16}rem`} fill={i === 3 ? C.exea : C.text}>
              {name}
            </text>
            {[0, 1].map((k) => {
              const active = (k === 0 && phase <= 1) || (k === 1 && phase >= 2);
              const isAns = i === 3 && k === 1;
              return (
                <g key={k}>
                  <rect x={laneX + k * (chunkW + 8)} y={rowY(i) - 16} width={chunkW} height={32} rx={0} fill={active ? "color-mix(in srgb, var(--signal) 10%, transparent)" : "transparent"} stroke={active ? "var(--signal)" : "var(--line-2)"} />
                  <text x={laneX + k * (chunkW + 8) + 12} y={rowY(i) + 4} fontSize={`${(narrow ? 9.5 : 11) / 16}rem`} fontFamily="var(--font-mono)" fill={C.text} style={{ fontStretch: "80%" }}>
                    {isAns ? (phase >= 2 ? (cut ? "ANS ?" : "ANS 42") : "ANS …") : k === 0 ? FACTS[i] : SECOND[i]}
                  </text>
                  {isAns && phase >= 2 && (
                    <motion.text key={mode} x={laneX + k * (chunkW + 8) + chunkW - 10} y={rowY(i) + 4} textAnchor="end" fontSize="0.625rem" fill={cut ? C.control : C.exea} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {cut ? (narrow ? "1/64" : T.chance) : "✓"}
                    </motion.text>
                  )}
                </g>
              );
            })}
            {/* the post from chunk 1 */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.circle
                  key={`post-${i}-${mode}`}
                  r={7}
                  fill={i === 0 ? C.exea : "color-mix(in srgb, var(--signal) 55%, transparent)"}
                  initial={{ cx: laneX + chunkW, cy: rowY(i), opacity: 0 }}
                  animate={{ cx: postX, cy: rowY(i), opacity: cut ? 0.25 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                />
              )}
            </AnimatePresence>
            {phase >= 1 && !narrow && (
              <text x={postX + 14} y={rowY(i) + 4} fontSize="0.625rem" fill={C.faint} fontFamily="var(--font-mono)" style={{ fontStretch: "80%" }}>
                {i === 0 ? "k7: 42" : i === 1 ? "k3: 19" : i === 2 ? "k5: 8" : ""}
              </text>
            )}
          </g>
        ))}

        {/* the asker reads the board in chunk 2 */}
        <AnimatePresence>
          {phase >= 2 &&
            (cut ? [{ y: emptyY, x: bx + 22, wgt: 1 }] : WEIGHTS.map((wgt, j) => ({ y: rowY(j), x: postX, wgt }))).map((t, j) => {
              const sx = laneX + chunkW + 8 + chunkW;
              const sy = rowY(3);
              return (
                <motion.path
                  key={`${mode}-${j}`}
                  d={`M ${sx} ${sy} C ${sx + 40} ${sy}, ${t.x - 50} ${t.y}, ${t.x - 8} ${t.y}`}
                  fill="none"
                  stroke={cut ? C.control : C.exea}
                  strokeWidth={0.8 + 4.5 * t.wgt}
                  strokeOpacity={0.3 + 0.7 * t.wgt}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: j * 0.06 }}
                />
              );
            })}
        </AnimatePresence>
        {[0, 1].map((k) => (
          <text key={k} x={laneX + k * (chunkW + 8) + chunkW / 2} y={top - 12} textAnchor="middle" fontSize="0.6562rem" fill={C.faint}>
            {T.chunk(k + 1)}
          </text>
        ))}
      </svg>
    </div>
  );
}
