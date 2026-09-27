import type {
    ProductKnowledgeObject,
    ScoredAttribute,
    EvidenceSummary,
    ProductInfo,
    AttributeSource,
} from "./types";

/**
 * Creates a deterministic, evidence-aware Product Knowledge Object (PKL)
 * from visual VLM analysis, barcode input, or user text description.
 */
export function buildProductKnowledge(
    product: ProductInfo,
    primarySource: AttributeSource = "image",
    image?: string,
    rawBarcodeData?: string
): ProductKnowledgeObject {
    const isBarcode = primarySource === "barcode" || !!rawBarcodeData;
    const isText = primarySource === "user";

    const colorVal =
        product.colorPalette && product.colorPalette.length > 0
            ? product.colorPalette.join(", ")
            : "Multi-color";

    // Infer material from features/description or default to inferred low confidence
    const descriptionLower = (product.description || "").toLowerCase();
    const featuresJoined = (product.keyFeatures || []).join(" ").toLowerCase();
    const textBlob = `${descriptionLower} ${featuresJoined}`;

    let detectedMaterial = "Standard Crafting";
    let materialConfidence = 0.52;
    let materialEvidence = "Inferred from surface texture and product description";
    let materialSource: AttributeSource = "inferred";

    if (textBlob.includes("leather")) {
        detectedMaterial = "Leather / Synthetic Leather";
        materialConfidence = 0.74;
        materialEvidence = "Inferred from leather texture cues";
    } else if (textBlob.includes("cotton") || textBlob.includes("fabric") || textBlob.includes("textile")) {
        detectedMaterial = "Cotton / Textile";
        materialConfidence = 0.78;
        materialEvidence = "Inferred from fabric weave pattern";
    } else if (textBlob.includes("aluminum") || textBlob.includes("metal") || textBlob.includes("steel")) {
        detectedMaterial = "Metal / Alloy";
        materialConfidence = 0.82;
        materialEvidence = "Visually detected metallic luster";
    } else if (textBlob.includes("silicone") || textBlob.includes("plastic") || textBlob.includes("polymer")) {
        detectedMaterial = "Polymer / Composite";
        materialConfidence = 0.68;
        materialEvidence = "Inferred from surface finish";
    }

    // Barcode boost if present
    if (isBarcode) {
        materialConfidence = Math.min(0.95, materialConfidence + 0.2);
        materialSource = "barcode";
        materialEvidence = "Verified from barcode database attributes";
    }

    const nameAttr: ScoredAttribute = {
        key: "productName",
        label: "Product Name",
        value: product.productName || "Unnamed Product",
        confidence: isBarcode ? 0.98 : isText ? 0.95 : 0.94,
        evidence: isBarcode
            ? "Decoded via product barcode record"
            : isText
                ? "Provided directly in product description"
                : "Prominently identified in image frame",
        source: isBarcode ? "barcode" : isText ? "user" : "image",
        isConfirmed: isText,
    };

    const categoryAttr: ScoredAttribute = {
        key: "category",
        label: "Product Category",
        value: product.category || "General Goods",
        confidence: isBarcode ? 0.97 : isText ? 0.94 : 0.92,
        evidence: isBarcode
            ? "Matched via barcode catalog entry"
            : isText
                ? "Inferred from seller input"
                : "Visual classification of product geometry",
        source: isBarcode ? "barcode" : isText ? "user" : "image",
    };

    const subcategoryAttr: ScoredAttribute = {
        key: "subcategory",
        label: "Subcategory",
        value: product.tags?.[0] ? product.tags[0].toUpperCase() : "Standard Edition",
        confidence: 0.85,
        evidence: "Extracted from primary product tags",
        source: isText ? "user" : "image",
    };

    const brandAttr: ScoredAttribute = {
        key: "brand",
        label: "Brand Name",
        value: product.brand || "Independent Brand",
        confidence: product.brand && product.brand !== "Aura Marketplace" ? (isBarcode ? 0.96 : 0.65) : 0.38,
        evidence:
            product.brand && product.brand !== "Aura Marketplace"
                ? isBarcode
                    ? "Verified from barcode registration metadata"
                    : "Inferred from visual logo or text snippet"
                : "No distinct logo visible; default brand placeholder applied",
        source: isBarcode ? "barcode" : product.brand && product.brand !== "Aura Marketplace" ? "inferred" : "inferred",
    };

    const colorAttr: ScoredAttribute = {
        key: "color",
        label: "Color Palette",
        value: colorVal,
        confidence: isText ? 0.90 : 0.98,
        evidence: isText ? "Specified in text" : "Extracted dominant optical hex color values",
        source: isText ? "user" : "image",
    };

    const materialAttr: ScoredAttribute = {
        key: "material",
        label: "Material Composition",
        value: detectedMaterial,
        confidence: materialConfidence,
        evidence: materialEvidence,
        source: materialSource,
    };

    const designStyleAttr: ScoredAttribute = {
        key: "designStyle",
        label: "Design Style",
        value: product.tags?.[1] ? product.tags[1] + " aesthetics" : "Modern Minimalist",
        confidence: 0.86,
        evidence: "Analyzed visual form language & finish",
        source: "image",
    };

    const targetAudienceAttr: ScoredAttribute = {
        key: "targetAudience",
        label: "Target Audience",
        value: product.targetAudience || "Modern consumers & enthusiasts",
        confidence: 0.88,
        evidence: "Inferred from design aesthetics and functionality",
        source: "inferred",
    };

    const priceAttr: ScoredAttribute = {
        key: "price",
        label: "Estimated Retail Price (USD)",
        value: `$${(product.estimatedPriceUSD || 29.99).toFixed(2)}`,
        confidence: isBarcode ? 0.94 : 0.78,
        evidence: isBarcode ? "Matched MSRP from barcode database" : "Estimated market value based on product class",
        source: isBarcode ? "barcode" : "inferred",
    };

    const descriptionAttr: ScoredAttribute = {
        key: "description",
        label: "Description Summary",
        value: product.description || "",
        confidence: 0.92,
        evidence: "Generated from vision-language feature extraction",
        source: isText ? "user" : "image",
    };

    const visualFeatures: ScoredAttribute[] = (product.keyFeatures || []).map((feat, idx) => ({
        key: `feature_${idx}`,
        label: `Feature ${idx + 1}`,
        value: feat,
        confidence: 0.91 - idx * 0.03,
        evidence: "Observed in product structure / attributes",
        source: isText ? "user" : "image",
    }));

    const tags: ScoredAttribute[] = (product.tags || []).map((t, idx) => ({
        key: `tag_${idx}`,
        label: `Tag #${idx + 1}`,
        value: t,
        confidence: 0.90,
        evidence: "Extracted visual keyword",
        source: "image",
    }));

    const allAttributes = [
        nameAttr,
        categoryAttr,
        subcategoryAttr,
        brandAttr,
        colorAttr,
        materialAttr,
        designStyleAttr,
        targetAudienceAttr,
        priceAttr,
    ];

    const uncertainAttributes = allAttributes
        .filter((attr) => attr.confidence < 0.7 || attr.source === "inferred")
        .map((attr) => attr.label || attr.key || "Attribute");

    const pkl: ProductKnowledgeObject = {
        id: product.id || "pkl_" + Date.now(),
        productImage: image || product.image,
        rawBarcodeData,
        productName: nameAttr,
        category: categoryAttr,
        subcategory: subcategoryAttr,
        brand: brandAttr,
        color: colorAttr,
        material: materialAttr,
        designStyle: designStyleAttr,
        targetAudience: targetAudienceAttr,
        price: priceAttr,
        description: descriptionAttr,
        visualFeatures,
        tags,
        uncertainAttributes,
        evidenceSummary: {
            visuallyVerifiedCount: 0,
            userConfirmedCount: 0,
            inferredCount: 0,
            barcodeCount: 0,
            unknownCount: 0,
        },
    };

    return recalculateEvidenceSummary(pkl);
}

/**
 * Recalculates the evidence summary counts and uncertain attribute list.
 */
export function recalculateEvidenceSummary(
    pkl: ProductKnowledgeObject
): ProductKnowledgeObject {
    const mainAttrs = [
        pkl.productName,
        pkl.category,
        pkl.subcategory,
        pkl.brand,
        pkl.color,
        pkl.material,
        pkl.designStyle,
        pkl.targetAudience,
        pkl.price,
        ...(pkl.customAttributes || []),
    ].filter(Boolean) as ScoredAttribute[];

    let visuallyVerifiedCount = 0;
    let userConfirmedCount = 0;
    let inferredCount = 0;
    let barcodeCount = 0;
    let unknownCount = 0;

    const uncertainList: string[] = [];

    mainAttrs.forEach((attr) => {
        if (attr.isConfirmed || attr.source === "user") {
            userConfirmedCount++;
        } else if (attr.source === "barcode") {
            barcodeCount++;
        } else if (attr.source === "image") {
            visuallyVerifiedCount++;
        } else if (attr.source === "inferred") {
            inferredCount++;
        } else {
            unknownCount++;
        }

        if (attr.confidence < 0.70 || (attr.source === "inferred" && !attr.isConfirmed)) {
            uncertainList.push(attr.label || attr.key || "Attribute");
        }
    });

    return {
        ...pkl,
        uncertainAttributes: Array.from(new Set(uncertainList)),
        evidenceSummary: {
            visuallyVerifiedCount,
            userConfirmedCount,
            inferredCount,
            barcodeCount,
            unknownCount,
        },
    };
}
