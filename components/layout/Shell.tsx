"use client";

import type { ReactNode } from "react";
import WorldLayer from "./WorldLayer";
import Header from "./Header";
import MenuOverlay from "./MenuOverlay";
import Cursor from "./Cursor";
import Grain from "./Grain";
import ScrollProgress from "./ScrollProgress";
import TransitionManager from "./TransitionManager";
import Preloader from "./Preloader";
import DevOverlay from "./DevOverlay";
import styles from "./Shell.module.css";

export default function Shell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <WorldLayer />
      <Header />
      <MenuOverlay />
      <ScrollProgress />
      <div className={styles.page} id="page">
        <main id="main" tabIndex={-1} className={styles.main}>
          {children}
        </main>
        {footer}
      </div>
      <TransitionManager />
      <Preloader />
      <Cursor />
      <Grain />
      {process.env.NODE_ENV !== "production" && <DevOverlay />}
    </>
  );
}
