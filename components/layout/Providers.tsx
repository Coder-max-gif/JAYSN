"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ScrollProvider from "./ScrollProvider";
import { useStore } from "@/store/useStore";
import { detectTier } from "@/lib/quality";
import { initSound } from "@/lib/sound";

/** Device, motion, pointer and route state. Runs once at the root. */
function StateSync() {
  const pathname = usePathname();

  // Capability, motion and sound preferences
  useEffect(() => {
    const { tier, webgl2 } = detectTier();
    const html = document.documentElement;
    const reducedMotion = html.getAttribute("data-motion") === "reduce";
    let soundOn = false;
    try {
      soundOn = localStorage.getItem("jaysn-sound") === "on";
    } catch {}
    useStore.getState().set({ quality: tier, webgl2, reducedMotion, soundOn: false });
    html.dataset.quality = tier;
    // Sound needs a user gesture before it may start; restore the choice on the first one
    if (soundOn) {
      const resume = () => {
        useStore.getState().set({ soundOn: true });
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("keydown", resume);
      };
      window.addEventListener("pointerdown", resume, { once: true });
      window.addEventListener("keydown", resume, { once: true });
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("jaysn-motion");
      } catch {}
      if (saved) return; // explicit choice wins
      html.setAttribute("data-motion", mq.matches ? "reduce" : "full");
      useStore.getState().set({ reducedMotion: mq.matches });
    };
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  // Pointer, normalised to -1..1 with velocity
  useEffect(() => {
    const p = useStore.getState().live.pointer;
    let lastT = performance.now();
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      lastT = now;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      p.vx = (x - p.x) / dt;
      p.vy = (y - p.y) / dt;
      p.speed = Math.min(8, Math.hypot(p.vx, p.vy));
      p.x = x;
      p.y = y;
      p.active = true;
    };
    const onLeave = () => {
      p.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Route
  const firstRoute = useRef(true);
  useEffect(() => {
    const s = useStore.getState();
    if (firstRoute.current) {
      firstRoute.current = false;
      s.set({ route: pathname });
    } else if (s.route !== pathname) {
      s.set({ previousRoute: s.route, route: pathname });
    }
  }, [pathname]);

  // Sound engine follows the store
  useEffect(() => initSound(), []);

  // Development: expose the store for debugging and automated checks
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") (window as unknown as { __jaysn: typeof useStore }).__jaysn = useStore;
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ScrollProvider>
      <StateSync />
      {children}
    </ScrollProvider>
  );
}
