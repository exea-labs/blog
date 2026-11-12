/** TONN's circuit menu, as defined in exealm/model/circuits.py. */
export type Family = "memory" | "local" | "recurrent" | "gate" | "attention";
export type Circuit = {
  id: string;
  family: Family;
  streams: number;
  name: { en: string; ja: string };
  what: { en: string; ja: string };
};

export const FAMILY_COLOR: Record<Family, string> = {
  memory: "#ff9ec4",
  local: "#ffb47e",
  recurrent: "#ff8686",
  gate: "#ffd0c8",
  attention: "#a9b0c2",
};

export const FAMILY_NAME: Record<Family, { en: string; ja: string }> = {
  memory: { en: "Memory", ja: "メモリ" },
  local: { en: "Short range", ja: "短距離" },
  recurrent: { en: "Running state", ja: "状態の蓄積" },
  gate: { en: "Gates and products", ja: "ゲートと積" },
  attention: { en: "Attention", ja: "アテンション" },
};

export const CIRCUITS: Circuit[] = [
  { id: "D", family: "local", streams: 1, name: { en: "Delay", ja: "遅延" }, what: { en: "Copies stream A from a fixed number of steps back (the lag).", ja: "ストリーム A を一定ステップ前（ラグ）からそのまま写します。" } },
  { id: "C", family: "local", streams: 3, name: { en: "Short convolution", ja: "短い畳み込み" }, what: { en: "Adds A now, B one gap back and C two gaps back, then a smooth gate (silu). Good at short word pieces.", ja: "現在の A、1 間隔前の B、2 間隔前の C を足し、滑らかなゲート（silu）を通します。短い語の断片に強い回路です。" } },
  { id: "I", family: "recurrent", streams: 1, name: { en: "Leaky running sum", ja: "減衰つき累積和" }, what: { en: "Keeps a sum of A that fades by a learned rate per channel.", ja: "チャネルごとに学習した割合で薄れていく A の和を保ちます。" } },
  { id: "GI", family: "recurrent", streams: 2, name: { en: "Gated running sum", ja: "ゲートつき累積和" }, what: { en: "Like the running sum, but B decides at every step how much of the past to keep.", ja: "累積和と同じですが、過去をどれだけ残すかを B が毎ステップ決めます。" } },
  { id: "MI", family: "recurrent", streams: 2, name: { en: "Running sum of a product", ja: "積の累積和" }, what: { en: "Multiplies a lagged A by B and keeps a fading sum of the result.", ja: "ラグをつけた A と B の積をとり、その減衰つきの和を保ちます。" } },
  { id: "MIM", family: "recurrent", streams: 3, name: { en: "Gated product memory", ja: "ゲートつき積メモリ" }, what: { en: "A running sum of products, read out through C. It behaves like an induction head: see a pair, recall it later.", ja: "積の累積和を C を通して読み出します。誘導ヘッドのように、組を見て後で思い出す働きをします。" } },
  { id: "EP", family: "recurrent", streams: 2, name: { en: "Softmax pooling", ja: "ソフトマックス集約" }, what: { en: "A weighted average of B over the whole past, with weights exp(A).", ja: "過去全体にわたる B の加重平均で、重みは exp(A) です。" } },
  { id: "SM", family: "recurrent", streams: 3, name: { en: "Selective state space", ja: "選択的状態空間" }, what: { en: "A Mamba-like state: B sets the step size at each position, so the circuit chooses what to remember.", ja: "Mamba に似た状態です。B が位置ごとにステップ幅を決め、何を覚えるかを回路が選びます。" } },
  { id: "OS", family: "recurrent", streams: 2, name: { en: "Oscillating memory", ja: "振動メモリ" }, what: { en: "A state that rotates as it fades (S4D-like), so it can track rhythms and periodic patterns.", ja: "減衰しながら回転する状態（S4D に似ています）で、リズムや周期的なパターンを追えます。" } },
  { id: "G", family: "gate", streams: 2, name: { en: "Gated unit", ja: "ゲートユニット" }, what: { en: "silu(A) times B at the same position. A small per-position MLP.", ja: "同じ位置で silu(A) と B を掛けます。位置ごとの小さな MLP です。" } },
  { id: "M", family: "gate", streams: 2, name: { en: "Product", ja: "積" }, what: { en: "A from a few steps back times B now.", ja: "数ステップ前の A と現在の B の積です。" } },
  { id: "RP", family: "attention", streams: 3, name: { en: "Rotary attention", ja: "回転位置アテンション" }, what: { en: "One small attention head inside a slot: A asks, B answers, C is what gets passed on.", ja: "スロットの中の小さなアテンションヘッドです。A が問い、B が答え、C が渡す内容です。" } },
  { id: "RG", family: "memory", streams: 3, name: { en: "Retrieval", ja: "検索" }, what: { en: "Searches a read-only library with the model's own embeddings and reads the chunks it finds.", ja: "モデル自身の埋め込みで読み取り専用のライブラリを検索し、見つけたチャンクを読みます。" } },
  { id: "AG", family: "memory", streams: 3, name: { en: "Agent board", ja: "エージェント掲示板" }, what: { en: "Posts a message after every chunk and reads the messages other copies of the model posted.", ja: "チャンクごとにメッセージを投稿し、ほかのモデルのコピーが投稿したメッセージを読みます。" } },
];

export const byId = Object.fromEntries(CIRCUITS.map((c) => [c.id, c])) as Record<string, Circuit>;

/** The 0.1B design: d 640, 14 layers, TONN at 0, 3, 6, 9, 12, 20 circuit slots of 32 channels per TONN layer. */
export const MODEL = {
  width: 640,
  layers: 14,
  tonnLayers: [0, 3, 6, 9, 12],
  slots: 20,
  channels: 32,
  params: "101.1M",
  initWeights: { C: 4, G: 0.25, D: 0.25 } as Record<string, number>,
  pinned: ["RG", "AG"],
};

/** A deterministic starting draw of circuits for one TONN layer, with the convolution-heavy start. */
export function startingDraw(layer: number, slots = MODEL.slots): string[] {
  let s = 0x9e3779b9 ^ (layer * 7919);
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
  const menu = CIRCUITS.filter((c) => !MODEL.pinned.includes(c.id));
  const w = menu.map((c) => MODEL.initWeights[c.id] ?? 1);
  const total = w.reduce((a, b) => a + b, 0);
  const out = [...MODEL.pinned];
  while (out.length < slots) {
    let r = rand() * total;
    let k = 0;
    while (r > w[k]) r -= w[k++];
    out.push(menu[Math.min(k, menu.length - 1)].id);
  }
  const order = CIRCUITS.map((c) => c.id);
  return out.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
