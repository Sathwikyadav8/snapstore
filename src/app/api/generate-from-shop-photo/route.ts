import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteFromShopPhoto } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { imageBase64, mimeType, storeName } = (await req.json()) as {
            imageBase64: string;
            mimeType: string;
            storeName?: string;
        };

        if (!imageBase64 || !mimeType) {
            return NextResponse.json(
                { error: "imageBase64 and mimeType are required." },
                { status: 400 }
            );
        }

        const { config, products } = await generateWebsiteFromShopPhoto(
            imageBase64,
            mimeType,
            storeName
        );

        return NextResponse.json({ config, products });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[/api/generate-from-shop-photo]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
