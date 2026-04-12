import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  Camera,
  Layers,
  Layout,
  CheckCircle2,
  Lock,
  Upload,
  RefreshCw,
  ShieldCheck,
  X,
  Plus,
  User as UserIcon,
  Palette,
  Focus,
  Download,
  Share2,
  AlertCircle,
  Image as ImageIcon,
  Box,
  PenTool,
  RotateCcw,
  Sun,
  Maximize2,
  Settings2,
  Shirt,
  ShoppingBag,
  Monitor,
  Wand2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { generateVirtualTryOn, suggestPhotoshootSettings, generateBackgroundImage, generateProductStudioImage, analyzeProductImage } from "../services/geminiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PhotoShootViewProps {
  photoShootImages: {
    front?: string;
    back?: string;
    others: string[];
  };
  handlePhotoShootUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "others") => void;
  setPhotoShootImages: React.Dispatch<React.SetStateAction<{
    front?: string;
    back?: string;
    others: string[];
  }>>;
  userData: any;
  onNavigate: (view: any) => void;
  trackUsage?: (feature: 'listingCount' | 'photoshootCount' | 'shippingCount' | 'activeUsers') => void;
}

type StudioMode = 'apparel' | 'product' | 'mockup' | 'reimagine';

const PhotoShootView: React.FC<PhotoShootViewProps> = React.memo(({
  photoShootImages,
  handlePhotoShootUpload,
  setPhotoShootImages,
  userData,
  onNavigate,
  trackUsage,
}) => {
  const hasAccess = userData?.hasVirtualTryOnAddon || userData?.planType === 'pro_max';
  const [activeStudio, setActiveStudio] = useState<StudioMode>('apparel');
  const [apparelTab, setApparelTab] = useState<'model' | 'apparel'>('apparel');
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bgPrompt, setBgPrompt] = useState("");
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isFullAutoMagic, setIsFullAutoMagic] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [loadingStep, setLoadingStep] = useState<string>("");
  
  const DAILY_LIMIT = 4;
  const today = new Date().toISOString().split('T')[0];
  const currentUsage = userData?.lastImageGenerationDate === today ? (userData?.dailyImageCount || 0) : 0;
  const remainingLimit = Math.max(0, DAILY_LIMIT - currentUsage);

  const updateUsage = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const newCount = currentUsage + 1;
    try {
      await updateDoc(userRef, {
        dailyImageCount: newCount,
        lastImageGenerationDate: today
      });
    } catch (err) {
      console.error("Failed to update usage:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };
  const [settings, setSettings] = useState({
    category: "Apparel",
    pose: "Full Body Front",
    background: "Studio White",
    lighting: "Studio Soft Light",
    expression: "Neutral",
    handStyling: "Neutral",
    colorGrade: "None",
    aspectRatio: "Portrait",
    numImages: 1,
    focalLength: "50mm",
    environmentEffects: "Natural Shadows",
    realismBoost: true,
    resolution: "4K",
    material: "Matte",
    transformation: "None",
    cameraAngle: "Eye-Level"
  });

  const [apparelItems, setApparelItems] = useState<any[]>([
    { id: '1', image: photoShootImages.front, description: '', status: 'analyzing' }
  ]);

  const backgroundCategories = [
    {
      name: "STUDIO & MINIMAL",
      options: ["Studio White", "Studio Grey", "Studio Black", "Pastel Gradient", "Sunset Gradient", "Minimalist Gallery"]
    },
    {
      name: "ARCHITECTURAL & URBAN",
      options: ["City Street", "Modern Interior", "Brutalist Arch", "Cozy Cafe", "Industrial Loft", "Neon Cityscape", "Rooftop at Sunset", "Luxury Hotel Lobby"]
    },
    {
      name: "NATURE & OUTDOORS",
      options: ["Sunny Beach", "Lush Forest", "Rooftop Garden", "Desert Dune", "Mountain Vista", "Flower Field"]
    }
  ];

  const poseCategories = [
    {
      name: "STANDARD",
      options: ["Full Body Front", "Hand on Hip", "Back View", "3/4 View", "Profile View", "Waist-Up"]
    },
    {
      name: "ETHNIC",
      options: ["Pallu Display", "Ethnic Twirl", "Traditional Namaste", "Royal Seated", "Walking Gracefully", "Short Kurti Silhouette", "Side Slit Focus", "Chic Cross-Legged"]
    },
    {
      name: "CREATIVE",
      options: ["Walking Motion", "Elegant Lean", "Sitting Pose", "Candid Look", "Hero Pose", "Action Pose", "Looking Over Shoulder", "Leaning Forward", "Hands in Pockets", "Dynamic Twirl", "POV Selfie", "POV Mirror Selfie", "POV Action"]
    },
    {
      name: "DETAIL",
      options: ["Close-up Detail", "Accessory Focus", "POV Outfit Check"]
    }
  ];

  const colorGradeOptions = ["None", "Cinematic Teal & Orange", "Vintage Film", "High-Contrast B&W", "Vibrant & Punchy", "Muted & Moody", "Warm & Golden", "Cool & Crisp"];
  const materialOptions = ["Matte", "Glossy", "Metallic", "Glass"];
  const transformationOptions = ["Shining Marble", "Cast Bronze", "Carved Wood"];
  const cameraAngleOptions = ["Eye-Level", "Top-Down (Flat Lay)", "Hero Shot (Low Angle)", "45-Degree E-commerce"];

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setModelImage(base64.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setDesignImage(base64.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomBgImage(base64.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSuggest = async () => {
    if (!photoShootImages.front) {
      setError("Please upload a product image first.");
      return;
    }

    setIsSuggesting(true);
    setError(null);
    try {
      const suggestions = await suggestPhotoshootSettings(photoShootImages.front, activeStudio);
      setSettings(prev => ({
        ...prev,
        ...suggestions,
        background: suggestions.background || prev.background,
        lighting: suggestions.lighting || prev.lighting,
        pose: suggestions.pose || prev.pose,
        cameraAngle: suggestions.cameraAngle || prev.cameraAngle,
        material: suggestions.material || prev.material,
        colorGrade: suggestions.colorGrade || prev.colorGrade,
        focalLength: suggestions.focalLength || prev.focalLength,
        environmentEffects: suggestions.environmentEffects || prev.environmentEffects
      }));
      if (suggestions.bgPrompt) {
        setBgPrompt(suggestions.bgPrompt);
      }
    } catch (err: any) {
      console.error("AI Suggestion Error:", err);
      setError("Failed to get AI suggestions. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerateBg = async () => {
    if (!bgPrompt) return;
    
    setIsGeneratingBg(true);
    setError(null);
    try {
      const b64 = await generateBackgroundImage(bgPrompt);
      setCustomBgImage(b64);
    } catch (err: any) {
      console.error("Background Generation Error:", err);
      setError("Failed to generate background. Please try again.");
    } finally {
      setIsGeneratingBg(false);
    }
  };

  React.useEffect(() => {
    const analyze = async () => {
      if (photoShootImages.front) {
        setIsAnalyzing(true);
        try {
          const desc = await analyzeProductImage(photoShootImages.front);
          setProductDescription(desc);
        } catch (err) {
          console.error("Analysis error:", err);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setProductDescription("");
      }
    };
    analyze();
  }, [photoShootImages.front]);

  const handleFullAutoMagic = async () => {
    if (!photoShootImages.front) {
      setError("Please upload a product image first.");
      return;
    }

    if (remainingLimit <= 0) {
      setError(`Daily limit reached (${DAILY_LIMIT} images). Please try again tomorrow.`);
      return;
    }

    setIsFullAutoMagic(true);
    setError(null);
    try {
      // 1. Get Suggestions
      setLoadingStep("AI is analyzing your product & suggesting settings...");
      const suggestions = await suggestPhotoshootSettings(photoShootImages.front, activeStudio);
      
      // Update settings
      setSettings(prev => ({
        ...prev,
        ...suggestions,
        background: suggestions.background || prev.background,
        lighting: suggestions.lighting || prev.lighting,
        pose: suggestions.pose || prev.pose,
        cameraAngle: suggestions.cameraAngle || prev.cameraAngle,
        material: suggestions.material || prev.material,
        colorGrade: suggestions.colorGrade || prev.colorGrade,
        focalLength: suggestions.focalLength || prev.focalLength,
        environmentEffects: suggestions.environmentEffects || prev.environmentEffects
      }));

      // 2. Generate Background if prompt exists
      let finalBgB64 = customBgImage;
      if (suggestions.bgPrompt) {
        setLoadingStep("Generating professional AI background...");
        setBgPrompt(suggestions.bgPrompt);
        finalBgB64 = await generateBackgroundImage(suggestions.bgPrompt);
        setCustomBgImage(finalBgB64);
      }

      // 3. Generate Final Image
      setLoadingStep("Synthesizing final high-fidelity masterpiece...");
      let result;
      if (activeStudio === 'product') {
        result = await generateProductStudioImage({
          mode: modelImage ? 'on-model' : 'staged',
          products: [{ base64: photoShootImages.front, x: 50, y: 50, scale: 100 }],
          scene: { 
            background: suggestions.background || settings.background, 
            lighting: suggestions.lighting || settings.lighting 
          },
          controls: { 
            surface: suggestions.material || settings.material,
            shadowType: suggestions.environmentEffects || settings.environmentEffects,
            interactionType: 'holding',
            shotType: suggestions.cameraAngle || settings.cameraAngle
          },
          modelImage: modelImage || undefined
        });
      } else {
        result = await generateVirtualTryOn({
          mode: activeStudio,
          productImageB64: photoShootImages.front,
          modelImageB64: modelImage || undefined,
          designImageB64: designImage || undefined,
          category: suggestions.category || settings.category,
          pose: suggestions.pose || settings.pose,
          background: suggestions.background || settings.background,
          lighting: suggestions.lighting || settings.lighting,
          expression: suggestions.expression || settings.expression,
          focalLength: suggestions.focalLength || settings.focalLength,
          environmentEffects: suggestions.environmentEffects || settings.environmentEffects,
          realismBoost: settings.realismBoost,
          material: suggestions.material || settings.material,
          transformation: suggestions.transformation || settings.transformation,
          cameraAngle: suggestions.cameraAngle || settings.cameraAngle,
          backgroundImageB64: finalBgB64 || undefined
        });
      }
      setResultImage(result);
      if (trackUsage) trackUsage('photoshootCount');
      await updateUsage();
    } catch (err: any) {
      setError("Failed to complete auto-magic photoshoot. Please try again.");
    } finally {
      setIsFullAutoMagic(false);
      setLoadingStep("");
    }
  };

  const handlePhotoShootUploadWithAutoSwitch = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "others") => {
    handlePhotoShootUpload(e, type);
    if (type === "front" && activeStudio !== 'product' && activeStudio !== 'mockup') {
      setActiveStudio('apparel');
      setApparelTab('apparel');
    }
  };

  const handleGenerate = async () => {
    if (!photoShootImages.front) return;
    
    if (remainingLimit <= 0) {
      setError(`Daily limit reached (${DAILY_LIMIT} images). Please try again tomorrow.`);
      return;
    }

    setIsGenerating(true);
    setLoadingStep("Synthesizing your masterpiece...");
    setError(null);
    try {
      let result;
      if (activeStudio === 'product') {
        result = await generateProductStudioImage({
          mode: modelImage ? 'on-model' : 'staged',
          products: [{ base64: photoShootImages.front, x: 50, y: 50, scale: 100 }],
          scene: { 
            background: settings.background, 
            lighting: settings.lighting 
          },
          controls: { 
            surface: settings.material,
            shadowType: settings.environmentEffects,
            interactionType: 'holding',
            shotType: settings.cameraAngle
          },
          modelImage: modelImage || undefined
        });
      } else {
        result = await generateVirtualTryOn({
          mode: activeStudio,
          productImageB64: photoShootImages.front,
          modelImageB64: modelImage || undefined,
          designImageB64: designImage || undefined,
          category: settings.category,
          pose: settings.pose,
          background: settings.background,
          lighting: settings.lighting,
          expression: settings.expression,
          focalLength: settings.focalLength,
          environmentEffects: settings.environmentEffects,
          realismBoost: settings.realismBoost,
          material: settings.material,
          transformation: settings.transformation,
          cameraAngle: settings.cameraAngle,
          backgroundImageB64: customBgImage || undefined
        });
      }
      setResultImage(result);
      if (trackUsage) trackUsage('photoshootCount');
      await updateUsage();
    } catch (err: any) {
      setError(err.message || "Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingStep("");
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `${activeStudio}-studio-${Date.now()}.png`;
    link.click();
  };

  const studios = [
    { id: 'apparel', label: 'Apparel Studio', icon: Shirt },
    { id: 'product', label: 'Product Studio', icon: ShoppingBag },
    { id: 'mockup', label: 'Mockup Studio', icon: Monitor },
  ];

  return (
    <motion.div
      key="photoShoot"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden"
    >
      {/* 1. Ultra-Premium Header - Compact */}
      <div className="flex items-center justify-between bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl border border-white/5">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Camera size={18} />
              </div>
              STUDIO <span className="text-blue-400">PRO</span>
            </h1>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[8px] font-black uppercase tracking-widest text-amber-400 w-fit">
              <Sparkles size={8} /> Elite Access
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Limit</span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                remainingLimit <= 5 ? "text-red-400" : "text-blue-400"
              )}>
                {remainingLimit} / {DAILY_LIMIT} Left
              </span>
            </div>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(remainingLimit / DAILY_LIMIT) * 100}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  remainingLimit <= 5 ? "bg-red-500" : "bg-blue-500"
                )}
              />
            </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
            {studios.map((studio) => {
              const Icon = studio.icon;
              const isActive = activeStudio === studio.id;
              return (
                <button
                  key={studio.id}
                  onClick={() => {
                    setActiveStudio(studio.id as StudioMode);
                    setResultImage(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                    isActive 
                      ? "bg-white text-slate-900 shadow-lg" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={14} />
                  {studio.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              NEURAL ENGINE ACTIVE
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span>V2.5 ULTRA-HD</span>
          </div>
          
          <button
            onClick={() => !hasAccess ? onNavigate('subscription') : handleFullAutoMagic()}
            disabled={!photoShootImages.front || isGenerating || isFullAutoMagic}
            className={cn(
              "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all",
              photoShootImages.front && !isGenerating && !isFullAutoMagic
                ? hasAccess 
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02] shadow-lg shadow-violet-600/20"
                  : "bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-600/20"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {isFullAutoMagic ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : !hasAccess ? (
              <Lock size={14} />
            ) : (
              <Wand2 size={14} />
            )}
            {isFullAutoMagic ? "Auto-Magic..." : !hasAccess ? "Add-on Required" : "Auto-Magic Shoot"}
          </button>

          <button
            onClick={() => !hasAccess ? onNavigate('subscription') : handleGenerate()}
            disabled={!photoShootImages.front || isGenerating || isFullAutoMagic}
            className={cn(
              "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all",
              photoShootImages.front && !isGenerating && !isFullAutoMagic
                ? hasAccess 
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  : "bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-600/20"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : !hasAccess ? (
              <Lock size={14} />
            ) : (
              <Sparkles size={14} />
            )}
            {isGenerating ? "Processing..." : !hasAccess ? "Add-on Required" : "Render Masterpiece"}
          </button>
        </div>
      </div>

      {/* 2. Workspace Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar: Assets & Uploads */}
        <div className="w-96 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Asset Management - Premium Container */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 space-y-6 shadow-sm">
            {!hasAccess && (
              <button 
                onClick={() => onNavigate('subscription')}
                className="w-full p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-4 hover:bg-amber-100 transition-colors text-left group"
              >
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed text-center group-hover:text-amber-800">
                  This is a premium add-on. Please purchase the <span className="font-black">AI Photoshoot Add-on</span> from the Subscription tab to unlock this feature.
                </p>
              </button>
            )}
            {activeStudio === 'apparel' ? (
              <div className="space-y-6">
                {/* 1. Model/Apparel Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-2xl w-full">
                  <button
                    onClick={() => setApparelTab('model')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                      apparelTab === 'model' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    )}
                  >
                    <UserIcon size={14} /> Model
                  </button>
                  <button
                    onClick={() => setApparelTab('apparel')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                      apparelTab === 'apparel' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    )}
                  >
                    <Shirt size={14} /> Apparel
                  </button>
                </div>

                {apparelTab === 'apparel' ? (
                  <div className="space-y-6">
                    {/* 2. Main Upload Zone */}
                    <div
                      className={cn(
                        "relative aspect-[1.8/1] rounded-[2rem] border-2 border-dashed transition-all overflow-hidden group flex flex-col items-center justify-center bg-slate-50/50",
                        "border-neutral-200 hover:border-blue-600/50 hover:bg-blue-600/5",
                      )}
                    >
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                          <Shirt size={18} />
                        </div>
                        <p className="text-xs font-black text-slate-900">Add apparel images</p>
                        <p className="text-[9px] font-bold text-slate-400">Drop one or more items</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoShootUploadWithAutoSwitch(e, "front")} />
                      </label>
                    </div>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Drag to reorder layers (inner to outer).</p>

                    {/* 3. Uploaded Apparel List */}
                    {photoShootImages.front && (
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4 relative group/item">
                        <div className="flex gap-4">
                          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm">
                            <img
                              src={`data:image/png;base64,${photoShootImages.front}`}
                              alt="Apparel"
                              className="w-full h-full object-contain p-2"
                            />
                            {isAnalyzing && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <RefreshCw size={18} className="text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Apparel Details</h4>
                              <button onClick={() => setPhotoShootImages(prev => ({ ...prev, front: undefined }))} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-blue-600 font-black uppercase tracking-widest">
                              {isAnalyzing ? (
                                <>
                                  <RefreshCw size={10} className="animate-spin" /> AI analyzing...
                                </>
                              ) : (
                                <>
                                  <ShieldCheck size={10} className="text-green-500" /> AI Analysis Complete
                                </>
                              )}
                            </div>
                            <textarea 
                              placeholder="e.g., Blue oversized t-shirt"
                              value={productDescription}
                              onChange={(e) => setProductDescription(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-medium outline-none focus:border-blue-600 resize-none h-20 shadow-inner"
                            />
                          </div>
                        </div>

                        {/* 4. Detail Views Section */}
                        <div className="space-y-3 pt-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Add other views for better accuracy:</p>
                          <div className="flex gap-3">
                            {photoShootImages.back ? (
                              <div className="w-20 h-24 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                                <img src={`data:image/png;base64,${photoShootImages.back}`} className="w-full h-full object-cover" />
                                <div className="absolute top-0 left-0 bg-black/60 text-white text-[8px] font-black px-2 py-1 rounded-br-xl">Back</div>
                                <button onClick={() => setPhotoShootImages(prev => ({ ...prev, back: undefined }))} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <label className="w-20 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-blue-600/50 hover:bg-blue-600/5 transition-all shadow-sm">
                                <Camera size={18} className="text-slate-400" />
                                <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Add Detail</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoShootUpload(e, "back")} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div
                      className={cn(
                        "relative aspect-square rounded-[2rem] border-2 border-dashed transition-all overflow-hidden group",
                        modelImage ? "border-indigo-600 bg-indigo-600/5" : "border-neutral-200 hover:border-indigo-600/50 hover:bg-indigo-600/5",
                      )}
                    >
                      {modelImage ? (
                        <>
                          <img src={`data:image/png;base64,${modelImage}`} alt="Model" className="w-full h-full object-cover" />
                          <button onClick={() => setModelImage(null)} className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <p className="text-xs font-black text-slate-900 text-center px-4">Upload Custom Model</p>
                          <input type="file" className="hidden" accept="image/*" onChange={handleModelUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Layers size={14} /> Digital Assets
                </h3>
                
                {/* Primary Asset */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Primary Object</p>
                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group">
                    {photoShootImages.front ? (
                      <>
                        <img src={`data:image/png;base64,${photoShootImages.front}`} className="w-full h-full object-contain p-4" />
                        <button onClick={() => setPhotoShootImages(prev => ({ ...prev, front: undefined }))} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-colors">
                        <Upload size={20} className="text-blue-600 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500">Upload Object</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoShootUploadWithAutoSwitch(e, "front")} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Secondary Asset */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    {activeStudio === 'mockup' ? 'Graphic Design' : 'Human Model'}
                  </p>
                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group">
                    {(activeStudio === 'mockup' ? designImage : modelImage) ? (
                      <>
                        <img src={`data:image/png;base64,${activeStudio === 'mockup' ? designImage : modelImage}`} className="w-full h-full object-cover" />
                        <button onClick={() => activeStudio === 'mockup' ? setDesignImage(null) : setModelImage(null)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/50 transition-colors">
                        <Plus size={20} className="text-indigo-600 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500">Add {activeStudio === 'mockup' ? 'Design' : 'Model'}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={activeStudio === 'mockup' ? handleDesignUpload : handleModelUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Preview / Canvas */}
        <div className="flex-1 bg-slate-900 rounded-[3rem] relative overflow-hidden shadow-inner flex items-center justify-center p-12">
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <AnimatePresence mode="wait">
            {isGenerating || isFullAutoMagic ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8 text-center"
              >
                <div className="relative">
                  <div className="w-32 h-32 border-[8px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-blue-500 animate-pulse" size={40} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">
                    {isFullAutoMagic ? "Auto-Magic Shoot" : "Synthesizing"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {loadingStep || "Applying Neural Textures & Lighting"}
                  </p>
                </div>
              </motion.div>
            ) : resultImage ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-full aspect-[3/4] group"
              >
                <img src={resultImage} className="w-full h-full object-cover rounded-[2rem] shadow-2xl border border-white/10" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center gap-4">
                  <button onClick={downloadResult} className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                    <Download size={24} />
                  </button>
                  <button className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition-transform border border-white/20">
                    <Share2 size={24} />
                  </button>
                </div>
                {/* Result Stats Overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Resolution</p>
                      <p className="text-[10px] font-bold text-white">4K ULTRA HD</p>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Format</p>
                      <p className="text-[10px] font-bold text-white">PNG LOSSLESS</p>
                    </div>
                  </div>
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <ImageIcon size={40} className="text-slate-700" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Awaiting Production</h2>
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Configure assets and settings to begin</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Advanced Controls */}
        <div className="w-96 flex flex-col gap-6 overflow-y-auto pl-2 custom-scrollbar">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Settings2 size={14} /> Engine Settings
              </h3>
              <button 
                onClick={() => setSettings(prev => ({ ...prev, realismBoost: !prev.realismBoost }))}
                className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                  settings.realismBoost ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                )}
              >
                Realism Boost {settings.realismBoost ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Background Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background</p>
                
                {/* Upload Custom Background */}
                <div className="relative aspect-[4/1] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden group hover:border-blue-600/50 transition-all">
                  {customBgImage ? (
                    <div className="relative h-full w-full">
                      <img src={`data:image/png;base64,${customBgImage}`} className="w-full h-full object-cover" />
                      <button onClick={() => setCustomBgImage(null)} className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg text-red-500 shadow-md">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="absolute inset-0 flex items-center justify-center gap-3 cursor-pointer">
                      <Upload size={18} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Upload Custom Background</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                    </label>
                  )}
                </div>

                {/* AI Background Generator */}
                <div className="bg-slate-900 rounded-2xl p-5 space-y-4 border border-white/5">
                  <div className="flex items-center gap-2 text-white">
                    <Wand2 size={16} className="text-blue-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">AI Background Generator</h4>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Describe the background scene you want to create.</p>
                  
                  <textarea 
                    value={bgPrompt}
                    onChange={(e) => setBgPrompt(e.target.value)}
                    placeholder="e.g., A minimalist art gallery with a single concrete bench, lit by a soft skylight."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-medium text-white outline-none focus:border-blue-600/50 resize-none h-24 shadow-inner placeholder:text-slate-600"
                  />

                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={handleGenerateBg}
                      disabled={!bgPrompt || isGeneratingBg || isFullAutoMagic}
                      className={cn(
                        "w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all",
                        bgPrompt && !isGeneratingBg && !isFullAutoMagic
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                          : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      )}
                    >
                      {isGeneratingBg ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {isGeneratingBg ? "Generating..." : "Generate Background"}
                    </button>

                    <button 
                      onClick={handleFullAutoMagic}
                      disabled={!photoShootImages.front || isFullAutoMagic || isGenerating}
                      className={cn(
                        "w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all",
                        photoShootImages.front && !isFullAutoMagic && !isGenerating
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02]"
                          : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      )}
                    >
                      {isFullAutoMagic ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      {isFullAutoMagic ? "Auto-Magic Working..." : "Auto-Magic Shoot"}
                    </button>
                  </div>
                </div>
              </div>

              {activeStudio === 'apparel' ? (
                <>
                  {/* Suggested Background (Legacy) */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Background</p>
                    <button 
                      onClick={handleAiSuggest}
                      disabled={isSuggesting || !photoShootImages.front}
                      className="w-full aspect-[3/1] rounded-2xl bg-slate-900 flex items-center justify-center group hover:bg-slate-800 transition-all border border-white/5 disabled:opacity-50"
                    >
                      <span className="px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-600/30 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        {isSuggesting ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        {isSuggesting ? "Analyzing..." : "AI Suggestion"}
                      </span>
                    </button>
                  </div>

                  {/* Pose Selection - Categorized */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                      <Focus size={14} className="text-blue-600" /> Shot Type & Pose
                    </h4>
                  </div>
                  {poseCategories.map(category => (
                    <div key={category.name} className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {category.options.map(pose => (
                          <button
                            key={pose}
                            onClick={() => setSettings(prev => ({ ...prev, pose: pose }))}
                            className={cn(
                              "px-3 py-2.5 rounded-xl text-[9px] font-black transition-all border text-left",
                              settings.pose === pose 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                            )}
                          >
                            {pose}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Color Grade */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color Grade</p>
                    <div className="grid grid-cols-2 gap-2">
                      {colorGradeOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => setSettings(prev => ({ ...prev, colorGrade: option }))}
                          className={cn(
                            "px-3 py-3 rounded-xl text-[9px] font-black transition-all border text-center",
                            settings.colorGrade === option 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material & Reflections */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material & Reflections</p>
                    <div className="grid grid-cols-2 gap-2">
                      {materialOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => setSettings(prev => ({ ...prev, material: option }))}
                          className={cn(
                            "px-3 py-3 rounded-xl text-[9px] font-black transition-all border text-center",
                            settings.material === option 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Artistic Transformations */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artistic Transformations</p>
                    <div className="grid grid-cols-3 gap-2">
                      {transformationOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => setSettings(prev => ({ ...prev, transformation: option }))}
                          className={cn(
                            "px-2 py-3 rounded-xl text-[8px] font-black transition-all border text-center",
                            settings.transformation === option
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Angle */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camera Angle</p>
                    <div className="grid grid-cols-2 gap-2">
                      {cameraAngleOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => setSettings(prev => ({ ...prev, cameraAngle: option }))}
                          className={cn(
                            "px-3 py-3 rounded-xl text-[9px] font-black transition-all border text-center",
                            settings.cameraAngle === option 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Styling - Compact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expression</p>
                  <select 
                    value={settings.expression}
                    onChange={(e) => setSettings(prev => ({ ...prev, expression: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-600"
                  >
                    {["Neutral", "Soft Smile", "Confident", "Joyful", "Serious"].map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lighting</p>
                  <select 
                    value={settings.lighting}
                    onChange={(e) => setSettings(prev => ({ ...prev, lighting: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-600"
                  >
                    {["Studio Soft", "Cinematic", "Golden Hour", "Neon"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Aspect & Count */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aspect Ratio</p>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    {["Portrait", "Square", "Landscape"].map(r => (
                      <button
                        key={r}
                        onClick={() => setSettings(prev => ({ ...prev, aspectRatio: r }))}
                        className={cn(
                          "px-2 py-1 rounded-md text-[8px] font-black transition-all",
                          settings.aspectRatio === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        )}
                      >
                        {r[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Size</p>
                  <div className="flex gap-1">
                    {[1, 2, 4].map(n => (
                      <button
                        key={n}
                        onClick={() => setSettings(prev => ({ ...prev, numImages: n }))}
                        className={cn(
                          "w-6 h-6 rounded-md text-[8px] font-black transition-all flex items-center justify-center border",
                          settings.numImages === n ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-500"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Support Badge */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-center">
                <div className="px-3 py-1.5 bg-slate-100 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Low shipping support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default PhotoShootView;
