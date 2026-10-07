"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import GlobeLabels from "./GlobeLabels";
import styles from "./WorldLayer.module.css";

const WorldCanvas = dynamic(() => import("@/gl/Canvas"), { ssr: false });

/**
 * Fixed layer behind all content. A static CSS poster (dark soil with grain) is always there;
 * the WebGL world loads after first paint and idle time, and never unmounts on navigation.
 * No WebGL2: the poster stays and the DOM carries the story.
 */
export default function WorldLayer() {
  const webgl2 = useStore((s) => s.webgl2);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => setReady(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 600 });
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={styles.world} aria-hidden="true">
      <div className={styles.poster} />
      {ready && webgl2 && <WorldCanvas />}
      <div className={styles.vignette} />
      {ready && webgl2 && <GlobeLabels />}
    </div>
  );
}
