import { Shell } from "./Shell";
import { PageHead, Section, P } from "./PageHead";
import { Figure } from "@/components/mdx/Blocks";
import { HybridStack } from "@/components/viz/HybridStack";
import { TonnLayer } from "@/components/viz/TonnLayer";
import { CircuitMenu } from "@/components/viz/CircuitMenu";
import { RetrievalFlow } from "@/components/viz/RetrievalFlow";
import { SwarmBoard } from "@/components/viz/SwarmBoard";
import { href, type Lang } from "@/lib/i18n";

const COPY = {
  en: {
    title: "Inside ExeaLM",
    lead: "The 0.1B model, from the layer stack down to one circuit.",
    stack: "The stack",
    layer: "One TONN layer",
    layerP: "One projection reads the residual stream into 20 slots. Each slot runs one small circuit on three streams. One projection writes the results back.",
    layerCap: "One TONN layer, top to bottom. Point at a circuit to see what it computes.",
    menu: "The circuit menu",
    menuP: "Fourteen circuit types can fill a slot. During training, a search keeps the ones that lower the loss.",
    menuCap: "Every circuit type on the same input. Faint bars are the input; the line is the output.",
    rg: "Retrieval",
    rgP: "Once per 64 tokens, the model searches a read-only library with its own embeddings and reads the top 4 chunks.",
    rgCap: "The retrieval circuit, one stage at a time.",
    ag: "The board",
    agP: "Copies of the model post a message after every chunk and read each other's posts. Gradients flow through the board.",
    agCap: "The relay task: three agents hold facts, the asker needs one. Cut the board to see the asker guess.",
    specs: "The numbers",
    rows: [
      ["Width", "640"],
      ["Layers", "14, TONN at 0, 3, 6, 9, 12"],
      ["Attention", "10 heads of 64 channels"],
      ["TONN slots", "20 circuits of 32 channels"],
      ["Memory circuits", "1 retrieval and 1 board per TONN layer"],
      ["Chunk", "64 tokens, top 4 retrieved"],
      ["Swarm", "4 agents per board"],
      ["Tokenizer", "byte-level BPE, 32,768 tokens"],
      ["Parameters", "about 90M"],
      ["Training", "about 100B tokens, planned"],
    ],
  },
  ja: {
    title: "ExeaLM の内部",
    lead: "0.1B のモデルを、層の積み重ねから 1 つの回路まで。",
    stack: "層の積み重ね",
    layer: "TONN 層の中",
    layerP: "1 つの射影が残差ストリームを 20 のスロットに分けます。各スロットは 3 つのストリームで小さな回路を動かします。1 つの射影が結果を書き戻します。",
    layerCap: "TONN 層を上から下へ。回路にカーソルを合わせると計算の中身が出ます。",
    menu: "回路のメニュー",
    menuP: "スロットに入る回路は 14 種類。学習中の探索が、損失を下げる回路を残します。",
    menuCap: "すべての回路を同じ入力で動かしたもの。薄い棒が入力、線が出力です。",
    rg: "検索",
    rgP: "64 トークンごとに、モデル自身の埋め込みで読み取り専用のライブラリを検索し、上位 4 チャンクを読みます。",
    rgCap: "検索回路を 1 段階ずつ。",
    ag: "掲示板",
    agP: "モデルのコピーはチャンクごとにメッセージを投稿し、互いの投稿を読みます。勾配は掲示板を通って流れます。",
    agCap: "中継タスク：3 体が事実を持ち、質問役がその 1 つを必要とします。掲示板を切ると質問役は当て推量になります。",
    specs: "数字で見る",
    rows: [
      ["幅", "640"],
      ["層", "14（TONN は第 0・3・6・9・12 層）"],
      ["アテンション", "64 チャネルのヘッド 10 個"],
      ["TONN のスロット", "32 チャネルの回路 20 個"],
      ["メモリ回路", "TONN 層ごとに検索 1 つ、掲示板 1 つ"],
      ["チャンク", "64 トークン、上位 4 件を検索"],
      ["スウォーム", "掲示板 1 つにエージェント 4 体"],
      ["トークナイザー", "バイトレベル BPE、32,768 語彙"],
      ["パラメータ", "約 9 千万"],
      ["学習", "約 1,000 億トークン（予定）"],
    ],
  },
};

export function ArchitecturePage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const other: Lang = lang === "en" ? "ja" : "en";
  return (
    <Shell lang={lang} altHref={href(other, "/architecture/")} current="architecture" beam={[{ id: "stack", label: c.stack }, { id: "layer", label: c.layer }, { id: "circuits", label: c.menu }, { id: "retrieval", label: c.rg }, { id: "board", label: c.ag }, { id: "numbers", label: c.specs }]}>
      <article className="sheet [--fig-w:60rem]" data-pagefind-body>
        <PageHead title={c.title} lead={c.lead} />
        <div id="stack" className="plate enter mt-10 w-[min(60rem,100%)] scroll-mt-28">
          <div className="plate__head mono">
            <b>{lang === "ja" ? "図 01" : "Fig. 01"}</b>
            <span>ExeaLM 0.1B</span>
          </div>
          <HybridStack lang={lang} />
        </div>
        <Section n={1} id="layer" title={c.layer}>
          <P>{c.layerP}</P>
          <Figure n={2} lang={lang} caption={c.layerCap}>
            <TonnLayer lang={lang} />
          </Figure>
        </Section>
        <Section n={2} id="circuits" title={c.menu}>
          <P>{c.menuP}</P>
          <Figure n={3} lang={lang} caption={c.menuCap}>
            <CircuitMenu lang={lang} />
          </Figure>
        </Section>
        <Section n={3} id="retrieval" title={c.rg}>
          <P>{c.rgP}</P>
          <Figure n={4} lang={lang} caption={c.rgCap}>
            <RetrievalFlow lang={lang} mode="design" />
          </Figure>
        </Section>
        <Section n={4} id="board" title={c.ag}>
          <P>{c.agP}</P>
          <Figure n={5} lang={lang} caption={c.agCap}>
            <SwarmBoard lang={lang} />
          </Figure>
        </Section>
        <Section n={5} id="numbers" title={c.specs}>
          <dl className="grid w-[min(46rem,100%)] border-t border-[var(--line-2)] sm:grid-cols-2 sm:gap-x-10" data-reveal="stagger">
            {c.rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3">
                <dt className="mono text-ink-3">{k}</dt>
                <dd className="text-right text-[1.05rem]">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </article>
    </Shell>
  );
}
