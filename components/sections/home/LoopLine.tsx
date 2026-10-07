"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useStore } from "@/store/useStore";
import styles from "./LoopLine.module.css";

/**
 * The farm loop motif: fertilizer feeds soil, soil grows feed, feed raises cattle, cattle
 * return to soil. A thin gold line that draws itself down the whole home page with scroll.
 * The path is measured from the chapter sections so it stays in the margins beside the copy,
 * only crosses the page between chapters, and closes into a loop beside the quote.
 */
function buildPath(root: HTMLElement) {
  const W = root.clientWidth;
  const H = root.scrollHeight;
  const top = root.getBoundingClientRect().top + window.scrollY;
  const secs = Array.from(root.querySelectorAll<HTMLElement>(":scope > section, :scope > div[data-hero]"));
  const y = (el: Element | undefined, f = 0) => {
    if (!el) return H;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY - top + r.height * f;
  };
  // Mirrors --margin: clamp(1rem, 4vw, 4rem). The line runs down the middle of the margin.
  const mPx = Math.min(64, Math.max(16, W * 0.04)) * 0.45;
  const R = W - mPx;
  const L = mPx;
  const [hero, soil, stock, , people, quote] = secs;
  const heroEnd = y(hero, 1);
  const p = [
    `M ${W / 2} ${heroEnd - 60}`,
    // Out of the scroll cue, over to the right margin for Soil (copy sits left)
    `C ${W / 2} ${heroEnd + 80}, ${R} ${heroEnd - 40}, ${R} ${y(soil, 0.18)}`,
    `L ${R} ${y(soil, 0.92)}`,
    // Across between Soil and Stock to the left margin
    `C ${R} ${y(stock, 0)}, ${L} ${y(soil, 0.96)}, ${L} ${y(stock, 0.12)}`,
    `L ${L} ${y(people, 0.85)}`,
    // Into the quote, then a closed loop in the empty right columns
  ];
  const qy = y(quote, 0.5);
  const cx = W * 0.86;
  const r = Math.min(W * 0.09, 150);
  p.push(`C ${L} ${y(quote, 0.15)}, ${cx - r * 2} ${qy - r * 2.2}, ${cx} ${qy - r}`);
  p.push(`A ${r} ${r} 0 1 1 ${cx - 0.1} ${qy - r}`);
  return { d: p.join(" "), w: W, h: H, ok: !!quote && !!soil };
}

export default function LoopLine() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState({ d: "", w: 100, h: 100 });

  useEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    const measure = () => {
      const g = buildPath(root);
      if (g.ok) setGeo((prev) => (prev.d === g.d ? prev : { d: g.d, w: g.w, h: g.h }));
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => {
      ScrollTrigger.removeEventListener("refresh", measure);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const p = path.current;
    const s = svg.current;
    if (!p || !s || !geo.d) return;
    if (useStore.getState().reducedMotion) {
      p.style.strokeDashoffset = "0";
      return;
    }
    const t = gsap.fromTo(
      p,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: s.parentElement, start: "top top", end: "bottom bottom", scrub: 0.8 },
      },
    );
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, [geo.d]);

  return (
    <svg ref={svg} className={styles.loop} viewBox={`0 0 ${geo.w} ${geo.h}`} preserveAspectRatio="none" aria-hidden="true">
      {geo.d && <path ref={path} d={geo.d} pathLength={1} className={styles.path} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
