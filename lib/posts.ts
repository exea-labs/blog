import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "./i18n";

export type KeyNumber = { value: string; label: string };
export type Source = { label: string; href: string };
export type Credit = { login?: string; name: string; what: string };
export type PostMeta = {
  slug: string;
  lang: Lang;
  title: string;
  date: string;
  order: number;
  day: number;
  summary: string;
  tags: string[];
  contributors: string[];
  credits: Credit[];
  numbers: KeyNumber[];
  sources: Source[];
  minutes: number;
  toc: { id: string; text: string }[];
};

const ROOT = path.join(process.cwd(), "content", "posts");

/** Heading ids: lower case, letters and digits of any script kept, everything else becomes a dash. */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function readingMinutes(body: string, lang: Lang) {
  const text = body.replace(/<[^>]+>/g, " ").replace(/```[\s\S]*?```/g, " ");
  if (lang === "ja") return Math.max(1, Math.round(text.replace(/\s/g, "").length / 500));
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));
}

function toc(body: string) {
  const out: { id: string; text: string }[] = [];
  let inCode = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (inCode) continue;
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) out.push({ id: slugify(m[1]), text: m[1].replace(/[`*]/g, "") });
  }
  return out;
}

export function slugs(): string[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs.readdirSync(ROOT).filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory());
}

export function readPost(slug: string, lang: Lang): { meta: PostMeta; body: string } | null {
  let file = path.join(ROOT, slug, `${lang}.mdx`);
  if (!fs.existsSync(file)) file = path.join(ROOT, slug, "en.mdx");
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const meta: PostMeta = {
    slug,
    lang,
    title: data.title,
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date),
    order: Number(data.order ?? 0),
    day: Number(data.day ?? 1),
    summary: data.summary ?? "",
    tags: data.tags ?? [],
    contributors: data.contributors ?? (data.credits ?? []).map((c: Credit) => c.login).filter(Boolean),
    credits: data.credits ?? [],
    numbers: data.numbers ?? [],
    sources: data.sources ?? [],
    minutes: readingMinutes(content, lang),
    toc: toc(content),
  };
  return { meta, body: content };
}

/** Newest first. */
export function allPosts(lang: Lang): PostMeta[] {
  return slugs()
    .map((s) => readPost(s, lang)?.meta)
    .filter((m): m is PostMeta => !!m)
    .sort((a, b) => (a.date === b.date ? b.order - a.order : a.date < b.date ? 1 : -1));
}

export function neighbours(slug: string, lang: Lang) {
  const list = allPosts(lang);
  const i = list.findIndex((p) => p.slug === slug);
  return { newer: i > 0 ? list[i - 1] : null, older: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}
