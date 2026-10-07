import type { Fact as FactT } from "@/content/types";
import Fact from "./Fact";
import styles from "./SpecTable.module.css";

/** Editorial table: hairline rules, mono labels left, values right. No boxes. */
export default function SpecTable({
  rows,
  caption,
  onRowHover,
}: {
  rows: { label: string; value: FactT<string | string[]> }[];
  caption?: string;
  onRowHover?: (label: string | null) => void;
}) {
  return (
    <dl className={styles.table} aria-label={caption}>
      {rows.map((r) => {
        const v = r.value.value;
        return (
          <div
            key={r.label}
            className={styles.row}
            onPointerEnter={onRowHover ? () => onRowHover(r.label) : undefined}
            onPointerLeave={onRowHover ? () => onRowHover(null) : undefined}
          >
            <dt className={styles.label}>{r.label}</dt>
            <dd className={styles.value}>
              {Array.isArray(v) ? (
                <ul>
                  {v.map((item) => (
                    <li key={item}>
                      <Fact f={{ value: item, verified: r.value.verified, note: r.value.note }} />
                    </li>
                  ))}
                </ul>
              ) : (
                <Fact f={{ value: v, verified: r.value.verified, note: r.value.note }} />
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
