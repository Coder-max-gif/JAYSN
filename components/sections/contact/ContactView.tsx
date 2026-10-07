import { Suspense } from "react";
import { contact } from "@/content/contact";
import { company } from "@/content/company";
import Section from "@/components/layout/Section";
import DisplayText from "@/components/ui/DisplayText";
import Label from "@/components/ui/Label";
import Fact from "@/components/ui/Fact";
import TextLink from "@/components/ui/TextLink";
import FlatRouteMap from "@/components/sections/FlatRouteMap";
import QuoteForm from "./QuoteForm";
import styles from "./ContactView.module.css";

export default function ContactView() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery)}`;
  return (
    <>
      <Section theme="soil" className={styles.contact}>
        <div className={`grid ${styles.inner}`}>
          <div className={styles.left}>
            <Label>Contact and quote</Label>
            <DisplayText as="h1" text={contact.heading} size="l" />
            <p className={styles.intro}>{contact.intro}</p>

            <dl className={styles.details}>
              <div>
                <dt>Company</dt>
                <dd>{company.legalName.value}</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{company.region.value}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <TextLink href={`mailto:${contact.email.value}`}>
                    <Fact f={contact.email} />
                  </TextLink>
                </dd>
              </div>
              <div>
                <dt>Phone and WhatsApp</dt>
                <dd>
                  <TextLink href={`tel:${contact.phone.value.replace(/\s/g, "")}`}>
                    <Fact f={contact.phone} />
                  </TextLink>
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>
                  <Fact f={contact.hours} />
                </dd>
              </div>
            </dl>
          </div>

          <div className={styles.right}>
            <Suspense fallback={<div className={styles.formFallback} />}>
              <QuoteForm />
            </Suspense>
          </div>
        </div>
      </Section>

      <Section theme="soil" className={styles.location} aria-labelledby="loc-title">
        <div className={`grid ${styles.locInner}`}>
          <div className={styles.locCopy}>
            <Label index="02">Location</Label>
            <h2 id="loc-title" className={styles.locTitle}>
              Maharashtra, <em>India</em>.
            </h2>
            <p className={styles.address}>
              <Fact f={contact.address} />
            </p>
            <p className={styles.address}>
              Port of loading: <Fact f={company.port} />
            </p>
            <TextLink href={maps} arrow>
              Open in Google Maps
            </TextLink>
          </div>
          <div className={styles.map}>
            <FlatRouteMap routes={false} label="Map showing JAYSN AGRO in Maharashtra, India" />
            <span className={styles.mapCaption}>18.95 N, 72.95 E</span>
          </div>
        </div>
      </Section>
    </>
  );
}
