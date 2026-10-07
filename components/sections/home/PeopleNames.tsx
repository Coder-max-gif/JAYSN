"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import type { Member } from "@/content/team";
import Fact from "@/components/ui/Fact";
import PortraitPlaceholder from "@/components/ui/PortraitPlaceholder";
import styles from "./PeopleNames.module.css";

/** Names set very large. Hovering a name shows the portrait following the cursor with a soft delay. */
export default function PeopleNames({ members }: { members: Member[] }) {
  const plate = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Member | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: DUR.standard, ease: EASE.out });
    const yTo = gsap.quickTo(el, "y", { duration: DUR.standard, ease: EASE.out });
    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      xTo(e.clientX + 24);
      yTo(e.clientY - 120);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    gsap.to(el, {
      opacity: active ? 1 : 0,
      scale: active ? 1 : 0.92,
      duration: active ? DUR.standard : DUR.micro,
      ease: EASE.out,
    });
  }, [active]);

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {members.map((m) => (
          <li key={m.slug} className={styles.row}>
            <Link
              href={`/team?member=${m.slug}`}
              className={styles.link}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(m)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(null)}
              data-cursor="label"
              data-cursor-label="Open"
            >
              <span className={styles.name}>
                <Fact f={m.name} />
              </span>
              <span className={styles.role}>
                <Fact f={m.role} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={plate} className={styles.plate} aria-hidden="true">
        {active && <PortraitPlaceholder name={active.name.value} />}
      </div>
    </div>
  );
}
