"use client";

import { useRef } from "react";
import { home } from "@/content/home";
import { team } from "@/content/team";
import { destinations, origins } from "@/content/services";
import { useStore } from "@/store/useStore";
import Section from "@/components/layout/Section";
import DisplayText from "@/components/ui/DisplayText";
import Label from "@/components/ui/Label";
import Reveal from "@/components/ui/Reveal";
import TextLink from "@/components/ui/TextLink";
import Button from "@/components/ui/Button";
import ImagePlate from "@/components/ui/ImagePlate";
import FigureStat from "@/components/ui/FigureStat";
import GoldLine from "@/components/ui/GoldLine";
import FlatRouteMap from "@/components/sections/FlatRouteMap";
import HomeHero from "./HomeHero";
import ChapterIndicator from "./ChapterIndicator";
import LoopLine from "./LoopLine";
import PeopleNames from "./PeopleNames";
import { useHomeRail } from "./useHomeRail";
import styles from "./HomeStory.module.css";

const [soil, stock, trade, people, quote] = home.chapters;

function ChapterHead({ index, name }: { index: string; name: string }) {
  return (
    <div className={styles.head}>
      <Label index={index}>{name}</Label>
      <GoldLine />
    </div>
  );
}

export default function HomeStory() {
  const root = useRef<HTMLDivElement>(null);
  useHomeRail(root);
  const webgl2 = useStore((s) => s.webgl2);

  return (
    <div ref={root} className={styles.story}>
      <LoopLine />
      <ChapterIndicator />

      <Section as="div" theme="soil" className={styles.heroWrap} data-hero="">
        <HomeHero />
      </Section>

      {/* 01 Soil */}
      <Section theme="soil" className={`${styles.chapter} ${styles.soil}`} aria-labelledby="ch-soil">
        <div className={`grid ${styles.inner}`}>
          <div className={`${styles.copy} ${styles.copyLeft}`}>
            <ChapterHead index={soil.index} name={soil.name} />
            <DisplayText id="ch-soil" text={soil.title} size="l" />
            <Reveal className={styles.body}>
              <p data-reveal-item>{soil.body}</p>
              {"figure" in soil && (
                <div data-reveal-item>
                  <FigureStat figure={soil.figure} />
                </div>
              )}
              <div data-reveal-item>
                <TextLink href={soil.link.href} arrow>
                  {soil.link.label}
                </TextLink>
              </div>
            </Reveal>
          </div>
          <div className={styles.plateRight}>
            {"plate" in soil && <ImagePlate caption={soil.plate.caption} ratio={soil.plate.ratio} />}
          </div>
        </div>
      </Section>

      {/* 02 Stock */}
      <Section theme="clay" className={`${styles.chapter} ${styles.stock}`} aria-labelledby="ch-stock">
        <div className={`grid ${styles.inner}`}>
          <div className={styles.plateLeft}>
            {"plate" in stock && <ImagePlate caption={stock.plate.caption} ratio={stock.plate.ratio} displace />}
          </div>
          <div className={`${styles.copy} ${styles.copyRight}`}>
            <ChapterHead index={stock.index} name={stock.name} />
            <DisplayText id="ch-stock" text={stock.title} size="l" />
            <Reveal className={styles.body}>
              <p data-reveal-item>{stock.body}</p>
              {"figure" in stock && (
                <div data-reveal-item>
                  <FigureStat figure={stock.figure} />
                </div>
              )}
              <div data-reveal-item>
                <TextLink href={stock.link.href} arrow>
                  {stock.link.label}
                </TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 03 Trade */}
      <Section theme="sea" className={`${styles.chapter} ${styles.trade}`} aria-labelledby="ch-trade">
        <div className={`grid ${styles.inner}`}>
          <div className={`${styles.copy} ${styles.copyLeft}`}>
            <ChapterHead index={trade.index} name={trade.name} />
            <DisplayText id="ch-trade" text={trade.title} size="m" />
            <Reveal className={styles.body}>
              <p data-reveal-item>{trade.body}</p>
              <div data-reveal-item>
                <TextLink href={trade.link.href} arrow>
                  {trade.link.label}
                </TextLink>
              </div>
            </Reveal>
          </div>
          <div className={styles.tradePlate}>
            {"plate" in trade && <ImagePlate caption={trade.plate.caption} ratio={trade.plate.ratio} />}
          </div>
          <div className={styles.routes}>
            {!webgl2 && <FlatRouteMap className={styles.flatMap} />}
            <Reveal className={styles.routeCols}>
              <div data-reveal-item>
                <Label gold>Outbound</Label>
                <ul className={styles.routeList}>
                  {destinations.map((d) => (
                    <li key={d.id}>
                      {d.port}, {d.name}
                      {!d.verified && <sup className={styles.tbc}>TBC</sup>}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-reveal-item>
                <Label>Inbound</Label>
                <ul className={styles.routeList}>
                  {origins.map((d) => (
                    <li key={d.id}>
                      {d.port}, {d.name}
                      {!d.verified && <sup className={styles.tbc}>TBC</sup>}
                    </li>
                  ))}
                </ul>
              </div>
              {"figure" in trade && (
                <div data-reveal-item>
                  <FigureStat figure={trade.figure} />
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 04 People */}
      <Section theme="soil" className={`${styles.chapter} ${styles.people}`} aria-labelledby="ch-people">
        <div className={`grid ${styles.inner}`}>
          <div className={styles.peopleHead}>
            <ChapterHead index={people.index} name={people.name} />
            <DisplayText id="ch-people" text={people.title} size="m" />
          </div>
          <PeopleNames members={team.slice(0, 3)} />
          <Reveal className={styles.peopleFoot}>
            <p data-reveal-item>{people.body}</p>
            {"figure" in people && (
              <div data-reveal-item>
                <FigureStat figure={people.figure} />
              </div>
            )}
            <div data-reveal-item>
              <TextLink href={people.link.href} arrow>
                {people.link.label}
              </TextLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 05 Quote */}
      <Section theme="soil" className={`${styles.chapter} ${styles.quote}`} aria-labelledby="ch-quote">
        <div className={`grid ${styles.inner}`}>
          <div className={styles.quoteCopy}>
            <ChapterHead index={quote.index} name={quote.name} />
            <DisplayText id="ch-quote" text={quote.title} size="xl" />
            <Reveal className={styles.quoteRow}>
              <p data-reveal-item>{quote.body}</p>
              <div data-reveal-item>
                <Button href={quote.link.href}>{quote.link.label}</Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}
