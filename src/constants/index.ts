import { PlatformConfig } from "../types";

export const PLATFORMS: PlatformConfig[] = [
  { id: "amazon_in", name: "Amazon.in", icon: "📦", color: "bg-orange-500" },
  { id: "flipkart", name: "Flipkart", icon: "🛒", color: "bg-blue-600" },
  { id: "ebay", name: "eBay", icon: "🏷️", color: "bg-blue-500" },
  { id: "etsy", name: "Etsy", icon: "🧶", color: "bg-orange-600" },
  { id: "meesho", name: "Meesho", icon: "🛍️", color: "bg-pink-600" },
  { id: "shopify", name: "Shopify", icon: "🎨", color: "bg-green-600" },
  { id: "myntra", name: "Myntra", icon: "👗", color: "bg-rose-500" },
  { id: "website", name: "Website", icon: "🌐", color: "bg-indigo-600" },
];

export const TONES = [
  "Professional",
  "Persuasive",
  "Friendly",
  "Exciting",
  "Minimalist",
];

export * from "./platformRules";
