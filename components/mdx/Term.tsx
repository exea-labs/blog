"use client";
import { useId, useState } from "react";
import { glossaryById } from "@/lib/glossary";

/** A glossary term inside a post: dotted underline, the definition on hover, focus or tap. */
export function Term({ id, lang = "en", children }: { id: string; lang?: "en" | "ja"; children: React.ReactNode }) {
  const g = glossaryById[id];
  const [open, setOpen] = useState(false);
  const tip = useId();
  if (!g) return <>{children}</>;
  const e = g[lang];
  return (
    <span className="relative inline" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="term" aria-describedby={open ? tip : undefined} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen((o) => !o)}>
        {children}
      </button>
      {open && (
        <span id={tip} role="tooltip" className="term-tip">
          <b>{e.term}</b>
          <span>{e.def}</span>
        </span>
      )}
    </span>
  );
}
