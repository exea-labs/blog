import type { Metadata } from "next";
import { ArchitecturePage } from "@/components/site/ArchitecturePage";

export const metadata: Metadata = { title: "Inside ExeaLM", alternates: { canonical: "/architecture/", languages: { en: "/architecture/", ja: "/ja/architecture/" } } };

export default function Page() {
  return <ArchitecturePage lang="en" />;
}
