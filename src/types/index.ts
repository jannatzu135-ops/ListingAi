import { User as FirebaseUser } from "firebase/auth";
import { ListingResult, CompetitorAnalysisResult, APlusContentResult } from "../services/geminiService";

export interface GenerationHistory {
  id: string;
  productName: string;
  platforms: string[];
  results: Record<string, ListingResult>;
  timestamp: number;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PlatformRule {
  id: string;
  name: string;
  outputBlocks: string[];
  hardRules: string[];
  pricingLogic: string;
  unsupported: string[];
  titleLimit?: number;
  descriptionLimit?: number;
}
