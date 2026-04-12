import React from "react";
import { Menu, MessageCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = React.memo(({
  isSidebarOpen,
  setIsSidebarOpen,
  currentView,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b backdrop-blur-md flex items-center justify-between px-6",
        "bg-white/80 border-neutral-200",
      )}
    >
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
        )}
        <h2 className="text-lg font-bold tracking-tight">
          {currentView === "generator"
            ? "Listing Generator"
            : currentView === "whiteBackground"
              ? "White Background Tool"
              : currentView === "photoShoot"
                ? "AI Photoshoot"
                : currentView === "lowShipping"
                  ? "AI Low Shipping"
                  : currentView === "aPlusContent"
                  ? "A+ Content Generator"
                  : currentView === "adminPanel"
                    ? "Admin Dashboard"
                    : currentView === "subscription"
                      ? "Subscription & Billing"
                      : "Competitor Analysis"}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://chat.whatsapp.com/BTFHZBxx4hM1ybQjzsMmcC"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 animate-pulse"
        >
          <MessageCircle size={14} fill="currentColor" />
          Join Community
        </a>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          JZ
        </div>
      </div>
    </header>
  );
});

export default Header;
