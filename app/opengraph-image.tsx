import { renderOg, ogSize } from "@/lib/og";

export const alt = "JAYSN AGRO: Fertilizer, cattle feed, import and export";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("From the soil of Maharashtra to ports around the world.", "Fertilizer, cattle feed, import and export");
}
