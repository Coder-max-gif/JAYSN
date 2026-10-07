"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { EASE, DUR, STAGGER } from "@/lib/motion";
import { useStore } from "@/store/useStore";
import { team, teamPage, type Member } from "@/content/team";
import { contact } from "@/content/contact";
import { trapFocus } from "@/lib/focusTrap";
import { useMedia } from "@/lib/useMedia";
import Section from "@/components/layout/Section";
import DisplayText from "@/components/ui/DisplayText";
import Label from "@/components/ui/Label";
import Reveal from "@/components/ui/Reveal";
import Fact from "@/components/ui/Fact";
import TextLink from "@/components/ui/TextLink";
import Button from "@/components/ui/Button";
import PortraitGL from "./PortraitGL";
import styles from "./TeamView.module.css";

const alt = (m: Member) => `${m.name.value}, ${m.role.value}`;

function Profile({
  member,
  from,
  onClose,
  onStep,
}: {
  member: Member;
  from: DOMRect | null;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return trapFocus(el, onClose);
  }, [onClose]);

  // FLIP: the portrait grows from where it was in the list to its large position
  useEffect(() => {
    const el = root.current;
    const p = portrait.current;
    if (!el || !p) return;
    const reduced = useStore.getState().reducedMotion;
    el.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true });
    const lines = el.querySelectorAll("[data-line]");
    const tl = gsap.timeline();
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: DUR.micro, ease: EASE.out });
    if (from && !reduced) {
      const to = p.getBoundingClientRect();
      tl.fromTo(
        p,
        {
          x: from.left - to.left,
          y: from.top - to.top,
          scaleX: from.width / to.width,
          scaleY: from.height / to.height,
          transformOrigin: "0 0",
        },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: DUR.large, ease: EASE.out },
        0,
      );
    }
    if (!reduced)
      tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: DUR.large, ease: EASE.out, stagger: STAGGER.line }, 0.2);
    return () => {
      tl.kill();
    };
  }, [member, from]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep]);

  return (
    <div ref={root} className={styles.profile} role="dialog" aria-modal="true" aria-labelledby="profile-name">
      <div className={`grid ${styles.profileInner}`}>
        <div ref={portrait} className={styles.profilePortrait}>
          <PortraitGL name={member.name.value} label={alt(member)} src={member.portrait || undefined} className={styles.canvas} />
        </div>
        <div className={styles.profileCopy}>
          <p className={styles.mask}>
            <span data-line className={styles.profileRole}>
              {member.group} <span aria-hidden="true">/</span> <Fact f={member.role} />
            </span>
          </p>
          <h2 id="profile-name" className={styles.mask}>
            <span data-line className={styles.profileName}>
              <Fact f={member.name} />
            </span>
          </h2>
          <p className={styles.mask}>
            <span data-line className={styles.profileQuote}>
              <Fact f={member.quote} />
            </span>
          </p>
          <p className={styles.mask}>
            <span data-line className={styles.profileBio}>
              <Fact f={member.bio} />
            </span>
          </p>
          {member.email && (
            <p className={styles.mask}>
              <span data-line>
                <TextLink href={`mailto:${member.email.value}`}>
                  <Fact f={member.email} />
                </TextLink>
              </span>
            </p>
          )}
        </div>
      </div>
      <div className={styles.profileNav}>
        <button type="button" onClick={() => onStep(-1)} className={styles.navBtn} data-cursor="hover">
          Previous
        </button>
        <button type="button" onClick={() => onStep(1)} className={styles.navBtn} data-cursor="hover">
          Next
        </button>
        <button type="button" onClick={onClose} className={styles.close} data-close data-cursor="hover">
          Close <span aria-hidden="true">(Esc)</span>
        </button>
      </div>
    </div>
  );
}

function TeamList() {
  const params = useSearchParams();
  const [openSlug, setOpenSlug] = useState<string | null>(() => {
    const m = params.get("member");
    return m && team.some((t) => t.slug === m) ? m : null;
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hover, setHover] = useState<Member | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  const plate = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const coarse = useMedia("(pointer: coarse)");

  // Deep link: /team?member=slug opens the profile directly
  useEffect(() => {
    if (openSlug) useStore.getState().set({ profileOpen: true });
    // only on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: DUR.standard, ease: EASE.out });
    const yTo = gsap.quickTo(el, "y", { duration: DUR.standard, ease: EASE.out });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX + 32);
      yTo(e.clientY - el.offsetHeight / 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (plate.current)
      gsap.to(plate.current, { opacity: hover ? 1 : 0, scale: hover ? 1 : 0.94, duration: hover ? DUR.standard : DUR.micro, ease: EASE.out });
  }, [hover]);

  const open = (m: Member, el: HTMLElement) => {
    opener.current = el;
    const r = plate.current && hover ? plate.current.getBoundingClientRect() : el.getBoundingClientRect();
    setFrom(new DOMRect(r.left, r.top, Math.min(r.width, 280), Math.min(r.height, 350)));
    setHover(null);
    setOpenSlug(m.slug);
    useStore.getState().set({ profileOpen: true });
    window.history.replaceState(null, "", `/team?member=${m.slug}`);
  };

  const close = useCallback(() => {
    setOpenSlug(null);
    useStore.getState().set({ profileOpen: false });
    window.history.replaceState(null, "", "/team");
    opener.current?.focus({ preventScroll: true });
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    setOpenSlug((cur) => {
      const i = team.findIndex((t) => t.slug === cur);
      const next = team[(i + dir + team.length) % team.length];
      window.history.replaceState(null, "", `/team?member=${next.slug}`);
      return next.slug;
    });
    setFrom(null);
  }, []);

  useEffect(() => () => useStore.getState().set({ profileOpen: false }), []);

  const member = team.find((t) => t.slug === openSlug);

  return (
    <>
      <ol className={styles.list}>
        {team.map((m, i) => {
          const isExp = expanded === m.slug;
          return (
            <li key={m.slug} className={`${styles.row} ${isExp ? styles.rowOpen : ""}`}>
              <button
                type="button"
                className={styles.rowBtn}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(m)}
                onPointerLeave={() => setHover(null)}
                onClick={(e) => {
                  if (coarse) setExpanded(isExp ? null : m.slug);
                  else open(m, e.currentTarget);
                }}
                aria-expanded={coarse ? isExp : undefined}
                aria-haspopup={coarse ? undefined : "dialog"}
                data-cursor="label"
                data-cursor-label="Open"
              >
                <span className={styles.idx}>({String(i + 1).padStart(2, "0")})</span>
                <span className={styles.name}>
                  <Fact f={m.name} />
                </span>
                <span className={styles.role}>
                  <Fact f={m.role} />
                </span>
              </button>
              {isExp && (
                <div className={styles.inline}>
                  <div className={styles.inlinePortrait}>
                    <PortraitGL name={m.name.value} label={alt(m)} src={m.portrait || undefined} className={styles.canvas} />
                  </div>
                  <p className={styles.inlineBio}>
                    <Fact f={m.bio} />
                  </p>
                  <button type="button" className={styles.navBtn} onClick={(e) => open(m, e.currentTarget)}>
                    Full profile
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div ref={plate} className={styles.plate} aria-hidden="true">
        {hover && <PortraitGL name={hover.name.value} src={hover.portrait || undefined} className={styles.canvas} />}
      </div>
      {member && <Profile member={member} from={from} onClose={close} onStep={step} />}
    </>
  );
}

export default function TeamView() {
  return (
    <>
      <Section theme="soil" className={styles.opening}>
        <div className={`grid ${styles.openingInner}`}>
          <Label>Team</Label>
          <DisplayText as="h1" text={teamPage.title} size="xl" className={styles.h1} />
          <Reveal className={styles.intro}>
            <p data-reveal-item>{teamPage.intro}</p>
          </Reveal>
        </div>
      </Section>

      <Section theme="soil" className={styles.names} aria-label="Team members">
        <Suspense fallback={null}>
          <TeamList />
        </Suspense>
      </Section>

      <Section theme="soil" className={styles.values} aria-labelledby="values-title">
        <div className={`grid ${styles.valuesInner}`}>
          <div className={styles.valuesHead}>
            <Label index="02">How we work</Label>
            <DisplayText id="values-title" text="Four rules we *keep*." size="m" />
          </div>
          <Reveal as="ol" className={styles.valuesList}>
            {teamPage.values.map((v, i) => (
              <li key={v.title} data-reveal-item className={styles.value}>
                <span className={styles.valueNum}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </Section>

      <Section theme="soil" className={styles.join} aria-labelledby="join-title">
        <div className={`grid ${styles.joinInner}`}>
          <DisplayText id="join-title" text="Work with us, or *work* for us." size="l" className={styles.joinTitle} />
          <Reveal className={styles.joinRow}>
            <p data-reveal-item>{teamPage.careersLine}</p>
            <div data-reveal-item>
              <TextLink href={`mailto:${contact.careersEmail.value}`} arrow>
                <Fact f={contact.careersEmail} />
              </TextLink>
            </div>
            <div data-reveal-item>
              <Button href="/contact">Request a Quote</Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
