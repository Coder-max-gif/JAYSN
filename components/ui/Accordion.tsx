"use client";

import { useId, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import type { Fact as FactT } from "@/content/types";
import Fact from "./Fact";
import styles from "./Accordion.module.css";

/** One open at a time. Buttons with aria-expanded and aria-controls, smooth height. */
export default function Accordion({ items }: { items: { q: string; a: FactT<string> }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    const reduced = useStore.getState().reducedMotion;
    panels.current.forEach((p, j) => {
      if (!p) return;
      const show = j === next;
      gsap.to(p, {
        height: show ? "auto" : 0,
        duration: reduced ? 0 : DUR.standard,
        ease: EASE.out,
      });
    });
    setOpen(next);
  };

  return (
    <div className={styles.accordion}>
      {items.map((it, i) => {
        const id = `${base}-${i}`;
        const isOpen = open === i;
        return (
          <div key={it.q} className={`${styles.item} ${isOpen ? styles.open : ""}`}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                id={`${id}-button`}
                onClick={() => toggle(i)}
                data-cursor="hover"
              >
                <span className={styles.index}>({String(i + 1).padStart(2, "0")})</span>
                <span className={styles.q}>{it.q}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>
            <div
              ref={(el) => {
                panels.current[i] = el;
              }}
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-button`}
              className={styles.panel}
              inert={!isOpen}
            >
              <p className={styles.a}>
                <Fact f={it.a} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
