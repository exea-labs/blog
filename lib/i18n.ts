export type Lang = "en" | "ja";
export const LANGS: Lang[] = ["en", "ja"];

/** Path prefix for a language: English lives at the root, Japanese under /ja. */
export const base = (lang: Lang) => (lang === "en" ? "" : "/ja");
export const href = (lang: Lang, path: string) => `${base(lang)}${path === "/" && lang === "ja" ? "/" : path}`;

export const SITE = {
  name: "Exea Labs Blog",
  url: "https://blog.exealabs.org",
  repo: "https://github.com/exea-labs/ExeaLM",
  blogRepo: "https://github.com/exea-labs/blog",
  hf: "https://huggingface.co/exea-labs/ExeaLM",
  paper: "https://www.preprints.org/manuscript/202611.0994",
  signup: "https://docs.google.com/forms/d/e/1FAIpQLSdPHVZhuXxBDUf-cJM2zDbj1JZPsduu95Y_kTJ_g4gKAXdDVw/viewform",
  lab: "https://exealabs.org",
};

const en = {
  description:
    "Daily notes from Exea Labs. Right now we are building ExeaLM, an open 0.1B language model, in public: what we tried, what the numbers say and what broke.",
  nav: { posts: "Posts", architecture: "Architecture", results: "Results", glossary: "Glossary" },
  search: "Search",
  searchPlaceholder: "Search posts, figures and terms",
  searchEmpty: "Type a word: hybrid, swarm, retrieval, tokenizer.",
  searchNone: (q: string) => `Nothing matches “${q}”. Try a shorter word or a term from the glossary.`,
  searchDev: "Search runs on the built site. Run npm run build, then npm start.",
  langName: "English",
  otherLang: "日本語",
  latest: "Latest",
  allPosts: "Every post",
  day: (n: number) => `Day ${n}`,
  readPost: "Read the post",
  byline: "The Exea team",
  workBy: "Work in this post by",
  contributors: "People building ExeaLM",
  contributorsNote:
    "Everyone with a merged contribution to ExeaLM is listed here, from GitHub. High schoolers can join through the sign-up form.",
  joinCta: "Sign up to contribute",
  commits: (n: number) => `${n} commits`,
  maintainer: "Maintainer",
  onThisPage: "On this page",
  sources: "Sources",
  sourcesNote: "Every number in this post comes from these files and commits.",
  prev: "Previous",
  next: "Next",
  tags: "Topics",
  allTopics: "All",
  minutes: (n: number) => `${n} min read`,
  where: "Where ExeaLM stands",
  whereNote: "Small-scale results so far. Each links to the post that measured it.",
  footerNote: "Exea Labs is a research lab run by high schoolers. Code and weights are Apache 2.0.",
  rss: "RSS feed",
  correction: "Correction",
  figure: "Figure",
  replay: "Replay",
  copyLink: "Copy link",
  copied: "Copied",
  notFound: "This page does not exist. The posts are listed on the home page.",
  home: "Home",
  dateFmt: (d: string) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
};

const ja: typeof en = {
  description:
    "Exea Labs の日々の記録。いま取り組んでいるのは、0.1B のオープンな言語モデル ExeaLM の公開開発です。試したこと、数字が示したこと、壊れたことを書きます。",
  nav: { posts: "記事", architecture: "アーキテクチャ", results: "結果", glossary: "用語集" },
  search: "検索",
  searchPlaceholder: "記事・図・用語を検索",
  searchEmpty: "キーワードを入力：ハイブリッド、スウォーム、検索拡張、トークナイザー",
  searchNone: (q: string) => `「${q}」に一致する項目はありません。短い語か、用語集の語で試してください。`,
  searchDev: "検索はビルド後のサイトで動きます。npm run build のあと npm start を実行してください。",
  langName: "日本語",
  otherLang: "English",
  latest: "最新",
  allPosts: "すべての記事",
  day: (n: number) => `${n}日目`,
  readPost: "記事を読む",
  byline: "Exea チーム",
  workBy: "この記事の作業",
  contributors: "ExeaLM をつくっている人",
  contributorsNote:
    "ExeaLM にマージされた貢献のある人を GitHub から一覧にしています。高校生は登録フォームから参加できます。",
  joinCta: "参加を申し込む",
  commits: (n: number) => `${n} コミット`,
  maintainer: "メンテナー",
  onThisPage: "このページの内容",
  sources: "出典",
  sourcesNote: "この記事の数字はすべて、以下のファイルとコミットから取っています。",
  prev: "前の記事",
  next: "次の記事",
  tags: "トピック",
  allTopics: "すべて",
  minutes: (n: number) => `${n}分で読めます`,
  where: "ExeaLM の現在地",
  whereNote: "これまでの小規模実験の結果です。それぞれ測定した記事にリンクしています。",
  footerNote: "Exea Labs は高校生が運営する研究ラボです。コードと重みは Apache 2.0 で公開します。",
  rss: "RSS フィード",
  correction: "訂正",
  figure: "図",
  replay: "もう一度再生",
  copyLink: "リンクをコピー",
  copied: "コピーしました",
  notFound: "このページはありません。記事の一覧はホームにあります。",
  home: "ホーム",
  dateFmt: (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return `${y}年${m}月${day}日`;
  },
};

export const dict = { en, ja };
export const t = (lang: Lang) => dict[lang];

export const TAGS: Record<string, { en: string; ja: string }> = {
  plan: { en: "Plan", ja: "計画" },
  architecture: { en: "Architecture", ja: "アーキテクチャ" },
  swarms: { en: "Swarms", ja: "スウォーム" },
  retrieval: { en: "Retrieval", ja: "検索拡張" },
  tokenizer: { en: "Tokenizer", ja: "トークナイザー" },
  speed: { en: "Speed", ja: "速度" },
  scaling: { en: "Scaling", ja: "スケーリング" },
  correction: { en: "Correction", ja: "訂正" },
};
