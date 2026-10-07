import { enquirySchema } from "@/lib/enquirySchema";
import { company } from "@/content/company";

/**
 * Quote enquiries. Validates again on the server, drops honeypot hits, rate limits per IP and
 * sends an email through Resend (RESEND_API_KEY) or any SMTP relay with an HTTP API.
 * Keys stay on the server. See /env.example.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

const esc = (s = "") => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function reference() {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `JA-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many enquiries from this connection. Please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "We could not read the form." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Some fields need a look.", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const e = parsed.data;
  const ref = reference();

  // Honeypot: pretend success, send nothing
  if (e.website) return Response.json({ ok: true, reference: ref });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO;
  const from = process.env.ENQUIRY_FROM ?? "JAYSN AGRO website <website@jaysnagro.com>";

  const rows: [string, string | undefined][] = [
    ["Reference", ref],
    ["Name", e.name],
    ["Company", e.company],
    ["Country", e.country],
    ["Service", e.service],
    ["Product", e.product],
    ["Quantity", [e.quantity, e.unit].filter(Boolean).join(" ")],
    ["Packaging", e.packaging],
    ["Email", e.email],
    ["WhatsApp", e.whatsapp],
    ["Message", e.message],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n");
  const html = `<h2 style="font-family:Georgia,serif">New ${esc(e.service)} enquiry, ${esc(e.product)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666;border-bottom:1px solid #eee">${esc(k)}</td><td style="border-bottom:1px solid #eee">${esc(v || "-")}</td></tr>`)
    .join("")}</table>`;

  if (!key || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[enquiry] email not configured, logging instead\n${text}`);
      return Response.json({ ok: true, reference: ref, dev: true });
    }
    console.error("[enquiry] RESEND_API_KEY or ENQUIRY_TO missing");
    return Response.json({ ok: false, error: "Our form is not connected yet." }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        reply_to: e.email || undefined,
        subject: `[${ref}] ${e.service === "export" ? "Export" : "Import"} enquiry: ${e.product} from ${e.company || e.name}`,
        text: `${text}\n\nSent from the ${company.legalName.value} website.`,
        html,
      }),
    });
    if (!res.ok) throw new Error(`resend ${res.status}`);
  } catch (err) {
    console.error("[enquiry] send failed", err);
    return Response.json({ ok: false, error: "The enquiry did not go through." }, { status: 502 });
  }

  return Response.json({ ok: true, reference: ref });
}
