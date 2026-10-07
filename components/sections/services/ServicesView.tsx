"use client";

import { useEffect } from "react";
import { services, destinations, origins } from "@/content/services";
import { useStore, type ServiceKind } from "@/store/useStore";
import { scrollToTarget } from "@/components/layout/ScrollProvider";
import Section from "@/components/layout/Section";
import DisplayText from "@/components/ui/DisplayText";
import Label from "@/components/ui/Label";
import Reveal from "@/components/ui/Reveal";
import SpecTable from "@/components/ui/SpecTable";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import GoldLine from "@/components/ui/GoldLine";
import FlatRouteMap from "@/components/sections/FlatRouteMap";
import { Emphasis } from "@/components/ui/Emphasis";
import ProcessTimeline from "./ProcessTimeline";
import RegionList from "./RegionList";
import styles from "./ServicesView.module.css";

function Doors() {
  const hover = useStore((s) => s.serviceHover);
  const set = (v: ServiceKind | null) => useStore.getState().set({ serviceHover: v });
  return (
    <div className={styles.doors} data-active={hover ?? "none"}>
      {services.doors.map((d) => (
        <a
          key={d.id}
          href={`#${d.id}`}
          className={`${styles.door} ${hover === d.id ? styles.doorActive : ""}`}
          onPointerEnter={(e) => e.pointerType === "mouse" && set(d.id as ServiceKind)}
          onPointerLeave={() => set(null)}
          onFocus={() => set(d.id as ServiceKind)}
          onBlur={() => set(null)}
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget(`#${d.id}`);
          }}
          data-cursor="label"
          data-cursor-label="Open"
        >
          <span className={styles.doorIndex}>({d.index})</span>
          <span className={styles.doorWord}>{d.word}</span>
          <span className={styles.doorLine}>{d.line}</span>
          <span className={styles.doorArrow} aria-hidden="true">
            {d.id === "import" ? "In to India" : "Out from India"}
          </span>
        </a>
      ))}
    </div>
  );
}

function ServiceBlock({ kind }: { kind: "export" | "import" }) {
  const block = services[kind];
  const regions = kind === "export" ? destinations : origins;
  return (
    <Section theme="sea" id={kind} className={styles.block} aria-labelledby={`${kind}-title`}>
      <div className={`grid ${styles.blockInner}`}>
        <div className={styles.blockCopy}>
          <Label index={block.index}>{kind === "export" ? "Export" : "Import"}</Label>
          <DisplayText id={`${kind}-title`} text={block.title} size="l" />
          <Reveal className={styles.paras}>
            {block.paragraphs.map((p) => (
              <p key={p} data-reveal-item>
                {p}
              </p>
            ))}
          </Reveal>
          <RegionList regions={regions} label={kind === "export" ? "Destination regions" : "Origin regions"} />
        </div>
        <Reveal className={styles.blockSpecs}>
          <div data-reveal-item>
            <SpecTable rows={block.specs} caption={`${kind} specification`} />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default function ServicesView() {
  const webgl2 = useStore((s) => s.webgl2);
  useEffect(
    () => () => {
      useStore.getState().set({ serviceHover: null, regionHover: null });
    },
    [],
  );
  return (
    <>
      <Section theme="sea" className={styles.intro}>
        <div className={`grid ${styles.introInner}`}>
          <h1 className={styles.h1}>
            <span className={styles.h1Label}>{services.intro.label}</span>
            <span className={styles.h1Text}>
              <Emphasis text={services.intro.title} />
            </span>
          </h1>
        </div>
        <Doors />
      </Section>

      {!webgl2 && (
        <div className={`grid ${styles.flat}`}>
          <FlatRouteMap />
        </div>
      )}

      <ServiceBlock kind="export" />
      <div className="grid">
        <div className={styles.divider}>
          <GoldLine />
        </div>
      </div>
      <ServiceBlock kind="import" />

      <Section theme="soil">
        <ProcessTimeline steps={services.process} />
      </Section>

      <Section theme="soil" className={styles.faq} aria-labelledby="faq-title">
        <div className={`grid ${styles.faqInner}`}>
          <div className={styles.faqHead}>
            <Label index="04">Answers</Label>
            <DisplayText id="faq-title" text="What buyers *ask* us first." size="m" />
          </div>
          <div className={styles.faqList}>
            <Accordion items={services.faq} />
          </div>
        </div>
      </Section>

      <Section theme="soil" className={styles.closing} aria-labelledby="closing-title">
        <div className={`grid ${styles.closingInner}`}>
          <DisplayText id="closing-title" text={services.closing.title} size="xl" className={styles.closingTitle} />
          <Reveal className={styles.closingActions}>
            <div data-reveal-item>
              <Button href="/contact?service=export">Get Export Quotation</Button>
            </div>
            <div data-reveal-item>
              <Button href="/contact?service=import" variant="quiet">
                Request Import Quote
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
