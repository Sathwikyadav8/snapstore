import { NextRequest, NextResponse } from "next/server";
import { generateStoreBranding } from "@/lib/gemini";
import type { ProductInfo } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { product, storeName } = (await req.json()) as { product: ProductInfo; storeName?: string };

    const name = storeName || product?.brand || "My Snap Store";
    const config = await generateStoreBranding(name, product ? [product as any] : []);

    return NextResponse.json({ config, site: config });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/generate-site]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

