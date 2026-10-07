"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { navIndex } from "@/lib/nav";
import { getLenis } from "./ScrollProvider";
import { sfx } from "@/lib/sound";
import { rig } from "@/gl/rig";
import { Sweep } from "./sweep";
import styles from "./TransitionManager.module.css";

type Variant = "sweep" | "foreground" | "fade";

/**
 * Intercepts internal link clicks. Exit (cover) -> router.push -> wait for the new route ->
 * reset scroll while covered -> refresh ScrollTrigger -> enter (reveal). Handles rapid clicks
 * (the last one wins), same route clicks, and back or forward buttons.
 */
export default function TransitionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const sweep = useRef<Sweep | null>(null);
  const pending = useRef<string | null>(null);
  const navigating = useRef(false);
  const pathRef = useRef(pathname);
  const waiters = useRef<((p: string) => void)[]>([]);
  const firstPath = useRef(true);

  // Route arrival notifies whoever is waiting for it
  useEffect(() => {
    pathRef.current = pathname;
    waiters.current.splice(0).forEach((w) => w(pathname));
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    // Back or forward: no cover was played, so ease the new content in
    if (!navigating.current) {
      const main = document.getElementById("main");
      if (main) gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: DUR.micro * 2, ease: EASE.out });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [pathname]);

  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      sweep.current = Sweep.create(c);
      sweep.current?.resize();
    }
    const onResize = () => sweep.current?.resize();
    window.addEventListener("resize", onResize);

    const waitForRoute = (target: string) =>
      new Promise<void>((resolve) => {
        if (pathRef.current === target) return resolve();
        const timeout = window.setTimeout(resolve, 8000);
        waiters.current.push((p) => {
          if (p === target) {
            window.clearTimeout(timeout);
            resolve();
          }
        });
      });

    const animateSweep = (from: number, to: number, dir: number, ease: string) =>
      new Promise<void>((resolve) => {
        const o = { v: from };
        const fb = fallbackRef.current;
        gsap.to(o, {
          v: to,
          duration: DUR.transition,
          ease,
          onUpdate: () => {
            useStore.getState().live.sweep = o.v;
            if (sweep.current) sweep.current.draw(o.v, dir);
            else if (fb) fb.style.opacity = String(o.v <= 1 ? o.v : 2 - o.v);
          },
          onComplete: () => {
            if (sweep.current) sweep.current.draw(to >= 2 ? 0 : to, dir);
            resolve();
          },
        });
      });

    const go = async (href: string) => {
      if (navigating.current) {
        pending.current = href;
        return;
      }
      const url = new URL(href, location.href);
      const target = url.pathname;
      const from = pathRef.current;
      const s = useStore.getState();
      const reduced = s.reducedMotion;
      const dir = navIndex(target) >= navIndex(from) ? 1 : -1;
      const toDetail = target.startsWith("/products/");
      const variant: Variant = reduced
        ? "fade"
        : (from === "/" && target === "/services") || (from === "/services" && target === "/")
          ? "foreground"
          : "sweep";

      navigating.current = true;
      s.set({ isTransitioning: true, transitionDir: dir as 1 | -1, menuOpen: false });
      sfx.whoosh();
      const main = document.getElementById("main");
      const footer = document.querySelector<HTMLElement>("footer");
      const content = [main, footer].filter(Boolean) as HTMLElement[];

      // Exit
      if (variant === "sweep") {
        if (toDetail) gsap.to(rig, { push: 1, duration: DUR.transition, ease: EASE.inOut });
        gsap.to(content, { x: -dir * 24, opacity: 0.4, duration: DUR.transition, ease: EASE.inOut });
        await animateSweep(0, 1, dir, EASE.inOut);
      } else {
        await new Promise<void>((r) =>
          gsap.to(content, {
            opacity: 0,
            y: variant === "foreground" ? -16 : 0,
            duration: variant === "fade" ? DUR.micro : DUR.standard,
            ease: EASE.inOut,
            onComplete: r,
          }),
        );
      }

      // Swap
      router.push(url.pathname + url.search + url.hash, { scroll: false });
      await waitForRoute(target);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const lenis = getLenis();
      if (url.hash) {
        const el = document.querySelector<HTMLElement>(url.hash);
        if (el && lenis) lenis.scrollTo(el, { immediate: true, offset: -80, force: true });
        else el?.scrollIntoView();
      } else if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      rig.push = 0;

      // Enter
      if (variant === "sweep") {
        gsap.fromTo(content, { x: dir * 24, opacity: 0.4 }, { x: 0, opacity: 1, duration: DUR.transition, ease: EASE.out });
        await animateSweep(1, 2, dir, EASE.out);
      } else {
        await new Promise<void>((r) =>
          gsap.fromTo(
            content,
            { opacity: 0, y: variant === "foreground" ? 16 : 0 },
            { opacity: 1, y: 0, duration: variant === "fade" ? DUR.micro : DUR.standard, ease: EASE.out, onComplete: r },
          ),
        );
      }
      gsap.set(content, { clearProps: "transform,opacity" });
      document.getElementById("main")?.focus({ preventScroll: true });
      navigating.current = false;
      useStore.getState().set({ isTransitioning: false, previousRoute: from });

      const next = pending.current;
      pending.current = null;
      if (next && new URL(next, location.href).pathname !== pathRef.current) go(next);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !a.href) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) {
        // Same page: hash links scroll, plain links go to top, query changes route normally
        if (url.search !== location.search) return;
        e.preventDefault();
        const lenis = getLenis();
        if (url.hash) {
          const el = document.querySelector<HTMLElement>(url.hash);
          if (el && lenis) lenis.scrollTo(el, { offset: -80 });
          else el?.scrollIntoView({ behavior: "smooth" });
        } else if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        useStore.getState().set({ menuOpen: false });
        return;
      }
      e.preventDefault();
      go(url.pathname + url.search + url.hash);
    };
    // Capture phase so we run before Next's Link handler
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onResize);
    };
  }, [router]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.sweep} aria-hidden="true" />
      <div ref={fallbackRef} className={styles.fallback} aria-hidden="true" />
    </>
  );
}
