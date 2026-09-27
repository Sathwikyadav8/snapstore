import { NextRequest, NextResponse } from "next/server";
import { extractBrandDNA } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { images, brandDescription } = await req.json();

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: "At least one reference image is required for Brand DNA extraction." },
                { status: 400 }
            );
        }

        const brandDna = await extractBrandDNA(images, brandDescription);

        return NextResponse.json({ brandDna });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to extract Brand DNA";
        console.error("[/api/extract-brand-dna]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
