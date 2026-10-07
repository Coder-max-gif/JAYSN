"use client";

import { useStore } from "@/store/useStore";
import { home } from "@/content/home";
import styles from "./ChapterIndicator.module.css";

/** Fixed mono chapter index at the right edge: 01 Soil, 02 Stock, ... */
export default function ChapterIndicator() {
  const active = useStore((s) => s.activeChapter);
  return (
    <nav className={`${styles.indicator} ${active === "hero" ? styles.hidden : ""}`} aria-label="Chapters">
      <ol>
        {home.chapters.map((c) => (
          <li key={c.id} className={active === c.id ? styles.active : undefined} aria-current={active === c.id ? "step" : undefined}>
            <span className={styles.index}>{c.index}</span>
            <span className={styles.name}>{c.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
