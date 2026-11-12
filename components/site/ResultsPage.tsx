import { Shell } from "./Shell";
import cmp from "@/data/comparisons.json";
import { PageHead, Section } from "./PageHead";
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
    lead: "Every ExeaLM-versus-Llama run so far. Lower bits per byte is better.",
    hero: "ExeaLM at 0.1B, same training time as a same-size Llama",
    board: "Every run",
    eq: "Equal steps and equal compute",
    eqCap: "The hybrid's lead over Llama by model size. Above zero, the hybrid is better.",
    loss: "Training curves",
    lossCap: "Training loss against time. Switch to 48M for the first 2:1 win.",
    speed: "Speed",
    speedCap: "Circuit time before and after the prefix scan, and cost per token against Llama.",
    sweep: "The sweep",
    sweepCap: "Every run on the Mac, by start time.",
  },
  ja: {
    title: "結果",
    lead: "これまでの ExeaLM 対 Llama のすべての実行。bpb は低いほど良い。",
    hero: "0.1B の ExeaLM と同サイズの Llama、同じ学習時間",
    board: "すべての実行",
    eq: "ステップ数と計算量をそろえた比較",
    eqCap: "モデルサイズごとの Llama に対するリード。ゼロより上ならハイブリッドが良い。",
    loss: "学習曲線",
    lossCap: "時間に対する学習損失。48M に切り替えると 2:1 構成の最初の勝利が見られます。",
    speed: "速度",
    speedCap: "プレフィックススキャン前後の回路の時間と、Llama に対するトークンあたりのコスト。",
    sweep: "実験の流れ",
    sweepCap: "Mac で動いたすべての実行を開始時刻順に。",
  },
};

export function ResultsPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const other: Lang = lang === "en" ? "ja" : "en";
  return (
    <Shell lang={lang} altHref={href(other, "/results/")} current="results" beam={[{ id: "equal-compute", label: c.eq }, { id: "leaderboard", label: c.board }, { id: "curves", label: c.loss }, { id: "speed", label: c.speed }, { id: "sweep", label: c.sweep }]}>
      <article className="sheet [--fig-w:64rem]" data-pagefind-body>
        <PageHead title={c.title} lead={c.lead} />
        <div id="top" className="enter mt-10 grid w-[min(64rem,100%)] items-end gap-8 border-y border-[var(--line-2)] py-8 md:grid-cols-[auto_auto_minmax(0,1fr)]">
          <div>
            <div className="mono text-signal-ink">ExeaLM</div>
            <div className="result__v mt-2">{cmp.equal_time.find((x) => x.size === "90M")!.hybrid.mean.toFixed(3)}</div>
          </div>
          <div>
            <div className="mono text-ink-3">Llama</div>
            <div className="mt-2 font-light text-ink-3" style={{ font: "300 clamp(3.25rem, 1.8rem + 4.6vw, 6.25rem)/0.9 var(--font-serif)", letterSpacing: "-0.04em" }}>{cmp.equal_time.find((x) => x.size === "90M")!.llama.mean.toFixed(3)}</div>
          </div>
          <p className="text-[1.15rem] leading-snug text-ink-2">{c.hero}</p>
        </div>
        <Section n={1} id="equal-compute" title={c.eq}>
          <Figure n={1} lang={lang} caption={c.eqCap}>
            <EqualCompute lang={lang} />
          </Figure>
        </Section>
        <Section n={2} id="leaderboard" title={c.board}>
          <div className="plate w-[min(64rem,calc(100vw-var(--gutter-l)-var(--gutter-r)))]" data-reveal="scale">
            <Leaderboard lang={lang} />
          </div>
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
        </Section>
      </article>
    </Shell>
  );
}
