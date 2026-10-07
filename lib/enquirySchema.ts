import { z } from "zod";

/** Shared by the form (client) and the route handler (server). Messages are plain words. */
export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "Please tell us your name.").max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    country: z.string().trim().max(80).optional().or(z.literal("")),
    product: z.enum(["fertilizer", "cattle-feed", "both", "other"], { message: "Choose a product." }),
    service: z.enum(["export", "import"], { message: "Choose import or export." }),
    quantity: z.string().trim().max(40).optional().or(z.literal("")),
    unit: z.string().trim().max(40).optional().or(z.literal("")),
    packaging: z.string().trim().max(80).optional().or(z.literal("")),
    email: z.string().trim().max(160).optional().or(z.literal("")),
    whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().max(4000).optional().or(z.literal("")),
    /** Honeypot. Real people never see or fill this. */
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    const email = v.email ?? "";
    const wa = v.whatsapp ?? "";
    if (!email && !wa) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email or a WhatsApp number so we can reply." });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "That email address does not look right." });
    }
    if (wa && !/^\+?[\d\s()-]{7,20}$/.test(wa)) {
      ctx.addIssue({ code: "custom", path: ["whatsapp"], message: "Use digits only, with the country code, for example +971 50 123 4567." });
    }
  });

export type Enquiry = z.infer<typeof enquirySchema>;
