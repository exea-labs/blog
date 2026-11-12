export function PageHead({ title, lead, kicker }: { title: string; lead: string; kicker?: string }) {
  return (
    <header className="enter wide">
      {kicker && <p className="mono text-ink-3">{kicker}</p>}
      <h1 className="h-display mt-2 max-w-[14em]">{title}</h1>
      <p className="mt-5 max-w-[34rem] text-[1.3rem] font-light leading-snug text-ink-2">{lead}</p>
    </header>
  );
}

export function Section({ id, n, title, children }: { id: string; n?: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-h`}>
      <div className="section__head wide">
        {n !== undefined && <span className="section__num mono">{String(n).padStart(2, "0")}</span>}
        <h2 id={`${id}-h`} className="section__title" data-reveal="clip">{title}</h2>
      </div>
      <div className="page-center">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-[56rem] text-[1.25rem] font-light leading-snug text-ink-2" data-reveal="rise">{children}</p>;
}
