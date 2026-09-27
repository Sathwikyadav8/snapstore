import Link from "next/link";
import { Sparkles, ArrowLeft, Store, ShieldAlert } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[#0b0c0e] text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden antialiased">
            {/* Background ambient glowing gradients */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0071e3]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full relative z-10 text-center space-y-6">
                {/* Top Studio Logo Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14161b] border border-[#242832] text-xs font-semibold text-slate-300 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>SnapStore AI Studio</span>
                </div>

                {/* Card Container */}
                <div className="p-8 rounded-3xl bg-[#14161b]/90 border border-[#242832] backdrop-blur-xl shadow-2xl relative space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0071e3]/20 to-sky-500/10 border border-[#0071e3]/30 flex items-center justify-center mx-auto text-[#0071e3] shadow-inner">
                        <ShieldAlert className="w-8 h-8" />
                    </div>

                    <div>
                        <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#0071e3] font-display">
                            404
                        </h1>
                        <h2 className="text-lg font-bold text-slate-100 mt-2">
                            Store Route Not Found
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                            The storefront, project canvas, or route you are looking for does not exist or has been relocated within the AI Studio.
                        </p>
                    </div>

                    <div className="pt-2">
                        <Link
                            href="/"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm shadow-lg shadow-[#0071e3]/25 transition duration-200 group active:scale-[0.98]"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Return to AI Studio</span>
                        </Link>
                    </div>
                </div>

                {/* Footer help line */}
                <p className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Multimodal Storefront Generation Engine</span>
                </p>
            </div>
        </main>
    );
}
