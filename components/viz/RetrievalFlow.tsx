"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import wiki from "@/data/rag_wiki.json";
import { C, Toggle, useReveal, useWidth } from "./chart";

type Lang = "en" | "ja";

/* ------------------------------------------------------------------ the design, step by step */

const STEPS = {
  en: [
    { t: "Read a chunk", d: "The circuit waits for a full chunk of 64 tokens. Retrieval runs once per chunk, using the chunk just read." },
    { t: "Encode it into a query", d: "The model's own chunk encoder (attention inside the chunk, then an MLP) pools the chunk into one vector." },
    { t: "Mix in the circuit's own view", d: "A learned share of the circuit's stream is added. It starts at zero, so early on the query is pure encoder." },
    { t: "Search the library", d: "Library keys come from the same encoder, so query and keys live in one space. The 4 best matches from other documents are kept." },
    { t: "Re-encode what came back", d: "The 4 chunks are encoded again with the current weights, so gradients reach the encoder through what was retrieved." },
    { t: "Read through the layer's own rows", d: "Retrieved tokens go through the layer's input projection. Keys look one token back, so finding a key and taking the token after it is one attention step. No gate." },
  ],
  ja: [
    { t: "チャンクを読む", d: "回路は 64 トークンのチャンクが揃うのを待ちます。検索はチャンクごとに 1 回、読んだばかりのチャンクを使って行います。" },
    { t: "クエリに符号化する", d: "モデル自身のチャンクエンコーダー（チャンク内のアテンションと MLP）が、チャンクを 1 つのベクトルにまとめます。" },
    { t: "回路自身の見方を足す", d: "回路のストリームを学習した割合だけ足します。割合はゼロから始まるので、最初はエンコーダーだけのクエリです。" },
    { t: "ライブラリを検索する", d: "ライブラリのキーも同じエンコーダーから作るので、クエリとキーは同じ空間にあります。ほかの文書から上位 4 件を取ります。" },
    { t: "取ってきたものを符号化し直す", d: "4 つのチャンクを現在の重みでもう一度符号化します。これで検索結果を通してエンコーダーに勾配が届きます。" },
    { t: "層自身の行で読む", d: "取ってきたトークンを層の入力射影に通します。キーは 1 トークン前を見るので、キーを見つけて次のトークンを取るのが 1 回のアテンションで済みます。ゲートはありません。" },
  ],
};

const TOKENS = ["The", "Thames", "flows", "east", "through", "central", "London", "to"];
const LIB = [
  { en: "London is the capital of England and…", ja: "ロンドンはイングランドの首都で…", s: 0.92, same: false },
  { en: "The Thames rises in the Cotswolds…", ja: "テムズ川はコッツウォルズに源を…", s: 0.88, same: false },
  { en: "Bridges over the river in London include…", ja: "ロンドンの川に架かる橋には…", s: 0.81, same: false },
  { en: "The estuary opens into the North Sea…", ja: "河口は北海に開いて…", s: 0.74, same: false },
  { en: "Paris lies on the Seine…", ja: "パリはセーヌ川沿いに…", s: 0.41, same: false },
  { en: "The 1952 smog killed thousands…", ja: "1952 年のスモッグは数千人の…", s: 0.33, same: false },
];

function Bar({ n = 14, seed = 1, color = C.exea, scale = 1 }: { n?: number; seed?: number; color?: string; scale?: number }) {
  const v = useMemo(() => Array.from({ length: n }, (_, i) => Math.abs(Math.sin(i * 1.7 + seed * 2.3)) * 0.85 + 0.15), [n, seed]);
  return (
    <div className="flex h-7 items-end gap-[3px]">
      {v.map((x, i) => (
        <motion.span key={i} className="w-[7px] " style={{ background: color }} initial={{ height: 2 }} animate={{ height: 4 + 22 * x * scale }} transition={{ delay: i * 0.025, type: "spring", stiffness: 260, damping: 20 }} />
      ))}
    </div>
  );
}

function Stage({ i, lang }: { i: number; lang: Lang }) {
  const chip = " px-2 py-1 font-mono text-[0.72rem] border border-[var(--line-2)]";
  if (i === 0)
    return (
      <div className="flex flex-wrap gap-1.5">
        {TOKENS.map((t, k) => (
          <motion.span key={t} className={`${chip} text-ink-2`} style={{ fontStretch: "80%" }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.06 }}>
            {t}
          </motion.span>
        ))}
        <span className="self-center text-[0.72rem] text-ink-3">… 64</span>
      </div>
    );
  if (i === 1 || i === 2)
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-14 text-[0.72rem] text-ink-3">{lang === "ja" ? "エンコーダー" : "encoder"}</span>
          <Bar seed={3} />
        </div>
        {i === 2 && (
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="w-14 text-[0.72rem] text-ink-3">+ α ×</span>
            <Bar seed={7} color={C.tonn} scale={0.35} />
          </motion.div>
        )}
      </div>
    );
  if (i === 3)
    return (
      <div className="space-y-1">
        {LIB.map((r, k) => (
          <motion.div key={k} className="flex items-center gap-2" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.05 }}>
            <div className="relative h-[6px] w-20 shrink-0 rounded-full bg-[var(--line)]">
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: k < 4 ? C.exea : C.faint }} initial={{ width: 0 }} animate={{ width: `${r.s * 100}%` }} transition={{ delay: 0.2 + k * 0.05 }} />
            </div>
            <span className={`truncate text-[0.76rem] ${k < 4 ? "text-ink-2" : "text-ink-3"}`}>{r[lang]}</span>
          </motion.div>
        ))}
      </div>
    );
  if (i === 4)
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {LIB.slice(0, 4).map((r, k) => (
          <motion.div key={k} className=" px-2.5 py-1.5 text-[0.74rem] text-ink-2 border border-signal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * 0.08 }}>
            <div className="truncate">{r[lang]}</div>
            <div className="mt-1">
              <Bar n={10} seed={k + 11} scale={0.6} />
            </div>
          </motion.div>
        ))}
      </div>
    );
  return (
    <div className="space-y-2 font-mono text-[0.74rem]" style={{ fontStretch: "80%" }}>
      <div className="flex flex-wrap items-center gap-1.5">
        {["Bridges", "over", "the", "river", "in", "London", "include"].map((t, k) => (
          <motion.span key={k} className={`${chip} ${t === "London" ? "text-ink border border-ink" : t === "include" ? "text-ink border border-signal" : "text-ink-2"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: k * 0.05 }}>
            {t}
          </motion.span>
        ))}
      </div>
      <div className="text-[0.74rem] text-ink-3" style={{ fontFamily: "var(--font-sans)" }}>
        {lang === "ja" ? "キー（ストリーム B）は 1 つ前のトークン「London」、値（ストリーム A）はその次のトークン。" : "Key (stream B): the token one back, London. Value (stream A): the token after it."}
      </div>
    </div>
  );
}

function Design({ lang }: { lang: Lang }) {
  const steps = STEPS[lang];
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const { ref, show, reduce } = useReveal<HTMLDivElement>(0.4);
  useEffect(() => {
    if (!show || !auto || reduce) return;
    const id = setInterval(() => setI((x) => (x + 1) % steps.length), 3000);
    return () => clearInterval(id);
  }, [show, auto, reduce, steps.length]);
  return (
    <div ref={ref} className="grid gap-4 p-2 sm:p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ol className="space-y-1">
        {steps.map((s, k) => (
          <li key={k}>
            <button
              type="button"
              onClick={() => {
                setAuto(false);
                setI(k);
              }}
              className={`flex w-full items-start gap-3  px-3 py-2 text-left transition-colors ${k === i ? "bg-[color-mix(in_srgb,var(--signal)_12%,transparent)] border border-signal" : "hover:bg-[var(--line)]"}`}
              aria-current={k === i ? "step" : undefined}
            >
              <span className={`num mt-[2px] text-[0.72rem] ${k === i ? "text-signal-ink" : "text-ink-3"}`}>{k + 1}</span>
              <span className={`text-[0.86rem] ${k === i ? "text-ink" : "text-ink-2"}`}>{s.t}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="flex min-h-[230px] flex-col  bg-paper p-4 border border-[var(--line-2)]">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-1 flex-col">
            <div className="flex-1">
              <Stage i={i} lang={lang} />
            </div>
            <p className="mt-4 text-[0.82rem] leading-snug text-ink-2">{steps[i].d}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ three searches over one library */

type Mode = "learned" | "lexical" | "oracle";
const ART = [C.exea, C.tonn, C.control, C.llama, C.oracle];

function points(mix: number) {
  let s = 4242;
  const r = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const centers = ART.map((_, a) => ({ x: 0.5 + 0.32 * Math.cos((a / ART.length) * Math.PI * 2 + 0.4), y: 0.5 + 0.34 * Math.sin((a / ART.length) * Math.PI * 2 + 0.4) }));
  const pts: { x: number; y: number; a: number }[] = [];
  for (let a = 0; a < ART.length; a++)
    for (let j = 0; j < 7; j++) {
      const rx = 0.08 + 0.84 * r();
      const ry = 0.1 + 0.8 * r();
      pts.push({ x: mix * (centers[a].x + 0.06 * (r() - 0.5)) + (1 - mix) * rx, y: mix * (centers[a].y + 0.06 * (r() - 0.5)) + (1 - mix) * ry, a });
    }
  const q = { x: mix * centers[1].x + (1 - mix) * 0.46, y: mix * centers[1].y + (1 - mix) * 0.52, a: 1 };
  return { pts, q };
}

function Search({ lang }: { lang: Lang }) {
  const [mode, setMode] = useState<Mode>("learned");
  const { ref: box, w } = useWidth<HTMLDivElement>();
  const h = Math.min(360, Math.max(260, w * 0.5));
  const hits = {
    learned: wiki.find((r) => r.file === "rag_wiki_split_k128_seed0.json")?.final.same_article_hits as number,
    lexical: wiki.find((r) => r.file === "rag_wiki_split_lex_seed0.json")?.final.same_article_hits as number,
    oracle: 1,
  };
  const { pts, q } = useMemo(() => points(mode === "learned" ? 0.12 : mode === "lexical" ? 0.5 : 0.5), [mode]);
  const pool = mode === "oracle" ? pts.filter((p) => p.a === q.a) : pts;
  const top = [...pool].sort((a, b) => (a.x - q.x) ** 2 + (a.y - q.y) ** 2 - ((b.x - q.x) ** 2 + (b.y - q.y) ** 2)).slice(0, 4);
  const X = (v: number) => 16 + v * (w - 32);
  const Y = (v: number) => 10 + v * (h - 20);
  const T = lang === "ja"
    ? { learned: "学習したキー", lexical: "＋希少語キー", oracle: "オラクル検索", rate: "正しい記事が上位 4 件に入る割合（測定値、シード 0）", mode: "検索の方法", query: "クエリ" }
    : { learned: "Learned keys", lexical: "+ rare-word keys", oracle: "Oracle search", rate: "right article in the top 4 (measured, seed 0)", mode: "Search", query: "query" };
  return (
    <div ref={box} className="p-2 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Toggle label={T.mode} value={mode} onChange={setMode} options={(["learned", "lexical", "oracle"] as Mode[]).map((m) => ({ v: m, label: T[m] }))} />
        <div className="text-right">
          <motion.div key={mode} className="font-serif text-[1.6rem] font-[600] leading-none text-ink" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {(hits[mode] * 100).toFixed(mode === "oracle" ? 0 : 1)}%
          </motion.div>
          <div className="mt-1 text-[0.72rem] text-ink-3">{T.rate}</div>
        </div>
      </div>
      <svg width={w} height={h} className="block max-w-full  bg-paper" role="img" aria-label={T.rate}>
        {top.map((p, k) => (
          <motion.line key={`${mode}-${k}`} x1={X(q.x)} y1={Y(q.y)} initial={{ x2: X(q.x), y2: Y(q.y) }} animate={{ x2: X(p.x), y2: Y(p.y) }} transition={{ delay: 0.35 + k * 0.08, duration: 0.4 }} stroke={p.a === q.a ? "var(--signal)" : "var(--ink-3)"} strokeWidth={p.a === q.a ? 2 : 1} strokeOpacity={0.9} />
        ))}
        {pts.map((p, k) => (
          <motion.circle key={k} r={top.includes(p) ? 6 : 4.5} fill={p.a === q.a ? "var(--signal)" : "var(--panel)"} stroke={p.a === q.a ? "var(--signal)" : "var(--ink-2)"} strokeWidth={1.2} animate={{ cx: X(p.x), cy: Y(p.y), opacity: mode === "oracle" && p.a !== q.a ? 0.15 : top.includes(p) ? 1 : 0.7 }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
        ))}
        <motion.circle r={9} fill="none" stroke="var(--ink)" strokeWidth={2} animate={{ cx: X(q.x), cy: Y(q.y) }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
        <motion.text fontSize={11} fill="var(--ink)" animate={{ x: X(q.x) + 13, y: Y(q.y) - 10 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
          {T.query}
        </motion.text>
      </svg>
    </div>
  );
}

export function RetrievalFlow({ lang = "en", mode = "design" }: { lang?: Lang; mode?: "design" | "search" }) {
  return mode === "search" ? <Search lang={lang} /> : <Design lang={lang} />;
}
