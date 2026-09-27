import { GoogleGenAI, Type } from "@google/genai";
import type {
  ProductInfo,
  StoreConfig,
  StoreProduct,
  BrandDNA,
  SupportedLanguage,
  ChatMessage,
  RecommendedProductWithReason,
} from "./types";
import { buildProductKnowledge } from "./knowledgeEngine";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  return new GoogleGenAI({ apiKey });
}

async function callGeminiWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 35000,
  actionLabel: string = "Gemini API request"
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${actionLabel} timed out after 35 seconds. Please check your connection or try again.`));
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([fn(), timeoutPromise]);
    clearTimeout(timer!);
    return res;
  } catch (err: any) {
    clearTimeout(timer!);
    if (err.message && (err.message.includes("GEMINI_API_KEY") || err.message.includes("timed out"))) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${actionLabel} failed: ${msg}`);
  }
}

const productSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    brand: { type: Type.STRING },
    category: { type: Type.STRING },
    description: { type: Type.STRING },
    keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    estimatedPriceUSD: { type: Type.NUMBER },
    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
    targetAudience: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "productName",
    "brand",
    "category",
    "description",
    "keyFeatures",
    "estimatedPriceUSD",
    "colorPalette",
    "targetAudience",
    "tags",
  ],
};

const storeBrandingSchema = {
  type: Type.OBJECT,
  properties: {
    tagline: { type: Type.STRING },
    heroHeadline: { type: Type.STRING },
    heroSubheadline: { type: Type.STRING },
    aboutText: { type: Type.STRING },
    themeColor: { type: Type.STRING },
    accentColor: { type: Type.STRING },
    layoutStyle: {
      type: Type.STRING,
      enum: [
        "cyber",
        "minimal",
        "organic",
        "editorial",
        "monochrome",
        "nordic",
        "luxe",
        "neo",
        "futuristic",
        "zen",
      ],
    },
    colorSystem: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING },
        secondary: { type: Type.STRING },
        accent: { type: Type.STRING },
        background: { type: Type.STRING },
        surface: { type: Type.STRING },
        text: { type: Type.STRING },
        mutedText: { type: Type.STRING },
        border: { type: Type.STRING },
        cta: { type: Type.STRING },
      },
      required: [
        "primary",
        "secondary",
        "accent",
        "background",
        "surface",
        "text",
        "mutedText",
        "border",
        "cta",
      ],
    },
    typographyConfig: {
      type: Type.OBJECT,
      properties: {
        headingFont: {
          type: Type.STRING,
          enum: ["serif", "sans", "mono", "geometric", "display"],
        },
        bodyFont: {
          type: Type.STRING,
          enum: ["sans", "mono", "serif"],
        },
        stylePersonality: { type: Type.STRING },
      },
      required: ["headingFont", "bodyFont", "stylePersonality"],
    },
    designDecision: {
      type: Type.OBJECT,
      properties: {
        brandPersonality: { type: Type.STRING },
        heroLayout: {
          type: Type.STRING,
          enum: [
            "split",
            "fullbleed",
            "editorial",
            "minimal",
            "asymmetric",
            "spotlight",
          ],
        },
        primaryCtaText: { type: Type.STRING },
        secondaryCtaText: { type: Type.STRING },
        announcementText: { type: Type.STRING },
        storyTitle: { type: Type.STRING },
        storySubtitle: { type: Type.STRING },
        spotlightHeadline: { type: Type.STRING },
        spotlightSubtitle: { type: Type.STRING },
        newsletterHeadline: { type: Type.STRING },
        newsletterSubheadline: { type: Type.STRING },
        valueProps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              icon: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["icon", "title", "description"],
          },
        },
      },
      required: [
        "brandPersonality",
        "heroLayout",
        "primaryCtaText",
        "secondaryCtaText",
        "announcementText",
        "storyTitle",
        "storySubtitle",
        "spotlightHeadline",
        "spotlightSubtitle",
        "newsletterHeadline",
        "newsletterSubheadline",
      ],
    },
    footerText: { type: Type.STRING },
    testimonials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quote: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          role: { type: Type.STRING },
        },
        required: ["name", "quote", "rating"],
      },
    },
    faq: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: [
    "tagline",
    "heroHeadline",
    "heroSubheadline",
    "aboutText",
    "themeColor",
    "accentColor",
    "layoutStyle",
    "colorSystem",
    "typographyConfig",
    "designDecision",
    "footerText",
    "testimonials",
    "faq",
  ],
};

const brandDnaSchema = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING },
    visualIdentity: {
      type: Type.OBJECT,
      properties: {
        primaryColor: { type: Type.STRING },
        secondaryColor: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        backgroundColor: { type: Type.STRING },
        contrastProfile: { type: Type.STRING },
      },
      required: [
        "primaryColor",
        "secondaryColor",
        "accentColor",
        "backgroundColor",
        "contrastProfile",
      ],
    },
    typography: {
      type: Type.OBJECT,
      properties: {
        headingStyle: { type: Type.STRING },
        bodyStyle: { type: Type.STRING },
        personality: { type: Type.STRING },
        recommendedFont: { type: Type.STRING },
      },
      required: [
        "headingStyle",
        "bodyStyle",
        "personality",
        "recommendedFont",
      ],
    },
    designLanguage: {
      type: Type.OBJECT,
      properties: {
        stylePersonality: {
          type: Type.STRING,
          enum: [
            "cyber",
            "minimal",
            "organic",
            "editorial",
            "monochrome",
            "nordic",
            "luxe",
            "neo",
            "futuristic",
            "zen",
          ],
        },
        layoutCharacteristics: { type: Type.STRING },
        cardStyle: { type: Type.STRING },
        borderStyle: { type: Type.STRING },
        buttonStyle: { type: Type.STRING },
        shadowUsage: { type: Type.STRING },
        imagePresentationStyle: { type: Type.STRING },
      },
      required: [
        "stylePersonality",
        "layoutCharacteristics",
        "cardStyle",
        "borderStyle",
        "buttonStyle",
        "shadowUsage",
        "imagePresentationStyle",
      ],
    },
    brandCommunication: {
      type: Type.OBJECT,
      properties: {
        brandTone: { type: Type.STRING },
        writingStyle: { type: Type.STRING },
        targetAudience: { type: Type.STRING },
        productPresentationStyle: { type: Type.STRING },
      },
      required: [
        "brandTone",
        "writingStyle",
        "targetAudience",
        "productPresentationStyle",
      ],
    },
  },
  required: [
    "brandName",
    "visualIdentity",
    "typography",
    "designLanguage",
    "brandCommunication",
  ],
};

const shoppingAssistantResponseSchema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
    parsedQuery: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING },
        maxPrice: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        useCase: { type: Type.STRING },
        preference: { type: Type.STRING },
      },
    },
    recommendedProductIds: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productId: { type: Type.STRING },
          matchReason: { type: Type.STRING },
        },
        required: ["productId", "matchReason"],
      },
    },
  },
  required: ["message", "recommendedProductIds"],
};

export async function identifyProduct(
  base64Image: string,
  mimeType: string,
  brandDna?: BrandDNA
): Promise<ProductInfo> {
  const ai = getClient();

  const brandConstraint = brandDna
    ? `IMPORTANT: This store is locked to Brand DNA profile: Tone="${brandDna.brandCommunication.brandTone}", Target="${brandDna.brandCommunication.targetAudience}", Colors=${brandDna.visualIdentity.primaryColor}, ${brandDna.visualIdentity.accentColor}. Ensure descriptions reflect this brand personality.`
    : "";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
          {
            text: `You are a precision vision product analyst for VisionCart AI. Look at the photo and extract structured product details. Do NOT invent claims not visible. Respond with accurate observable features. Estimate realistic USD retail price. Provide 3-6 key features, 3-5 visible hex colors, target audience, and lowercase search tags. ${brandConstraint}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: productSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  const productInfo = JSON.parse(text) as ProductInfo;

  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const pkl = buildProductKnowledge(productInfo, "image", dataUrl);
  return {
    ...productInfo,
    productKnowledge: pkl,
  };
}

export async function identifyProductFromText(
  descriptionText: string,
  brandDna?: BrandDNA
): Promise<ProductInfo> {
  const ai = getClient();

  const brandConstraint = brandDna
    ? `IMPORTANT: This store is locked to Brand DNA profile: Tone="${brandDna.brandCommunication.brandTone}", Target="${brandDna.brandCommunication.targetAudience}", Colors=${brandDna.visualIdentity.primaryColor}, ${brandDna.visualIdentity.accentColor}. Ensure descriptions reflect this brand personality.`
    : "";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a senior product manager and ecommerce catalog creator for VisionCart AI. A seller provided the following text description:

TEXT DESCRIPTION:
"${descriptionText}"

${brandConstraint}

Analyze this description and extract complete product metadata:
- productName: clean commercial name
- brand: appropriate brand name
- category: primary category
- description: polished 2-3 sentence description
- keyFeatures: 4-6 key features
- estimatedPriceUSD: realistic USD retail price
- colorPalette: 3-5 hex color codes
- targetAudience: target customer persona
- tags: 4-6 search tags`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: productSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  const productInfo = JSON.parse(text) as ProductInfo;

  const pkl = buildProductKnowledge(productInfo, "user");
  return {
    ...productInfo,
    productKnowledge: pkl,
  };
}

export async function identifyProductFromBarcode(
  barcodeData: string,
  brandDna?: BrandDNA
): Promise<ProductInfo> {
  const ai = getClient();

  const brandConstraint = brandDna
    ? `IMPORTANT: Store locked to Brand DNA profile: Tone="${brandDna.brandCommunication.brandTone}".`
    : "";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a product database lookup system for VisionCart AI.
A user scanned a product barcode / UPC code: "${barcodeData}".
Generate standard verified product metadata matching this GTIN/Barcode:
- productName: verified product name or title for code ${barcodeData}
- brand: brand name associated with code
- category: product category
- description: clear product summary
- keyFeatures: 4-6 verified specifications
- estimatedPriceUSD: standard market retail price
- colorPalette: dominant color hex codes
- targetAudience: target buyer persona
- tags: 4-6 search tags
${brandConstraint}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: productSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty barcode lookup response.");
  const productInfo = JSON.parse(text) as ProductInfo;

  const pkl = buildProductKnowledge(productInfo, "barcode", undefined, barcodeData);
  return {
    ...productInfo,
    productKnowledge: pkl,
  };
}

export async function generateStoreBranding(
  storeName: string,
  products: Partial<StoreProduct>[],
  brandDna?: BrandDNA
): Promise<StoreConfig> {
  const ai = getClient();

  const brandConstraint = brandDna
    ? `STRICT BRAND DNA LOCK ENABLED:
- Visual Personality: ${brandDna.designLanguage.stylePersonality}
- Primary Color: ${brandDna.visualIdentity.primaryColor}
- Secondary Color: ${brandDna.visualIdentity.secondaryColor}
- Accent Color: ${brandDna.visualIdentity.accentColor}
- Tone of Voice: ${brandDna.brandCommunication.brandTone}
- Writing Style: ${brandDna.brandCommunication.writingStyle}
- Target Audience: ${brandDna.brandCommunication.targetAudience}
Generate design decisions and copy strictly matching these Brand DNA parameters.`
    : "";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an executive creative director and senior ecommerce design strategist.
A seller is building a high-end online store named "${storeName}".

Sample Product Catalog Data:
${JSON.stringify(products.slice(0, 5), null, 2)}

${brandConstraint}

CRITICAL COPYWRITING RULES:
- DO NOT generate generic titles such as "Welcome to our store", "Best Products", "Shop Now", "New Collection", "Our Store", "Quality Items".
- ALWAYS generate brand-specific, stylish, punchy, memorable, and high-converting marketing copy!
- Examples of good copy:
  - Hero Headline: "Built for the miles ahead." or "The latest essentials, just dropped." or "Uncompromising precision, reimagined."
  - Hero Subheadline: "Crafted with intentional design and premium materials for daily elevate."
  - Primary CTA: "Explore the Collection" or "Discover the Drop" or "Secure Yours"
  - Secondary CTA: "Our Philosophy" or "View Specifications"
  - Tagline: "Elevated essentials for modern living."
  - Announcement Bar: "Complimentary Express Shipping & Returns Worldwide on Orders Over $100."
  - Brand Story Title: "Made with Intention"
  - Spotlight Headline: "Form Meets Pure Performance"
  - Newsletter Headline: "Join the Inner Circle"
  - Newsletter Subheadline: "Subscribe to receive priority access to limited edition drops and private studio releases."

CRITICAL DESIGN ENGINE RULES:
- Determine a distinct heroLayout: "split", "fullbleed", "editorial", "minimal", "asymmetric", or "spotlight".
- Determine a layoutStyle: "cyber", "minimal", "organic", "editorial", "monochrome", "nordic", "luxe", "neo", "futuristic", or "zen".
- Build a harmonious colorSystem with hex codes for primary, secondary, accent, background, surface, text, mutedText, border, and cta.
- Select a typographyConfig (headingFont: "serif", "sans", "mono", "geometric", or "display").
- Provide 4 high-value proposition items (icons: 🚚, ✨, 🛡️, 🌱, etc.) with title & short description.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: storeBrandingSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  const res = JSON.parse(text);

  return {
    storeName,
    ...res,
    ...(brandDna
      ? {
        themeColor: brandDna.visualIdentity.primaryColor,
        accentColor: brandDna.visualIdentity.accentColor,
        layoutStyle: brandDna.designLanguage.stylePersonality,
        colorSystem: {
          primary: brandDna.visualIdentity.primaryColor,
          secondary: brandDna.visualIdentity.secondaryColor,
          accent: brandDna.visualIdentity.accentColor,
          background: brandDna.visualIdentity.backgroundColor,
          surface: brandDna.visualIdentity.backgroundColor,
          text: brandDna.visualIdentity.contrastProfile === "high-dark" ? "#ffffff" : "#111827",
          mutedText: brandDna.visualIdentity.contrastProfile === "high-dark" ? "#9ca3af" : "#4b5563",
          border: brandDna.visualIdentity.accentColor + "40",
          cta: brandDna.visualIdentity.accentColor,
        },
        brandDna,
        brandDnaLocked: true,
      }
      : {}),
  } as StoreConfig;
}

export async function extractBrandDNA(
  images: { base64: string; mimeType: string }[],
  brandDescription?: string
): Promise<BrandDNA> {
  const ai = getClient();

  const parts: any[] = images.map((img) => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType,
    },
  }));

  parts.push({
    text: `You are an elite Brand Strategy & Visual Identity AI.
Analyze the provided brand assets (logo, product photos, UI screenshots) and optional brand text context below.
Extract a complete, structured Brand DNA Profile covering:
1. Visual Identity (primary/secondary/accent hex colors & contrast)
2. Typography (heading/body styles, personality, font recommendations)
3. Design Language (layout characteristics, card style, borders, buttons, image style, and choose the closest stylePersonality from: ["cyber", "minimal", "organic", "editorial", "monochrome", "nordic", "luxe", "neo", "futuristic", "zen"])
4. Brand Communication (brand tone, writing style, target audience characteristics, product presentation style).

Optional Brand Context: "${brandDescription || "Analyze from visual assets"}"`,
  });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: brandDnaSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini failed to extract Brand DNA.");
  const raw = JSON.parse(text);

  return {
    id: "brand_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    ...raw,
  } as BrandDNA;
}

export async function chatShoppingAssistant(
  userQuery: string,
  history: { role: string; content: string }[],
  products: StoreProduct[],
  storeConfig: StoreConfig
): Promise<{
  message: string;
  recommendations: RecommendedProductWithReason[];
  parsedQuery?: {
    category?: string;
    maxPrice?: number;
    currency?: string;
    useCase?: string;
    preference?: string;
  };
}> {
  const ai = getClient();

  const catalogSummary = products.map((p) => ({
    id: p.id,
    name: p.productName,
    brand: p.brand,
    category: p.category,
    price: p.price,
    description: p.description,
    features: p.keyFeatures,
    inStock: p.inStock,
    colorPalette: p.colorPalette,
    tags: p.tags,
  }));

  const promptText = `You are an intelligent, friendly e-commerce Shopping Assistant for "${storeConfig.storeName}".
Catalog Data available:
${JSON.stringify(catalogSummary, null, 2)}

User Prompt: "${userQuery}"

Task:
1. Parse user intent (Category, Budget/Price Limit, Use Case, Preferences like color/style).
2. Filter the catalog data and select 1-4 best matching products. If user asks follow-up questions ("show cheaper", "only black ones", "compare"), pick products matching the request.
3. For each recommended product, write a clear, helpful 1-2 sentence rationale explaining WHY it matches their specific request.
4. Write a concise, conversational message to the user summarizing your recommendations.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: shoppingAssistantResponseSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Shopping assistant empty response.");
  const parsed = JSON.parse(text);

  const matchedRecs: RecommendedProductWithReason[] = (parsed.recommendedProductIds || [])
    .map((item: { productId: string; matchReason: string }) => {
      const found = products.find((p) => p.id === item.productId);
      if (!found) return null;
      return {
        product: found,
        matchReason: item.matchReason,
      };
    })
    .filter(Boolean) as RecommendedProductWithReason[];

  return {
    message: parsed.message,
    recommendations: matchedRecs,
    parsedQuery: parsed.parsedQuery,
  };
}

export async function translateStoreContent(
  config: StoreConfig,
  products: StoreProduct[],
  targetLang: SupportedLanguage
): Promise<{ config: StoreConfig; products: StoreProduct[] }> {
  if (targetLang === "en") {
    return { config, products };
  }

  const ai = getClient();

  const langNames: Record<SupportedLanguage, string> = {
    en: "English",
    te: "Telugu",
    hi: "Hindi",
    ta: "Tamil",
    kn: "Kannada",
    ml: "Malayalam",
  };

  const payload = {
    storeName: config.storeName,
    tagline: config.tagline,
    heroHeadline: config.heroHeadline,
    heroSubheadline: config.heroSubheadline,
    aboutText: config.aboutText,
    footerText: config.footerText,
    faq: config.faq,
    products: products.map((p) => ({
      id: p.id,
      productName: p.productName,
      category: p.category,
      description: p.description,
      keyFeatures: p.keyFeatures,
    })),
  };

  const promptText = `Translate the following e-commerce storefront text content accurately into ${langNames[targetLang]}.
Maintain brand names, numeric prices, technical specifications, and formatting. Return as JSON matching the input schema.

Input:
${JSON.stringify(payload, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return { config, products };
    const parsed = JSON.parse(text);

    const translatedConfig: StoreConfig = {
      ...config,
      tagline: parsed.tagline || config.tagline,
      heroHeadline: parsed.heroHeadline || config.heroHeadline,
      heroSubheadline: parsed.heroSubheadline || config.heroSubheadline,
      aboutText: parsed.aboutText || config.aboutText,
      footerText: parsed.footerText || config.footerText,
      faq: parsed.faq || config.faq,
      selectedLanguage: targetLang,
    };

    const translatedProducts = products.map((p) => {
      const match = (parsed.products || []).find((t: any) => t.id === p.id);
      if (!match) return p;
      return {
        ...p,
        productName: match.productName || p.productName,
        category: match.category || p.category,
        description: match.description || p.description,
        keyFeatures: match.keyFeatures || p.keyFeatures,
      };
    });

    return { config: translatedConfig, products: translatedProducts };
  } catch (err) {
    console.error("Translation fallback to English:", err);
    return { config: { ...config, selectedLanguage: targetLang }, products };
  }
}

// Map keywords/categories to high resolution studio product photography Unsplash photos
function resolveProductImageUrl(keyword: string, category: string, index: number): string {
  const text = (keyword + " " + category).toLowerCase();

  const presets: { keywords: string[]; urls: string[] }[] = [
    // Bakery & Sourdough
    {
      keywords: ["sourdough", "croissant", "bread", "loaf", "bakery", "pastry", "baguette", "bun", "muffin", "danish"],
      urls: [
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&auto=format&fit=crop&q=85", // Croissants
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=85", // Sourdough loaf
        "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&auto=format&fit=crop&q=85", // Pastries
        "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=1000&auto=format&fit=crop&q=85", // Artisan bread
        "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=1000&auto=format&fit=crop&q=85", // Fresh loaf
      ]
    },
    // Coffee & Tea
    {
      keywords: ["coffee", "espresso", "latte", "roast", "beans", "cappuccino", "brew", "pour-over", "cafe", "tea", "matcha"],
      urls: [
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&fit=crop&q=85", // Espresso cup
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&auto=format&fit=crop&q=85", // Coffee pour over
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=85", // Latte art
        "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=1000&auto=format&fit=crop&q=85", // Coffee beans bag
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1000&auto=format&fit=crop&q=85", // Matcha tea
      ]
    },
    // Luxury Watches & Timepieces
    {
      keywords: ["watch", "horology", "timepiece", "chronograph", "swiss", "automatic", "dial", "wristwatch"],
      urls: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=85", // Minimalist Watch
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=85", // Luxury Chronograph
        "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1000&auto=format&fit=crop&q=85", // Leather Watch
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&auto=format&fit=crop&q=85", // Classic Watch
      ]
    },
    // Fine Jewelry & Accessories
    {
      keywords: ["jewelry", "ring", "necklace", "bracelet", "diamond", "gold", "silver", "pendant", "earrings", "gemstone"],
      urls: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=85", // Gold Necklace
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=85", // Diamond Ring
        "https://images.unsplash.com/photo-1611591475140-be3617c978d2?w=1000&auto=format&fit=crop&q=85", // Silver Jewelry
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&auto=format&fit=crop&q=85", // Earrings
      ]
    },
    // Skincare & Beauty
    {
      keywords: ["skincare", "serum", "lotion", "cream", "botanical", "cosmetics", "facial", "cleanser", "perfume", "fragrance", "organic"],
      urls: [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop&q=85", // Skincare bottles
        "https://images.unsplash.com/photo-1608248597263-000796df9c11?w=1000&auto=format&fit=crop&q=85", // Serum glass dropper
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&auto=format&fit=crop&q=85", // Beauty products
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&auto=format&fit=crop&q=85", // Organic cosmetics
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&auto=format&fit=crop&q=85", // Perfume bottle
      ]
    },
    // Headphones & Audio
    {
      keywords: ["headphone", "audio", "earphone", "acoustic", "speaker", "amplifier", "sound", "wireless", "earbuds"],
      urls: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=85", // Over-ear headphones
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=85", // Wireless headphones
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&auto=format&fit=crop&q=85", // Earbuds
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1000&auto=format&fit=crop&q=85", // Premium speaker
      ]
    },
    // Keyboards & Tech Accessories
    {
      keywords: ["keyboard", "keycap", "mechanical", "mouse", "desk", "setup", "laptop", "macbook", "gadget", "tech", "camera"],
      urls: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=85", // Mechanical keyboard
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000&auto=format&fit=crop&q=85", // Custom keycaps
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop&q=85", // Mirrorless Camera
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000&auto=format&fit=crop&q=85", // Laptop Studio
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop&q=85", // Smartwatch tech
      ]
    },
    // Sneakers & Footwear
    {
      keywords: ["sneaker", "shoes", "footwear", "runner", "kicks", "boots", "leather shoes"],
      urls: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=85", // Red Sneaker
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop&q=85", // White Kicks
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&auto=format&fit=crop&q=85", // Designer Sneaker
        "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1000&auto=format&fit=crop&q=85", // Leather boots
      ]
    },
    // Apparel, Fashion & Streetwear
    {
      keywords: ["clothing", "apparel", "shirt", "pant", "hoodie", "jacket", "fashion", "dress", "suit", "wear", "streetwear", "motorsport", "racing"],
      urls: [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000&auto=format&fit=crop&q=85", // Minimalist Shirt
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=85", // Fashion model outfit
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1000&auto=format&fit=crop&q=85", // Designer coat
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000&auto=format&fit=crop&q=85", // Streetwear hoodie
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=85", // Leather jacket
      ]
    },
    // Furniture, Decor & Living
    {
      keywords: ["furniture", "decor", "home", "chair", "sofa", "table", "lamp", "interior", "living", "ceramic", "vase"],
      urls: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop&q=85", // Modern Sofa
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=85", // Designer Chair
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=85", // Ambient Lamp
        "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=1000&auto=format&fit=crop&q=85", // Ceramic Vases
      ]
    },
    // Outdoor, Sports & Active
    {
      keywords: ["outdoor", "sports", "active", "fitness", "yoga", "mat", "cycle", "bike", "bottle", "gym"],
      urls: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1000&auto=format&fit=crop&q=85", // Road bicycle
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1000&auto=format&fit=crop&q=85", // Yoga mat
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1000&auto=format&fit=crop&q=85", // Water Bottle
      ]
    }
  ];

  for (const group of presets) {
    if (group.keywords.some((k) => text.includes(k))) {
      return group.urls[index % group.urls.length];
    }
  }

  const defaultPool = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=85"
  ];
  return defaultPool[index % defaultPool.length];
}

export async function generateProductAiImage(
  prompt: string,
  fallbackKeyword: string,
  fallbackCategory: string,
  index: number
): Promise<{ url: string; isAiGenerated: boolean }> {
  try {
    const cleanPrompt = `${prompt}, high-end studio commercial product photography, professional lighting, 8k resolution, minimalist off-white background`;
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1000&height=800&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

    return { url: aiImageUrl, isAiGenerated: true };
  } catch (err) {
    console.warn("AI Image Generation service fallback triggered:", err);
  }

  return {
    url: resolveProductImageUrl(fallbackKeyword, fallbackCategory, index),
    isAiGenerated: false,
  };
}

export async function generateHeroBannerAiImage(
  shopName: string,
  businessType: string,
  tagline: string
): Promise<{ url: string; isAiGenerated: boolean }> {
  try {
    const cleanPrompt = `Full bleed editorial hero banner for ${shopName} ${businessType}, ${tagline}, architectural interior, minimalist, dramatic natural lighting, 8k resolution`;
    const heroUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1600&height=900&nologo=true&seed=999`;

    return { url: heroUrl, isAiGenerated: true };
  } catch (err) {
    console.warn("AI Hero Image Generation fallback triggered:", err);
  }

  return {
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=85",
    isAiGenerated: false,
  };
}

const fullWebsiteGeneratorSchema = {
  type: Type.OBJECT,
  properties: {
    shopName: { type: Type.STRING },
    businessType: { type: Type.STRING },
    tagline: { type: Type.STRING },
    heroHeadline: { type: Type.STRING },
    heroSubheadline: { type: Type.STRING },
    aboutText: { type: Type.STRING },
    themeColor: { type: Type.STRING },
    accentColor: { type: Type.STRING },
    layoutStyle: {
      type: Type.STRING,
      enum: [
        "apple",
        "cyber",
        "minimal",
        "organic",
        "editorial",
        "monochrome",
        "nordic",
        "luxe",
        "neo",
        "futuristic",
        "zen",
        "dribbble",
        "behance",
        "mobbin",
        "awwwards",
        "toools",
        "refero",
        "uxarchive",
      ],
    },
    colorSystem: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING },
        secondary: { type: Type.STRING },
        accent: { type: Type.STRING },
        background: { type: Type.STRING },
        surface: { type: Type.STRING },
        text: { type: Type.STRING },
        mutedText: { type: Type.STRING },
        border: { type: Type.STRING },
        cta: { type: Type.STRING },
      },
      required: [
        "primary",
        "secondary",
        "accent",
        "background",
        "surface",
        "text",
        "mutedText",
        "border",
        "cta",
      ],
    },
    typographyConfig: {
      type: Type.OBJECT,
      properties: {
        headingFont: {
          type: Type.STRING,
          enum: ["serif", "sans", "mono", "geometric", "display"],
        },
        bodyFont: {
          type: Type.STRING,
          enum: ["sans", "mono", "serif"],
        },
        stylePersonality: { type: Type.STRING },
      },
      required: ["headingFont", "bodyFont", "stylePersonality"],
    },
    designDecision: {
      type: Type.OBJECT,
      properties: {
        brandPersonality: { type: Type.STRING },
        heroLayout: {
          type: Type.STRING,
          enum: [
            "split",
            "fullbleed",
            "editorial",
            "minimal",
            "asymmetric",
            "spotlight",
          ],
        },
        primaryCtaText: { type: Type.STRING },
        secondaryCtaText: { type: Type.STRING },
        announcementText: { type: Type.STRING },
        storyTitle: { type: Type.STRING },
        storySubtitle: { type: Type.STRING },
        spotlightHeadline: { type: Type.STRING },
        spotlightSubtitle: { type: Type.STRING },
        newsletterHeadline: { type: Type.STRING },
        newsletterSubheadline: { type: Type.STRING },
        valueProps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              icon: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["icon", "title", "description"],
          },
        },
      },
      required: [
        "brandPersonality",
        "heroLayout",
        "primaryCtaText",
        "secondaryCtaText",
        "announcementText",
        "storyTitle",
        "storySubtitle",
        "spotlightHeadline",
        "spotlightSubtitle",
        "newsletterHeadline",
        "newsletterSubheadline",
      ],
    },
    footerText: { type: Type.STRING },
    testimonials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quote: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          role: { type: Type.STRING },
        },
        required: ["name", "quote", "rating"],
      },
    },
    faq: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          price: { type: Type.NUMBER },
          originalPrice: { type: Type.NUMBER },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          badge: { type: Type.STRING },
          imageKeyword: { type: Type.STRING },
        },
        required: [
          "productName",
          "category",
          "description",
          "keyFeatures",
          "price",
          "colorPalette",
          "targetAudience",
          "tags",
          "imageKeyword",
        ],
      },
    },
  },
  required: [
    "shopName",
    "businessType",
    "tagline",
    "heroHeadline",
    "heroSubheadline",
    "aboutText",
    "themeColor",
    "accentColor",
    "layoutStyle",
    "colorSystem",
    "typographyConfig",
    "designDecision",
    "footerText",
    "testimonials",
    "faq",
    "products",
  ],
};

export async function generateWebsiteFromShopPhoto(
  base64Image: string,
  mimeType: string,
  shopNameOverride?: string
): Promise<{ config: StoreConfig; products: StoreProduct[] }> {
  const ai = getClient();

  const promptText = `You are a world-class e-commerce agency creative director and master frontend copywriter.
Look closely at the photo of the shop sign / storefront / logo board provided.
Perform OCR and Visual Analysis:
1. Extract the EXACT Shop Name visible on the sign (or use: "${shopNameOverride || ""}").
2. Identify the business type (e.g., Artisanal Bakery, Coffee Roaster, Handmade Jewelry Boutique, Luxury Watch Store, Tech Supply, Organic Skincare, Streetwear Brand, Modern Diner, etc.).
3. Extract dominant brand colors from the sign/storefront for themeColor and accentColor.
4. Craft an entire bespoke, human-crafted agency website structure that looks 100% like a human team built it:
   - Rich brand story about the founder, heritage, and artisan philosophy for aboutText.
   - 3-4 authentic customer reviews with realistic human names (e.g., "Elena Rostova", "Marcus Vance", "Sophia Chen"), verified roles (e.g., "Verified Buyer", "Interior Designer"), 5-star ratings, and specific product praise.
   - 4-6 detailed, realistic customer support FAQs (handling shipping times, returns, care instructions, custom sizing, sustainability).
   - 4-6 realistic catalog products tailored specifically to this shop (with productName, category, description, price, keyFeatures, tags, colorPalette, badge, and imageKeyword).
   - Pick the layoutStyle from ["apple", "cyber", "minimal", "organic", "editorial", "monochrome", "nordic", "luxe", "neo", "futuristic", "zen", "dribbble", "behance", "mobbin", "awwwards", "toools", "refero", "uxarchive"].`;

  const response = await callGeminiWithTimeout(
    () =>
      ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Image,
                  mimeType,
                },
              },
              { text: promptText },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: fullWebsiteGeneratorSchema,
        },
      }),
    35000,
    "Shop photo website generation"
  );

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response for shop photo analysis.");
  const data = JSON.parse(text);

  const finalShopName = shopNameOverride?.trim() || data.shopName || "My Shop";

  const heroImageResult = await generateHeroBannerAiImage(
    finalShopName,
    data.businessType || "Boutique",
    data.tagline || ""
  );

  const config: StoreConfig = {
    storeName: finalShopName,
    tagline: data.tagline,
    heroHeadline: data.heroHeadline,
    heroSubheadline: data.heroSubheadline,
    aboutText: data.aboutText,
    themeColor: data.themeColor,
    accentColor: data.accentColor,
    layoutStyle: data.layoutStyle || "minimal",
    colorSystem: data.colorSystem,
    typographyConfig: data.typographyConfig,
    designDecision: data.designDecision,
    footerText: data.footerText,
    testimonials: data.testimonials,
    faq: data.faq,
    heroImageUrl: heroImageResult.url,
    heroImageIsAiGenerated: heroImageResult.isAiGenerated,
  };

  const products: StoreProduct[] = await Promise.all(
    (data.products || []).map(async (p: any, idx: number) => {
      const imgRes = await generateProductAiImage(
        `${finalShopName} ${p.productName} ${p.category || ""}`,
        p.imageKeyword || "",
        p.category || data.businessType,
        idx
      );
      const priceVal = parseFloat(p.price) || 29.99;
      return {
        id: "prod_sp_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6),
        productName: p.productName,
        brand: finalShopName,
        category: p.category || data.businessType,
        description: p.description,
        keyFeatures: p.keyFeatures || [],
        price: priceVal,
        originalPrice: p.originalPrice || Math.round(priceVal * 1.25 * 100) / 100,
        colorPalette: p.colorPalette || [data.themeColor, data.accentColor],
        targetAudience: p.targetAudience || "General Customers",
        tags: p.tags || [],
        image: imgRes.url,
        isAiGeneratedImage: imgRes.isAiGenerated,
        isFeatured: idx === 0,
        inStock: true,
        rating: 4.7 + (idx % 3) * 0.1,
        reviewCount: 30 + idx * 14,
        badge: p.badge || (idx === 0 ? "FEATURED DROP" : "POPULAR"),
      };
    })
  );

  return { config, products };
}

export async function generateWebsiteFromBusinessDescription(
  businessDescription: string,
  shopNameOverride?: string
): Promise<{ config: StoreConfig; products: StoreProduct[] }> {
  const ai = getClient();

  const promptText = `You are a master e-commerce strategist and AI web builder.
A business owner provided the following simple description of their business:
"${businessDescription}"

User-specified Shop Name override: "${shopNameOverride || "None provided"}"

Analyze the business description and construct a complete, professional, high-end e-commerce website:
1. Determine/refine the shop name (use override if provided, else generate a catchy, premium store name).
2. Infer the business category, brand personality, tone of voice, theme colors, and layout personality.
3. Write compelling website copy:
   - Tagline, hero headline, hero subheadline, brand story / about text, footer, testimonials, FAQs.
4. Generate 4-6 complete, realistic catalog products tailored to this business description:
   - Each product must have productName, category, description, price (USD), keyFeatures, tags, colorPalette, badge, and a descriptive imageKeyword for photo matching.
5. Select layoutStyle from ["apple", "cyber", "minimal", "organic", "editorial", "monochrome", "nordic", "luxe", "neo", "futuristic", "zen", "dribbble", "behance", "mobbin", "awwwards", "toools", "refero", "uxarchive"].`;

  const response = await callGeminiWithTimeout(
    () =>
      ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: fullWebsiteGeneratorSchema,
        },
      }),
    35000,
    "Business description website generation"
  );

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response for business description.");
  const data = JSON.parse(text);

  const finalShopName = shopNameOverride?.trim() || data.shopName || "My Store";

  const heroImageResult = await generateHeroBannerAiImage(
    finalShopName,
    data.businessType || "Store",
    data.tagline || ""
  );

  const config: StoreConfig = {
    storeName: finalShopName,
    tagline: data.tagline,
    heroHeadline: data.heroHeadline,
    heroSubheadline: data.heroSubheadline,
    aboutText: data.aboutText,
    themeColor: data.themeColor,
    accentColor: data.accentColor,
    layoutStyle: data.layoutStyle || "minimal",
    colorSystem: data.colorSystem,
    typographyConfig: data.typographyConfig,
    designDecision: data.designDecision,
    footerText: data.footerText,
    testimonials: data.testimonials,
    faq: data.faq,
    heroImageUrl: heroImageResult.url,
    heroImageIsAiGenerated: heroImageResult.isAiGenerated,
  };

  const products: StoreProduct[] = await Promise.all(
    (data.products || []).map(async (p: any, idx: number) => {
      const imgRes = await generateProductAiImage(
        `${finalShopName} ${p.productName} ${p.category || ""}`,
        p.imageKeyword || "",
        p.category || data.businessType,
        idx
      );
      const priceVal = parseFloat(p.price) || 35.00;
      return {
        id: "prod_bd_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6),
        productName: p.productName,
        brand: finalShopName,
        category: p.category || data.businessType,
        description: p.description,
        keyFeatures: p.keyFeatures || [],
        price: priceVal,
        originalPrice: p.originalPrice || Math.round(priceVal * 1.25 * 100) / 100,
        colorPalette: p.colorPalette || [data.themeColor, data.accentColor],
        targetAudience: p.targetAudience || "Customers",
        tags: p.tags || [],
        image: imgRes.url,
        isAiGeneratedImage: imgRes.isAiGenerated,
        isFeatured: idx === 0,
        inStock: true,
        rating: 4.8 + (idx % 2) * 0.1,
        reviewCount: 45 + idx * 18,
        badge: p.badge || (idx === 0 ? "BESTSELLER" : "ESSENTIAL"),
      };
    })
  );

  return { config, products };
}

