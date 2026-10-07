import { fact, type Fact } from "./types";

export interface Region {
  id: string;
  name: string;
  port: string;
  lat: number;
  lon: number;
  verified: boolean;
  /** Optional globe label offset in rem, to keep clustered ports readable */
  label?: [number, number];
}

/** Export destinations. All unverified until the client confirms where it actually ships. */
export const destinations: Region[] = [
  { id: "uae", name: "United Arab Emirates", port: "Jebel Ali", lat: 25.01, lon: 55.06, verified: false, label: [-15.5, -0.4] },
  { id: "saudi", name: "Saudi Arabia", port: "Dammam", lat: 26.43, lon: 50.1, verified: false, label: [-13, -1.8] },
  { id: "oman", name: "Oman", port: "Sohar", lat: 24.36, lon: 56.75, verified: false, label: [0.9, 0.9] },
  { id: "kenya", name: "Kenya", port: "Mombasa", lat: -4.05, lon: 39.67, verified: false },
  { id: "bangladesh", name: "Bangladesh", port: "Chattogram", lat: 22.3, lon: 91.8, verified: false },
  { id: "srilanka", name: "Sri Lanka", port: "Colombo", lat: 6.95, lon: 79.85, verified: false },
  { id: "vietnam", name: "Vietnam", port: "Cat Lai", lat: 10.77, lon: 106.78, verified: false },
];

/** Import origins. All unverified. */
export const origins: Region[] = [
  { id: "china", name: "China", port: "Qingdao", lat: 36.07, lon: 120.38, verified: false },
  { id: "morocco", name: "Morocco", port: "Jorf Lasfar", lat: 33.1, lon: -8.63, verified: false },
  { id: "russia", name: "Russia", port: "Novorossiysk", lat: 44.72, lon: 37.77, verified: false },
  { id: "indonesia", name: "Indonesia", port: "Tanjung Priok", lat: -6.1, lon: 106.88, verified: false },
];

export interface SpecRow {
  label: string;
  value: Fact<string | string[]>;
}

export const services = {
  meta: {
    title: "Import and export of fertilizer, cattle feed and agro products",
    description:
      "Export of fertilizer, cattle feed and Indian agricultural goods from Nhava Sheva, and import of raw materials for Indian buyers. Specifications, documents and process.",
  },
  intro: {
    label: "Services",
    title: "Two directions. One set of *hands* on the cargo.",
  },
  doors: [
    {
      id: "import",
      index: "01",
      word: "Import",
      line: "Raw materials and finished goods, sourced abroad and delivered inside India.",
    },
    {
      id: "export",
      index: "02",
      word: "Export",
      line: "Our fertilizer, our cattle feed and Indian agro goods, loaded at Nhava Sheva.",
    },
  ],
  export: {
    index: "02",
    title: "Export from *India*",
    paragraphs: [
      "We ship our own fertilizer and cattle feed, and source other Indian agricultural goods to order. Every load is packed, weighed and sealed under our supervision.",
      "You get one contact for production, inspection, documents and freight. If a vessel slips, you hear it from us first.",
    ],
    specs: [
      {
        label: "Products",
        value: fact(["Fertilizer", "Cattle feed", "Other Indian agro goods to order"], false),
      },
      { label: "Minimum order", value: fact("One 20-foot container, about 25 tonnes", false) },
      { label: "Packaging", value: fact(["25 kg and 50 kg PP bags", "Jumbo bags, 1 tonne", "Private label on request"], false) },
      { label: "Loading", value: fact(["20-foot containers", "40-foot containers", "Bagged or bulk"], false) },
      {
        label: "Documents",
        value: fact(
          [
            "Commercial invoice",
            "Packing list",
            "Certificate of origin",
            "Bill of lading",
            "Phytosanitary certificate where required",
            "Third party inspection report on request",
          ],
          false,
          "Each document to be confirmed by the client",
        ),
      },
      { label: "Port of loading", value: fact("Nhava Sheva (JNPT)", false) },
      { label: "Terms", value: fact(["FOB", "CFR", "CIF"], false) },
    ] satisfies SpecRow[],
  },
  import: {
    index: "01",
    title: "Import into *India*",
    paragraphs: [
      "We buy raw materials and finished goods from producers abroad and deliver them to factories, dealers and farms in India. We check the cargo before it leaves the origin port.",
      "Customs clearance, port handling and domestic trucking are arranged by us, so the buyer receives goods at the gate, not paperwork at the port.",
    ],
    specs: [
      {
        label: "What we source",
        value: fact(["Fertilizer raw materials", "Feed ingredients", "Finished fertilizer grades"], false),
      },
      { label: "Origins", value: fact(["China", "Morocco", "Russia", "Indonesia"], false) },
      {
        label: "Quality inspection",
        value: fact("Pre shipment sampling at origin, test report before payment balance", false),
      },
      { label: "Handling", value: fact("Customs clearance and port handling at Nhava Sheva", false) },
      { label: "Domestic delivery", value: fact("Trucked to your warehouse anywhere in Maharashtra and neighbouring states", false) },
    ] satisfies SpecRow[],
  },
  process: [
    {
      id: "enquiry",
      title: "Enquiry",
      body: "You send product, quantity, packing and destination port. We confirm what we can supply and ask for anything missing. A price basis follows within a working day.",
    },
    {
      id: "production",
      title: "Sourcing or production",
      body: "For our own products, the batch is scheduled at the plant. For traded goods, we fix the supplier and lock the price. You get a loading window, not a vague promise.",
    },
    {
      id: "quality",
      title: "Quality check",
      body: "Samples are drawn from the lot and tested against the agreed specification. The report goes to you before loading. Third party inspection can be added.",
    },
    {
      id: "documents",
      title: "Documentation",
      body: "Invoice, packing list, certificate of origin and any certificates your country needs are prepared in house. Drafts are shared for approval before anything is filed.",
    },
    {
      id: "freight",
      title: "Freight and port",
      body: "Containers are stuffed and sealed under our eye and trucked to Nhava Sheva. We book the vessel and send the bill of lading once it sails.",
    },
    {
      id: "delivery",
      title: "Delivery",
      body: "We track the vessel to the destination port and stay on the line until the cargo is cleared. For imports, we deliver to your gate.",
    },
  ],
  faq: [
    {
      q: "What are your payment terms?",
      a: fact("Usually 30 percent advance and the balance against copy documents, or a confirmed letter of credit at sight.", false),
    },
    {
      q: "What is the smallest order you take?",
      a: fact("One 20-foot container for export, about 25 tonnes. Smaller trial lots are possible for first orders.", false),
    },
    {
      q: "Can I get samples before ordering?",
      a: fact("Yes. We send a 1 kg sample by courier. The courier cost is adjusted against your first order.", false),
    },
    {
      q: "Which shipping terms do you quote?",
      a: fact("FOB Nhava Sheva by default, and CFR or CIF to your port on request.", false),
    },
    {
      q: "Which documents come with the shipment?",
      a: fact("Commercial invoice, packing list, certificate of origin and bill of lading as standard. Phytosanitary and analysis certificates when your country needs them.", false),
    },
    {
      q: "How long from order to loading?",
      a: fact("Two to three weeks for our own products after advance payment. Traded goods depend on the supplier and we give a date when we confirm.", false),
    },
  ],
  closing: {
    title: "Ready to price a *load*?",
  },
};
