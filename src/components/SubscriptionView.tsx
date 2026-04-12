import React from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Infinity, 
  MessageCircle, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCcw,
  ShieldCheck,
  Calendar,
  CreditCard,
  Crown,
  Lock,
  RotateCcw,
  Users,
  CheckCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface SubscriptionViewProps {
  userData: any;
}

export default function SubscriptionView({ userData }: SubscriptionViewProps) {
  const [isActivating, setIsActivating] = React.useState(false);

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
      handleFirestoreError(error, OperationType.UPDATE, `users/${userData.uid}`);
      alert("Failed to activate trial. Please try again or contact support.");
    } finally {
      setIsActivating(false);
    }
  };

  const getPlanBadge = (type: string) => {
    switch (type) {
      case 'pro_max': return { label: 'ListingAi Max', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case '6month': return { label: '6 Months', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'yearly': return { label: 'Yearly', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'monthly': return { label: 'Monthly', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'trial': return { label: 'Trial', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
      default: return { label: 'No Plan', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  const badge = getPlanBadge(userData?.planType || 'none');

  const PlanCard = ({ 
    title, 
    subtitle, 
    price, 
    duration, 
    features, 
    buttonText, 
    onClick, 
    isPopular, 
    isElite, 
    icon: Icon,
    colorClass,
    priceLabel = "one-time"
  }: any) => (
    <div className={cn(
      "group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col h-full overflow-hidden",
      "bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    )}>
      {isPopular && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg z-20 animate-pulse">
          Most Popular
        </div>
      )}
      {isElite && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg z-20">
          Elite
        </div>
      )}

      <div className="space-y-6 relative z-10 flex-1 flex flex-col">
        <div className="space-y-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 duration-500", colorClass)}>
            <Icon size={28} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white tracking-tight">{title}</h4>
            <p className="text-slate-500 font-bold text-sm mt-1">{subtitle}</p>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-4xl font-black tracking-tighter", colorClass.replace('bg-', 'text-'))}>{price}</span>
            <span className="text-slate-500 font-bold text-sm"> {priceLabel}</span>
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{duration}</p>
        </div>

        <div className="space-y-4 pt-8 flex-1">
          {features.map((feat: any, i: number) => (
            <div key={i} className="flex items-center gap-3 group/feat">
              {feat.included ? (
                <CheckCircle2 size={18} className={cn("shrink-0", colorClass.replace('bg-', 'text-'))} />
              ) : (
                <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 relative">
                  <div className="w-3 h-px bg-slate-700 rotate-45 absolute" />
                  <div className="w-3 h-px bg-slate-700 -rotate-45 absolute" />
                </div>
              )}
              <span className={cn(
                "text-sm font-bold transition-colors",
                feat.included ? "text-slate-200" : "text-slate-600"
              )}>{feat.label}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onClick}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 mt-8",
            isElite 
              ? "bg-amber-600 text-white hover:bg-amber-500 shadow-xl shadow-amber-900/20" 
              : "bg-slate-800 text-white hover:bg-slate-700 shadow-xl border border-slate-700 group-hover:border-slate-500"
          )}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="-mx-6 lg:-mx-10 -mt-6 lg:-mt-10 p-6 lg:p-10 bg-slate-950 min-h-screen space-y-12 pb-20"
    >
      {/* Current Plan Status - Rich Dark Style */}
      <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 transform -rotate-3">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Subscription & Billing</h2>
                <p className="text-slate-400 font-bold text-sm">Manage your premium e-commerce toolkit</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className={cn("px-6 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-sm", badge.color)}>
                <CreditCard size={16} />
                Plan: {badge.label}
              </div>
              {userData?.expiryDate && (
                <div className="px-6 py-3 rounded-2xl border-2 border-slate-800 bg-slate-800/50 text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-sm">
                  <Calendar size={16} />
                  Expires: {new Date(userData.expiryDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 bg-slate-800/50 rounded-[2rem] border border-slate-800 shadow-inner">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authenticated Account</p>
              <p className="font-black text-white tracking-tight">{userData?.email}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-slate-800 p-1 border-2 border-slate-700 shadow-xl overflow-hidden rotate-3">
              <img 
                src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}&background=2563eb&color=fff`} 
                alt="" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="text-center space-y-10 py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.1)]"
        >
          <Users size={14} />
          Trusted by 10,000+ Indian sellers
        </motion.div>
        
        <div className="space-y-6">
          <h3 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">
            Create marketplace-ready listings <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">starting from just ₹99</span>
          </h3>
          <p className="text-slate-500 font-bold text-xl max-w-2xl mx-auto">
            No long-term commitment. Images are optional. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto pt-8 px-4">
          {[
            { icon: ShieldCheck, title: "100% Secure Payment", sub: "Razorpay Protected" },
            { icon: Lock, title: "SSL Encrypted", sub: "Bank-grade Security" },
            { icon: RotateCcw, title: "Easy Refunds", sub: "No Questions Asked" },
            { icon: CheckCircle, title: "Verified by 10,000+", sub: "Indian Sellers" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-[2rem] flex items-center gap-4 text-left group hover:border-blue-500/30 hover:bg-slate-900/60 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500">
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-tight">{item.title}</p>
                <p className="text-slate-500 font-bold text-[11px] mt-0.5">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-16 space-y-8">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-slate-800" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              TRUSTED BY SELLERS ON INDIA'S TOP MARKETPLACES
            </p>
            <div className="h-px w-12 bg-slate-800" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 px-4">
            {[
              { name: 'Amazon', color: 'bg-[#FF9900]' },
              { name: 'Flipkart', color: 'bg-[#2874F0]' },
              { name: 'Meesho', color: 'bg-[#F43397]' },
              { name: 'Shopify', color: 'bg-[#95BF47]' },
              { name: 'Myntra', color: 'bg-[#FF3F6C]' }
            ].map((brand) => (
              <motion.div 
                key={brand.name}
                whileHover={{ y: -5, scale: 1.05 }}
                className="flex items-center gap-3 px-6 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-slate-700 hover:bg-slate-900 transition-all cursor-default group shadow-lg"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-inner", brand.color)}>
                  {brand.name[0]}
                </div>
                <span className="text-slate-300 font-black text-sm tracking-tighter group-hover:text-white transition-colors">{brand.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Options - Photo Style */}
      <div className="space-y-10">
        <div className="text-center space-y-3">
          <h3 className="text-5xl font-black text-white tracking-tighter">Choose Your Power</h3>
          <p className="text-slate-500 font-bold text-xl">Scale your business with AI-driven precision</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Trial Plan */}
          {!userData?.hasUsedTrial && userData?.planType === 'none' && (
            <PlanCard 
              title="Demo Trial"
              subtitle="Test the magic"
              price="FREE"
              duration="2 Days Access"
              icon={Sparkles}
              colorClass="bg-green-600"
              buttonText={isActivating ? "Activating..." : "Activate Trial"}
              onClick={handleActivateTrial}
              features={[
                { label: "20 Listings / Day", included: true },
                { label: "5 White Backgrounds / Day", included: true },
                { label: "10 Competitor Analysis / Day", included: true },
                { label: "5 A+ Content / Day", included: true },
                { label: "All Marketplaces", included: true },
                { label: "SEO Score Analysis", included: true },
                { label: "4 AI Photoshoot Studio / Day", included: false },
                { label: "5 AI Low Shipping Tool / Day", included: false }
              ]}
            />
          )}

          {/* Max Plan */}
          <PlanCard 
            title="ListingAi Max"
            subtitle="Ultimate testing plan"
            price="₹99"
            duration="3 Days Access"
            icon={Crown}
            colorClass="bg-rose-600"
            buttonText="Get Max Access"
            onClick={() => handleSelectPlan("ListingAi Max (3Days)", "₹99")}
            features={[
              { label: "20 Listings / Day", included: true },
              { label: "5 White Backgrounds / Day", included: true },
              { label: "10 Competitor Analysis / Day", included: true },
              { label: "5 A+ Content / Day", included: true },
              { label: "All Marketplaces", included: true },
              { label: "SEO Score Analysis", included: true },
              { label: "4 AI Photoshoot Studio / Day", included: true },
              { label: "5 AI Low Shipping Tool / Day", included: true }
            ]}
          />

          {/* Monthly Plan */}
          <PlanCard 
            title="1 Month"
            subtitle="Casual sellers"
            price="₹499"
            duration="30 Days Access"
            priceLabel="/month"
            icon={Zap}
            colorClass="bg-blue-600"
            buttonText="Get Monthly"
            onClick={() => handleSelectPlan("1 Month", "₹499")}
            features={[
              { label: "20 Listings / Day", included: true },
              { label: "5 White Backgrounds / Day", included: true },
              { label: "10 Competitor Analysis / Day", included: true },
              { label: "5 A+ Content / Day", included: true },
              { label: "All Marketplaces", included: true },
              { label: "SEO Score Analysis", included: true },
              { label: "4 AI Photoshoot Studio / Day", included: true },
              { label: "5 AI Low Shipping Tool / Day", included: true }
            ]}
          />

          {/* 6 Month Plan */}
          <PlanCard 
            title="6 Month"
            subtitle="Power sellers"
            price="₹1,499"
            duration="180 Days Access"
            priceLabel="/6 months"
            icon={Zap}
            colorClass="bg-indigo-600"
            buttonText="Get 6 Months"
            onClick={() => handleSelectPlan("6 Month", "₹1,499")}
            features={[
              { label: "20 Listings / Day", included: true },
              { label: "5 White Backgrounds / Day", included: true },
              { label: "10 Competitor Analysis / Day", included: true },
              { label: "5 A+ Content / Day", included: true },
              { label: "All Marketplaces", included: true },
              { label: "SEO Score Analysis", included: true },
              { label: "4 AI Photoshoot Studio / Day", included: true },
              { label: "5 AI Low Shipping Tool / Day", included: true }
            ]}
          />

          {/* Yearly Plan */}
          <PlanCard 
            title="1 Year"
            subtitle="Active sellers"
            price="₹1,999"
            duration="365 Days Access"
            priceLabel="/year"
            isPopular={true}
            icon={Zap}
            colorClass="bg-amber-600"
            buttonText="Get Yearly"
            onClick={() => handleSelectPlan("1 Year", "₹1,999")}
            features={[
              { label: "20 Listings / Day", included: true },
              { label: "5 White Backgrounds / Day", included: true },
              { label: "10 Competitor Analysis / Day", included: true },
              { label: "5 A+ Content / Day", included: true },
              { label: "All Marketplaces", included: true },
              { label: "SEO Score Analysis", included: true },
              { label: "4 AI Photoshoot Studio / Day", included: true },
              { label: "5 AI Low Shipping Tool / Day", included: true }
            ]}
          />
        </div>
      </div>
    </motion.div>
  );
}
