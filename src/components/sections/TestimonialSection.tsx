"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/lib/types";

interface TestimonialSectionProps {
    testimonials?: Testimonial[];
    accentColor?: string;
}

export default function TestimonialSection({
    testimonials = [
        {
            name: "Sophia Chen",
            quote: "The aesthetic precision and grounded quality exceeded every expectation. An absolute benchmark for automated design.",
            rating: 5,
            role: "Lead Creative Director, Studio Aura",
        },
    ],
    accentColor = "#0071e3",
}: TestimonialSectionProps) {
    const current = testimonials[0] || {
        name: "Sophia Chen",
        quote: "The aesthetic precision and grounded quality exceeded every expectation.",
        rating: 5,
        role: "Lead Creative Director",
    };

    return (
        <section id="reviews" className="py-20 md:py-32 bg-[#14161b] border-t border-[#242832] text-[#f5f5f7]">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-8">
                {/* Rating Stars */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center gap-1.5"
                >
                    {Array.from({ length: current.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                </motion.div>

                {/* Quote */}
                <motion.blockquote
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-2xl sm:text-3xl md:text-4xl font-medium font-serif italic text-white leading-relaxed"
                >
                    "{current.quote}"
                </motion.blockquote>

                {/* Author */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-1 pt-2"
                >
                    <div className="text-base font-extrabold font-sans text-white">
                        {current.name}
                    </div>
                    {current.role && (
                        <div className="text-xs font-mono text-[#a1a1a6]">
                            {current.role}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
