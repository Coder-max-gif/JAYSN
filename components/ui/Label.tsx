import type { ComponentType, ReactNode } from "react";
import styles from "./Label.module.css";

type Tagged = "h1" | "h2" | "h3" | "p" | "div" | "span" | "ul" | "ol" | "section" | "header" | "li";

/** Mono uppercase label with an optional index like (01). */
export default function Label({
  index,
  children,
  as = "p",
  gold = false,
  className,
}: {
  index?: string;
  children?: ReactNode;
  as?: Tagged;
  gold?: boolean;
  className?: string;
}) {
  const Tag = as as unknown as ComponentType<Record<string, unknown>>;
  return (
    <Tag className={`${styles.label} ${gold ? styles.gold : ""} ${className ?? ""}`}>
      {index && (
        <span className={styles.index} data-count={index}>
          ({index})
        </span>
      )}
      {children && <span>{children}</span>}
    </Tag>
  );
}
