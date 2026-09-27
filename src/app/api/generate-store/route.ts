import { NextRequest, NextResponse } from "next/server";
import { generateStoreBranding } from "@/lib/gemini";
import type { StoreProduct } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { storeName, products } = (await req.json()) as {
            storeName: string;
            products: StoreProduct[];
        };

        if (!storeName || typeof storeName !== "string") {
            return NextResponse.json(
                { error: "storeName is required." },
                { status: 400 }
            );
        }

        const config = await generateStoreBranding(storeName, products || []);

        return NextResponse.json({ config });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[/api/generate-store]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
