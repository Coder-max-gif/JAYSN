import Section from "@/components/layout/Section";
import Label from "@/components/ui/Label";
import DisplayText from "@/components/ui/DisplayText";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import ImagePlate from "@/components/ui/ImagePlate";
import GoldLine from "@/components/ui/GoldLine";
import Fact from "@/components/ui/Fact";
import Wordmark from "@/components/ui/Wordmark";
import FigureStat from "@/components/ui/FigureStat";
import { fact } from "@/content/types";
import styles from "./StyleGuide.module.css";

const COLORS = ["soil", "loam", "moss", "grain", "bone", "clay", "sea"];
const SEMANTIC = ["bg", "surface", "text", "text-dim", "text-faint", "line", "line-strong", "accent"];
const TYPE = [
  ["Display XL", "t-display-xl", "Feed"],
  ["Display L", "t-display-l", "Ground to globe"],
  ["Display M", "t-display-m", "Out through Nhava Sheva"],
  ["Heading", "t-heading", "Pellets that hold together"],
  ["Body L", "t-body-l", "We manufacture fertilizer and cattle feed, then pack, document and ship them."],
  ["Label", "t-label", "(01) Import and export"],
  ["Caption", "t-caption", "Photo: warehouse loading, to be supplied"],
];
const SPACE = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MOTION = [
  ["Entrance", "expo.out", "--ease-out"],
  ["Scrub", "power3.inOut", "--ease-in-out"],
  ["Exit", "expo.in", "--ease-in"],
  ["Micro", "0.3s", "--dur-micro"],
  ["Standard", "0.8s", "--dur-standard"],
  ["Large", "1.2s", "--dur-large"],
  ["X large", "1.6s", "--dur-xlarge"],
];

export default function StyleGuide() {
  return (
    <Section theme="soil" className={styles.page}>
      <div className="grid">
        <header className={styles.head}>
          <Label index="00">Style guide, development only</Label>
          <DisplayText as="h1" text="The *system*." size="l" />
          <p className={styles.dim}>Press g for the grid overlay and d for frame stats.</p>
        </header>

        <section className={styles.block}>
          <Label index="01">Colour</Label>
          <div className={styles.swatches}>
            {COLORS.map((c) => (
              <div key={c} className={styles.swatch}>
                <span style={{ background: `var(--${c})` }} />
                <code>--{c}</code>
              </div>
            ))}
          </div>
          <div className={styles.swatches}>
            {SEMANTIC.map((c) => (
              <div key={c} className={styles.swatch}>
                <span style={{ background: `var(--${c})` }} />
                <code>--{c}</code>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <Label index="02">Type</Label>
          {TYPE.map(([name, cls, sample]) => (
            <div key={name} className={styles.typeRow}>
              <code>{name}</code>
              <p className={cls}>{sample}</p>
            </div>
          ))}
        </section>

        <section className={styles.block}>
          <Label index="03">Spacing</Label>
          {SPACE.map((n) => (
            <div key={n} className={styles.spaceRow}>
              <code>--space-{n}</code>
              <span style={{ width: `var(--space-${n})` }} />
            </div>
          ))}
        </section>

        <section className={styles.block}>
          <Label index="04">Motion</Label>
          <dl className={styles.motion}>
            {MOTION.map(([a, b, c]) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>
                  {b} <code>{c}</code>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.block}>
          <Label index="05">Interactive</Label>
          <div className={styles.row}>
            <Button href="/contact">Request a Quote</Button>
            <Button href="/contact" variant="quiet">
              Quiet link
            </Button>
            <Button disabled>Disabled</Button>
            <TextLink href="/services" arrow>
              Text link
            </TextLink>
          </div>
          <div className={styles.row}>
            <Wordmark />
            <span>
              Unverified fact: <Fact f={fact("12,000 tonnes", false, "Example")} />
            </span>
          </div>
          <div className={styles.figure}>
            <FigureStat figure={{ value: fact("25", false), unit: "tonnes per 20-foot", caption: "Example figure" }} />
          </div>
          <GoldLine />
        </section>

        <section className={styles.block}>
          <Label index="06">Image plates</Label>
          <div className={styles.plates}>
            <ImagePlate caption="Photo: warehouse loading, to be supplied" ratio="4 / 5" />
            <ImagePlate caption="Photo: container stuffing, to be supplied" ratio="3 / 2" displace />
            <ImagePlate caption="Video: bagging line, to be supplied" ratio="16 / 9" />
          </div>
        </section>
      </div>
    </Section>
  );
}
