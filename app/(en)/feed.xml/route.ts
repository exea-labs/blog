import { rss } from "@/lib/feed";

export const dynamic = "force-static";
export function GET() {
  return new Response(rss("en"), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
