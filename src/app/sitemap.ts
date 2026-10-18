import type { MetadataRoute } from "next";
import { getPublicData } from "@/lib/store";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings, lists } = await getPublicData();
  const pages = ["", "/about", "/services", "/projects", "/supplies", "/contact", "/privacy"];
  if (lists.news.length) pages.push("/news");
  if (lists.documents.length) pages.push("/documents");
  if (lists.jobs.length) pages.push("/careers");
  lists.projects.forEach((item) => pages.push("/projects/" + item.id));
  lists.news.forEach((item) => pages.push("/news/" + item.id));

  return pages.map((page) => ({
    url: settings.url + page,
    lastModified: new Date(),
    priority: page === "" ? 1 : 0.7,
  }));
}
