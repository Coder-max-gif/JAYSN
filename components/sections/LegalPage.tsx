import Section from "@/components/layout/Section";
import Label from "@/components/ui/Label";
import styles from "./LegalPage.module.css";

/** Simple placeholder legal page. The client's lawyer supplies the real text. */
export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <Section theme="soil" className={styles.page}>
      <div className={`grid ${styles.inner}`}>
        <div className={styles.head}>
          <Label>Placeholder, to be reviewed by the client</Label>
          <h1 className={styles.h1}>{title}</h1>
          <p className={styles.updated}>Last updated {updated}</p>
        </div>
        <div className={styles.body}>
          {sections.map((s, i) => (
            <section key={s.h} className={styles.block}>
              <h2 className={styles.h2}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s.h}
              </h2>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
