import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { serviceHref, services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/experts", "/compliance", "/contact", ...services.map(serviceHref)];
  return pages.map((path) => ({ url: `${site.url}${path === "/" ? "" : path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }));
}
