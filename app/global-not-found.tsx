import "./globals.css";
import { fontVars } from "@/lib/fonts";
import { ExeaMark } from "@/components/site/Logo";
import { Frame } from "@/components/site/Frame";
import { THEME_SCRIPT } from "@/lib/theme-script";

export const metadata = { title: "Not found | Exea Labs Blog" };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVars} data-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Frame />
        <main className="sheet">
          <p className="mono flex items-center gap-3 text-ink-3">
            <ExeaMark height={12} /> 404
          </p>
          <h1 className="h-display mt-5">This sheet is not in the set.</h1>
          <p className="deck mt-6">The page does not exist. Every post is listed on the home page.</p>
          <a href="/" className="btn btn--signal mt-8">Go to the home page</a>
        </main>
      </body>
    </html>
  );
}
