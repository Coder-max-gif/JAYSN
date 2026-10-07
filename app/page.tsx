import type { Metadata } from "next";
import { home } from "@/content/home";
import HomeStory from "@/components/sections/home/HomeStory";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: home.meta.description,
};

export default function HomePage() {
  return <HomeStory />;
}
