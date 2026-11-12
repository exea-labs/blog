import { Frame } from "./Frame";
import { Header, type Section } from "./Header";
import { Footer } from "./Footer";
import { Beam } from "./Beam";
import type { Lang } from "@/lib/i18n";

/** Page chrome for both languages. altHref is the same page in the other language. */
export function Shell({ lang, altHref, current = null, beam = [], children }: { lang: Lang; altHref: string; current?: Section; beam?: { id: string; label: string }[]; children: React.ReactNode }) {
  return (
    <>
      <Frame />
      <Header lang={lang} altHref={altHref} current={current} />
      <Beam items={beam} />
      <main id="main">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
