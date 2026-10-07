import { renderOg, ogSize } from "@/lib/og";

export const alt = "JAYSN AGRO: Request a quote";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Tell us what you need to move.", "Request a quote");
}
