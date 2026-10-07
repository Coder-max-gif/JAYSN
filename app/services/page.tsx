import type { Metadata } from "next";
import { services } from "@/content/services";
import ServicesView from "@/components/sections/services/ServicesView";
import JsonLd from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: services.meta.title,
  description: services.meta.description,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd("Export of fertilizer, cattle feed and agro products", services.export.paragraphs[0]),
          serviceJsonLd("Import of fertilizer raw materials and feed ingredients", services.import.paragraphs[0]),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />
      <ServicesView />
    </>
  );
}
