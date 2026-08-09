export type FormattedDocument = { title: string; preamble?: string; sections: { heading: string; body: string }[] };
export const documentTypes = ["Contract", "NDA", "Offer letter", "Proposal", "Invoice", "Other"] as const;

export function fallbackFormat(rawText: string, type: string): FormattedDocument {
  const blocks = rawText.trim().split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const first = blocks[0]?.split("\n")[0]?.trim() || `${type} document`;
  return {
    title: first.length < 90 ? first.replace(/[.:-]+$/, "") : `${type} document`,
    preamble: `${type} prepared with DocFlow.`,
    sections: (blocks.length ? blocks : [rawText]).map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const heading = lines[0] || `Section ${index + 1}`;
      const isHeading = lines.length > 1 && heading.length < 80;
      return { heading: index === 0 ? "Overview" : isHeading ? heading.replace(/^\d+[.)]\s*/, "") : `Section ${index + 1}`, body: (isHeading ? lines.slice(1) : lines).join("\n") || "Details to be agreed by the parties." };
    }),
  };
}

function clean(value: unknown, raw: string, type: string): FormattedDocument {
  const candidate = value as Partial<FormattedDocument>;
  const sections = Array.isArray(candidate?.sections) ? candidate.sections.filter((section): section is { heading: string; body: string } => typeof section?.heading === "string" && typeof section?.body === "string").slice(0, 20) : [];
  return typeof candidate?.title === "string" && sections.length ? { title: candidate.title.slice(0, 120), preamble: typeof candidate.preamble === "string" ? candidate.preamble.slice(0, 500) : undefined, sections } : fallbackFormat(raw, type);
}

export async function formatDocument(raw: string, type: string): Promise<FormattedDocument> {
  if (!process.env.GROQ_API_KEY) return fallbackFormat(raw, type);
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", temperature: 0.2, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "Return JSON only: {title,preamble,sections:[{heading,body}]}. Format a business document cleanly. Preserve all facts; never invent terms." },
        { role: "user", content: `Document type: ${type}\n\nRaw text:\n${raw}` },
      ] }),
    });
    if (!response.ok) throw new Error(`Groq ${response.status}`);
    const output = await response.json() as { choices?: { message?: { content?: string } }[] };
    return clean(JSON.parse(output.choices?.[0]?.message?.content || "{}"), raw, type);
  } catch (error) { console.warn("AI formatting failed; using local formatter.", error); return fallbackFormat(raw, type); }
  finally { clearTimeout(timeout); }
}
export const parseFormatted = (json: string) => JSON.parse(json) as FormattedDocument;
