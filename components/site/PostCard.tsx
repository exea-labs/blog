import Link from "next/link";
import { PostCover } from "./PostCover";
import type { PostMeta } from "@/lib/posts";
import { href, t, type Lang } from "@/lib/i18n";

/** A post as a card: its drawing, day, title and one line. The whole card opens the post. */
export function PostCard({ post, lang }: { post: PostMeta; lang: Lang }) {
  const d = t(lang);
  return (
    <Link href={href(lang, `/posts/${post.slug}/`)} className="card" data-reveal="rise">
      <div className="card__cover">
        <PostCover kind={post.cover} />
      </div>
      <div className="card__body">
        <p className="card__meta mono">
          <b>{d.day(post.day)}</b>
          <span>{d.dateFmt(post.date)}</span>
        </p>
        <h3 className="card__title">{post.title}</h3>
        <p className="card__dek">{post.dek}</p>
        <span className="card__more mono">
          {d.minutes(post.minutes)}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2 8h11M9 4l4 4-4 4" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
