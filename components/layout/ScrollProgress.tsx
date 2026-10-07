"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/store/useStore";
import styles from "./ScrollProgress.module.css";

/** Hairline at the top that fills with page scroll. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tick = () => {
      const el = ref.current;
      if (!el) return;
      const s = useStore.getState().live.scroll;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, (s.y || window.scrollY) / max));
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return <div ref={ref} className={styles.bar} aria-hidden="true" />;
}
