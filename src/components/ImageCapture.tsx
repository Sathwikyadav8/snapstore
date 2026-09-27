"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCaptureProps {
  onCapture: (dataUrl?: string, textDescription?: string, barcodeData?: string) => void;
  disabled?: boolean;
}

type Mode = "upload" | "webcam" | "barcode" | "description";

export default function ImageCapture({ onCapture, disabled }: ImageCaptureProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [textDescription, setTextDescription] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreamReady(false);
  }, []);

  useEffect(() => {
    if (mode !== "webcam") {
      return;
    }

    let cancelled = false;
    setStreamError(null);

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamReady(true);
      })
      .catch((err) => {
        setStreamError(
          err instanceof Error
            ? err.message
            : "Could not access camera. Please check permissions."
        );
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [mode, stopStream]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onCapture(reader.result, undefined, undefined);
    };
    reader.readAsDataURL(file);
  }

  function handleSnapshot() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    onCapture(dataUrl, undefined, undefined);
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!textDescription.trim()) return;
    onCapture(undefined, textDescription.trim(), undefined);
  }

  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    onCapture(undefined, undefined, barcodeInput.trim());
  }

  return (
    <div className="w-full max-w-lg mx-auto font-mono text-xs">
      <div className="relative flex flex-wrap gap-1 mb-3 justify-center bg-[#060907] border border-emerald-950/80 rounded-full p-1 w-fit mx-auto">
        {(["upload", "webcam", "barcode", "description"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`relative z-10 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${mode === m ? "text-emerald-300" : "text-slate-400 hover:text-slate-200"
              }`}
          >
            {mode === m && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-emerald-500/20 border border-emerald-500/40"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            {m === "upload"
              ? "📷 Image File"
              : m === "webcam"
                ? "📹 Webcam"
                : m === "barcode"
                  ? "📊 Barcode/QR"
                  : "✍️ Description"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl p-6 text-center border border-dashed transition-all ${dragActive
                  ? "border-emerald-400 bg-emerald-950/30"
                  : "border-emerald-900/60 bg-[#060907] hover:border-emerald-500/40 hover:bg-[#090e0b]"
                } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <div className="flex flex-col items-center justify-center space-y-2">
                <svg className="w-6 h-6 text-emerald-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-slate-200 font-bold text-xs">
                    Click to select photo or drag and drop file
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    Supports JPG, PNG, WEBP
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === "webcam" && (
          <motion.div
            key="webcam"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl overflow-hidden bg-black border border-emerald-900/60 shadow-xl"
          >
            {streamError && (
              <div className="p-4 text-center text-red-400 text-xs">
                {streamError}
              </div>
            )}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full aspect-video object-cover ${streamReady ? "block" : "hidden"}`}
              />
              <AnimatePresence>
                {flash && (
                  <motion.div
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-emerald-400"
                  />
                )}
              </AnimatePresence>
            </div>
            {!streamReady && !streamError && (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                Connecting camera stream…
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            {streamReady && (
              <div className="p-3 flex justify-center bg-[#070a08]">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleSnapshot}
                  className="px-5 py-2 rounded-full bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition disabled:opacity-50 active:scale-95"
                >
                  Capture Frame
                </button>
              </div>
            )}
          </motion.div>
        )}

        {mode === "barcode" && (
          <motion.div
            key="barcode"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-5 bg-[#060907] border border-emerald-900/60"
          >
            <form onSubmit={handleBarcodeSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 flex items-center justify-between">
                  <span>Product Barcode / QR Scan</span>
                  <span className="text-slate-500 text-[9px]">GTIN / UPC / EAN</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 8901234567890 or UPC-880609123456"
                    className="w-full bg-[#030504] text-slate-200 text-xs px-3 py-2.5 rounded-xl border border-emerald-950 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Sample barcode presets */}
              <div className="pt-1">
                <p className="text-[10px] text-slate-500 mb-1.5">Quick Barcode Presets:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "880609123456 (Wireless Buds)", code: "880609123456" },
                    { label: "012345678905 (Runner Shoes)", code: "012345678905" },
                    { label: "793573194021 (Smart Watch)", code: "793573194021" },
                  ].map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => {
                        setBarcodeInput(preset.code);
                        onCapture(undefined, undefined, preset.code);
                      }}
                      className="px-2.5 py-1 rounded bg-[#030504] border border-emerald-950 text-[10px] text-emerald-400/90 hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={disabled || !barcodeInput.trim()}
                className="w-full py-2.5 rounded-full bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <span>📊</span>
                <span>Lookup Barcode & Build Product Knowledge</span>
              </button>
            </form>
          </motion.div>
        )}

        {mode === "description" && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-5 bg-[#060907] border border-emerald-900/60"
          >
            <form onSubmit={handleTextSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5">
                  Describe Product in Detail
                </label>
                <textarea
                  rows={3}
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="e.g. Minimalist noise-cancelling wireless headphones in matte black with 40h battery life, leather ear cushions, and USB-C fast charging..."
                  className="w-full bg-[#030504] text-slate-200 text-xs p-3 rounded-xl border border-emerald-950 focus:outline-none focus:border-emerald-500 font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={disabled || !textDescription.trim()}
                className="w-full py-2.5 rounded-full bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Generate Product Catalog from Description</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
