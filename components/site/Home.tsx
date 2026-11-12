import Link from "next/link";
import { Shell } from "./Shell";
import { PostList } from "./PostList";
import { People } from "./People";
import { HybridStack } from "@/components/viz/HybridStack";
import { allPosts } from "@/lib/posts";
import { SITE, href, t, type Lang } from "@/lib/i18n";
import cmp from "@/data/comparisons.json";
import speed from "@/data/speed.json";

type Row = { name: string; tokens_per_sec: number };
const rel = (k: string) => {
  const rows = (speed as unknown as Record<string, { rows: Row[] }>)[k].rows;
  return rows.find((r) => r.name === "llama")!.tokens_per_sec / rows.find((r) => r.name === "tonn, memory idle")!.tokens_per_sec;
};

export function Home({ lang }: { lang: Lang }) {
  const d = t(lang);
  const ja = lang === "ja";
  const posts = allPosts(lang);
  const latest = posts[0];
  const other: Lang = ja ? "en" : "ja";
  const big = cmp.equal_time.find((c) => c.size === "90M")!;
  const hy = big.hybrid.mean.toFixed(3);
  const ll = big.llama.mean.toFixed(3);
  const results = [
    {
      v: hy,
      unit: "bpb",
      slug: "hybrid-beats-llama",
      h: ja ? "0.1B、同じ学習時間で Llama を上回る" : "Ahead of Llama at 0.1B, same training time",
      p: ja ? `同じサイズの Llama は ${ll}。差は 4 種類のテキストすべてで ExeaLM 側に出ました。シードはまだ 1 つです。` : `A same-size Llama reaches ${ll} bits per byte. ExeaLM is ahead on English, Japanese and code. One seed so far; the second is training.`,
    },
    {
      v: rel("hybrid_2to1").toFixed(2),
      unit: "×",
      slug: "hybrid-beats-llama",
      h: ja ? "Llama と同じ学習速度" : "Llama's training speed",
      p: ja ? `トークンあたりの学習コストは Llama の ${rel("hybrid_2to1").toFixed(2)} 倍。純粋な TONN では ${rel("pure_tonn").toFixed(2)} 倍でした。` : `Training cost per token, relative to a same-size Llama. Pure TONN was ${rel("pure_tonn").toFixed(2)} times.`,
    },
    {
      v: "0.012",
      unit: "bpb",
      slug: "seven-pull-requests-and-a-leak",
      h: ja ? "スウォームは実際のテキストで効く" : "Swarms help on real text",
      p: ja ? "掲示板を共有するスウォームは、条件をそろえた対照より少なくとも 0.012 良くなりました（シード 2 つ）。最初は 0.014 と報告しましたが、Aaron が見つけたリークの分を差し引いています。" : "At least this much better than a matched control, on both seeds. We first reported 0.014; up to 0.002 of it could come from a leak Aaron found. Reruns with the fix are queued.",
    },
    {
      v: "30",
      unit: "%",
      slug: "retrieval-on-real-text-and-a-correction",
      h: ja ? "検索はまだ未解決" : "Retrieval is the open problem",
      p: ja ? "見たことのない事実の照会は 100% 解けます。実際のテキストでは、検索が正しい記事を見つけるのは 30% ほどで、正味の改善はまだ確かめられていません。" : "The model's own search finds the right article about 30% of the time. On a lookup task retrieval is perfect; on real text the net gain is not established yet.",
    },
  ];
  const beam = [
    { id: "model", label: ja ? "モデル" : "The model" },
    { id: "standing", label: ja ? "現在地" : "Where it stands" },
    { id: "posts", label: d.allPosts },
    { id: "people", label: ja ? "人" : "People" },
  ];
  return (
    <Shell lang={lang} altHref={href(other, "/")} current="posts" beam={beam}>
      <div className="sheet">
        <section className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="enter">
            <p className="mono text-ink-3">{ja ? "Exea Labs の研究ノート" : "Research notes from Exea Labs"}</p>
            <h1 className="h-display mt-5 max-w-[13em]">{ja ? "オープンな言語モデルを、毎日公開しながら作る。" : "Building an open language model, one day at a time."}</h1>
            <p className="deck mt-6">{d.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {latest && (
                <Link href={href(lang, `/posts/${latest.slug}/`)} className="btn btn--signal">
                  {ja ? "最新の記事を読む" : "Read the latest"}
                  <span className="btn__aside">{d.day(latest.day)}</span>
                </Link>
              )}
              <a href={SITE.repo} className="btn btn--ghost">
                {ja ? "GitHub の ExeaLM" : "ExeaLM on GitHub"}
              </a>
            </div>
            <p className="proof mt-6">
              {ja ? (
                <>
                  0.1B、同じ学習時間で ExeaLM は <b>{hy}</b> bpb、同じサイズの Llama は <b>{ll}</b>。
                </>
              ) : (
                <>
                  At 0.1B and the same training time: ExeaLM <b>{hy}</b> bits per byte, a same-size Llama <b>{ll}</b>.
                </>
              )}
            </p>
          </div>
          <dl className="titleblock enter">
            <div><dt>{ja ? "プロジェクト" : "Project"}</dt><dd>ExeaLM</dd></div>
            <div><dt>{ja ? "サイズ" : "Size"}</dt><dd>0.1B</dd></div>
            <div><dt>{ja ? "学習データ" : "Data"}</dt><dd>{ja ? "100B トークン（予定）" : "100B tokens, planned"}</dd></div>
            <div><dt>{ja ? "ライセンス" : "License"}</dt><dd>Apache 2.0</dd></div>
            <div><dt>{ja ? "記事" : "Posts"}</dt><dd>{posts.length}</dd></div>
            <div><dt>{ja ? "更新" : "Updated"}</dt><dd>{latest?.date}</dd></div>
            <div><dt>{ja ? "言語" : "Languages"}</dt><dd>EN, JA</dd></div>
            <div><dt>{ja ? "参加" : "Join"}</dt><dd><a href={SITE.signup}>{ja ? "登録フォーム" : "Sign-up form"}</a></dd></div>
          </dl>
        </section>

        <section id="model" className="section" aria-labelledby="model-h">
          <div className="section__head">
            <span className="section__num mono">01</span>
            <h2 id="model-h" className="section__title">{ja ? "モデル" : "The model"}</h2>
          </div>
          <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="plate">
              <div className="plate__head mono">
                <b>{ja ? "図 01" : "Fig. 01"}</b>
                <span>{ja ? "ExeaLM 0.1B、層ごと" : "ExeaLM 0.1B, layer by layer"}</span>
              </div>
              <HybridStack lang={lang} />
            </div>
            <div className="text-[1.0625rem] leading-relaxed text-ink-2">
              <p>
                {ja
                  ? "ExeaLM は Exea Labs のアーキテクチャ TONN の上に作ります。TONN 層は、畳み込みや累積和や小さなアテンションヘッドなど、20 個の小さな回路の列です。どの回路を使うかは学習中の探索が決めます。"
                  : "ExeaLM is built on TONN, Exea Labs' architecture. A TONN layer is a row of 20 small circuits, such as convolutions, running sums and small attention heads, and a search picks which circuits to keep during training."}
              </p>
              <p className="mt-4">
                {ja
                  ? "TONN 層にはどれも、2 つのメモリ回路が固定で入ります。モデル自身の埋め込みで検索する回路と、モデルのコピー同士が話す掲示板です。"
                  : "Every TONN layer also carries two memory circuits: retrieval with the model's own embeddings, and a message board that copies of the model use to talk."}
              </p>
              <Link href={href(lang, "/architecture/")} className="btn btn--ghost mt-6">
                {ja ? "アーキテクチャの中を見る" : "See inside the architecture"}
              </Link>
            </div>
          </div>
        </section>

        <section id="standing" className="section" aria-labelledby="standing-h">
          <div className="section__head">
            <span className="section__num mono">02</span>
            <h2 id="standing-h" className="section__title">{d.where}</h2>
          </div>
          <p className="section__lead">{d.whereNote}</p>
          <div className="results">
            {results.map((r, i) => (
              <Link key={i} href={href(lang, `/posts/${r.slug}/`)} className="result">
                <div className="result__v">
                  {r.v}
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

        <section id="posts" className="section" aria-labelledby="posts-h">
          <div className="section__head">
            <span className="section__num mono">03</span>
            <h2 id="posts-h" className="section__title">{d.allPosts}</h2>
          </div>
          <PostList posts={posts} lang={lang} />
        </section>

        <section id="people" className="section" aria-labelledby="people-h">
          <div className="section__head">
            <span className="section__num mono">04</span>
            <h2 id="people-h" className="section__title">{d.contributors}</h2>
          </div>
          <People lang={lang} />
        </section>
      </div>
    </Shell>
  );
}
