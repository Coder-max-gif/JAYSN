"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { products } from "@/content/products";
import { useStore, type ProductSlug } from "@/store/useStore";
import Section from "@/components/layout/Section";
import Fact from "@/components/ui/Fact";
import ImagePlate from "@/components/ui/ImagePlate";
import styles from "./ProductsIndex.module.css";

/** Typographic product index. Hover swaps the 3D material behind and floats a media plate. */
export default function ProductsIndex() {
  const plate = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<ProductSlug | null>(null);

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: DUR.standard, ease: EASE.out });
    const yTo = gsap.quickTo(el, "y", { duration: DUR.standard, ease: EASE.out });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX - el.offsetWidth * 0.5);
      yTo(e.clientY - el.offsetHeight * 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      useStore.getState().set({ productHover: null });
    };
  }, []);

  useEffect(() => {
    if (!plate.current) return;
    gsap.to(plate.current, { opacity: hover ? 1 : 0, scale: hover ? 1 : 0.9, duration: DUR.standard, ease: EASE.out });
  }, [hover]);

  const set = (v: ProductSlug | null) => {
    setHover(v);
    if (v) useStore.getState().set({ productHover: v });
  };

  const current = products.find((p) => p.slug === hover);

  return (
    <Section theme="soil" stage="hero" className={styles.index}>
      <div className={`grid ${styles.head}`}>
        <h1 className={styles.h1}>
          <span className={styles.h1Label}>Products</span>
          <span className={styles.h1Text}>
            Two products. Both ends of the <em>farm</em>.
          </span>
        </h1>
        <p className={styles.lead}>
          We make fertilizer for the field and cattle feed for the herd, in our own plant in Maharashtra. Pick one to see
          grades, specifications and packing.
        </p>
      </div>

      <ul className={styles.list}>
        {products.map((p) => (
          <li key={p.slug} className={styles.row}>
            <Link
              href={`/products/${p.slug}`}
              className={styles.link}
              onPointerEnter={(e) => e.pointerType === "mouse" && set(p.slug)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => set(p.slug)}
              onBlur={() => setHover(null)}
              data-cursor="label"
              data-cursor-label="View"
            >
              <span className={styles.idx}>({p.index})</span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.meta}>
                <span className={styles.desc}>{p.descriptor}</span>
                <span className={styles.count}>
                  <Fact f={p.variantsCount} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div ref={plate} className={styles.plate} aria-hidden="true">
        {current && <ImagePlate caption={current.plateCaption} ratio="4 / 5" tilt={false} />}
      </div>
    </Section>
  );
}
