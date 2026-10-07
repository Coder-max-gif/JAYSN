import styles from "./Wordmark.module.css";

/**
 * JAYSN AGRO wordmark. A geometric seed mark (a split ellipse: one grain, two halves, the two
 * ends of the farm loop) set beside the name in the display face.
 */
export function SeedMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 32" aria-hidden="true" focusable="false">
      <ellipse cx="10" cy="16" rx="8.4" ry="14.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 1.6 V30.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 11 Q15 13.5 16.6 19" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`${styles.wordmark} ${className ?? ""}`}>
      <SeedMark className={styles.mark} />
      <span className={styles.name}>
        JAYSN<span className={styles.space}> </span>AGRO
      </span>
    </span>
  );
}
