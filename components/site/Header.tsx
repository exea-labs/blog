import Link from "next/link";
import { ExeaMark } from "./Logo";
import { SearchButton } from "./Search";
import { ThemeButton } from "./Theme";
import { href, t, type Lang } from "@/lib/i18n";

export type Section = "posts" | "architecture" | "results" | "glossary" | null;

export function Header({ lang, altHref, current }: { lang: Lang; altHref: string; current: Section }) {
  const d = t(lang);
  const links: { k: Section; href: string; label: string }[] = [
    { k: "posts", href: href(lang, "/"), label: d.nav.posts },
    { k: "architecture", href: href(lang, "/architecture/"), label: d.nav.architecture },
    { k: "results", href: href(lang, "/results/"), label: d.nav.results },
    { k: "glossary", href: href(lang, "/glossary/"), label: d.nav.glossary },
  ];
  return (
    <header className="topbar no-print">
      <span className="brand">
        <a href="https://exealabs.org" className="brand__lab" aria-label="Exea Labs, exealabs.org">
          <ExeaMark height={13} />
          <span className="mono">Exea Labs</span>
        </a>
        <Link href={href(lang, "/")} className="brand__name" aria-label={`Exea Labs Blog, ${d.home}`}>
          Blog
        </Link>
      </span>
      <nav className="topbar__nav" aria-label="Main">
        {links.map((l) => (
          <Link key={l.k} href={l.href} aria-current={current === l.k ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="topbar__right">
        <SearchButton lang={lang} />
        <a className="pill" href={altHref} hrefLang={lang === "en" ? "ja" : "en"}>
          <span className="pill__t">{d.otherLang}</span>
          <span className="sr-only">{lang === "en" ? "Japanese version" : "英語版"}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="sm:hidden">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
          </svg>
        </a>
        <ThemeButton label={{ day: lang === "ja" ? "昼の配色に切り替え" : "Switch to the day sheet", night: lang === "ja" ? "夜の配色に切り替え" : "Switch to the night sheet" }} />
      </div>
    </header>
  );
}
