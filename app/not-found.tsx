import type { Metadata } from "next";
import Link from "next/link";
import { NAV } from "@/lib/nav";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className={`grid ${styles.inner}`}>
        <p className={styles.code}>(404)</p>
        <h1 className={styles.h1}>
          This load never <em>left</em> the port.
        </h1>
        <p className={styles.body}>The page you asked for is not here. It may have moved, or the link was mistyped.</p>
        <ul className={styles.links}>
          {NAV.map((n, i) => (
            <li key={n.href}>
              <Link href={n.href}>
                <span>({String(i + 1).padStart(2, "0")})</span>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
