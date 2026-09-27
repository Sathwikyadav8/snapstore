export type AttributeSource = "image" | "user" | "barcode" | "inferred";

export interface ScoredAttribute {
  key?: string;
  label?: string;
  value: string;
  confidence: number; // 0.00 - 1.00
  evidence: string;
  source: AttributeSource;
  isConfirmed?: boolean;
}

export interface EvidenceSummary {
  visuallyVerifiedCount: number;
  userConfirmedCount: number;
  inferredCount: number;
  barcodeCount: number;
  unknownCount: number;
}

export interface ProductKnowledgeObject {
  id?: string;
  productImage?: string;
  rawBarcodeData?: string;

  productName: ScoredAttribute;
  category: ScoredAttribute;
  subcategory?: ScoredAttribute;
  brand: ScoredAttribute;
  color: ScoredAttribute;
  material: ScoredAttribute;
  designStyle?: ScoredAttribute;
  targetAudience: ScoredAttribute;
  price: ScoredAttribute;
  description: ScoredAttribute;

  visualFeatures: ScoredAttribute[];
  tags: ScoredAttribute[];

  uncertainAttributes: string[];
  evidenceSummary: EvidenceSummary;

  customAttributes?: ScoredAttribute[];
}

export interface ProductInfo {
  id?: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  keyFeatures: string[];
  estimatedPriceUSD: number;
  colorPalette: string[];
  targetAudience: string;
  tags: string[];
  image?: string;
  isFeatured?: boolean;
  inStock?: boolean;
  productKnowledge?: ProductKnowledgeObject;
}

export interface StoreProduct {
  id: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  keyFeatures: string[];
  price: number;
  originalPrice?: number;
  colorPalette: string[];
  targetAudience: string;
  tags: string[];
  image: string;
  isFeatured: boolean;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isAiGeneratedImage?: boolean;
  productKnowledge?: ProductKnowledgeObject;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface ValuePropItem {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  quote: string;
  rating: number;
  role?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type SupportedLanguage = "en" | "te" | "hi" | "ta" | "kn" | "ml";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "கன்னட", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
];

export interface BrandDNAVisualIdentity {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  contrastProfile: string;
}

export interface BrandDNATypography {
  headingStyle: string;
  bodyStyle: string;
  personality: string;
  recommendedFont: string;
}

export interface BrandDNADesignLanguage {
  stylePersonality: "apple" | "cyber" | "minimal" | "organic" | "editorial" | "monochrome" | "nordic" | "luxe" | "neo" | "futuristic" | "zen" | "dribbble" | "behance" | "mobbin" | "awwwards" | "toools" | "refero" | "uxarchive";
  layoutCharacteristics: string;
  cardStyle: string;
  borderStyle: string;
  buttonStyle: string;
  shadowUsage: string;
  imagePresentationStyle: string;
}

export interface BrandDNABrandCommunication {
  brandTone: string;
  writingStyle: string;
  targetAudience: string;
  productPresentationStyle: string;
}

export interface BrandDNA {
  id: string;
  brandName: string;
  visualIdentity: BrandDNAVisualIdentity;
  typography: BrandDNATypography;
  designLanguage: BrandDNADesignLanguage;
  brandCommunication: BrandDNABrandCommunication;
  createdAt: string;
  referenceImages?: string[];
}

export interface ColorSystem {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  cta: string;
}

export interface TypographyConfig {
  headingFont: "serif" | "sans" | "mono" | "geometric" | "display";
  bodyFont: "sans" | "mono" | "serif";
  stylePersonality: string;
}

export type HeroLayoutType =
  | "split"
  | "fullbleed"
  | "editorial"
  | "minimal"
  | "asymmetric"
  | "spotlight";

export interface DesignDecision {
  brandPersonality: string;
  heroLayout: HeroLayoutType;
  primaryCtaText: string;
  secondaryCtaText: string;
  announcementText?: string;
  storyTitle?: string;
  storySubtitle?: string;
  spotlightHeadline?: string;
  spotlightSubtitle?: string;
  newsletterHeadline?: string;
  newsletterSubheadline?: string;
  valueProps?: ValuePropItem[];
  enabledSections?: {
    announcement: boolean;
    hero: boolean;
    categories: boolean;
    catalog: boolean;
    spotlight: boolean;
    brandStory: boolean;
    trustBadges: boolean;
    testimonials: boolean;
    faq: boolean;
    newsletter: boolean;
  };
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
  themeColor: string;
  accentColor: string;
  layoutStyle:
  | "apple"
  | "cyber"
  | "minimal"
  | "organic"
  | "editorial"
  | "monochrome"
  | "nordic"
  | "luxe"
  | "neo"
  | "futuristic"
  | "zen"
  | "dribbble"
  | "behance"
  | "mobbin"
  | "awwwards"
  | "toools"
  | "refero"
  | "uxarchive";
  heroAlignment?: "left" | "center" | "right";
  footerText: string;
  testimonials: Testimonial[];
  faq: FaqItem[];
  selectedLanguage?: SupportedLanguage;
  brandDna?: BrandDNA;
  brandDnaLocked?: boolean;
  colorSystem?: ColorSystem;
  typographyConfig?: TypographyConfig;
  designDecision?: DesignDecision;
  heroImageUrl?: string;
  heroImageIsAiGenerated?: boolean;
}

export interface MultiProductStore {
  config: StoreConfig;
  products: StoreProduct[];
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface RecommendedProductWithReason {
  product: StoreProduct;
  matchReason: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  recommendations?: RecommendedProductWithReason[];
  parsedQuery?: {
    category?: string;
    maxPrice?: number;
    currency?: string;
    useCase?: string;
    preference?: string;
  };
  timestamp: string;
}
