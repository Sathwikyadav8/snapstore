import { NextRequest, NextResponse } from "next/server";
import {
  identifyProduct,
  identifyProductFromText,
  identifyProductFromBarcode,
} from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, textDescription, barcodeData, brandDna } = body;

    let product;

    if (barcodeData && typeof barcodeData === "string" && barcodeData.trim().length > 0) {
      product = await identifyProductFromBarcode(barcodeData.trim(), brandDna);
    } else if (textDescription && typeof textDescription === "string" && textDescription.trim().length > 0) {
      product = await identifyProductFromText(textDescription, brandDna);
    } else if (imageBase64 && typeof imageBase64 === "string") {
      product = await identifyProduct(
        imageBase64,
        typeof mimeType === "string" ? mimeType : "image/jpeg",
        brandDna
      );
    } else {
      return NextResponse.json(
        { error: "Image, text description, or barcode input is required." },
        { status: 400 }
      );
    }

    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/identify]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
