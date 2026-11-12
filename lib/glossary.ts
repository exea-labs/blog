export type Term = { id: string; en: { term: string; def: string }; ja: { term: string; def: string } };

/** Every term defined once. Posts link to these with <Term id="...">. */
export const GLOSSARY: Term[] = [
  {
    id: "bpb",
    en: { term: "Bits per byte", def: "How surprised the model is by held-out text, averaged per byte of that text. Lower is better. Counting per byte instead of per token lets models with different tokenizers be compared fairly." },
    ja: { term: "バイトあたりビット数（bpb）", def: "評価用テキストに対するモデルの「驚き」を、テキスト 1 バイトあたりで平均したもの。低いほど良い。トークンではなくバイトで数えるので、トークナイザーの違うモデルも公平に比べられます。" },
  },
  {
    id: "bpt",
    en: { term: "Bits per token", def: "The same measure counted per token. Used when every model in a comparison shares one tokenizer." },
    ja: { term: "トークンあたりビット数", def: "同じ指標をトークン単位で数えたもの。比べるモデルが同じトークナイザーを使うときに使います。" },
  },
  {
    id: "equal-compute",
    en: { term: "Equal compute", def: "Both models get the same training time on the same GPU, and each takes as many steps as it can. A faster model gets more steps. This is the fairest test of an architecture." },
    ja: { term: "計算量をそろえた比較", def: "両方のモデルに同じ GPU で同じ学習時間を与え、それぞれできるだけ多くのステップを進めます。速いモデルほど多くのステップを踏めます。アーキテクチャのもっとも公平な比べ方です。" },
  },
  {
    id: "equal-steps",
    en: { term: "Equal steps", def: "Both models train for the same number of steps on the same data, however long each step takes. It compares what each architecture learns per example, not its speed." },
    ja: { term: "ステップ数をそろえた比較", def: "1 ステップにかかる時間に関係なく、同じデータで同じステップ数だけ学習させます。速度ではなく、1 例あたりに何を学べるかを比べます。" },
  },
  {
    id: "tonn",
    en: { term: "TONN", def: "Exea Labs' architecture (pronounced \"tone\"). A TONN layer is a set of small circuits whose types are chosen during training by a search, so the network builds part of its own architecture from data." },
    ja: { term: "TONN（トーン）", def: "Exea Labs のアーキテクチャ。TONN 層は小さな回路の集まりで、回路の種類は学習中の探索で決まります。ネットワークがデータから自分のアーキテクチャの一部を組み立てます。" },
  },
  {
    id: "circuit",
    en: { term: "Circuit (slot)", def: "One small computation inside a TONN layer, such as a short convolution or a running sum. A layer has a fixed number of slots, and each slot holds one circuit type." },
    ja: { term: "回路（スロット）", def: "TONN 層の中の小さな計算ひとつ。短い畳み込みや累積和など。層には決まった数のスロットがあり、各スロットに回路の種類がひとつ入ります。" },
  },
  {
    id: "streams",
    en: { term: "Streams A, B and C", def: "The three inputs every circuit reads, each a slice of the layer's input projection. A circuit may use one, two or all three." },
    ja: { term: "ストリーム A・B・C", def: "すべての回路が読む 3 つの入力。層の入力射影の一部です。回路は 1 つ、2 つ、または 3 つすべてを使います。" },
  },
  {
    id: "hybrid",
    en: { term: "Hybrid (2:1)", def: "ExeaLM's default layout: every third layer is a TONN layer and the other two are full attention layers. At 0.1B that is TONN at layers 0, 3, 6, 9 and 12." },
    ja: { term: "ハイブリッド（2:1）", def: "ExeaLM の標準構成。3 層に 1 層が TONN 層で、残り 2 層はフルアテンション層。0.1B では第 0・3・6・9・12 層が TONN です。" },
  },
  {
    id: "llama",
    en: { term: "Llama-style transformer", def: "Our baseline: a standard modern transformer (attention with rotary positions, gated MLP, RMS normalization) with the same width, depth and tokenizer as the model it is compared with." },
    ja: { term: "Llama 型トランスフォーマー", def: "比較の基準。回転位置埋め込みつきアテンション、ゲートつき MLP、RMS 正規化を使う標準的なトランスフォーマーで、比べる相手と同じ幅・深さ・トークナイザーにそろえます。" },
  },
  {
    id: "conv-start",
    en: { term: "Convolution-heavy start", def: "The starting draw of circuits favours short convolutions (4 times the usual chance) and disfavours delays and gated units (a quarter). It fixed the hybrid's bad seed." },
    ja: { term: "畳み込み寄りの初期配置", def: "最初の回路の抽選で、短い畳み込みを通常の 4 倍、遅延とゲートユニットを 4 分の 1 の確率にします。ハイブリッドの悪いシードを直した設定です。" },
  },
  {
    id: "search",
    en: { term: "Architecture search", def: "During training, TONN measures how much each group of circuits is worth (how much the loss rises when that group is switched off) and redraws the weakest slots." },
    ja: { term: "アーキテクチャ探索", def: "学習中に、TONN は回路のグループごとの価値（そのグループを止めたときに損失がどれだけ上がるか）を測り、もっとも弱いスロットを引き直します。" },
  },
  {
    id: "swarm",
    en: { term: "Swarm", def: "Several copies of the model (agents) that run side by side and share one message board. In training, a batch holds many swarms." },
    ja: { term: "スウォーム", def: "並んで動き、ひとつの掲示板を共有するモデルの複数のコピー（エージェント）。学習では 1 つのバッチに多くのスウォームが入ります。" },
  },
  {
    id: "board",
    en: { term: "Agent board (AG)", def: "The circuit agents use to talk. After each chunk an agent posts a message (a value, a key and a strength); later it reads teammates' earlier posts with attention." },
    ja: { term: "エージェント掲示板（AG）", def: "エージェント同士が話すための回路。各チャンクのあとにメッセージ（値・キー・強さ）を投稿し、あとで仲間の過去の投稿をアテンションで読みます。" },
  },
  {
    id: "retrieval",
    en: { term: "Retrieval (RG)", def: "The circuit that searches a read-only library of text chunks, using embeddings the model learns itself, and reads the chunks it finds." },
    ja: { term: "検索（RG）", def: "モデル自身が学んだ埋め込みで、テキストチャンクの読み取り専用ライブラリを検索し、見つけたチャンクを読む回路です。" },
  },
  {
    id: "chunk",
    en: { term: "Chunk", def: "A fixed run of tokens (64 in the real model). Retrieval searches and the board posts once per chunk." },
    ja: { term: "チャンク", def: "決まった長さのトークン列（実機では 64）。検索と掲示板への投稿はチャンクごとに 1 回行います。" },
  },
  {
    id: "oracle",
    en: { term: "Oracle search", def: "A diagnostic: the search is forced to look inside the right article. If retrieval helps with the oracle but not with the learned search, the search is the problem." },
    ja: { term: "オラクル検索", def: "診断用の設定。検索が必ず正しい記事の中を見るようにします。オラクルでは効くのに学習した検索では効かないなら、問題は検索です。" },
  },
  {
    id: "hit-rate",
    en: { term: "Hit rate", def: "How often the search returns a chunk of the right article among its top 4 results." },
    ja: { term: "ヒット率", def: "検索の上位 4 件に正しい記事のチャンクが入る割合です。" },
  },
  {
    id: "lexical",
    en: { term: "Rare-word keys", def: "A second part of each retrieval key: a fixed random code for every token in the chunk, weighted by how rare the token is. Chunks that share names and terms match from the first step." },
    ja: { term: "希少語キー", def: "検索キーの第 2 の部分。チャンク内の各トークンに固定のランダムな符号を割り当て、そのトークンの珍しさで重みづけします。名前や用語を共有するチャンクが最初のステップから一致します。" },
  },
  {
    id: "seed",
    en: { term: "Seed", def: "The number that fixes a run's random choices: starting weights, starting circuits and data order. A result that holds on two seeds is less likely to be luck." },
    ja: { term: "シード", def: "実行の乱数（初期重み、初期回路、データの順序）を決める数。2 つのシードで成り立つ結果は、偶然である可能性が低くなります。" },
  },
  {
    id: "tokenizer",
    en: { term: "Tokenizer", def: "Splits text into tokens, the units the model reads. ExeaLM uses byte-level BPE with 32,768 tokens, trained on English, Japanese and code." },
    ja: { term: "トークナイザー", def: "テキストをモデルが読む単位（トークン）に分けるもの。ExeaLM は英語・日本語・コードで学習した 32,768 語彙のバイトレベル BPE を使います。" },
  },
  {
    id: "prefix-scan",
    en: { term: "Prefix scan", def: "A way to compute a running sum over a sequence in parallel, in a logarithmic number of passes instead of one step at a time." },
    ja: { term: "プレフィックススキャン", def: "系列の累積和を 1 ステップずつではなく、対数回のパスで並列に計算する方法です。" },
  },
  {
    id: "params",
    en: { term: "Parameters", def: "The number of learned weights. ExeaLM's planned size is 0.1 billion (101.1M with a 49k vocabulary, about 90M with the 32k tokenizer)." },
    ja: { term: "パラメータ数", def: "学習される重みの数。ExeaLM の予定サイズは 0.1B（49k 語彙で 1 億 110 万、32k トークナイザーで約 9 千万）です。" },
  },
];

export const glossaryById = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));
