"use client";

import React from "react";
import { motion } from "framer-motion";
import { FolderGit2, Trash2, ArrowUpRight, Plus } from "lucide-react";
import type { SavedProject } from "@/app/page";

interface SavedProjectsSectionProps {
    projects: SavedProject[];
    currentProjectId: string | null;
    onSelectProject: (project: SavedProject) => void;
    onDeleteProject: (id: string, e: React.MouseEvent) => void;
    onNewProjectClick: () => void;
}

export default function SavedProjectsSection({
    projects,
    currentProjectId,
    onSelectProject,
    onDeleteProject,
    onNewProjectClick,
}: SavedProjectsSectionProps) {
    return (
        <section id="saved-projects" className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                    <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#14161b] text-[#0071e3] border border-[#242832] inline-block mb-3">
                            Workspaces ({projects.length})
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                            Your Saved Stores
                        </h2>
                    </div>

                    <button
                        onClick={onNewProjectClick}
                        className="apple-btn-secondary px-5 py-2.5 text-xs font-bold flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 text-[#0071e3]" />
                        <span>New Storefront</span>
                    </button>
                </div>

                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((proj, idx) => (
                            <motion.div
                                key={proj.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                onClick={() => onSelectProject(proj)}
                                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl ${currentProjectId === proj.id
                                        ? "bg-[#14161b] border-[#0071e3] ring-1 ring-[#0071e3]"
                                        : "bg-[#14161b] border-[#242832] hover:border-slate-600"
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-[#0071e3]/15 text-[#0071e3] flex items-center justify-center font-bold text-xs">
                                            {proj.name.charAt(0).toUpperCase()}
                                        </div>
                                        <button
                                            onClick={(e) => onDeleteProject(proj.id, e)}
                                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#0b0c0e] transition opacity-0 group-hover:opacity-100"
                                            title="Delete Workspace"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-base font-bold font-display text-white mb-1 group-hover:text-[#0071e3] transition">
                                        {proj.name}
                                    </h3>
                                    <p className="text-xs text-[#a1a1a6] font-mono">
                                        Last edited {proj.updatedAt}
                                    </p>
                                </div>

                                <div className="pt-4 mt-6 border-t border-[#242832] flex items-center justify-between">
                                    <span className="text-xs text-[#a1a1a6]">
                                        {proj.products.length} Products
                                    </span>
                                    <span className="text-xs font-bold text-[#0071e3] flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                        Open Studio <ArrowUpRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center border border-dashed border-[#242832] rounded-3xl bg-[#14161b]/50 max-w-xl mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#0b0c0e] text-[#a1a1a6] border border-[#242832] flex items-center justify-center mx-auto">
                            <FolderGit2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold font-display text-white">
                            No Workspaces Saved Yet
                        </h3>
                        <p className="text-xs text-[#a1a1a6] font-sans leading-relaxed">
                            Your projects will appear here once you create your first AI storefront above.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
