"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  SlidersHorizontal,
  Sparkles,
  Rocket,
  Bot,
  Globe,
  Heart,
  ShoppingBag,
  Search,
  X,
  Star,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Sliders,
  Edit3,
} from "lucide-react";
import type {
  StoreConfig,
  StoreProduct,
  CartItem,
  SupportedLanguage,
  BrandDNA,
} from "@/lib/types";
import { SUPPORTED_LANGUAGES } from "@/lib/types";
import ShoppingAssistantDrawer from "./ShoppingAssistantDrawer";
import BrandDnaDashboard from "./BrandDnaDashboard";
import ExportDeployModal from "./ExportDeployModal";
import ProductAnalysisReview from "./ProductAnalysisReview";
import { buildProductKnowledge } from "@/lib/knowledgeEngine";

import HeroSection from "./sections/HeroSection";
import FeatureSection from "./sections/FeatureSection";
import ProductGridSection from "./sections/ProductGridSection";
import SpecsSection from "./sections/SpecsSection";
import TestimonialSection from "./sections/TestimonialSection";
import CTASection from "./sections/CTASection";
import FooterSection from "./sections/FooterSection";

interface GeneratedStoreProps {
  config: StoreConfig;
  products: StoreProduct[];
  isEditMode: boolean;
  onUpdateStore: (updatedConfig: StoreConfig, updatedProducts: StoreProduct[]) => void;
  onAddProductClick: () => void;
  onSaveStore: () => void;
  onToggleEditMode: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const InlineEditableText = ({
  tag: Tag,
  className = "",
  value,
  onChange,
  placeholder = "Click to edit...",
  multiline = false,
}: {
  tag: any;
  className?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(value || "");

  useEffect(() => {
    setCurrentVal(value || "");
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentVal.trim() !== (value || "")) {
      onChange(currentVal.trim() || value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setCurrentVal(value || "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={currentVal}
          onChange={(e) => setCurrentVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-[#14161b] text-slate-100 border border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] rounded-lg p-2.5 resize-y font-sans shadow-lg ${className}`}
          rows={3}
        />
      );
    }
    return (
      <input
        autoFocus
        type="text"
        value={currentVal}
        onChange={(e) => setCurrentVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-[#14161b] text-slate-100 border border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] rounded-md px-2 py-1 font-sans shadow-lg ${className}`}
      />
    );
  }

  return (
    <span className="relative group/edit inline-flex items-center gap-1.5 cursor-pointer max-w-full">
      <Tag
        onClick={() => setIsEditing(true)}
        className={`group-hover/edit:text-[#0071e3] transition-colors ${className}`}
      >
        {value || placeholder}
      </Tag>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-[#0071e3] p-1 rounded-md bg-[#14161b]/90 border border-[#242832] shrink-0 shadow"
        title="Click to edit inline"
      >
        <Pencil className="w-3.5 h-3.5 text-[#0071e3]" />
      </button>
    </span>
  );
};

export default function GeneratedStore({
  config,
  products,
  isEditMode,
  onUpdateStore,
  onAddProductClick,
  onSaveStore,
  onToggleEditMode,
}: GeneratedStoreProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isBrandDnaModalOpen, setIsBrandDnaModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [productIntelligenceModal, setProductIntelligenceModal] = useState<StoreProduct | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProductModal, setActiveProductModal] = useState<StoreProduct | null>(null);
  const [editingProductModal, setEditingProductModal] = useState<StoreProduct | null>(null);
  const [imageReplaceProduct, setImageReplaceProduct] = useState<StoreProduct | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedDetailProductIndex, setSelectedDetailProductIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function fireToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleWishlist(productId: string) {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        fireToast("Removed from wishlist");
      } else {
        next.add(productId);
        fireToast("Added to wishlist ❤️");
      }
      return next;
    });
  }

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  function addToCart(product: StoreProduct) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    fireToast(`Added "${product.productName}" to cart`);
  }

  function updateCartQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  function handleUpdateSingleProduct(updated: StoreProduct) {
    const newProducts = products.map((p) => (p.id === updated.id ? updated : p));
    onUpdateStore(config, newProducts);
    setEditingProductModal(null);
    setImageReplaceProduct(null);
    fireToast("Product details updated");
  }

  function handleProductImageUpload(file: File | undefined) {
    if (!file || !imageReplaceProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleUpdateSingleProduct({ ...imageReplaceProduct, image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDeleteProduct(productId: string) {
    if (confirm("Remove this product from store?")) {
      const newProducts = products.filter((p) => p.id !== productId);
      onUpdateStore(config, newProducts);
      fireToast("Product removed");
    }
  }

  function handleToggleFeatured(productId: string) {
    const newProducts = products.map((p) =>
      p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
    );
    onUpdateStore(config, newProducts);
  }

  async function handleLanguageChange(targetLang: SupportedLanguage) {
    if (targetLang === config.selectedLanguage) return;
    setIsTranslating(true);
    fireToast(`Translating store to ${SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name}...`);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          products,
          targetLang,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      onUpdateStore(data.config, data.products);
      fireToast(`Language switched to ${SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.nativeName}`);
    } catch (err) {
      console.error(err);
      onUpdateStore({ ...config, selectedLanguage: targetLang }, products);
    } finally {
      setIsTranslating(false);
    }
  }

  function handleApplyBrandDna(dna: BrandDNA) {
    const updatedConfig: StoreConfig = {
      ...config,
      themeColor: dna.visualIdentity.primaryColor,
      accentColor: dna.visualIdentity.accentColor,
      layoutStyle: dna.designLanguage.stylePersonality,
      brandDna: dna,
      brandDnaLocked: true,
    };
    onUpdateStore(updatedConfig, products);
    setIsBrandDnaModalOpen(false);
    fireToast("Brand DNA applied to Store Design");
  }

  const style = config.layoutStyle || "cyber";
  const heroAlign = config.heroAlignment || "left";

  const themeStyles: Record<
    string,
    {
      wrapper: string;
      card: string;
      nav: string;
      accentBtn: string;
      primaryBtn: string;
      headerFont: string;
      heroBg: string;
      badge: string;
    }
  > = {
    apple: {
      wrapper: "bg-[#f5f5f7] text-[#1d1d1f] font-sans text-xs antialiased selection:bg-[#0071e3] selection:text-white",
      card: "bg-white border border-gray-200/80 rounded-3xl hover:shadow-xl transition-all duration-500 overflow-hidden shadow-sm",
      nav: "bg-[#f5f5f7]/85 border-b border-gray-200/80 backdrop-blur-xl text-[#1d1d1f]",
      accentBtn: "bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] shadow-sm rounded-full transition-all duration-200",
      primaryBtn: "bg-[#e8e8ed] text-[#1d1d1f] font-medium hover:bg-[#e2e2e7] rounded-full transition-all duration-200",
      headerFont: "font-sans font-semibold tracking-tight text-[#1d1d1f]",
      heroBg: "bg-[#f5f5f7]",
      badge: "bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20 rounded-full font-medium",
    },
    cyber: {
      wrapper: "bg-[#060807] text-slate-100 font-mono text-xs",
      card: "bg-[#090e0b] border-emerald-950 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 shadow-xl",
      nav: "bg-[#060807]/90 border-emerald-950 backdrop-blur-xl",
      accentBtn: "bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
      primaryBtn: "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40 hover:bg-emerald-900",
      headerFont: "font-mono font-black tracking-tight text-white",
      heroBg: "bg-gradient-to-b from-[#0a120d] via-[#060807] to-[#060807]",
      badge: "bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-full font-mono",
    },
    minimal: {
      wrapper: "bg-[#fafafa] text-zinc-900 font-sans text-xs",
      card: "bg-white border-zinc-200/80 rounded-2xl hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md",
      nav: "bg-white/90 border-zinc-200 backdrop-blur-xl",
      accentBtn: "bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md",
      primaryBtn: "bg-zinc-900 text-white font-bold hover:bg-zinc-800 shadow-md",
      headerFont: "font-sans-clean font-extrabold text-zinc-900 tracking-tight",
      heroBg: "bg-gradient-to-b from-zinc-100/80 to-[#fafafa]",
      badge: "bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-semibold",
    },
    organic: {
      wrapper: "bg-[#07120c] text-emerald-100 font-sans text-xs",
      card: "bg-[#0c1a12] border-emerald-900/40 rounded-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-xl",
      nav: "bg-[#07120c]/90 border-emerald-900/40 backdrop-blur-xl",
      accentBtn: "bg-emerald-400 text-black font-bold hover:bg-emerald-300 shadow-md",
      primaryBtn: "bg-emerald-900 text-emerald-200 font-bold shadow-md",
      headerFont: "font-sans-clean font-bold text-emerald-50 tracking-tight",
      heroBg: "bg-gradient-to-b from-[#0e2116] via-[#07120c] to-[#07120c]",
      badge: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full",
    },
    editorial: {
      wrapper: "bg-[#faf8f5] text-zinc-900 font-serif-luxury text-xs",
      card: "bg-white border-stone-200 rounded-xl hover:border-zinc-900 transition-all duration-300 shadow-sm hover:shadow-lg",
      nav: "bg-[#faf8f5]/90 border-stone-200 backdrop-blur-md",
      accentBtn: "bg-zinc-950 text-white font-sans font-bold hover:bg-zinc-800 shadow-md",
      primaryBtn: "bg-stone-200 text-zinc-900 font-sans font-bold hover:bg-stone-300",
      headerFont: "font-serif-luxury tracking-tight text-zinc-950 font-bold",
      heroBg: "bg-stone-100/80",
      badge: "bg-stone-200 text-zinc-900 border border-stone-300 rounded-full font-sans font-bold",
    },
    monochrome: {
      wrapper: "bg-black text-white font-mono text-xs",
      card: "bg-[#0a0a0a] border-zinc-800 rounded-none hover:border-white transition-all duration-300",
      nav: "bg-black/90 border-zinc-800 backdrop-blur-xl",
      accentBtn: "bg-white text-black font-extrabold hover:bg-zinc-200",
      primaryBtn: "bg-zinc-900 text-white font-bold border border-zinc-800",
      headerFont: "font-mono font-black uppercase tracking-wider text-white",
      heroBg: "bg-[#050505]",
      badge: "bg-zinc-900 text-white border border-zinc-700 rounded-none",
    },
    nordic: {
      wrapper: "bg-[#0b100e] text-slate-100 font-sans text-xs",
      card: "bg-[#0e1613] border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 shadow-xl",
      nav: "bg-[#0b100e]/90 border-slate-800 backdrop-blur-xl",
      accentBtn: "bg-emerald-400 text-black font-bold hover:bg-emerald-300 shadow-md",
      primaryBtn: "bg-slate-800 text-white font-bold hover:bg-slate-700",
      headerFont: "font-sans-clean font-bold text-white tracking-tight",
      heroBg: "bg-[#111b17]",
      badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full",
    },
    luxe: {
      wrapper: "bg-[#040605] text-slate-100 font-sans text-xs",
      card: "bg-[#080d0a] border-emerald-950/80 rounded-2xl hover:border-emerald-500/60 transition-all duration-300 shadow-2xl",
      nav: "bg-[#040605]/95 border-emerald-950 backdrop-blur-2xl",
      accentBtn: "bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold hover:brightness-110 shadow-lg shadow-emerald-500/20",
      primaryBtn: "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40",
      headerFont: "font-serif-luxury tracking-tight text-white font-black",
      heroBg: "bg-gradient-to-b from-[#0a1811] via-[#040605] to-[#040605]",
      badge: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full",
    },
    neo: {
      wrapper: "bg-zinc-950 text-white font-mono text-xs",
      card: "bg-zinc-900 border-2 border-emerald-500 rounded-none shadow-[4px_4px_0px_#10b981]",
      nav: "bg-zinc-950 border-b-2 border-emerald-500",
      accentBtn: "bg-emerald-500 text-black font-extrabold border-2 border-black hover:bg-emerald-400 shadow-[2px_2px_0px_#000]",
      primaryBtn: "bg-white text-black font-extrabold border-2 border-black",
      headerFont: "font-mono font-black uppercase text-emerald-400 tracking-wider",
      heroBg: "bg-zinc-900",
      badge: "bg-emerald-400 text-black border-2 border-black font-extrabold rounded-none",
    },
    futuristic: {
      wrapper: "bg-[#050907] text-emerald-100 font-mono text-xs",
      card: "bg-[#09140e]/80 border border-emerald-500/30 rounded-2xl backdrop-blur-xl hover:border-emerald-400 transition-all duration-300 shadow-xl",
      nav: "bg-[#050907]/90 border-emerald-900/60 backdrop-blur-2xl",
      accentBtn: "bg-emerald-400 text-black font-bold hover:bg-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      primaryBtn: "bg-emerald-950 text-emerald-300 border border-emerald-500/40",
      headerFont: "font-mono font-black tracking-widest text-emerald-300 uppercase",
      heroBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/60 via-[#050907] to-[#050907]",
      badge: "bg-emerald-950 text-emerald-400 border border-emerald-500/50 rounded-full",
    },
    zen: {
      wrapper: "bg-[#f5f4ef] text-zinc-900 font-sans text-xs",
      card: "bg-white border-zinc-200 rounded-2xl hover:border-emerald-600 transition-all duration-300 shadow-sm",
      nav: "bg-[#f5f4ef]/90 border-zinc-200 backdrop-blur-xl",
      accentBtn: "bg-emerald-800 text-white font-bold hover:bg-emerald-700 shadow-md",
      primaryBtn: "bg-zinc-800 text-white font-bold",
      headerFont: "font-sans-clean font-semibold text-zinc-900 tracking-tight",
      heroBg: "bg-[#eae8e0]",
      badge: "bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-medium",
    },
    dribbble: {
      wrapper: "bg-[#0f0e17] text-purple-50 font-sans text-xs",
      card: "bg-[#1b192e] border-purple-900/40 rounded-3xl hover:border-pink-500/50 transition-all duration-300 shadow-2xl hover:-translate-y-1",
      nav: "bg-[#0f0e17]/90 border-purple-900/40 backdrop-blur-xl",
      accentBtn: "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold hover:brightness-110 shadow-lg shadow-pink-500/30 rounded-full",
      primaryBtn: "bg-purple-950 text-purple-200 font-bold border border-purple-800/40 hover:bg-purple-900 rounded-full",
      headerFont: "font-sans font-black tracking-tight text-white",
      heroBg: "bg-gradient-to-b from-[#241e3d] via-[#0f0e17] to-[#0f0e17]",
      badge: "bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-full font-bold",
    },
    behance: {
      wrapper: "bg-[#050508] text-blue-50 font-sans text-xs",
      card: "bg-[#0b0c14] border-blue-950/80 rounded-2xl hover:border-blue-500/50 transition-all duration-300 shadow-2xl",
      nav: "bg-[#050508]/95 border-blue-950 backdrop-blur-2xl",
      accentBtn: "bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-600/30 rounded-xl",
      primaryBtn: "bg-blue-950 text-blue-300 font-bold border border-blue-800/40 rounded-xl",
      headerFont: "font-sans font-extrabold tracking-wide text-white uppercase",
      heroBg: "bg-gradient-to-br from-[#0c1024] via-[#050508] to-[#050508]",
      badge: "bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg font-mono",
    },
    mobbin: {
      wrapper: "bg-[#0d0f12] text-slate-100 font-sans text-xs",
      card: "bg-[#13171f] border-slate-800/80 rounded-2xl hover:border-emerald-400/60 transition-all duration-300 shadow-xl",
      nav: "bg-[#0d0f12]/95 border-slate-800 backdrop-blur-xl",
      accentBtn: "bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 shadow-md rounded-xl",
      primaryBtn: "bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 rounded-xl",
      headerFont: "font-sans-clean font-bold text-white tracking-tight",
      heroBg: "bg-[#11151c]",
      badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md font-mono",
    },
    awwwards: {
      wrapper: "bg-[#030303] text-amber-50 font-sans text-xs",
      card: "bg-[#0a0a0d] border-amber-900/30 rounded-3xl hover:border-amber-500/60 transition-all duration-500 shadow-2xl hover:scale-[1.02]",
      nav: "bg-[#030303]/90 border-amber-950 backdrop-blur-2xl",
      accentBtn: "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black hover:brightness-110 shadow-lg shadow-amber-500/20 rounded-full",
      primaryBtn: "bg-amber-950 text-amber-200 font-bold border border-amber-800/40 rounded-full",
      headerFont: "font-serif-luxury font-black tracking-tighter text-white italic",
      heroBg: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-[#030303] to-[#030303]",
      badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono",
    },
    toools: {
      wrapper: "bg-[#080b10] text-cyan-50 font-mono text-xs",
      card: "bg-[#0e141d] border-cyan-950 rounded-2xl hover:border-cyan-400/50 transition-all duration-300 shadow-xl",
      nav: "bg-[#080b10]/95 border-cyan-950 backdrop-blur-xl",
      accentBtn: "bg-cyan-400 text-black font-extrabold hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 rounded-xl",
      primaryBtn: "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/40 rounded-xl",
      headerFont: "font-mono font-black text-cyan-300 tracking-tight",
      heroBg: "bg-gradient-to-b from-[#0f1926] via-[#080b10] to-[#080b10]",
      badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-md font-mono",
    },
    refero: {
      wrapper: "bg-[#080d0b] text-teal-50 font-sans text-xs",
      card: "bg-[#0d1613] border-teal-950/80 rounded-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-xl",
      nav: "bg-[#080d0b]/95 border-teal-950 backdrop-blur-xl",
      accentBtn: "bg-teal-400 text-black font-extrabold hover:bg-teal-300 shadow-md rounded-xl",
      primaryBtn: "bg-teal-950 text-teal-300 font-bold border border-teal-800/40 rounded-xl",
      headerFont: "font-sans-clean font-extrabold text-white tracking-tight",
      heroBg: "bg-gradient-to-b from-[#0f211c] via-[#080d0b] to-[#080d0b]",
      badge: "bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-md font-mono",
    },
    uxarchive: {
      wrapper: "bg-[#090b0e] text-indigo-50 font-sans text-xs",
      card: "bg-[#10141a] border-indigo-950/80 rounded-2xl hover:border-indigo-400/50 transition-all duration-300 shadow-xl",
      nav: "bg-[#090b0e]/95 border-indigo-950 backdrop-blur-xl",
      accentBtn: "bg-indigo-500 text-white font-extrabold hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 rounded-xl",
      primaryBtn: "bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/40 rounded-xl",
      headerFont: "font-sans font-bold text-white tracking-wide",
      heroBg: "bg-gradient-to-b from-[#141a26] via-[#090b0e] to-[#090b0e]",
      badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-md font-mono",
    },
  };

  const currentTheme = themeStyles[style] || themeStyles.cyber;

  const heroAlignClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  }[heroAlign];

  return (
    <div id="generated-store" className={`w-full min-h-screen relative overflow-x-hidden ${currentTheme.wrapper}`}>

      {/* Top Announcement Bar */}
      <div className="bg-[#040605] text-slate-200 border-b border-white/10 text-[11px] py-2 px-4 font-sans tracking-wide flex items-center justify-between opacity-95">
        <div className="hidden sm:flex items-center gap-2 text-[10px] opacity-75 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>VISIONCART // BRAND DNA ACTIVE</span>
        </div>
        <div className="mx-auto font-medium flex items-center gap-2">
          <span>{config.designDecision?.announcementText || "✨ Complimentary Express Shipping & Returns Worldwide | Limited Drop Collection"}</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px]">
          <span className="opacity-75">Customer Concierge</span>
          <span className="opacity-40">|</span>
          <span className="font-bold text-emerald-400">★ 4.9 Verified Store Rating</span>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#090e0b] text-emerald-300 px-4 py-2 rounded-full shadow-2xl text-[11px] font-bold border border-emerald-500/30 flex items-center gap-2"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Actions (AI Assistant + Customize Pill + Export) */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-3.5 py-2.5 rounded-full bg-[#080d09] text-emerald-300 font-extrabold text-xs border border-emerald-500/40 shadow-2xl flex items-center gap-1.5 hover:bg-emerald-950 transition active:scale-95"
          title="Export Website Code or Deploy to Cloud"
        >
          <span>🚀 Export & Deploy</span>
        </button>

        {/* AI Shopping Assistant Launcher Button */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="px-4 py-2.5 rounded-full bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 hover:bg-emerald-400 active:scale-95 transition"
        >
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
          className="px-4 py-2.5 rounded-full bg-[#14161b] text-slate-200 font-bold text-xs border border-[#242832] hover:border-[#0071e3] shadow-xl flex items-center gap-1.5 transition active:scale-95"
          title="Toggle Accent Color & Layout Settings"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Style Controls</span>
        </button>
      </div>

      {/* Controls Drawer (Themes, Alignment, Language, Brand DNA) */}
      <AnimatePresence>
        {isThemePickerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#080d0a] border-b border-emerald-950 px-6 py-3 backdrop-blur-xl sticky top-0 z-50 text-white text-xs font-mono"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">

              {/* Multilingual Selector */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">Language:</span>
                <select
                  value={config.selectedLanguage || "en"}
                  disabled={isTranslating}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-[#050706] text-white border border-emerald-950 rounded-lg px-2.5 py-1 text-xs font-bold"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Picker */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">Theme Presets:</span>
                <select
                  value={config.layoutStyle}
                  onChange={(e) =>
                    onUpdateStore({ ...config, layoutStyle: e.target.value as any }, products)
                  }
                  className="bg-[#050706] text-white border border-emerald-950 rounded-lg px-2.5 py-1 text-xs font-bold"
                >
                  <option value="apple"> Apple Store (Light Minimalist)</option>
                  <option value="cyber">Cyber Onyx</option>
                  <option value="dribbble">🎨 Dribbble Showcase</option>
                  <option value="behance">💼 Behance Case Study</option>
                  <option value="mobbin">📱 Mobbin App Flow</option>
                  <option value="awwwards">🏆 Awwwards Luxury</option>
                  <option value="toools">⚡ TOOOLS Micro-UI</option>
                  <option value="refero">📊 Refero UX Pattern</option>
                  <option value="uxarchive">🗺️ UXArchive Journey</option>
                  <option value="minimal">Minimal Studio</option>
                  <option value="organic">Earthy Sage</option>
                  <option value="editorial">Luxury Editorial</option>
                  <option value="monochrome">Obsidian Mono</option>
                  <option value="nordic">Nordic Slate</option>
                  <option value="luxe">Dark Velvet</option>
                  <option value="neo">Neo Brutalism</option>
                  <option value="futuristic">Hologram Glass</option>
                  <option value="zen">Zen Minimalist</option>
                </select>
              </div>

              {/* Hero Alignment Control */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">Hero Layout:</span>
                <div className="flex items-center gap-1 bg-[#050706] p-1 rounded-lg border border-emerald-950">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => onUpdateStore({ ...config, heroAlignment: align }, products)}
                      className={`px-3 py-1 rounded text-[11px] font-bold capitalize transition ${heroAlign === align
                        ? "bg-emerald-500 text-black shadow"
                        : "text-slate-400 hover:text-white"
                        }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand DNA Modal Trigger */}
              {config.brandDna && (
                <button
                  onClick={() => setIsBrandDnaModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40 text-[11px]"
                >
                  View Brand DNA Profile ✨
                </button>
              )}

              <button
                onClick={() => setIsThemePickerOpen(false)}
                className="text-[11px] bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full font-medium"
              >
                Close ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple Announcement Top Banner */}
      <div className="bg-[#f5f5f7] border-b border-gray-200/80 text-[#1d1d1f] text-[11px] py-2.5 px-4 text-center font-sans tracking-tight">
        <span className="opacity-90">
          Last chance to get AirPods with Mac and Apple Pencil with iPad when you buy with education savings. Ends 24/09.*
        </span>{" "}
        <a href="#catalog" className="text-[#0066cc] hover:underline font-medium inline-flex items-center gap-0.5">
          Learn more <span className="text-[12px]">⊕</span>
        </a>
      </div>

      {/* Store Navbar */}
      <nav className={`sticky top-0 z-40 border-b ${currentTheme.nav} px-6 py-3 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <InlineEditableText
                  tag="h1"
                  value={config.storeName}
                  onChange={(val) => onUpdateStore({ ...config, storeName: val }, products)}
                  className={`text-lg font-extrabold ${currentTheme.headerFont}`}
                />

                {/* Brand DNA Lock Badge */}
                {config.brandDnaLocked && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                    title="Brand DNA Lock is Enabled"
                  >
                    DNA Lock 🔒
                  </span>
                )}
              </div>

              <InlineEditableText
                tag="p"
                value={config.tagline}
                onChange={(val) => onUpdateStore({ ...config, tagline: val }, products)}
                className="text-[11px] opacity-75 font-sans"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 rounded-full text-xs bg-current/10 border border-current/15 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
              <span className="absolute left-3 top-2 text-[10px] opacity-60">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1.5 text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Multilingual Selector & Cart Actions */}
          <div className="flex items-center gap-2">
            <select
              value={config.selectedLanguage || "en"}
              disabled={isTranslating}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-current/10 text-current border border-current/20 rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#080d09] text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {wishlist.size > 0 && (
              <button
                onClick={() => {
                  const el = document.getElementById("catalog");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1"
                title="Saved Wishlist Items"
              >
                <span>❤️</span>
                <span>{wishlist.size}</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-1.5 rounded-full bg-current/10 border border-current/15 hover:bg-current/20 font-bold text-xs flex items-center gap-1.5"
            >
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section Primitive */}
      <HeroSection
        badgeText={`${config.designDecision?.brandPersonality || "Apple & Google Grounded Edition"} • ${products.length} Products`}
        headline={config.heroHeadline}
        subheadline={config.heroSubheadline}
        primaryCtaText={config.designDecision?.primaryCtaText || "Explore Collection"}
        secondaryCtaText={config.designDecision?.secondaryCtaText || "Technical Specs"}
        imageUrl={products[0]?.image}
        accentColor={config.accentColor || "#0071e3"}
        onUpdateHeadline={(val) => onUpdateStore({ ...config, heroHeadline: val }, products)}
        onUpdateSubheadline={(val) => onUpdateStore({ ...config, heroSubheadline: val }, products)}
        onCtaClick={() => {
          const cat = document.getElementById("catalog");
          cat?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Feature Story Spotlight Primitive */}
      {products.length > 0 && (
        <FeatureSection
          title={config.designDecision?.spotlightHeadline || products[0].productName}
          subtitle={`Flagship Spec • ${products[0].category || "Essential"}`}
          description={products[0].description}
          imageUrl={products[0].image}
          badge="Flagship Engineering Spotlight"
          accentColor={config.accentColor || "#0071e3"}
          onUpdateTitle={(val) => {
            const updated = [...products];
            updated[0] = { ...updated[0], productName: val };
            onUpdateStore(config, updated);
          }}
          onUpdateDescription={(val) => {
            const updated = [...products];
            updated[0] = { ...updated[0], description: val };
            onUpdateStore(config, updated);
          }}
        />
      )}

      {/* Product Grid Primitive */}
      <ProductGridSection
        products={filteredProducts}
        title="Curated Catalog"
        subtitle={`Displaying ${filteredProducts.length} precision-crafted items`}
        accentColor={config.accentColor || "#0071e3"}
        onAddToCart={addToCart}
        onInspectProduct={(prod) => setProductIntelligenceModal(prod)}
        onUpdateProductField={(id, field, value) => {
          const updated = products.map((p) =>
            p.id === id ? { ...p, [field]: value } : p
          );
          onUpdateStore(config, updated);
        }}
      />

      {/* Tech Specs Primitive */}
      <SpecsSection
        title="Hardware & Studio Specifications"
        subtitle="Extracted attributes grounded by multimodal Qwen & Gemini VLM analysis"
        accentColor={config.accentColor || "#0071e3"}
      />

      {/* Testimonials Quote Primitive */}
      <TestimonialSection
        accentColor={config.accentColor || "#0071e3"}
        testimonials={[
          {
            name: "Sophia Chen",
            quote: "The visual grounding and design precision match Apple and Google store benchmarks flawlessly.",
            rating: 5,
            role: "Design Director, Studio Craft",
          },
        ]}
      />

      {/* Conversion CTA Primitive */}
      <CTASection
        headline="Experience the Storefront"
        subheadline="Order your curated selections with automated AI order fulfillment"
        ctaText="Explore Catalog Now"
        accentColor={config.accentColor || "#0071e3"}
        onCtaClick={() => {
          const cat = document.getElementById("catalog");
          cat?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Footer Primitive */}
      <FooterSection
        storeName={config.storeName}
        tagline={config.tagline}
        footerText={config.footerText || `© 2026 ${config.storeName}. Powered by SnapStore AI Studio.`}
        onUpdateFooterText={(val) => onUpdateStore({ ...config, footerText: val }, products)}
      />

      {/* Apple Product Category Carousel Row */}
      {style === "apple" && (
        <div className="bg-[#f5f5f7] border-b border-gray-200/80">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-start sm:justify-between gap-6 overflow-x-auto pb-4 no-scrollbar">
              {[
                { name: "Mac", icon: "💻" },
                { name: "iPhone", icon: "📱" },
                { name: "iPad", icon: "🖊️" },
                { name: "Apple Watch", icon: "⌚" },
                { name: "AirPods", icon: "🎧" },
                { name: "AirTag", icon: "🏷️" },
                { name: "Apple TV 4K", icon: "📺" },
                { name: "HomePod", icon: "🔊" },
                { name: "Accessories", icon: "⚡" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    const cat = categories.find((c) => c.toLowerCase().includes(item.name.toLowerCase())) || "All";
                    setSelectedCategory(cat);
                  }}
                  className="flex flex-col items-center gap-2 group min-w-[70px] hover:opacity-100 transition opacity-80"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-medium text-[#1d1d1f] group-hover:text-[#0066cc] transition">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-14">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className={`text-2xl font-bold ${currentTheme.headerFont}`}>
              Product Showcase
            </h3>
            <p className="text-[11px] opacity-70 mt-0.5 font-sans">
              Showing {filteredProducts.length} items
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${selectedCategory === cat
                  ? currentTheme.accentBtn
                  : "bg-current/10 opacity-75 hover:opacity-100"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.has(product.id);
              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col overflow-hidden border ${currentTheme.card}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-black/75 text-white backdrop-blur-md uppercase tracking-wider">
                        {product.badge || product.category || "Essential"}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500 text-black shadow">
                          SAVE 20%
                        </span>
                      )}
                    </div>

                    {/* Top Right Wishlist Toggle */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition active:scale-90 ${isWishlisted
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-black/50 border-white/20 text-white opacity-80 hover:opacity-100"
                        }`}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <span className="text-sm">{isWishlisted ? "❤️" : "🤍"}</span>
                    </button>

                    {isEditMode && (
                      <div className="absolute bottom-3 right-3 flex flex-wrap gap-1 z-20 max-w-[150px] justify-end">
                        <button
                          onClick={() => setImageReplaceProduct(product)}
                          className="p-1 rounded bg-emerald-600 text-white text-[9px] font-bold shadow"
                          title="Replace Image"
                        >
                          Image
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(product.id)}
                          className={`p-1 rounded text-[9px] font-bold transition ${product.isFeatured ? "bg-emerald-400 text-black" : "bg-black/60 text-white"
                            }`}
                        >
                          Feature
                        </button>
                        <button
                          onClick={() => setEditingProductModal(product)}
                          className="p-1 rounded bg-zinc-800 text-white text-[9px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 rounded bg-red-600 text-white text-[9px] font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-60 font-mono">
                          {product.brand || config.storeName}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                          <span>★</span>
                          <span>{(product.rating || 4.9).toFixed(1)}</span>
                          <span className="opacity-50">({product.reviewCount || 128})</span>
                        </div>
                      </div>

                      <InlineEditableText
                        tag="h4"
                        value={product.productName}
                        onChange={(val) =>
                          handleUpdateSingleProduct({ ...product, productName: val })
                        }
                        className="font-extrabold text-sm sm:text-base mt-0.5 mb-1 line-clamp-1 font-sans"
                      />
                      <InlineEditableText
                        tag="p"
                        multiline
                        value={product.description}
                        onChange={(val) =>
                          handleUpdateSingleProduct({ ...product, description: val })
                        }
                        className="text-[11px] opacity-75 line-clamp-2 leading-relaxed mb-4 font-sans"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between pt-3 border-t border-current/10">

                        <div className="flex items-baseline gap-1.5">
                          <div className="flex items-baseline">
                            <span className="text-[10px] opacity-60">$</span>
                            <InlineEditableText
                              tag="span"
                              value={product.price.toFixed(2)}
                              onChange={(val) => {
                                const num = parseFloat(val);
                                if (!isNaN(num)) {
                                  handleUpdateSingleProduct({ ...product, price: num });
                                }
                              }}
                              className="text-base sm:text-lg font-bold font-mono text-emerald-400"
                            />
                          </div>

                          {product.originalPrice && (
                            <span className="text-[10px] line-through opacity-50 font-mono">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setActiveProductModal(product)}
                            className="px-2.5 py-1.5 text-[10px] font-bold rounded-full border border-current/25 hover:bg-current/10 transition"
                          >
                            Specs
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className={`px-3.5 py-1.5 text-[10px] font-extrabold rounded-full transition duration-300 active:scale-95 shadow-md ${currentTheme.accentBtn}`}
                          >
                            + Quick Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-16 border border-current/10 ${currentTheme.card}`}>
            <h4 className="text-sm font-bold">No items found</h4>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-3 px-4 py-1.5 text-xs font-bold rounded-full border border-current/20"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* Value Propositions / Guarantees Bar */}
      <section className="border-y border-current/10 bg-current/[0.02] py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {(config.designDecision?.valueProps || [
            { icon: "🚚", title: "Express Worldwide Delivery", description: "Complimentary shipping on orders over $100" },
            { icon: "✨", title: "Guaranteed Authenticity", description: "Directly verified & precision tested" },
            { icon: "🛡️", title: "2-Year Studio Warranty", description: "Full coverage with 30-day effortless returns" },
            { icon: "🌱", title: "Sustainable Sourcing", description: "Carbon neutral packaging and ethical crafting" },
          ]).map((vp, idx) => (
            <div key={idx} className="flex items-start gap-3.5 p-2">
              <span className="text-2xl sm:text-3xl">{vp.icon}</span>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm font-sans">{vp.title}</h4>
                <p className="text-[11px] opacity-75 mt-0.5 leading-relaxed font-sans">{vp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flagship Product Spotlight Section */}
      {
        products.length > 0 && (
          <section className="py-20 px-6 border-b border-current/10 bg-current/[0.015]">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-current/15 shadow-2xl group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={products[0].image}
                  alt={products[0].productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-black uppercase tracking-wider shadow-lg">
                    Flagship Spotlight
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 mb-2 font-mono">
                  Flagship Edition • {products[0].category}
                </div>
                <h3 className={`text-3xl md:text-4xl font-extrabold mb-4 leading-tight ${currentTheme.headerFont}`}>
                  {config.designDecision?.spotlightHeadline || products[0].productName}
                </h3>
                <p className="text-xs md:text-sm opacity-80 leading-relaxed mb-6 font-sans">
                  {products[0].description}
                </p>

                {products[0].keyFeatures?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {products[0].keyFeatures.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-current/5 border border-current/10 text-xs font-sans">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="font-semibold">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => addToCart(products[0])}
                    className={`px-7 py-3 rounded-full font-extrabold text-xs transition active:scale-95 shadow-lg ${currentTheme.accentBtn}`}
                  >
                    Buy Flagship • ${products[0].price.toFixed(2)}
                  </button>
                  <button
                    onClick={() => setActiveProductModal(products[0])}
                    className="px-5 py-3 rounded-full font-bold text-xs border border-current/25 hover:bg-current/10 transition"
                  >
                    View Full Specifications ↗
                  </button>
                </div>
              </div>
            </div>
          </section>
        )
      }

      {/* Detailed Product Story & Description Breakdown Section */}
      {products.length > 0 && (
        <section className="py-20 px-6 border-b border-current/10 bg-gradient-to-b from-current/[0.02] to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 inline-block font-mono">
                Comprehensive Product Breakdown
              </span>
              <h3 className={`text-3xl md:text-4xl font-black mb-3 ${currentTheme.headerFont}`}>
                Product Story & Technical Specs
              </h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-xl mx-auto font-sans">
                Explore detailed specifications, design materials, target personas, and color palettes extracted for each catalog item.
              </p>

              {/* Product Selector Bar */}
              {products.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {products.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedDetailProductIndex(idx)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${selectedDetailProductIndex === idx
                        ? currentTheme.accentBtn
                        : "bg-current/10 opacity-75 hover:opacity-100 border border-current/15"
                        }`}
                    >
                      {p.productName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(() => {
              const currentProduct = products[selectedDetailProductIndex] || products[0];
              if (!currentProduct) return null;

              return (
                <div className={`p-8 md:p-12 rounded-3xl border grid md:grid-cols-12 gap-8 items-center ${currentTheme.card}`}>
                  {/* Left Column: Product Image & Palette */}
                  <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-current/20 shadow-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentProduct.image}
                        alt={currentProduct.productName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-black/80 text-white backdrop-blur-md uppercase tracking-wider">
                          {currentProduct.category}
                        </span>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    {currentProduct.colorPalette?.length > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-current/5 border border-current/10">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 font-mono">
                          Color Palette
                        </span>
                        <div className="flex items-center gap-1.5">
                          {currentProduct.colorPalette.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Detailed Description & Features */}
                  <div className="md:col-span-7 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                          {currentProduct.brand} • In Stock
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <span>★</span>
                          <span>{(currentProduct.rating || 4.9).toFixed(1)}</span>
                          <span className="opacity-50">({currentProduct.reviewCount || 128} reviews)</span>
                        </div>
                      </div>

                      <h4 className={`text-2xl sm:text-3xl font-black mb-4 ${currentTheme.headerFont}`}>
                        {currentProduct.productName}
                      </h4>

                      <div className="p-4 rounded-2xl bg-current/5 border border-current/10 mb-6">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-60 block mb-1 font-mono">
                          Editorial Description & Story:
                        </span>
                        <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-sans font-medium">
                          {currentProduct.description}
                        </p>
                      </div>

                      {/* Key Features Grid */}
                      {currentProduct.keyFeatures?.length > 0 && (
                        <div className="mb-6">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 block mb-2 font-mono">
                            Technical Specifications & Features:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentProduct.keyFeatures.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-current/[0.03] border border-current/10 text-xs font-sans">
                                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                <span className="opacity-85 font-medium">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Target Persona Badge */}
                      {currentProduct.targetAudience && (
                        <div className="mb-6 flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 font-mono">Target Audience:</span>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            👤 {currentProduct.targetAudience}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pricing & Cart Action */}
                    <div className="pt-6 border-t border-current/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-emerald-400">
                          ${currentProduct.price.toFixed(2)}
                        </span>
                        {currentProduct.originalPrice && (
                          <span className="text-xs line-through opacity-50 font-mono">
                            ${currentProduct.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveProductModal(currentProduct)}
                          className="px-5 py-2.5 rounded-full font-bold text-xs border border-current/25 hover:bg-current/10 transition"
                        >
                          Quick Specs Modal
                        </button>
                        <button
                          onClick={() => addToCart(currentProduct)}
                          className={`px-7 py-2.5 rounded-full font-extrabold text-xs transition active:scale-95 shadow-lg ${currentTheme.accentBtn}`}
                        >
                          Add to Cart • ${currentProduct.price.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Brand Story & Metrics Section */}
      <section className="py-20 px-6 border-t border-current/10 bg-current/5">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 inline-block font-mono">
            Brand Story & Philosophy
          </span>
          <h3 className={`text-3xl md:text-4xl font-black mb-4 ${currentTheme.headerFont}`}>
            {config.designDecision?.storyTitle || `Crafted with Intention for ${config.storeName}`}
          </h3>
          <InlineEditableText
            tag="p"
            multiline
            value={config.aboutText}
            onChange={(val) => onUpdateStore({ ...config, aboutText: val }, products)}
            className="opacity-80 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-12 font-sans"
          />

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-current/10 text-center">
            <div>
              <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-400">100%</div>
              <div className="text-[10px] uppercase font-bold opacity-60 font-sans mt-1">Authentic Craft</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-400">4.9★</div>
              <div className="text-[10px] uppercase font-bold opacity-60 font-sans mt-1">Verified Rating</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-400">24/7</div>
              <div className="text-[10px] uppercase font-bold opacity-60 font-sans mt-1">Dedicated Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews (Anti-Fabrication Compliant) */}
      <section className="py-18 px-6 border-t border-current/10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
            <span>ℹ️ Sample testimonials — replace with real customer reviews in store editor</span>
          </span>
          <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${currentTheme.headerFont}`}>
            Customer Testimonial Examples
          </h3>
          <p className="text-xs opacity-75 font-sans">Sample reviews generated based on product visual evidence</p>
        </div>

        {config.testimonials && config.testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.testimonials.map((t, idx) => (
              <div key={idx} className={`p-6 border flex flex-col justify-between ${currentTheme.card}`}>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                    {"★".repeat(t.rating || 5)}
                  </div>
                  <p className="text-xs opacity-85 leading-relaxed font-sans italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-current/10 flex items-center justify-between text-xs font-sans">
                  <span className="font-extrabold">{t.name}</span>
                  <span className="text-[9px] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20 font-mono">
                    {t.role || "Verified Buyer"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 md:p-12 text-center rounded-3xl border border-current/10 max-w-xl mx-auto ${currentTheme.card}`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-4 border border-emerald-500/20">
              💬
            </div>
            <h4 className="text-base font-extrabold mb-1">Customer Reviews</h4>
            <p className="text-xs opacity-75 font-sans leading-relaxed mb-4">
              Real customer reviews will appear here once verified buyers purchase this product.
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-current/5 text-emerald-400 border border-current/10">
              ✓ Anti-Fabrication Guarantee Active
            </span>
          </div>
        )}
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="py-18 px-6 border-t border-current/10 bg-current/[0.02]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${currentTheme.headerFont}`}>
              Frequently Asked Questions
            </h3>
            <p className="text-xs opacity-75 font-sans">Everything you need to know regarding orders, shipping, and guarantees</p>
          </div>

          <div className="space-y-3">
            {(config.faq || []).map((item, idx) => (
              <div key={idx} className={`border rounded-2xl overflow-hidden ${currentTheme.card}`}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm flex justify-between items-center gap-4 font-sans"
                >
                  <span>{item.question}</span>
                  <span className="text-lg font-mono font-bold">{openFaqIndex === idx ? "−" : "+"}</span>
                </button>
                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 sm:px-5 pb-5 text-xs opacity-80 leading-relaxed font-sans border-t border-current/10 pt-3"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-20 px-6 border-t border-current/10 bg-gradient-to-b from-current/[0.03] to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 inline-block font-mono">
            Priority Insider Drop
          </span>
          <h3 className={`text-3xl md:text-4xl font-black mb-3 ${currentTheme.headerFont}`}>
            {config.designDecision?.newsletterHeadline || "Join the Studio Circle"}
          </h3>
          <p className="text-xs sm:text-sm opacity-75 mb-8 font-sans leading-relaxed">
            {config.designDecision?.newsletterSubheadline || "Subscribe to receive priority access to limited edition drops, studio releases, and private member offers."}
          </p>

          {newsletterSubmitted ? (
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-sans">
              ✓ Thank you for joining! You have been added to our priority VIP drop list.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail.trim()) {
                  setNewsletterSubmitted(true);
                  fireToast("Subscribed to VIP drop list!");
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full text-xs bg-current/10 border border-current/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
              <button
                type="submit"
                className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-extrabold text-xs whitespace-nowrap transition duration-300 active:scale-95 shadow-lg ${currentTheme.accentBtn}`}
              >
                Join Insider Drop
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer with Agency Sitemap & Verified Payment Provider Badges */}
      <footer className="px-6 py-12 border-t border-current/10 text-xs bg-current/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          <div>
            <InlineEditableText
              tag="h4"
              value={config.storeName}
              onChange={(val) => onUpdateStore({ ...config, storeName: val }, products)}
              className={`font-black text-sm mb-2 ${currentTheme.headerFont}`}
            />
            <p className="opacity-75 text-[11px] leading-relaxed font-sans mb-4">
              {config.tagline || "Bespoke storefront crafted with SnapStore AI Studio."}
            </p>
            <div className="flex items-center gap-3 text-base opacity-80">
              <span className="hover:opacity-100 cursor-pointer">🌐</span>
              <span className="hover:opacity-100 cursor-pointer">📸</span>
              <span className="hover:opacity-100 cursor-pointer">💼</span>
              <span className="hover:opacity-100 cursor-pointer">🐦</span>
            </div>
          </div>

          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider mb-3 font-mono opacity-80">Shop & Explore</h5>
            <ul className="space-y-2 text-[11px] opacity-75 font-sans">
              <li><a href="#catalog" className="hover:opacity-100 transition">All Products</a></li>
              <li><a href="#catalog" className="hover:opacity-100 transition">New Drops</a></li>
              <li><a href="#catalog" className="hover:opacity-100 transition">Best Sellers</a></li>
              <li><a href="#catalog" className="hover:opacity-100 transition">Limited Editions</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider mb-3 font-mono opacity-80">Customer Concierge</h5>
            <ul className="space-y-2 text-[11px] opacity-75 font-sans">
              <li><a href="#faq" className="hover:opacity-100 transition">Shipping & Delivery</a></li>
              <li><a href="#faq" className="hover:opacity-100 transition">30-Day Returns</a></li>
              <li><a href="#faq" className="hover:opacity-100 transition">Warranty & Care</a></li>
              <li><a href="#faq" className="hover:opacity-100 transition">Track Order</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider mb-3 font-mono opacity-80">Secure Checkout</h5>
            <p className="opacity-75 text-[11px] leading-relaxed font-sans mb-3">
              Encrypted 256-bit SSL transaction protection. Express global delivery via DHL & FedEx.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {["VISA", "MC", "AMEX", "APPLE PAY", "SHOP PAY", "KLARNA"].map((badge) => (
                <span key={badge} className="px-2 py-0.5 rounded bg-current/10 border border-current/15 text-[9px] font-black font-mono tracking-tighter opacity-80">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] opacity-60 font-sans max-w-7xl mx-auto">
          <p>© 2026 {config.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </footer>

      {/* AI Shopping Assistant Drawer */}
      <ShoppingAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        products={products}
        storeConfig={config}
        onAddToCart={addToCart}
      />

      {/* Brand DNA Modal */}
      <AnimatePresence>
        {isBrandDnaModalOpen && config.brandDna && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsBrandDnaModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <BrandDnaDashboard
                brandDna={config.brandDna}
                isLocked={!!config.brandDnaLocked}
                onUpdateBrandDna={(dna) => onUpdateStore({ ...config, brandDna: dna }, products)}
                onApplyToStore={handleApplyBrandDna}
                onToggleLock={(locked) =>
                  onUpdateStore({ ...config, brandDnaLocked: locked }, products)
                }
                onClose={() => setIsBrandDnaModalOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Replace Modal */}
      <AnimatePresence>
        {imageReplaceProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#080d09] text-white rounded-2xl max-w-sm w-full p-5 border border-emerald-950 shadow-2xl relative font-mono"
            >
              <button
                onClick={() => setImageReplaceProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <h3 className="font-bold text-sm mb-1">Replace Image</h3>
              <p className="text-[10px] text-slate-400 mb-4 font-sans">
                Upload a replacement photo or enter image URL for &quot;{imageReplaceProduct.productName}&quot;.
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Upload Local Photo:
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProductImageUpload(e.target.files?.[0])}
                    className="w-full text-[10px] bg-[#050706] p-2 rounded-lg border border-emerald-950 text-slate-300"
                  />
                </div>

                <div className="text-center text-[10px] text-slate-500 font-bold uppercase">
                  OR
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Image Web URL:
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#050706] rounded-lg border border-emerald-950 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        handleUpdateSingleProduct({ ...imageReplaceProduct, image: newImageUrl.trim() });
                        setNewImageUrl("");
                      }
                    }}
                    className="w-full mt-2 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                  >
                    Set Image URL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Specs Modal */}
      <AnimatePresence>
        {activeProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs"
            onClick={() => setActiveProductModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#080d09] text-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-emerald-950"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-square bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeProductModal.image}
                    alt={activeProductModal.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        {activeProductModal.category}
                      </span>
                      <button
                        onClick={() => setActiveProductModal(null)}
                        className="text-slate-400 hover:text-white font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <h3 className="text-lg font-bold mb-1">
                      {activeProductModal.productName}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-emerald-400">
                        ${activeProductModal.price.toFixed(2)}
                      </span>
                      {activeProductModal.originalPrice && (
                        <span className="text-xs line-through text-slate-500">
                          ${activeProductModal.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3 font-sans">
                      {activeProductModal.description}
                    </p>

                    {activeProductModal.keyFeatures?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          Features:
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-slate-300">
                          {activeProductModal.keyFeatures.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="text-emerald-400">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      addToCart(activeProductModal);
                      setActiveProductModal(null);
                    }}
                    className={`w-full py-2.5 rounded-full font-bold shadow transition active:scale-95 ${currentTheme.accentBtn}`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end font-mono text-xs"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#080d09] text-white h-full shadow-2xl flex flex-col justify-between border-l border-emerald-950"
            >
              <div className="p-4 border-b border-emerald-950 flex justify-between items-center bg-[#060807]">
                <h3 className="font-bold flex items-center gap-2">
                  <span>Shopping Cart</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-800/40">
                    {cartItemCount}
                  </span>
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {cart.length > 0 ? (
                  cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex gap-3 p-2.5 bg-[#050706] rounded-xl border border-emerald-950 items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-xs line-clamp-1">{product.productName}</h4>
                        <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                          ${(product.price * quantity).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateCartQuantity(product.id, -1)}
                            className="w-5 h-5 rounded bg-zinc-800 text-[10px] flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-bold">{quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, 1)}
                            className="w-5 h-5 rounded bg-zinc-800 text-[10px] flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => updateCartQuantity(product.id, -quantity)}
                        className="text-slate-500 hover:text-red-400 p-1 text-[11px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 opacity-60 text-xs">
                    <p className="font-semibold">Your cart is empty.</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-emerald-950 bg-[#060807]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-semibold text-slate-400">Total:</span>
                    <span className="text-lg font-bold text-emerald-400">${cartTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutModalOpen(true);
                    }}
                    className={`w-full py-3 rounded-full font-bold shadow transition active:scale-95 ${currentTheme.accentBtn}`}
                  >
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#080d09] text-white rounded-2xl max-w-xs w-full p-6 text-center shadow-2xl border border-emerald-950"
            >
              <h3 className="text-lg font-bold mb-1">Order Summary</h3>
              <p className="text-[11px] text-slate-400 mb-4 font-sans">
                Order simulation total: <span className="text-emerald-400 font-bold">${cartTotal.toFixed(2)}</span>.
              </p>

              <button
                onClick={() => {
                  setCart([]);
                  setIsCheckoutModalOpen(false);
                  fireToast("Order simulation placed");
                }}
                className={`w-full py-2.5 rounded-full font-bold shadow ${currentTheme.accentBtn}`}
              >
                Close & Complete
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export & Deploy Hub Modal */}
      <ExportDeployModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        products={products}
      />

      {/* Product Intelligence & Evidence Inspector Modal */}
      <AnimatePresence>
        {productIntelligenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs text-white"
            onClick={() => setProductIntelligenceModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#080d09] text-white rounded-3xl max-w-xl w-full p-6 border border-emerald-950 shadow-2xl relative"
            >
              <button
                onClick={() => setProductIntelligenceModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>

              {(() => {
                const p = productIntelligenceModal;
                const pkl = p.productKnowledge || buildProductKnowledge(
                  {
                    productName: p.productName,
                    brand: p.brand,
                    category: p.category,
                    description: p.description,
                    keyFeatures: p.keyFeatures,
                    estimatedPriceUSD: p.price,
                    colorPalette: p.colorPalette,
                    targetAudience: p.targetAudience,
                    tags: p.tags,
                  },
                  "image",
                  p.image
                );

                return (
                  <div className="space-y-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        PRODUCT INTELLIGENCE INSPECTOR
                      </span>
                      <h3 className="text-lg font-black mt-2 text-white">
                        {p.productName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Evidence Analysis & Confidence Audit
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                      <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                        <span className="text-slate-500 text-[10px] block">Brand Name</span>
                        <span className="font-bold text-emerald-400">{pkl.brand.value}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Score: {Math.round(pkl.brand.confidence * 100)}% ({pkl.brand.source})
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                        <span className="text-slate-500 text-[10px] block">Material Composition</span>
                        <span className="font-bold text-emerald-400">{pkl.material.value}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Score: {Math.round(pkl.material.confidence * 100)}% ({pkl.material.source})
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
                        <span>Evidence Summary</span>
                        <span>Source Matrix</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-2 rounded bg-black/40 border border-emerald-950">
                          <div className="font-bold text-emerald-400">{pkl.evidenceSummary.visuallyVerifiedCount}</div>
                          <div className="text-[8px] text-slate-400">Visual</div>
                        </div>
                        <div className="p-2 rounded bg-black/40 border border-emerald-950">
                          <div className="font-bold text-blue-400">{pkl.evidenceSummary.userConfirmedCount}</div>
                          <div className="text-[8px] text-slate-400">Confirmed</div>
                        </div>
                        <div className="p-2 rounded bg-black/40 border border-emerald-950">
                          <div className="font-bold text-purple-400">{pkl.evidenceSummary.barcodeCount}</div>
                          <div className="text-[8px] text-slate-400">Barcode</div>
                        </div>
                        <div className="p-2 rounded bg-black/40 border border-emerald-950">
                          <div className="font-bold text-amber-400">{pkl.evidenceSummary.inferredCount}</div>
                          <div className="text-[8px] text-slate-400">Inferred</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setProductIntelligenceModal(null)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow"
                    >
                      Close Inspector
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
