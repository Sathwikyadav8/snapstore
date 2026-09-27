import { NextRequest, NextResponse } from "next/server";
import { translateStoreContent } from "@/lib/gemini";
import type { StoreConfig, StoreProduct, SupportedLanguage } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { config, products, targetLang } = await req.json() as {
            config: StoreConfig;
            products: StoreProduct[];
            targetLang: SupportedLanguage;
        };

        if (!targetLang) {
            return NextResponse.json(
                { error: "targetLang is required." },
                { status: 400 }
            );
        }

        const result = await translateStoreContent(config, products, targetLang);

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Translation service error";
        console.error("[/api/translate]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
