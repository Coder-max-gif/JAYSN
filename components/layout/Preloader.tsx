"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { loadLandDots } from "@/gl/data/landDots";
import { home } from "@/content/home";
import styles from "./Preloader.module.css";

const MIN_MS = 1600;
const GL_TIMEOUT_MS = 7000;

/**
 * Real progress: fonts, globe data and the first WebGL frame with shaders compiled.
 * Minimum 1.6s so it never flashes. Skipped on repeat visits in the same session.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    const start = () => useStore.getState().set({ heroStart: performance.now(), preloaderDone: true });

    if (html.classList.contains("no-preloader") || !el) {
      start();
      return;
    }

    const t0 = performance.now();
    const parts = { fonts: 0, data: 0, gl: 0 };
    const shown = { v: 0 };
    let done = false;

    document.fonts.ready.then(() => (parts.fonts = 1));
    loadLandDots()
      .then(() => (parts.data = 1))
      .catch(() => (parts.data = 1));
    const glTimer = window.setTimeout(() => (parts.gl = 1), GL_TIMEOUT_MS);
    const unsub = useStore.subscribe((s) => {
      if (s.glReady || !s.webgl2) parts.gl = 1;
    });
    if (useStore.getState().glReady) parts.gl = 1;

    const exit = () => {
      done = true;
      try {
        sessionStorage.setItem("jaysn-visited", "1");
      } catch {}
      start();
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = "none";
          html.classList.add("no-preloader");
        },
      });
      tl.to(counter.current, { yPercent: 110, duration: DUR.standard, ease: EASE.in }, 0)
        .to(caption.current, { opacity: 0, duration: DUR.micro }, 0)
        .to(line.current, { scaleX: 0, transformOrigin: "50% 50%", duration: DUR.standard, ease: EASE.inOut }, 0.1)
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: DUR.standard, ease: EASE.inOut }, 0.4);
    };

    const tick = () => {
      if (done) return;
      const target = parts.fonts * 0.25 + parts.data * 0.25 + parts.gl * 0.5;
      // Ease toward the real value, never past it
      shown.v += (target - shown.v) * 0.08;
      if (target === 1 && 1 - shown.v < 0.004) shown.v = 1;
      const elapsed = performance.now() - t0;
      // Do not let the counter finish before the minimum time
      const capped = Math.min(shown.v, elapsed / MIN_MS);
      const n = Math.round(capped * 100);
      if (counter.current) counter.current.textContent = String(n).padStart(3, "0");
      if (line.current) line.current.style.transform = `scaleX(${capped.toFixed(4)})`;
      useStore.getState().set({ assetsLoaded: capped });
      if (capped >= 1) exit();
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      window.clearTimeout(glTimer);
      unsub();
    };
  }, []);

  return (
    <div ref={root} className={styles.preloader} aria-hidden="true">
      <span className={styles.mask}>
        <span ref={counter} className={styles.counter}>
          000
        </span>
      </span>
      <p ref={caption} className={styles.caption}>
        {home.preloaderCaption}
      </p>
      <span ref={line} className={styles.line} />
    </div>
  );
}
