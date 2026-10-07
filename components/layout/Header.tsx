"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { NAV, isCurrent } from "@/lib/nav";
import Wordmark from "@/components/ui/Wordmark";
import Button from "@/components/ui/Button";
import Toggles from "./Toggles";
import styles from "./Header.module.css";

/** Hides on scroll down, returns on scroll up. Wordmark and nav blend with difference. */
export default function Header() {
  const pathname = usePathname();
  const menuOpen = useStore((s) => s.menuOpen);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last.current;
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 120);
        last.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => useStore.getState().set({ menuOpen: !menuOpen });

  return (
    <header className={`${styles.header} ${hidden && !menuOpen ? styles.hidden : ""}`}>
      <div className={styles.blend}>
        <Link href="/" className={styles.brand} aria-label="JAYSN AGRO INDIA PRIVATE LIMITED, home" data-cursor="hover">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          <ul>
            {NAV.map((n) => {
              const current = isCurrent(pathname, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={styles.link}
                    aria-current={current ? "page" : undefined}
                    data-cursor="hover"
                  >
                    {current && <span className={styles.dot} aria-hidden="true" />}
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className={styles.actions}>
        <Toggles className={styles.toggles} />
        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="menu-overlay"
          data-cursor="hover"
        >
          <span className={styles.menuLabel}>{menuOpen ? "Close" : "Menu"}</span>
          <span className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
        <div className={styles.cta}>
          <Button href="/contact">Request a Quote</Button>
        </div>
      </div>
    </header>
  );
}
