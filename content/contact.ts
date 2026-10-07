import { fact } from "./types";

export const contact = {
  heading: "Tell us what you *need* to move.",
  intro:
    "Send the product, the quantity and the port. We reply with a price basis, packing options and a loading date. If something is missing we ask, we do not guess.",
  email: fact("info@jaysnagro.com", false, "From the client template"),
  phone: fact("+91 98765 43210", false, "From the client template"),
  /** Digits only, for wa.me links */
  whatsapp: fact("919876543210", false, "From the client template"),
  careersEmail: fact("careers@jaysnagro.com", false),
  address: fact(
    "Office address to be supplied, Maharashtra, India",
    false,
    "Office or plant address for the map",
  ),
  mapsQuery: "Maharashtra, India",
  hours: fact("Monday to Saturday, 9:30 to 18:30 IST", false),
  replyTime: fact("one working day", false, "Promised reply time to a quote request"),
  whatsappMessage: "Hello JAYSN AGRO. I would like a quotation.",
};

export const PRODUCT_OPTIONS = [
  { value: "fertilizer", label: "Fertilizer" },
  { value: "cattle-feed", label: "Cattle Feed" },
  { value: "both", label: "Both" },
  { value: "other", label: "Other" },
] as const;

export const SERVICE_OPTIONS = [
  { value: "export", label: "Export" },
  { value: "import", label: "Import" },
] as const;

export const UNIT_OPTIONS = ["Metric tonnes", "Bags", "20-foot containers", "40-foot containers"] as const;

export const PACKAGING_OPTIONS = [
  "25 kg bags",
  "50 kg bags",
  "Jumbo bags (1 tonne)",
  "Bulk",
  "Not sure yet",
] as const;
