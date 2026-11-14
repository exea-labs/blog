import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { Shell } from "./Shell";
import { mdxComponents } from "@/components/mdx";
import { neighbours, readPost } from "@/lib/posts";
import { TAGS, href, t, type Lang } from "@/lib/i18n";
import { avatarFor } from "@/lib/team";

export async function PostPage({ slug, lang }: { slug: string; lang: Lang }) {
  const post = readPost(slug, lang)!;
  const d = t(lang);
  const ja = lang === "ja";
  const { meta } = post;
  const { content } = await compileMDX({
    source: post.body,
    components: mdxComponents(lang, meta.toc.map((x) => x.id)),
    options: {
      blockJS: false,
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [[rehypePrettyCode, { theme: { dark: "vesper", light: "github-light" }, keepBackground: false }]] },
    },
  });
  const { newer, older } = neighbours(slug, lang);
  const other: Lang = ja ? "en" : "ja";
  const beam = [
    ...meta.toc.map((x) => ({ id: x.id, label: x.text })),
    ...(meta.credits.length ? [{ id: "credits", label: ja ? "作業した人" : "Who did the work" }] : []),
    { id: "sources", label: d.sources },
  ];
  return (
    <Shell lang={lang} altHref={href(other, `/posts/${slug}/`)} current="posts" beam={beam}>
      <div className="progress no-print" aria-hidden="true" />
      <article className="sheet" data-pagefind-body data-pagefind-meta={`date:${meta.date}`}>
        <header className="wide grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="enter">
            <p className="mono text-ink-3">
              <span className="text-signal-ink">{d.day(meta.day)}</span> · <time dateTime={meta.date}>{d.dateFmt(meta.date)}</time>
            </p>
            <h1 className="h-display mt-5">{meta.title}</h1>
            <p className="mt-6 max-w-[34rem] text-[1.35rem] font-light leading-snug text-ink-2">{meta.dek}</p>
          </div>
          <dl className="titleblock enter" data-pagefind-ignore>
            <div><dt>{ja ? "日付" : "Date"}</dt><dd>{meta.date}</dd></div>
            <div><dt>{ja ? "読む時間" : "Read"}</dt><dd>{d.minutes(meta.minutes)}</dd></div>
            <div><dt>{d.tags}</dt><dd>{meta.tags.map((tag) => TAGS[tag]?.[lang] ?? tag).join(", ")}</dd></div>
            <div><dt>{ja ? "執筆" : "By"}</dt><dd>{d.byline}</dd></div>
          </dl>
        </header>

        {meta.numbers.length > 0 && (
          <div className="results wide mt-14" data-pagefind-ignore data-reveal="stagger">
            {meta.numbers.map((n) => (
              <div key={n.label} className="result result--compact">
                <div className="result__v">{/^\d+(\.\d+)?$/.test(n.value) ? <span data-count={n.value} className="!m-0 !text-[1em] !tracking-[inherit] !text-signal">{n.value}</span> : n.value}</div>
                <div className="result__t">
                  <p>{n.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="prose mt-16">{content}</div>

        {meta.credits.length > 0 && (
          <section id="credits" className="section wide" aria-labelledby="credits-h">
            <div className="section__head">
              <span className="section__num mono">{String(meta.toc.length + 1).padStart(2, "0")}</span>
              <h2 id="credits-h" className="section__title" data-reveal="clip">{ja ? "作業した人" : "Who did the work"}</h2>
            </div>
            <div className="contrib" data-reveal="stagger">
              {meta.credits.map((c) => (
                <div key={c.name + c.what.slice(0, 12)} className="contrib__row">
                  {c.login ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarFor(c.login)} alt="" width={40} height={40} loading="lazy" />
                  ) : (
                    <span className="initials">{c.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
                  )}
                  <div className="contrib__who">
                    {c.name}
                    {c.login && <a href={`https://github.com/${c.login}`}>@{c.login}</a>}
                  </div>
                  <div className="contrib__what">{c.what}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="sources" className="section wide" aria-labelledby="sources-h">
          <div className="section__head">
            <span className="section__num mono">{String(meta.toc.length + (meta.credits.length ? 2 : 1)).padStart(2, "0")}</span>
            <h2 id="sources-h" className="section__title" data-reveal="clip">{d.sources}</h2>
          </div>
          <ul className="border-t border-[var(--line-2)]" data-reveal="stagger">
            {meta.sources.map((s) => (
              <li key={s.href} className="border-b border-[var(--line)]">
                <a href={s.href} className="flex items-baseline justify-between gap-4 py-3 no-underline transition-colors hover:text-signal-ink">
                  <span className="min-w-0 text-[1rem] [overflow-wrap:anywhere]">{s.label}</span>
                  <span className="mono shrink-0 text-ink-3">{new URL(s.href).hostname.replace("www.", "")}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav className="section wide grid gap-px border border-[var(--line-2)] bg-[var(--line-2)] sm:grid-cols-2" aria-label={ja ? "前後の記事" : "More posts"} data-pagefind-ignore>
          {[
            { p: older, label: d.prev },
            { p: newer, label: d.next },
          ].map(({ p, label }, i) =>
            p ? (
              <Link key={label} href={href(lang, `/posts/${p.slug}/`)} className={`group block bg-panel p-5 no-underline ${i === 1 ? "sm:text-right" : ""}`}>
                <span className="mono text-ink-3">{label}</span>
                <span className="mt-2 block text-[1.35rem] font-light leading-snug tracking-[-0.015em] transition-colors group-hover:text-signal-ink">{p.title}</span>
              </Link>
            ) : (
              <div key={label} className="bg-panel" />
            ),
          )}
        </nav>
      </article>
    </Shell>
  );
}
