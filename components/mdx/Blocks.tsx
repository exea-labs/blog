import { slugify } from "@/lib/posts";

type Lang = "en" | "ja";

/** A numbered figure: a plate on the sheet, wider than the text. The caption must make sense on its own. */
export function Figure({ n, caption, title, children, id, lang = "en" }: { n?: number; caption?: React.ReactNode; title?: string; children: React.ReactNode; id?: string; lang?: Lang }) {
  const anchor = id ?? (n ? `figure-${n}` : undefined);
  return (
    <figure id={anchor} className="figure">
      <div className="plate">
        <div className="plate__head mono">
          <a href={anchor ? `#${anchor}` : undefined} className="no-underline">
            <b>{lang === "ja" ? `図 ${n ?? ""}` : `Fig. ${String(n ?? "").padStart(2, "0")}`}</b>
          </a>
          {title && <span className="truncate">{title}</span>}
        </div>
        <div className="plate__body">{children}</div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function Correction({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="note note--signal">
      <span className="note__tag mono">{title}</span>
      <div className="note__body">{children}</div>
    </aside>
  );
}

export function Note({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="note">
      {title && <span className="note__tag mono">{title}</span>}
      <div className="note__body">{children}</div>
    </aside>
  );
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: React.ReactNode } }).props.children);
  return "";
}

/** Section headings carry the number that the tracing beam shows for them. */
export function makeH2(order: string[]) {
  return function H2({ children }: { children: React.ReactNode }) {
    const id = slugify(textOf(children));
    const k = order.indexOf(id);
    return (
      <h2 id={id}>
        <a href={`#${id}`}>
          {k >= 0 && <span className="h2-num">{String(k + 1).padStart(2, "0")}</span>}
          {children}
        </a>
      </h2>
    );
  };
}

export function H3({ children }: { children: React.ReactNode }) {
  const id = slugify(textOf(children));
  return (
    <h3 id={id}>
      <a href={`#${id}`}>{children}</a>
    </h3>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="table-wrap">
      <table>{children}</table>
    </div>
  );
}
