"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { Download, Copy, Check, FileCode, Archive, Sparkles, ExternalLink, Globe } from "lucide-react";
import type { StoreConfig, StoreProduct } from "@/lib/types";

interface ExportDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  products: StoreProduct[];
}

export default function ExportDeployModal({
  isOpen,
  onClose,
  config,
  products,
}: ExportDeployModalProps) {
  const [activeTab, setActiveTab] = useState<"zip" | "html" | "json">("zip");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  if (!isOpen) return null;

  const generatedHtmlCode = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.storeName} — Apple & Google Grounded Storefront</title>
  <meta name="description" content="${config.heroSubheadline || config.tagline}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-bg: #0b0c0e;
      --color-surface: #14161b;
      --color-accent: ${config.accentColor || '#0071e3'};
      --color-border: #242832;
    }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--color-bg); color: #f5f5f7; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .apple-btn-primary { background-color: var(--color-accent); color: #fff; border-radius: 9999px; padding: 0.75rem 1.75rem; font-weight: 700; transition: all 0.2s ease; }
    .apple-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  </style>
</head>
<body class="bg-[#0b0c0e] text-[#f5f5f7] min-h-screen selection:bg-[#0071e3] selection:text-white antialiased">

  <!-- Sticky Glass Navbar -->
  <header class="sticky top-0 z-50 bg-[#0b0c0e]/85 backdrop-blur-md border-b border-[#242832] px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-2xl bg-[#0071e3] flex items-center justify-center font-bold text-white text-base shadow-lg">
          ${config.storeName.charAt(0)}
        </div>
        <div>
          <h1 class="text-base font-extrabold font-display text-white tracking-tight">${config.storeName}</h1>
          <p class="text-[11px] text-[#a1a1a6] font-sans">${config.tagline}</p>
        </div>
      </div>

      <nav class="hidden md:flex items-center space-x-8 text-xs font-semibold text-[#a1a1a6]">
        <a href="#catalog" class="hover:text-white transition">Collection</a>
        <a href="#specs" class="hover:text-white transition">Specs</a>
        <a href="#reviews" class="hover:text-white transition">Guarantee</a>
      </nav>

      <button onclick="toggleCart()" class="apple-btn-primary text-xs flex items-center gap-2">
        <span>Cart</span>
        <span id="cart-count" class="w-4 h-4 rounded-full bg-white text-[#0071e3] text-[10px] font-extrabold flex items-center justify-center">0</span>
      </button>
    </div>
  </header>

  <!-- Hero Section Primitive -->
  <section class="relative py-16 md:py-28 bg-[#0b0c0e] overflow-hidden text-center">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 space-y-6">
      <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#14161b] text-[#0071e3] border border-[#242832]">
        Bespoke AI Edition • ${products.length} Products
      </span>
      <h2 class="text-4xl sm:text-6xl md:text-7xl font-black font-display text-white tracking-tight leading-[1.05] max-w-4xl mx-auto">
        ${config.heroHeadline}
      </h2>
      <p class="text-base sm:text-lg text-[#a1a1a6] font-sans max-w-2xl mx-auto leading-relaxed">
        ${config.heroSubheadline}
      </p>
      <div class="pt-2">
        <a href="#catalog" class="apple-btn-primary inline-block">
          ${config.designDecision?.primaryCtaText || "Explore Collection"} →
        </a>
      </div>

      ${products[0]?.image ? `
      <div class="mt-12 relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-[#242832] bg-[#14161b] shadow-2xl">
        <img src="${products[0].image}" alt="${config.storeName}" class="w-full h-full object-cover" />
      </div>` : ''}
    </div>
  </section>

  <!-- Feature Spotlight Primitive -->
  ${products[0] ? `
  <section className="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832] text-[#f5f5f7]">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
      <div class="space-y-4">
        <span class="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#14161b] text-[#0071e3] border border-[#242832]">
          Flagship Engineering
        </span>
        <h3 class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">${products[0].productName}</h3>
        <p class="text-base text-[#a1a1a6] leading-relaxed font-sans">${products[0].description}</p>
        <button onclick="addToCart('${products[0].productName.replace(/'/g, "\\'")}', ${products[0].price})" class="apple-btn-primary text-xs">
          Buy Flagship • $${products[0].price.toFixed(2)}
        </button>
      </div>
      <div class="relative aspect-square rounded-3xl overflow-hidden border border-[#242832] bg-[#14161b] shadow-2xl">
        <img src="${products[0].image}" alt="${products[0].productName}" class="w-full h-full object-cover" />
      </div>
    </div>
  </section>` : ''}

  <!-- Catalog Grid Section Primitive -->
  <section id="catalog" class="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832]">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#14161b] text-[#0071e3] border border-[#242832]">
          Curated Catalog
        </span>
        <h3 class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">Curated Collection</h3>
        <p class="text-sm text-[#a1a1a6] font-sans">Precision crafted essentials</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        ${products.map((p) => `
          <div class="bg-[#14161b] border border-[#242832] rounded-3xl overflow-hidden hover:border-[#0071e3]/50 transition duration-300 flex flex-col justify-between shadow-xl">
            <div class="relative aspect-square overflow-hidden bg-[#1a1d24]">
              <img src="${p.image}" alt="${p.productName}" class="w-full h-full object-cover" />
              <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0b0c0e]/80 text-white backdrop-blur-md border border-white/10">
                ${p.category || 'Featured'}
              </span>
            </div>
            <div class="p-6 flex flex-col flex-1 justify-between space-y-4">
              <div>
                <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-[#a1a1a6] mb-1">${p.brand || config.storeName}</div>
                <h4 class="text-lg font-extrabold text-white font-sans mb-1">${p.productName}</h4>
                <p class="text-xs text-[#a1a1a6] leading-relaxed line-clamp-2 font-sans">${p.description}</p>
              </div>
              <div class="pt-4 border-t border-[#242832] flex items-center justify-between">
                <span class="text-xl font-extrabold font-mono text-emerald-400">$${p.price.toFixed(2)}</span>
                <button onclick="addToCart('${p.productName.replace(/'/g, "\\'")}', ${p.price})" class="apple-btn-primary text-xs py-2 px-4">
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Specs Section Primitive -->
  <section id="specs" class="py-20 md:py-32 bg-[#0b0c0e] border-t border-[#242832]">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#14161b] text-[#0071e3] border border-[#242832]">
          Specs
        </span>
        <h3 class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">Technical Specifications</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl bg-[#14161b] border border-[#242832] space-y-2">
          <div class="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Build</div>
          <div class="text-sm text-slate-300 font-semibold">Material Craft</div>
          <div class="text-base font-bold text-white font-display">Aerospace Anodized Finish</div>
        </div>
        <div class="p-6 rounded-3xl bg-[#14161b] border border-[#242832] space-y-2">
          <div class="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">AI Intelligence</div>
          <div class="text-sm text-slate-300 font-semibold">VLM Grounding</div>
          <div class="text-base font-bold text-white font-display">Multimodal Gemini & Qwen 2.5</div>
        </div>
        <div class="p-6 rounded-3xl bg-[#14161b] border border-[#242832] space-y-2">
          <div class="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Warranty</div>
          <div class="text-sm text-slate-300 font-semibold">Global Guarantee</div>
          <div class="text-base font-bold text-white font-display">2-Year Studio Coverage</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer Primitive -->
  <footer class="bg-[#040605] text-[#a1a1a6] py-16 px-6 border-t border-[#242832] text-xs">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
      <div>
        <h4 class="text-base font-extrabold font-display text-white">${config.storeName}</h4>
        <p class="text-xs text-slate-400">${config.tagline}</p>
      </div>
      <div class="text-[11px] font-mono text-slate-500">
        © 2026 ${config.storeName}. Production static export by SnapStore AI Studio.
      </div>
    </div>
  </footer>

  <script>
    let cart = [];
    function toggleCart() { alert('Shopping Cart: ' + cart.length + ' item(s)'); }
    function addToCart(name, price) {
      cart.push({ name, price });
      document.getElementById('cart-count').innerText = cart.length;
      alert('Added ' + name + ' ($' + price.toFixed(2) + ') to cart!');
    }
  </script>
</body>
</html>`;

  async function handleDownloadZip() {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      zip.file("index.html", generatedHtmlCode);
      zip.file("store-config.json", JSON.stringify({ config, products }, null, 2));
      zip.file(
        "README.md",
        `# ${config.storeName}\n\nGenerated with SnapStore AI Studio.\n\n## Quick Deploy Options\n1. Netlify Drop: Drag & drop this ZIP file to https://app.netlify.com/drop\n2. Vercel: Run \`vercel\` in this unzipped folder\n3. GitHub Pages: Upload index.html to your gh-pages repository`
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.storeName.toLowerCase().replace(/\s+/g, "-")}-storefront.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 4000);
    } catch (err) {
      console.error("ZIP Generation error:", err);
    } finally {
      setIsZipping(false);
    }
  }

  function handleDownloadHtml() {
    const blob = new Blob([generatedHtmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.storeName.toLowerCase().replace(/\s+/g, "-")}-store.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    const data = {
      version: "2.0-VisionCart",
      timestamp: new Date().toISOString(),
      config,
      products,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.storeName.toLowerCase().replace(/\s+/g, "-")}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(generatedHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-zinc-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-zinc-200 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 font-bold p-1 rounded-full transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Globe className="w-3 h-3 text-zinc-900" /> Instant Store Export
          </span>
          <h2 className="text-2xl font-bold font-serif text-zinc-900">Export Storefront & Deploy</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Download a ready-to-deploy static website ZIP, single HTML file, or project JSON schema.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 pb-3">
          <button
            onClick={() => setActiveTab("zip")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === "zip"
              ? "bg-zinc-900 text-white shadow"
              : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
          >
            <Archive className="w-3.5 h-3.5" /> Download ZIP (.zip)
          </button>
          <button
            onClick={() => setActiveTab("html")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === "html"
              ? "bg-zinc-900 text-white shadow"
              : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
          >
            <FileCode className="w-3.5 h-3.5" /> HTML Source Code
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === "json"
              ? "bg-zinc-900 text-white shadow"
              : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Schema JSON
          </button>
        </div>

        {/* Tab 1: ZIP Archive Download */}
        {activeTab === "zip" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-xs">Production Website Package</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Ready to Publish
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Includes <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-900">index.html</code>, structured config, and deploy guides. Drag & drop into Netlify, Vercel, or GitHub Pages.
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isZipping ? "Generating ZIP Archive..." : zipDownloaded ? "✓ ZIP Downloaded Successfully!" : "Download Production Site (.zip)"}
            </button>
          </div>
        )}

        {/* Tab 2: HTML Source */}
        {activeTab === "html" && (
          <div className="space-y-4">
            <div className="relative bg-zinc-900 text-zinc-100 rounded-2xl p-4 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{generatedHtmlCode}</pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyCode}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs transition flex items-center gap-2"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Copied!" : "Copy Code"}
              </button>
              <button
                onClick={handleDownloadHtml}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download HTML File
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: JSON Data */}
        {activeTab === "json" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
              <div className="font-bold text-zinc-900">Schema Summary</div>
              <p className="text-zinc-500">{products.length} Products • Brand DNA Specs • Full Copy Objects</p>
            </div>
            <button
              onClick={handleDownloadJson}
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Store JSON
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
