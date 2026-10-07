import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { company } from "@/content/company";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for the ${company.legalName.value} website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="October 2026"
      sections={[
        {
          h: "This website",
          p: `This website is run by ${company.legalName.value}. It describes our products and services. It is not an offer to sell.`,
        },
        {
          h: "Quotations",
          p: "Prices, specifications and loading dates are confirmed only in a written quotation or contract. Figures on this website are for guidance.",
        },
        {
          h: "Content",
          p: "Text, images and the JAYSN AGRO name and mark belong to the company. Do not copy them without written permission.",
        },
        {
          h: "Liability",
          p: "We take care to keep this website accurate, but we are not liable for decisions made only on its content.",
        },
        {
          h: "Law",
          p: "These terms are governed by the laws of India. Courts in Maharashtra have jurisdiction.",
        },
      ]}
    />
  );
}
