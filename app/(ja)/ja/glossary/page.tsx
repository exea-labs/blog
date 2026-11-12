import type { Metadata } from "next";
import { GlossaryPage } from "@/components/site/GlossaryPage";

export const metadata: Metadata = { title: "用語集", alternates: { canonical: "/ja/glossary/", languages: { en: "/glossary/", ja: "/ja/glossary/" } } };

export default function Page() {
  return <GlossaryPage lang="ja" />;
}
