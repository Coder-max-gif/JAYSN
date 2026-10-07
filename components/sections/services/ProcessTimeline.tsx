"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useStore } from "@/store/useStore";
import StepIcon from "@/components/ui/StepIcons";
import Label from "@/components/ui/Label";
import DisplayText from "@/components/ui/DisplayText";
import styles from "./ProcessTimeline.module.css";

/**
 * Pinned, scroll scrubbed trade process. A gold line draws through the steps, the active step
 * enlarges and its line drawing animates. Unpinned list on small screens and reduced motion.
 */
export default function ProcessTimeline({ steps }: { steps: { id: string; title: string; body: string }[] }) {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      if (useStore.getState().reducedMotion) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * 2.2}`,
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          if (line.current) line.current.style.transform = `scaleY(${p.toFixed(4)})`;
          setActive(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)));
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, [steps.length]);

  return (
    <section ref={root} className={styles.timeline} aria-labelledby="process-title">
      <div className={`grid ${styles.inner}`}>
        <div className={styles.head}>
          <Label index="03">Process</Label>
          <DisplayText id="process-title" text="From enquiry to *delivery*." size="m" />
        </div>
        <div className={styles.track}>
          <span className={styles.rail} aria-hidden="true">
            <span ref={line} className={styles.fill} />
          </span>
          <ol className={styles.steps}>
            {steps.map((s, i) => (
              <li
                key={s.id}
                className={`${styles.step} ${i === active ? styles.active : ""} ${i < active ? styles.done : ""}`}
              >
                <span className={styles.dot} aria-hidden="true" />
                <StepIcon name={s.id} className={styles.icon} />
                <div>
                  <h3 className={styles.title}>
                    <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h3>
                  <p className={styles.body}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
