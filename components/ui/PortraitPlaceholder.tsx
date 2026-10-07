import styles from "./PortraitPlaceholder.module.css";

/**
 * Designed stand-in for a team portrait. Never a generated face: initials, framing marks and a
 * caption that tells the client what to shoot (see /docs/portrait-spec.md).
 */
export default function PortraitPlaceholder({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className={`${styles.ph} ${className ?? ""}`} role="img" aria-label={`Portrait of ${name}, to be supplied`}>
      <span className={styles.frame} aria-hidden="true" />
      <span className={styles.initials} aria-hidden="true">
        {initials}
      </span>
      <span className={styles.caption} aria-hidden="true">
        Portrait to be supplied, 4:5, waist up
      </span>
    </div>
  );
}
