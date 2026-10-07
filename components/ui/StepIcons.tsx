/**
 * Small line drawings for process steps. Every path uses pathLength=1 so CSS or GSAP can draw
 * them with stroke-dashoffset. Hairline strokes, no fills: they read as engraved, not as icons.
 */
const P = (d: string) => <path d={d} pathLength={1} />;

export const STEP_ICONS: Record<string, React.ReactNode> = {
  // Enquiry: a sheet with lines and a folded corner
  enquiry: (
    <>
      {P("M16 8 H40 L50 18 V56 H16 Z")}
      {P("M40 8 V18 H50")}
      {P("M22 28 H44 M22 36 H44 M22 44 H36")}
    </>
  ),
  // Production: a bag with granules falling into it
  production: (
    <>
      {P("M18 30 Q16 56 22 58 H42 Q48 56 46 30 Z")}
      {P("M18 30 H46")}
      {P("M32 6 V22 M28 12 V18 M36 10 V20")}
    </>
  ),
  // Quality: a checklist with a round stamp
  quality: (
    <>
      {P("M12 10 H40 V54 H12 Z")}
      {P("M17 20 l3 3 l5 -6 M28 20 H36 M17 32 l3 3 l5 -6 M28 32 H36")}
      {P("M48 46 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0")}
      {P("M43 46 l4 4 l7 -8")}
    </>
  ),
  // Documents: a stack of papers
  documents: (
    <>
      {P("M20 14 H48 V54 H20 Z")}
      {P("M16 18 V58 H44")}
      {P("M12 22 V62 H40")}
      {P("M26 26 H42 M26 34 H42 M26 42 H36")}
    </>
  ),
  // Freight: a container on a crane hook, sea line below
  freight: (
    <>
      {P("M32 4 V16 M26 16 H38")}
      {P("M14 22 H50 V40 H14 Z")}
      {P("M20 22 V40 M26 22 V40 M32 22 V40 M38 22 V40 M44 22 V40")}
      {P("M4 54 Q12 50 20 54 T36 54 T52 54 T60 54")}
    </>
  ),
  // Delivery: a truck
  delivery: (
    <>
      {P("M6 20 H38 V46 H6 Z")}
      {P("M38 28 H50 L58 38 V46 H38")}
      {P("M18 50 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0")}
      {P("M48 50 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0")}
    </>
  ),
  // Product process icons
  intake: (
    <>
      {P("M10 52 H54")}
      {P("M16 52 L24 24 H40 L48 52")}
      {P("M32 8 V18 M28 14 L32 18 L36 14")}
    </>
  ),
  mix: (
    <>
      {P("M32 32 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0")}
      {P("M32 32 L44 20 M32 32 L20 44")}
      {P("M24 24 a11 11 0 0 1 16 0")}
    </>
  ),
  form: (
    <>
      {P("M8 20 H56 V30 H8 Z")}
      {P("M14 40 h6 M26 40 h6 M38 40 h6 M20 48 h6 M32 48 h6")}
    </>
  ),
  pack: (
    <>
      {P("M18 18 Q16 56 22 58 H42 Q48 56 46 18 Z")}
      {P("M18 18 H46")}
      {P("M20 14 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2")}
      {P("M26 34 H38 M26 40 H38")}
    </>
  ),
};

export default function StepIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1">
      {STEP_ICONS[name] ?? STEP_ICONS.enquiry}
    </svg>
  );
}
