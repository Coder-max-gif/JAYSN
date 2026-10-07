"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { damp } from "@/lib/motion";

/**
 * Presence keeps a scene mounted while it animates out, so scenes never pop.
 * Children read `presence.current` (0..1) inside useFrame and fade or move accordingly.
 */
const PresenceContext = createContext<{ current: number }>({ current: 1 });

export const usePresence = () => useContext(PresenceContext);

export function Presence({
  active,
  children,
  speed = 2.4,
}: {
  active: boolean;
  children: React.ReactNode;
  speed?: number;
}) {
  const value = useRef({ current: 0 });
  const [mounted, setMounted] = useState(active);

  if (active && !mounted) setMounted(true);

  useFrame((_, dt) => {
    const target = active ? 1 : 0;
    const v = value.current;
    v.current = damp(v.current, target, speed, Math.min(dt, 0.1));
    if (!active && v.current < 0.01 && mounted) setMounted(false);
  });

  if (!mounted) return null;
  return <PresenceContext.Provider value={value.current}>{children}</PresenceContext.Provider>;
}
