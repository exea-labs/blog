"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { t, type Lang } from "@/lib/i18n";

type Hit = { url: string; title: string; excerpt: string; subs: { title: string; url: string }[] };
type PagefindResult = {
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta: { title?: string };
    sub_results?: { title: string; url: string; excerpt: string }[];
  }>;
};
type Pagefind = {
  options: (o: object) => Promise<void>;
  init: () => void;
  debouncedSearch: (q: string, o?: object, ms?: number) => Promise<{ results: PagefindResult[] } | null>;
};

const OPEN_EVENT = "exea:search";
let loader: Promise<Pagefind | null> | null = null;

function loadPagefind(): Promise<Pagefind | null> {
  if (!loader) {
    // Loaded at runtime from the built site; the bundler must not try to resolve it.
    const dynamicImport = new Function("p", "return import(p)") as (p: string) => Promise<Pagefind>;
    loader = dynamicImport("/pagefind/pagefind.js")
      .then(async (pf) => {
        await pf.options({ excerptLength: 22 });
        pf.init();
        return pf;
      })
      .catch(() => null);
  }
  return loader;
}

export function SearchButton({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <>
      <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="pill" aria-label={d.search}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
        <span className="pill__t">{d.search}</span>
        <kbd className="hidden md:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      <SearchDialog lang={lang} />
    </>
  );
}

function SearchDialog({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "unavailable">("idle");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const show = useCallback(() => {
    setOpen(true);
    loadPagefind();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable=true]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [show]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    let live = true;
    if (!q.trim()) {
      setHits([]);
      setState("idle");
      return;
    }
    setState("loading");
    loadPagefind().then(async (pf) => {
      if (!pf) return live && setState("unavailable");
      const res = await pf.debouncedSearch(q, {}, 120);
      if (!res || !live) return;
      const data = await Promise.all(res.results.slice(0, 8).map((r) => r.data()));
      if (!live) return;
      setHits(
        data.map((x) => ({
          url: x.url,
          title: x.meta.title ?? x.url,
          excerpt: x.excerpt,
          subs: (x.sub_results ?? []).filter((s) => s.url !== x.url).slice(0, 3).map((s) => ({ title: s.title, url: s.url })),
        })),
      );
      setActive(0);
      setState("done");
    });
    return () => {
      live = false;
    };
  }, [q]);

  const go = (url: string) => {
    setOpen(false);
    window.location.href = url;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter" && hits[active]) go(hits[active].url);
  };

  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const message = useMemo(() => {
    if (state === "unavailable") return d.searchDev;
    if (state === "done" && hits.length === 0) return d.searchNone(q);
    if (state === "idle") return d.searchEmpty;
    return null;
  }, [state, hits.length, q, d]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{ background: "color-mix(in srgb, var(--paper) 78%, transparent)" }}
          role="dialog"
          aria-modal="true"
          aria-label={d.search}
        >
          <motion.div
            className="w-full max-w-[640px] border border-ink bg-panel"
            style={{ boxShadow: "6px 6px 0 var(--line)" }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2 text-ink-3">
              <span className="mono">{d.search}</span>
              <button type="button" onClick={() => setOpen(false)} className="mono hover:text-ink">esc</button>
            </div>
            <div className="flex items-center gap-3 border-b border-[var(--line-2)] px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-signal" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5L21 21" />
              </svg>
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={d.searchPlaceholder}
                className="w-full bg-transparent font-serif text-[1.25rem] text-ink placeholder:text-ink-3 outline-none"
                aria-label={d.searchPlaceholder}
                aria-controls="search-results"
                aria-activedescendant={hits[active] ? `hit-${active}` : undefined}
              />
            </div>
            <div className="max-h-[56vh] overflow-y-auto">
              {message && <p className="px-4 py-6 text-[0.95rem] text-ink-2">{message}</p>}
              {state === "loading" && hits.length === 0 && <p className="mono px-4 py-6 text-ink-3">…</p>}
              <ul id="search-results" ref={list} role="listbox">
                {hits.map((h, i) => (
                  <li key={h.url} data-i={i} id={`hit-${i}`} role="option" aria-selected={i === active} className="border-b border-[var(--line)] last:border-0">
                    <a
                      href={h.url}
                      onMouseEnter={() => setActive(i)}
                      onClick={(e) => {
                        e.preventDefault();
                        go(h.url);
                      }}
                      className={`relative block px-4 py-3 no-underline transition-colors ${i === active ? "bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]" : ""}`}
                    >
                      {i === active && <span className="absolute inset-y-0 left-0 w-[2px] bg-signal" />}
                      <div className="text-[1.05rem] text-ink">{h.title}</div>
                      <div className="search-excerpt mt-1 text-[0.88rem] leading-snug text-ink-2" dangerouslySetInnerHTML={{ __html: h.excerpt }} />
                      {h.subs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          {h.subs.map((s) => (
                            <span key={s.url} className="mono text-ink-3">{s.title}</span>
                          ))}
                        </div>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
