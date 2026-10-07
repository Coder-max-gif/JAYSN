import { fact } from "./types";

export const company = {
  /** Given in the brief by the client. Always written exactly like this. */
  legalName: fact("JAYSN AGRO INDIA PRIVATE LIMITED", true, "Brief"),
  wordmark: "JAYSN AGRO",
  region: fact("Maharashtra, India", true, "Brief"),
  tagline: fact("Ground to globe.", false, "Working line. Confirm or replace with the client tagline"),
  established: fact("2019", false, "Year of incorporation, confirm with certificate"),
  summary: fact(
    "We make fertilizer and cattle feed in Maharashtra and move agricultural goods between India and ports abroad. Both ends of the farm, one company, one set of documents.",
    false,
    "Client to approve company paragraph",
  ),
  port: fact("Nhava Sheva (JNPT), Navi Mumbai", false, "Usual port of loading"),
  /** Coordinates used by the globe for the home port region */
  portCoords: { lat: 18.95, lon: 72.95 },
  registeredAddress: fact(
    "Registered office address, Maharashtra, India",
    false,
    "Full registered address from the incorporation certificate",
  ),
  gst: fact("GSTIN to be supplied", false),
  iec: fact("IEC to be supplied", false),
  certifications: [] as { name: string; verified: boolean }[],
  social: {
    linkedin: fact("", false),
    instagram: fact("", false),
    facebook: fact("", false),
    youtube: fact("", false),
  },
  siteUrl: "https://jaysnagro.com",
  copyrightYear: 2026,
};
