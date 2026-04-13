import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ShoppingBag,
  Copy,
  Check,
  RefreshCw,
  Scale,
  Crown,
  ChevronRight,
  ChevronLeft,
  Zap,
  Target,
  Download,
  Layout,
  Image as ImageIcon,
  FileText,
  Pencil,
  CheckCircle2,
  DollarSign,
  Search,
  Brain,
  Link as LinkIcon,
  MessageCircle,
  Settings,
  Box,
  X,
  Upload,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { cn } from "../lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ErrorDisplay } from "./ErrorDisplay";

interface ListingGeneratorViewProps {
  step: number;
  setStep: (step: number) => void;
  selectedPlatforms: string[];
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  inputMethod: "image" | "text" | "url";
  setInputMethod: (method: "image" | "text" | "url") => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  imageB64: string | undefined;
  setImageB64: (img: string | undefined) => void;
  backImageB64: string | undefined;
  setBackImageB64: (img: string | undefined) => void;
  tone: string;
  setTone: (tone: string) => void;
  pricingGoal: string;
  setPricingGoal: (goal: string) => void;
  seoFocus: boolean;
  setSeoFocus: (focus: boolean) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  results: any;
  setResults: (res: any) => void;
  activeResultTab: string;
  setActiveResultTab: (tab: string) => void;
  generationProgress: number;
  generationStatus: string;
  handleRegenerateSection: (platform: string, section: string) => void;
  regeneratingSection: { platform: string; section: string } | null;
  copyToClipboard: (text: string, field: string) => void;
  copiedField: string | null;
  exportResults: (format: "json" | "csv" | "txt") => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  error: string | null;
  PLATFORMS: any[];
  TONES: string[];
  getPlatformLimits: (platformId: string) => any;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type?: "front" | "back") => void;
  userData: any;
}

const ListingGeneratorView: React.FC<ListingGeneratorViewProps> = React.memo((props) => {
  const {
    step,
    setStep,
    selectedPlatforms,
    setSelectedPlatforms,
    inputMethod,
    setInputMethod,
    inputValue,
    setInputValue,
    imageB64,
    setImageB64,
    backImageB64,
    setBackImageB64,
    tone,
    setTone,
    pricingGoal,
    setPricingGoal,
    seoFocus,
    setSeoFocus,
    isGenerating,
    handleGenerate,
    results,
    setResults,
    activeResultTab,
    setActiveResultTab,
    generationProgress,
    generationStatus,
    handleRegenerateSection,
    regeneratingSection,
    copyToClipboard,
    copiedField,
    exportResults,
    showPreview,
    setShowPreview,
    error,
    PLATFORMS,
    TONES,
    getPlatformLimits,
    handleImageUpload,
    userData,
  } = props;

  const LISTING_DAILY_LIMIT = 20;
  const today = new Date().toISOString().split('T')[0];
  const currentListingUsage = userData?.lastListingGenerationDate === today ? (userData?.dailyListingCount || 0) : 0;

  return (
    <motion.div
      key="generator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <ErrorDisplay error={error} />

      {step < 4 && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">
              Listing Generator
            </h1>
            <p className="text-neutral-500 max-w-xl">
              Create high-converting product listings optimized for your
              favorite marketplaces in seconds.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Daily Limit</p>
                <p className="text-sm font-black text-slate-900 leading-none">
                  {currentListingUsage} <span className="text-slate-400 font-bold">/ {LISTING_DAILY_LIMIT}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-neutral-100 shadow-sm">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                      step === s
                        ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/20"
                        : step > s
                          ? "bg-emerald-500 text-white"
                          : "bg-neutral-100 text-neutral-400",
                    )}
                  >
                    {step > s ? <Check size={14} /> : s}
                  </div>
                  {s < 2 && (
                    <div className="w-8 h-0.5 bg-neutral-100 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">
                Select Marketplaces
              </h2>
              <p className="text-neutral-500">
                Choose where you want to list your product
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatforms([platform.id])}
                  className={cn(
                    "p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 group relative overflow-hidden",
                    selectedPlatforms.includes(platform.id)
                      ? "border-blue-600 bg-blue-600/5"
                      : "border-neutral-100 hover:border-blue-600/30 bg-white",
                  )}
                >
                  {selectedPlatforms.includes(platform.id) && (
                    <div className="absolute top-4 right-4 text-blue-600">
                      <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform",
                      selectedPlatforms.includes(platform.id)
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-50",
                    )}
                  >
                    {platform.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-sm">{platform.name}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                      {platform.id.includes("amazon") ? "Global" : "Regional"}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedPlatforms.length === 0}
                className={cn(
                  "px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-2 transition-all",
                  selectedPlatforms.length === 0
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20",
                )}
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">
                Product Details
              </h2>
              <p className="text-neutral-500">
                How would you like to provide product info?
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {[
                { id: "text", label: "Text Description", icon: <FileText size={18} /> },
                { id: "image", label: "Product Image", icon: <ImageIcon size={18} /> },
                { id: "url", label: "Product URL", icon: <LinkIcon size={18} /> },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setInputMethod(method.id as any)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
                    inputMethod === method.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50",
                  )}
                >
                  {method.icon}
                  {method.label}
                </button>
              ))}
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl space-y-6">
              {inputMethod === "text" && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Detailed Product Information
                  </label>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Describe your product, its features, benefits, and specifications..."
                    className="w-full p-6 rounded-3xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none h-48 resize-none font-medium text-sm"
                  />
                </div>
              )}

              {inputMethod === "image" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Front View (Main)
                      </label>
                      <div className="relative aspect-square rounded-3xl border-2 border-dashed border-neutral-200 hover:border-blue-600/50 hover:bg-blue-600/5 transition-all overflow-hidden group">
                        {imageB64 ? (
                          <>
                            <img
                              src={`data:image/png;base64,${imageB64}`}
                              alt="Front"
                              className="w-full h-full object-contain"
                            />
                            <button
                              onClick={() => setImageB64(undefined)}
                              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                              <Upload size={20} />
                            </div>
                            <p className="text-xs font-bold text-neutral-600">
                              Upload Front View
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "front")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Back View (Optional)
                      </label>
                      <div className="relative aspect-square rounded-3xl border-2 border-dashed border-neutral-200 hover:border-blue-600/50 hover:bg-blue-600/5 transition-all overflow-hidden group">
                        {backImageB64 ? (
                          <>
                            <img
                              src={`data:image/png;base64,${backImageB64}`}
                              alt="Back"
                              className="w-full h-full object-contain"
                            />
                            <button
                              onClick={() => setBackImageB64(undefined)}
                              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                              <Upload size={20} />
                            </div>
                            <p className="text-xs font-bold text-neutral-600">
                              Upload Back View
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "back")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-neutral-100">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Additional Product Info (Optional)
                    </label>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Add any specific details like material, size, or special features to improve the listing..."
                      className="w-full p-4 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none h-24 resize-none font-medium text-sm"
                    />
                  </div>
                </div>
              )}

              {inputMethod === "url" && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Competitor or Reference URL
                  </label>
                  <div className="relative">
                    <LinkIcon
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={20}
                    />
                    <input
                      type="url"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="https://amazon.com/dp/B0..."
                      className="w-full pl-12 pr-6 py-5 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium italic">
                    * We'll analyze the product details from this URL to create
                    your listing
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-8">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 rounded-2xl border border-neutral-200 font-bold flex items-center gap-2 hover:bg-neutral-100 transition-all"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={(!inputValue && !imageB64) || isGenerating}
                className={cn(
                  "px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-2 transition-all",
                  (!inputValue && !imageB64) || isGenerating
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20",
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Listing
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {isGenerating ? (
              <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="relative w-48 h-48">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="text-neutral-100 stroke-current"
                        strokeWidth="4"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                      <motion.circle
                        className="text-blue-600 stroke-current"
                        strokeWidth="4"
                        strokeDasharray={282.7}
                        initial={{ strokeDashoffset: 282.7 }}
                        animate={{
                          strokeDashoffset:
                            282.7 -
                            (282.7 * generationProgress) / 100,
                        }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        strokeLinecap="round"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-blue-600"
                      >
                        <Brain size={64} />
                      </motion.div>
                      <span className="text-2xl font-black mt-2">
                        {Math.round(generationProgress)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 w-full">
                  <div className="space-y-3">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={generationStatus}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xl font-bold tracking-tight text-neutral-800"
                      >
                        {generationStatus}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-sm font-medium text-neutral-500">
                      Our AI is processing your request across
                      multiple marketplaces
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Analysis", threshold: 30 },
                      { label: "Generation", threshold: 70 },
                      { label: "Optimization", threshold: 100 },
                    ].map((s, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: "0%" }}
                            animate={{
                              width:
                                generationProgress >= s.threshold
                                  ? "100%"
                                  : generationProgress > i * 33
                                    ? `${((generationProgress - i * 33) / 33) * 100}%`
                                    : "0%",
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            generationProgress >= s.threshold
                              ? "text-blue-600"
                              : "text-neutral-400",
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {selectedPlatforms.map((pId) => {
                      const p = PLATFORMS.find((pl) => pl.id === pId);
                      return (
                        <motion.div
                          key={pId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-2xl shadow-sm"
                        >
                          <span className="text-lg">{p?.icon}</span>
                          <span className="text-xs font-bold">
                            {p?.name}
                          </span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : results ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">
                        Generated Listings
                      </h1>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                        Optimized for your selected marketplaces
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setResults(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-neutral-200 font-bold text-sm hover:bg-neutral-100 transition-all"
                    >
                      Start New
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <Layout size={16} />
                      Live Preview
                    </button>
                    <div className="relative group">
                      <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Download size={16} />
                        Export
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-neutral-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                        <button
                          onClick={() => exportResults("json")}
                          className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-neutral-50 border-b border-neutral-100"
                        >
                          JSON Format
                        </button>
                        <button
                          onClick={() => exportResults("csv")}
                          className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-neutral-50 border-b border-neutral-100"
                        >
                          Excel (CSV)
                        </button>
                        <button
                          onClick={() => exportResults("txt")}
                          className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-neutral-50"
                        >
                          Text File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-neutral-100 rounded-2xl w-fit border border-neutral-200">
                  {selectedPlatforms.map((pId) => (
                    <button
                      key={pId}
                      onClick={() => setActiveResultTab(pId)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                        activeResultTab === pId
                          ? "bg-white shadow-lg text-blue-600 scale-105"
                          : "text-neutral-500 hover:text-neutral-700",
                      )}
                    >
                      {PLATFORMS.find((p) => p.id === pId)?.icon}
                      {PLATFORMS.find((p) => p.id === pId)?.name}
                    </button>
                  ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-blue-600/5 border border-blue-600/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black">
                            Listing Ready!
                          </p>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            Optimized for {activeResultTab}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const result = results[activeResultTab];
                            if (!result) return;
                            let fullText = `Title: ${result.title}\n\n`;
                            result.platformSpecificBlocks.forEach((block: any) => {
                              fullText += `${block.label}:\n${block.content}\n\n`;
                            });
                            fullText += `Description:\n${result.description}\n\n`;
                            fullText += `Pricing Strategy:\nRecommended: ${result.pricingStrategy?.recommendedPrice || "N/A"}\nAverage Category Price: ${result.pricingStrategy?.averagePrice || "N/A"}\nMarket Budget: ${result.pricingStrategy?.budgetPrice || "N/A"}\nMarket Premium: ${result.pricingStrategy?.premiumPrice || "N/A"}\nBand: ${result.pricingStrategy?.priceBand || "N/A"}\nAggressive: ${result.pricingStrategy?.aggressivePrice || "N/A"} (${result.pricingStrategy?.aggressiveReasoning || "N/A"})\nBalanced: ${result.pricingStrategy?.balancedPrice || "N/A"} (${result.pricingStrategy?.balancedReasoning || "N/A"})\nPremium: ${result.pricingStrategy?.premiumPriceValue || "N/A"} (${result.pricingStrategy?.premiumReasoning || "N/A"})\n\n`;
                            fullText += `HSN Code: ${result.hsnCode}\nCategory: ${result.productCategory}\n`;
                            fullText += `GST Rate: ${result.gstRate || "N/A"}\nGST Reasoning: ${result.gstReasoning || "N/A"}`;
                            copyToClipboard(fullText, "all");
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                        >
                          {copiedField === "all" ? <Check size={14} /> : <Copy size={14} />}
                          Copy All
                        </button>
                        <button
                          onClick={() => exportResults("txt")}
                          className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-neutral-50 transition-all"
                        >
                          <Download size={14} />
                          Export TXT
                        </button>
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl border shadow-sm space-y-8 bg-white border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">SEO Score</h3>
                        <span className="px-3 py-1 bg-neutral-100 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-500 capitalize">
                          {activeResultTab}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative w-32 h-32 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-neutral-100 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                            <motion.circle
                              className="text-blue-500 stroke-current"
                              strokeWidth="8"
                              strokeDasharray={251.2}
                              initial={{ strokeDashoffset: 251.2 }}
                              animate={{ strokeDashoffset: 251.2 - (251.2 * (results[activeResultTab].seoAnalysis?.score || 0)) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              strokeLinecap="round"
                              fill="transparent"
                              r="40"
                              cx="50"
                              cy="50"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black">{results[activeResultTab].seoAnalysis?.score || 0}</span>
                            <span className="text-[10px] font-bold uppercase text-neutral-400">Out of 100</span>
                          </div>
                        </div>
                        <div className="flex-1 w-full space-y-5">
                          {[
                            { label: "Title", score: (results[activeResultTab].seoAnalysis?.scoreBreakdown?.title || 0) * 4, color: "bg-blue-500" },
                            { label: "Bullets", score: (results[activeResultTab].seoAnalysis?.scoreBreakdown?.bullets || 0) * 4, color: "bg-emerald-500" },
                            { label: "Description", score: (results[activeResultTab].seoAnalysis?.scoreBreakdown?.description || 0) * 4, color: "bg-purple-500" },
                            { label: "Keywords", score: (results[activeResultTab].seoAnalysis?.scoreBreakdown?.keywords || 0) * 4, color: "bg-cyan-500" },
                          ].map((item) => (
                            <div key={item.label} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-neutral-500">{item.label}</span>
                                <span>{item.score}%</span>
                              </div>
                              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <motion.div
                                  className={cn("h-full rounded-full", item.color)}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.score}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl border shadow-sm space-y-8 bg-white border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign size={18} className="text-green-500" />
                          <h3 className="text-lg font-bold">Pricing Strategy</h3>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                          results[activeResultTab].pricingStrategy?.confidence === "High" ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                        )}>
                          {results[activeResultTab].pricingStrategy?.confidence} Confidence
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        {[
                          { label: "Recommended", value: results[activeResultTab].pricingStrategy?.recommendedPrice, icon: <Target size={14} />, color: "text-blue-600", reasoning: null },
                          { label: "Aggressive", value: results[activeResultTab].pricingStrategy?.aggressivePrice, icon: <Zap size={14} />, color: "text-orange-600", reasoning: results[activeResultTab].pricingStrategy?.aggressiveReasoning },
                          { label: "Balanced", value: results[activeResultTab].pricingStrategy?.balancedPrice, icon: <Scale size={14} />, color: "text-green-600", reasoning: results[activeResultTab].pricingStrategy?.balancedReasoning },
                          { label: "Premium", value: results[activeResultTab].pricingStrategy?.premiumPriceValue, icon: <Crown size={14} />, color: "text-purple-600", reasoning: results[activeResultTab].pricingStrategy?.premiumReasoning },
                        ].map((p) => (
                          <div key={p.label} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2 flex flex-col">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              {p.icon}{p.label}
                            </div>
                            <p className={cn("text-lg font-black", p.color)}>{p.value}</p>
                            {p.reasoning && <p className="text-[10px] text-neutral-500 leading-tight mt-auto pt-2 border-t border-neutral-200/50">{p.reasoning}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Market Price Band</span>
                          <span className="text-sm font-black text-blue-600">{results[activeResultTab].pricingStrategy?.priceBand}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-blue-500/10">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Market Avg</span>
                            <p className="text-sm font-black text-blue-600">{results[activeResultTab].pricingStrategy?.averagePrice}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Market Budget</span>
                            <p className="text-sm font-black text-blue-600">{results[activeResultTab].pricingStrategy?.budgetPrice || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Market Premium</span>
                            <p className="text-sm font-black text-blue-600">{results[activeResultTab].pricingStrategy?.premiumPrice || "N/A"}</p>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed italic">"{results[activeResultTab].pricingStrategy?.whyItHelps}"</p>
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl border shadow-sm space-y-4 relative overflow-hidden bg-white border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-neutral-500" />
                          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Generated Title</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRegenerateSection(activeResultTab, "title")}
                            disabled={regeneratingSection?.platform === activeResultTab && regeneratingSection?.section === "title"}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <RefreshCw size={16} className={cn(regeneratingSection?.platform === activeResultTab && regeneratingSection?.section === "title" && "animate-spin text-blue-600")} />
                          </button>
                          <button onClick={() => copyToClipboard(results[activeResultTab].title, "title")} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            {copiedField === "title" ? <Check size={16} className="text-blue-600" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                        <h3 className="text-xl font-bold leading-tight">{results[activeResultTab].title}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["short", "medium", "long"].map((v) => (
                          <div key={v} className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{v} (Variation)</p>
                            <p className="text-xs font-bold leading-tight">{(results[activeResultTab].titleVariations as any)[v]}</p>
                            <button onClick={() => copyToClipboard((results[activeResultTab].titleVariations as any)[v], `title-${v}`)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                              {copiedField === `title-${v}` ? <Check size={10} /> : <Copy size={10} />} Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(results[activeResultTab].platformSpecificBlocks || [])
                      .filter((block: any) => activeResultTab !== 'website' || block.label !== 'Product Description')
                      .map((block: any, i: number) => (
                      <div key={i} className="p-8 rounded-3xl border shadow-sm space-y-4 bg-white border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers size={16} className="text-neutral-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{block.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => copyToClipboard(block.content, `block-${i}`)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                              {copiedField === `block-${i}` ? <Check size={16} className="text-blue-600" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm leading-relaxed font-medium prose prose-sm max-w-none">
                          <MarkdownRenderer content={block.content} />
                        </div>
                      </div>
                    ))}

                    <div className="p-8 rounded-3xl border shadow-sm space-y-6 bg-white border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-blue-500" />
                          <h3 className="text-sm font-bold">Product Description</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRegenerateSection(activeResultTab, "description")}
                            disabled={regeneratingSection?.platform === activeResultTab && regeneratingSection?.section === "description"}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <RefreshCw size={16} className={cn(regeneratingSection?.platform === activeResultTab && regeneratingSection?.section === "description" && "animate-spin text-blue-600")} />
                          </button>
                          <button onClick={() => copyToClipboard(results[activeResultTab].description, "description")} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            {copiedField === "description" ? <Check size={16} className="text-blue-600" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="p-8 rounded-3xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-600 leading-relaxed font-medium prose prose-sm max-w-none">
                        <MarkdownRenderer content={results[activeResultTab].description} />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl shadow-slate-900/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl">
                          <Search size={20} />
                        </div>
                        <h4 className="text-lg font-black">SEO Strategy</h4>
                      </div>
                      <p className="text-sm text-blue-50/70 leading-relaxed font-medium">{results[activeResultTab].seoAnalysis?.platformSpecificAdvice || results[activeResultTab].whyThisHelps}</p>
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Target Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {(results[activeResultTab].keywords || []).map((kw: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold border border-white/10">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600">
                          <Zap size={20} />
                        </div>
                        <h4 className="text-lg font-black">Marketplace Tips</h4>
                      </div>
                      <div className="space-y-4">
                        {(results[activeResultTab].rankingTips || []).map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                            <div className="mt-1 p-1 bg-blue-600/10 rounded-full text-blue-600"><Check size={10} /></div>
                            <p className="text-xs font-medium text-neutral-600 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl border border-neutral-200 bg-white space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600">
                          <Box size={20} />
                        </div>
                        <h4 className="text-lg font-black">Compliance & Logistics</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">HSN Code</p>
                          <p className="text-sm font-black">{results[activeResultTab].hsnCode}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Category</p>
                          <p className="text-sm font-black">{results[activeResultTab].productCategory}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">GST Rate</p>
                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black">{results[activeResultTab].gstRate}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 leading-tight">{results[activeResultTab].gstReasoning}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

export default ListingGeneratorView;
