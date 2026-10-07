"use client";

import { create } from "zustand";
import type { QualityTier } from "@/lib/quality";
import type { Theme } from "@/lib/palette";

export type Chapter = "hero" | "soil" | "stock" | "trade" | "people" | "quote";
export const CHAPTERS: Chapter[] = ["hero", "soil", "stock", "trade", "people", "quote"];

export type ProductSlug = "fertilizer" | "cattle-feed";
export type ServiceKind = "import" | "export";

/**
 * Per frame values. Mutated in place by providers and read inside useFrame loops, so reading
 * them never causes a React render. Exposed through the store as `live`.
 */
export interface LiveState {
  pointer: { x: number; y: number; vx: number; vy: number; speed: number; active: boolean };
  scroll: { y: number; progress: number; velocity: number; direction: 1 | -1 | 0; limit: number };
  /** Continuous home rail position: 0 = hero, 1 = soil, ... 5 = quote */
  homeT: number;
  /** 0..1 progress inside the active chapter */
  chapterProgress: number;
  /** Hero exit progress (0 at top, 1 when the hero has scrolled away) */
  heroExit: number;
  /** Bag rotation on product pages, set by drag and scroll */
  bagRotation: number;
  /** Transition sweep progress 0..2 (cover then reveal) */
  sweep: number;
}

export interface StoreState {
  route: string;
  previousRoute: string | null;
  isTransitioning: boolean;
  transitionDir: 1 | -1;
  assetsLoaded: number;
  glReady: boolean;
  preloaderDone: boolean;
  /** performance.now() when the hero granule timeline should start */
  heroStart: number | null;
  activeChapter: Chapter;
  theme: Theme;
  quality: QualityTier;
  webgl2: boolean;
  reducedMotion: boolean;
  soundOn: boolean;
  menuOpen: boolean;
  profileOpen: boolean;
  productHover: ProductSlug | null;
  serviceHover: ServiceKind | null;
  regionHover: string | null;
  contactRegion: string | null;
  /** Page level scene stage, set by sections in view (for example "hero" or "bag") */
  stage: string;
  live: LiveState;
  set: (partial: Partial<Omit<StoreState, "set" | "live">>) => void;
}

export const useStore = create<StoreState>((set) => ({
  route: "/",
  previousRoute: null,
  isTransitioning: false,
  transitionDir: 1,
  assetsLoaded: 0,
  glReady: false,
  preloaderDone: false,
  heroStart: null,
  activeChapter: "hero",
  theme: "soil",
  quality: "medium",
  webgl2: true,
  reducedMotion: false,
  soundOn: false,
  menuOpen: false,
  profileOpen: false,
  productHover: null,
  serviceHover: null,
  regionHover: null,
  contactRegion: null,
  stage: "hero",
  live: {
    pointer: { x: 0, y: 0, vx: 0, vy: 0, speed: 0, active: false },
    scroll: { y: 0, progress: 0, velocity: 0, direction: 0, limit: 1 },
    homeT: 0,
    chapterProgress: 0,
    heroExit: 0,
    bagRotation: 0,
    sweep: 0,
  },
  set: (partial) => set(partial),
}));

export const live = () => useStore.getState().live;
