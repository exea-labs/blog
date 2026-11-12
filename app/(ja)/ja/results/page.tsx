import type { Metadata } from "next";
import { ResultsPage } from "@/components/site/ResultsPage";

export const metadata: Metadata = { title: "結果", alternates: { canonical: "/ja/results/", languages: { en: "/results/", ja: "/ja/results/" } } };

export default function Page() {
  return <ResultsPage lang="ja" />;
}
