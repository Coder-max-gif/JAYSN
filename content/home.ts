import { fact, type Figure } from "./types";

/** Emphasis: wrap a word in *asterisks* to set it in display italic. */

export const home = {
  meta: {
    title: "Fertilizer and cattle feed manufacturer, import and export from India",
    description:
      "JAYSN AGRO INDIA PRIVATE LIMITED makes fertilizer and cattle feed in Maharashtra and handles import and export of agricultural goods through Nhava Sheva.",
  },
  preloaderCaption: "Pune to port, port to the world",
  hero: {
    label: "Import and export, fertilizer and cattle feed",
    headline: "From the soil of *Maharashtra* to ports around the world.",
    body: "We manufacture fertilizer and cattle feed, then pack, document and ship them. Buyers deal with one company from the plant gate to the container seal.",
    primary: { label: "Request a Quote", href: "/contact" },
    secondary: { label: "WhatsApp Us" },
  },
  loopCaption: "Fertilizer feeds soil. Soil grows feed. Feed raises cattle. Cattle return to soil.",
  chapters: [
    {
      id: "soil",
      index: "01",
      name: "Soil",
      theme: "soil",
      title: "Every bag starts in the *furrow*.",
      body: "Our fertilizer is made to dissolve at the root, not wash off the field. Even granule size spreads evenly from a broadcaster, so a farmer gets the same dose on the last row as the first.",
      figure: {
        value: fact("12,000", false, "Annual fertilizer capacity in tonnes"),
        unit: "tonnes a year",
        caption: "Fertilizer capacity",
      } satisfies Figure,
      link: { label: "See fertilizer", href: "/products/fertilizer" },
      plate: { caption: "Video: bagging line, granules filling a 50 kg bag", ratio: "4 / 5" },
    },
    {
      id: "stock",
      index: "02",
      name: "Stock",
      theme: "clay",
      title: "Feed that a herd *finishes*.",
      body: "Cattle feed for dairy cows, heifers and working animals. Balanced protein and energy in a pellet that holds together in the trough and does not turn to dust in the bag.",
      figure: {
        value: fact("20", false, "Crude protein percentage of the main dairy pellet"),
        unit: "% crude protein",
        caption: "Dairy pellet, typical",
      } satisfies Figure,
      link: { label: "See cattle feed", href: "/products/cattle-feed" },
      plate: { caption: "Photo: cattle at the trough, morning light", ratio: "3 / 2" },
    },
    {
      id: "trade",
      index: "03",
      name: "Trade",
      theme: "sea",
      title: "Out through *Nhava Sheva*. In from where the price is right.",
      body: "We export our own products and other Indian agricultural goods, and we import raw materials and finished goods for Indian buyers. Containers, documents and inspection are handled in house.",
      figure: {
        value: fact("14", false, "Number of destination countries served"),
        unit: "countries",
        caption: "Shipped to so far",
      } satisfies Figure,
      link: { label: "Import and export", href: "/services" },
      plate: { caption: "Photo: container stuffing at the yard, dusk", ratio: "16 / 9" },
    },
    {
      id: "people",
      index: "04",
      name: "People",
      theme: "soil",
      title: "The people who *answer* the phone.",
      body: "A small team that runs production, quality, documents and freight. You talk to the person doing the work.",
      figure: {
        value: fact("40", false, "Headcount across plant and office"),
        unit: "people",
        caption: "Plant and office",
      } satisfies Figure,
      link: { label: "Meet the team", href: "/team" },
    },
    {
      id: "quote",
      index: "05",
      name: "Quote",
      theme: "soil",
      title: "Tell us what you need to *move*.",
      body: "Product, quantity, port. That is enough to start. We reply with a price basis and a loading date.",
      link: { label: "Request a Quote", href: "/contact" },
    },
  ],
} as const;

export type HomeChapter = (typeof home.chapters)[number];
