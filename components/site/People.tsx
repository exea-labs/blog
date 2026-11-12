import { people } from "@/lib/team";
import { SITE, t, type Lang } from "@/lib/i18n";

/** Everyone who built this, set like a film's credits, with GitHub handles. */
export function People({ lang }: { lang: Lang }) {
  const d = t(lang);
  const ja = lang === "ja";
  const list = people();
  return (
    <>
      <p className="credits">
        {list.map((p, i) => (
          <span key={p.name}>
            {i > 0 && (ja ? "、" : ", ")}
            {p.url ? <a href={p.url}>{p.name}</a> : p.name}
            {(p.login || p.role === "maintainer" || p.commits) && (
              <span className="mono">
                {[p.login ? `@${p.login}` : "", p.role === "maintainer" ? d.maintainer : "", p.commits ? d.commits(p.commits) : ""].filter(Boolean).join(" · ")}
              </span>
            )}
          </span>
        ))}
      </p>
      <a href={SITE.signup} className="btn btn--signal mt-8">
        {d.joinCta}
      </a>
    </>
  );
}
