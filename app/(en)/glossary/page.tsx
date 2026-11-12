import type { Metadata } from "next";
import { GlossaryPage } from "@/components/site/GlossaryPage";

export const metadata: Metadata = { title: "Glossary", alternates: { canonical: "/glossary/", languages: { en: "/glossary/", ja: "/ja/glossary/" } } };

export default function Page() {
  return <GlossaryPage lang="en" />;
}
