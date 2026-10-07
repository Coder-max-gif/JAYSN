"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import SceneManager from "./SceneManager";
import PostFX from "./postfx/PostFX";
import { useStore } from "@/store/useStore";
import { TIERS, lowerTier } from "@/lib/quality";

/** Frame stats for the dev overlay (key "d"). Written in the frame loop, read by the DOM. */
export const devStats = { fps: 0, calls: 0, triangles: 0, points: 0, dpr: 1 };

function Stats() {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    a.frames++;
    a.time += dt;
    if (a.time >= 0.5) {
      devStats.fps = Math.round(a.frames / a.time);
      a.frames = 0;
      a.time = 0;
    }
    devStats.calls = gl.info.render.calls;
    devStats.triangles = gl.info.render.triangles;
    devStats.points = gl.info.render.points;
    devStats.dpr = gl.getPixelRatio();
  });
  return null;
}

/** Compiles shaders after the first frames and reports readiness to the preloader. */
function ReadySignal() {
  const { gl, scene, camera } = useThree();
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 2) {
      try {
        gl.compile(scene, camera);
      } catch {}
    }
    if (frames.current === 4 && !useStore.getState().glReady) useStore.getState().set({ glReady: true });
  });
  return null;
}

export default function WorldCanvas() {
  const quality = useStore((s) => s.quality);
  const tier = TIERS[quality];
  const [dprState, setDpr] = useState(TIERS.high.dprMax);
  const dpr = Math.max(tier.dprMin, Math.min(dprState, tier.dprMax));
  const [hidden, setHidden] = useState(false);
  const declines = useRef(0);

  // Pause the render loop while the tab is hidden
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      frameloop={hidden ? "never" : "always"}
      gl={{
        antialias: !tier.postfx,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 35, position: [0, 0.6, 12], near: 0.1, far: 400 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor(0x000000, 0);
      }}
      aria-hidden="true"
      tabIndex={-1}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          declines.current++;
          setDpr(Math.max(tier.dprMin, +(dpr - 0.25).toFixed(2)));
          // Sustained trouble: drop a tier
          if (declines.current >= 3 && quality !== "low") {
            declines.current = 0;
            useStore.getState().set({ quality: lowerTier(quality) });
          }
        }}
        onIncline={() => setDpr(Math.min(tier.dprMax, +(dpr + 0.25).toFixed(2)))}
      >
        <SceneManager />
        {tier.postfx && <PostFX />}
        <ReadySignal />
        {process.env.NODE_ENV !== "production" && <Stats />}
      </PerformanceMonitor>
    </Canvas>
  );
}
