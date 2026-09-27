"use client";

import React from "react";
import { motion } from "framer-motion";
import InlineEditableText from "../InlineEditableText";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
    badgeText?: string;
    headline: string;
    subheadline: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    imageUrl?: string;
    accentColor?: string;
    onUpdateHeadline?: (val: string) => void;
    onUpdateSubheadline?: (val: string) => void;
    onCtaClick?: () => void;
}

export default function HeroSection({
    badgeText = "Bespoke AI Edition",
    headline,
    subheadline,
    primaryCtaText = "Explore Collection",
    secondaryCtaText = "Learn More",
    imageUrl,
    accentColor = "#0071e3",
    onUpdateHeadline,
    onUpdateSubheadline,
    onCtaClick,
}: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden py-16 md:py-28 lg:py-36 bg-[#0b0c0e] text-[#f5f5f7]">
            {/* Ambient background glow */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[140px] opacity-20 pointer-events-none"
                style={{ backgroundColor: accentColor }}
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border uppercase bg-[#14161b] border-[#242832]"
                            style={{ color: accentColor }}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{badgeText}</span>
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {onUpdateHeadline ? (
                            <InlineEditableText
                                value={headline}
                                onSave={onUpdateHeadline}
                                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white leading-[1.05]"
                            />
                        ) : (
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white leading-[1.05]">
                                {headline}
                            </h1>
                        )}
                    </motion.div>

                    {/* Subheadline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl mx-auto"
                    >
                        {onUpdateSubheadline ? (
                            <InlineEditableText
                                value={subheadline}
                                onSave={onUpdateSubheadline}
                                className="text-base sm:text-lg md:text-xl text-[#a1a1a6] font-sans leading-relaxed"
                            />
                        ) : (
                            <p className="text-base sm:text-lg md:text-xl text-[#a1a1a6] font-sans leading-relaxed">
                                {subheadline}
                            </p>
                        )}
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-2"
                    >
                        <button
                            onClick={onCtaClick}
                            className="apple-btn-primary inline-flex items-center gap-2 group"
                            style={{ backgroundColor: accentColor }}
                        >
                            <span>{primaryCtaText}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                        {secondaryCtaText && (
                            <a href="#catalog" className="apple-btn-secondary">
                                {secondaryCtaText}
                            </a>
                        )}
                    </motion.div>
                </div>

                {/* Full-bleed photography card */}
                {imageUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-12 md:mt-16 lg:mt-20 relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-[#242832] bg-[#14161b] shadow-2xl group"
                    >
                        <img
                            src={imageUrl}
                            alt={headline}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/80 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                )}
            </div>
        </section>
    );
}
