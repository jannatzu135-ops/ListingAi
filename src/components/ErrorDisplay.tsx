import React, { useState } from "react";
import { ShieldAlert, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ErrorDisplayProps {
  error: string | null;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className }) => {
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const copyToClipboard = () => {
    const details = `
Error: ${error}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();
    navigator.clipboard.writeText(details).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={{ opacity: 1, height: "auto", y: 0 }}
        exit={{ opacity: 0, height: 0, y: -10 }}
        className={cn("w-full max-w-5xl mx-auto mb-6", className)}
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-red-600 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <p className="text-sm font-bold leading-tight">{error}</p>
          </div>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm active:scale-95"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy for Admin"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
