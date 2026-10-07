import { renderOg, ogSize } from "@/lib/og";
import { getProduct, products } from "@/content/products";

export const alt = "JAYSN AGRO product";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  return renderOg(p ? p.statement.replace(/\*/g, "") : "Products", p ? p.name : "Products");
}
