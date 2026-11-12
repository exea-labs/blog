import { Shell } from "./Shell";
import { PageHead, Section, P } from "./PageHead";
import { Figure } from "@/components/mdx/Blocks";
import { HybridStack } from "@/components/viz/HybridStack";
import { TonnLayer } from "@/components/viz/TonnLayer";
import { CircuitMenu } from "@/components/viz/CircuitMenu";
import { RetrievalFlow } from "@/components/viz/RetrievalFlow";
import { SwarmBoard } from "@/components/viz/SwarmBoard";
import { MODEL } from "@/lib/circuits";
import { href, type Lang } from "@/lib/i18n";

const COPY = {
  en: {
    title: "Inside ExeaLM",
    lead: "How the 0.1B model is put together, from the layer stack down to a single circuit, and the two memory circuits that make it different. Every figure is interactive.",
    stack: "The stack",
    stackP: [
      "ExeaLM has 14 layers on a residual stream of 640 channels. Every third layer is a TONN layer; the other nine are standard causal attention with 10 heads of 64 channels. A gated MLP follows every layer. With the 32k tokenizer and tied embeddings the model has about 90M parameters.",
      "The mix came from experiments, not from a plan. Pure TONN lost to a same-size transformer, mostly on code. Two attention layers for every TONN layer won at equal compute from 27M up to 0.1B.",
    ],
    stackCap: "The 0.1B model. Lit plates are TONN layers, glass plates are attention layers; the line up the middle is the residual stream. Point at a layer to open it.",
    layer: "One TONN layer",
    layerP: [
      "A TONN layer reads the residual stream once, through one input projection, into 20 slots. Each slot gets three streams of 32 channels, A, B and C. Each slot runs one circuit type. Every slot's output is divided by a running estimate of its own size, so a quiet circuit and a loud one count equally. One output projection writes the 20 results back.",
      "Slots of the same type run together as one batched operation. The layer sorts its slots by type and permutes its weight matrices to match, so the cost of a TONN layer is close to the cost of an attention layer of the same width.",
    ],
    layerCap: "One TONN layer, top to bottom. The three coloured lanes in each slot are streams A, B and C; a circuit that reads fewer streams leaves the others dark. Point at a circuit for its definition.",
    menu: "The circuit menu",
    menuP: [
      "Fourteen circuit types can fill a slot. Most are causal mixers of the past: delays, short convolutions, running sums with learned decay, a selective state space, an oscillating memory, small attention heads. Two are memory circuits that reach outside the model.",
      "During training the search measures what each group of circuits is worth and redraws the weakest slots. The starting draw favours short convolutions, which fixed a bad seed in the hybrid.",
    ],
    menuCap: "Every circuit type on the same toy input. Faint bars are stream A; the line is the circuit's output, drawn left to right as time moves forward.",
    rg: "Retrieval: the model's own RAG",
    rgP: [
      "The RG circuit searches a read-only library once per chunk of 64 tokens. Query and library keys come from the model's own chunk encoder, so there is no outside embedding model. The top 4 chunks are re-encoded and read through the layer's own input projection.",
      "On a synthetic lookup it finds the right fact among 1,024 unseen ones every time. On real text the search is the open problem.",
    ],
    rgCap: "The retrieval circuit, one stage at a time. Click a stage to stop the tour.",
    ag: "The board: agents that talk",
    agP: [
      "The AG circuit connects copies of the model. After every chunk each agent posts one message to a shared board: a value, a key and a strength. In later chunks agents read the board with attention, and an empty entry lets them read nothing. In training, consecutive rows of a batch form swarms of 4 with one board, and the gradient flows through the board.",
    ],
    agCap: "The relay task on the board. Three agents hold facts; the asker must answer a question about one of them. Cut the board to see what the asker does without it.",
    specs: "The numbers",
    rows: [
      ["Width (residual stream)", "640"],
      ["Layers", "14 (TONN at 0, 3, 6, 9, 12)"],
      ["Attention layers", "10 heads of 64 channels, rotary positions"],
      ["TONN slots per layer", "20 circuits of 32 channels"],
      ["Pinned memory circuits", "1 retrieval (RG) and 1 board (AG) per TONN layer"],
      ["Chunk", "64 tokens; retrieval returns the top 4"],
      ["Swarm in training", "4 agents per board"],
      ["Tokenizer", "byte-level BPE, 32,768 tokens"],
      ["Parameters", "about 90M with the 32k tokenizer"],
      ["Training plan", "about 100B tokens"],
    ],
    more: "Results and caveats for each piece are in the posts.",
  },
  ja: {
    title: "ExeaLM の内部",
    lead: "0.1B のモデルがどう組み立てられているか。層の積み重ねから 1 つの回路まで、そしてこのモデルを特徴づける 2 つのメモリ回路を見ていきます。図はすべて操作できます。",
    stack: "層の積み重ね",
    stackP: [
      "ExeaLM は 640 チャネルの残差ストリームの上に 14 層を重ねます。3 層に 1 層が TONN 層で、残りの 9 層は 64 チャネルのヘッド 10 個をもつ標準的な因果アテンションです。各層のあとにゲートつき MLP が続きます。32k のトークナイザーと共有埋め込みで、パラメータ数は約 9 千万です。",
      "この組み合わせは計画ではなく実験から決まりました。純粋な TONN は同じサイズのトランスフォーマーに主にコードで負けました。TONN 層 1 つにつきアテンション層 2 つの構成は、27M から 0.1B まで、計算量をそろえた比較で勝ちました。",
    ],
    stackCap: "0.1B のモデル。光る板が TONN 層、ガラスの板がアテンション層、中央を上る線が残差ストリームです。層にカーソルを合わせると中身が開きます。",
    layer: "TONN 層の中",
    layerP: [
      "TONN 層は、1 つの入力射影で残差ストリームを 1 回読み、20 個のスロットに分けます。各スロットは 32 チャネルのストリーム A・B・C を受け取り、1 種類の回路を動かします。各スロットの出力は自分の大きさの移動推定で割られるので、静かな回路も大きな回路も同じ重みで効きます。1 つの出力射影が 20 個の結果を書き戻します。",
      "同じ種類のスロットはまとめて 1 回の計算で動きます。層はスロットを種類順に並べ、それに合わせて重み行列を並べ替えるので、TONN 層のコストは同じ幅のアテンション層に近くなります。",
    ],
    layerCap: "TONN 層を上から下へ。各スロットの 3 色の帯がストリーム A・B・C です。読むストリームが少ない回路では、使わない帯が暗くなります。回路にカーソルを合わせると定義が出ます。",
    menu: "回路のメニュー",
    menuP: [
      "スロットに入る回路は 14 種類です。多くは過去を因果的に混ぜるもので、遅延、短い畳み込み、学習した減衰つきの累積和、選択的状態空間、振動メモリ、小さなアテンションヘッドがあります。2 つはモデルの外に手を伸ばすメモリ回路です。",
      "学習中、探索が回路のグループごとの価値を測り、もっとも弱いスロットを引き直します。初期配置は短い畳み込みを多めにしてあり、これがハイブリッドの悪いシードを直しました。",
    ],
    menuCap: "すべての回路を同じおもちゃの入力で動かしたもの。薄い棒がストリーム A、線が回路の出力で、時間が進むにつれて左から右へ描かれます。",
    rg: "検索：モデル自身の RAG",
    rgP: [
      "RG 回路は 64 トークンのチャンクごとに 1 回、読み取り専用のライブラリを検索します。クエリとライブラリのキーはモデル自身のチャンクエンコーダーから作るので、外部の埋め込みモデルはいりません。上位 4 チャンクを符号化し直し、層自身の入力射影を通して読みます。",
      "合成の検索課題では、見たことのない 1,024 件の事実から正しいものを毎回見つけます。実際のテキストでは、検索そのものが未解決の問題です。",
    ],
    rgCap: "検索回路を 1 段階ずつ。段階を押すと自動再生が止まります。",
    ag: "掲示板：話すエージェント",
    agP: [
      "AG 回路はモデルのコピー同士をつなぎます。各チャンクのあと、各エージェントは共有の掲示板にメッセージを 1 つ投稿します（値・キー・強さ）。後のチャンクでは掲示板をアテンションで読み、空のエントリを選べば何も読まずに済みます。学習では、バッチの連続する行が 4 体のスウォームになって 1 つの掲示板を共有し、勾配は掲示板を通って流れます。",
    ],
    agCap: "掲示板での中継タスク。3 体が事実を持ち、質問役はそのうち 1 つについての質問に答えます。掲示板を切ると、質問役がどうなるかが見られます。",
    specs: "数字で見る",
    rows: [
      ["幅（残差ストリーム）", "640"],
      ["層数", "14（TONN は第 0・3・6・9・12 層）"],
      ["アテンション層", "64 チャネルのヘッド 10 個、回転位置埋め込み"],
      ["TONN 層のスロット", "32 チャネルの回路 20 個"],
      ["固定のメモリ回路", "TONN 層ごとに検索（RG）1 つと掲示板（AG）1 つ"],
      ["チャンク", "64 トークン、検索は上位 4 件"],
      ["学習時のスウォーム", "掲示板 1 つにエージェント 4 体"],
      ["トークナイザー", "バイトレベル BPE、32,768 語彙"],
      ["パラメータ数", "32k トークナイザーで約 9 千万"],
      ["学習計画", "約 1,000 億トークン"],
    ],
    more: "それぞれの部品の結果と注意点は記事にあります。",
  },
};

export function ArchitecturePage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const other: Lang = lang === "en" ? "ja" : "en";
  void MODEL;
  return (
    <Shell lang={lang} altHref={href(other, "/architecture/")} current="architecture" beam={[{ id: "stack", label: c.stack }, { id: "layer", label: c.layer }, { id: "circuits", label: c.menu }, { id: "retrieval", label: c.rg }, { id: "board", label: c.ag }, { id: "numbers", label: c.specs }]}>
      <article className="sheet [--fig-w:60rem]" data-pagefind-body>
        <PageHead title={c.title} lead={c.lead} />
        <Section n={1} id="stack" title={c.stack}>
          {c.stackP.map((p, i) => <P key={i}>{p}</P>)}
          <Figure n={1} lang={lang} caption={c.stackCap}>
            <div>
              <HybridStack lang={lang} />
            </div>
          </Figure>
        </Section>
        <Section n={2} id="layer" title={c.layer}>
          {c.layerP.map((p, i) => <P key={i}>{p}</P>)}
          <Figure n={2} lang={lang} caption={c.layerCap}>
            <TonnLayer lang={lang} />
          </Figure>
        </Section>
        <Section n={3} id="circuits" title={c.menu}>
          {c.menuP.map((p, i) => <P key={i}>{p}</P>)}
          <Figure n={3} lang={lang} caption={c.menuCap}>
            <CircuitMenu lang={lang} />
          </Figure>
        </Section>
        <Section n={4} id="retrieval" title={c.rg}>
          {c.rgP.map((p, i) => <P key={i}>{p}</P>)}
          <Figure n={4} lang={lang} caption={c.rgCap}>
            <RetrievalFlow lang={lang} mode="design" />
          </Figure>
        </Section>
        <Section n={5} id="board" title={c.ag}>
          {c.agP.map((p, i) => <P key={i}>{p}</P>)}
          <Figure n={5} lang={lang} caption={c.agCap}>
            <SwarmBoard lang={lang} />
          </Figure>
        </Section>
        <Section n={6} id="numbers" title={c.specs}>
          <div className="table-wrap !w-[min(46rem,100%)]">
            <div>
              <table>
                <tbody>
                  {c.rows.map(([k, v]) => (
                    <tr key={k}>
                      <td className="mono !text-[0.7rem] text-ink-3">{k}</td>
                      <td className="!font-serif !text-[1rem] !whitespace-normal">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <P>{c.more}</P>
        </Section>
      </article>
    </Shell>
  );
}
