import type { MetadataRoute } from "next";
import { company } from "@/content/company";
import { products } from "@/content/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.siteUrl;
  const pages = ["/", "/services", "/products", ...products.map((p) => `/products/${p.slug}`), "/team", "/contact", "/privacy", "/terms"];
  return pages.map((p) => ({
    url: `${base}${p === "/" ? "" : p}`,
    changeFrequency: p === "/" ? "monthly" : "yearly",
    priority: p === "/" ? 1 : p.startsWith("/products") || p === "/services" ? 0.8 : 0.5,
  }));
}
