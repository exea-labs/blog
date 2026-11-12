import type { Metadata } from "next";
import { ArchitecturePage } from "@/components/site/ArchitecturePage";

export const metadata: Metadata = { title: "ExeaLM の内部", alternates: { canonical: "/ja/architecture/", languages: { en: "/architecture/", ja: "/ja/architecture/" } } };

export default function Page() {
  return <ArchitecturePage lang="ja" />;
}
