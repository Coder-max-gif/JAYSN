import type { Metadata } from "next";
import { teamPage } from "@/content/team";
import TeamView from "@/components/sections/team/TeamView";
import JsonLd from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: teamPage.meta.title,
  description: teamPage.meta.description,
  alternates: { canonical: "/team" },
};

export default function TeamPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ])}
      />
      <TeamView />
    </>
  );
}
