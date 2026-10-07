"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Fog, PerspectiveCamera, Vector3 } from "three";
import { Presence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { rig, themeColor } from "@/gl/rig";
import { damp } from "@/lib/motion";
import { getProduct } from "@/content/products";
import HomeWorld from "./scenes/HomeWorld";
import Globe from "./scenes/Globe";
import ProductMacro from "./scenes/ProductMacro";
import Bag from "./scenes/Bag";
import LoopScene from "./scenes/LoopScene";
import DevScene from "./scenes/DevScene";

/** Damps the camera toward the rig intent, adds pointer parallax, tweens fog to the theme. */
function CameraRig() {
  const { camera, scene } = useThree();
  const look = useRef(rig.lookAt.clone());
  const tmp = useMemo(() => new Vector3(), []);
  const fogTarget = useMemo(() => new Color(), []);

  useEffect(() => {
    scene.fog = new Fog(themeColor("soil"), 10, 70);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = useStore.getState();
    const p = s.live.pointer;
    const reduced = s.reducedMotion;
    const lambda = reduced ? 50 : rig.lambda;
    const par = reduced ? 0 : rig.parallax;

    tmp.copy(rig.position);
    tmp.x += p.x * par;
    tmp.y += p.y * par * 0.6;
    // Push toward the look target (product transitions)
    if (rig.push > 0) tmp.lerp(rig.lookAt, rig.push * 0.7);

    camera.position.x = damp(camera.position.x, tmp.x, lambda, dt);
    camera.position.y = damp(camera.position.y, tmp.y, lambda, dt);
    camera.position.z = damp(camera.position.z, tmp.z, lambda, dt);
    look.current.x = damp(look.current.x, rig.lookAt.x, lambda, dt);
    look.current.y = damp(look.current.y, rig.lookAt.y, lambda, dt);
    look.current.z = damp(look.current.z, rig.lookAt.z, lambda, dt);
    camera.lookAt(look.current);

    const cam = camera as PerspectiveCamera;
    if (Math.abs(cam.fov - rig.fov) > 0.01) {
      cam.fov = damp(cam.fov, rig.fov, 3, dt);
      cam.updateProjectionMatrix();
    }

    // Menu open: darker, slower world
    rig.dim = damp(rig.dim, s.menuOpen ? 1 : 0, 4, dt);
    rig.timeScale = damp(rig.timeScale, s.menuOpen ? 0.25 : 1, 3, dt);

    const fog = scene.fog as Fog | null;
    if (fog) {
      fogTarget.copy(themeColor(s.theme));
      fog.color.lerp(fogTarget, 1 - Math.exp(-2.5 * dt));
    }
  });
  return null;
}

/** Sets the camera intent for routes that are not the home rail. */
function RouteCamera({ route, stage }: { route: string; stage: string }) {
  const { size } = useThree();
  useFrame(() => {
    if (route === "/") return;
    rig.lambda = 2.6;
    rig.parallax = 0.18;
    rig.fov = 35;
    const narrow = size.width < 768;
    if (route === "/services" || route === "/contact") {
      rig.position.set(0, 0, narrow ? 15 : 12);
      rig.lookAt.set(0, 0, 0);
    } else if (route.startsWith("/products")) {
      if (stage === "bag") {
        rig.position.set(0, 0.2, narrow ? 6.5 : 5.2);
        rig.lookAt.set(0, 0.1, 0);
      } else {
        rig.position.set(0, 1.7, narrow ? 5.8 : 4.8);
        rig.lookAt.set(0, -0.6, -0.6);
      }
    } else {
      rig.position.set(0, 0, 12);
      rig.lookAt.set(0, 0, 0);
    }
  });
  return null;
}

/**
 * Mounts scene groups by route and stage. Every group sits in a Presence so it animates in and
 * out instead of popping. Only what the current route needs is mounted.
 */
export default function SceneManager() {
  const route = useStore((s) => s.route);
  const stage = useStore((s) => s.stage);
  const productHover = useStore((s) => s.productHover);
  const { size } = useThree();
  const narrow = size.width < 768;

  const isHome = route === "/";
  const isServices = route === "/services";
  const isContact = route === "/contact";
  const isIndex = route === "/products";
  const detail = route.startsWith("/products/") ? getProduct(route.split("/")[2] ?? "") : undefined;
  const isTeam = route === "/team";
  const isDev = route === "/dev";
  const other = !isHome && !isServices && !isContact && !isIndex && !detail && !isTeam && !isDev;

  const indexKind = productHover ?? "fertilizer";
  const globePos: [number, number, number] = narrow ? [0, -1.5, -2] : isContact ? [3.6, -0.6, -3] : [3.2, -0.2, 0];

  return (
    <>
      <CameraRig />
      <RouteCamera route={route} stage={stage} />
      <ambientLight intensity={0.08} />

      <Presence active={isHome}>
        <HomeWorld />
      </Presence>

      <Presence active={isServices || isContact}>
        <Globe mode={isContact ? "contact" : "services"} radius={narrow ? 3 : 3.6} position={globePos} />
      </Presence>

      <Presence active={isIndex && indexKind === "fertilizer"}>
        <ProductMacro kind="fertilizer" />
      </Presence>
      <Presence active={isIndex && indexKind === "cattle-feed"}>
        <ProductMacro kind="cattle-feed" />
      </Presence>

      <Presence active={!!detail && detail.slug === "fertilizer" && stage !== "bag"}>
        <ProductMacro kind="fertilizer" />
      </Presence>
      <Presence active={!!detail && detail.slug === "cattle-feed" && stage !== "bag"}>
        <ProductMacro kind="cattle-feed" />
      </Presence>
      {detail && (
        <Presence active={stage === "bag"}>
          <Bag product={detail} x={narrow ? 0 : 1.35} />
        </Presence>
      )}

      <Presence active={isTeam}>
        <LoopScene position={narrow ? [0, 1, -4] : [3, 0, -2]} />
      </Presence>
      <Presence active={isDev}>
        <DevScene />
      </Presence>
      <Presence active={other}>
        <LoopScene position={[3.5, -0.5, -4]} dust={400} />
      </Presence>
    </>
  );
}
