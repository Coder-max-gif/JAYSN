import type { Metadata } from "next";
import ContactView from "@/components/sections/contact/ContactView";
import JsonLd from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Ask JAYSN AGRO INDIA PRIVATE LIMITED for an export or import quotation on fertilizer, cattle feed and agro products. Reply with a price basis and loading date.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <ContactView />
    </>
  );
}
