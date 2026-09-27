"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
    ProductKnowledgeObject,
    ScoredAttribute,
    AttributeSource,
    StoreProduct,
} from "@/lib/types";
import { recalculateEvidenceSummary } from "@/lib/knowledgeEngine";

interface ProductAnalysisReviewProps {
    pkl: ProductKnowledgeObject;
    image?: string | null;
    onConfirmAndGenerate: (updatedPkl: ProductKnowledgeObject) => void;
    onCancel: () => void;
}

function getConfidenceBadge(confidence: number) {
    const pct = Math.round(confidence * 100);
    if (pct >= 90) {
        return {
            text: `${pct}% High`,
            bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
            dot: "bg-emerald-400",
        };
    } else if (pct >= 70) {
        return {
            text: `${pct}% Medium`,
            bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
            dot: "bg-amber-400",
        };
    }
    return {
        text: `${pct}% Low`,
        bg: "bg-red-500/20 text-red-300 border-red-500/40",
        dot: "bg-red-400",
    };
}

function getSourceBadge(source: AttributeSource, isConfirmed?: boolean) {
    if (isConfirmed || source === "user") {
        return { label: "User Confirmed", icon: "👤", bg: "bg-blue-950 text-blue-300 border-blue-800/40" };
    }
    if (source === "barcode") {
        return { label: "Barcode Scan", icon: "📊", bg: "bg-purple-950 text-purple-300 border-purple-800/40" };
    }
    if (source === "image") {
        return { label: "Visually Verified", icon: "📷", bg: "bg-emerald-950 text-emerald-300 border-emerald-800/40" };
    }
    return { label: "AI Inferred", icon: "🤖", bg: "bg-amber-950 text-amber-300 border-amber-800/40" };
}

export default function ProductAnalysisReview({
    pkl: initialPkl,
    image,
    onConfirmAndGenerate,
    onCancel,
}: ProductAnalysisReviewProps) {
    const [pkl, setPkl] = useState<ProductKnowledgeObject>(initialPkl);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState<string>("");

    const [newAttrLabel, setNewAttrLabel] = useState("");
    const [newAttrValue, setNewAttrValue] = useState("");
    const [showAddCustomModal, setShowAddCustomModal] = useState(false);

    function updateAttribute(key: string, newValue: string) {
        const updated: ProductKnowledgeObject = { ...pkl };

        const updateAttr = (attr?: ScoredAttribute): ScoredAttribute | undefined => {
            if (!attr) return undefined;
            return {
                ...attr,
                value: newValue,
                confidence: 1.0,
                source: "user",
                isConfirmed: true,
                evidence: "Confirmed and verified by user in review stage",
            };
        };

        if (key === "productName") updated.productName = updateAttr(updated.productName)!;
        else if (key === "category") updated.category = updateAttr(updated.category)!;
        else if (key === "subcategory") updated.subcategory = updateAttr(updated.subcategory);
        else if (key === "brand") updated.brand = updateAttr(updated.brand)!;
        else if (key === "color") updated.color = updateAttr(updated.color)!;
        else if (key === "material") updated.material = updateAttr(updated.material)!;
        else if (key === "designStyle") updated.designStyle = updateAttr(updated.designStyle);
        else if (key === "targetAudience") updated.targetAudience = updateAttr(updated.targetAudience)!;
        else if (key === "price") updated.price = updateAttr(updated.price)!;
        else if (key === "description") updated.description = updateAttr(updated.description)!;
        else if (key.startsWith("custom_")) {
            updated.customAttributes = (updated.customAttributes || []).map((attr) =>
                attr.key === key ? updateAttr(attr)! : attr
            );
        }

        const recalculated = recalculateEvidenceSummary(updated);
        setPkl(recalculated);
        setEditingKey(null);
    }

    function confirmAttribute(key: string) {
        const attr = getAttributeByKey(key);
        if (attr) {
            updateAttribute(key, attr.value);
        }
    }

    function handleAddCustomAttribute() {
        if (!newAttrLabel.trim() || !newAttrValue.trim()) return;

        const newAttr: ScoredAttribute = {
            key: "custom_" + Date.now(),
            label: newAttrLabel.trim(),
            value: newAttrValue.trim(),
            confidence: 1.0,
            evidence: "User-added custom attribute",
            source: "user",
            isConfirmed: true,
        };

        const updated = {
            ...pkl,
            customAttributes: [...(pkl.customAttributes || []), newAttr],
        };

        setPkl(recalculateEvidenceSummary(updated));
        setNewAttrLabel("");
        setNewAttrValue("");
        setShowAddCustomModal(false);
    }

    function removeCustomAttribute(key: string) {
        const updated = {
            ...pkl,
            customAttributes: (pkl.customAttributes || []).filter((a) => a.key !== key),
        };
        setPkl(recalculateEvidenceSummary(updated));
    }

    function getAttributeByKey(key: string): ScoredAttribute | undefined {
        if (key === "productName") return pkl.productName;
        if (key === "category") return pkl.category;
        if (key === "subcategory") return pkl.subcategory;
        if (key === "brand") return pkl.brand;
        if (key === "color") return pkl.color;
        if (key === "material") return pkl.material;
        if (key === "designStyle") return pkl.designStyle;
        if (key === "targetAudience") return pkl.targetAudience;
        if (key === "price") return pkl.price;
        if (key === "description") return pkl.description;
        return (pkl.customAttributes || []).find((a) => a.key === key);
    }

    const mainAttributesList: { key: string; label: string; attr: ScoredAttribute }[] = [
        { key: "productName", label: "Product Name", attr: pkl.productName },
        { key: "category", label: "Category", attr: pkl.category },
        { key: "brand", label: "Brand", attr: pkl.brand },
        { key: "color", label: "Color Palette", attr: pkl.color },
        { key: "material", label: "Material Composition", attr: pkl.material },
        { key: "targetAudience", label: "Target Audience", attr: pkl.targetAudience },
        { key: "price", label: "Price USD", attr: pkl.price },
    ];

    if (pkl.subcategory) {
        mainAttributesList.push({ key: "subcategory", label: "Subcategory", attr: pkl.subcategory });
    }
    if (pkl.designStyle) {
        mainAttributesList.push({ key: "designStyle", label: "Design Style", attr: pkl.designStyle });
    }

    (pkl.customAttributes || []).forEach((custom) => {
        mainAttributesList.push({ key: custom.key || "custom", label: custom.label || "Custom", attr: custom });
    });

    const displayImage = image || pkl.productImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

    return (
        <div className="w-full max-w-4xl mx-auto bg-[#080d09] text-slate-100 rounded-3xl border border-emerald-950 p-6 md:p-8 shadow-2xl font-mono text-xs my-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-emerald-950 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            STAGE ③ VERIFICATION
                        </span>
                        <span className="text-[10px] text-slate-400">Vision-Language Analysis Complete</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-white">
                        AI Product Knowledge & Evidence Review
                    </h2>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Review confidence scores, verify extracted claims, and correct uncertain attributes prior to e-commerce site generation.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl bg-[#050706] text-slate-400 hover:text-white border border-emerald-950 transition font-bold"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => onConfirmAndGenerate(pkl)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center gap-2"
                    >
                        <span>Confirm & Generate Website</span>
                        <span>→</span>
                    </button>
                </div>
            </div>

            {/* Main Grid: Left Preview & Intelligence Summary, Right Attributes List */}
            <div className="grid md:grid-cols-12 gap-6">

                {/* Left Column (Image & Intelligence Stats) */}
                <div className="md:col-span-4 space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-950 bg-black shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={displayImage}
                            alt="Product Analysis"
                            className="w-full h-full object-cover"
                        />
                        {pkl.rawBarcodeData && (
                            <div className="absolute top-3 left-3 bg-purple-950/90 text-purple-200 border border-purple-700/50 px-2.5 py-1 rounded-full text-[9px] font-bold backdrop-blur-md">
                                Barcode: {pkl.rawBarcodeData}
                            </div>
                        )}
                    </div>

                    {/* Uncertain Attributes Alert */}
                    {pkl.uncertainAttributes.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                                <span>⚠️</span>
                                <span>Uncertain Information Flagged</span>
                            </div>
                            <p className="text-[10px] text-amber-300/80 font-sans leading-relaxed mb-2">
                                The following attributes require human verification before generating site copy:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {pkl.uncertainAttributes.map((attr, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800/40"
                                    >
                                        {attr}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evidence Summary Card (Section 12 requirement) */}
                    <div className="p-4 rounded-2xl bg-[#050706] border border-emerald-950 space-y-3">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Evidence Summary</span>
                            <span className="text-[9px] text-slate-500">Source Audit</span>
                        </h4>

                        <div className="space-y-2 text-[11px] font-sans">
                            <div className="flex justify-between items-center pb-1.5 border-b border-emerald-950/80">
                                <span className="text-slate-300 flex items-center gap-1.5">
                                    <span>📷</span> Visually Verified
                                </span>
                                <span className="font-bold text-emerald-400 font-mono">
                                    {pkl.evidenceSummary.visuallyVerifiedCount}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-1.5 border-b border-emerald-950/80">
                                <span className="text-slate-300 flex items-center gap-1.5">
                                    <span>👤</span> User Confirmed
                                </span>
                                <span className="font-bold text-blue-400 font-mono">
                                    {pkl.evidenceSummary.userConfirmedCount}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-1.5 border-b border-emerald-950/80">
                                <span className="text-slate-300 flex items-center gap-1.5">
                                    <span>📊</span> Barcode Matched
                                </span>
                                <span className="font-bold text-purple-400 font-mono">
                                    {pkl.evidenceSummary.barcodeCount}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 flex items-center gap-1.5">
                                    <span>🤖</span> AI Inferred
                                </span>
                                <span className="font-bold text-amber-400 font-mono">
                                    {pkl.evidenceSummary.inferredCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Product Intelligence Matrix & Editable Attributes) */}
                <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Extracted Attribute Matrix
                        </h3>
                        <button
                            onClick={() => setShowAddCustomModal(true)}
                            className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-[10px] font-bold hover:bg-emerald-900 transition"
                        >
                            + Add Custom Attribute
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {mainAttributesList.map(({ key, label, attr }) => {
                            if (!attr) return null;
                            const confBadge = getConfidenceBadge(attr.confidence);
                            const srcBadge = getSourceBadge(attr.source, attr.isConfirmed);

                            return (
                                <div
                                    key={key}
                                    className={`p-4 rounded-2xl border transition-all ${attr.confidence < 0.7 && !attr.isConfirmed
                                            ? "bg-[#0c0d0a] border-amber-900/50 hover:border-amber-500/50"
                                            : "bg-[#050706] border-emerald-950 hover:border-emerald-500/40"
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-xs">{label}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${srcBadge.bg}`}
                                            >
                                                <span>{srcBadge.icon}</span>
                                                <span>{srcBadge.label}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border flex items-center gap-1.5 ${confBadge.bg}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${confBadge.dot}`} />
                                                <span>{confBadge.text}</span>
                                            </span>

                                            {!attr.isConfirmed && (
                                                <button
                                                    onClick={() => confirmAttribute(key)}
                                                    className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/40 text-[9px] font-bold transition"
                                                    title="Confirm AI Finding"
                                                >
                                                    Confirm ✓
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setEditingKey(key);
                                                    setTempValue(attr.value);
                                                }}
                                                className="px-2 py-1 rounded bg-zinc-800 text-slate-200 hover:bg-zinc-700 text-[9px] font-bold transition"
                                            >
                                                Edit
                                            </button>

                                            {key.startsWith("custom_") && (
                                                <button
                                                    onClick={() => removeCustomAttribute(key)}
                                                    className="text-slate-500 hover:text-red-400 text-[11px]"
                                                    title="Remove"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Value Display / Edit Form */}
                                    {editingKey === key ? (
                                        <div className="mt-2 flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={tempValue}
                                                onChange={(e) => setTempValue(e.target.value)}
                                                className="flex-1 bg-[#090e0b] text-white px-3 py-1.5 rounded-xl border border-emerald-500 text-xs font-bold focus:outline-none"
                                            />
                                            <button
                                                onClick={() => updateAttribute(key, tempValue)}
                                                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingKey(null)}
                                                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-slate-400 text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-bold text-emerald-300 font-sans">
                                                {attr.value}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-sans mt-1 leading-relaxed">
                                                <span className="text-slate-500 font-mono">Evidence Rationale:</span>{" "}
                                                {attr.evidence}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-emerald-950 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-sans">
                            * Confirmed fields take precedence during LLM storefront synthesis.
                        </span>

                        <button
                            onClick={() => onConfirmAndGenerate(pkl)}
                            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition active:scale-95 flex items-center gap-2"
                        >
                            <span>Confirm & Generate Website</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Custom Attribute Modal */}
            <AnimatePresence>
                {showAddCustomModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-xs font-mono"
                        onClick={() => setShowAddCustomModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#080d09] text-white rounded-2xl max-w-sm w-full p-5 border border-emerald-950 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowAddCustomModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>

                            <h3 className="font-bold text-sm mb-1">Add Product Attribute</h3>
                            <p className="text-[10px] text-slate-400 mb-4 font-sans">
                                Manually add custom specifications or certifications (e.g., &quot;Waterproofing&quot; or &quot;Warranty&quot;).
                            </p>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                                        Attribute Label:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Waterproof Rating"
                                        value={newAttrLabel}
                                        onChange={(e) => setNewAttrLabel(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#050706] rounded-xl border border-emerald-950 text-white focus:outline-none focus:border-emerald-500 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                                        Attribute Value:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. IPX8 Submersible (Verified)"
                                        value={newAttrValue}
                                        onChange={(e) => setNewAttrValue(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#050706] rounded-xl border border-emerald-950 text-white focus:outline-none focus:border-emerald-500 text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddCustomAttribute}
                                disabled={!newAttrLabel.trim() || !newAttrValue.trim()}
                                className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs disabled:opacity-50"
                            >
                                Add & Confirm Attribute
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
