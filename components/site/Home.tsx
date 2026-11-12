import Link from "next/link";
import { Shell } from "./Shell";
import { PostCard } from "./PostCard";
import { PostCover } from "./PostCover";
import { People } from "./People";
import { HybridStack } from "@/components/viz/HybridStack";
import { allPosts } from "@/lib/posts";
import { href, t, type Lang } from "@/lib/i18n";
import cmp from "@/data/comparisons.json";
import speed from "@/data/speed.json";

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
  const big = cmp.equal_time.find((c) => c.size === "90M")!;
  const results = [
    { v: big.hybrid.mean.toFixed(3), unit: "bpb", slug: "hybrid-beats-llama", h: ja ? "0.1B で同サイズの Llama を上回る" : "Ahead of a same-size Llama at 0.1B", p: ja ? `Llama は ${big.llama.mean.toFixed(3)}。同じ学習時間。シードはまだ 1 つ。` : `Llama: ${big.llama.mean.toFixed(3)}. Same training time. One seed so far.` },
    { v: rel("hybrid_2to1").toFixed(2), unit: "×", slug: "hybrid-beats-llama", h: ja ? "Llama と同じ学習速度" : "Trains at Llama's speed", p: ja ? `トークンあたりのコスト。純粋な TONN は ${rel("pure_tonn").toFixed(2)} 倍。` : `Cost per token against Llama. Pure TONN was ${rel("pure_tonn").toFixed(2)}×.` },
    { v: "0.012", unit: "bpb", slug: "seven-pull-requests-and-a-leak", h: ja ? "スウォームは実際のテキストで効く" : "Swarms help on real text", p: ja ? "リークを差し引いても、少なくともこれだけ。シード 2 つ。" : "At least this much, after a leak fix. Two seeds." },
    { v: "30", unit: "%", slug: "retrieval-on-real-text-and-a-correction", h: ja ? "検索はまだ未解決" : "Retrieval's open problem", p: ja ? "検索が正しい記事を見つける割合。" : "How often the search finds the right article." },
  ];
  const beam = [
    { id: "latest", label: d.latest },
    { id: "posts", label: d.allPosts },
    { id: "standing", label: ja ? "現在地" : "Where it stands" },
    { id: "model", label: ja ? "モデル" : "The model" },
    { id: "people", label: ja ? "人" : "People" },
  ];
  return (
    <Shell lang={lang} altHref={href(other, "/")} current="posts" beam={beam}>
      <div className="sheet">
        <header className="enter">
          <p className="kicker mono">
            <i aria-hidden="true" />
            {ja ? "Exea Labs、高校生がつくる研究ラボ" : "Exea Labs, a research lab run by high schoolers"}
          </p>
          <h1 className="h-display mt-5 max-w-[14em]">{ja ? "高校生がつくる、オープンな言語モデル。" : "An open language model, built by high schoolers."}</h1>
          <p className="mt-5 text-[1.3rem] leading-snug text-ink-2">{ja ? "ExeaLM を毎日の記録で公開します。" : "Daily notes from building ExeaLM."}</p>
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
                {ja ? "3 層に 1 層が TONN。小さな回路の列で、検索と掲示板を内蔵します。" : "Every third layer is TONN: a row of small circuits, with retrieval and a message board built in."}
              </p>
              <Link href={href(lang, "/architecture/")} className="btn btn--ghost mt-6">
                {ja ? "中を見る" : "See inside"}
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
