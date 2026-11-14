/** Runs before paint (inline in <head>) so the page never flashes the wrong palette. Night is the default.
 * It lives outside components/site/Theme.tsx on purpose: that file is "use client", and a server layout that imports a
 * value from a client file gets a client reference instead of the string. The <head> then waits for that chunk while
 * the body hydrates, and on a slow network React throws hydration error 418. */
export const THEME_SCRIPT = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="day"?"day":"night"}catch(e){document.documentElement.dataset.theme="night"}`;
