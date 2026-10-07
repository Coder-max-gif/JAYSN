"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import styles from "./ImagePlate.module.css";

/**
 * Hard edged media plate with a fixed aspect ratio. Reveals with a clip path wipe, tilts a few
 * degrees with the pointer. Until the client supplies a photo or video, it shows a designed
 * placeholder with a caption that says exactly what belongs there.
 */
export default function ImagePlate({
  src,
  video,
  alt = "",
  caption,
  ratio = "4 / 5",
  tilt = true,
  className,
  cursorLabel = "View",
  priority = false,
  displace = false,
}: {
  src?: string;
  video?: string;
  alt?: string;
  /** Placeholder caption, for example "Photo: warehouse loading, to be supplied" */
  caption: string;
  ratio?: string;
  tilt?: boolean;
  className?: string;
  cursorLabel?: string;
  priority?: boolean;
  /** Hover distortion that settles: SVG displacement driven by GSAP */
  displace?: boolean;
}) {
  const filterId = `disp-${useId().replace(/:/g, "")}`;
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(!src && !video);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (useStore.getState().reducedMotion) return;
    gsap.set(el, { clipPath: "inset(100% 0 0 0)" });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => gsap.to(el, { clipPath: "inset(0% 0 0 0)", duration: DUR.large, ease: EASE.out }),
    });
    return () => st.kill();
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (!tilt || e.pointerType !== "mouse" || useStore.getState().reducedMotion) return;
    const el = inner.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * 4, rotateX: -y * 3, duration: DUR.standard, ease: EASE.out });
  };
  const onEnter = (e: React.PointerEvent) => {
    if (!displace || e.pointerType !== "mouse" || useStore.getState().reducedMotion || !dispRef.current) return;
    const o = { v: 46 };
    gsap.to(o, {
      v: 0,
      duration: DUR.large,
      ease: EASE.out,
      overwrite: true,
      onUpdate: () => dispRef.current?.setAttribute("scale", o.v.toFixed(2)),
    });
  };
  const onLeave = () => {
    if (inner.current) gsap.to(inner.current, { rotateX: 0, rotateY: 0, duration: DUR.standard, ease: EASE.out });
  };

  const hasMedia = !!src || !!video;

  return (
    <div
      ref={ref}
      className={`${styles.plate} ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      data-cursor={hasMedia ? "label" : undefined}
      data-cursor-label={hasMedia ? cursorLabel : undefined}
    >
      {displace && (
        <svg className={styles.filterDefs} aria-hidden="true">
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <div ref={inner} className={styles.inner} style={displace ? { filter: `url(#${filterId})` } : undefined}>
        {video ? (
          <video
            className={styles.media}
            src={video}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            onLoadedData={() => setLoaded(true)}
            aria-label={alt}
          />
        ) : src ? (
          // Client photos go through /scripts/optimize-assets.mjs into /public/media
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.media}
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={caption}>
            <span className={styles.mark} aria-hidden="true" />
            <span className={styles.caption}>{caption}</span>
            <span className={styles.ratio} aria-hidden="true">
              {ratio.replace(/\s/g, "")}
            </span>
          </div>
        )}
        {hasMedia && !loaded && <div className={styles.shimmer} aria-hidden="true" />}
      </div>
    </div>
  );
}
