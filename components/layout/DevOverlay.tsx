"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import styles from "./DevOverlay.module.css";

/** Development only. "d" toggles FPS and draw calls, "g" toggles the 12 column grid. */
export default function DevOverlay() {
  const [stats, setStats] = useState(false);
  const [grid, setGrid] = useState(false);
  const statsEl = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "d") setStats((v) => !v);
      if (e.key === "g") setGrid((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!stats) return;
    let raf = 0;
    let devStats: { fps: number; calls: number; triangles: number; points: number; dpr: number } | null = null;
    import("@/gl/Canvas").then((m) => (devStats = m.devStats));
    const loop = () => {
      const s = useStore.getState();
      if (statsEl.current && devStats) {
        statsEl.current.textContent =
          `FPS ${devStats.fps}\nCALLS ${devStats.calls}\nTRIS ${devStats.triangles}\nPOINTS ${devStats.points}\n` +
          `DPR ${devStats.dpr}\nTIER ${s.quality}\nCHAPTER ${s.activeChapter} ${s.live.homeT.toFixed(2)}\nROUTE ${s.route}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stats]);

  return (
    <>
      {stats && <pre ref={statsEl} className={styles.stats} />}
      {grid && (
        <div className={`grid ${styles.grid}`} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      )}
    </>
  );
}
