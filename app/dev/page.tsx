import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./dev.module.css";

export const metadata: Metadata = { title: "Dev", robots: { index: false } };

/** Development only. The persistent canvas shows a test mesh here that reacts to scroll and pointer. */
export default function DevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className={styles.page}>
      <div className="grid">
        <div className={styles.copy}>
          <p className="t-label t-gold">(dev) Foundation check</p>
          <h1 className="t-display-l">Canvas, scroll, pointer.</h1>
          <p className="t-body-l">
            The knot behind this text lives in the persistent canvas. It turns with scroll and leans toward the pointer.
            Press d for frame stats, g for the grid. Navigate away and back: the canvas never remounts.
          </p>
        </div>
      </div>
      <div className={styles.spacer} />
    </div>
  );
}
