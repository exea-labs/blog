"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { t, type Lang } from "@/lib/i18n";

// The dialog (and the animation library it uses) loads only when someone opens search.
const SearchDialog = dynamic(() => import("./SearchDialog").then((m) => m.SearchDialog), { ssr: false });
const OPEN_EVENT = "exea:search";

export function SearchButton({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [mac, setMac] = useState(true);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable=true]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setArmed((a) => {
          if (a) window.dispatchEvent(new Event(OPEN_EVENT));
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const open = () =>
    setArmed((a) => {
      if (a) window.dispatchEvent(new Event(OPEN_EVENT));
      return true;
    });
  return (
    <>
      <button type="button" onClick={open} className="pill" aria-label={d.search}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
        <span className="pill__t">{d.search}</span>
        <kbd className="hidden md:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      {armed && <SearchDialog lang={lang} />}
    </>
  );
}
