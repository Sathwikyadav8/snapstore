"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCapture from "@/components/ImageCapture";
import GeneratedStore from "@/components/GeneratedStore";
import LoadingExperience from "@/components/LoadingExperience";
import BrandDnaDashboard from "@/components/BrandDnaDashboard";
import ProductAnalysisReview from "@/components/ProductAnalysisReview";
import type { ProductInfo, StoreConfig, StoreProduct, BrandDNA, ProductKnowledgeObject } from "@/lib/types";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHeroSection from "@/components/landing/LandingHeroSection";
import CreationModeGrid from "@/components/landing/CreationModeGrid";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SavedProjectsSection from "@/components/landing/SavedProjectsSection";
import LandingFooter from "@/components/landing/LandingFooter";
import {
  Camera,
  Sparkles,
  Package,
  Palette,
  Plus,
  Folder,
  Trash2,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  Check,
  Lock,
  Unlock,
  Menu,
  X,
  Store,
  Layers,
  Sparkle,
  Eye,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

type Stage = "idle" | "identifying" | "reviewing" | "generating" | "image_generating" | "extracting_dna" | "store_view";

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: string;
  config: StoreConfig;
  products: StoreProduct[];
}

function dataUrlToParts(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mimeType = meta.match(/data:(.*);base64/)?.[1] || "image/jpeg";
  return { base64, mimeType };
}

const PROJECTS_STORAGE_KEY = "snapstore_projects_v4";
const CURRENT_ACTIVE_KEY = "snapstore_active_project_id";

export default function Home() {
  const [userStoreName, setUserStoreName] = useState("Aura Marketplace");
  const [image, setImage] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [projectsList, setProjectsList] = useState<SavedProject[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [projectTab, setProjectTab] = useState<"projects" | "templates">("projects");
  const [toast, setToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Brand DNA Extraction state
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null);
  const [isBrandDnaLocked, setIsBrandDnaLocked] = useState(false);
  const [isExtractingDna, setIsExtractingDna] = useState(false);
  const [brandDescriptionText, setBrandDescriptionText] = useState("");
  const [showDnaModal, setShowDnaModal] = useState(false);

  function fireToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // Load saved projects list from localStorage on mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (savedProjects) {
        const parsed: SavedProject[] = JSON.parse(savedProjects);
        setProjectsList(parsed);

        const activeId = localStorage.getItem(CURRENT_ACTIVE_KEY);
        if (activeId) {
          const activeProj = parsed.find((p) => p.id === activeId);
          if (activeProj) {
            setCurrentProjectId(activeProj.id);
            setStoreConfig(activeProj.config);
            setProducts(activeProj.products);
            setUserStoreName(activeProj.config.storeName);
            if (activeProj.config.brandDna) {
              setBrandDna(activeProj.config.brandDna);
              setIsBrandDnaLocked(!!activeProj.config.brandDnaLocked);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load saved projects", e);
    }
  }, []);

  // Update dynamic document title per store
  useEffect(() => {
    if (stage === "store_view" && storeConfig?.storeName) {
      document.title = `${storeConfig.storeName} — SnapStore AI Studio`;
    } else if (storeConfig?.storeName) {
      document.title = `${storeConfig.storeName} (Studio) — SnapStore AI Studio`;
    } else {
      document.title = "SnapStore AI Studio — Multimodal Storefront Engine";
    }
  }, [stage, storeConfig?.storeName]);

  function persistProjects(
    projId: string,
    config: StoreConfig,
    prods: StoreProduct[]
  ) {
    const now = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newProject: SavedProject = {
      id: projId,
      name: config.storeName || "Untitled Store",
      updatedAt: now,
      config,
      products: prods,
    };

    setProjectsList((prev) => {
      const filtered = prev.filter((p) => p.id !== projId);
      const updated = [newProject, ...filtered];
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(CURRENT_ACTIVE_KEY, projId);
      } catch (e) {
        console.error("Storage error", e);
      }
      return updated;
    });
  }

  function deleteProject(idToDelete: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Delete this workspace?")) {
      setProjectsList((prev) => {
        const next = prev.filter((p) => p.id !== idToDelete);
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next));
        if (currentProjectId === idToDelete) {
          setCurrentProjectId(null);
          setStoreConfig(null);
          setProducts([]);
          setStage("idle");
        }
        return next;
      });
      fireToast("Workspace deleted");
    }
  }

  function loadProject(proj: SavedProject) {
    setCurrentProjectId(proj.id);
    setStoreConfig(proj.config);
    setProducts(proj.products);
    setUserStoreName(proj.config.storeName);
    setStage("store_view");
    localStorage.setItem(CURRENT_ACTIVE_KEY, proj.id);
    fireToast(`Loaded "${proj.name}"`);
    setIsMobileMenuOpen(false);
  }

  function startNewProject() {
    setCurrentProjectId(null);
    setStoreConfig(null);
    setProducts([]);
    setImage(null);
    setCapturedImage(null);
    setActivePkl(null);
    setPendingProductInfo(null);
    setBrandDna(null);
    setIsBrandDnaLocked(false);
    setStage("idle");
    fireToast("Started new workspace");
    setIsMobileMenuOpen(false);
  }

  function handleUpdateStore(newConfig: StoreConfig, newProducts: StoreProduct[]) {
    setStoreConfig(newConfig);
    setProducts(newProducts);
    if (currentProjectId) {
      persistProjects(currentProjectId, newConfig, newProducts);
    }
  }

  async function handleExtractBrandDna(dataUrl: string) {
    if (!dataUrl) return;
    setIsExtractingDna(true);
    setStage("extracting_dna");
    setError(null);
    fireToast("Analyzing Brand DNA & Visual Tokens...");

    try {
      const { base64, mimeType } = dataUrlToParts(dataUrl);
      const res = await fetch("/api/extract-brand-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [{ base64, mimeType }],
          brandDescription: brandDescriptionText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Brand DNA extraction failed");

      setBrandDna(data.brandDna);
      setIsBrandDnaLocked(true);
      setShowDnaModal(true);
      fireToast("Brand DNA Extracted & Locked");
      setStage("idle");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to extract Brand DNA.";
      setError(msg);
      setRetryAction(() => () => handleExtractBrandDna(dataUrl));
      fireToast("Failed to extract Brand DNA");
      setStage("idle");
    } finally {
      setIsExtractingDna(false);
    }
  }

  const [activePkl, setActivePkl] = useState<ProductKnowledgeObject | null>(null);
  const [pendingProductInfo, setPendingProductInfo] = useState<ProductInfo | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Creation mode state
  const [creationMode, setCreationMode] = useState<"shop_photo" | "business_desc" | "product_entry" | "brand_dna">("shop_photo");
  const [businessDescInput, setBusinessDescInput] = useState("");
  const [isSubmittingGen, setIsSubmittingGen] = useState(false);

  async function handleGenerateFromShopPhoto(dataUrl: string) {
    if (!dataUrl) return;
    setError(null);
    setStage("generating");
    setIsSubmittingGen(true);
    fireToast("Analyzing shop name photo & generating website...");

    try {
      const { base64, mimeType } = dataUrlToParts(dataUrl);
      const res = await fetch("/api/generate-from-shop-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          storeName: userStoreName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate website from shop photo.");

      const activeProjId = "store_sp_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      setCurrentProjectId(activeProjId);
      setStoreConfig(data.config);
      setProducts(data.products);
      setUserStoreName(data.config.storeName);

      persistProjects(activeProjId, data.config, data.products);

      setStage("store_view");
      fireToast(`Website generated for "${data.config.storeName}"!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate website from shop photo.";
      setError(msg);
      setRetryAction(() => () => handleGenerateFromShopPhoto(dataUrl));
      setStage("idle");
    } finally {
      setIsSubmittingGen(false);
    }
  }

  async function handleGenerateFromBusinessDesc(descText: string) {
    const textToUse = descText || businessDescInput;
    if (!textToUse.trim()) {
      setError("Please type a description of your business.");
      return;
    }
    setError(null);
    setStage("generating");
    setIsSubmittingGen(true);
    fireToast("Designing complete website & catalog...");

    try {
      const res = await fetch("/api/generate-from-business-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: textToUse,
          storeName: userStoreName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate website from description.");

      const activeProjId = "store_bd_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      setCurrentProjectId(activeProjId);
      setStoreConfig(data.config);
      setProducts(data.products);
      setUserStoreName(data.config.storeName);

      persistProjects(activeProjId, data.config, data.products);

      setStage("store_view");
      fireToast(`Website generated for "${data.config.storeName}"!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate website from business description.";
      setError(msg);
      setRetryAction(() => () => handleGenerateFromBusinessDesc(textToUse));
      setStage("idle");
    } finally {
      setIsSubmittingGen(false);
    }
  }

  async function handleCapture(dataUrl?: string, textDescription?: string, barcodeData?: string) {
    if (dataUrl) {
      setImage(dataUrl);
      setCapturedImage(dataUrl);
    }
    setError(null);
    setStage("identifying");
    fireToast("Vision-Language Model processing evidence...");

    try {
      let reqBody: any = {
        storeName: userStoreName,
        brandDna: isBrandDnaLocked ? brandDna : null,
      };

      if (dataUrl) {
        const { base64, mimeType } = dataUrlToParts(dataUrl);
        reqBody.imageBase64 = base64;
        reqBody.mimeType = mimeType;
      }
      if (textDescription) {
        reqBody.textDescription = textDescription;
      }
      if (barcodeData) {
        reqBody.barcodeData = barcodeData;
      }

      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Identification failed");

      setPendingProductInfo(data.productInfo);
      setActivePkl(data.pkl || null);
      setStage("reviewing");
      fireToast("Product Knowledge Layer extracted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to extract product knowledge.";
      setError(msg);
      setRetryAction(() => () => handleCapture(dataUrl, textDescription, barcodeData));
      setStage("idle");
    }
  }

  async function handleConfirmProductKnowledge(confirmedPkl: ProductKnowledgeObject) {
    if (!pendingProductInfo) return;
    setError(null);
    setStage("generating");
    fireToast("Generating grounded storefront components...");

    try {
      const res = await fetch("/api/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productInfo: pendingProductInfo,
          pkl: confirmedPkl,
          storeName: userStoreName,
          brandDna: isBrandDnaLocked ? brandDna : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Storefront generation failed");

      const activeProjId = currentProjectId || "store_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      setCurrentProjectId(activeProjId);
      setStoreConfig(data.config);

      const existingProducts = products.filter((p) => p.id !== data.product.id);
      const updatedProducts = [data.product, ...existingProducts];
      setProducts(updatedProducts);

      persistProjects(activeProjId, data.config, updatedProducts);

      setStage("store_view");
      fireToast("Storefront successfully updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate storefront.");
      setStage("idle");
    }
  }

  const busy = stage === "identifying" || stage === "generating" || stage === "image_generating" || stage === "extracting_dna" || isSubmittingGen || isExtractingDna;

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-slate-100 font-sans antialiased selection:bg-[#0071e3] selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[100] bg-[#14161b] border border-[#242832] text-slate-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio Canvas Area */}
      <main className="min-h-screen bg-[#0b0c0e]">
        {stage === "reviewing" && activePkl ? (
          <div className="p-4 md:p-8 max-w-5xl mx-auto pt-24">
            <ProductAnalysisReview
              pkl={activePkl}
              image={capturedImage || image}
              onConfirmAndGenerate={handleConfirmProductKnowledge}
              onCancel={() => setStage("idle")}
            />
          </div>
        ) : stage !== "store_view" ? (
          <div className="relative min-h-screen">
            {/* Sticky Minimal Navbar */}
            <LandingNavbar
              onScrollToProjects={() => {
                document.getElementById("saved-projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              onScrollToHowItWorks={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Hero Section */}
            <LandingHeroSection
              onStartClick={() => {
                document.getElementById("creation-modes")?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Creation Mode Selection Grid */}
            <CreationModeGrid
              activeMode={creationMode}
              onSelectMode={(mode) => {
                setCreationMode(mode);
                document.getElementById("creation-inputs")?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Creation Input Section */}
            <section id="creation-inputs" className="py-16 bg-[#0b0c0e] border-t border-[#242832]">
              <div className="max-w-3xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#14161b] border border-[#242832] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#242832]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] shadow-[0_0_8px_#0071e3]" />
                      <span className="text-xs font-bold text-white font-display uppercase tracking-wider">
                        Configure Store Engine • Mode: {creationMode.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                      Store Title (Optional Custom Override)
                    </label>
                    <input
                      type="text"
                      value={userStoreName}
                      onChange={(e) => setUserStoreName(e.target.value)}
                      placeholder="e.g. Aura Marketplace (Leave blank for AI auto-detect)"
                      className="w-full bg-[#1a1d24] text-white font-medium text-xs sm:text-sm px-4 py-3 rounded-2xl border border-[#242832] focus:outline-none focus:border-[#0071e3] transition"
                    />
                  </div>

                  {/* Dynamic Mode Input Panes */}
                  <div className="pt-2">
                    {creationMode === "shop_photo" && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-300">Upload a storefront sign or shop logo to generate a complete website.</p>
                        <ImageCapture onCapture={(url) => url && handleGenerateFromShopPhoto(url)} disabled={busy} />
                      </div>
                    )}

                    {creationMode === "business_desc" && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-300">Describe your business, products, or brand concept.</p>
                        <textarea
                          rows={4}
                          value={businessDescInput}
                          onChange={(e) => setBusinessDescInput(e.target.value)}
                          placeholder="e.g. Artisanal sourdough bakery in Brooklyn offering organic sourdough loaves, croissants, and espresso..."
                          className="w-full bg-[#1a1d24] border border-[#242832] text-white font-medium text-xs sm:text-sm p-4 rounded-2xl focus:outline-none focus:border-[#0071e3]"
                        />
                        <button
                          onClick={() => handleGenerateFromBusinessDesc(businessDescInput)}
                          disabled={busy || !businessDescInput.trim()}
                          className="w-full py-3.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Complete Storefront →</span>
                        </button>
                      </div>
                    )}

                    {creationMode === "product_entry" && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-300">Snap a product photo to extract evidence and generate a product card.</p>
                        <ImageCapture onCapture={(url, text, barcode) => handleCapture(url, text, barcode)} disabled={busy} />
                      </div>
                    )}

                    {creationMode === "brand_dna" && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-300">Upload your logo or brand moodboard to extract color and visual tokens.</p>
                        <ImageCapture onCapture={(url) => url && handleExtractBrandDna(url)} disabled={busy} />
                      </div>
                    )}
                  </div>

                  {busy && (
                    <div className="mt-4 text-center">
                      <LoadingExperience stage={(stage === "idle" ? (isExtractingDna ? "extracting_dna" : "generating") : stage) as any} />
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-red-300 text-sm">Gemini Engine Notice</h4>
                          <p className="text-red-200/80 text-xs mt-0.5 leading-relaxed">{error}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                        {retryAction && (
                          <button
                            onClick={() => {
                              const act = retryAction;
                              setError(null);
                              setRetryAction(null);
                              act();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-red-100 border border-red-500/50 font-bold text-xs transition flex items-center gap-1.5 shadow"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setError(null);
                            setRetryAction(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Pipeline Step Sequence ("How It Works") */}
            <HowItWorksSection />

            {/* Saved Workspaces */}
            <SavedProjectsSection
              projects={projectsList}
              currentProjectId={currentProjectId}
              onSelectProject={(proj) => loadProject(proj)}
              onDeleteProject={(id, e) => deleteProject(id, e)}
              onNewProjectClick={() => {
                startNewProject();
                document.getElementById("creation-modes")?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Minimal Footer */}
            <LandingFooter />
          </div>
        ) : (
          /* Live Storefront View */
          storeConfig && (
            <div className="min-h-screen">
              <div className="sticky top-0 z-50 bg-[#14161b]/95 border-b border-[#242832] backdrop-blur-md px-6 py-3 flex items-center justify-between text-xs text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStage("idle")}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1a1d24] hover:bg-[#242832] font-bold border border-[#242832] text-slate-200 transition text-xs flex items-center gap-1.5"
                  >
                    <span>← Studio Dashboard</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-extrabold text-white text-xs truncate max-w-[200px]">
                      {storeConfig.storeName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${isEditMode
                      ? "bg-[#0071e3] text-white shadow"
                      : "bg-[#1a1d24] text-slate-300 border border-[#242832] hover:text-white"
                      }`}
                  >
                    {isEditMode ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                    <span>{isEditMode ? "Editing Active" : "Inline Editor"}</span>
                  </button>

                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] font-bold text-white text-xs transition shadow flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              <GeneratedStore
                config={storeConfig}
                products={products}
                isEditMode={isEditMode}
                onUpdateStore={handleUpdateStore}
                onAddProductClick={() => setIsAddProductModalOpen(true)}
                onSaveStore={() => {
                  if (currentProjectId) {
                    persistProjects(currentProjectId, storeConfig, products);
                    fireToast("Store saved");
                  }
                }}
                onToggleEditMode={() => setIsEditMode(!isEditMode)}
              />
            </div>
          )
        )}
      </main>

      {/* Brand DNA Modal */}
      <AnimatePresence>
        {showDnaModal && brandDna && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDnaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <BrandDnaDashboard
                brandDna={brandDna}
                isLocked={isBrandDnaLocked}
                onUpdateBrandDna={(updated) => setBrandDna(updated)}
                onToggleLock={(locked) => setIsBrandDnaLocked(locked)}
                onClose={() => setShowDnaModal(false)}
                onApplyToStore={(dna) => {
                  if (storeConfig) {
                    const updated: StoreConfig = {
                      ...storeConfig,
                      themeColor: dna.visualIdentity.primaryColor,
                      accentColor: dna.visualIdentity.accentColor,
                      brandDna: dna,
                      brandDnaLocked: true,
                    };
                    handleUpdateStore(updated, products);
                  }
                  setShowDnaModal(false);
                  fireToast("Brand DNA applied to storefront");
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
