"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";

interface LandingHeroSectionProps {
    onStartClick: () => void;
}

export default function LandingHeroSection({
    onStartClick,
}: LandingHeroSectionProps) {
    return (
        <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 bg-[#0b0c0e] overflow-hidden text-[#f5f5f7]">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0071e3]/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14161b] border border-[#242832] text-xs font-bold text-slate-300 shadow-lg"
                    >
                        <Sparkles className="w-4 h-4 text-[#0071e3]" />
                        <span>Multimodal Vision & LLM Store Engine</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white leading-[1.08]"
                    >
                        Turn Product Photos into <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-white via-[#f5f5f7] to-[#0071e3] bg-clip-text text-transparent">
                            Live Storefronts
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base sm:text-xl text-[#a1a1a6] font-sans max-w-2xl mx-auto leading-relaxed"
                    >
                        Upload shop photos or product snaps, and get a production-ready,
                        grounded AI storefront with verified product details in minutes.
                    </motion.p>

                    {/* ONE Primary CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={onStartClick}
                            className="apple-btn-primary px-8 py-4 text-sm font-extrabold flex items-center gap-2 group shadow-xl shadow-[#0071e3]/25 active:scale-95 transition"
                        >
                            <span>Start Creating</span>
                            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition duration-200" />
                        </button>
                    </motion.div>

                    {/* Differentiator Highlights */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex items-center justify-center gap-6 text-xs text-[#a1a1a6] font-medium pt-2"
                    >
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>No Code Required</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Grounded AI Accuracy</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Instant ZIP Export</span>
                        </div>
                    </motion.div>
                </div>

                {/* High-Fidelity Device Frame Mockup Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-3xl border border-[#242832] bg-[#14161b] p-3 sm:p-4 shadow-2xl relative group"
                >
                    {/* Mock Browser Top Controls */}
                    <div className="flex items-center justify-between pb-3 px-3 border-b border-[#242832]">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <div className="text-[11px] font-mono text-[#a1a1a6] bg-[#0b0c0e] px-4 py-1 rounded-full border border-[#242832]">
                            https://aura-storefront.snapstore.ai
                        </div>
                        <div className="w-12" />
                    </div>

                    {/* Embedded Mock Store Preview Screenshot */}
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#0b0c0e] border border-[#242832] mt-3">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent z-10 pointer-events-none" />

                        {/* Mock Store Content Layout */}
                        <div className="p-6 md:p-10 space-y-6">
                            <div className="flex items-center justify-between border-b border-[#242832] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white font-bold flex items-center justify-center text-xs">
                                        A
                                    </div>
                                    <span className="text-sm font-extrabold font-display text-white">Aura Marketplace</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[#a1a1a6]">
                                    <span>Collection</span>
                                    <span>Specs</span>
                                    <span className="px-3 py-1 rounded-full bg-[#0071e3] text-white font-bold">Cart (2)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">
                                        Flagship Product
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                                        Aura Precision Headphones
                                    </h3>
                                    <p className="text-xs text-[#a1a1a6] line-clamp-2 leading-relaxed">
                                        Aerospace-grade aluminum acoustic housing with adaptive noise cancellation.
                                    </p>
                                    <div className="text-lg font-extrabold font-mono text-emerald-400 pt-2">$349.00</div>
                                </div>

                                <div className="aspect-[4/3] rounded-2xl bg-[#14161b] border border-[#242832] overflow-hidden relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                                        alt="Store Preview"
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                    />
                                    <div className="absolute bottom-3 left-3 bg-[#0b0c0e]/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
                                        Multimodal VLM Verified
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
