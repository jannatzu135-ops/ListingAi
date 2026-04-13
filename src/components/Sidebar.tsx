import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  X,
  LayoutDashboard,
  Image as ImageIcon,
  Target,
  Camera,
  Lock,
  Layers,
  User,
  TrendingUp,
  Edit2,
  Check,
  X as XIcon,
  ShieldCheck,
  CreditCard,
  Zap
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentView: string;
  setCurrentView: (view: any) => void;
  setStep: (step: number) => void;
  setResults: (results: any) => void;
  setIsContactModalOpen: (open: boolean) => void;
  history: any[];
  loadFromHistory: (item: any) => void;
  isOwner: boolean;
  accessCode: string;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({
  isSidebarOpen,
  setIsSidebarOpen,
  currentView,
  setCurrentView,
  setStep,
  setResults,
  setIsContactModalOpen,
  history,
  loadFromHistory,
  isOwner,
  accessCode,
}) => {
  const [isEditingCode, setIsEditingCode] = React.useState(false);
  const [newCode, setNewCode] = React.useState(accessCode);

  const handleUpdateCode = async () => {
    if (newCode.length !== 6) return;
    const path = "settings/global";
    try {
      await setDoc(doc(db, "settings", "global"), { accessCode: newCode });
      setIsEditingCode(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transition-all duration-500 transform",
        "bg-white/70 backdrop-blur-2xl border-r border-slate-200/50 shadow-[1px_0_0_0_rgba(0,0,0,0.02)]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => {
              setCurrentView("generator");
              setStep(1);
              setResults(null);
            }}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter font-display text-slate-900 leading-none">
                ListingAI
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                Pro Dashboard
              </span>
            </div>
          </motion.div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-8 py-4 scrollbar-hide">
          <div className="space-y-1.5">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
              Tools & Features
            </h3>
            
            {[
              { id: "generator", label: "Dashboard", icon: LayoutDashboard, color: "blue", premium: false },
              { id: "whiteBackground", label: "White Background", icon: ImageIcon, color: "indigo", premium: false },
              { id: "competitorAnalysis", label: "Competitor Analysis", icon: Target, color: "violet", premium: false },
              { id: "photoShoot", label: "AI Photoshoot", icon: Camera, color: "blue", addonRequired: true },
              { id: "lowShipping", label: "Low Shipping", icon: Zap, color: "indigo", addonRequired: true },
              { id: "aPlusContent", label: "A+ Content", icon: Layers, color: "blue", premium: false },
              { id: "subscription", label: "Subscription", icon: CreditCard, color: "amber", premium: false },
            ].map((item: any) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentView(item.id);
                    if (item.id === "generator") {
                      setStep(1);
                      setResults(null);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold"
                      : "hover:bg-slate-100/80 text-slate-500 hover:text-slate-900",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                    />
                  )}
                  <Icon
                    size={20}
                    className={cn(
                      "transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-white" : "group-hover:text-blue-600",
                    )}
                  />
                  <span className="text-[13px] tracking-tight">{item.label}</span>
                  
                  <div className="ml-auto flex items-center gap-1">
                    {item.addonRequired && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                        isActive ? "bg-white/20 text-white" : "bg-amber-600/10 text-amber-600"
                      )}>
                        Included
                      </span>
                    )}
                    {item.premium && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                        isActive ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-600"
                      )}>
                        Pro
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {isOwner && (
              <button
                onClick={() => setCurrentView("adminPanel")}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group mt-4",
                  currentView === "adminPanel"
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 font-bold"
                    : "bg-slate-50 border border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-white hover:shadow-md",
                )}
              >
                <ShieldCheck
                  size={20}
                  className={cn(
                    currentView === "adminPanel" ? "text-white" : "text-slate-400 group-hover:text-slate-900",
                  )}
                />
                <span className="text-[13px] tracking-tight">Admin Dashboard</span>
              </button>
            )}
          </div>

          {/* Secondary Section */}
          <div className="space-y-1.5">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
              Support
            </h3>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100/80 text-slate-500 hover:text-slate-900 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <User size={18} className="group-hover:text-blue-600" />
              </div>
              <span className="text-[13px] tracking-tight">Contact Support</span>
            </button>
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Recent Projects
              </h3>
              <div className="space-y-1 px-2">
                {history.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all duration-300 group"
                  >
                    <p className="text-[12px] font-bold truncate text-slate-700 group-hover:text-blue-600">
                      {item.productName}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-slate-100/50 bg-slate-50/30">
          {isOwner ? (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <Lock size={12} />
                    Master Code
                  </div>
                  <button 
                    onClick={() => setIsEditingCode(!isEditingCode)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                  >
                    {isEditingCode ? <XIcon size={12} /> : <Edit2 size={12} />}
                  </button>
                </div>
                
                {isEditingCode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold tracking-[0.3em] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all text-center"
                    />
                    <button
                      onClick={handleUpdateCode}
                      disabled={newCode.length !== 6}
                      className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-2xl font-black text-slate-900 tracking-[0.25em] text-center py-1">
                    {accessCode}
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut(auth)}
                className="w-full py-3 bg-white border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/20"
              >
                Admin Logout
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
                const provider = new GoogleAuthProvider();
                try {
                  await signInWithPopup(auth, provider);
                } catch (err) {
                  console.error("Admin login failed:", err);
                }
              }}
              className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
