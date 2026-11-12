import type { Metadata } from "next";
import { PostPage } from "@/components/site/PostPage";
import { readPost, slugs } from "@/lib/posts";

export const dynamicParams = false;
export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = readPost(slug, "ja")!.meta;
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/ja/posts/${slug}/`, languages: { en: `/posts/${slug}/`, ja: `/ja/posts/${slug}/` } },
    openGraph: { type: "article", title: p.title, description: p.summary, publishedTime: p.date },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostPage slug={slug} lang="ja" />;
}
