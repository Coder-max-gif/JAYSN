import type { Fact as FactT } from "@/content/types";
import styles from "./Fact.module.css";

const SHOW_MARKERS = process.env.NEXT_PUBLIC_HIDE_TBC !== "1";

/**
 * Renders a company fact. Unverified facts get a dotted underline and a small gold TBC marker
 * so nobody mistakes a placeholder for a confirmed number. `npm run build:production` refuses
 * to build while any fact is unverified.
 */
export default function Fact<T extends string | number>({
  f,
  className,
}: {
  f: FactT<T>;
  className?: string;
}) {
  if (f.verified || !SHOW_MARKERS) return <span className={className}>{f.value}</span>;
  return (
    <span className={`${styles.unverified} ${className ?? ""}`} title={f.note ? `To confirm: ${f.note}` : "To be confirmed by the client"}>
      {f.value}
      <sup className={styles.tbc} aria-label="to be confirmed">
        TBC
      </sup>
    </span>
  );
}
