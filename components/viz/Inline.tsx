/** Small visuals that break up long text inside posts: a big number, a sketch, and a few diagrams drawn from the
 * same ink-and-signal idiom as the rest of the site. Server components: no JavaScript ships for them. */
import swarm from "@/data/swarm_text.json";
import { PostCover } from "@/components/site/PostCover";

type Lang = "en" | "ja";
const mono = { fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em" } as const;

/** One number, large, with what it means. */
export function Stat({ value, label }: { value: string; label: string }) {
  const numeric = /^\d+(\.\d+)?$/.test(value);
  return (
    <aside className="stat" data-reveal="rise">
      <div className="stat__v">{numeric ? <span data-count={value}>{value}</span> : value}</div>
      <p className="stat__l">{label}</p>
    </aside>
  );
}

/** A post's line drawing, as a picture between paragraphs. */
export function Sketch({ kind, caption }: { kind: string; caption?: string }) {
  return (
    <figure className="figure figure--small" data-reveal="scale">
      <div className="plate sketch">
        <PostCover kind={kind} />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Lists rendered as a grid of cards (the list stays a list for readers and search). */
export function CardList({ children }: { children: React.ReactNode }) {
  return (
    <div className="cardlist" data-reveal="stagger">
      {children}
    </div>
  );
}

/** Diminishing returns: predicted loss drop for each step up in training tokens (Hoffmann et al. fit, from DATA.md). */
export function TokenReturns({ lang = "en" }: { lang?: Lang }) {
  const rows = [
    { from: "20B", to: "100B", v: 0.19 },
    { from: "100B", to: "200B", v: 0.06 },
    { from: "200B", to: "400B", v: 0.05 },
  ];
  const T = lang === "ja" ? { h: "トークンを増やしたときの、予測損失の下がり幅", plan: "計画" } : { h: "Predicted loss drop for each step up in training tokens", plan: "plan" };
  return (
    <figure className="figure figure--small" data-reveal="scale">
      <div className="plate">
        <div className="plate__head mono">
          <span>{T.h}</span>
        </div>
        <div className="space-y-3 p-4">
          {rows.map((r, i) => (
            <div key={r.from} className="grid grid-cols-[7.5rem_minmax(0,1fr)_3.5rem] items-center gap-3">
              <span className="mono text-ink-2">
                {r.from} → {r.to}
                {i === 0 && <span className="ml-2 text-signal-ink">{T.plan}</span>}
              </span>
              <span className="relative h-3 bg-[var(--line)]">
                <span className="bar-grow absolute inset-y-0 left-0" style={{ width: `${(r.v / 0.19) * 100}%`, background: i === 0 ? "var(--signal)" : "var(--ink-3)" }} />
              </span>
              <span className="num text-right text-[0.95rem]">{r.v.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}

/** A retrieval key in two parts: the learned part from the model's encoder, and the fixed rare-word part. */
export function KeySplit({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? { chunk: "チャンク", learned: "学習した部分（128）", lex: "希少語の部分（128）", lnote: "エンコーダーが学ぶ", xnote: "珍しい語ほど重い、固定の符号", key: "検索キー" }
      : { chunk: "chunk", learned: "learned part (128)", lex: "rare-word part (128)", lnote: "the encoder learns it", xnote: "fixed codes, rarer words weigh more", key: "retrieval key" };
  const words = ["The", "Thames", "flows", "east", "through", "London"];
  const rare = [0.15, 0.95, 0.3, 0.25, 0.2, 0.85];
  return (
    <figure className="figure figure--small" data-reveal="scale">
      <div className="plate">
        <svg viewBox="0 0 560 210" className="block h-auto w-full" role="img" aria-label={`${T.key}: ${T.learned} + ${T.lex}`}>
          <text x={20} y={26} style={mono} fill="var(--ink-3)">{T.chunk.toUpperCase()}</text>
          {words.map((w, i) => (
            <g key={w}>
              <rect x={20 + i * 86} y={36} width={78} height={26} fill="var(--panel)" stroke={rare[i] > 0.5 ? "var(--signal)" : "var(--line-2)"} />
              <text x={59 + i * 86} y={53} textAnchor="middle" style={{ ...mono, letterSpacing: 0 }} fill="var(--ink)">{w}</text>
            </g>
          ))}
          <path d="M 150 70 C 150 96, 140 104, 140 120" fill="none" stroke="var(--ink-3)" />
          <path d="M 410 70 C 410 96, 420 104, 420 120" fill="none" stroke="var(--signal)" />
          <rect x={30} y={124} width={250} height={30} fill="var(--ink-2)" />
          <rect x={280} y={124} width={250} height={30} fill="url(#hatch-key)" stroke="var(--signal)" />
          <defs>
            <pattern id="hatch-key" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="var(--panel)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--signal)" strokeWidth="1.4" />
            </pattern>
          </defs>
          <text x={155} y={144} textAnchor="middle" style={mono} fill="var(--panel)">{T.learned.toUpperCase()}</text>
          <text x={405} y={144} textAnchor="middle" style={mono} fill="var(--ink)">{T.lex.toUpperCase()}</text>
          <text x={155} y={176} textAnchor="middle" style={{ ...mono, letterSpacing: 0 }} fill="var(--ink-3)">{T.lnote}</text>
          <text x={405} y={176} textAnchor="middle" style={{ ...mono, letterSpacing: 0 }} fill="var(--ink-3)">{T.xnote}</text>
          <line x1={30} x2={530} y1={196} y2={196} stroke="var(--ink-3)" />
          <line x1={30} x2={30} y1={190} y2={202} stroke="var(--ink-3)" />
          <line x1={530} x2={530} y1={190} y2={202} stroke="var(--ink-3)" />
          <text x={280} y={193} textAnchor="middle" style={mono} fill="var(--ink-2)" paintOrder="stroke" stroke="var(--panel)" strokeWidth={6}>{T.key.toUpperCase()}</text>
        </svg>
      </div>
    </figure>
  );
}

/** The seam leak: four consecutive windows, the seams between them, and the path a seam byte could take. */
export function SeamDiagram({ lang = "en" }: { lang?: Lang }) {
  const T =
    lang === "ja"
      ? { agent: (i: number) => `エージェント ${i}`, seam: "継ぎ目", post: "最初の投稿", read: "最後の予測で読める", none: "継ぎ目なし" }
      : { agent: (i: number) => `agent ${i}`, seam: "seam", post: "first post", read: "readable at its last target", none: "no seam" };
  const W = 128;
  const x = (i: number) => 24 + i * (W + 6);
  return (
    <figure className="figure figure--small" data-reveal="scale">
      <div className="plate">
        <svg viewBox="0 0 584 190" className="block h-auto w-full" role="img" aria-label={`${T.seam}: ${T.post}, ${T.read}`}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <text x={x(i)} y={60} style={mono} fill="var(--ink-3)">{T.agent(i + 1).toUpperCase()}</text>
              <rect x={x(i)} y={68} width={W} height={34} fill="var(--panel)" stroke="var(--ink-2)" />
              {Array.from({ length: 8 }, (_, k) => (
                <line key={k} x1={x(i) + (k + 1) * (W / 8)} x2={x(i) + (k + 1) * (W / 8)} y1={68} y2={102} stroke="var(--line)" />
              ))}
              {i < 3 && <rect x={x(i) + W - 9} y={68} width={9} height={34} fill="var(--signal)" />}
              {i > 0 && <rect x={x(i)} y={68} width={9} height={34} fill="color-mix(in srgb, var(--signal) 45%, transparent)" />}
              {i === 3 && <text x={x(i) + W - 2} y={120} textAnchor="end" style={mono} fill="var(--ink-3)">{T.none.toUpperCase()}</text>}
            </g>
          ))}
          {/* agent 2's first post rises to the board and comes back to agent 1's last target */}
          <rect x={x(1) + 2} y={148} width={W / 8 - 2} height={16} fill="var(--ink-2)" />
          <path className="seam-path" d={`M ${x(1) + 8} 104 L ${x(1) + 8} 146`} fill="none" stroke="var(--ink-2)" />
          <path className="seam-path" d={`M ${x(1) + 16} 156 C ${x(1) - 40} 156, ${x(0) + W - 4} 150, ${x(0) + W - 4} 106`} fill="none" stroke="var(--signal)" strokeWidth={1.6} />
          <path d={`M ${x(0) + W - 8} 112 L ${x(0) + W - 4} 104 L ${x(0) + W} 112`} fill="none" stroke="var(--signal)" strokeWidth={1.6} />
          <text x={x(1) + 22} y={160} style={mono} fill="var(--ink-2)">{T.post.toUpperCase()}</text>
          <text x={x(0)} y={182} style={mono} fill="var(--signal-ink)">{T.read.toUpperCase()}</text>
          <text x={x(0) + W - 2} y={36} textAnchor="middle" style={mono} fill="var(--signal-ink)">{T.seam.toUpperCase()}</text>
          <line x1={x(0) + W - 4} x2={x(0) + W - 4} y1={40} y2={66} stroke="var(--signal)" strokeDasharray="2 3" />
        </svg>
      </div>
    </figure>
  );
}

/** How much each agent gains from the board, by position, on the hybrid. Agent 4 has no seam. */
export function AgentGain({ lang = "en" }: { lang?: Lang }) {
  const runs = (swarm as { kind: string; arm: string; seed: number; shared_per_agent: number[]; cut_per_agent: number[] }[]).filter((r) => r.kind === "hybrid" && r.arm === "split");
  const gains = runs.map((r) => ({ seed: r.seed, g: r.shared_per_agent.map((s, i) => r.cut_per_agent[i] - s) }));
  const max = Math.max(...gains.flatMap((x) => x.g));
  const T = lang === "ja" ? { h: "掲示板から得る改善（bpb）、スウォーム内の位置ごと", agent: (i: number) => `${i}`, seed: "シード", no: "継ぎ目なし" } : { h: "What each agent gains from the board, bits per byte", agent: (i: number) => `${i}`, seed: "seed", no: "no seam" };
  return (
    <figure className="figure figure--small" data-reveal="scale">
      <div className="plate">
        <div className="plate__head mono">
          <span>{T.h}</span>
        </div>
        <div className="grid gap-6 p-4 sm:grid-cols-2">
          {gains.map(({ seed, g }) => (
            <div key={seed}>
              <div className="mono mb-2 text-ink-3">{T.seed} {seed}</div>
              <div className="flex h-32 items-end gap-3">
                {g.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="num text-[0.8rem] text-ink-2">{v.toFixed(4)}</span>
                    <span className="bar-rise w-full" style={{ height: `${(v / max) * 88}px`, background: i === 3 ? "var(--signal)" : "var(--ink-3)" }} />
                    <span className="mono text-ink-3">{T.agent(i + 1)}</span>
                  </div>
                ))}
              </div>
              <div className="mono mt-1 text-right text-signal-ink">4: {T.no}</div>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
