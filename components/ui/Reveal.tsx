"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, DUR, STAGGER } from "@/lib/motion";
import { useStore } from "@/store/useStore";

type Tagged = "h1" | "h2" | "h3" | "p" | "div" | "span" | "ul" | "ol" | "section" | "header" | "li";

/**
 * Fade and rise reveal on scroll enter. Children with [data-reveal-item] stagger.
 * Content is visible without JS (the hidden state is only applied by html.js CSS).
 */
export default function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  y = 16,
  ...rest
}: {
  as?: Tagged;
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
} & Record<string, unknown>) {
  const Tag = as as unknown as ComponentType<Record<string, unknown>>;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
    const targets = items.length ? Array.from(items) : [el];
    if (useStore.getState().reducedMotion) {
      gsap.set([el, ...targets], { opacity: 1, y: 0 });
      return;
    }
    if (items.length) gsap.set(el, { opacity: 1 });
    gsap.set(targets, { opacity: 0, y });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: DUR.standard,
          ease: EASE.out,
          stagger: STAGGER.item,
          delay,
        }),
    });
    return () => st.kill();
  }, [delay, y]);
  return (
    <Tag ref={ref} className={className} data-reveal="fade" {...rest}>
      {children}
    </Tag>
  );
}
