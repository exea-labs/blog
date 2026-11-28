import { sitemap } from "@/lib/sitemap";

export const dynamic = "force-static";
export function GET() {
  return new Response(sitemap(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
