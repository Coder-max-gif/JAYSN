"use client";

import { useEffect, useRef } from "react";
import { regionScreen } from "@/gl/regionScreen";
import { destinations, origins } from "@/content/services";
import styles from "./GlobeLabels.module.css";

const ROUTES = [
  ...destinations.map((r) => ({ r, kind: "Out" })),
  ...origins.map((r) => ({ r, kind: "In" })),
];

/**
 * Mono labels for the globe route ends. Plain DOM above the canvas, positioned every frame from
 * the projected points the globe writes. Decorative: the same places are listed as real text
 * on the page, so these are hidden from assistive tech.
 */
export default function GlobeLabels() {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      for (const { r } of ROUTES) {
        const el = refs.current[r.id];
        const p = regionScreen[r.id];
        if (!el) continue;
        const o = p ? p.label : 0;
        el.style.opacity = o.toFixed(3);
        if (p && o > 0.001) {
          const [dx, dy] = r.label ?? [0.9, -0.9];
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(${dx}rem, ${dy}rem) translateY(-50%)`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={styles.layer} aria-hidden="true">
      {ROUTES.map(({ r, kind }) => (
        <div
          key={r.id}
          ref={(el) => {
            refs.current[r.id] = el;
          }}
          className={styles.label}
        >
          <span className={styles.kind}>{kind}</span>
          {r.port}, {r.name}
        </div>
      ))}
    </div>
  );
}
