"use client";

import React from "react";
import { motion } from "framer-motion";
import type { StoreProduct } from "@/lib/types";
import InlineEditableText from "../InlineEditableText";
import { ShoppingBag, Eye, Check } from "lucide-react";

interface ProductGridSectionProps {
    products: StoreProduct[];
    title?: string;
    subtitle?: string;
    accentColor?: string;
    onAddToCart?: (product: StoreProduct) => void;
    onInspectProduct?: (product: StoreProduct) => void;
    onUpdateProductField?: (
        productId: string,
        field: "productName" | "description" | "price",
        value: string | number
    ) => void;
}

export default function ProductGridSection({
    products,
    title = "Curated Collection",
    subtitle = "Handcrafted essentials built with authentic design specs",
    accentColor = "#0071e3",
    onAddToCart,
    onInspectProduct,
    onUpdateProductField,
}: ProductGridSectionProps) {
    return (
        <section id="catalog" className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832] text-[#f5f5f7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
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
                        Product Catalog
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
                        {title}
                    </h2>
                    <p className="text-sm md:text-base text-[#a1a1a6] font-sans">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.id || idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.7,
                                delay: idx * 0.1,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="bg-[#14161b] border border-[#242832] rounded-3xl overflow-hidden hover:border-[#0071e3]/50 transition duration-300 flex flex-col justify-between shadow-xl group"
                        >
                            {/* Product Media */}
                            <div className="relative aspect-square overflow-hidden bg-[#1a1d24]">
                                <img
                                    src={product.image}
                                    alt={product.productName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                                />

                                {/* Badge */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0b0c0e]/80 text-white backdrop-blur-md border border-white/10">
                                        {product.category || "Featured"}
                                    </span>
                                    {product.badge && (
                                        <span
                                            className="px-3 py-1 rounded-full text-[11px] font-bold text-white shadow"
                                            style={{ backgroundColor: accentColor }}
                                        >
                                            {product.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Inspect Overlay Trigger */}
                                {onInspectProduct && (
                                    <button
                                        onClick={() => onInspectProduct(product)}
                                        className="absolute top-4 right-4 p-2.5 rounded-full bg-[#0b0c0e]/80 text-white hover:text-[#0071e3] backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition duration-200"
                                        title="View Evidence & Specs"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#a1a1a6]">
                                        {product.brand || "Brand Edition"}
                                    </div>

                                    {/* Product Name */}
                                    {onUpdateProductField ? (
                                        <InlineEditableText
                                            value={product.productName}
                                            onSave={(val: string) =>
                                                onUpdateProductField(product.id, "productName", val)
                                            }
                                            className="text-lg font-extrabold font-sans text-white leading-snug"
                                        />
                                    ) : (
                                        <h3 className="text-lg font-extrabold font-sans text-white leading-snug">
                                            {product.productName}
                                        </h3>
                                    )}

                                    {/* Product Description */}
                                    {onUpdateProductField ? (
                                        <InlineEditableText
                                            value={product.description}
                                            onSave={(val: string) =>
                                                onUpdateProductField(product.id, "description", val)
                                            }
                                            className="text-xs text-[#a1a1a6] font-sans leading-relaxed line-clamp-2"
                                        />
                                    ) : (
                                        <p className="text-xs text-[#a1a1a6] font-sans leading-relaxed line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}
                                </div>

                                {/* Price & CTA */}
                                <div className="pt-4 border-t border-[#242832] flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs text-[#a1a1a6] font-mono">$</span>
                                        {onUpdateProductField ? (
                                            <InlineEditableText
                                                value={product.price.toString()}
                                                onSave={(val: string) => {
                                                    const parsed = parseFloat(val);
                                                    if (!isNaN(parsed)) {
                                                        onUpdateProductField(product.id, "price", parsed);
                                                    }
                                                }}
                                                className="text-xl font-extrabold font-mono text-emerald-400"
                                            />
                                        ) : (
                                            <span className="text-xl font-extrabold font-mono text-emerald-400">
                                                {product.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onAddToCart && onAddToCart(product)}
                                        className="apple-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        <span>+ Cart</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
