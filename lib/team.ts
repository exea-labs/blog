import contributors from "@/data/contributors.json";
import team from "@/data/team.json";

export type Person = { login?: string; name: string; avatar?: string; url?: string; commits?: number; role?: "maintainer" | "member" | "contributor" };

/** Public GitHub display names, for contributors whose name is not their login. */
const NAMES: Record<string, string> = { aarochu: "Aaron" };

/** Maintainers as listed in ExeaLM's CONTRIBUTORS.md. */
const MAINTAINERS: Person[] = [
  { login: "AvnehSBhatia", name: "Avneh Bhatia", role: "maintainer" },
  { name: "Joshua Selvaraj", role: "maintainer" },
];

/** Everyone to credit: maintainers first, then GitHub contributors to ExeaLM, then public members of exea-labs. */
export function people(): Person[] {
  const byLogin = new Map<string, Person>();
  const out: Person[] = [];
  const add = (p: Person) => {
    if (p.login && byLogin.has(p.login.toLowerCase())) {
      Object.assign(byLogin.get(p.login.toLowerCase())!, { ...p, ...byLogin.get(p.login.toLowerCase()), commits: p.commits ?? byLogin.get(p.login.toLowerCase())!.commits, avatar: p.avatar ?? byLogin.get(p.login.toLowerCase())!.avatar, url: p.url ?? byLogin.get(p.login.toLowerCase())!.url });
      return;
    }
    const q = { ...p };
    if (q.login) byLogin.set(q.login.toLowerCase(), q);
    out.push(q);
  };
  MAINTAINERS.forEach(add);
  (contributors as { login: string; avatar: string; url: string; commits: number }[]).forEach((c) =>
    add({ login: c.login, name: NAMES[c.login.toLowerCase()] ?? c.login, avatar: c.avatar, url: c.url, commits: c.commits, role: "contributor" }),
  );
  (team as { login: string; name: string | null; avatar: string; url: string }[]).forEach((m) =>
    add({ login: m.login, name: m.name ?? m.login, avatar: m.avatar, url: m.url, role: "member" }),
  );
  return out;
}

export function avatarFor(login: string) {
  const c = (contributors as { login: string; avatar: string }[]).find((x) => x.login.toLowerCase() === login.toLowerCase());
  return c?.avatar ?? `https://github.com/${login}.png?size=80`;
}
