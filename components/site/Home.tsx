import Link from "next/link";
import { Shell } from "./Shell";
import { PostCard } from "./PostCard";
import { PostCover } from "./PostCover";
import { People } from "./People";
import { HybridStack } from "@/components/viz/HybridStack";
import { allPosts } from "@/lib/posts";
import { href, t, type Lang } from "@/lib/i18n";
import funding from "@/data/funding.json";
import speed from "@/data/speed.json";
import full from "@/data/full_small.json";

type Row = { name: string; tokens_per_sec: number };
const rel = (k: string) => {
  const rows = (speed as unknown as Record<string, { rows: Row[] }>)[k].rows;
  return rows.find((r) => r.name === "llama")!.tokens_per_sec / rows.find((r) => r.name === "tonn, memory idle")!.tokens_per_sec;
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 8h11M9 4l4 4-4 4" />
  </svg>
);

export function Home({ lang }: { lang: Lang }) {
  const d = t(lang);
  const ja = lang === "ja";
  const posts = allPosts(lang);
  const [latest, ...rest] = posts;
  const other: Lang = ja ? "en" : "ja";
  const fb = funding.big;
  const fs = funding.small;
  // Round half up, as the results report does (the full model's mean is 1.3925).
  const r3 = (x: number) => (Math.round(x * 1000 + 1e-6) / 1000).toFixed(3);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  type Run = { recipe: string; model: string; seed: number; curve: Record<string, number>[] };
  const last = (recipe: string) => {
    const c = (full.runs as unknown as Run[]).find((x) => x.recipe === recipe && x.model === "exealm" && x.seed === 0)!.curve.at(-1)!;
    return { bpb: mean([c.en, c.ja_wiki, c.ja_web, c.code]), relay: c.relay_shared, lookup: c.lookup_attached };
  };
  const gated = last("together_gated");
  const plain = last("together");
  const pct = (x: number) => Math.round(x * 100);
  const results = [
    { v: r3(fb.hybrid.mean), unit: "bpb", slug: "at-0-1b-the-hybrid-leads-and-agents-edit-each-others-weights", h: ja ? "0.1B で、同サイズのすべての比較対象を上回る" : "Ahead of every same-size baseline at 0.1B", p: ja ? `ゲート付き Llama は ${r3(fb.llama_gate.mean)}、Qwen3.5 型（自作）は ${r3(fb.qwen35.mean)}、Llama は ${r3(fb.llama.mean)}。同じステップ数、各 ${fb.hybrid.seeds.length} シード。短い学習で、記憶回路なし。` : `Gated Llama: ${r3(fb.llama_gate.mean)}. Qwen3.5-style (our build): ${r3(fb.qwen35.mean)}. Llama: ${r3(fb.llama.mean)}. Same steps, ${fb.hybrid.seeds.length} seeds each. Short runs without the memory circuits.` },
    { v: r3(gated.bpb), unit: "bpb", slug: "two-parts-from-qwen35-make-the-hybrid-better", h: ja ? "掲示板とライブラリを備えた 18M のモデル" : "One 18M model with its board and its library", p: ja ? `ゲート付きアテンションと QK-norm なしでは ${r3(plain.bpb)}。中継タスク ${pct(gated.relay)}%、検索タスク ${pct(gated.lookup)}%。シードはまだ 1 つ。` : `${r3(plain.bpb)} without gated attention and QK-norm. Relay ${pct(gated.relay)}%, lookup ${pct(gated.lookup)}%. One seed so far.` },
    { v: r3(fs.hybrid.mean), unit: "bpb", slug: "at-0-1b-the-hybrid-leads-and-agents-edit-each-others-weights", h: ja ? "13M で Qwen3.5 型のモデルを上回る" : "Ahead of a Qwen3.5-style model at 13M", p: ja ? `Qwen3.5 型は ${r3(fs.qwen35.mean)}、ゲート付き Llama は ${r3(fs.llama_gate.mean)}。同じステップ数、各 ${fs.hybrid.seeds.length} シード。` : `Qwen3.5-style: ${r3(fs.qwen35.mean)}. Gated Llama: ${r3(fs.llama_gate.mean)}. Same steps, ${fs.hybrid.seeds.length} seeds each.` },
    { v: "100", unit: "%", slug: "at-0-1b-the-hybrid-leads-and-agents-edit-each-others-weights", h: ja ? "エージェントは重みを書き換えて教え合う" : "Agents teach each other by editing weights", p: ja ? "重みの書き換えだけで渡せたリレーの事実（6 回の実行で 99.7 から 100%）。掲示板は 99.8%。通常のテキストではまだ損失を下げていません。" : "Relay facts passed by weight edits alone (99.7 to 100% on 6 runs). The board passes 99.8%. It does not lower the loss on ordinary text yet." },
    { v: rel("hybrid_2to1").toFixed(2), unit: "×", slug: "hybrid-beats-llama", h: ja ? "Llama と同じ学習速度" : "Trains at Llama's speed", p: ja ? `トークンあたりのコスト。純粋な TONN は ${rel("pure_tonn").toFixed(2)} 倍。` : `Cost per token against Llama. Pure TONN was ${rel("pure_tonn").toFixed(2)}×.` },
    { v: "30", unit: "%", slug: "retrieval-on-real-text-and-a-correction", h: ja ? "実テキストでの検索精度は約 30%" : "Retrieval's open problem", p: ja ? "正しい記事を検索できた割合です。この実験では、メモリ回路を使っても実テキストの損失は下がりませんでした。" : "How often the search finds the right article. On real text the memory circuits do not lower the loss yet." },
  ];
  const beam = [
    { id: "latest", label: d.latest },
    { id: "posts", label: d.allPosts },
    { id: "standing", label: ja ? "現在地" : "Where it stands" },
    { id: "model", label: ja ? "モデル" : "The model" },
    { id: "people", label: ja ? "開発チーム" : "People" },
  ];
  return (
    <Shell lang={lang} altHref={href(other, "/")} current="posts" beam={beam}>
      <div className="sheet">
        <header className="enter">
          <p className="kicker mono">
            <i aria-hidden="true" />
            {ja ? "高校生が運営する研究チーム、Exea Labs" : "Exea Labs, a research lab run by high schoolers"}
          </p>
          <h1 className="h-display mt-5 max-w-[14em]">{ja ? "高校生がつくる、オープンな言語モデル。" : "An open language model, built by high schoolers."}</h1>
          <p className="mt-5 text-[1.3rem] leading-snug text-ink-2">{ja ? "ExeaLM をゼロから学習させるプロジェクトの開発記録です。" : "Daily notes from building ExeaLM."}</p>
        </header>

        {latest && (
          <Link id="latest" href={href(lang, `/posts/${latest.slug}/`)} className="feature enter mt-10 scroll-mt-28">
            <div className="feature__cover">
              <PostCover kind={latest.cover} />
            </div>
            <div className="feature__body">
              <p className="mono text-ink-3">
                <span className="text-signal-ink">{d.latest}</span> · {d.day(latest.day)} · {d.dateFmt(latest.date)}
              </p>
              <h2 className="feature__title">{latest.title}</h2>
              <p className="feature__dek">{latest.dek}</p>
              {latest.numbers.length > 0 && (
                <div className="feature__nums">
                  {latest.numbers.slice(0, 2).map((n) => (
                    <div key={n.label}>
                      <b>{n.value}</b>
                      <span className="mono">{n.label.split(/[,、。（(]/)[0]}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="card__more mono">
                {d.readPost} <Arrow />
              </span>
            </div>
          </Link>
        )}

        <section id="posts" className="section" aria-labelledby="posts-h">
          <div className="section__head">
            <span className="section__num mono">01</span>
            <h2 id="posts-h" className="section__title" data-reveal="clip">{d.allPosts}</h2>
          </div>
          <div className="cards" data-reveal="stagger">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} lang={lang} />
            ))}
          </div>
        </section>

        <section id="standing" className="section" aria-labelledby="standing-h">
          <div className="section__head">
            <span className="section__num mono">02</span>
            <h2 id="standing-h" className="section__title" data-reveal="clip">{d.where}</h2>
          </div>
          <div className="results" data-reveal="stagger">
            {results.map((r) => (
              <Link key={r.h} href={href(lang, `/posts/${r.slug}/`)} className="result">
                <div className="result__v">
                  <span data-count={r.v} className="!m-0 !text-[1em] !tracking-[inherit] !text-signal">{r.v}</span>
                  <span>{r.unit}</span>
                </div>
                <div className="result__t">
                  <h3>{r.h}</h3>
                  <p>{r.p}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="model" className="section" aria-labelledby="model-h">
          <div className="section__head">
            <span className="section__num mono">03</span>
            <h2 id="model-h" className="section__title" data-reveal="clip">{ja ? "モデル" : "The model"}</h2>
          </div>
          <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="plate" data-reveal="scale">
              <div className="plate__head mono">
                <b>{ja ? "図 01" : "Fig. 01"}</b>
                <span>ExeaLM 0.1B</span>
              </div>
              <HybridStack lang={lang} />
            </div>
            <div data-reveal="left">
              <p className="text-[1.3rem] font-light leading-snug">
                {ja ? "3 層のうち 1 層は TONN、残りはアテンション層です。TONN 層には、資料を検索する回路と、エージェント同士が情報を共有する掲示板があります。" : "Every third layer is TONN: a row of small circuits, with retrieval and a message board built in."}
              </p>
              <Link href={href(lang, "/architecture/")} className="btn btn--ghost mt-6">
                {ja ? "モデルの構成を見る" : "See inside"}
              </Link>
            </div>
          </div>
        </section>

        <section id="people" className="section" aria-labelledby="people-h">
          <div className="section__head">
            <span className="section__num mono">04</span>
            <h2 id="people-h" className="section__title" data-reveal="clip">{d.contributors}</h2>
          </div>
          <div data-reveal="rise">
            <People lang={lang} />
          </div>
        </section>
      </div>
    </Shell>
  );
}
