"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import { TAGS, href, t, type Lang } from "@/lib/i18n";

/** Every post as a register, grouped by day, with a topic filter. */
export function PostList({ posts, lang }: { posts: PostMeta[]; lang: Lang }) {
  const d = t(lang);
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts]);
  const shown = posts.filter((p) => !tag || p.tags.includes(tag));
  const days = Array.from(new Set(shown.map((p) => p.date)));
  return (
    <>
      <div role="radiogroup" aria-label={d.tags} className="chips mb-6">
        {[null, ...tags].map((k) => (
          <button key={k ?? "all"} type="button" role="radio" aria-checked={tag === k} onClick={() => setTag(k)} className="chip">
            {k ? TAGS[k]?.[lang] ?? k : d.allTopics}
          </button>
        ))}
      </div>
      <div className="register">
        {days.map((day) => {
          const list = shown.filter((p) => p.date === day);
          return (
            <section key={day} className="reg-day">
              <div className="reg-day__label">
                <b>{d.day(list[0].day)}</b>
                <span>{d.dateFmt(day)}</span>
              </div>
              <div>
                {list.map((p) => (
                  <Link key={p.slug} href={href(lang, `/posts/${p.slug}/`)} className="reg-post">
                    <div className="reg-post__title">{p.title}</div>
                    <p className="reg-post__sum">{p.summary}</p>
                    <div className="reg-post__meta mono">
                      <span>{p.tags.map((k) => TAGS[k]?.[lang] ?? k).join(" · ")}</span>
                      <span>{d.minutes(p.minutes)}</span>
                      {p.contributors.length > 0 && <span>{p.contributors.map((c) => `@${c}`).join(", ")}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
