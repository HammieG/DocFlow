import type { FormattedDocument } from "./document";
const escapePdf = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "?");
const wrap = (text: string, width = 84) => text.replace(/\n/g, " ").split(/\s+/).reduce<string[]>((lines, word) => { const current = lines.at(-1) || ""; if (`${current} ${word}`.trim().length > width) lines.push(word); else lines[lines.length - 1] = `${current} ${word}`.trim(); return lines; }, [""]);
export function documentPdf(title: string, formatted: FormattedDocument, signer?: string | null, signedAt?: Date | null) {
  const rows = [title.toUpperCase(), "", ...(formatted.preamble ? wrap(formatted.preamble) : []), "", ...formatted.sections.flatMap((section) => [section.heading.toUpperCase(), ...wrap(section.body), ""]), signer ? `SIGNED BY: ${signer}` : "", signedAt ? `SIGNED AT: ${signedAt.toISOString()}` : ""];
  const content = ["BT", "/F1 18 Tf", "72 760 Td", `(${escapePdf(rows[0])}) Tj`, "/F1 10 Tf", ...rows.slice(1).flatMap((row) => ["0 -16 Td", `(${escapePdf(row)}) Tj`]), "ET"].join("\n");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`];
  let pdf = "%PDF-1.4\n"; const offsets = [0]; objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const start = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(pdf);
}
