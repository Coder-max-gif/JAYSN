import Link from "next/link";
import { company } from "@/content/company";
import { contact } from "@/content/contact";
import { products } from "@/content/products";
import { NAV } from "@/lib/nav";
import Fact from "@/components/ui/Fact";
import TextLink from "@/components/ui/TextLink";
import { FooterWordmark, LocalTime, BackToTop } from "./FooterClient";
import styles from "./Footer.module.css";

export default function Footer() {
  const social = Object.entries(company.social).filter(([, f]) => f.value);
  return (
    <footer className={styles.footer}>
      <div className={`grid ${styles.top}`}>
        <div className={styles.intro}>
          <p className={styles.tagline}>
            <Fact f={company.tagline} />
          </p>
          <p className={styles.legal}>{company.legalName.value}</p>
          <p className={styles.dim}>{company.region.value}</p>
        </div>

        <nav aria-label="Footer" className={styles.col}>
          <p className={styles.head}>(01) Site</p>
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={styles.link}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className={styles.head}>(02) Products</p>
          <ul>
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className={styles.link}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className={`${styles.head} ${styles.headGap}`}>(03) Services</p>
          <ul>
            <li>
              <Link href="/services#import" className={styles.link}>
                Import
              </Link>
            </li>
            <li>
              <Link href="/services#export" className={styles.link}>
                Export
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.col}>
          <p className={styles.head}>(04) Contact</p>
          <ul>
            <li>
              <TextLink href={`mailto:${contact.email.value}`}>
                <Fact f={contact.email} />
              </TextLink>
            </li>
            <li>
              <TextLink href={`tel:${contact.phone.value.replace(/\s/g, "")}`}>
                <Fact f={contact.phone} />
              </TextLink>
            </li>
            <li>
              <TextLink href={`https://wa.me/${contact.whatsapp.value}`}>WhatsApp</TextLink>
            </li>
          </ul>
          {social.length > 0 && (
            <ul className={styles.social}>
              {social.map(([k, f]) => (
                <li key={k}>
                  <TextLink href={f.value}>{k.charAt(0).toUpperCase() + k.slice(1)}</TextLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.meta}>
          <LocalTime />
          <BackToTop />
        </div>
      </div>

      <div className={`grid ${styles.bottom}`}>
        <p className={styles.copy}>
          (c) {company.copyrightYear} {company.legalName.value}. All rights reserved.
        </p>
        <p className={styles.legalLinks}>
          <Link href="/privacy" className={styles.link}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.link}>
            Terms
          </Link>
        </p>
      </div>

      <FooterWordmark />
    </footer>
  );
}
