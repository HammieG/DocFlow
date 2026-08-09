import { NextResponse } from "next/server";
import { z } from "zod";
import { formatDocument } from "@/lib/document";
import { prisma } from "@/lib/prisma";
const input = z.object({ title: z.string().trim().max(120).optional(), type: z.string().trim().min(2).max(40), rawText: z.string().trim().min(10).max(50000) });
export async function POST(request: Request) { try { const values = input.parse(await request.json()); const formatted = await formatDocument(values.rawText, values.type); const document = await prisma.document.create({ data: { title: values.title || formatted.title, type: values.type, rawText: values.rawText, formattedJson: JSON.stringify(formatted) } }); return NextResponse.json({ id: document.id }); } catch (error) { const message = error instanceof z.ZodError ? error.issues[0]?.message : "Unable to create the document."; return NextResponse.json({ error: message }, { status: 400 }); } }
