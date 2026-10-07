import { company } from "@/content/company";
import { contact } from "@/content/contact";
import type { Product } from "@/content/products";
import type { Fact } from "@/content/types";

const url = (path = "/") => new URL(path, company.siteUrl).toString();

/** Only verified facts are allowed into structured data. */
const verifiedOnly = <T>(f: Fact<T>) => (f.verified && f.value ? f.value : undefined);

export function organizationJsonLd() {
  const sameAs = Object.values(company.social)
    .map((f) => verifiedOnly(f))
    .filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": url("/#organization"),
    name: company.legalName.value,
    alternateName: company.wordmark,
    url: url("/"),
    logo: url("/icon.svg"),
    foundingDate: verifiedOnly(company.established),
    email: verifiedOnly(contact.email),
    telephone: verifiedOnly(contact.phone),
    address: {
      "@type": "PostalAddress",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
      streetAddress: verifiedOnly(company.registeredAddress),
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": url("/#website"),
    name: company.wordmark,
    url: url("/"),
    publisher: { "@id": url("/#organization") },
  };
}

export function serviceJsonLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    provider: { "@id": url("/#organization") },
    areaServed: { "@type": "Place", name: "Worldwide" },
    url: url("/services"),
  };
}

/** Product schema without prices, offers or ratings. Nothing is made up. */
export function productJsonLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.name} by ${company.wordmark}`,
    description: p.meta.description,
    category: p.slug === "fertilizer" ? "Fertilizer" : "Animal feed",
    brand: { "@type": "Brand", name: company.wordmark },
    manufacturer: { "@id": url("/#organization") },
    url: url(`/products/${p.slug}`),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: url(it.path),
    })),
  };
}
