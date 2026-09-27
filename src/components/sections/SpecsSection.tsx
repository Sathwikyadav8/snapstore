"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sliders, Cpu, ShieldCheck, Zap, Layers } from "lucide-react";

interface SpecItem {
    label: string;
    value: string;
    category?: string;
}

interface SpecsSectionProps {
    title?: string;
    subtitle?: string;
    specs?: SpecItem[];
    accentColor?: string;
}

export default function SpecsSection({
    title = "Technical Specifications",
    subtitle = "Precision engineered materials and hardware architecture",
    specs = [
        { label: "Material Craft", value: "Aerospace Grade Anodized Finish", category: "Build" },
        { label: "Visual VLM Analysis", value: "Grounding Accuracy > 98%", category: "AI Engine" },
        { label: "Color Gamut", value: "P3 Wide Color Space", category: "Display" },
        { label: "Durability Rating", value: "IP68 Dust & Water Resistant", category: "Build" },
        { label: "Energy Efficiency", value: "Ultra-Low Latency Edge Processing", category: "Performance" },
        { label: "Warranty", value: "2-Year Global AppleCare Style Warranty", category: "Support" },
    ],
    accentColor = "#0071e3",
}: SpecsSectionProps) {
    return (
        <section id="specs" className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832] text-[#f5f5f7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-2xl mx-auto mb-16 space-y-3"
                >
                    <span
                        className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#14161b] border border-[#242832]"
                        style={{ color: accentColor }}
                    >
                        Engineering Specs
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
                        {title}
                    </h2>
                    <p className="text-sm md:text-base text-[#a1a1a6] font-sans">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Tabular Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specs.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="p-6 rounded-3xl bg-[#14161b] border border-[#242832] space-y-2 hover:border-[#0071e3]/40 transition"
                        >
                            {item.category && (
                                <div className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-500">
                                    {item.category}
                                </div>
                            )}
                            <div className="text-sm font-semibold text-slate-300 font-sans">
                                {item.label}
                            </div>
                            <div className="text-base sm:text-lg font-bold text-white font-display">
                                {item.value}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
