import type { Figure } from "@/content/types";
import Fact from "./Fact";
import styles from "./FigureStat.module.css";

/** One key figure: large gold numerals, a unit, a mono caption. Unverified values are marked. */
export default function FigureStat({ figure }: { figure: Figure }) {
  return (
    <figure className={styles.figure}>
      <p className={styles.value}>
        <Fact f={figure.value} />
        <span className={styles.unit}>{figure.unit}</span>
      </p>
      <figcaption className={styles.caption}>{figure.caption}</figcaption>
    </figure>
  );
}
