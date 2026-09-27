import { NextRequest, NextResponse } from "next/server";
import { chatShoppingAssistant } from "@/lib/gemini";
import type { StoreProduct, StoreConfig } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { userQuery, history, products, storeConfig } = await req.json() as {
            userQuery: string;
            history?: { role: string; content: string }[];
            products: StoreProduct[];
            storeConfig: StoreConfig;
        };

        if (!userQuery || typeof userQuery !== "string") {
            return NextResponse.json(
                { error: "userQuery is required." },
                { status: 400 }
            );
        }

        if (!products || !Array.isArray(products)) {
            return NextResponse.json(
                { error: "products catalog array is required." },
                { status: 400 }
            );
        }

        const response = await chatShoppingAssistant(
            userQuery,
            history || [],
            products,
            storeConfig || { storeName: "Store" }
        );

        return NextResponse.json(response);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Shopping assistant error";
        console.error("[/api/chat-assistant]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
