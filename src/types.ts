export type Platform =
  | 'AMAZON'
  | 'FLIPKART'
  | 'EBAY'
  | 'ETSY'
  | 'MEESHO'
  | 'SHOPIFY'
  | 'MYNTRA'
  | 'GOOGLE_SEO';

import { ListingResult } from "./services/geminiService";

export interface GenerationHistory {
  id: string;
  productName: string;
  platforms: string[];
  results: Record<string, ListingResult>;
  timestamp: number;
}

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ProductMasterInput {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  materials?: string;
  packSize?: string;
  targetAudience?: string;
  basePrice?: number;
}

export interface ProductImageInput {
  url: string;
  base64?: string;
  mimeType?: string;
}

export interface ImageAnalysisResult {
  detectedCategory: string;
  detectedSubcategory: string;
  extractedFields: ExtractedField[];
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number; // 0 to 1
  source: 'IMAGE' | 'USER';
}

export interface PlatformRuleConfig {
  id: Platform;
  name: string;
  icon: string;
  supportedBlocks: string[];
  hardRules: {
    titleMaxLen: number;
    prohibitedChars?: string[];
    noHtml: boolean;
    noEmoji: boolean;
    descriptionRules?: string;
    imageRules?: string;
  };
  pricingLogic: string;
  unsupported: string[];
  rankingTips: string[];
  workflow: string[];
}

export interface PricingBand {
  label: string;
  price: number;
  description: string;
  strategy: string;
}

export interface PricingStrategy {
  mode: 'LIVE' | 'ESTIMATED';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  sourceLabel: string;
  marketRange: { min: number; max: number; average: number };
  recommendedPrice: number;
  bands: {
    aggressive: PricingBand;
    balanced: PricingBand;
    premium: PricingBand;
  };
  explanation: string;
  notes: string[];
}

export interface CopyBlock {
  id: string;
  label: string;
  content: string;
  supported: boolean;
}

export interface PlatformOutput {
  platform: Platform;
  blocks: CopyBlock[];
  pricing: PricingStrategy;
  compliance: {
    status: 'COMPLIANT' | 'WARNING' | 'NEEDS_REVIEW';
    issues: string[];
  };
  rankingSuggestions: string[];
  whyItHelps: string;
}
