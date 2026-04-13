import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import {
  Sparkles,
  ShoppingBag,
  Zap,
  Maximize,
  Palette,
  Focus,
  Cpu,
  ShieldAlert,
  Mail,
  Phone,
  User,
  X,
  Image as ImageIcon,
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  generateListing,
  regenerateSection,
  analyzeCompetitor,
  getMarketIntelligence,
  generateAPlusContent,
  type ListingResult,
  type ListingOptions,
  type CompetitorAnalysisResult,
  type MarketIntelligenceResult,
  type APlusContentResult,
} from "./services/geminiService";

import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, onSnapshot, getDocFromServer, setDoc, increment, collection, query, where, limit, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import AccessGate from "./components/AccessGate";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import SubscriptionGate from "./components/SubscriptionGate";
import ErrorBoundary from "./components/ErrorBoundary";
import { PLATFORMS, TONES } from "./constants";
import { cn } from "./lib/utils";
import { GenerationHistory } from "./types";
import { ErrorDisplay } from "./components/ErrorDisplay";

const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      console.error("Chunk load error, reloading...", error);
      window.location.reload();
      return { default: () => null };
    }
  });
};

const CompetitorAnalysisView = lazyLoad(() => import("./components/CompetitorAnalysisView"));
const PhotoShootView = lazyLoad(() => import("./components/PhotoShootView"));
const WhiteBackgroundView = lazyLoad(() => import("./components/WhiteBackgroundView"));
const APlusContentView = lazyLoad(() => import("./components/APlusContentView"));
const ListingGeneratorView = lazyLoad(() => import("./components/ListingGeneratorView"));
const LowShippingView = lazyLoad(() => import("./components/LowShippingView"));
const AdminPanelView = lazyLoad(() => import("./components/AdminPanelView"));
const SubscriptionView = lazyLoad(() => import("./components/SubscriptionView"));

const APP_ID = "htsgfhwgxwdciv23onmo4s"; // Unique ID for this applet

export default function App() {
  const [currentView, setCurrentView] = useState<
    | "generator"
    | "whiteBackground"
    | "competitorAnalysis"
    | "photoShoot"
    | "aPlusContent"
    | "lowShipping"
    | "adminPanel"
    | "subscription"
  >("generator");
  const [step, setStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<"image" | "text" | "url">(
    "text",
  );
  const [inputValue, setInputValue] = useState("");
  const [imageB64, setImageB64] = useState<string | undefined>();
  const [backImageB64, setBackImageB64] = useState<string | undefined>();
  const [photoShootImages, setPhotoShootImages] = useState<{
    front?: string;
    back?: string;
    others: string[];
  }>({ others: [] });
  const [tone, setTone] = useState("Professional");
  const [pricingGoal, setPricingGoal] = useState("Aggressive (Lowest in category)");
  const [seoFocus, setSeoFocus] = useState(true);
  const [isAPlusEligible, setIsAPlusEligible] = useState(false);
  const [isDomainAuthorized, setIsDomainAuthorized] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ListingResult> | null>(
    null,
  );
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<string>("amazon_in");
  const [showPreview, setShowPreview] = useState(false);

  // White Background State
  const [whiteBgImage, setWhiteBgImage] = useState<string | undefined>();
  const [whiteBgResult, setWhiteBgResult] = useState<string | null>(null);
  const [isProcessingWhiteBg, setIsProcessingWhiteBg] = useState(false);

  // Market Intelligence State
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [marketIntelligenceResults, setMarketIntelligenceResults] = useState<
    Record<string, MarketIntelligenceResult>
  >({});

  // A+ Content State
  const [aPlusInput, setAPlusInput] = useState("");
  const [aPlusImageB64, setAPlusImageB64] = useState<string | undefined>();
  const [isGeneratingAPlus, setIsGeneratingAPlus] = useState(false);
  const [aPlusResult, setAPlusResult] = useState<APlusContentResult | null>(null);

  // Low Shipping State
  const [lowShippingImage, setLowShippingImage] = useState<string | undefined>();
  const [lowShippingResult, setLowShippingResult] = useState<string | null>(null);
  const [isProcessingLowShipping, setIsProcessingLowShipping] = useState(false);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [regeneratingSection, setRegeneratingSection] = useState<{
    platform: string;
    section: string;
  } | null>(null);

  const [keywordSort, setKeywordSort] = useState<{
    field: "keyword" | "searchVolume" | "competition";
    direction: "asc" | "desc";
  }>({ field: "searchVolume", direction: "desc" });

  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => localStorage.getItem("isAuthorized") === "true");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const [isPlanExpired, setIsPlanExpired] = useState(false);
  const [currentAccessCode, setCurrentAccessCode] = useState<string>(import.meta.env.VITE_ACCESS_CODE || "8052");
  const [showStuckHelp, setShowStuckHelp] = useState(false);
  const [lastAuthError, setLastAuthError] = useState<string | null>(null);

  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState<any | null>(null);

  const trackUsage = useCallback(async (feature: 'listingCount' | 'photoshootCount' | 'shippingCount' | 'activeUsers') => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const statsDocRef = doc(db, 'daily_stats', today);
    try {
      await setDoc(statsDocRef, {
        date: today,
        [feature]: increment(1)
      }, { merge: true });
    } catch (e) {
      console.error("Error tracking usage:", e);
    }
  }, []);

  // Track DAU
  useEffect(() => {
    if (userData && !isUserDataLoading) {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (userData.lastActiveDate !== today) {
        trackUsage('activeUsers');
        // Update user's last active date to prevent double counting DAU
        setDoc(doc(db, 'users', userData.uid), { lastActiveDate: today }, { merge: true });
      }
    }
  }, [userData, isUserDataLoading, trackUsage]);

  // Notification Listener
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("active", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter notifications based on target
      const relevant = notifications.filter((n: any) => {
        if (n.target === 'all') return true;
        
        const isNew = userData?.createdAt && (new Date().getTime() - new Date(userData.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000);
        if (n.target === 'new' && isNew) return true;
        
        if (n.target === 'expired' && isPlanExpired) return true;
        
        return false;
      });

      setActiveNotifications(relevant);
      
      // Show the latest one if it hasn't been shown/dismissed
      if (relevant.length > 0) {
        const latest = relevant[0];
        const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        if (!dismissed.includes(latest.id)) {
          setShowNotification(latest);
        }
      }
    }, (error) => {
      console.error("Notification sync error:", error);
    });

    return () => unsub();
  }, [currentUser, userData, isPlanExpired]);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "settings", "global"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Initialize settings if missing (Admin only)
  useEffect(() => {
    if (currentUser?.email === "jannatzu135@gmail.com") {
      const initSettings = async () => {
        try {
          const docRef = doc(db, "settings", "global");
          const docSnap = await getDocFromServer(docRef);
          if (!docSnap.exists()) {
            console.log("Initializing global settings...");
            await setDoc(docRef, { 
              accessCode: import.meta.env.VITE_ACCESS_CODE || "8052",
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error initializing settings:", error);
        }
      };
      initSettings();
    }
  }, [currentUser]);

  // Dynamic Access Code Sync
  useEffect(() => {
    const path = "settings/global";
    console.log("Setting up access code listener...");
    
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const serverCode = docSnap.data().accessCode;
        console.log("Access code sync: Server code is", serverCode);
        setCurrentAccessCode(serverCode);
      } else {
        console.log("Access code sync: Document does not exist yet.");
      }
    }, (error) => {
      console.error("Access code sync error:", error);
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsub();
  }, []);

  // User Data Sync and Plan Expiry Check
  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      setIsPlanExpired(false);
      setIsUserDataLoading(false);
      return;
    }

    setIsUserDataLoading(true);
    
    // Safety timeout for user data loading
    const timeout = setTimeout(() => {
      setIsUserDataLoading(false);
    }, 10000);

    const path = `users/${currentUser.uid}`;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), async (docSnap) => {
      clearTimeout(timeout);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);

        // Patch old users with missing fields
        const requiredFields: any = {
          uid: currentUser.uid,
          email: currentUser.email || "",
          planType: "none",
          hasUsedTrial: false,
          isBlocked: false,
          role: currentUser.email === "jannatzu135@gmail.com" ? "admin" : "user"
        };

        const needsPatch = Object.entries(requiredFields).some(([key, value]) => !(key in data));
        if (needsPatch) {
          console.log("Patching missing fields for user:", currentUser.email);
          try {
            const patch = Object.fromEntries(
              Object.entries(requiredFields).filter(([key]) => !(key in data))
            );
            await setDoc(doc(db, "users", currentUser.uid), patch, { merge: true });
          } catch (patchErr) {
            console.error("Error patching user profile:", patchErr);
          }
        }

        // Check expiry
        if (data.planType === "none") {
          setIsPlanExpired(true);
        } else if (data.expiryDate) {
          const expiry = new Date(data.expiryDate);
          const now = new Date();
          setIsPlanExpired(now > expiry);
        } else {
          setIsPlanExpired(true);
        }
        setIsUserDataLoading(false);
      } else {
        // Initialize user profile if missing
        console.log("Initializing user profile for:", currentUser.email);
        try {
          const newUser = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "Anonymous",
            photoURL: currentUser.photoURL || "",
            createdAt: new Date().toISOString(),
            planType: "none",
            hasUsedTrial: false,
            isBlocked: false,
            role: currentUser.email === "jannatzu135@gmail.com" ? "admin" : "user"
          };
          await setDoc(doc(db, "users", currentUser.uid), newUser);
          console.log("User profile initialized successfully");
        } catch (error) {
          console.error("Error initializing user profile:", error);
          handleFirestoreError(error, OperationType.WRITE, path);
          setIsUserDataLoading(false);
        }
      }
    }, (error) => {
      clearTimeout(timeout);
      console.error("User data sync error:", error);
      handleFirestoreError(error, OperationType.GET, path);
      setIsUserDataLoading(false);
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [currentUser]);

  // Robust Logout Logic
  useEffect(() => {
    if (isAuthorized && currentAccessCode) {
      const usedCode = localStorage.getItem("usedAccessCode");
      if (!usedCode || usedCode !== currentAccessCode) {
        console.log("Access code mismatch detected. Logging out...", { usedCode, currentAccessCode });
        setIsAuthorized(false);
        localStorage.removeItem("isAuthorized");
        localStorage.removeItem("usedAccessCode");
      }
    }
  }, [isAuthorized, currentAccessCode]);

  // Domain Authorization Check (Disabled for deployment)
  useEffect(() => {
    setIsDomainAuthorized(true);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAuthLoading(false);
      setShowStuckHelp(true);
    }, 5000); // Reduced from 8s to 5s for better mobile experience

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      setCurrentUser(user);
      setIsAuthLoading(false);
      setShowStuckHelp(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setLastAuthError(error.message);
      setIsAuthLoading(false);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // History saving disabled as per user request
  useEffect(() => {
    // localStorage.setItem("listingai_history", JSON.stringify(history));
  }, [history]);

  const formatErrorMessage = (err: any) => {
    const message = err instanceof Error ? err.message : String(err);
    
    // Handle JSON error info from handleFirestoreError
    try {
      if (message.startsWith('{') && message.endsWith('}')) {
        const errInfo = JSON.parse(message);
        if (errInfo.error?.includes("permission-denied") || errInfo.error?.includes("insufficient permissions")) {
          return `Permission Denied: You don't have permission to ${errInfo.operationType} at ${errInfo.path}. Please contact support if you believe this is an error.`;
        }
      }
    } catch (e) {
      // Not a JSON error info, continue
    }

    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return "API Quota Exceeded. The Gemini API is currently busy or you've hit the free tier limit. Please wait a minute and try again.";
    }
    if (message.includes("permission-denied") || message.includes("insufficient permissions")) {
      return "Missing or insufficient permissions. Please make sure you are logged in and have an active plan.";
    }
    return message;
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" = "front",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result?.toString().split(",")[1];
        if (type === "front") setImageB64(b64);
        else setBackImageB64(b64);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    
    console.log("handleGenerate triggered", {
      selectedPlatforms,
      inputValue,
      hasImage: !!imageB64,
    });

    setError(null);
    setError(null);

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    const LISTING_DAILY_LIMIT = 20;
    const today = new Date().toISOString().split('T')[0];
    const currentListingUsage = userData?.lastListingGenerationDate === today ? (userData?.dailyListingCount || 0) : 0;
    
    if (currentListingUsage >= LISTING_DAILY_LIMIT) {
      setError(`Daily listing limit reached (${LISTING_DAILY_LIMIT} per day). Please try again tomorrow.`);
      return;
    }

    if (!inputValue && !imageB64) {
      setError("Please provide product details or an image.");
      return;
    }

    setIsGenerating(true);
    setStep(4); // Move to results/loading step
    setGenerationProgress(0);

    const statuses = [
      "Analyzing product data...",
      "Extracting key features...",
      "Optimizing keywords for" +
        selectedPlatforms
          .map((p) => PLATFORMS.find((pl) => pl.id === p)?.name)
          .join(","),
      "Crafting persuasive titles...",
      "Generating A+ content ideas...",
      "Finalizing SEO metadata...",
    ];

    setGenerationStatus(statuses[0]);
    let statusIdx = 0;
    const statusInterval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statuses.length;
      setGenerationStatus(statuses[statusIdx]);
    }, 1500);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 98) return prev;
        const remaining = 100 - prev;
        return prev + remaining * 0.1;
      });
    }, 1000);

    try {
      const options: ListingOptions = {
        tone,
        useEmojis: false,
        seoFocus,
        inputMethod,
        inputValue,
        imageB64,
        backImageB64,
        pricingGoal,
      };
      const data = await generateListing(selectedPlatforms, options);

      setGenerationProgress(100);
      setGenerationStatus("Listing Ready!");

      const newEntry: GenerationHistory = {
        id: Math.random().toString(36).substr(2, 9),
        productName: inputValue
          ? inputValue.split("\n")[0].substring(0, 30)
          : "Product Image Listing",
        platforms: selectedPlatforms,
        results: data,
        timestamp: Date.now(),
      };

      setResults(data);
      setActiveResultTab(selectedPlatforms[0] || "");

      // Track usage
      trackUsage('listingCount');

      // Update usage in Firestore
      const userRef = doc(db, "users", auth.currentUser!.uid);
      try {
        await setDoc(userRef, {
          dailyListingCount: currentListingUsage + 1,
          lastListingGenerationDate: today
        }, { merge: true });
      } catch (fsErr) {
        console.error("Firestore Update Error:", fsErr);
        handleFirestoreError(fsErr, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
      }

      // setHistory([newEntry, ...history]);
    } catch (err) {
      console.error("Generation Error:", err);
      setError(formatErrorMessage(err));
      setStep(3);
    } finally {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  }, [isGenerating, selectedPlatforms, inputValue, imageB64, userData, tone, pricingGoal, seoFocus]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const handleRegenerateSection = async (
    platform: string,
    section: "title" | "description" | "keywords",
  ) => {
    if (!results) return;

    setRegeneratingSection({ platform, section });
    try {
      const options: ListingOptions = {
        tone,
        useEmojis: false,
        seoFocus,
        inputMethod,
        inputValue,
        imageB64,
        backImageB64,
        isAPlusEligible,
        pricingGoal,
      };
      const newData = await regenerateSection(platform, section, options);

      setResults((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [platform]: {
            ...prev[platform],
            [section]: newData,
          },
        };
      });
    } catch (err) {
      console.error(`Error regenerating ${section}:`, err);
      setError(formatErrorMessage(err));
    } finally {
      setRegeneratingSection(null);
    }
  };

  const loadFromHistory = (item: GenerationHistory) => {
    setResults(item.results);
    setSelectedPlatforms(item.platforms);
    setActiveResultTab(item.platforms[0] || "");
    setStep(4);
  };

  const exportResults = (format: "json" | "csv" | "txt" = "txt") => {
    if (!results || !activeResultTab) return;

    const result = results[activeResultTab];
    let content = "";
    let mimeType = "";
    let fileName = `listing_${activeResultTab}_${Date.now()}`;

    if (format === "json") {
      content = JSON.stringify(result, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    } else if (format === "csv") {
      const rows = [
        ["Field", "Content"],
        ["Platform", activeResultTab],
        ["Title", result.title],
        ["Short Title", result.titleVariations.short],
        ["Medium Title", result.titleVariations.medium],
        ["Long Title", result.titleVariations.long],
        ["Bullet Points", (result.bulletPoints || []).join(" |")],
        ["Description", result.description.replace(/\n/g, "")],
        ["Keywords", (result.keywords || []).join(",")],
        ["Backend Search Terms", result.backendSearchTerms || ""],
        ["HSN Code", result.hsnCode],
        ["Category", result.productCategory],
        ["GST Rate", result.gstRate || "N/A"],
        ["GST Reasoning", result.gstReasoning || "N/A"],
        ["Average Category Price", result.pricingStrategy?.averagePrice || "N/A"],
        ["Recommended Price", result.pricingStrategy?.recommendedPrice || "N/A"],
        ["Aggressive Price", result.pricingStrategy?.aggressivePrice || "N/A"],
        ["Aggressive Reasoning", result.pricingStrategy?.aggressiveReasoning || "N/A"],
        ["Balanced Price", result.pricingStrategy?.balancedPrice || "N/A"],
        ["Balanced Reasoning", result.pricingStrategy?.balancedReasoning || "N/A"],
        ["Premium Price", result.pricingStrategy?.premiumPrice || "N/A"],
        ["Premium Reasoning", result.pricingStrategy?.premiumReasoning || "N/A"],
      ];
      content = rows
        .map((e) =>
          e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");
      mimeType = "text/csv";
      fileName += ".csv";
    } else if (format === "txt") {
      content = `
PRODUCT LISTING: ${activeResultTab.toUpperCase()}
--------------------------------------------------
MAIN TITLE:
${result.title}

TITLE VARIATIONS:
- Short: ${result.titleVariations.short}
- Medium: ${result.titleVariations.medium}
- Long: ${result.titleVariations.long}

BULLET POINTS:
${(result.bulletPoints || []).map((p) => `→ ${p}`).join("\n")}

DESCRIPTION:
${result.description}

KEYWORDS:
${(result.keywords || []).join(",")}

BACKEND SEARCH TERMS:
${result.backendSearchTerms || ""}

HSN CODE: ${result.hsnCode}
CATEGORY: ${result.productCategory}
GST RATE: ${result.gstRate || "N/A"}
GST REASONING: ${result.gstReasoning || "N/A"}

PRICING STRATEGY:
- Average Category Price: ${result.pricingStrategy?.averagePrice || "N/A"}
- Recommended Price: ${result.pricingStrategy?.recommendedPrice || "N/A"}
- Aggressive Price: ${result.pricingStrategy?.aggressivePrice || "N/A"} (${result.pricingStrategy?.aggressiveReasoning || "N/A"})
- Balanced Price: ${result.pricingStrategy?.balancedPrice || "N/A"} (${result.pricingStrategy?.balancedReasoning || "N/A"})
- Premium Price: ${result.pricingStrategy?.premiumPrice || "N/A"} (${result.pricingStrategy?.premiumReasoning || "N/A"})

A+ CONTENT IDEAS:
${(result.aPlusContentIdeas || []).map((idea) => `[${idea.moduleName}]\nLayout: ${idea.layoutIdea}\nPrompt: ${idea.contentPrompt}\nContent: ${idea.suggestedContent}`).join("\n\n")}
 `;
      mimeType = "text/plain";
      fileName += ".txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id].slice(-3),
    );
  };

  const handleRegenerate = async (
    section: "title" | "description" | "keywords",
  ) => {
    if (!activeResultTab || !results) return;

    setIsGenerating(true);
    try {
      const options: ListingOptions = {
        tone,
        useEmojis: false,
        seoFocus,
        inputMethod,
        inputValue,
        imageB64,
        backImageB64,
        isAPlusEligible,
        pricingGoal,
      };
      const newData = await regenerateSection(
        activeResultTab,
        section,
        options,
      );

      setResults((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [activeResultTab]: {
            ...prev[activeResultTab],
            [section]: newData,
          },
        };
      });
    } catch (err) {
      console.error("Regeneration Error:", err);
      setError(formatErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const getKeywordsInDescription = (
    keywords: string[] = [],
    description: string = "",
  ) => {
    const descStr = String(description || "");
    const descLower = descStr.toLowerCase();
    const kwArray = Array.isArray(keywords) ? keywords : [];
    return kwArray.map((kw) => ({
      text: kw,
      found: descLower.includes(String(kw || "").toLowerCase()),
    }));
  };

  const getPlatformLimits = (platform: string) => {
    switch (platform) {
      case "amazon_in":
        return { title: 200, desc: 2000 };
      case "flipkart":
        return { title: 150, desc: 2000 };
      case "ebay":
        return { title: 80, desc: 5000 };
      case "etsy":
        return { title: 140, desc: 5000 };
      case "meesho":
        return { title: 100, desc: 1000 };
      case "myntra":
        return { title: 150, desc: 2000 };
      case "shopify":
        return { title: 70, desc: 2000 };
      case "website":
        return { title: 70, desc: 5000 };
      default:
        return { title: 200, desc: 2000 };
    }
  };

  const shareToWhatsApp = () => {
    if (!results || !activeResultTab) return;
    const result = results[activeResultTab];
    const text = `Product Listing for ${activeResultTab}:\n\nTitle: ${result.title}\n\nKeywords: ${(result.keywords || []).join(",")}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePhotoShootUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" | "others",
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (type === "others") {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = reader.result?.toString().split(",")[1];
          if (b64) {
            setPhotoShootImages((prev) => ({
              ...prev,
              others: [...prev.others, b64],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = reader.result?.toString().split(",")[1];
          if (b64) {
            setPhotoShootImages((prev) => ({
              ...prev,
              [type]: b64,
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAPlusImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result?.toString().split(",")[1];
        setAPlusImageB64(b64);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleGenerateAPlus = async () => {
    if (!aPlusInput && !aPlusImageB64) return;
    
    const APLUS_DAILY_LIMIT = 5;
    const today = new Date().toISOString().split('T')[0];
    const currentUsage = userData?.lastAPlusDate === today ? (userData?.dailyAPlusCount || 0) : 0;
    
    if (currentUsage >= APLUS_DAILY_LIMIT) {
      setError(`Daily A+ content limit reached (${APLUS_DAILY_LIMIT} per day). Please try again tomorrow.`);
      return;
    }

    setIsGeneratingAPlus(true);
    setAPlusResult(null);
    setError(null);

    try {
      const data = await generateAPlusContent(aPlusInput, aPlusImageB64);
      setAPlusResult(data);
      
      // Update usage
      const userRef = doc(db, "users", auth.currentUser!.uid);
      try {
        await setDoc(userRef, {
          dailyAPlusCount: currentUsage + 1,
          lastAPlusDate: today
        }, { merge: true });
      } catch (fsErr) {
        console.error("Firestore Update Error:", fsErr);
        handleFirestoreError(fsErr, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
      }
    } catch (err) {
      console.error(err);
      setError(formatErrorMessage(err));
    } finally {
      setIsGeneratingAPlus(false);
    }
  };

  const handleWhiteBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWhiteBgImage(reader.result?.toString().split(",")[1]);
        setWhiteBgResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateWhiteBg = async () => {
    if (!whiteBgImage) return;

    const WHITEBG_DAILY_LIMIT = 5;
    const today = new Date().toISOString().split('T')[0];
    const currentUsage = userData?.lastWhiteBgDate === today ? (userData?.dailyWhiteBgCount || 0) : 0;
    
    if (currentUsage >= WHITEBG_DAILY_LIMIT) {
      setError(`Daily white background limit reached (${WHITEBG_DAILY_LIMIT} per day). Please try again tomorrow.`);
      return;
    }

    setIsProcessingWhiteBg(true);
    setError(null);
    try {
      const { removeBackground } = await import("./services/geminiService");
      const result = await removeBackground(whiteBgImage);
      setWhiteBgResult(result);

      // Update usage
      const userRef = doc(db, "users", auth.currentUser!.uid);
      try {
        await setDoc(userRef, {
          dailyWhiteBgCount: currentUsage + 1,
          lastWhiteBgDate: today
        }, { merge: true });
      } catch (fsErr) {
        console.error("Firestore Update Error:", fsErr);
        handleFirestoreError(fsErr, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
      }
    } catch (err) {
      console.error("White Background Error:", err);
      setError(formatErrorMessage(err));
    } finally {
      setIsProcessingWhiteBg(false);
    }
  };

  const downloadWhiteBg = () => {
    if (!whiteBgResult) return;
    const link = document.createElement("a");
    link.href = whiteBgResult;
    link.download = `white_bg_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl || !activeResultTab) return;

    const COMPETITOR_DAILY_LIMIT = 10;
    const today = new Date().toISOString().split('T')[0];
    const currentUsage = userData?.lastCompetitorDate === today ? (userData?.dailyCompetitorCount || 0) : 0;
    
    if (currentUsage >= COMPETITOR_DAILY_LIMIT) {
      setError(`Daily market intelligence limit reached (${COMPETITOR_DAILY_LIMIT} per day). Please try again tomorrow.`);
      return;
    }

    setIsAnalyzingCompetitor(true);
    setError(null);
    try {
      const result = await getMarketIntelligence(activeResultTab, {
        inputValue: competitorUrl,
        inputMethod: "url"
      });
      setMarketIntelligenceResults((prev) => ({
        ...prev,
        [activeResultTab]: result,
      }));

      // Update usage
      const userRef = doc(db, "users", auth.currentUser!.uid);
      try {
        await setDoc(userRef, {
          dailyCompetitorCount: currentUsage + 1,
          lastCompetitorDate: today
        }, { merge: true });
      } catch (fsErr) {
        console.error("Firestore Update Error:", fsErr);
        handleFirestoreError(fsErr, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
      }
    } catch (err) {
      console.error("Competitor Analysis Error:", err);
      setError(formatErrorMessage(err));
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };

  const isOwner = currentUser?.email === "jannatzu135@gmail.com";

  if (userData?.isBlocked && !isOwner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center space-y-8 border-2 border-red-100"
        >
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-red-500/20">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Account Suspended</h2>
            <p className="text-slate-500 font-medium">Your access to ListingAi has been restricted by the administrator.</p>
            <p className="text-sm text-slate-400 mt-4">If you believe this is a mistake, please contact support.</p>
          </div>
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <a 
              href="https://wa.me/919023654443?text=My%20account%20is%20blocked%20on%20ListingAi.%20Email:%20${userData.email}"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
            >
              Contact Support
            </a>
            <button
              onClick={() => signOut(auth)}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!isDomainAuthorized ? (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 space-y-6"
          >
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
              <ShieldAlert size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Unauthorized Access</h1>
              <p className="text-slate-400 font-medium leading-relaxed">
                This application is a restricted copy. The original version is hosted on the authorized domain.
              </p>
            </div>
            <div className="pt-4">
              <a 
                href={`https://ais-pre-${APP_ID}-67264769079.asia-southeast1.run.app`}
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
              >
                Visit Original App
              </a>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4">
              Security ID: {APP_ID} | Host: {window.location.hostname}
            </p>
          </motion.div>
        </div>
      ) : !isAuthorized ? (
        <AccessGate onAuthorized={() => setIsAuthorized(true)} />
      ) : isAuthLoading || (currentUser && isUserDataLoading) ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 p-6 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-500/10" />
            <div className="space-y-2">
              <p className="text-slate-900 font-black text-xl animate-pulse">
                {isAuthLoading ? "Verifying Session..." : "Loading Profile..."}
              </p>
              <p className="text-slate-500 text-sm font-medium max-w-xs">
                {showStuckHelp 
                  ? "It's taking longer than usual. This might be due to a slow connection or a session issue."
                  : "This usually takes a few seconds. Please wait while we secure your connection."}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
              >
                Refresh Page
              </button>

              {showStuckHelp && (
                <button 
                  onClick={() => {
                    const details = `
Auth Loading: ${isAuthLoading}
User Data Loading: ${isUserDataLoading}
Current User: ${currentUser ? currentUser.uid : 'None'}
Last Auth Error: ${lastAuthError || 'None'}
Timestamp: ${new Date().toISOString()}
                    `.trim();
                    navigator.clipboard.writeText(details);
                    alert("Technical details copied to clipboard! Please send them to the admin.");
                  }}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                >
                  Copy Error for Admin
                </button>
              )}
            </div>
          </div>
        </div>
      ) : !currentUser ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
              <User size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Login Required</h2>
              <p className="text-slate-500 font-medium">Please sign in with Google to access your account and plans.</p>
            </div>

            <ErrorDisplay error={error} />

            <button
              type="button"
              disabled={isLoggingIn}
              onClick={async () => {
                setIsLoggingIn(true);
                const provider = new GoogleAuthProvider();
                try {
                  await signInWithPopup(auth, provider);
                } catch (err) {
                  console.error("Login failed:", err);
                  setError("Login failed. Please try again or check your internet connection.");
                } finally {
                  setIsLoggingIn(false);
                }
              }}
              className={cn(
                "w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3",
                isLoggingIn && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoggingIn ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white p-1 rounded-full" alt="" />
              )}
              {isLoggingIn ? "Signing in..." : "Sign in with Google"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("isAuthorized");
                setIsAuthorized(false);
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Back to Access Code
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          {isPlanExpired && !isOwner && (
            <SubscriptionGate userData={userData} />
          )}
          <div
            className={cn(
              "min-h-screen transition-colors duration-300",
              "bg-neutral-50 text-neutral-900",
            )}
          >
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setStep={setStep}
        setResults={setResults}
        setIsContactModalOpen={setIsContactModalOpen}
        history={history}
        loadFromHistory={loadFromHistory}
        isOwner={isOwner}
        accessCode={currentAccessCode}
      />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:pl-72" : "pl-0",
        )}
      >
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentView={currentView}
        />

        <main className="mx-auto p-6 lg:p-10 transition-all duration-500 max-w-[1600px]">
          <ErrorDisplay error={error} />
          
          <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <AnimatePresence mode="wait">
              {currentView === "competitorAnalysis" && (
                <CompetitorAnalysisView
                  error={error}
                  activeResultTab={activeResultTab}
                  setActiveResultTab={setActiveResultTab}
                  competitorUrl={competitorUrl}
                  setCompetitorUrl={setCompetitorUrl}
                  handleAnalyzeCompetitor={handleAnalyzeCompetitor}
                  isAnalyzingCompetitor={isAnalyzingCompetitor}
                  competitorAnalysisResults={marketIntelligenceResults}
                  userData={userData}
                />
              )}
              {currentView === "photoShoot" && (
                <PhotoShootView
                  photoShootImages={photoShootImages}
                  handlePhotoShootUpload={handlePhotoShootUpload}
                  setPhotoShootImages={setPhotoShootImages}
                  userData={userData}
                  onNavigate={setCurrentView}
                  trackUsage={trackUsage}
                />
              )}
              {currentView === "whiteBackground" && (
                <WhiteBackgroundView
                  whiteBgImage={whiteBgImage}
                  setWhiteBgImage={setWhiteBgImage}
                  whiteBgResult={whiteBgResult}
                  isProcessingWhiteBg={isProcessingWhiteBg}
                  handleWhiteBackground={handleGenerateWhiteBg}
                  userData={userData}
                  error={error}
                />
              )}
              {currentView === "aPlusContent" && (
                <APlusContentView
                  aPlusImageB64={aPlusImageB64}
                  setAPlusImageB64={setAPlusImageB64}
                  handleAPlusImageUpload={handleAPlusImageUpload}
                  aPlusInput={aPlusInput}
                  setAPlusInput={setAPlusInput}
                  handleGenerateAPlus={handleGenerateAPlus}
                  isGeneratingAPlus={isGeneratingAPlus}
                  aPlusResult={aPlusResult}
                  error={error}
                  userData={userData}
                />
              )}
              {currentView === "lowShipping" && (
                <LowShippingView
                  image={lowShippingImage}
                  setImage={setLowShippingImage}
                  result={lowShippingResult}
                  setResult={setLowShippingResult}
                  isProcessing={isProcessingLowShipping}
                  setIsProcessing={setIsProcessingLowShipping}
                  userData={userData}
                  onNavigate={setCurrentView}
                  error={error}
                  trackUsage={trackUsage}
                />
              )}
              {currentView === "adminPanel" && isOwner && (
                <AdminPanelView />
              )}
              {currentView === "subscription" && (
                <SubscriptionView userData={userData} />
              )}
              {currentView === "generator" && (
                <ListingGeneratorView
                  step={step}
                  setStep={setStep}
                  selectedPlatforms={selectedPlatforms}
                  setSelectedPlatforms={setSelectedPlatforms}
                  inputMethod={inputMethod}
                  setInputMethod={setInputMethod}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  imageB64={imageB64}
                  setImageB64={setImageB64}
                  backImageB64={backImageB64}
                  setBackImageB64={setBackImageB64}
                  tone={tone}
                  setTone={setTone}
                  pricingGoal={pricingGoal}
                  setPricingGoal={setPricingGoal}
                  seoFocus={seoFocus}
                  setSeoFocus={setSeoFocus}
                  isGenerating={isGenerating}
                  handleGenerate={handleGenerate}
                  results={results}
                  setResults={setResults}
                  activeResultTab={activeResultTab}
                  setActiveResultTab={setActiveResultTab}
                  generationProgress={generationProgress}
                  generationStatus={generationStatus}
                  handleRegenerateSection={handleRegenerateSection}
                  regeneratingSection={regeneratingSection}
                  copyToClipboard={copyToClipboard}
                  copiedField={copiedField}
                  exportResults={exportResults}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                  error={error}
                  PLATFORMS={PLATFORMS}
                  TONES={TONES}
                  getPlatformLimits={getPlatformLimits}
                  handleImageUpload={handleImageUpload}
                  userData={userData}
                />
              )}
            </AnimatePresence>
          </Suspense>
        </main>
      </div>

      {/* Global Notification Pop-up */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[150] w-full max-w-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-neutral-900">Announcement</h4>
                  <button 
                    onClick={() => {
                      const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
                      localStorage.setItem('dismissedNotifications', JSON.stringify([...dismissed, showNotification.id]));
                      setShowNotification(null);
                    }}
                    className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {showNotification.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && results && activeResultTab && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row",
                "bg-white border border-neutral-200",
              )}
            >
              {/* Mockup Phone */}
              <div className="flex-1 bg-neutral-100 p-8 flex items-center justify-center border-r border-neutral-200">
                <div className="relative w-[320px] h-[640px] bg-white rounded-[50px] border-[8px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-10" />

                  {/* App Content */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide pt-8 pb-4">
                    {/* Image Placeholder */}
                    <div className="aspect-square bg-neutral-100 flex items-center justify-center">
                      {imageB64 ? (
                        <img
                          src={imageB64}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={48} className="text-neutral-300" />
                      )}
                    </div>

                    <div className="p-4 space-y-4">
                      <h2 className="text-lg font-bold leading-tight">
                        {results[activeResultTab].title}
                      </h2>
                      <div className="flex items-center gap-1 text-orange-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Sparkles key={i} size={12} fill="currentColor" />
                        ))}
                        <span className="text-[10px] text-neutral-500 ml-1">
                          (4.8)
                        </span>
                      </div>
                      <p className="text-2xl font-black">$99.99</p>

                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                          About this item
                        </p>
                        <ul className="space-y-2">
                          {(Array.isArray(results[activeResultTab].bulletPoints)
                            ? results[activeResultTab].bulletPoints
                            : []
                          ).map((bp, i) => (
                            <li
                              key={i}
                              className="text-[11px] leading-relaxed flex gap-2"
                            >
                              <span className="text-blue-500 font-bold">→</span>
                              <span className="">
                                {bp.includes(":") &&
                                bp.split(":")[0] ===
                                  bp.split(":")[0].toUpperCase() ? (
                                  <>
                                    <span className="font-bold">
                                      {bp.split(":")[0]}:
                                    </span>
                                    {bp.split(":").slice(1).join(":")}
                                  </>
                                ) : (
                                  bp
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div className="h-16 border-t border-neutral-100 flex items-center justify-around px-4">
                    <div className="w-8 h-8 rounded-full bg-neutral-100" />
                    <div className="w-8 h-8 rounded-full bg-neutral-100" />
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-neutral-100" />
                    <div className="w-8 h-8 rounded-full bg-neutral-100" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full md:w-80 p-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight">
                      Live Preview
                    </h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 hover:bg-neutral-100 :bg-neutral-800 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      Platform Mockup
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlatforms.map((pId) => {
                        const p = PLATFORMS.find((pl) => pl.id === pId);
                        return (
                          <button
                            key={pId}
                            onClick={() => setActiveResultTab(pId)}
                            className={cn(
                              "p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2",
                              activeResultTab === pId
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "border-neutral-200 hover:bg-neutral-50 :bg-neutral-800",
                            )}
                          >
                            <span>{p?.icon}</span>
                            {p?.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Zap size={16} />
                      <span className="text-xs font-bold">Pro Insight</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-700/80">
                      Mobile users account for 70% of e-commerce traffic. Your
                      listing is optimized for readability on small screens.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl"
                >
                  Back to Editor
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isProModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-lg p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden",
                "bg-white",
              )}
            >
              {/* Decorative background element */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />

              <button
                onClick={() => setIsProModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 :bg-slate-800 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-4 relative">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/30 rotate-3">
                  <Sparkles size={40} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tighter">
                    Unlock Pro Max
                  </h2>
                  <p className="text-neutral-500 font-medium">
                    Take your product photography to the next level.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 relative">
                {[
                  {
                    icon: <Maximize size={16} />,
                    title: "4K Ultra-HD Resolution",
                    desc: "Crystal clear assets for large displays",
                  },
                  {
                    icon: <Palette size={16} />,
                    title: "50+ AI Lifestyle Scenes",
                    desc: "Place products in any environment",
                  },
                  {
                    icon: <Focus size={16} />,
                    title: "Custom Camera Angles",
                    desc: "Total control over your studio setup",
                  },
                  {
                    icon: <Cpu size={16} />,
                    title: "Priority AI Engine",
                    desc: "3x faster generation with v3.0 Ultra-Real",
                  },
                  {
                    icon: <ShieldAlert size={16} />,
                    title: "Commercial License",
                    desc: "Full rights for all your marketing",
                  },
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="mt-1 w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{benefit.title}</p>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 relative">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                  <a
                    href="mailto:jdgohil135@gmail.com"
                    className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Mail size={16} />
                    </div>
                    jdgohil135@gmail.com
                  </a>
                  <a
                    href="tel:+919023654443"
                    className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Phone size={16} />
                    </div>
                    +91 90236 54443
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-6 relative",
                "bg-white",
              )}
            >
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 :bg-neutral-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                  <User size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Contact Information
                </h2>
                <p className="text-neutral-500">
                  Get in touch with the developer
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase">
                      Name
                    </p>
                    <p className="font-bold">Jagdish Gohil</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase">
                      Email Address
                    </p>
                    <a
                      href="mailto:jdgohil135@gmail.com"
                      className="font-bold hover:text-blue-600 transition-colors"
                    >
                      jdgohil135@gmail.com
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase">
                      Contact No
                    </p>
                    <a
                      href="tel:+919023654443"
                      className="font-bold hover:text-blue-600 transition-colors"
                    >
                      +91 90236 54443
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsContactModalOpen(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
          </div>
        </>
      )}
    </ErrorBoundary>
  );
}
