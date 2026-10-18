import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/store";

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSettings();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: site.url + "/sitemap.xml",
  };
}
