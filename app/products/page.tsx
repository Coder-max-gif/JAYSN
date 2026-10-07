import type { Metadata } from "next";
import ProductsIndex from "@/components/sections/products/ProductsIndex";
import JsonLd from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fertilizer and cattle feed products",
  description:
    "Granular NPK and organic fertilizer, and compound cattle feed pellets, made in Maharashtra by JAYSN AGRO INDIA PRIVATE LIMITED for domestic and export buyers.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />
      <ProductsIndex />
    </>
  );
}
