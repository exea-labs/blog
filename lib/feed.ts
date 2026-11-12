import { allPosts } from "./posts";
import { SITE, base, t, type Lang } from "./i18n";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function rss(lang: Lang) {
  const posts = allPosts(lang);
  const items = posts
    .map((p) => {
      const url = `${SITE.url}${base(lang)}/posts/${p.slug}/`;
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(p.date + "T20:00:00Z").toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE.name}${lang === "ja" ? "（日本語）" : ""}</title><link>${SITE.url}${base(lang)}/</link><description>${esc(t(lang).description)}</description><language>${lang}</language>${items}</channel></rss>`;
}
