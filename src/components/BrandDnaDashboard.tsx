"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { BrandDNA, StoreConfig } from "@/lib/types";

interface BrandDnaDashboardProps {
    brandDna: BrandDNA;
    isLocked: boolean;
    onUpdateBrandDna: (updated: BrandDNA) => void;
    onApplyToStore: (dna: BrandDNA) => void;
    onToggleLock: (locked: boolean) => void;
    onClose?: () => void;
}

export default function BrandDnaDashboard({
    brandDna,
    isLocked,
    onUpdateBrandDna,
    onApplyToStore,
    onToggleLock,
    onClose,
}: BrandDnaDashboardProps) {
    const [dna, setDna] = useState<BrandDNA>(brandDna);
    const [activeTab, setActiveTab] = useState<"visual" | "typography" | "design" | "communication">("visual");

    function handleChange<K extends keyof BrandDNA>(key: K, value: BrandDNA[K]) {
        const updated = { ...dna, [key]: value };
        setDna(updated);
        onUpdateBrandDna(updated);
    }

    return (
        <div className="bg-[#080c09] text-white rounded-2xl border border-emerald-950 p-5 shadow-2xl font-mono text-xs max-w-2xl w-full">

            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-950">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white tracking-tight">
                            Brand DNA Profile
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                            VLM Extracted
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                        AI-extracted visual identity & design language.
                    </p>
                </div>

                {/* Brand DNA Lock Toggle */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onToggleLock(!isLocked)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 border transition ${isLocked
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow"
                                : "bg-[#050706] text-slate-400 border-emerald-950 hover:text-white"
                            }`}
                    >
                        <span>{isLocked ? "Brand DNA Lock 🔒 ENABLED" : "Brand DNA Lock 🔓 UNLOCKED"}</span>
                    </button>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white font-bold p-1"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-emerald-950 overflow-x-auto">
                {(["visual", "typography", "design", "communication"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider capitalize transition ${activeTab === tab
                                ? "bg-emerald-500 text-black shadow"
                                : "text-slate-400 hover:text-white bg-[#050706]"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4 mb-5 min-h-[220px]">
                {activeTab === "visual" && (
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-emerald-400 uppercase">
                            Visual Palette & Hex Swatches
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Primary", key: "primaryColor" },
                                { label: "Secondary", key: "secondaryColor" },
                                { label: "Accent", key: "accentColor" },
                                { label: "Background", key: "backgroundColor" },
                            ].map(({ label, key }) => (
                                <div key={key} className="p-2.5 rounded-xl bg-[#050706] border border-emerald-950 flex flex-col gap-1.5">
                                    <span className="text-[10px] text-slate-400 font-bold">{label}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={(dna.visualIdentity as any)[key] || "#10b981"}
                                            onChange={(e) =>
                                                handleChange("visualIdentity", {
                                                    ...dna.visualIdentity,
                                                    [key]: e.target.value,
                                                })
                                            }
                                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                        />
                                        <span className="text-[11px] font-bold text-white uppercase font-mono">
                                            {(dna.visualIdentity as any)[key]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1">
                                Contrast Characteristic
                            </span>
                            <p className="text-xs text-emerald-200 font-sans">{dna.visualIdentity.contrastProfile}</p>
                        </div>
                    </div>
                )}

                {activeTab === "typography" && (
                    <div className="space-y-3 font-sans text-xs">
                        <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                            <span className="text-[10px] font-bold text-emerald-400 block mb-1 uppercase font-mono">
                                Heading Style
                            </span>
                            <p className="text-white font-bold">{dna.typography.headingStyle}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                            <span className="text-[10px] font-bold text-emerald-400 block mb-1 uppercase font-mono">
                                Body Text Style & Recommendation
                            </span>
                            <p className="text-slate-300">{dna.typography.bodyStyle}</p>
                            <p className="text-[11px] text-emerald-300 font-bold mt-1">
                                Font: {dna.typography.recommendedFont}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === "design" && (
                    <div className="space-y-3 font-sans text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-mono">
                                    Theme Style Personality
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono font-bold text-[11px] capitalize border border-emerald-800/40">
                                    {dna.designLanguage.stylePersonality}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-mono">
                                    Card Style
                                </span>
                                <p className="text-white font-medium">{dna.designLanguage.cardStyle}</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-mono">
                                Layout & Image Presentation
                            </span>
                            <p className="text-slate-300">{dna.designLanguage.layoutCharacteristics}</p>
                        </div>
                    </div>
                )}

                {activeTab === "communication" && (
                    <div className="space-y-3 font-sans text-xs">
                        <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                            <span className="text-[10px] font-bold text-emerald-400 block mb-1 uppercase font-mono">
                                Brand Tone of Voice
                            </span>
                            <p className="text-white font-bold">{dna.brandCommunication.brandTone}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#050706] border border-emerald-950">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-mono">
                                Target Audience & Writing Style
                            </span>
                            <p className="text-slate-300 mb-1">{dna.brandCommunication.targetAudience}</p>
                            <p className="text-[11px] text-slate-400 italic">{dna.brandCommunication.writingStyle}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-emerald-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-sans">
                        Status: {isLocked ? "Locked to Store" : "Unlocked"}
                    </span>
                </div>

                <button
                    onClick={() => onApplyToStore(dna)}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow transition active:scale-95"
                >
                    Apply Brand DNA to Store ✨
                </button>
            </div>

        </div>
    );
}
