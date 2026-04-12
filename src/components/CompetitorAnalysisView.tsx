import React from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  RefreshCw,
  Target,
  DollarSign,
  MessageSquare,
  Hash,
  CheckCircle2,
  Check,
  X,
  TrendingUp,
  Zap,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Users,
  Layout,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { PLATFORMS } from "../constants";
import { ErrorDisplay } from "./ErrorDisplay";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompetitorAnalysisViewProps {
  error: string | null;
  activeResultTab: string;
  setActiveResultTab: (tab: string) => void;
  competitorUrl: string;
  setCompetitorUrl: (url: string) => void;
  handleAnalyzeCompetitor: () => void;
  isAnalyzingCompetitor: boolean;
  competitorAnalysisResults: any;
  userData: any;
}

const CompetitorAnalysisView: React.FC<CompetitorAnalysisViewProps> = React.memo(({
  error,
  activeResultTab,
  setActiveResultTab,
  competitorUrl,
  setCompetitorUrl,
  handleAnalyzeCompetitor,
  isAnalyzingCompetitor,
  competitorAnalysisResults,
  userData,
}) => {
  const DAILY_LIMIT = 10;
  const today = new Date().toISOString().split('T')[0];
  const currentUsage = userData?.lastCompetitorDate === today ? (userData?.dailyCompetitorCount || 0) : 0;

  return (
    <motion.div
      key="competitorAnalysis"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Competitor Analysis
          </h1>
          <p className="text-neutral-500">
            Analyze top competitors on any marketplace to gain a
            competitive edge.
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 self-start md:self-end">
          <div className="w-8 h-8 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
            <Target size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Daily Limit</p>
            <p className="text-sm font-black text-slate-900 leading-none">
              {currentUsage} <span className="text-slate-400 font-bold">/ {DAILY_LIMIT}</span>
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "p-8 rounded-3xl border shadow-xl space-y-8",
          "bg-white border-neutral-200",
        )}
      >
        <ErrorDisplay error={error} />

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              Select Marketplace
            </label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveResultTab(p.id)}
                  className={cn(
                    "px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 font-bold",
                    activeResultTab === p.id
                      ? "border-blue-600 bg-blue-600/5 text-blue-600 shadow-lg shadow-blue-500/10"
                      : "border-neutral-200 hover:border-blue-600/50",
                  )}
                >
                  <span>{p.icon}</span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              Product URL
            </label>
            <div className="relative">
              <LinkIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={20}
              />
              <input
                type="url"
                placeholder="https://amazon.in/product/..."
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border focus:ring-2 focus:ring-blue-500 transition-all outline-none",
                  "bg-white border-neutral-200",
                )}
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleAnalyzeCompetitor}
              disabled={
                !competitorUrl ||
                !activeResultTab ||
                isAnalyzingCompetitor
              }
              className={cn(
                "px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all",
                !competitorUrl ||
                  !activeResultTab ||
                  isAnalyzingCompetitor
                  ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20",
              )}
            >
              {isAnalyzingCompetitor ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Analyzing Competitors...
                </>
              ) : (
                <>
                  <Target size={20} />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {competitorAnalysisResults[activeResultTab] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Target Product Analysis */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center">
                  <Target size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">
                    Market Intelligence
                  </h2>
                  <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest">
                    Deep dive into your product's landscape
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Main Product Info Dashboard */}
              <div className="lg:col-span-8 space-y-6">
                <div
                  className={cn(
                    "p-8 rounded-[2.5rem] border shadow-xl space-y-8 relative overflow-hidden",
                    "bg-white border-neutral-200",
                  )}
                >
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black leading-tight tracking-tight">
                      {
                        competitorAnalysisResults[activeResultTab]
                          .targetProduct?.name
                      }
                    </h3>
                    <div className="flex items-center gap-3 text-sm font-bold text-neutral-500 uppercase tracking-widest">
                      <DollarSign
                        size={16}
                        className="text-blue-500"
                      />
                      {
                        competitorAnalysisResults[activeResultTab]
                          .targetProduct?.pricingStrategy
                      }
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Sentiment & Keywords */}
                    <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={14} />
                            Sentiment
                          </p>
                          <div
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                              competitorAnalysisResults[
                                activeResultTab
                              ]?.targetProduct?.reviewSentiment ===
                                "Positive"
                                ? "bg-blue-500/10 text-blue-500"
                                : competitorAnalysisResults[
                                      activeResultTab
                                    ]?.targetProduct
                                      ?.reviewSentiment === "Neutral"
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-red-500/10 text-red-500",
                            )}
                          >
                            {
                              competitorAnalysisResults[
                                activeResultTab
                              ]?.targetProduct?.reviewSentiment
                            }
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 italic leading-relaxed font-medium">
                          "
                          {
                            competitorAnalysisResults[activeResultTab]
                              .targetProduct?.sentimentDetails
                          }
                          "
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                          <Hash size={14} />
                          Top Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(competitorAnalysisResults[
                            activeResultTab
                          ].targetProduct?.topKeywords || []).map((kw: string, k: number) => (
                            <span
                              key={k}
                              className="px-3 py-1 bg-white border border-neutral-200 rounded-xl text-[11px] font-bold shadow-sm hover:border-blue-500 transition-colors cursor-default"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          Strengths
                        </p>
                        <div className="space-y-2">
                          {(competitorAnalysisResults[
                            activeResultTab
                          ].targetProduct?.strengths || []).map((s: string, i: number) => (
                            <div
                              key={i}
                              className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-xs text-neutral-600 flex items-start gap-3"
                            >
                              <Check
                                size={14}
                                className="text-blue-500 shrink-0 mt-0.5"
                              />
                              <span className="font-medium">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle size={14} />
                          Weaknesses
                        </p>
                        <div className="space-y-2">
                          {(competitorAnalysisResults[
                            activeResultTab
                          ].targetProduct?.weaknesses || []).map((w: string, i: number) => (
                            <div
                              key={i}
                              className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-neutral-600 flex items-start gap-3"
                            >
                              <X
                                size={14}
                                className="text-red-500 shrink-0 mt-0.5"
                              />
                              <span className="font-medium">{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Insights Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div
                  className={cn(
                    "p-8 rounded-[2.5rem] border shadow-xl space-y-6 relative overflow-hidden",
                    "bg-blue-600 text-white border-blue-500",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn("p-2 rounded-xl", "bg-white/20")}
                    >
                      <TrendingUp size={24} />
                    </div>
                    <h3 className="text-xl font-black">
                      Price Strategy
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                        Suggested Range
                      </span>
                      <span className="text-3xl font-black">
                        {
                          competitorAnalysisResults[activeResultTab]
                            .suggestedPricingRange?.min
                        }{" "}
                        -{" "}
                        {
                          competitorAnalysisResults[activeResultTab]
                            .suggestedPricingRange?.max
                        }
                      </span>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-2xl backdrop-blur-md border",
                        "bg-white/10 border-white/20",
                      )}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">
                        Market Reasoning
                      </p>
                      <div className="text-xs leading-relaxed font-medium prose prose-sm max-w-none whitespace-pre-wrap">
                        <MarkdownRenderer
                          content={
                            competitorAnalysisResults[activeResultTab]
                              .suggestedPricingRange?.reasoning
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "p-8 rounded-[2.5rem] border shadow-xl space-y-4",
                    "bg-white border-neutral-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 rounded-xl text-neutral-500">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-black">
                      Market Summary
                    </h3>
                  </div>
                  <div className="text-sm text-neutral-500 leading-relaxed font-medium prose prose-sm max-w-none whitespace-pre-wrap">
                    <MarkdownRenderer
                      content={
                        competitorAnalysisResults[activeResultTab]
                          ?.marketSummary
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competitors Analysis */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/20">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Top Competitors
                </h2>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                  Market leaders in this category
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {(competitorAnalysisResults[
                activeResultTab
              ].competitors || []).map((comp: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-6 rounded-[2rem] border shadow-lg space-y-6 flex flex-col group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500",
                    "bg-white border-neutral-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {comp?.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                        <DollarSign
                          size={12}
                          className="text-blue-500"
                        />
                        {comp.pricingStrategy}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                          <MessageSquare size={12} />
                          Sentiment
                        </div>
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                            comp.reviewSentiment === "Positive"
                              ? "bg-blue-500/10 text-blue-500"
                              : comp.reviewSentiment === "Neutral"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-red-500/10 text-red-500",
                          )}
                        >
                          {comp.reviewSentiment}
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-500 italic leading-relaxed line-clamp-2">
                        "{comp.sentimentDetails}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          Strengths
                        </p>
                        <div className="space-y-1.5">
                          {(comp.strengths || [])
                            .slice(0, 2)
                            .map((s: string, i: number) => (
                              <div
                                key={i}
                                className="text-[11px] text-neutral-500 flex items-start gap-2 font-medium"
                              >
                                <Check
                                  size={12}
                                  className="text-blue-500 shrink-0 mt-0.5"
                                />
                                <span className="line-clamp-2">
                                  {s}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                          <AlertTriangle size={12} />
                          Weaknesses
                        </p>
                        <div className="space-y-1.5">
                          {(comp.weaknesses || [])
                            .slice(0, 2)
                            .map((w: string, i: number) => (
                              <div
                                key={i}
                                className="text-[11px] text-neutral-500 flex items-start gap-2 font-medium"
                              >
                                <X
                                  size={12}
                                  className="text-red-500 shrink-0 mt-0.5"
                                />
                                <span className="line-clamp-2">
                                  {w}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100">
                    <div className="flex flex-wrap gap-1.5">
                      {(comp.topKeywords || []).slice(0, 4).map((kw: string, k: number) => (
                        <span
                          key={k}
                          className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[10px] font-black text-neutral-500 uppercase tracking-tight"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <Layout size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Comparison Matrix
                </h2>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                  Side-by-side market comparison
                </p>
              </div>
            </div>

            <div
              className={cn(
                "rounded-3xl border shadow-sm overflow-hidden",
                "bg-white border-neutral-200",
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={cn(
                        "border-b text-[10px] font-bold uppercase tracking-widest",
                        "border-neutral-100 text-neutral-400",
                      )}
                    >
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Sentiment</th>
                      <th className="px-6 py-4">Top Keywords</th>
                      <th className="px-6 py-4">Strengths</th>
                      <th className="px-6 py-4">Weaknesses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {/* Target Product Row */}
                    <tr className="bg-blue-600/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-sm font-black truncate max-w-[200px]">
                            {
                              competitorAnalysisResults[
                                activeResultTab
                              ]?.targetProduct?.name
                            }
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded uppercase">
                            Target
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                            competitorAnalysisResults[
                              activeResultTab
                            ]?.targetProduct?.reviewSentiment ===
                              "Positive"
                              ? "bg-blue-500/10 text-blue-600"
                              : competitorAnalysisResults[
                                    activeResultTab
                                  ]?.targetProduct
                                    ?.reviewSentiment === "Neutral"
                                ? "bg-orange-500/10 text-orange-600"
                                : "bg-red-500/10 text-red-600",
                          )}
                        >
                          {
                            competitorAnalysisResults[
                              activeResultTab
                            ]?.targetProduct?.reviewSentiment
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(competitorAnalysisResults[
                            activeResultTab
                          ].targetProduct?.topKeywords || [])
                            .slice(0, 2)
                            .map((kw: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-white rounded text-[9px] font-medium shadow-sm"
                              >
                                {kw}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(competitorAnalysisResults[
                            activeResultTab
                          ].targetProduct?.strengths || [])
                            .slice(0, 2)
                            .map((s: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9px] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(competitorAnalysisResults[
                            activeResultTab
                          ].targetProduct?.weaknesses || [])
                            .slice(0, 2)
                            .map((w: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-red-500/10 text-red-600 rounded text-[9px] font-medium"
                              >
                                {w}
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>

                    {/* Competitor Rows */}
                    {(competitorAnalysisResults[activeResultTab].competitors || []).map(
                      (comp: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-neutral-300" />
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {comp.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                                comp.reviewSentiment === "Positive"
                                  ? "bg-blue-500/10 text-blue-600"
                                  : comp.reviewSentiment === "Neutral"
                                    ? "bg-orange-500/10 text-orange-600"
                                    : "bg-red-500/10 text-red-600",
                              )}
                            >
                              {comp.reviewSentiment}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(comp.topKeywords || []).slice(0, 2).map((kw: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-medium"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(comp.strengths || []).slice(0, 2).map((s: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-blue-500/5 text-blue-500 rounded text-[9px] font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(comp.weaknesses || []).slice(0, 2).map((w: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-red-500/5 text-red-500 rounded text-[9px] font-medium"
                                >
                                  {w}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="mt-12 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
                <Search size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Gap Analysis & Opportunities
                </h2>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
                  Where you can outshine the competition
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(competitorAnalysisResults[
                activeResultTab
              ]?.gapAnalysis || []).map((gap: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-50 to-white border border-orange-100 shadow-sm hover:shadow-md transition-all space-y-6 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-orange-600">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <X size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Competitor Missing
                      </span>
                    </div>
                    <p className="text-base font-black leading-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                      {gap.competitorMissing}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-orange-100 relative">
                    <div className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 rounded">
                      Opportunity
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <Zap size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Our Strategic Edge
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-neutral-600">
                      {gap.ourOpportunity}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

export default CompetitorAnalysisView;
