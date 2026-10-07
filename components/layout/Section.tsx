"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useStore } from "@/store/useStore";
import type { Theme } from "@/lib/palette";

/**
 * Section wrapper. When it covers the middle of the viewport it sets the chapter theme
 * (data-theme on <html>, tweened by CSS) and optionally a scene stage in the store.
 */
export default function Section({
  theme = "soil",
  stage,
  children,
  className,
  id,
  as: Tag = "section",
  sectionRef,
  ...rest
}: {
  theme?: Theme;
  stage?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "header" | "article";
  sectionRef?: (el: HTMLElement | null) => void;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const activate = () => {
      document.documentElement.setAttribute("data-theme", theme);
      const patch: { theme: Theme; stage?: string } = { theme };
      if (stage) patch.stage = stage;
      useStore.getState().set(patch);
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => self.isActive && activate(),
    });
    if (st.isActive) activate();
    return () => st.kill();
  }, [theme, stage]);
  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        ref.current = el;
        sectionRef?.(el);
      }}
      id={id}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
