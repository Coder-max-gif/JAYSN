"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useStore, CHAPTERS } from "@/store/useStore";

/**
 * useScrollChapter for the home page: turns scroll position into the continuous rail value
 * homeT (0 hero ... 5 quote), the 0..1 progress inside the active chapter, the hero exit
 * value and the active chapter name. Section offsets are cached and refreshed with ScrollTrigger.
 */
export function useHomeRail(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const live = useStore.getState().live;
    let tops: number[] = [];
    let bottom = 1;

    const getEls = () =>
      Array.from(root.current?.querySelectorAll<HTMLElement>(":scope > div[data-hero], :scope > section") ?? []);
    const measure = () => {
      const els = getEls();
      tops = els.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : 0));
      const last = els[els.length - 1];
      bottom = last ? last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight : 1;
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    getEls().forEach((el) => ro.observe(el));

    let lastChapter = -1;
    const tick = () => {
      const y = live.scroll.y || window.scrollY;
      const n = tops.length;
      if (!n) return;
      let t = 0;
      for (let i = 0; i < n; i++) {
        const a = tops[i];
        const b = i < n - 1 ? tops[i + 1] : Math.max(a + 1, bottom);
        if (y < b || i === n - 1) {
          t = i + Math.min(1, Math.max(0, (y - a) / (b - a)));
          break;
        }
      }
      t = Math.min(n - 1, t);
      live.homeT = t;
      live.chapterProgress = t - Math.floor(t);
      live.heroExit = Math.min(1, t);

      // Active chapter: the section under the middle of the viewport
      const mid = y + window.innerHeight * 0.5;
      let idx = 0;
      for (let i = 0; i < n; i++) if (mid >= tops[i]) idx = i;
      if (idx !== lastChapter) {
        lastChapter = idx;
        useStore.getState().set({ activeChapter: CHAPTERS[idx] ?? "hero" });
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      live.homeT = 0;
      live.heroExit = 0;
    };
  }, [root]);
}
