import { renderOg, ogSize } from "@/lib/og";

export const alt = "JAYSN AGRO: Team";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("The people behind every load.", "Team");
}
