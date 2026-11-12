"use client";
import { useEffect, useState } from "react";

/** Runs before paint (inline in <head>) so the page never flashes the wrong palette. Night is the default. */
export const THEME_SCRIPT = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="day"?"day":"night"}catch(e){document.documentElement.dataset.theme="night"}`;

export function ThemeButton({ label }: { label: { day: string; night: string } }) {
  const [theme, setTheme] = useState<"day" | "night">("night");
  useEffect(() => setTheme(document.documentElement.dataset.theme === "day" ? "day" : "night"), []);
  const flip = () => {
    const next = theme === "day" ? "night" : "day";
    const root = document.documentElement;
    root.classList.add("theme-fade");
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
    window.dispatchEvent(new Event("exea:theme"));
    setTimeout(() => root.classList.remove("theme-fade"), 320);
  };
  return (
    <button type="button" className="icon-btn" onClick={flip} aria-label={theme === "day" ? label.night : label.day} aria-pressed={theme === "day"}>
      {theme === "day" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  );
}
