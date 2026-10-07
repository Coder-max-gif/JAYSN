import { renderOg, ogSize } from "@/lib/og";

export const alt = "JAYSN AGRO: Import and export";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Two directions. One set of hands on the cargo.", "Import and export");
}
