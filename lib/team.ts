import contributors from "@/data/contributors.json";
import team from "@/data/team.json";
import signups from "@/data/signups.json";

export type Person = { login?: string; name: string; avatar?: string; url?: string; commits?: number; role?: "maintainer" | "member" | "contributor" };

/** Maintainers as listed in ExeaLM's CONTRIBUTORS.md. */
const MAINTAINERS: Person[] = [
  { login: "AvnehSBhatia", name: "Avneh Bhatia", role: "maintainer" },
  { name: "Joshua Selvaraj", role: "maintainer" },
];

/** Everyone on the team: maintainers, then people with merged work (by commits), then everyone who joined, by name.
 * Only names and GitHub usernames are published. */
export function people(): Person[] {
  const byLogin = new Map<string, Person>();
  const byName = new Map<string, Person>();
  const out: Person[] = [];
  const add = (p: Person) => {
    const hit = (p.login && byLogin.get(p.login.toLowerCase())) || byName.get(p.name.toLowerCase());
    if (hit) {
      hit.commits = hit.commits ?? p.commits;
      hit.avatar = hit.avatar ?? p.avatar;
      hit.url = hit.url ?? p.url;
      hit.login = hit.login ?? p.login;
      if (p.name !== p.login && (!hit.name || hit.name === hit.login)) hit.name = p.name;
      return;
    }
    const q = { ...p, url: p.url ?? (p.login ? `https://github.com/${p.login}` : undefined) };
    if (q.login) byLogin.set(q.login.toLowerCase(), q);
    byName.set(q.name.toLowerCase(), q);
    out.push(q);
  };
  MAINTAINERS.forEach(add);
  (signups as { name: string; login: string | null }[]).forEach((s) => add({ name: s.name, login: s.login ?? undefined, role: "member" }));
  (contributors as { login: string; avatar: string; url: string; commits: number }[]).forEach((c) =>
    add({ login: c.login, name: c.login, avatar: c.avatar, url: c.url, commits: c.commits, role: "contributor" }),
  );
  (team as { login: string; name: string | null; avatar: string; url: string }[]).forEach((m) =>
    add({ login: m.login, name: m.name ?? m.login, avatar: m.avatar, url: m.url, role: "member" }),
  );
  const rank = (p: Person) => (p.role === "maintainer" ? 0 : p.commits ? 1 : 2);
  return out.sort((a, b) => rank(a) - rank(b) || (b.commits ?? 0) - (a.commits ?? 0) || a.name.localeCompare(b.name));
}

export function avatarFor(login: string) {
  const c = (contributors as { login: string; avatar: string }[]).find((x) => x.login.toLowerCase() === login.toLowerCase());
  return c?.avatar ?? `https://github.com/${login}.png?size=80`;
}
