import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Upload,
  X,
  RefreshCw,
  Layers,
  Layout,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Target,
  Zap,
  Image as ImageIcon,
  Smartphone,
  Search,
  Lightbulb,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ErrorDisplay } from "./ErrorDisplay";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface APlusContentViewProps {
  aPlusImageB64: string | undefined;
  setAPlusImageB64: (img: string | undefined) => void;
  handleAPlusImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aPlusInput: string;
  setAPlusInput: (input: string) => void;
  handleGenerateAPlus: () => void;
  isGeneratingAPlus: boolean;
  aPlusResult: any;
  error: string | null;
  userData: any;
}

const APlusContentView: React.FC<APlusContentViewProps> = React.memo(({
  aPlusImageB64,
  setAPlusImageB64,
  handleAPlusImageUpload,
  aPlusInput,
  setAPlusInput,
  handleGenerateAPlus,
  isGeneratingAPlus,
  aPlusResult,
  error,
  userData,
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const DAILY_LIMIT = 5;
  const today = new Date().toISOString().split('T')[0];
  const currentUsage = userData?.lastAPlusDate === today ? (userData?.dailyAPlusCount || 0) : 0;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      key="aPlusContent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <ErrorDisplay error={error} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            A+ Content Generator
          </h1>
          <p className="text-neutral-500 max-w-xl">
            Create high-converting Amazon A+ Content (EBC) with advanced modules, 
            persuasive copy, and AI-powered image prompts.
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 self-start md:self-end">
          <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Daily Limit</p>
            <p className="text-sm font-black text-slate-900 leading-none">
              {currentUsage} <span className="text-slate-400 font-bold">/ {DAILY_LIMIT}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div
            className={cn(
              "p-8 rounded-[2.5rem] border shadow-xl space-y-8",
              "bg-white border-neutral-200",
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Layers size={20} />
                </div>
                <h3 className="text-lg font-black">
                  Content Strategy
                </h3>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Product Image (Optional)
                </label>
                <div className="relative group">
                  {aPlusImageB64 ? (
                    <div className="relative rounded-2xl overflow-hidden border border-neutral-200 aspect-video bg-neutral-50">
                      <img
                        src={`data:image/jpeg;base64,${aPlusImageB64}`}
                        alt="A+ Product"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => setAPlusImageB64(undefined)}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-neutral-200 hover:border-blue-600/50 hover:bg-blue-600/5 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-neutral-600">
                        Upload Product Image
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAPlusImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Product Details / Key Features
                </label>
                <textarea
                  value={aPlusInput}
                  onChange={(e) => setAPlusInput(e.target.value)}
                  placeholder="Describe your product, its benefits, and unique selling points..."
                  className={cn(
                    "w-full p-4 rounded-2xl border focus:ring-2 focus:ring-blue-500 transition-all outline-none h-40 resize-none font-medium text-sm",
                    "bg-white border-neutral-200",
                  )}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAPlus}
              disabled={(!aPlusInput && !aPlusImageB64) || isGeneratingAPlus}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                (!aPlusInput && !aPlusImageB64) || isGeneratingAPlus
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30",
              )}
            >
              {isGeneratingAPlus ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate A+ Content
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {isGeneratingAPlus ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6 p-12 rounded-[2.5rem] bg-white border border-neutral-200 border-dashed">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <Layers
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600"
                  size={32}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black tracking-tight">
                  Crafting Your A+ Story...
                </p>
                <p className="text-sm text-neutral-500 font-medium">
                  Analyzing product features & designing conversion-optimized modules
                </p>
              </div>
            </div>
          ) : aPlusResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                      <Layout size={20} />
                    </div>
                    <h3 className="text-xl font-black">Conversion Strategy</h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-4">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Target size={14} className="text-blue-600" />
                      Target Audience
                    </p>
                    <p className="text-sm font-medium text-neutral-600 leading-relaxed">
                      {aPlusResult.targetAudience}
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-4">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-blue-600" />
                      Brand Voice
                    </p>
                    <p className="text-sm font-medium text-neutral-600 leading-relaxed">
                      {aPlusResult.brandVoice}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-neutral-400">
                    Recommended Modules
                  </h4>
                  <div className="space-y-4">
                    {(aPlusResult.modules || []).map((module: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 rounded-3xl border border-neutral-100 hover:border-blue-600/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="text-sm font-black uppercase tracking-tight">
                              {module.type}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(JSON.stringify(module, null, 2), `module-${i}`)}
                            className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 transition-all"
                          >
                            {copied === `module-${i}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                              Headline
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                              {module.headline}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                              Body Copy
                            </p>
                            <div className="text-xs text-neutral-600 leading-relaxed font-medium prose prose-sm max-w-none">
                              <MarkdownRenderer content={module.bodyCopy} />
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 space-y-2">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                              <ImageIcon size={12} />
                              Image Prompt
                            </p>
                            <p className="text-[11px] text-neutral-600 italic font-medium">
                              {module.imagePrompt}
                            </p>
                          </div>
                          {module.conversionLogic && (
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} />
                                Conversion Logic
                              </p>
                              <p className="text-[11px] text-neutral-600 font-medium">
                                {module.conversionLogic}
                              </p>
                            </div>
                          )}
                          {module.comparisonData && module.comparisonData.length > 0 && (
                            <div className="overflow-x-auto rounded-2xl border border-neutral-100">
                              <table className="w-full text-[10px] text-left">
                                <thead className="bg-neutral-50 font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100">
                                  <tr>
                                    {Object.keys(module.comparisonData[0]).map((key) => (
                                      <th key={key} className="px-4 py-2">{key}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {module.comparisonData.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                                      {Object.values(row).map((val: any, j: number) => (
                                        <td key={j} className="px-4 py-2 font-medium text-neutral-600">{val}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-4">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb size={14} className="text-blue-600" />
                      Design Tips
                    </p>
                    <ul className="space-y-2">
                      {(aPlusResult.designTips || []).map((tip: string, i: number) => (
                        <li key={i} className="text-xs font-medium text-neutral-600 flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-4">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Smartphone size={14} className="text-blue-600" />
                      Mobile Optimization
                    </p>
                    <ul className="space-y-2">
                      {(aPlusResult.mobileOptimizationTips || []).map((tip: string, i: number) => (
                        <li key={i} className="text-xs font-medium text-neutral-600 flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-blue-500 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {aPlusResult.seoKeywords && aPlusResult.seoKeywords.length > 0 && (
                  <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-600/10 space-y-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <Search size={14} />
                      SEO Alt-Text Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {aPlusResult.seoKeywords.map((keyword: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white border border-blue-100 text-[10px] font-bold text-blue-600">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6 p-12 rounded-[2.5rem] bg-neutral-50 border border-neutral-200 border-dashed text-neutral-400">
              <Layers size={64} className="opacity-20" />
              <div className="text-center space-y-2">
                <p className="text-lg font-black uppercase tracking-widest">
                  Ready to Generate
                </p>
                <p className="text-sm font-medium max-w-xs mx-auto">
                  Provide product details to create your high-converting A+ Content strategy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default APlusContentView;
