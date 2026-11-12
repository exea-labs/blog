export function PageHead({ title, lead, kicker }: { title: string; lead: string; kicker?: string }) {
  return (
    <header className="enter">
      {kicker && <p className="mono text-ink-3">{kicker}</p>}
      <h1 className="h-display mt-5 max-w-[14em]">{title}</h1>
      <p className="deck mt-6">{lead}</p>
    </header>
  );
}

export function Section({ id, n, title, children }: { id: string; n?: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-h`}>
      <div className="section__head">
        {n !== undefined && <span className="section__num mono">{String(n).padStart(2, "0")}</span>}
        <h2 id={`${id}-h`} className="section__title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-[38rem] text-[1.0625rem] leading-relaxed text-ink-2">{children}</p>;
}
