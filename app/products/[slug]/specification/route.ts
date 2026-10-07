import { getProduct, products } from "@/content/products";
import { company } from "@/content/company";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

/**
 * Placeholder specification sheet. Builds a one page PDF on the fly that says the real sheet is
 * still to be supplied. Replace by dropping the client's PDF into /public/docs/specs and
 * pointing the button at it.
 */
function pdf(lines: string[]) {
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const text = lines.map((l, i) => `BT /F1 ${i === 0 ? 20 : 11} Tf 56 ${i === 0 ? 780 : 750 - i * 22} Td (${esc(l)}) Tj ET`).join("\n");
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (out += `${String(o).padStart(10, "0")} 00000 n \n`));
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return out;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return new Response("Not found", { status: 404 });
  const body = pdf([
    `${p.name} specification sheet`,
    company.legalName.value,
    "PLACEHOLDER. The signed specification sheet will be supplied by the client.",
    ...p.specs.map((s) => `${s.label}: ${s.value.value}${s.value.verified ? "" : " (to be confirmed)"}`),
  ]);
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="jaysn-agro-${p.slug}-specification.pdf"`,
    },
  });
}
