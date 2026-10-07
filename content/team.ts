import { fact, type Fact } from "./types";

export interface Member {
  slug: string;
  name: Fact<string>;
  role: Fact<string>;
  group: string;
  bio: Fact<string>;
  quote: Fact<string>;
  /** Path under /public/media/team. Empty until the client supplies the photograph. */
  portrait: string;
  email?: Fact<string>;
  linkedin?: Fact<string>;
}

/** Development placeholders. All names and roles must be replaced by the real team. */
export const team: Member[] = [
  {
    slug: "rajesh-patil",
    name: fact("Rajesh Patil", false, "Placeholder name"),
    role: fact("Managing Director", false),
    group: "Leadership",
    bio: fact(
      "Rajesh set up the company to make fertilizer for farms around Pune and grew it into a trading house. He still signs off every new export market himself.",
      false,
    ),
    quote: fact("If we cannot load it on time, we say so on the first call.", false),
    portrait: "",
    email: fact("rajesh@jaysnagro.com", false),
  },
  {
    slug: "sneha-kulkarni",
    name: fact("Sneha Kulkarni", false, "Placeholder name"),
    role: fact("Director, International Trade", false),
    group: "Sales and trade",
    bio: fact(
      "Sneha runs buyer relationships across the Gulf and East Africa. She prices every export enquiry and follows each container until it clears.",
      false,
    ),
    quote: fact("A good quote answers the next three questions too.", false),
    portrait: "",
  },
  {
    slug: "amit-deshmukh",
    name: fact("Amit Deshmukh", false, "Placeholder name"),
    role: fact("Head of Operations", false),
    group: "Operations",
    bio: fact(
      "Amit runs the plant floor and the warehouse. Production schedules, dispatch and container stuffing all go through him.",
      false,
    ),
    quote: fact("The bag count on the truck must match the paper.", false),
    portrait: "",
  },
  {
    slug: "priya-shinde",
    name: fact("Dr. Priya Shinde", false, "Placeholder name"),
    role: fact("Quality Manager", false),
    group: "Quality",
    bio: fact(
      "Priya holds a doctorate in soil science and runs the in house lab. No batch leaves without her test report.",
      false,
    ),
    quote: fact("Numbers on the bag should be numbers from the lab.", false),
    portrait: "",
  },
  {
    slug: "vikram-jadhav",
    name: fact("Vikram Jadhav", false, "Placeholder name"),
    role: fact("Logistics Lead", false),
    group: "Logistics",
    bio: fact(
      "Vikram books vessels, trucks and container slots at Nhava Sheva. He knows which line is running late before the line does.",
      false,
    ),
    quote: fact("A missed cut off costs a week. We do not miss them.", false),
    portrait: "",
  },
  {
    slug: "kavita-joshi",
    name: fact("Kavita Joshi", false, "Placeholder name"),
    role: fact("Documentation Manager", false),
    group: "Documentation",
    bio: fact(
      "Kavita prepares invoices, certificates of origin and letters of credit paperwork. Buyers get draft documents before anything is filed.",
      false,
    ),
    quote: fact("Clean documents clear cargo. Messy ones hold it.", false),
    portrait: "",
  },
];

export const teamPage = {
  meta: {
    title: "Team",
    description:
      "The people who run production, quality, documents and freight at JAYSN AGRO INDIA PRIVATE LIMITED.",
  },
  title: "The *people* behind every load.",
  intro:
    "Production, quality, documents and freight sit in one building. When you call, the person who answers is the person doing the work. Nothing is handed to a third desk.",
  values: [
    { title: "We answer first.", body: "If a date moves, the buyer hears it from us before anyone asks." },
    { title: "The lab decides.", body: "A batch ships when the test report says it can, not when the truck arrives." },
    { title: "Paper is cargo.", body: "Documents are checked as carefully as the goods, because ports hold both." },
    { title: "Small team, full stack.", body: "Production to port under one roof, so nothing falls between companies." },
  ],
  careersLine: "We hire for the plant, the lab and the trade desk.",
};
