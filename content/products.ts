import { fact, type Fact } from "./types";

export interface Product {
  slug: "fertilizer" | "cattle-feed";
  index: string;
  name: string;
  descriptor: string;
  variantsCount: Fact<string>;
  statement: string;
  meta: { title: string; description: string };
  bag: { weight: Fact<string>; line: string };
  overview: string[];
  specs: { label: string; value: Fact<string> }[];
  variants: { name: string; body: Fact<string> }[];
  usesTitle: string;
  uses: { who: string; how: Fact<string> }[];
  packaging: { label: string; value: Fact<string> }[];
  process: { title: string; body: string }[];
  plateCaption: string;
}

export const products: Product[] = [
  {
    slug: "fertilizer",
    index: "01",
    name: "Fertilizer",
    descriptor: "Granular NPK and organic blends for field crops and horticulture.",
    variantsCount: fact("4 grades", false),
    statement: "Even granules. Even *dose*. Every row.",
    meta: {
      title: "Fertilizer manufacturer and exporter, India",
      description:
        "Granular NPK and organic fertilizer made in Maharashtra by JAYSN AGRO INDIA PRIVATE LIMITED. Specifications, grades, packing and export loading.",
    },
    bag: { weight: fact("50 KG", false), line: "NPK 19 : 19 : 19" },
    overview: [
      "Our fertilizer is a granular blend made for broadcast and drill application. Granules are screened to a narrow size band, so they flow through a spreader without bridging and land evenly across the field.",
      "Each batch is tested for nutrient content and moisture before bagging. Bags carry the batch number, so any sample can be traced back to the day it was made.",
    ],
    specs: [
      { label: "Composition", value: fact("N 19%, P2O5 19%, K2O 19% (main grade)", false) },
      { label: "Form", value: fact("Granular, 2 to 4 mm", false) },
      { label: "Colour", value: fact("Off white to light grey", false) },
      { label: "Moisture", value: fact("1.0% maximum", false) },
      { label: "Packing", value: fact("25 kg and 50 kg HDPE laminated bags", false) },
      { label: "Shelf life", value: fact("24 months in a dry, covered store", false) },
    ],
    variants: [
      { name: "NPK 19 : 19 : 19", body: fact("Balanced grade for basal dose in cereals and vegetables.", false) },
      { name: "NPK 12 : 32 : 16", body: fact("Phosphorus heavy grade for root set in pulses and oilseeds.", false) },
      { name: "NPK 10 : 26 : 26", body: fact("Potash rich grade for sugarcane, banana and fruit crops.", false) },
      { name: "Organic manure granules", body: fact("Composted, screened and granulated. Improves soil structure in tired fields.", false) },
    ],
    usesTitle: "By crop and soil",
    uses: [
      { who: "Cereals", how: fact("Basal dose at sowing for wheat, maize and paddy, drilled with the seed.", false) },
      { who: "Sugarcane", how: fact("Split application at planting and earthing up, potash rich grade.", false) },
      { who: "Horticulture", how: fact("Ring application around fruit trees before the monsoon.", false) },
      { who: "Low organic soils", how: fact("Organic granules worked in before sowing to hold moisture.", false) },
    ],
    packaging: [
      { label: "Bag sizes", value: fact("25 kg, 50 kg, jumbo 1 tonne", false) },
      { label: "Pallet", value: fact("40 bags of 25 kg, stretch wrapped, 1 tonne", false) },
      { label: "20-foot container", value: fact("About 25 tonnes, 500 bags of 50 kg", false) },
      { label: "Export packing", value: fact("Inner liner, printed export marks, fumigated pallets on request", false) },
    ],
    process: [
      { title: "Raw material check", body: "Each incoming lot is sampled and tested before it enters the mixing line." },
      { title: "Blend and granulate", body: "Measured raw materials are blended, granulated and dried at controlled temperature." },
      { title: "Screen and test", body: "Granules are screened to size. The batch is tested for nutrients and moisture." },
      { title: "Bag and trace", body: "Bags are filled by weight, stitched and printed with the batch number." },
    ],
    plateCaption: "Video: granules running over a screen, macro",
  },
  {
    slug: "cattle-feed",
    index: "02",
    name: "Cattle Feed",
    descriptor: "Compound pellets and mash for dairy cows, heifers and working cattle.",
    variantsCount: fact("3 formulas", false),
    statement: "Pellets that hold. A herd that *milks*.",
    meta: {
      title: "Cattle feed manufacturer and exporter, India",
      description:
        "Compound cattle feed pellets for dairy cows, heifers and working cattle, made in Maharashtra by JAYSN AGRO INDIA PRIVATE LIMITED. Nutrition, formulas and packing.",
    },
    bag: { weight: fact("50 KG", false), line: "DAIRY PELLET 20" },
    overview: [
      "Our cattle feed is a compound pellet made from grain, oilseed cake, bran and minerals. It is pressed hard enough to survive transport and soft enough for animals to take readily.",
      "Formulas are set for the stage of the animal: a dairy cow in milk needs a different balance from a growing heifer. We print the feeding guide on every bag.",
    ],
    specs: [
      { label: "Crude protein", value: fact("20% minimum (dairy pellet)", false) },
      { label: "Crude fat", value: fact("3% minimum", false) },
      { label: "Crude fibre", value: fact("12% maximum", false) },
      { label: "Form", value: fact("Pellet, 6 to 8 mm", false) },
      { label: "Moisture", value: fact("11% maximum", false) },
      { label: "Packing", value: fact("50 kg PP woven bags", false) },
      { label: "Shelf life", value: fact("3 months in a dry, ventilated store", false) },
    ],
    variants: [
      { name: "Dairy Pellet 20", body: fact("For cows in milk. Higher protein for yield and fat.", false) },
      { name: "Heifer Grower", body: fact("For growing heifers from six months to first calving.", false) },
      { name: "Bypass Fat Supplement", body: fact("Top dressing for high yielders in early lactation.", false) },
    ],
    usesTitle: "By animal and stage",
    uses: [
      { who: "Dairy cows in milk", how: fact("About 400 g of pellet per litre of milk, split over two feeds.", false) },
      { who: "Dry cows", how: fact("1 to 2 kg a day in the last two months before calving.", false) },
      { who: "Heifers", how: fact("1.5 to 2.5 kg a day with good roughage.", false) },
      { who: "Working cattle", how: fact("2 kg a day in the working season.", false) },
    ],
    packaging: [
      { label: "Bag sizes", value: fact("25 kg and 50 kg", false) },
      { label: "Pallet", value: fact("20 bags of 50 kg, 1 tonne", false) },
      { label: "20-foot container", value: fact("About 22 tonnes, 440 bags of 50 kg", false) },
      { label: "Export packing", value: fact("Laminated bags with liner, moisture absorbers in the container", false) },
    ],
    process: [
      { title: "Ingredient intake", body: "Grain, cake and bran are checked for moisture and aflatoxin on arrival." },
      { title: "Grind and mix", body: "Ingredients are ground and mixed to the formula with minerals and vitamins." },
      { title: "Condition and pellet", body: "Steam conditioning, then pressing through the die and cooling." },
      { title: "Test and bag", body: "Each batch is tested for protein and moisture, then bagged and coded." },
    ],
    plateCaption: "Video: pellets falling from the cooler, warm light",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
