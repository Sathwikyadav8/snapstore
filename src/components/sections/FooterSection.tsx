"use client";

import React from "react";
import InlineEditableText from "../InlineEditableText";

interface FooterSectionProps {
    storeName: string;
    tagline: string;
    footerText?: string;
    onUpdateFooterText?: (val: string) => void;
}

export default function FooterSection({
    storeName,
    tagline,
    footerText,
    onUpdateFooterText,
}: FooterSectionProps) {
    return (
        <footer className="bg-[#040605] text-[#a1a1a6] py-16 px-6 lg:px-8 border-t border-[#242832] font-sans text-xs">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#242832]">
                    <div>
                        <h4 className="text-base font-extrabold font-display text-white tracking-tight">
                            {storeName}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">{tagline}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-xs text-slate-400 font-medium">
                        <a href="#catalog" className="hover:text-white transition">Collection</a>
                        <a href="#story" className="hover:text-white transition">Our Story</a>
                        <a href="#specs" className="hover:text-white transition">Specifications</a>
                        <a href="#reviews" className="hover:text-white transition">Guarantee</a>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
                    <div>
                        {onUpdateFooterText && footerText ? (
                            <InlineEditableText
                                value={footerText}
                                onSave={onUpdateFooterText}
                                className="text-slate-400"
                            />
                        ) : (
                            <span>© 2026 {storeName}. Powered by SnapStore AI Studio.</span>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <span>Privacy Policy</span>
                        <span>•</span>
                        <span>Terms of Service</span>
                        <span>•</span>
                        <span>Apple / Google VLM Grounded</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
