"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR, STAGGER } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { home } from "@/content/home";
import { contact } from "@/content/contact";
import { HERO_TIMELINE } from "@/gl/scenes/Hero";
import DisplayText from "@/components/ui/DisplayText";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import styles from "./HomeHero.module.css";

/**
 * Hero DOM layer. The canvas wordmark is decorative; this is the real, readable content.
 * The headline reveals by line once the granules release from the wordmark.
 */
const HomeHero = forwardRef<HTMLElement>(function HomeHero(_, ref) {
  const [play, setPlay] = useState(false);
  const rest = useRef<HTMLDivElement>(null);
  const heroStart = useStore((s) => s.heroStart);
  const reduced = useStore((s) => s.reducedMotion);
  const webgl2 = useStore((s) => s.webgl2);

  useEffect(() => {
    if (heroStart === null) return;
    const elapsed = (performance.now() - heroStart) / 1000;
    // Without WebGL or with reduced motion there is no wordmark to wait for
    const at = reduced || !webgl2 ? 0.2 : HERO_TIMELINE.releaseStart + 0.2;
    const wait = Math.max(0, at - elapsed);
    const id = window.setTimeout(() => setPlay(true), wait * 1000);
    return () => window.clearTimeout(id);
  }, [heroStart, reduced, webgl2]);

  useEffect(() => {
    const el = rest.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-hero-item]");
    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    if (!play) {
      gsap.set(items, { opacity: 0, y: 16 });
      return;
    }
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: DUR.standard,
      ease: EASE.out,
      stagger: STAGGER.item,
      delay: 0.5,
    });
  }, [play, reduced]);

  const wa = `https://wa.me/${contact.whatsapp.value}?text=${encodeURIComponent(contact.whatsappMessage)}`;

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div className={`grid ${styles.top}`}>
        <Label className={styles.label}>{home.hero.label}</Label>
      </div>
      <div className={`grid ${styles.bottom}`}>
        <div className={styles.copy}>
          <DisplayText as="h1" id="hero-title" text={home.hero.headline} size="l" trigger="manual" play={play} />
        </div>
        <div ref={rest} className={styles.rest}>
          <p className={styles.body} data-hero-item data-reveal="fade">
            {home.hero.body}
          </p>
          <div className={styles.actions} data-hero-item data-reveal="fade">
            <Button href={home.hero.primary.href}>{home.hero.primary.label}</Button>
            <Button href={wa} external variant="quiet">
              {home.hero.secondary.label}
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.cue} aria-hidden="true">
        <span className={styles.cueLine} />
        <span className={styles.cueWord}>Scroll</span>
      </div>
    </section>
  );
});

export default HomeHero;
