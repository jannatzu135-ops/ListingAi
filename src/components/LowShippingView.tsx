import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Upload,
  X,
  RefreshCw,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Lock,
  AlertCircle,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { processLowShippingImage, type LowShippingResult } from "../services/geminiService";
import { doc, setDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { ErrorDisplay } from "./ErrorDisplay";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LowShippingViewProps {
  image: string | undefined;
  setImage: (img: string | undefined) => void;
  result: LowShippingResult | null;
  setResult: (res: LowShippingResult | null) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  userData: any;
  onNavigate: (view: any) => void;
  error: string | null;
  trackUsage?: (feature: 'listingCount' | 'photoshootCount' | 'shippingCount' | 'activeUsers') => void;
}

const LowShippingView: React.FC<LowShippingViewProps> = React.memo(({
  image,
  setImage,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  userData,
  onNavigate,
  error: externalError,
  trackUsage,
}) => {
  const hasAccess = userData?.hasLowShippingAddon || userData?.planType === 'pro_max';
  const [internalError, setInternalError] = useState<string | null>(null);
  const error = externalError || internalError;

  const DAILY_LIMIT = 5;
  const today = new Date().toISOString().split('T')[0];
  const currentUsage = userData?.lastLowShippingDate === today ? (userData?.dailyLowShippingCount || 0) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result?.toString().split(",")[1];
        setImage(b64);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image) return;

    if (currentUsage >= DAILY_LIMIT) {
      setInternalError(`Daily limit reached (${DAILY_LIMIT} per day). Please try again tomorrow.`);
      return;
    }

    setIsProcessing(true);
    setInternalError(null);
    try {
      const processedResult = await processLowShippingImage(image);
      setResult(processedResult);
      if (trackUsage) trackUsage('shippingCount');

      // Update usage
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, {
          dailyLowShippingCount: currentUsage + 1,
          lastLowShippingDate: today
        }, { merge: true });
      }
    } catch (error) {
      console.error("Processing failed:", error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
      setInternalError("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      key="lowShipping"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">
              Low Shipping Tool
            </h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20">
                Add-on
              </span>
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">
                Pro
              </span>
            </div>
          </div>
          <p className="text-neutral-500 max-w-xl">
            Optimize your product images for volumetric weight reduction. 
            Automatically centers products with smart padding to reduce shipping costs on Meesho, Amazon, and Flipkart.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} />
                Product Image
              </label>
              <div
                className={cn(
                  "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden group",
                  image
                    ? "border-indigo-600 bg-indigo-600/5"
                    : "border-neutral-200 hover:border-indigo-600/50 hover:bg-indigo-600/5",
                )}
              >
                {image ? (
                  <>
                    <img
                      src={`data:image/png;base64,${image}`}
                      alt="Source"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => {
                        setImage(undefined);
                        setResult(null);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
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

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Optimization Rules</span>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Today: {currentUsage}/{DAILY_LIMIT}
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Pure White Background (#FFFFFF)",
                  "Perfect 1:1 Square Aspect Ratio",
                  "Precise Product Centering",
                  "30-35% Smart Padding for Volumetric Reduction"
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-500">
                    <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <ErrorDisplay error={error} className="mb-0" />

            <button
              type="button"
              onClick={() => !hasAccess ? onNavigate('subscription') : handleProcess()}
              disabled={!image || isProcessing}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative overflow-hidden",
                !image || isProcessing
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : !hasAccess
                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/30",
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Processing Optimization...
                </>
              ) : !hasAccess ? (
                <>
                  <Lock size={18} />
                  Add-on Required
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Optimize for Low Shipping
                </>
              )}
            </button>

            {!hasAccess && (
              <button 
                onClick={() => onNavigate('subscription')}
                className="w-full p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-colors text-left group"
              >
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed text-center group-hover:text-amber-800">
                  This is a premium add-on. Please purchase the <span className="font-black">Low Shipping Add-on</span> from the Subscription tab to unlock this feature.
                </p>
              </button>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          <div
            className={cn(
              "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center",
              result
                ? "border-emerald-500 bg-white shadow-2xl shadow-emerald-500/10"
                : "border-neutral-200 bg-neutral-50 text-neutral-400",
            )}
          >
            {result ? (
              <>
                <img
                  src={result.image}
                  alt="Result"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                  <a
                    href={result.image}
                    download="low-shipping-optimized.png"
                    className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl text-indigo-600 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Download size={16} />
                    Download Optimized Image
                  </a>
                </div>
                <div className="absolute top-6 right-6 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <CheckCircle2 size={14} />
                  Optimized
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-neutral-100 rounded-[2rem] flex items-center justify-center mx-auto">
                  <Zap size={32} className="opacity-20" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest">
                    Optimization Preview
                  </p>
                  <p className="text-[10px] font-medium max-w-[200px]">
                    Your volumetric-optimized image will appear here after processing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl"
              >
                <div className="flex items-center gap-3 text-emerald-700 mb-2">
                  <Sparkles size={20} />
                  <p className="text-sm font-black uppercase tracking-wider">Optimization Success!</p>
                </div>
                <p className="text-xs text-emerald-600 font-bold leading-relaxed">
                  Your product has been centered with 40% smart padding. This visual reduction helps in bypassing AI-based dimension verification on Meesho and Amazon.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-4"
              >
                <div className="flex items-center gap-3 text-indigo-700">
                  <Zap size={20} />
                  <p className="text-sm font-black uppercase tracking-wider">Meesho Panel Advice</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Recommended Dim.</p>
                    <p className="text-lg font-black text-indigo-600">
                      {result.advice.recommendedDimensions.l} x {result.advice.recommendedDimensions.b} x {result.advice.recommendedDimensions.h} <span className="text-[10px] text-slate-400">cm</span>
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Weight Slab</p>
                    <p className="text-sm font-black text-indigo-600">{result.advice.weightSlab}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Packaging Tip</p>
                      <p className="text-xs font-bold text-slate-700">{result.advice.packagingTip}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Meesho Secret Trick</p>
                      <p className="text-xs font-bold text-slate-700">{result.advice.meeshoSecretTrick}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-700 leading-tight">
                    <span className="font-black">CRITICAL:</span> You MUST enter the recommended dimensions above in your Meesho Seller Panel after uploading the optimized image to see the shipping cost reduction.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-slate-900 rounded-3xl space-y-4"
              >
                <div className="flex items-center gap-3 text-amber-400">
                  <ShieldCheck size={20} />
                  <p className="text-sm font-black uppercase tracking-wider">Market Secret Insights</p>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "The 18x18x4 Rule", desc: "Most successful Meesho sellers use 18x18x4 cm for small items to stay in the lowest volumetric slab." },
                    { title: "Polybag Advantage", desc: "Switching from boxes to thin polybags can save 100g, often keeping you under the 500g weight slab." },
                    { title: "Image Scale Trick", desc: "Our 40% padding trick makes the product look smaller to Meesho's AI audit system, preventing weight penalties." }
                  ].map((insight, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{insight.title}</p>
                      <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{insight.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default LowShippingView;
