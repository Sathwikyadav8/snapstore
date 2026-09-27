"use client";

import React, { useState, useEffect } from "react";
import { Store, User, FolderGit2, HelpCircle } from "lucide-react";

interface LandingNavbarProps {
    onScrollToProjects?: () => void;
    onScrollToHowItWorks?: () => void;
}

export default function LandingNavbar({
    onScrollToProjects,
    onScrollToHowItWorks,
}: LandingNavbarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-[#0b0c0e]/85 backdrop-blur-md border-b border-[#242832] py-3.5 shadow-2xl"
                    : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white shadow-lg shadow-[#0071e3]/30">
                        <Store className="w-5 h-5" />
                    </div>
                    <span className="text-base font-extrabold font-display text-white tracking-tight">
                        SnapStore <span className="text-[#0071e3]">AI Studio</span>
                    </span>
                </div>

                {/* Minimal Navigation */}
                <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-[#a1a1a6]">
                    <button
                        onClick={onScrollToHowItWorks}
                        className="hover:text-white transition flex items-center gap-1.5"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>How It Works</span>
                    </button>
                    <button
                        onClick={onScrollToProjects}
                        className="hover:text-white transition flex items-center gap-1.5"
                    >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>My Workspaces</span>
                    </button>
                </nav>

                {/* User Profile Pill */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14161b] border border-[#242832] text-xs text-slate-300">
                        <User className="w-3.5 h-3.5 text-[#0071e3]" />
                        <span className="font-semibold text-[11px] font-mono">Pro Studio</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
