import type { Metadata } from "next";
import { ResultsPage } from "@/components/site/ResultsPage";

export const metadata: Metadata = { title: "Results", alternates: { canonical: "/results/", languages: { en: "/results/", ja: "/ja/results/" } } };

export default function Page() {
  return <ResultsPage lang="en" />;
}
