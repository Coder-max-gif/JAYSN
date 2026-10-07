"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useStore } from "@/store/useStore";

let lenisInstance: Lenis | null = null;

/** The single Lenis instance. Null before mount. */
export const getLenis = () => lenisInstance;

/** Scroll to a target through Lenis when available, natively otherwise. */
export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  const reduced = useStore.getState().reducedMotion;
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      immediate: immediate || reduced,
      duration: 1.6,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      offset: typeof target === "number" ? 0 : -80,
      force: true,
    });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const top = typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY - 80 : 0;
  window.scrollTo({ top, behavior: immediate || reduced ? "auto" : "smooth" });
}

/**
 * Creates Lenis once and wires it to the GSAP ticker so Lenis, ScrollTrigger and every GSAP
 * tween share one clock. Publishes scroll data to the store's live state.
 */
export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: !reducedMotion,
      syncTouch: false,
      autoRaf: false,
    });
    lenisInstance = lenis;
    const live = useStore.getState().live;

    const onScroll = (l: Lenis) => {
      live.scroll.y = l.scroll;
      live.scroll.limit = l.limit || 1;
      live.scroll.progress = l.progress || 0;
      live.scroll.velocity = l.velocity;
      live.scroll.direction = l.direction as 1 | -1 | 0;
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reducedMotion]);

  // Stop smooth scroll while an overlay owns the screen
  const locked = useStore((s) => s.menuOpen || s.profileOpen);
  useEffect(() => {
    if (!lenisInstance) return;
    if (locked) lenisInstance.stop();
    else lenisInstance.start();
  }, [locked]);

  return <>{children}</>;
}
