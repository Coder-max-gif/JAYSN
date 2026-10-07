import { ImageResponse } from "next/og";
import { PALETTE } from "@/lib/palette";

export const ogSize = { width: 1200, height: 630 };

/** Branded share image: dark soil, gold hairlines, seed mark, wordmark and page title. */
export function renderOg(title: string, label: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: PALETTE.soil,
          color: PALETTE.bone,
          backgroundImage: `radial-gradient(circle at 85% 110%, ${PALETTE.clay}55, transparent 55%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="22" height="36" viewBox="0 0 20 32">
            <ellipse cx="10" cy="16" rx="8.4" ry="14.4" fill="none" stroke={PALETTE.grain} strokeWidth="1.4" />
            <path d="M10 1.6 V30.4" stroke={PALETTE.grain} strokeWidth="1.4" />
          </svg>
          <div style={{ fontSize: 34, letterSpacing: 2 }}>JAYSN AGRO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: PALETTE.grain, textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: 76, lineHeight: 1.02, maxWidth: 980 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${PALETTE.grain}`, paddingTop: 20, fontSize: 20, color: "#a8a596" }}>
          <div>JAYSN AGRO INDIA PRIVATE LIMITED</div>
          <div>Maharashtra, India</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
