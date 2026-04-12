import React from "react";
import { motion } from "motion/react";
import { 
  Lock, 
  ShieldAlert, 
  Zap, 
  Infinity, 
  MessageCircle, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCcw
} from "lucide-react";
import { cn } from "../lib/utils";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface SubscriptionGateProps {
  userData: any;
  children?: React.ReactNode;
  requiredPlan?: "trial" | "monthly" | "yearly" | "6month";
  requiredAddon?: "virtualTryOn" | "lowShipping";
  title?: string;
  description?: string;
}

export default function SubscriptionGate({ 
  userData, 
  children, 
  requiredPlan,
  requiredAddon,
  title: customTitle,
  description: customDescription 
}: SubscriptionGateProps) {
  const [isActivating, setIsActivating] = React.useState(false);

  const hasAccess = React.useMemo(() => {
    if (!userData) return false;
    if (userData.isBlocked) return false;
    
    // Check for specific add-on requirement
    const plan = userData.planType;
    const isExpired = plan !== "none" && userData.expiryDate && new Date() > new Date(userData.expiryDate);

    if (requiredAddon === "virtualTryOn" || requiredAddon === "lowShipping") {
      // Add-ons are included in all plans except trial and none
      if (plan === "trial" || plan === "none" || isExpired) return false;
      return true;
    }

    if (plan === "none" || isExpired) return false;

    return true;
  }, [userData, requiredPlan, requiredAddon]);

  const handleSelectPlan = (plan: string, price: string) => {
    const message = `Hey!! I want to upgrade my ListingAi plan.
Email: ${userData?.email}
UID: ${userData?.uid}
Selected Plan: ${plan} (${price})`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/919023654443?text=${encodedMessage}`, "_blank");
  };

  const handleActivateTrial = async () => {
    if (!userData?.uid) return;
    if (userData.planType !== 'none') {
      alert("You already have an active plan.");
      return;
    }
    setIsActivating(true);
    try {
      const userRef = doc(db, "users", userData.uid);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 2);
      
      await updateDoc(userRef, {
        planType: "trial",
        expiryDate: expiryDate.toISOString(),
        hasUsedTrial: true
      });
    } catch (error) {
      console.error("Trial activation failed:", error);
      alert("Failed to activate trial. Please try again or contact support.");
    } finally {
      setIsActivating(false);
    }
  };

  if (hasAccess && children) {
    return <>{children}</>;
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center p-4",
      !children && "fixed inset-0 z-[200] bg-slate-50/90 backdrop-blur-xl"
    )}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-slate-100 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Info */}
        <div className="md:w-2/5 bg-blue-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Lock size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                {customTitle || (userData?.planType === 'none' ? 'Access Required' : 'Plan Expired')}
              </h2>
              <p className="text-blue-100 font-medium">
                {customDescription || (userData?.planType === 'none' 
                  ? 'Welcome! Please select a plan to start generating high-converting listings.' 
                  : 'Your access has ended. Please upgrade to continue using ListingAI\'s premium features.')}
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-blue-200" />
              20 Listings / Day
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-blue-200" />
              5 White Backgrounds / Day
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-blue-200" />
              5 A+ Content / Day
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-blue-200" />
              10 Competitor Analysis / Day
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-blue-200" />
              4 AI Photoshoot Studio / Day
            </div>
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-blue-200" />
              5 AI Low Shipping Tool / Day
            </div>
          </div>
        </div>

        {/* Right Side: Plans */}
        <div className="md:w-3/5 p-8 md:p-12 space-y-8 overflow-y-auto max-h-[80vh]">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900">
              {requiredAddon === "virtualTryOn" || requiredAddon === "lowShipping" ? "Add-on Required" : "Choose a Plan"}
            </h3>
            <p className="text-slate-500 font-medium">
              {requiredAddon === "virtualTryOn" 
                ? "Unlock AI Photoshoot for your account" 
                : requiredAddon === "lowShipping"
                  ? "Unlock AI Low Shipping for your account"
                  : "Select the best option for your business"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Virtual Try-On Add-on */}
            {requiredAddon === "virtualTryOn" && (
              <button 
                type="button"
                onClick={() => handleSelectPlan("AI Photoshoot Add-on", "₹4,999")}
                className="group relative p-6 bg-amber-50 border-2 border-amber-100 rounded-[2rem] text-left transition-all hover:border-amber-600 hover:bg-white hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="absolute -top-3 -right-3 px-4 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/20">
                  Exclusive Add-on
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white">
                      <Sparkles size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900">AI Photoshoot</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-600">₹4,999</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">One-time Add-on</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Get access to 4 AI Photoshoot Studio / Day. (Validity linked to your main plan)</p>
                <div className="mt-4 flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Get Add-on <ArrowRight size={14} />
                </div>
              </button>
            )}

            {/* Low Shipping Add-on */}
            {requiredAddon === "lowShipping" && (
              <button 
                type="button"
                onClick={() => handleSelectPlan("AI Low Shipping Add-on", "₹499")}
                className="group relative p-6 bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] text-left transition-all hover:border-indigo-600 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="absolute -top-3 -right-3 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20">
                  Exclusive Add-on
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                      <Zap size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900">AI Low Shipping</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-600">₹499</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">One-time Add-on</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Get access to 5 AI Low Shipping Tool / Day. (Validity linked to your main plan)</p>
                <div className="mt-4 flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Get Add-on <ArrowRight size={14} />
                </div>
              </button>
            )}
            {!userData?.hasUsedTrial && !requiredAddon && userData?.planType === 'none' && (
              <button 
                type="button"
                onClick={handleActivateTrial}
                disabled={isActivating}
                className={cn(
                  "group relative p-6 bg-green-50 border-2 border-green-100 rounded-[2rem] text-left transition-all hover:border-green-600 hover:bg-white hover:shadow-xl hover:shadow-green-500/10",
                  isActivating && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                      {isActivating ? <RefreshCcw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    </div>
                    <span className="text-xl font-black text-slate-900">Demo Trial</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">FREE</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 Days</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Try all premium features for 2 days. Available once per user.</p>
                <div className="mt-4 flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  {isActivating ? "Activating..." : "Activate Trial"} <ArrowRight size={14} />
                </div>
              </button>
            )}

            {/* Max Access Plan */}
            {requiredPlan !== "6month" && !requiredAddon && (
              <button 
                type="button"
                onClick={() => handleSelectPlan("ListingAi Max (3Days)", "₹99")}
                className="group relative p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] text-left transition-all hover:border-rose-600 hover:bg-white hover:shadow-xl hover:shadow-rose-500/10"
              >
                <div className="absolute -top-3 -right-3 px-4 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose-500/20">
                  Best for Testing
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
                      <Sparkles size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900">Max Access (3Days)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-rose-600">₹99</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Days</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Get full access to all features including 4 AI Photoshoot & 5 Low Shipping / Day for 3 days.</p>
                <div className="mt-4 flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Select Plan <ArrowRight size={14} />
                </div>
              </button>
            )}

            {/* 1 Month Plan */}
            {requiredPlan !== "6month" && !requiredAddon && (
              <button 
                type="button"
                onClick={() => handleSelectPlan("1 Month", "₹499")}
                className="group relative p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-left transition-all hover:border-blue-600 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <span className="text-xl font-black text-slate-900">1 Month Access</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">₹499</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Month</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Perfect for short-term projects and testing.</p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Select Plan <ArrowRight size={14} />
                </div>
              </button>
            )}

            {/* 6 Month Plan */}
            <button 
              type="button"
              onClick={() => handleSelectPlan("6 Month", "₹1,499")}
              className="group relative p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-left transition-all hover:border-blue-600 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="absolute -top-3 -right-3 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">
                Popular
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <span className="text-xl font-black text-slate-900">6 Month Access</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">₹1,499</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per 6 Months</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">Full access to all tools for 180 days. Best for growing sellers.</p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Select Plan <ArrowRight size={14} />
              </div>
            </button>

            {/* 1 Year Plan */}
            <button 
              type="button"
              onClick={() => handleSelectPlan("1 Year", "₹1,999")}
              className="group relative p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-left transition-all hover:border-amber-600 hover:bg-white hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="absolute -top-3 -right-3 px-4 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/20">
                Best Value
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <span className="text-xl font-black text-slate-900">1 Year Access</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-600">₹1,999</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Year</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">Full access to all tools for 365 days. Ultimate power for sellers.</p>
              <div className="mt-4 flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Select Plan <ArrowRight size={14} />
              </div>
            </button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <a 
              href="https://wa.me/919023654443?text=Hey%20!!%20I%20want%20to%20upgrade%20my%20ListingAi%20plan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-colors font-bold text-sm"
            >
              <MessageCircle size={18} />
              Need help? Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
