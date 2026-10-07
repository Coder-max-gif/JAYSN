import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StyleGuide from "@/components/sections/StyleGuide";

export const metadata: Metadata = { title: "Style guide", robots: { index: false } };

/** Development only reference for tokens, type, buttons, plates and grid. */
export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StyleGuide />;
}
