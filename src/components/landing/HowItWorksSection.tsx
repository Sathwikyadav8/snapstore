"use client";

import React from "react";
import { motion } from "framer-motion";
import { UploadCloud, Cpu, Edit3, Rocket, ShieldCheck } from "lucide-react";

export default function HowItWorksSection() {
    const steps = [
        {
            step: "01",
            icon: UploadCloud,
            title: "Upload & Input",
            description: "Provide shop exterior photos, single product snaps, or business descriptions.",
        },
        {
            step: "02",
            icon: Cpu,
            title: "VLM Analysis",
            description: "Multimodal Gemini & Qwen VLM extracts verified specs, colors, and branding.",
        },
        {
            step: "03",
            icon: Edit3,
            title: "Review & Customization",
            description: "Inspect telemetry evidence and edit headlines or prices directly inline.",
        },
        {
            step: "04",
            icon: Rocket,
            title: "Instant Deployment",
            description: "Export a ready-to-deploy static website ZIP or deploy directly to Netlify.",
        },
    ];

    return (
        <section id="how-it-works" className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#14161b] text-[#0071e3] border border-[#242832]">
                        Pipeline Architecture
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
                        How SnapStore AI Works
                    </h2>
                    <p className="text-sm md:text-base text-[#a1a1a6] font-sans">
                        From raw input to deployable storefront in four seamless steps
                    </p>
                </div>

                {/* 4-Step Sequence */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {steps.map((s, idx) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-[#14161b] border border-[#242832] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-2xl font-black font-mono text-[#0071e3]/40">
                                            {s.step}
                                        </span>
                                        <div className="w-10 h-10 rounded-xl bg-[#0b0c0e] border border-[#242832] flex items-center justify-center text-[#0071e3]">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold font-display text-white mb-2">
                                        {s.title}
                                    </h3>
                                    <p className="text-xs text-[#a1a1a6] leading-relaxed font-sans">
                                        {s.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Differentiator Callout Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-[#14161b] border border-[#0071e3]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/40 flex items-center justify-center text-[#0071e3] shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold font-display text-white">
                                Multimodal Evidence & Grounding Guarantee
                            </h4>
                            <p className="text-xs text-[#a1a1a6] font-sans mt-1 max-w-xl">
                                Every extracted detail, category, and spec is verified against your uploaded photos—eliminating hallucinated products or guessed pricing.
                            </p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-[#0b0c0e] border border-[#242832] text-xs font-mono text-emerald-400 font-bold shrink-0">
                        ✓ 100% Grounded Telemetry
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
