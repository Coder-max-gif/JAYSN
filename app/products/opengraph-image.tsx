import { renderOg, ogSize } from "@/lib/og";

export const alt = "JAYSN AGRO: Products";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Fertilizer and cattle feed. Both ends of the farm.", "Products");
}
