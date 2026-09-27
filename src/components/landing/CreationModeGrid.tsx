"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Sparkles, Package, Palette } from "lucide-react";

interface CreationModeGridProps {
    activeMode: string;
    onSelectMode: (mode: "shop_photo" | "business_desc" | "product_entry" | "brand_dna") => void;
}

export default function CreationModeGrid({
    activeMode,
    onSelectMode,
}: CreationModeGridProps) {
    const modes = [
        {
            id: "shop_photo",
            icon: Camera,
            title: "Storefront Snap",
            description: "Upload a shop exterior photo to auto-extract branding & inventory",
        },
        {
            id: "business_desc",
            icon: Sparkles,
            title: "Business Concept",
            description: "Describe your business idea and generate a full storefront instantly",
        },
        {
            id: "product_entry",
            icon: Package,
            title: "Single Item Snap",
            description: "Analyze individual product photos for VLM spec extraction",
        },
        {
            id: "brand_dna",
            icon: Palette,
            title: "Brand DNA Extractor",
            description: "Upload logos or brand banners to extract color palettes & typography",
        },
    ] as const;

    return (
        <section id="creation-modes" className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#14161b] text-[#0071e3] border border-[#242832]">
                        Creation Workflows
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
                        Choose Your Entry Point
                    </h2>
                    <p className="text-sm md:text-base text-[#a1a1a6] font-sans">
                        Select how you would like the AI studio engine to build your store
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {modes.map((m, idx) => {
                        const IconComponent = m.icon;
                        const isSelected = activeMode === m.id;
                        return (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                onClick={() => onSelectMode(m.id)}
                                className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl ${isSelected
                                        ? "bg-[#14161b] border-[#0071e3] ring-1 ring-[#0071e3] shadow-[#0071e3]/10"
                                        : "bg-[#14161b] border-[#242832] hover:border-[#0071e3]/50 hover:-translate-y-1"
                                    }`}
                            >
                                <div>
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition duration-300 ${isSelected
                                                ? "bg-[#0071e3] text-white"
                                                : "bg-[#0b0c0e] text-[#0071e3] border border-[#242832] group-hover:bg-[#0071e3] group-hover:text-white"
                                            }`}
                                    >
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold font-display text-white mb-2">
                                        {m.title}
                                    </h3>
                                    <p className="text-xs text-[#a1a1a6] leading-relaxed font-sans">
                                        {m.description}
                                    </p>
                                </div>

                                <div className="pt-6 mt-4 border-t border-[#242832] flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-[#0071e3] font-mono group-hover:translate-x-1 transition duration-200">
                                        Select Mode →
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
