"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import styles from "./Cursor.module.css";

/**
 * Dot plus ring. The dot is exact (never lags), the ring follows with inertia and grows over
 * interactive elements. Media show a short mono label. Only enabled once a fine pointer has
 * actually moved, so touch and keyboard users keep the system cursor.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<"" | "hover" | "label" | "down">("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    let on = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!on) {
        on = true;
        setEnabled(true);
        document.documentElement.classList.add("has-cursor");
        ringPos.x = e.clientX;
        ringPos.y = e.clientY;
      }
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, input, select, textarea, label");
      if (!target) {
        setMode((m) => (m === "down" ? m : ""));
        setLabel("");
        return;
      }
      const kind = target.dataset.cursor;
      if (kind === "label" && target.dataset.cursorLabel) {
        setMode("label");
        setLabel(target.dataset.cursorLabel);
      } else {
        setMode("hover");
        setLabel("");
      }
    };
    const onDown = () => setMode("down");
    const onUp = () => setMode("");
    const onLeave = () => {
      pos.x = pos.y = -100;
    };

    const loop = () => {
      const reduced = useStore.getState().reducedMotion;
      // Ring catches up within about 80ms
      const k = reduced ? 1 : 0.3;
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;
  return (
    <div className={styles.cursor} aria-hidden="true" data-mode={mode}>
      <div ref={ring} className={styles.ringWrap}>
        <div className={styles.ring}>{label && <span className={styles.label}>{label}</span>}</div>
      </div>
      <div ref={dot} className={styles.dotWrap}>
        <div className={styles.dot} />
      </div>
    </div>
  );
}
