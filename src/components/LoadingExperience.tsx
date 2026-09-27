"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type LoadingStage = "identifying" | "generating" | "image_generating" | "extracting_dna";

const MESSAGES: Record<LoadingStage, string[]> = {
  identifying: [
    "Scanning product pixels…",
    "Extracting key features & specs…",
    "Estimating fair USD pricing…",
    "Analyzing color palette…",
    "Consulting Gemini VLM engine…",
  ],
  generating: [
    "Inventing store title & slogan…",
    "Writing high-converting copy…",
    "Selecting luxury color system…",
    "Building product catalog grid…",
    "Laying out responsive storefront…",
  ],
  image_generating: [
    "Formulating AI camera prompts…",
    "Rendering 8K studio product shots…",
    "Generating hero banner background…",
    "Enhancing lighting & contrast…",
    "Applying high-resolution images…",
  ],
  extracting_dna: [
    "Scanning visual brand assets…",
    "Extracting primary & accent colors…",
    "Analyzing typography style…",
    "Formulating card & button tokens…",
    "Locking Brand DNA rules…",
  ],
};

const STEPS: { key: LoadingStage | "done"; label: string; icon: string }[] = [
  { key: "identifying", label: "Analyze", icon: "🔍" },
  { key: "extracting_dna", label: "DNA", icon: "🧬" },
  { key: "image_generating", label: "Imagery", icon: "🖼️" },
  { key: "generating", label: "Studio", icon: "🪄" },
  { key: "done", label: "Launch", icon: "🚀" },
];

export default function LoadingExperience({ stage }: { stage: LoadingStage }) {
  const [msgIndex, setMsgIndex] = useState(0);

  const activeMessages = MESSAGES[stage] || MESSAGES.generating;

  useEffect(() => {
    setMsgIndex(0);
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % activeMessages.length);
    }, 1100);
    return () => clearInterval(id);
  }, [stage, activeMessages.length]);

  const stepMap: Record<LoadingStage, number> = {
    identifying: 0,
    extracting_dna: 1,
    image_generating: 2,
    generating: 3,
  };

  const progressMap: Record<LoadingStage, number> = {
    identifying: 30,
    extracting_dna: 50,
    image_generating: 75,
    generating: 90,
  };

  const activeStepIndex = stepMap[stage] ?? 3;
  const progressPct = progressMap[stage] ?? 85;

  return (
    <div className="max-w-xl mx-auto mt-8 text-center">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((step, i) => {
          const isActive = i === activeStepIndex;
          const isComplete = i < activeStepIndex;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 1.2,
                    repeat: isActive ? Infinity : 0,
                  }}
                  className={`h-11 w-11 rounded-full flex items-center justify-center text-lg border-2 ${isComplete
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : isActive
                        ? "bg-gradient-to-br from-teal-500 to-cyan-500 border-white/40 text-white shadow-[0_0_20px_rgba(45,212,191,0.6)]"
                        : "bg-white/5 border-white/10 text-gray-500"
                    }`}
                >
                  {isComplete ? "✓" : step.icon}
                </motion.div>
                <span
                  className={`text-xs font-medium ${isActive
                      ? "text-white"
                      : isComplete
                        ? "text-emerald-300"
                        : "text-gray-500"
                    }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-10 sm:w-16 mx-1 mb-5 rounded-full ${i < activeStepIndex ? "bg-emerald-400" : "bg-white/10"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-300 animate-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Cycling status message */}
      <div className="h-6 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-teal-300 text-sm font-medium"
          >
            {MESSAGES[stage][msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
