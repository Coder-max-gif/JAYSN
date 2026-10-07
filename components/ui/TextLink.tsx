import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./TextLink.module.css";

/** Underline draws in from the left on hover and out to the right on leave. */
export default function TextLink({
  href,
  children,
  external,
  className,
  arrow = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  arrow?: boolean;
}) {
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {arrow && (
        <svg className={styles.arrow} viewBox="0 0 16 10" aria-hidden="true">
          <path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </>
  );
  if (external || /^(mailto:|tel:|https?:)/.test(href)) {
    return (
      <a
        href={href}
        className={`${styles.link} ${className ?? ""}`}
        data-cursor="hover"
        {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={`${styles.link} ${className ?? ""}`} data-cursor="hover">
      {content}
    </Link>
  );
}
