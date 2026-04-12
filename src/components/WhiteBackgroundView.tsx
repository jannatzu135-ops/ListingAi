import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Upload,
  X,
  RefreshCw,
  Download,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ErrorDisplay } from "./ErrorDisplay";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WhiteBackgroundViewProps {
  whiteBgImage: string | undefined;
  setWhiteBgImage: (img: string | undefined) => void;
  whiteBgResult: string | null;
  isProcessingWhiteBg: boolean;
  handleWhiteBackground: () => void;
  userData: any;
  error: string | null;
}

const WhiteBackgroundView: React.FC<WhiteBackgroundViewProps> = React.memo(({
  whiteBgImage,
  setWhiteBgImage,
  whiteBgResult,
  isProcessingWhiteBg,
  handleWhiteBackground,
  userData,
  error,
}) => {
  const DAILY_LIMIT = 5;
  const today = new Date().toISOString().split('T')[0];
  const currentUsage = userData?.lastWhiteBgDate === today ? (userData?.dailyWhiteBgCount || 0) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result?.toString().split(",")[1];
        setWhiteBgImage(b64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      key="whiteBackground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <ErrorDisplay error={error} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            White Background Tool
          </h1>
          <p className="text-neutral-500 max-w-xl">
            Instantly remove backgrounds and create clean, marketplace-ready
            product images with professional white backgrounds.
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 self-start md:self-end">
          <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
            <ImageIcon size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Daily Limit</p>
            <p className="text-sm font-black text-slate-900 leading-none">
              {currentUsage} <span className="text-slate-400 font-bold">/ {DAILY_LIMIT}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} />
                Source Image
              </label>
              <div
                className={cn(
                  "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden group",
                  whiteBgImage
                    ? "border-blue-600 bg-blue-600/5"
                    : "border-neutral-200 hover:border-blue-600/50 hover:bg-blue-600/5",
                )}
              >
                {whiteBgImage ? (
                  <>
                    <img
                      src={`data:image/png;base64,${whiteBgImage}`}
                      alt="Source"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => setWhiteBgImage(undefined)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-neutral-600">
                      Upload Product Image
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhiteBackground}
              disabled={!whiteBgImage || isProcessingWhiteBg}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                !whiteBgImage || isProcessingWhiteBg
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30",
              )}
            >
              {isProcessingWhiteBg ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Removing Background...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Remove Background
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          <div
            className={cn(
              "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center",
              whiteBgResult
                ? "border-emerald-500 bg-white"
                : "border-neutral-200 bg-neutral-50 text-neutral-400",
            )}
          >
            {whiteBgResult ? (
              <>
                <img
                  src={whiteBgResult}
                  alt="Result"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                  <a
                    href={whiteBgResult}
                    download="product-white-bg.png"
                    className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Download size={16} />
                    Download PNG
                  </a>
                </div>
                <div className="absolute top-6 right-6 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <CheckCircle2 size={14} />
                  Processed
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-neutral-100 rounded-[2rem] flex items-center justify-center mx-auto">
                  <ImageIcon size={32} className="opacity-20" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest">
                    Result Preview
                  </p>
                  <p className="text-[10px] font-medium max-w-[200px]">
                    Your processed image with a clean white background will
                    appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default WhiteBackgroundView;
