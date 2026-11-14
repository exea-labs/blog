import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { SITE, t } from "@/lib/i18n";
import { THEME_SCRIPT } from "@/lib/theme-script";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: t("en").description,
  alternates: { canonical: "/", languages: { en: "/", ja: "/ja/" }, types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { siteName: SITE.name, type: "website", locale: "en_US", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#111418" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} data-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
