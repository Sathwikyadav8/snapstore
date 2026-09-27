import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteFromBusinessDescription } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, storeName } = (await req.json()) as {
            businessDescription: string;
            storeName?: string;
        };

        if (!businessDescription || typeof businessDescription !== "string") {
            return NextResponse.json(
                { error: "businessDescription text is required." },
                { status: 400 }
            );
        }

        const { config, products } = await generateWebsiteFromBusinessDescription(
            businessDescription,
            storeName
        );

        return NextResponse.json({ config, products });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[/api/generate-from-business-description]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
