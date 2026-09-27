"use client";

import React from "react";
import { motion } from "framer-motion";
import InlineEditableText from "../InlineEditableText";

interface FeatureSectionProps {
    title: string;
    subtitle: string;
    description?: string;
    imageUrl?: string;
    imageAlt?: string;
    reverse?: boolean;
    badge?: string;
    accentColor?: string;
    onUpdateTitle?: (val: string) => void;
    onUpdateDescription?: (val: string) => void;
}

export default function FeatureSection({
    title,
    subtitle,
    description,
    imageUrl,
    imageAlt = "Feature image",
    reverse = false,
    badge = "Key Craft Detail",
    accentColor = "#0071e3",
    onUpdateTitle,
    onUpdateDescription,
}: FeatureSectionProps) {
    return (
        <section className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832] text-[#f5f5f7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? "lg:flex-row-reverse" : ""
                        }`}
                >
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`space-y-6 ${reverse ? "lg:order-2" : "lg:order-1"}`}
                    >
                        {badge && (
                            <span
                                className="inline-block text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#14161b] border border-[#242832]"
                                style={{ color: accentColor }}
                            >
                                {badge}
                            </span>
                        )}

                        <div>
                            {onUpdateTitle ? (
                                <InlineEditableText
                                    value={title}
                                    onSave={onUpdateTitle}
                                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight"
                                />
                            ) : (
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
                                    {title}
                                </h2>
                            )}
                            <p className="text-sm font-semibold text-slate-400 font-mono mt-2">
                                {subtitle}
                            </p>
                        </div>

                        {description && (
                            <div>
                                {onUpdateDescription ? (
                                    <InlineEditableText
                                        value={description}
                                        onSave={onUpdateDescription}
                                        className="text-base md:text-lg text-[#a1a1a6] font-sans leading-relaxed"
                                    />
                                ) : (
                                    <p className="text-base md:text-lg text-[#a1a1a6] font-sans leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Media Container */}
                    <motion.div
                        initial={{ opacity: 0, x: reverse ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#242832] bg-[#14161b] shadow-2xl group ${reverse ? "lg:order-1" : "lg:order-2"
                            }`}
                    >
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={imageAlt}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                                Visual Content Asset
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
