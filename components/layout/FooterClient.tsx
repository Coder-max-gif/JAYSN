"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useStore } from "@/store/useStore";
import { scrollToTarget } from "./ScrollProvider";
import { SeedMark } from "@/components/ui/Wordmark";
import styles from "./Footer.module.css";

/** Giant wordmark that rises into place with scroll, cropped by the bottom edge on purpose. */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || useStore.getState().reducedMotion) return;
    const t = gsap.fromTo(
      el.firstElementChild,
      { yPercent: 40 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      },
    );
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, []);
  return (
    <div ref={ref} className={styles.giant} aria-hidden="true">
      <div className={styles.giantInner}>
        <SeedMark className={styles.giantMark} />
        <span>JAYSN AGRO</span>
      </div>
    </div>
  );
}

/** Live local time in India */
export function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className={styles.time}>
      <span className={styles.head}>Maharashtra</span>
      <span className={styles.clock} suppressHydrationWarning>
        {time || "--:--:--"} IST
      </span>
    </p>
  );
}

export function BackToTop() {
  return (
    <button type="button" className={styles.toTop} onClick={() => scrollToTarget(0)} data-cursor="hover">
      Back to top
      <svg viewBox="0 0 10 14" aria-hidden="true">
        <path d="M5 13V1M1 5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  );
}
