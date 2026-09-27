"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    accentColor?: string;
    onCtaClick?: () => void;
}

export default function CTASection({
    headline = "Experience the Future of Design",
    subheadline = "Explore our curated collection with global express delivery",
    ctaText = "Shop Collection Now",
    accentColor = "#0071e3",
    onCtaClick,
}: CTASectionProps) {
    return (
        <section className="py-24 md:py-36 bg-[#000000] border-t border-[#242832] text-[#f5f5f7] relative overflow-hidden text-center">
            {/* Subtle glow background */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[140px] opacity-25 pointer-events-none"
                style={{ backgroundColor: accentColor }}
            />

            <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 space-y-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-tight leading-tight"
                >
                    {headline}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-base sm:text-lg text-[#a1a1a6] font-sans max-w-xl mx-auto"
                >
                    {subheadline}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-4"
                >
                    <button
                        onClick={onCtaClick}
                        className="apple-btn-primary inline-flex items-center gap-2 group text-sm"
                        style={{ backgroundColor: accentColor }}
                    >
                        <span>{ctaText}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
