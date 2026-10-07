"use client";

import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { Vector2 } from "three";
import { useMemo } from "react";

/**
 * Subtle post: bloom only catches the brightest values (gold granules, arc heads), a soft
 * vignette and a very slight chromatic aberration at the edges. Film grain lives in the DOM.
 */
export default function PostFX() {
  const offset = useMemo(() => new Vector2(0.0006, 0.0006), []);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.78} luminanceSmoothing={0.12} radius={0.6} />
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.35} />
      <Vignette eskil={false} offset={0.28} darkness={0.62} />
    </EffectComposer>
  );
}
