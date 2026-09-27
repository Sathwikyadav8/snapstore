"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StoreProduct, StoreConfig, ChatMessage } from "@/lib/types";

interface ShoppingAssistantDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    products: StoreProduct[];
    storeConfig: StoreConfig;
    onAddToCart: (product: StoreProduct) => void;
}

export default function ShoppingAssistantDrawer({
    isOpen,
    onClose,
    products,
    storeConfig,
    onAddToCart,
}: ShoppingAssistantDrawerProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "msg_welcome",
            sender: "assistant",
            text: `Hello! I'm your AI Shopping Assistant for ${storeConfig.storeName}. Ask me anything like "I need a stylish backpack under $50 for college" or "Show cheaper options".`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);
    const [inputQuery, setInputQuery] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSend(queryText?: string) {
        const textToSend = queryText || inputQuery;
        if (!textToSend.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: "msg_" + Date.now(),
            sender: "user",
            text: textToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!queryText) setInputQuery("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userQuery: textToSend,
                    history: messages.map((m) => ({ role: m.sender, content: m.text })),
                    products,
                    storeConfig,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to process query");

            const assistantMsg: ChatMessage = {
                id: "msg_assistant_" + Date.now(),
                sender: "assistant",
                text: data.message || "Here are matching recommendations from our catalog:",
                recommendations: data.recommendations || [],
                parsedQuery: data.parsedQuery,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    id: "msg_err_" + Date.now(),
                    sender: "assistant",
                    text: "Sorry, I ran into an error connecting to our AI product index. Please try again!",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-[#080d09] text-white h-full shadow-2xl flex flex-col justify-between border-l border-emerald-950 font-mono text-xs"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-emerald-950 flex justify-between items-center bg-[#060807]">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-xs">AI Shopping Assistant</h3>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <p className="text-[10px] text-emerald-400/80 font-sans mt-0.5">
                                Powered by Product Intelligence
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-white font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Quick Filter Suggestions */}
                    <div className="px-4 py-2 bg-[#050706] border-b border-emerald-950 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                        {[
                            "College backpack under $50",
                            "Show cheaper options",
                            "Only show black ones",
                            "Which one is better?",
                        ].map((preset) => (
                            <button
                                key={preset}
                                onClick={() => handleSend(preset)}
                                className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900 transition whitespace-nowrap font-bold"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>

                    {/* Chat Stream */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[90%] p-3 rounded-2xl ${msg.sender === "user"
                                            ? "bg-emerald-500 text-black font-bold rounded-tr-none"
                                            : "bg-[#050706] text-slate-200 border border-emerald-950 rounded-tl-none font-sans"
                                        }`}
                                >
                                    <p className="text-xs leading-relaxed">{msg.text}</p>

                                    {/* Recommendations Cards inside Assistant Response */}
                                    {msg.recommendations && msg.recommendations.length > 0 && (
                                        <div className="mt-3 space-y-2.5 pt-2 border-t border-emerald-950">
                                            {msg.recommendations.map(({ product, matchReason }) => (
                                                <div
                                                    key={product.id}
                                                    className="p-2.5 rounded-xl bg-[#080d09] border border-emerald-900/60 flex flex-col gap-2"
                                                >
                                                    <div className="flex gap-2.5 items-center">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={product.image}
                                                            alt={product.productName}
                                                            className="w-12 h-12 object-cover rounded-lg border border-emerald-950"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <h5 className="font-bold text-xs text-white truncate">
                                                                    {product.productName}
                                                                </h5>
                                                                <span className="text-[10px] font-bold text-emerald-400 font-mono">
                                                                    ${product.price.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                                                                {product.category} • {product.inStock ? "In Stock" : "Out of Stock"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Match Rationale */}
                                                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/30 text-[10px] text-emerald-300 font-sans">
                                                        💡 <span className="font-bold">Match Rationale:</span> {matchReason}
                                                    </div>

                                                    <button
                                                        onClick={() => onAddToCart(product)}
                                                        className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] transition"
                                                    >
                                                        + Add {product.productName} to Cart
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <span className="text-[9px] opacity-60 mt-1 block text-right">
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                Assistant is searching store catalog...
                            </div>
                        )}
                    </div>

                    {/* Input Footer */}
                    <div className="p-3 border-t border-emerald-950 bg-[#060807]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={inputQuery}
                                onChange={(e) => setInputQuery(e.target.value)}
                                placeholder="Ask about products, budget, features..."
                                className="flex-1 bg-[#050706] text-white px-3.5 py-2 rounded-xl border border-emerald-950 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputQuery.trim()}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs disabled:opacity-50 transition"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
