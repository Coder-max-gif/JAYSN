import styles from "./Grain.module.css";

/** Very fine film grain over everything, stepped at a low frame rate. Off for reduced motion. */
export default function Grain() {
  return <div className={styles.grain} aria-hidden="true" />;
}
