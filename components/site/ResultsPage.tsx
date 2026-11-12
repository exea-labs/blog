import { Shell } from "./Shell";
import { PageHead, Section, P } from "./PageHead";
import { Figure } from "@/components/mdx/Blocks";
import { Leaderboard } from "@/components/viz/Leaderboard";
import { EqualCompute } from "@/components/viz/EqualCompute";
import { LossCurves } from "@/components/viz/LossCurves";
import { SpeedBars } from "@/components/viz/SpeedBars";
import { SweepTimeline } from "@/components/viz/SweepTimeline";
import { href, type Lang } from "@/lib/i18n";

const COPY = {
  en: {
    title: "Results",
    lead: "Every ExeaLM-versus-Llama run so far, built from the result files in the ExeaLM repository. These are small runs on one Mac Studio GPU: they test mechanisms and architectures, not the final model.",
    board: "The leaderboard",
    boardP: "Each row is one training run on the same data mix (50% English, 30% Japanese, 20% code) with the same 32k tokenizer. Runs at 13M use 3,000 steps unless a time budget is shown; larger runs say their size.",
    eq: "Equal steps and equal compute",
    eqP: "The fair test of an architecture gives both models the same training time on the same GPU. The hybrid wins or ties from 13M to 0.1B.",
    eqCap: "The hybrid's lead over a same-size Llama by model size, in bits per byte. Above zero, the hybrid is better.",
    loss: "Training curves at 0.1B",
    lossCap: "Training loss against wall-clock time for the equal-compute pair. Switch to 48M for the 2:1 layout's first win.",
    speed: "Speed",
    speedCap: "Circuit time before and after the parallel prefix scan, and the cost per token of each layout relative to Llama.",
    sweep: "The sweep",
    sweepCap: "Every run in the queue on the Mac, by start time and question.",
    note: "Raw numbers: results/README.md and the JSON files beside it in exea-labs/ExeaLM.",
  },
  ja: {
    title: "結果",
    lead: "これまでの ExeaLM 対 Llama の全実行を、ExeaLM リポジトリの結果ファイルから作っています。Mac Studio の GPU 1 台での小さな実験で、確かめているのは仕組みとアーキテクチャです。最終的なモデルではありません。",
    board: "ランキング",
    boardP: "各行は 1 回の学習で、データの配分（英語 50%、日本語 30%、コード 20%）と 32k トークナイザーは共通です。13M の実行は時間予算の表示がなければ 3,000 ステップです。大きい実行はサイズを示しています。",
    eq: "ステップ数をそろえた比較と計算量をそろえた比較",
    eqP: "アーキテクチャの公平な比べ方は、両方のモデルに同じ GPU で同じ学習時間を与えることです。ハイブリッドは 13M から 0.1B まで、勝つか引き分けています。",
    eqCap: "モデルサイズごとの、同じサイズの Llama に対するハイブリッドのリード（bpb）。ゼロより上ならハイブリッドが良い。",
    loss: "0.1B の学習曲線",
    lossCap: "計算量をそろえた組の、経過時間に対する学習損失。48M に切り替えると、2:1 構成が最初に勝った実行が見られます。",
    speed: "速度",
    speedCap: "並列プレフィックススキャン前後の回路の時間と、各構成のトークンあたりコスト（Llama を 1 とする）。",
    sweep: "実験の流れ",
    sweepCap: "Mac のキューで動いたすべての実行を、開始時刻と問いごとに並べたもの。",
    note: "生の数値は exea-labs/ExeaLM の results/README.md と同じ場所の JSON ファイルにあります。",
  },
};

export function ResultsPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const other: Lang = lang === "en" ? "ja" : "en";
  return (
    <Shell lang={lang} altHref={href(other, "/results/")} current="results" beam={[{ id: "leaderboard", label: c.board }, { id: "equal-compute", label: c.eq }, { id: "curves", label: c.loss }, { id: "speed", label: c.speed }, { id: "sweep", label: c.sweep }]}>
      <article className="sheet [--fig-w:64rem]" data-pagefind-body>
        <PageHead title={c.title} lead={c.lead} />
        <Section n={1} id="leaderboard" title={c.board}>
          <P>{c.boardP}</P>
          <div className="plate mt-6 w-[min(64rem,calc(100vw-var(--gutter-l)-var(--gutter-r)))]">
            <Leaderboard lang={lang} />
          </div>
        </Section>
        <Section n={2} id="equal-compute" title={c.eq}>
          <P>{c.eqP}</P>
          <Figure n={1} lang={lang} caption={c.eqCap}>
            <EqualCompute lang={lang} />
          </Figure>
        </Section>
        <Section n={3} id="curves" title={c.loss}>
          <Figure n={2} lang={lang} caption={c.lossCap}>
            <LossCurves lang={lang} />
          </Figure>
        </Section>
        <Section n={4} id="speed" title={c.speed}>
          <Figure n={3} lang={lang} caption={c.speedCap}>
            <SpeedBars lang={lang} />
          </Figure>
        </Section>
        <Section n={5} id="sweep" title={c.sweep}>
          <Figure n={4} lang={lang} caption={c.sweepCap}>
            <SweepTimeline lang={lang} />
          </Figure>
          <P>{c.note}</P>
        </Section>
      </article>
    </Shell>
  );
}
