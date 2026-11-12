import { ExeaMark } from "./Logo";
import { SITE, href, t, type Lang } from "@/lib/i18n";

export function Footer({ lang }: { lang: Lang }) {
  const d = t(lang);
  const links = [
    { label: "ExeaLM · GitHub", href: SITE.repo },
    { label: "ExeaLM · Hugging Face", href: SITE.hf },
    { label: lang === "ja" ? "TONN 論文" : "TONN paper", href: SITE.paper },
    { label: d.joinCta, href: SITE.signup },
    { label: lang === "ja" ? "このブログのソース" : "Blog source", href: SITE.blogRepo },
    { label: "RSS", href: href(lang, "/feed.xml") },
  ];
  return (
    <footer className="sheet no-print" style={{ paddingTop: 0 }}>
      <div className="mt-32 flex flex-wrap items-start justify-between gap-6 border-t border-[var(--line-2)] pb-14 pt-6">
        <div className="max-w-md">
          <div className="flex items-center gap-3 text-ink">
            <ExeaMark height={12} />
            <span className="mono">Exea Labs · Blog</span>
          </div>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{d.footerNote}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="font-mono text-[0.78rem] text-ink-2 no-underline transition-colors hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
