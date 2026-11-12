"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** One IntersectionObserver for the page: marks [data-reveal] elements and section heads as revealed when they
 * enter the viewport, numbers stagger children, and counts up [data-count] numbers. CSS does the motion. */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], .section__head"));
    els.forEach((el) => {
      if (el.dataset.reveal === "stagger") Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i)));
    });
    const count = (el: HTMLElement) => {
      const target = el.dataset.count!;
      const decimals = (target.split(".")[1] ?? "").length;
      const to = parseFloat(target);
      if (reduce || !isFinite(to)) return;
      const t0 = performance.now();
      const dur = 1100;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    // A fully clipped element has no visible area, so the observer never sees it. Clip reveals watch their parent.
    const targets = new Map<Element, HTMLElement[]>();
    els.forEach((el) => {
      const watch = el.dataset.reveal === "clip" && el.parentElement ? el.parentElement : el;
      targets.set(watch, [...(targets.get(watch) ?? []), el]);
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const el of targets.get(e.target) ?? []) {
            el.classList.add("is-revealed");
            el.querySelectorAll<HTMLElement>("[data-count]").forEach(count);
            if (el.dataset.count) count(el);
          }
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    targets.forEach((_, t) => io.observe(t));
    return () => io.disconnect();
  }, [path]);
  return null;
}
