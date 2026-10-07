"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useStore } from "@/store/useStore";
import { products, type Product } from "@/content/products";
import Section from "@/components/layout/Section";
import DisplayText from "@/components/ui/DisplayText";
import Label from "@/components/ui/Label";
import Reveal from "@/components/ui/Reveal";
import SpecTable from "@/components/ui/SpecTable";
import Button from "@/components/ui/Button";
import Fact from "@/components/ui/Fact";
import TextLink from "@/components/ui/TextLink";
import StepIcon from "@/components/ui/StepIcons";
import GoldLine from "@/components/ui/GoldLine";
import { Emphasis } from "@/components/ui/Emphasis";
import styles from "./ProductDetail.module.css";

const PROCESS_ICONS = ["intake", "mix", "form", "pack"];

/** Drag to turn the bag. Scroll through the section also turns it. */
function BagStage({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const live = useStore.getState().live;
    let drag = 0;
    let scrollRot = 0;
    let dragging = false;
    let lastX = 0;
    const apply = () => (live.bagRotation = scrollRot + drag);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        scrollRot = (self.progress - 0.5) * Math.PI * 1.2;
        apply();
      },
    });
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      drag += (e.clientX - lastX) * 0.012;
      lastX = e.clientX;
      apply();
    };
    const up = () => (dragging = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") drag -= 0.3;
      else if (e.key === "ArrowRight") drag += 0.3;
      else return;
      e.preventDefault();
      apply();
    };
    el.addEventListener("keydown", key);
    return () => {
      st.kill();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key);
      live.bagRotation = 0;
    };
  }, []);
  return (
    <div
      ref={ref}
      className={styles.bagStage}
      data-cursor="label"
      data-cursor-label="Drag"
      tabIndex={0}
      role="img"
      aria-label={`${product.name} bag, ${product.bag.weight.value}, printed with the JAYSN AGRO wordmark. Use the arrow keys to turn it.`}
    />
  );
}

/** Horizontal list that scrolls with drag or wheel. Text blocks, not cards. */
function DragRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    const d = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
    };
    const m = (e: PointerEvent) => {
      if (down) el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const u = () => (down = false);
    el.addEventListener("pointerdown", d);
    el.addEventListener("pointermove", m);
    el.addEventListener("pointerup", u);
    return () => {
      el.removeEventListener("pointerdown", d);
      el.removeEventListener("pointermove", m);
      el.removeEventListener("pointerup", u);
    };
  }, []);
  return (
    <div ref={ref} className={styles.dragRow} data-cursor="label" data-cursor-label="Drag" data-lenis-prevent-wheel>
      {children}
    </div>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const other = products.find((p) => p.slug !== product.slug)!;
  const warm = product.slug === "cattle-feed";

  useEffect(
    () => () => {
      useStore.getState().set({ stage: "hero" });
    },
    [],
  );

  return (
    <>
      {/* a. Hero */}
      <Section theme={warm ? "clay" : "soil"} stage="hero" className={styles.hero}>
        <div className={`grid ${styles.heroInner}`}>
          <Label index={product.index} className={styles.heroLabel}>
            <Link href="/products">Products</Link>
          </Label>
          <h1 className={styles.h1}>{product.name}</h1>
          <p className={styles.statement}>
            <Emphasis text={product.statement} />
          </p>
          <p className={styles.descriptor}>{product.descriptor}</p>
        </div>
      </Section>

      {/* b. Bag */}
      <Section theme={warm ? "clay" : "soil"} stage="bag" className={styles.bag} aria-labelledby="bag-title">
        <div className={`grid ${styles.bagInner}`}>
          <div className={styles.bagCopy}>
            <Label index="01">Packed and printed</Label>
            <DisplayText id="bag-title" text={`One *${product.bag.weight.value.toLowerCase()}* bag.`} size="l" />
            <Reveal className={styles.bagFacts}>
              <p data-reveal-item>
                Every bag carries the JAYSN AGRO mark, the product name, the grade and a batch number that traces back
                to the day it was made.
              </p>
              <dl data-reveal-item className={styles.bagDl}>
                <dt>Weight</dt>
                <dd>
                  <Fact f={product.bag.weight} />
                </dd>
                <dt>Printed grade</dt>
                <dd>{product.bag.line}</dd>
              </dl>
            </Reveal>
          </div>
          <BagStage product={product} />
        </div>
      </Section>

      {/* c. Overview */}
      <Section theme={warm ? "clay" : "soil"} stage="detail" className={styles.section} aria-labelledby="overview-title">
        <div className={`grid ${styles.cols}`}>
          <div className={styles.sideHead}>
            <Label index="02">Overview</Label>
            <h2 id="overview-title" className="visually-hidden">
              Overview
            </h2>
          </div>
          <Reveal className={styles.overview}>
            {product.overview.map((p) => (
              <p key={p} data-reveal-item>
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </Section>

      {/* d. Specifications */}
      <Section theme={warm ? "clay" : "soil"} stage="detail" className={styles.section} aria-labelledby="spec-title">
        <div className={`grid ${styles.cols}`}>
          <div className={styles.sideHead}>
            <Label index="03">Specifications</Label>
            <DisplayText id="spec-title" text="On the *sheet*." size="m" />
            <Button href={`/products/${product.slug}/specification`} variant="quiet" external>
              Download specification sheet
            </Button>
          </div>
          <div className={styles.main}>
            <SpecTable rows={product.specs} caption={`${product.name} specifications`} />
          </div>
        </div>
      </Section>

      {/* e. Grades and variants */}
      <Section theme={warm ? "clay" : "soil"} stage="detail" className={styles.section} aria-labelledby="variants-title">
        <div className={`grid ${styles.cols}`}>
          <div className={styles.sideHead}>
            <Label index="04">Grades</Label>
            <DisplayText id="variants-title" text="Grades and *variants*." size="m" />
          </div>
        </div>
        <DragRow>
          {product.variants.map((v, i) => (
            <article key={v.name} className={styles.variant}>
              <span className={styles.variantIdx}>({String(i + 1).padStart(2, "0")})</span>
              <h3 className={styles.variantName}>{v.name}</h3>
              <p className={styles.variantBody}>
                <Fact f={v.body} />
              </p>
            </article>
          ))}
        </DragRow>
      </Section>

      {/* f. Uses */}
      <Section theme={warm ? "clay" : "soil"} stage="detail" className={styles.section} aria-labelledby="uses-title">
        <div className={`grid ${styles.cols}`}>
          <div className={styles.sideHead}>
            <Label index="05">Uses</Label>
            <DisplayText id="uses-title" text={product.usesTitle} size="m" />
          </div>
          <ul className={styles.uses}>
            {product.uses.map((u) => (
              <li key={u.who}>
                <span className={styles.useWho}>{u.who}</span>
                <span className={styles.useHow}>
                  <Fact f={u.how} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* g. Packaging and shipping */}
      <Section theme="sea" stage="detail" className={styles.section} aria-labelledby="pack-title">
        <div className={`grid ${styles.cols}`}>
          <div className={styles.sideHead}>
            <Label index="06">Packing and shipping</Label>
            <DisplayText id="pack-title" text="From pallet to *container*." size="m" />
          </div>
          <div className={styles.main}>
            <SpecTable rows={product.packaging} caption="Packing and shipping" />
          </div>
        </div>
      </Section>

      {/* h. Process */}
      <Section theme="soil" stage="detail" className={styles.section} aria-labelledby="made-title">
        <div className={`grid ${styles.cols}`}>
          <div className={styles.sideHead}>
            <Label index="07">How it is made</Label>
            <DisplayText id="made-title" text="Four steps, *tested* at each." size="m" />
          </div>
        </div>
        <Reveal as="ol" className={`grid ${styles.process}`}>
          {product.process.map((s, i) => (
            <li key={s.title} data-reveal-item className={styles.processStep}>
              <StepIcon name={PROCESS_ICONS[i]} className={styles.processIcon} />
              <span className={styles.processNum}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.processTitle}>{s.title}</h3>
              <p className={styles.processBody}>{s.body}</p>
            </li>
          ))}
        </Reveal>
      </Section>

      {/* i. Closing */}
      <Section theme="soil" stage="detail" className={styles.closing}>
        <div className={`grid ${styles.closingInner}`}>
          <Link
            href={`/contact?product=${product.slug}`}
            className={styles.closingLink}
            data-cursor="label"
            data-cursor-label="Quote"
          >
            <span className={styles.closingLabel}>Request a quote</span>
            <span className={styles.closingBig}>
              Price a load of <em>{product.name.toLowerCase()}</em>.
            </span>
          </Link>
          <div className={styles.closingRule}>
            <GoldLine />
          </div>
          <div className={styles.other}>
            <TextLink href={`/products/${other.slug}`} arrow>
              Next: {other.name}
            </TextLink>
          </div>
        </div>
      </Section>
    </>
  );
}
