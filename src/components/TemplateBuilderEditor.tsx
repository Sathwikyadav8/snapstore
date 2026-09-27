"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoreConfig, StoreProduct } from "@/lib/types";
import {
    Sparkles,
    Palette,
    LayoutGrid,
    Check,
    Eye,
    Edit3,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Layers,
    AlertTriangle,
    CheckCircle2,
    Share2,
    SlidersHorizontal,
    ChevronRight,
    ArrowLeft,
    Type
} from "lucide-react";

export interface TemplatePreset {
    id: string;
    name: string;
    category: string;
    description: string;
    thumbnail: string;
    themeColor: string;
    accentColor: string;
    fontPreset: "sans" | "serif" | "mono";
    sections: string[];
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
    {
        id: "minimal",
        name: "Minimal Studio",
        category: "Modern & Clean",
        description: "Ultra-clean layout with spacious typography and high contrast dark graphite cards.",
        thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
        themeColor: "#0f172a",
        accentColor: "#38bdf8",
        fontPreset: "sans",
        sections: ["hero", "products", "story", "testimonials", "faq", "footer"],
    },
    {
        id: "bold",
        name: "Bold Impact Catalog",
        category: "High Energy",
        description: "Prominent headlines, vibrant CTA buttons, and immersive product grid cards.",
        thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80",
        themeColor: "#09090b",
        accentColor: "#f43f5e",
        fontPreset: "sans",
        sections: ["hero", "products", "testimonials", "story", "faq", "footer"],
    },
    {
        id: "editorial",
        name: "Editorial Lookbook",
        category: "Luxe & Fashion",
        description: "Classic serif typography, magazine-style layouts, and warm gold accents.",
        thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
        themeColor: "#14110f",
        accentColor: "#d97706",
        fontPreset: "serif",
        sections: ["hero", "story", "products", "testimonials", "faq", "footer"],
    },
    {
        id: "grid",
        name: "Cyber Bento Grid",
        category: "Tech & Accessories",
        description: "Glassmorphism cards, glowing status pills, and interactive bento showcases.",
        thumbnail: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
        themeColor: "#050706",
        accentColor: "#10b981",
        fontPreset: "mono",
        sections: ["hero", "products", "story", "faq", "testimonials", "footer"],
    },
];

const COLOR_PRESETS = [
    { name: "Obsidian Slate", theme: "#0e0f12", accent: "#0071e3" },
    { name: "Emerald Cyber", theme: "#050706", accent: "#10b981" },
    { name: "Crimson Velvet", theme: "#0f0507", accent: "#f43f5e" },
    { name: "Amber Luxe", theme: "#14110f", accent: "#d97706" },
    { name: "Nordic Frost", theme: "#0f172a", accent: "#38bdf8" },
];

const FONT_PRESETS = [
    { name: "Sans Modern (Inter)", value: "sans", fontClass: "font-sans" },
    { name: "Editorial Serif (Playfair)", value: "serif", fontClass: "font-serif" },
    { name: "Tech Monospace", value: "mono", fontClass: "font-mono" },
];

interface TemplateBuilderEditorProps {
    config: StoreConfig;
    products: StoreProduct[];
    onUpdateStore: (newConfig: StoreConfig, newProducts: StoreProduct[]) => void;
    onOpenDeployModal: () => void;
}

export default function TemplateBuilderEditor({
    config,
    products,
    onUpdateStore,
    onOpenDeployModal,
}: TemplateBuilderEditorProps) {
    const [activeTab, setActiveTab] = useState<"gallery" | "editor">("editor");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("minimal");
    const [sidebarTab, setSidebarTab] = useState<"style" | "sections" | "products">("style");
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [userEditedProductIds, setUserEditedProductIds] = useState<Set<string>>(new Set());
    const [isVisitorPreview, setIsVisitorPreview] = useState(false);

    // Section order state
    const [sectionOrder, setSectionOrder] = useState<string[]>([
        "hero",
        "products",
        "story",
        "testimonials",
        "faq",
        "footer",
    ]);

    const activeTemplate = TEMPLATE_PRESETS.find((t) => t.id === selectedTemplateId) || TEMPLATE_PRESETS[0];

    function handleSelectTemplate(preset: TemplatePreset) {
        setSelectedTemplateId(preset.id);
        setSectionOrder(preset.sections);
        const updatedConfig: StoreConfig = {
            ...config,
            themeColor: preset.themeColor,
            accentColor: preset.accentColor,
            layoutStyle: preset.id as any,
        };
        onUpdateStore(updatedConfig, products);
        setActiveTab("editor");
    }

    function handleMoveSection(index: number, direction: "up" | "down") {
        const next = [...sectionOrder];
        const targetIdx = direction === "up" ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= next.length) return;
        const temp = next[index];
        next[index] = next[targetIdx];
        next[targetIdx] = temp;
        setSectionOrder(next);
    }

    function handleProductEdit(productId: string, field: string, value: any) {
        setUserEditedProductIds((prev) => new Set(prev).add(productId));
        const nextProducts = products.map((p) => {
            if (p.id === productId) {
                return { ...p, [field]: value };
            }
            return p;
        });
        onUpdateStore(config, nextProducts);
    }

    const selectedProduct = products.find((p) => p.id === editingProductId);

    return (
        <div className="min-h-screen bg-[#090a0d] text-slate-100 font-sans flex flex-col">
            {/* Top Squarespace-style Control Navigation Strip */}
            <header className="sticky top-0 z-50 bg-[#12141a]/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-extrabold text-sm text-white tracking-tight">VisionCart Site Builder</span>
                    </div>

                    <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

                    <div className="flex items-center gap-1 bg-[#090a0d] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab("gallery")}
                            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === "gallery" ? "bg-[#0071e3] text-white shadow" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Palette className="w-3.5 h-3.5" />
                            <span>Template Gallery</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("editor")}
                            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === "editor" ? "bg-[#0071e3] text-white shadow" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Live Builder Editor</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <button
                        onClick={() => setIsVisitorPreview(!isVisitorPreview)}
                        className={`px-3.5 py-1.5 rounded-full border transition font-bold flex items-center gap-1.5 ${isVisitorPreview
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                            }`}
                    >
                        {isVisitorPreview ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                        <span>{isVisitorPreview ? "Visitor Preview Mode" : "Builder Mode"}</span>
                    </button>

                    <button
                        onClick={onOpenDeployModal}
                        className="px-5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-extrabold shadow-lg transition active:scale-95 flex items-center gap-1.5"
                    >
                        <span>🚀 Publish & Deploy</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            {activeTab === "gallery" ? (
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-[#0071e3]/20 text-[#2997ff] border border-[#0071e3]/30 uppercase tracking-widest inline-block mb-3">
                            Squarespace-Inspired UX Pattern
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Choose Your Store Template</h2>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Select a pre-configured design layout. Your auto-generated products and brand data will automatically populate into the chosen template.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {TEMPLATE_PRESETS.map((preset) => {
                            const isSelected = selectedTemplateId === preset.id;
                            return (
                                <div
                                    key={preset.id}
                                    onClick={() => handleSelectTemplate(preset)}
                                    className={`group relative rounded-3xl overflow-hidden border transition-all cursor-pointer ${isSelected
                                        ? "border-[#0071e3] ring-2 ring-[#0071e3]/40 bg-[#12141a]"
                                        : "border-slate-800 bg-[#12141a]/60 hover:border-slate-600"
                                        }`}
                                >
                                    <div className="aspect-[16/9] relative overflow-hidden bg-slate-950">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={preset.thumbnail}
                                            alt={preset.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/80 text-white backdrop-blur-md border border-white/10 uppercase tracking-wider">
                                                {preset.category}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-4 right-4 bg-emerald-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow">
                                                ✓ Active Template
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{preset.name}</h3>
                                            <p className="text-xs text-slate-400 line-clamp-1">{preset.description}</p>
                                        </div>

                                        <button className="px-4 py-2 rounded-xl bg-[#0071e3] text-white font-bold text-xs group-hover:bg-[#0077ed] transition whitespace-nowrap">
                                            Use Template →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Customization Side Panel (Hidden in Visitor Preview) */}
                    {!isVisitorPreview && (
                        <aside className="w-80 sm:w-96 bg-[#12141a] border-r border-slate-800 flex flex-col h-[calc(100vh-57px)]">
                            {/* Sidebar Tabs */}
                            <div className="p-3 border-b border-slate-800 grid grid-cols-3 gap-1 bg-[#090a0d] text-xs font-semibold">
                                <button
                                    onClick={() => setSidebarTab("style")}
                                    className={`py-2 rounded-lg text-center transition ${sidebarTab === "style" ? "bg-[#0071e3] text-white shadow" : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    🎨 Style Presets
                                </button>
                                <button
                                    onClick={() => setSidebarTab("sections")}
                                    className={`py-2 rounded-lg text-center transition ${sidebarTab === "sections" ? "bg-[#0071e3] text-white shadow" : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    🧩 Sections
                                </button>
                                <button
                                    onClick={() => setSidebarTab("products")}
                                    className={`py-2 rounded-lg text-center transition ${sidebarTab === "products" ? "bg-[#0071e3] text-white shadow" : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    📦 Products
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs">
                                {sidebarTab === "style" && (
                                    <>
                                        {/* Brand Name Input */}
                                        <div>
                                            <label className="block text-slate-400 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                                                Store Name & Branding
                                            </label>
                                            <input
                                                type="text"
                                                value={config.storeName}
                                                onChange={(e) => onUpdateStore({ ...config, storeName: e.target.value }, products)}
                                                className="w-full px-3 py-2 rounded-xl bg-[#090a0d] border border-slate-800 text-white font-bold focus:outline-none focus:border-[#0071e3]"
                                            />
                                        </div>

                                        {/* Tagline */}
                                        <div>
                                            <label className="block text-slate-400 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                                                Tagline / Subheadline
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={config.tagline || ""}
                                                onChange={(e) => onUpdateStore({ ...config, tagline: e.target.value }, products)}
                                                className="w-full px-3 py-2 rounded-xl bg-[#090a0d] border border-slate-800 text-slate-300 font-medium focus:outline-none focus:border-[#0071e3]"
                                            />
                                        </div>

                                        {/* Color Theme Presets */}
                                        <div>
                                            <label className="block text-slate-400 font-bold mb-2 uppercase text-[10px] tracking-wider">
                                                Preset Color Palettes
                                            </label>
                                            <div className="space-y-2">
                                                {COLOR_PRESETS.map((p) => {
                                                    const isActive = config.themeColor === p.theme;
                                                    return (
                                                        <button
                                                            key={p.name}
                                                            onClick={() =>
                                                                onUpdateStore(
                                                                    { ...config, themeColor: p.theme, accentColor: p.accent },
                                                                    products
                                                                )
                                                            }
                                                            className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition ${isActive
                                                                ? "border-[#0071e3] bg-[#0071e3]/10 text-white font-bold"
                                                                : "border-slate-800 bg-[#090a0d] text-slate-300 hover:border-slate-700"
                                                                }`}
                                                        >
                                                            <span className="text-xs">{p.name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: p.theme }}></span>
                                                                <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: p.accent }}></span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Typography Style */}
                                        <div>
                                            <label className="block text-slate-400 font-bold mb-2 uppercase text-[10px] tracking-wider">
                                                Font & Heading Preset
                                            </label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {FONT_PRESETS.map((f) => (
                                                    <button
                                                        key={f.value}
                                                        onClick={() =>
                                                            onUpdateStore(
                                                                {
                                                                    ...config,
                                                                    typographyConfig: {
                                                                        headingFont: f.value as any,
                                                                        bodyFont: "sans",
                                                                        stylePersonality: f.name,
                                                                    },
                                                                },
                                                                products
                                                            )
                                                        }
                                                        className={`p-2.5 rounded-xl border text-left font-semibold transition ${config.typographyConfig?.headingFont === f.value
                                                            ? "border-[#0071e3] bg-[#0071e3]/10 text-white font-bold"
                                                            : "border-slate-800 bg-[#090a0d] text-slate-400 hover:border-slate-700"
                                                            }`}
                                                    >
                                                        <span className={f.fontClass}>{f.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {sidebarTab === "sections" && (
                                    <div>
                                        <label className="block text-slate-400 font-bold mb-2 uppercase text-[10px] tracking-wider">
                                            Reorder Layout Sections
                                        </label>
                                        <p className="text-[11px] text-slate-500 mb-4">Use arrows to adjust the order of sections on your homepage.</p>
                                        <div className="space-y-2">
                                            {sectionOrder.map((sectionKey, idx) => (
                                                <div
                                                    key={sectionKey}
                                                    className="p-3 rounded-xl bg-[#090a0d] border border-slate-800 flex items-center justify-between text-xs font-bold capitalize text-slate-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600 font-mono">#{idx + 1}</span>
                                                        <span>{sectionKey} Section</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            disabled={idx === 0}
                                                            onClick={() => handleMoveSection(idx, "up")}
                                                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs flex items-center justify-center font-mono"
                                                        >
                                                            ↑
                                                        </button>
                                                        <button
                                                            disabled={idx === sectionOrder.length - 1}
                                                            onClick={() => handleMoveSection(idx, "down")}
                                                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs flex items-center justify-center font-mono"
                                                        >
                                                            ↓
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sidebarTab === "products" && (
                                    <div>
                                        <label className="block text-slate-400 font-bold mb-2 uppercase text-[10px] tracking-wider">
                                            Product Catalog ({products.length})
                                        </label>
                                        <p className="text-[11px] text-slate-500 mb-4">Click any item to edit copy and inspect confidence evidence.</p>

                                        <div className="space-y-2">
                                            {products.map((p) => {
                                                const isEdited = userEditedProductIds.has(p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => setEditingProductId(p.id)}
                                                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${editingProductId === p.id
                                                            ? "border-[#0071e3] bg-[#0071e3]/10"
                                                            : "border-slate-800 bg-[#090a0d] hover:border-slate-700"
                                                            }`}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={p.image} alt={p.productName} className="w-10 h-10 object-cover rounded-lg bg-black" />
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="flex justify-between items-center mb-0.5">
                                                                <h4 className="font-bold text-white text-xs truncate">{p.productName}</h4>
                                                                <span className="text-emerald-400 font-bold text-xs">${p.price.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {isEdited ? (
                                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold">
                                                                        ✍️ Edited by User
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                                                                        ✨ AI Generated
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Right Live Preview Canvas */}
                    <main className="flex-1 bg-[#050608] overflow-y-auto p-4 sm:p-8 flex justify-center">
                        <div className="max-w-5xl w-full bg-[#0e0f12] text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                            {/* Fake Browser Toolbar */}
                            <div className="bg-[#181a20] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                                    <span className="ml-2 text-slate-500 text-[11px] truncate">
                                        https://{config.storeName.toLowerCase().replace(/\s+/g, "")}.visioncart.app
                                    </span>
                                </div>
                                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                                    LIVE SQUARESPAGE CANVAS PREVIEW
                                </div>
                            </div>

                            {/* Rendered Live Storefront */}
                            <div className="p-6 sm:p-12 space-y-16 flex-1" style={{ backgroundColor: config.themeColor || "#0e0f12" }}>
                                {sectionOrder.map((sec) => {
                                    if (sec === "hero") {
                                        return (
                                            <section key="hero" className="text-center max-w-3xl mx-auto py-8">
                                                <span
                                                    className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-4 border"
                                                    style={{ backgroundColor: `${config.accentColor || "#0071e3"}20`, color: config.accentColor || "#0071e3", borderColor: `${config.accentColor || "#0071e3"}40` }}
                                                >
                                                    OFFICIAL STORE COLLECTION
                                                </span>
                                                <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
                                                    {config.heroHeadline || config.storeName}
                                                </h1>
                                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
                                                    {config.heroSubheadline || config.tagline}
                                                </p>
                                                <button
                                                    className="px-8 py-3 rounded-full font-bold text-xs text-black shadow-lg transition active:scale-95"
                                                    style={{ backgroundColor: config.accentColor || "#0071e3", color: "#ffffff" }}
                                                >
                                                    Shop Collection →
                                                </button>
                                            </section>
                                        );
                                    }

                                    if (sec === "products") {
                                        return (
                                            <section key="products">
                                                <h2 className="text-2xl font-black mb-8 border-b border-white/10 pb-4">Curated Catalog</h2>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {products.map((p) => (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => setEditingProductId(p.id)}
                                                            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-4 hover:border-[#0071e3] transition cursor-pointer"
                                                        >
                                                            <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-black relative">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={p.image} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                                {p.badge && (
                                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-black/80 text-white backdrop-blur-md">
                                                                        {p.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h3 className="font-bold text-sm text-white group-hover:text-[#2997ff] transition">{p.productName}</h3>
                                                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                                                <span className="text-emerald-400 font-black text-sm">${p.price.toFixed(2)}</span>
                                                                <button className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[10px] hover:bg-white/20 transition">
                                                                    Quick View
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        );
                                    }

                                    if (sec === "story") {
                                        return (
                                            <section key="story" className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] text-center max-w-3xl mx-auto">
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
                                                    OUR CRAFT & PHILOSOPHY
                                                </span>
                                                <h3 className="text-2xl font-black mb-3">{config.designDecision?.storyTitle || `About ${config.storeName}`}</h3>
                                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{config.aboutText}</p>
                                            </section>
                                        );
                                    }

                                    if (sec === "testimonials") {
                                        return (
                                            <section key="testimonials">
                                                <h3 className="text-xl font-black text-center mb-8">Verified Customer Reviews</h3>
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    {(config.testimonials || []).map((t, idx) => (
                                                        <div key={idx} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col justify-between">
                                                            <p className="text-xs text-slate-300 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                                                            <div className="flex justify-between items-center text-[11px] font-bold">
                                                                <span>{t.name}</span>
                                                                <span className="text-emerald-400 text-[9px] bg-emerald-950 px-2 py-0.5 rounded font-mono">{t.role || "Verified Buyer"}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        );
                                    }

                                    if (sec === "faq") {
                                        return (
                                            <section key="faq" className="max-w-2xl mx-auto">
                                                <h3 className="text-xl font-black text-center mb-6">Frequently Asked Questions</h3>
                                                <div className="space-y-3">
                                                    {(config.faq || []).map((item, idx) => (
                                                        <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 text-xs">
                                                            <div className="font-bold text-white mb-1">Q: {item.question}</div>
                                                            <div className="text-slate-400">A: {item.answer}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        );
                                    }

                                    if (sec === "footer") {
                                        return (
                                            <footer key="footer" className="pt-12 border-t border-white/10 text-center text-xs text-slate-500">
                                                <p className="font-bold text-white mb-1">{config.storeName}</p>
                                                <p className="text-[10px]">© 2026 {config.storeName}. All rights reserved.</p>
                                            </footer>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {/* Per-Product Card Editor Modal with Evidence Confidence Indicators */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-xs text-white"
                        onClick={() => setEditingProductId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#12141a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {userEditedProductIds.has(selectedProduct.id) ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                ✍️ Edited by User
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                ✨ VisionCart AI Generated
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black">{selectedProduct.productName}</h3>
                                </div>
                                <button onClick={() => setEditingProductId(null)} className="text-slate-400 hover:text-white font-bold">
                                    ✕
                                </button>
                            </div>

                            {/* Confidence Indicator Warning Card */}
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <div className="font-extrabold text-[11px] mb-0.5">Evidence Confidence Notice</div>
                                    <p className="text-[10px] text-amber-200/80 leading-relaxed font-sans">
                                        Some material details weren&apos;t 100% clearly visible in the product photo. Please review and update fields below.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 font-sans">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Product Name</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.productName}
                                        onChange={(e) => handleProductEdit(selectedProduct.id, "productName", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#090a0d] border border-slate-800 text-white font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Price (USD)</label>
                                    <input
                                        type="number"
                                        value={selectedProduct.price}
                                        onChange={(e) => handleProductEdit(selectedProduct.id, "price", parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#090a0d] border border-slate-800 text-emerald-400 font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Grounded Description</label>
                                    <textarea
                                        rows={3}
                                        value={selectedProduct.description}
                                        onChange={(e) => handleProductEdit(selectedProduct.id, "description", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#090a0d] border border-slate-800 text-slate-300 text-xs leading-relaxed"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setEditingProductId(null)}
                                className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-extrabold text-xs shadow transition"
                            >
                                Save & Update Preview
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
