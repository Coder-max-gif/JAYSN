/**
 * Lists every company fact in /content that is not verified yet.
 * With STRICT_CONTENT=1 it exits with code 1 when any exist, which blocks `npm run build:production`.
 * Every fact in /content is rendered somewhere on the site, so any unverified fact would be shown.
 *
 *   npm run check:content
 */
import { company } from "../content/company";
import { contact } from "../content/contact";
import { home } from "../content/home";
import { services, destinations, origins } from "../content/services";
import { products } from "../content/products";
import { team } from "../content/team";

type Found = { path: string; value: unknown; note?: string };

function walk(node: unknown, path: string, out: Found[]) {
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  if ("value" in o && "verified" in o && typeof o.verified === "boolean") {
    // Empty optional facts (for example social links without a URL) are hidden in the UI
    const empty = o.value === "" || (Array.isArray(o.value) && o.value.length === 0);
    if (!o.verified && !empty) out.push({ path, value: o.value, note: o.note as string | undefined });
    return;
  }
  // Regions carry a verified flag of their own
  if ("verified" in o && typeof o.verified === "boolean" && "name" in o && "lat" in o) {
    if (!o.verified) out.push({ path, value: `${o.port}, ${o.name}` });
    return;
  }
  for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k, out);
}

const found: Found[] = [];
walk({ company, contact, home, services, destinations, origins, products, team }, "", found);

const strict = process.env.STRICT_CONTENT === "1";
if (!found.length) {
  console.log("All company facts are verified.");
  process.exit(0);
}

console.log(`${found.length} unverified facts:\n`);
for (const f of found) {
  const v = Array.isArray(f.value) ? f.value.join(" | ") : String(f.value);
  console.log(`  ${f.path}\n      ${v.length > 110 ? v.slice(0, 107) + "..." : v}${f.note ? `\n      note: ${f.note}` : ""}`);
}
console.log(
  `\nConfirm each with the client, then set verified: true in /content. ${
    strict ? "STRICT_CONTENT=1: failing the build." : "Run with STRICT_CONTENT=1 to fail on these."
  }`,
);
process.exit(strict ? 1 : 0);
