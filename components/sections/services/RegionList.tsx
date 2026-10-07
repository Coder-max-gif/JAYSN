"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { regionScreen } from "@/gl/regionScreen";
import type { Region } from "@/content/services";
import styles from "./RegionList.module.css";

/**
 * Region list that highlights the region on the globe. On desktop a gold hairline connects
 * the hovered item to its point on the globe.
 */
export default function RegionList({ regions, label }: { regions: Region[]; label: string }) {
  const hovered = useStore((s) => s.regionHover);
  const lineRef = useRef<SVGLineElement>(null);
  const items = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    if (!hovered || !regions.some((r) => r.id === hovered)) return;
    const lineEl = lineRef.current;
    let raf = 0;
    const loop = () => {
      const li = items.current[hovered];
      const line = lineRef.current;
      const target = regionScreen[hovered];
      if (li && line && target) {
        const r = li.getBoundingClientRect();
        line.setAttribute("x1", String(r.right + 8));
        line.setAttribute("y1", String(r.top + r.height / 2));
        line.setAttribute("x2", String(target.x));
        line.setAttribute("y2", String(target.y));
        line.style.opacity = target.visible ? "1" : "0";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (lineEl) lineEl.style.opacity = "0";
    };
  }, [hovered, regions]);

  const set = (id: string | null) => useStore.getState().set({ regionHover: id });

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>{label}</p>
      <ul className={styles.list}>
        {regions.map((r) => (
          <li
            key={r.id}
            ref={(el) => {
              items.current[r.id] = el;
            }}
            className={hovered === r.id ? styles.active : undefined}
            tabIndex={0}
            onPointerEnter={() => set(r.id)}
            onPointerLeave={() => set(null)}
            onFocus={() => set(r.id)}
            onBlur={() => set(null)}
            data-cursor="hover"
          >
            <span className={styles.name}>{r.name}</span>
            <span className={styles.port}>
              {r.port}
              {!r.verified && <sup className={styles.tbc}>TBC</sup>}
            </span>
          </li>
        ))}
      </ul>
      <svg className={styles.connector} aria-hidden="true">
        <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" />
      </svg>
    </div>
  );
}
