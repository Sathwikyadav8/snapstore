"use client";

import React from "react";
import { Store } from "lucide-react";

export default function LandingFooter() {
    return (
        <footer className="bg-[#040605] text-[#a1a1a6] py-16 px-6 border-t border-[#242832] text-xs font-sans">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#0071e3] flex items-center justify-center text-white">
                        <Store className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-white text-sm font-display">
                        SnapStore AI Studio
                    </span>
                </div>

                <div className="flex items-center space-x-6 text-xs text-[#a1a1a6]">
                    <a href="#creation-modes" className="hover:text-white transition">
                        Workflows
                    </a>
                    <a href="#how-it-works" className="hover:text-white transition">
                        Architecture
                    </a>
                    <a href="#saved-projects" className="hover:text-white transition">
                        Workspaces
                    </a>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                    © 2026 SnapStore AI Studio. Grounded Multimodal E-Commerce.
                </div>
            </div>
        </footer>
    );
}
