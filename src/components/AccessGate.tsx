import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, ShieldAlert, CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import ErrorBoundary from "./ErrorBoundary";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccessGateProps {
  onAuthorized: () => void;
}

export default function AccessGate({ onAuthorized }: AccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async () => {
    if (isAdminLoggingIn) return;
    const provider = new GoogleAuthProvider();
    setIsAdminLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Admin login failed:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setLoginError("Login cancelled by user.");
      } else if (err.code === "auth/popup-blocked") {
        setLoginError("Popup blocked! Please allow popups for this site.");
      } else {
        setLoginError("Login failed. Please try again.");
      }
      setTimeout(() => setLoginError(null), 5000);
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4 || isChecking) return;
    
    setIsChecking(true);
    const path = "settings/global";
    try {
      const docSnap = await getDoc(doc(db, "settings", "global"));
      let correctCode = import.meta.env.VITE_ACCESS_CODE || "8052";
      
      if (docSnap.exists()) {
        correctCode = docSnap.data().accessCode;
      }
      
      if (code === correctCode) {
        setIsSuccess(true);
        setError(false);
        setTimeout(() => {
          try {
            localStorage.setItem("isAuthorized", "true");
            localStorage.setItem("usedAccessCode", code);
          } catch (e) {
            console.warn("LocalStorage set failed:", e);
          }
          onAuthorized();
        }, 1200);
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setCode("");
        }, 800);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden relative font-sans">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px]" 
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg relative z-10"
        >
          {/* Main Card */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-blue-600 z-50 flex flex-col items-center justify-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle2 size={80} strokeWidth={1.5} />
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black mt-6 tracking-tighter"
                  >
                    ACCESS GRANTED
                  </motion.h2>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/40 relative"
                >
                  <Lock size={28} strokeWidth={1.5} />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
                </motion.div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tighter text-white">
                    ListingAI <span className="text-blue-500">Vault</span>
                  </h1>
                  <p className="text-slate-400 font-medium text-base">
                    Enter your exclusive access code to unlock the future of e-commerce.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className={cn(
                      "w-full bg-white/[0.05] border-2 rounded-2xl h-20 text-center text-4xl font-black tracking-[0.4em] transition-all duration-500 outline-none",
                      error 
                        ? "border-red-500/50 text-red-500 bg-red-500/10 animate-shake" 
                        : "border-white/10 text-white focus:border-blue-500 focus:bg-white/[0.08] placeholder:text-white/10"
                    )}
                  />
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-7 left-0 right-0 text-center text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <ShieldAlert size={12} />
                      Access Denied
                    </motion.div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={code.length < 4 || isChecking || isSuccess}
                  className={cn(
                    "w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group/btn",
                    code.length >= 4 
                      ? "bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98]" 
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  )}
                >
                  {isChecking ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>UNLOCK ACCESS</span>
                      <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                </button>
              </form>

              {/* Admin Link */}
              <div className="pt-4 flex flex-col items-center gap-4">
                {loginError && (
                  <p className="text-xs text-red-500 font-bold uppercase tracking-widest animate-pulse">
                    {loginError}
                  </p>
                )}
                <button
                  onClick={handleAdminLogin}
                  disabled={isAdminLoggingIn}
                  className={cn(
                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border",
                    isAdminLoggingIn 
                      ? "text-blue-500 border-blue-500/30 animate-pulse" 
                      : "text-slate-500 border-white/5 hover:text-white hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  {isAdminLoggingIn ? "AUTHENTICATING..." : "ADMINISTRATOR LOGIN"}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://chat.whatsapp.com/BTFHZBxx4hM1ybQjzsMmcC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-2xl"
            >
              <MessageCircle size={18} className="text-red-500" />
              COMMUNITY
            </motion.a>

            <motion.a
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://wa.me/919023654443?text=Hey%20!!%20I%20want%20Free%20trial%20of%20ListingAi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:bg-blue-500 transition-all"
            >
              <MessageCircle size={18} />
              GET ACCESS CODE
            </motion.a>
          </div>
        </motion.div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 1.5s infinite;
          }
        `}} />
      </div>
    </ErrorBoundary>
  );
}
