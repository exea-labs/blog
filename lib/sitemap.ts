import { SITE } from "./i18n";
import { readPost, slugs } from "./posts";

const PAGES = ["", "results/", "architecture/", "glossary/"];

export function sitemap() {
  const url = (path: string) => `${SITE.url}${path}`;
  const entries: { en: string; ja: string | null; lastmod?: string }[] = [];
  for (const p of PAGES) entries.push({ en: `/${p}`, ja: `/ja/${p}` });
  for (const s of slugs()) {
    const en = readPost(s, "en");
    if (!en) continue;
    entries.push({ en: `/posts/${s}/`, ja: readPost(s, "ja") ? `/ja/posts/${s}/` : null, lastmod: en.meta.date });
  }
  const one = (loc: string, e: (typeof entries)[number]) =>
    `<url><loc>${url(loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}${
      e.ja
        ? `<xhtml:link rel="alternate" hreflang="en" href="${url(e.en)}"/><xhtml:link rel="alternate" hreflang="ja" href="${url(e.ja)}"/>`
        : ""
    }</url>`;
  const urls = entries.flatMap((e) => [one(e.en, e), ...(e.ja ? [one(e.ja, e)] : [])]).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}
