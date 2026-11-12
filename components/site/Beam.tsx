"use client";
import { useEffect, useRef, useState } from "react";

/** The tracing beam: the page's sections as numbered marks on a ruler in the left margin. The signal line fills
 * with reading progress; the section being read is marked. */
export function Beam({ items }: { items: { id: string; label: string }[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<number[]>([]);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const measure = () => {
      const H = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setPos(items.map((i) => {
        const el = document.getElementById(i.id);
        return el ? Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3) / H)) : 0;
      }));
    };
    const onScroll = () => {
      const H = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, window.scrollY / H);
      box.current?.style.setProperty("--p", String(p));
      let a = -1;
      items.forEach((i, k) => {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) a = k;
      });
      setActive(a);
    };
    measure();
    onScroll();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);
  if (!items.length) return null;
  return (
    <nav className="beam no-print" aria-label="Sections" ref={box}>
      <span className="beam__line" />
      <span className="beam__ticks" />
      <span className="beam__fill" />
      <ol className="beam__list">
        {items.map((i, k) => (
          <li key={i.id} style={{ top: `${(pos[k] ?? k / Math.max(1, items.length - 1)) * 100}%` }}>
            <a href={`#${i.id}`} className={k === active ? "is-on" : ""}>
              <b>{String(k + 1).padStart(2, "0")}</b>
              <span>{i.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
