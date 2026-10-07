import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { company } from "@/content/company";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${company.legalName.value} handles the details you send through this website.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="October 2026"
      sections={[
        {
          h: "What we collect",
          p: "When you send a quote request we receive your name, company, country, contact details and the details of your enquiry. We do not ask for payment details on this website.",
        },
        {
          h: "Why we use it",
          p: "We use these details only to answer your enquiry, prepare a quotation and arrange an order you place with us.",
        },
        {
          h: "Who sees it",
          p: "Your enquiry is emailed to our trade desk. Our email provider processes it for delivery. We do not sell or share your details for marketing.",
        },
        {
          h: "Analytics",
          p: "If analytics are switched on, we use a cookie free service that counts visits without identifying you.",
        },
        {
          h: "Your choices",
          p: `Write to us to see, correct or delete the details we hold about you. ${company.legalName.value}, Maharashtra, India.`,
        },
      ]}
    />
  );
}
