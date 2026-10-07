import { WORLD_PATH } from "@/gl/data/worldPath";
import { company } from "@/content/company";
import { destinations, origins } from "@/content/services";
import styles from "./FlatRouteMap.module.css";

const project = (lat: number, lon: number) => [((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500] as const;

/**
 * Lightweight SVG world map with animated routes. Used where WebGL is not available or too
 * heavy (low tier, no WebGL2) and as the location panel on the contact page.
 */
export default function FlatRouteMap({
  routes = true,
  highlight,
  className,
  label = "Map of trade routes from Nhava Sheva",
}: {
  routes?: boolean;
  highlight?: string | null;
  className?: string;
  label?: string;
}) {
  const [hx, hy] = project(company.portCoords.lat, company.portCoords.lon);
  const all = [
    ...destinations.map((d) => ({ ...d, kind: "export" as const })),
    ...origins.map((d) => ({ ...d, kind: "import" as const })),
  ];
  return (
    <svg className={`${styles.map} ${className ?? ""}`} viewBox="80 40 860 360" role="img" aria-label={label}>
      <path d={WORLD_PATH} className={styles.land} />
      {routes &&
        all.map((r, i) => {
          const [x, y] = project(r.lat, r.lon);
          const [x1, y1, x2, y2] = r.kind === "export" ? [hx, hy, x, y] : [x, y, hx, hy];
          const mx = (x1 + x2) / 2;
          const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.25 - 10;
          const active = !highlight || highlight === r.id;
          return (
            <g key={r.id} className={active ? styles.active : styles.muted}>
              <path
                d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
                className={r.kind === "export" ? styles.export : styles.import}
                pathLength={1}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
              <circle cx={x} cy={y} r={2.2} className={styles.end} />
            </g>
          );
        })}
      <circle cx={hx} cy={hy} r={9} className={styles.pulse} />
      <circle cx={hx} cy={hy} r={3} className={styles.pin} />
    </svg>
  );
}
