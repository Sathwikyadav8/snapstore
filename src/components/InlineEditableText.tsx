"use client";

import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

interface InlineEditableTextProps {
    value: string;
    onSave: (val: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
}

export default function InlineEditableText({
    value,
    onSave,
    className = "",
    placeholder = "Click to edit...",
    multiline = false,
}: InlineEditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentVal, setCurrentVal] = useState(value || "");

    useEffect(() => {
        setCurrentVal(value || "");
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (currentVal.trim() !== (value || "")) {
            onSave(currentVal.trim() || value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            handleBlur();
        } else if (e.key === "Escape") {
            setCurrentVal(value || "");
            setIsEditing(false);
        }
    };

    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    autoFocus
                    value={currentVal}
                    onChange={(e) => setCurrentVal(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-[#14161b] text-white border border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] rounded-lg p-2.5 resize-y font-sans shadow-lg ${className}`}
                    rows={3}
                />
            );
        }
        return (
            <input
                autoFocus
                type="text"
                value={currentVal}
                onChange={(e) => setCurrentVal(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`bg-[#14161b] text-white border border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] rounded-md px-2 py-1 font-sans shadow-lg ${className}`}
            />
        );
    }

    return (
        <span className="relative group/edit inline-flex items-center gap-1.5 cursor-pointer max-w-full">
            <span
                onClick={() => setIsEditing(true)}
                className={`group-hover/edit:text-[#0071e3] transition-colors ${className}`}
            >
                {value || placeholder}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                }}
                className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-[#0071e3] p-1 rounded-md bg-[#14161b]/90 border border-[#242832] shrink-0 shadow"
                title="Click to edit inline"
            >
                <Pencil className="w-3.5 h-3.5 text-[#0071e3]" />
            </button>
        </span>
    );
}
