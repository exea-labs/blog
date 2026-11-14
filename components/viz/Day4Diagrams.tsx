/** Diagrams for the day-4 posts, drawn in the same ink-and-signal idiom as Inline.tsx. Server components. */
type Lang = "en" | "ja";
const mono = { fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em" } as const;
const small = { fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.04em" } as const;

function Hatch({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="var(--panel)" />
      <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="1.4" />
    </pattern>
  );
}

/* ------------------------------------------------------------------ the three 13M stacks and the gate */

type Kind = "A" | "G" | "D" | "T";

export function LayerStacks({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? {
          stacks: ["Llama", "Qwen3.5 型", "ExeaLM（新しい標準）"],
          kinds: { A: "アテンション", G: "ゲート付き＋QK-norm", D: "Gated DeltaNet", T: "TONN 層" },
          layer: "層",
          inside: "ゲート付きアテンションの中",
          input: "層の入力",
          attn: "アテンション",
          qk: "q と k を正規化",
          gate: "ゲート",
          sig: "0〜1",
          out: "出力",
        }
      : {
          stacks: ["Llama", "Qwen3.5-style", "ExeaLM (new default)"],
          kinds: { A: "attention", G: "gated + QK-norm", D: "Gated DeltaNet", T: "TONN layer" },
          layer: "layer",
          inside: "inside gated attention",
          input: "layer input",
          attn: "attention",
          qk: "q and k normalised",
          gate: "gate",
          sig: "0 to 1",
          out: "output",
        };
  const layouts: Kind[][] = [
    ["A", "A", "A", "A", "A", "A"],
    ["D", "D", "D", "G", "D", "G"],
    ["T", "G", "G", "T", "G", "G"],
  ];
  const W = 132;
  const H = 30;
  const x0 = (s: number) => 46 + s * (W + 24);
  const y = (i: number) => 236 - i * (H + 6);
  const plate = (k: Kind, x: number, yy: number, key: string) => {
    const stroke = k === "A" ? "var(--ink-3)" : k === "D" ? "var(--ink-2)" : "var(--signal)";
    const fill = k === "D" ? "url(#hatch-delta)" : k === "T" ? "color-mix(in srgb, var(--signal) 22%, var(--panel))" : "var(--panel)";
    return (
      <g key={key}>
        <rect x={x} y={yy} width={W} height={H} fill={fill} stroke={stroke} strokeWidth={k === "G" ? 1.6 : 1} />
        {k === "T" && [0, 1, 2, 3, 4].map((c) => <circle key={c} cx={x + 18 + c * 24} cy={yy + H / 2} r={4} fill="var(--signal)" />)}
        {k !== "T" && (
          <text x={x + W / 2} y={yy + H / 2 + 3.5} textAnchor="middle" style={{ ...small, letterSpacing: 0 }} fill={k === "G" ? "var(--signal-ink)" : "var(--ink-2)"} paintOrder="stroke" stroke="var(--panel)" strokeWidth={k === "D" ? 4 : 0}>
            {T.kinds[k]}
          </text>
        )}
      </g>
    );
  };
  const gx = 524;
  return (
    <div className="overflow-x-auto"><svg viewBox="0 0 760 300" className="block h-auto w-full min-w-[640px]" role="img" aria-label={`${T.stacks.join(", ")}: ${T.inside}`}>
      <defs>
        <Hatch id="hatch-delta" color="var(--ink-3)" />
      </defs>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <text key={i} x={30} y={y(i) + H / 2 + 3.5} textAnchor="end" style={small} fill="var(--ink-3)">{i}</text>
      ))}
      <text x={30} y={y(5) - 10} textAnchor="end" style={small} fill="var(--ink-3)">{T.layer.toUpperCase()}</text>
      {layouts.map((ks, s) => (
        <g key={s}>
          {ks.map((k, i) => plate(k, x0(s), y(i), `${s}-${i}`))}
          <text x={x0(s) + W / 2} y={292} textAnchor="middle" style={mono} fill={s === 2 ? "var(--signal-ink)" : "var(--ink-2)"}>{T.stacks[s].toUpperCase()}</text>
        </g>
      ))}
      {/* inside one gated attention layer */}
      <line x1={gx - 22} x2={gx - 22} y1={30} y2={280} stroke="var(--line)" />
      <text x={gx} y={34} style={mono} fill="var(--ink-3)">{T.inside.toUpperCase()}</text>
      <rect x={gx} y={190} width={210} height={24} fill="var(--panel)" stroke="var(--ink-3)" />
      <text x={gx + 105} y={206} textAnchor="middle" style={small} fill="var(--ink-2)">{T.input}</text>
      <path d={`M ${gx + 60} 190 L ${gx + 60} 152`} stroke="var(--ink-3)" fill="none" />
      <path d={`M ${gx + 168} 190 L ${gx + 168} 152`} stroke="var(--signal)" fill="none" />
      <rect x={gx} y={104} width={120} height={48} fill="var(--panel)" stroke="var(--ink-2)" />
      <text x={gx + 60} y={124} textAnchor="middle" style={small} fill="var(--ink)">{T.attn}</text>
      <text x={gx + 60} y={140} textAnchor="middle" style={{ ...small, fontSize: 8.5 }} fill="var(--signal-ink)">{T.qk}</text>
      <rect x={gx + 138} y={112} width={60} height={40} fill="var(--panel)" stroke="var(--signal)" strokeWidth={1.6} />
      <text x={gx + 168} y={130} textAnchor="middle" style={small} fill="var(--signal-ink)">{T.gate}</text>
      <text x={gx + 168} y={144} textAnchor="middle" style={{ ...small, fontSize: 8.5 }} fill="var(--ink-3)">{T.sig}</text>
      <path d={`M ${gx + 60} 104 L ${gx + 60} 76 L ${gx + 92} 76`} stroke="var(--ink-2)" fill="none" />
      <path d={`M ${gx + 168} 112 L ${gx + 168} 76 L ${gx + 116} 76`} stroke="var(--signal)" fill="none" />
      <circle cx={gx + 104} cy={76} r={11} fill="var(--panel)" stroke="var(--signal)" strokeWidth={1.6} />
      <text x={gx + 104} y={80.5} textAnchor="middle" style={{ ...mono, fontSize: 13, letterSpacing: 0 }} fill="var(--signal-ink)">×</text>
      <path d={`M ${gx + 104} 65 L ${gx + 104} 48`} stroke="var(--ink-2)" fill="none" />
      <text x={gx + 116} y={56} style={small} fill="var(--ink-2)">{T.out}</text>
    </svg></div>
  );
}

/* ------------------------------------------------------------------ the real-text test and its three paths */

export function MemoryTest({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? {
          article: "評価用の Wikipedia 記事",
          first: "前半（知識）",
          second: "後半（モデルが読む）",
          rare: "珍しい単語",
          again: "再登場語",
          lanes: ["ライブラリ", "掲示板、ライブ", "ノート"],
          how: ["検索回路が前半のチャンクを探す", "2 番目のエージェントが同時に読む", "読み手が前もって書き、保存した投稿"],
          circuit: ["検索回路", "掲示板の回路", "掲示板の回路"],
          model: "モデル",
          scored: "採点：再登場語",
        }
      : {
          article: "held-out Wikipedia article",
          first: "first half (the knowledge)",
          second: "second half (what the model reads)",
          rare: "rare word",
          again: "re-mention",
          lanes: ["library", "board, live", "notes"],
          how: ["the retrieval circuit searches the first halves", "a second agent reads it at the same time", "posts a reader wrote ahead of time, stored"],
          circuit: ["retrieval circuit", "board circuit", "board circuit"],
          model: "model",
          scored: "scored on re-mentions",
        };
  const words = (x0: number, y0: number, n: number, hit: number[], color: string) =>
    Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x0 + (i % 7) * 24} y={y0 + Math.floor(i / 7) * 12} width={20} height={6} fill={hit.includes(i) ? color : "var(--line-2)"} />
    ));
  const laneY = [134, 186, 238];
  return (
    <div className="overflow-x-auto"><svg viewBox="0 0 700 304" className="block h-auto w-full min-w-[620px]" role="img" aria-label={`${T.article}: ${T.lanes.join(", ")}`}>
      <text x={20} y={22} style={mono} fill="var(--ink-3)">{T.article.toUpperCase()}</text>
      <rect x={20} y={32} width={330} height={56} fill="var(--panel)" stroke="var(--ink-2)" />
      <rect x={350} y={32} width={330} height={56} fill="var(--panel)" stroke="var(--ink-2)" />
      {words(34, 42, 21, [9], "var(--signal)")}
      {words(364, 42, 21, [5, 17], "var(--signal)")}
      <text x={34} y={104} style={small} fill="var(--ink-2)">{T.first}</text>
      <text x={364} y={104} style={small} fill="var(--ink-2)">{T.second}</text>
      <text x={250} y={26} style={small} fill="var(--signal-ink)">{T.rare}</text>
      <path d="M 262 30 L 262 50" stroke="var(--signal)" strokeDasharray="2 3" fill="none" />
      <text x={566} y={26} style={small} fill="var(--signal-ink)">{T.again}</text>
      <path d="M 616 30 L 616 50" stroke="var(--signal)" strokeDasharray="2 3" fill="none" />
      {/* lanes from the first half to the model */}
      <rect x={20} y={118} width={92} height={150} fill="var(--panel)" stroke="var(--ink-3)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect x={30} y={130 + i * 14} width={i % 3 === 2 ? 50 : 72} height={5} fill="var(--line-2)" />
          {i === 3 && <rect x={58} y={130 + i * 14} width={18} height={5} fill="var(--signal)" />}
        </g>
      ))}
      <text x={66} y={262} textAnchor="middle" style={small} fill="var(--ink-3)">{T.first.split(/[（(]/)[0]}</text>
      {laneY.map((ly, i) => (
        <g key={i}>
          <path d={`M 112 ${ly} L 540 ${ly}`} stroke={i === 2 ? "var(--signal)" : "var(--ink-3)"} strokeWidth={i === 2 ? 1.6 : 1} fill="none" />
          <rect x={150} y={ly - 15} width={96} height={30} fill="var(--panel)" stroke={i === 2 ? "var(--signal)" : "var(--ink-2)"} />
          {i === 0 && [0, 1, 2, 3].map((c) => <rect key={c} x={160 + c * 20} y={ly - 7} width={14} height={14} fill="var(--panel)" stroke="var(--ink-3)" />)}
          {i === 1 && <circle cx={198} cy={ly} r={9} fill="var(--panel)" stroke="var(--ink-2)" />}
          {i === 2 && [0, 1, 2].map((c) => <rect key={c} x={176 + c * 6} y={ly - 9 + c * 3} width={32} height={14} fill="var(--panel)" stroke="var(--signal)" />)}
          <text x={262} y={ly - 4} style={mono} fill={i === 2 ? "var(--signal-ink)" : "var(--ink)"}>{T.lanes[i].toUpperCase()}</text>
          <text x={262} y={ly + 11} style={{ ...small, letterSpacing: 0 }} fill="var(--ink-3)">{T.how[i]}</text>
        </g>
      ))}
      <rect x={540} y={118} width={140} height={176} fill="var(--panel)" stroke="var(--ink-2)" />
      <text x={610} y={266} textAnchor="middle" style={mono} fill="var(--ink)">{T.model.toUpperCase()}</text>
      {laneY.map((ly, i) => (
        <text key={i} x={548} y={ly + 4} style={{ ...small, fontSize: 8.5, letterSpacing: 0 }} fill="var(--ink-3)">{T.circuit[i]}</text>
      ))}
      <text x={610} y={284} textAnchor="middle" style={small} fill="var(--signal-ink)">{T.scored}</text>
    </svg></div>
  );
}

/* ------------------------------------------------------------------ why the notes broke */

export function NotesTrust({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? {
          practice: "練習（記事のペアのバッチ）",
          test: "テスト（256 記事すべてのノート）",
          board1: "掲示板：正しい記事のノートだけ",
          board2: "掲示板：1 つは正しく、255 は別の記事",
          right: "正しいノート",
          learned: "載っているものは何でも信じることを学ぶ",
          result: "別の記事のノートを信じる：再登場語が 7.9 ビット悪化",
        }
      : {
          practice: "practice (article-pair batches)",
          test: "test (notes of all 256 articles)",
          board1: "board: notes on the right article only",
          board2: "board: one right article, 255 wrong ones",
          right: "right notes",
          learned: "learns to trust whatever is on the board",
          result: "trusts the wrong notes too: 7.9 bits worse on re-mentions",
        };
  const reader = (x: number, y: number, bad: boolean) => (
    <g>
      <circle cx={x} cy={y} r={14} fill="var(--panel)" stroke={bad ? "var(--signal)" : "var(--ink-2)"} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={4} fill={bad ? "var(--signal)" : "var(--ink-2)"} />
    </g>
  );
  return (
    <div className="overflow-x-auto"><svg viewBox="0 0 700 230" className="block h-auto w-full min-w-[620px]" role="img" aria-label={`${T.practice}: ${T.board1}. ${T.test}: ${T.board2}.`}>
      <text x={20} y={22} style={mono} fill="var(--ink-3)">{T.practice.toUpperCase()}</text>
      <rect x={20} y={36} width={200} height={120} fill="var(--panel)" stroke="var(--ink-2)" />
      {[0, 1, 2].map((c) => <rect key={c} x={88 + c * 7} y={70 + c * 7} width={44} height={30} fill="var(--panel)" stroke="var(--signal)" />)}
      <text x={120} y={140} textAnchor="middle" style={small} fill="var(--signal-ink)">{T.right}</text>
      <text x={20} y={174} style={{ ...small, letterSpacing: 0 }} fill="var(--ink-2)">{T.board1}</text>
      <path d="M 220 96 L 268 96" stroke="var(--ink-2)" fill="none" />
      {reader(284, 96, false)}
      <text x={20} y={200} style={{ ...small, letterSpacing: 0 }} fill="var(--ink-3)">{T.learned}</text>
      <line x1={330} x2={330} y1={20} y2={210} stroke="var(--line)" />
      <text x={352} y={22} style={mono} fill="var(--ink-3)">{T.test.toUpperCase()}</text>
      <rect x={352} y={36} width={200} height={120} fill="var(--panel)" stroke="var(--ink-2)" />
      {Array.from({ length: 256 }, (_, i) => {
        const cx = 360 + (i % 16) * 11.6;
        const cy = 42 + Math.floor(i / 16) * 6.9;
        return <rect key={i} x={cx} y={cy} width={9} height={5} fill={i === 101 ? "var(--signal)" : "var(--ink-3)"} opacity={i === 101 ? 1 : 0.55} />;
      })}
      <text x={352} y={174} style={{ ...small, letterSpacing: 0 }} fill="var(--ink-2)">{T.board2}</text>
      <path d="M 552 96 L 600 96" stroke="var(--signal)" strokeWidth={1.6} fill="none" />
      {reader(616, 96, true)}
      <text x={352} y={200} style={{ ...small, letterSpacing: 0 }} fill="var(--signal-ink)">{T.result}</text>
    </svg></div>
  );
}
