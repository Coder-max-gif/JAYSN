"use client";

import { useStore } from "@/store/useStore";
import styles from "./Toggles.module.css";

/** "Sound off" and "Reduce motion" toggles. Choices are remembered in localStorage. */
export default function Toggles({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  const soundOn = useStore((s) => s.soundOn);
  const reduced = useStore((s) => s.reducedMotion);

  const toggleSound = () => {
    const next = !soundOn;
    useStore.getState().set({ soundOn: next });
    try {
      localStorage.setItem("jaysn-sound", next ? "on" : "off");
    } catch {}
  };

  const toggleMotion = () => {
    const next = !reduced;
    document.documentElement.setAttribute("data-motion", next ? "reduce" : "full");
    useStore.getState().set({ reducedMotion: next });
    try {
      localStorage.setItem("jaysn-motion", next ? "reduce" : "full");
    } catch {}
  };

  return (
    <div className={`${styles.toggles} ${stacked ? styles.stacked : ""} ${className ?? ""}`}>
      <button type="button" className={styles.toggle} onClick={toggleSound} aria-pressed={soundOn} data-cursor="hover">
        <span className={`${styles.bars} ${soundOn ? styles.on : ""}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {soundOn ? "Sound on" : "Sound off"}
      </button>
      <button type="button" className={styles.toggle} onClick={toggleMotion} aria-pressed={reduced} data-cursor="hover">
        {reduced ? "Motion reduced" : "Reduce motion"}
      </button>
    </div>
  );
}
