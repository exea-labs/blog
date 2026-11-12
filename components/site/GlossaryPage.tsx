import { Shell } from "./Shell";
import { PageHead } from "./PageHead";
import { GLOSSARY } from "@/lib/glossary";
import { href, type Lang } from "@/lib/i18n";

export function GlossaryPage({ lang }: { lang: Lang }) {
  const other: Lang = lang === "en" ? "ja" : "en";
  const sorted = [...GLOSSARY].sort((a, b) => a[lang].term.localeCompare(b[lang].term, lang));
  return (
    <Shell lang={lang} altHref={href(other, "/glossary/")} current="glossary">
      <article className="sheet" data-pagefind-body>
        <PageHead
          title={lang === "ja" ? "用語集" : "Glossary"}
          lead={lang === "ja" ? "記事で使う用語を、一度ずつ定義します。" : "Every term the posts use, defined once."}
        />
        <dl data-reveal="stagger" className="wide mt-16 grid border-t border-[var(--line-2)] md:grid-cols-2 md:gap-x-12">
          {sorted.map((g) => (
            <div key={g.id} id={g.id} className="scroll-mt-28 border-b border-[var(--line-2)] py-5">
              <dt className="text-[1.3rem] font-light leading-snug tracking-[-0.01em]">
                <a href={`#${g.id}`} className="no-underline hover:text-signal-ink">{g[lang].term}</a>
              </dt>
              <dd className="mt-2 text-[1rem] leading-relaxed text-ink-2">{g[lang].def}</dd>
            </div>
          ))}
        </dl>
      </article>
    </Shell>
  );
}
