"use client";

import Link from "next/link";
import { useRef, type ReactNode, type MouseEvent, type PointerEvent } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { sfx } from "@/lib/sound";
import styles from "./Button.module.css";

type Common = {
  children: ReactNode;
  variant?: "primary" | "quiet";
  className?: string;
  magnetic?: boolean;
  cursor?: string;
};

type AsLink = Common & { href: string; external?: boolean; onClick?: (e: MouseEvent) => void; type?: never; disabled?: never };
type AsButton = Common & {
  href?: undefined;
  onClick?: (e: MouseEvent) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: never;
};

/**
 * Rectangular hairline button. Text rolls up and is replaced by a duplicate on hover, a gold
 * fill wipes in from the side the pointer entered, and the whole button is gently magnetic.
 */
export default function Button(props: AsLink | AsButton) {
  const { children, variant = "primary", className, magnetic = true, cursor } = props;
  const ref = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    sfx.hover();
    const el = ref.current;
    const f = fill.current;
    if (!el || !f) return;
    const r = el.getBoundingClientRect();
    const fromLeft = e.clientX - r.left < r.width / 2;
    gsap.fromTo(
      f,
      { clipPath: fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
      { clipPath: "inset(0 0% 0 0%)", duration: DUR.micro * 2, ease: EASE.out, overwrite: true },
    );
  };
  const onLeave = (e: PointerEvent) => {
    const el = ref.current;
    const f = fill.current;
    if (!el || !f) return;
    const r = el.getBoundingClientRect();
    const toLeft = e.clientX - r.left < r.width / 2;
    gsap.to(f, {
      clipPath: toLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
      duration: DUR.micro * 2,
      ease: EASE.out,
      overwrite: true,
    });
    gsap.to(el, { x: 0, y: 0, duration: DUR.standard, ease: EASE.out });
  };
  const onMove = (e: PointerEvent) => {
    if (!magnetic || e.pointerType !== "mouse" || useStore.getState().reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    gsap.to(el, { x: dx * 8, y: dy * 6, duration: DUR.micro, ease: EASE.out });
  };

  const inner = (
    <>
      {variant === "primary" && <span ref={fill} className={styles.fill} aria-hidden="true" />}
      <span className={styles.roll}>
        <span className={styles.text}>{children}</span>
        <span className={styles.text} aria-hidden="true">
          {children}
        </span>
      </span>
    </>
  );

  const cls = `${styles.button} ${styles[variant]} ${className ?? ""}`;
  const handlers = {
    onPointerEnter: onEnter,
    onPointerLeave: onLeave,
    onPointerMove: onMove,
    "data-cursor": cursor ?? "hover",
  };

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={props.href}
          className={cls}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            sfx.click();
            props.onClick?.(e);
          }}
          {...handlers}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={props.href}
        className={cls}
        onClick={(e) => {
          sfx.click();
          props.onClick?.(e);
        }}
        {...handlers}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={props.type ?? "button"}
      className={cls}
      disabled={props.disabled}
      onClick={(e) => {
        sfx.click();
        props.onClick?.(e);
      }}
      {...handlers}
    >
      {inner}
    </button>
  );
}
