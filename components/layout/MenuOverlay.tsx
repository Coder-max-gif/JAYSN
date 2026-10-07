"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR, STAGGER } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { NAV, isCurrent } from "@/lib/nav";
import { contact } from "@/content/contact";
import { trapFocus } from "@/lib/focusTrap";
import Fact from "@/components/ui/Fact";
import Toggles from "./Toggles";
import styles from "./MenuOverlay.module.css";

/** Full screen menu. Huge display links with mono indexes, staggered line reveal, focus trap. */
export default function MenuOverlay() {
  const open = useStore((s) => s.menuOpen);
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Close on route change
  useEffect(() => {
    useStore.getState().set({ menuOpen: false });
  }, [pathname]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const lines = el.querySelectorAll("[data-menu-line]");
    const meta = el.querySelectorAll("[data-menu-meta]");
    const reduced = useStore.getState().reducedMotion;
    tl.current?.kill();
    if (open) {
      el.hidden = false;
      const t = gsap.timeline();
      t.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduced ? DUR.micro : DUR.standard, ease: EASE.out });
      if (!reduced) {
        t.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: DUR.large, ease: EASE.out, stagger: STAGGER.line }, "-=0.5");
        t.fromTo(meta, { opacity: 0 }, { opacity: 1, duration: DUR.standard, ease: EASE.out, stagger: STAGGER.item }, "-=0.9");
      }
      tl.current = t;
      const first = el.querySelector<HTMLElement>("a");
      first?.focus({ preventScroll: true });
      const release = trapFocus(el, () => useStore.getState().set({ menuOpen: false }), [
        document.querySelector<HTMLElement>("[aria-controls='menu-overlay']"),
      ]);
      return release;
    } else if (!el.hidden) {
      const t = gsap.timeline({ onComplete: () => void (el.hidden = true) });
      if (!reduced) t.to(lines, { yPercent: -110, duration: DUR.standard, ease: EASE.in, stagger: STAGGER.line / 2 });
      t.to(el, { clipPath: "inset(100% 0 0 0)", duration: DUR.standard, ease: EASE.out }, reduced ? 0 : "-=0.4");
      tl.current = t;
    }
  }, [open]);

  return (
    <div
      ref={root}
      id="menu-overlay"
      className={styles.menu}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden
    >
      <nav aria-label="Menu" className={styles.nav}>
        <ol>
          {NAV.map((n, i) => {
            const current = isCurrent(pathname, n.href);
            return (
              <li key={n.href} className={styles.item}>
                <Link
                  href={n.href}
                  className={styles.link}
                  aria-current={current ? "page" : undefined}
                  data-cursor="hover"
                >
                  <span className={styles.mask}>
                    <span data-menu-line className={styles.line}>
                      <span className={styles.index}>({String(i + 1).padStart(2, "0")})</span>
                      <span className={styles.word}>{n.label}</span>
                      {current && <span className={styles.dot} aria-hidden="true" />}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className={styles.meta}>
        <div data-menu-meta>
          <p className={styles.metaLabel}>Write</p>
          <a href={`mailto:${contact.email.value}`} className={styles.metaLink}>
            <Fact f={contact.email} />
          </a>
        </div>
        <div data-menu-meta>
          <p className={styles.metaLabel}>Call or WhatsApp</p>
          <a href={`tel:${contact.phone.value.replace(/\s/g, "")}`} className={styles.metaLink}>
            <Fact f={contact.phone} />
          </a>
        </div>
        <div data-menu-meta>
          <Toggles stacked />
        </div>
      </div>
    </div>
  );
}
