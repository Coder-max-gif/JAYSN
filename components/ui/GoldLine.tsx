"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import styles from "./GoldLine.module.css";

/** Hairline that draws itself on enter, or scrubbed with scroll. */
export default function GoldLine({
  mode = "enter",
  vertical = false,
  className,
  neutral = false,
}: {
  mode?: "enter" | "scrub";
  vertical?: boolean;
  className?: string;
  neutral?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || useStore.getState().reducedMotion) return;
    const prop = vertical ? "scaleY" : "scaleX";
    gsap.set(el, { [prop]: 0 });
    if (mode === "scrub") {
      const t = gsap.to(el, {
        [prop]: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 90%", end: "top 40%", scrub: 0.6 },
      });
      return () => {
        t.scrollTrigger?.kill();
        t.kill();
      };
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => gsap.to(el, { [prop]: 1, duration: DUR.large, ease: EASE.out }),
    });
    return () => st.kill();
  }, [mode, vertical]);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`${styles.line} ${vertical ? styles.vertical : ""} ${neutral ? styles.neutral : ""} ${className ?? ""}`}
    />
  );
}
