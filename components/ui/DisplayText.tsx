"use client";

import type { ComponentType } from "react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { EASE, DUR, STAGGER } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { Emphasis } from "./Emphasis";
import styles from "./DisplayText.module.css";

type Size = "xl" | "l" | "m" | "heading";

type Tagged = "h1" | "h2" | "h3" | "p" | "div" | "span" | "ul" | "ol" | "section" | "header" | "li";

/**
 * Display type with an optional *italic* emphasis and a masked line reveal (SplitText).
 * Real text stays in the DOM. The split happens after fonts load so lines never shift.
 */
export default function DisplayText({
  as = "h2",
  text,
  size = "l",
  className,
  delay = 0,
  trigger = "scroll",
  play = true,
  id,
}: {
  as?: Tagged;
  text: string;
  size?: Size;
  className?: string;
  delay?: number;
  /** "scroll" reveals on enter, "manual" waits for `play` */
  trigger?: "scroll" | "manual";
  play?: boolean;
  id?: string;
}) {
  const Tag = as as unknown as ComponentType<Record<string, unknown>>;
  const ref = useRef<HTMLElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (useStore.getState().reducedMotion) {
      el.style.visibility = "visible";
      return;
    }
    let split: SplitText | null = null;
    let st: ScrollTrigger | null = null;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          tween.current?.kill();
          tween.current = gsap.from(self.lines, {
            yPercent: 110,
            duration: DUR.large,
            ease: EASE.out,
            stagger: STAGGER.line,
            delay,
            paused: true,
          });
          return tween.current;
        },
      });
      if (trigger === "scroll") {
        st = ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => tween.current?.play(),
        });
      }
    });
    return () => {
      cancelled = true;
      st?.kill();
      tween.current?.kill();
      split?.revert();
    };
  }, [delay, trigger]);

  useEffect(() => {
    if (trigger === "manual" && play) tween.current?.play();
  }, [trigger, play]);

  return (
    <Tag ref={ref} id={id} className={`${styles.display} ${styles[size]} ${className ?? ""}`} data-split>
      <Emphasis text={text} />
    </Tag>
  );
}
