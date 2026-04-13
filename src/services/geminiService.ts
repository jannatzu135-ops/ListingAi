import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { PLATFORM_RULES, GLOBAL_RULES } from "../constants/platformRules";
import { generateProductPrompt } from "./productPromptService";

export const Type = SchemaType;

const getApiKey = () => {
  try {
    // Check both process.env and import.meta.env
    const key = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || "";
    return typeof key === 'string' ? key.trim() : "";
  } catch (e) {
    const key = import.meta.env.VITE_GEMINI_API_KEY || "";
    return typeof key === 'string' ? key.trim() : "";
  }
};

const apiKey = getApiKey();
// Check for common placeholder values or empty/undefined strings
const isValidKey = apiKey && 
                  apiKey !== "" && 
                  apiKey !== "undefined" && 
                  apiKey !== "null" && 
                  apiKey !== "YOUR_API_KEY" &&
                  apiKey.length > 10;

let genAI: GoogleGenerativeAI | null = null;
if (isValidKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    // Silent catch
  }
}

/**
 * Helper function to check if AI is configured
 */
export const isAiConfigured = () => isValidKey && genAI !== null;

/**
 * Helper function to generate content using the generative model
 */
async function generateContent(params: any) {
  if (!isAiConfigured() || !genAI) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your GitHub Repository Secrets.");
  }

  const modelName = params.model || "gemini-1.5-flash-latest";
  const model = genAI.getGenerativeModel({ model: modelName });
  
  const { contents, config } = params;
  
  // Format contents for @google/generative-ai
  // The SDK expects an array of { role, parts: [{ text: ... } | { inlineData: ... }] }
  let formattedContents = [];
  if (Array.isArray(contents)) {
    formattedContents = contents;
  } else if (contents.parts) {
    formattedContents = [contents];
  } else {
    formattedContents = [{ role: "user", parts: [{ text: contents }] }];
  }

  const result = await model.generateContent({
    contents: formattedContents,
    generationConfig: config,
    tools: params.tools || config?.tools
  });

  const response = await result.response;
  const text = response.text();
  return {
    text: text,
    response: response, // Keep original response for advanced usage
    candidates: [{ content: { parts: [{ text: text }] } }]
  };
}

/**
 * Helper function to retry API calls with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.message?.includes('429') || 
                          error?.message?.includes('RESOURCE_EXHAUSTED') ||
                          error?.status === 429;
      
      if (isRateLimit && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export interface PricingStrategy {
  mode: 'Live Market Data' | 'Estimated';
  averagePrice: string;
  budgetPrice?: string;
  premiumPrice?: string;
  recommendedPrice: string;
  aggressivePrice: string;
  aggressiveReasoning: string;
  balancedPrice: string;
  balancedReasoning: string;
  premiumPriceValue: string; // Renamed to avoid conflict with top-level premiumPrice
  premiumReasoning: string;
  priceBand: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Needs Manual Review';
  whyItHelps: string;
  notes: string[];
}

export interface ListingResult {
  title: string;
  titleVariations: {
    short: string;
    medium: string;
    long: string;
  };
  platformSpecificBlocks: {
    label: string;
    content: string;
    isCopyable: boolean;
  }[];
  description: string;
  pricingStrategy: PricingStrategy;
  complianceWarnings: string[];
  rankingTips: string[];
  stepByStepWorkflow: string[];
  whyThisHelps: string;
  hsnCode: string;
  productCategory: string;
  gstRate: string;
  gstReasoning: string;
  bulletPoints?: string[];
  keywords?: string[];
  backendSearchTerms?: string;
  aPlusContentIdeas?: {
    moduleName: string;
    layoutIdea: string;
    contentPrompt: string;
    suggestedContent: string;
  }[];
  seoAnalysis: {
    score: number;
    scoreBreakdown: {
      title: number;
      bullets: number;
      description: number;
      keywords: number;
    };
    readabilityScore: string;
    keywordDensity: string;
    targetAudience: string;
    rankingFactors: string[];
    improvementSteps: string[];
    competitorInsights: string;
    platformSpecificAdvice: string;
    keywordPerformance: {
      keyword: string;
      searchVolume: 'High' | 'Medium' | 'Low';
      competition: 'High' | 'Medium' | 'Low';
    }[];
    competitorAnalysis: {
      strategy: string;
      advantage: string;
    }[];
  };
  extractedFields: {
    field: string;
    value: string;
    confidence: number;
    isInferred: boolean;
  }[];
  category: {
    main: string;
    sub: string;
  };
}

export interface CompetitorAnalysisResult {
  targetProduct: {
    name: string;
    price: string;
    pricingStrategy: string;
    reviewSentiment: 'Positive' | 'Neutral' | 'Negative';
    sentimentDetails: string;
    topKeywords: string[];
    strengths: string[];
    weaknesses: string[];
  };
  competitors: {
    name: string;
    price: string;
    pricingStrategy: string;
    reviewSentiment: 'Positive' | 'Neutral' | 'Negative';
    sentimentDetails: string;
    topKeywords: string[];
    strengths: string[];
    weaknesses: string[];
  }[];
  marketSummary: string;
  gapAnalysis: {
    competitorMissing: string;
    ourOpportunity: string;
  }[];
  suggestedPricingRange: {
    min: string;
    max: string;
    reasoning: string;
  };
}

export interface MarketIntelligenceResult {
  marketResearch: {
    hsnCode: string;
    gstRate: string;
    gstReasoning: string;
    marketAveragePrice: string;
    budgetPrice: string;
    premiumPrice: string;
    competitorPrices: string[];
    productCategory: string;
    marketTrends: string[];
    demandForecast: string;
  };
  competitorAnalysis: CompetitorAnalysisResult;
  proInsights: {
    winningStrategy: string;
    pricingSweetSpot: string;
    seoOpportunity: string;
    riskFactors: string[];
  };
}

export const getMarketIntelligence = async (
  platform: string,
  options: { inputValue: string; inputMethod: string; imageB64?: string }
): Promise<MarketIntelligenceResult> => {
  const searchPrompt = `
    Perform a PRO-LEVEL Market Intelligence and Competitor Analysis for the following product on ${platform} (India):
    PRODUCT DATA: ${options.inputValue}
    INPUT METHOD: ${options.inputMethod}
    
    CRITICAL: You MUST use the Google Search tool to find REAL-TIME data from Amazon.in, Flipkart, and Meesho.
    
    1. MARKET RESEARCH:
       - Find the accurate HSN code and GST rate for India.
       - Analyze current market trends for this category.
       - Provide a demand forecast (High/Medium/Low) for the next 30 days.
       - Identify the MEDIAN price, 25th percentile (Budget), and 75th percentile (Premium) for this category.
       
    2. COMPETITOR ANALYSIS:
       - Identify the top 3-5 competitors currently dominating the search results.
       - Find their ACTUAL live prices.
       - Analyze their strengths and weaknesses.
       - Perform a Gap Analysis: What are they missing?
       
    3. PRO INSIGHTS:
       - Define a "Winning Strategy" to beat the current top sellers.
       - Identify the "Pricing Sweet Spot" (a specific price point or very narrow range) for maximum conversion based on the median and competitor data.
       - Find a "Hidden SEO Opportunity" (e.g., a high-volume keyword competitors are missing).
    
    Provide a detailed report of your findings.
  `;

  try {
    const parts: any[] = [{ text: searchPrompt }];
    if (options.imageB64) {
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: options.imageB64 }
      });
    }

    // Step 1: Get raw research data using Search
    const searchResponse = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }]
      }
    }));

    const rawData = searchResponse.text;

    // Step 2: Format the raw data into JSON
    const formatPrompt = `
      Convert the following market research data into a structured JSON format.
      
      RAW DATA:
      ${rawData}
      
      Return the data in this JSON format:
      {
        "marketResearch": {
          "hsnCode": "string",
          "gstRate": "string",
          "gstReasoning": "string",
          "marketAveragePrice": number,
          "budgetPrice": number,
          "premiumPrice": number,
          "competitorPrices": [number],
          "productCategory": "string",
          "marketTrends": ["string"],
          "demandForecast": "string"
        },
        "competitorAnalysis": {
          "targetProduct": {
            "name": "string",
            "price": "string",
            "pricingStrategy": "string",
            "reviewSentiment": "Positive | Neutral | Negative",
            "sentimentDetails": "string",
            "topKeywords": ["string"],
            "strengths": ["string"],
            "weaknesses": ["string"]
          },
          "competitors": [
            {
              "name": "string",
              "price": "string",
              "pricingStrategy": "string",
              "reviewSentiment": "Positive | Neutral | Negative",
              "sentimentDetails": "string",
              "topKeywords": ["string"],
              "strengths": ["string"],
              "weaknesses": ["string"]
            }
          ],
          "marketSummary": "string",
          "gapAnalysis": [
            { "competitorMissing": "string", "ourOpportunity": "string" }
          ],
          "suggestedPricingRange": { "min": "string", "max": "string", "reasoning": "string" }
        },
        "proInsights": {
          "winningStrategy": "string",
          "pricingSweetSpot": "string",
          "seoOpportunity": "string",
          "riskFactors": ["string"]
        }
      }
    `;

    const formatResponse = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts: [{ text: formatPrompt }] },
      config: {
        responseMimeType: "application/json"
      }
    }));

    return JSON.parse(cleanJsonResponse(formatResponse.text));
  } catch (error) {
    console.error("Market Intelligence failed:", error);
    throw error;
  }
};

export interface APlusModule {
  type: string;
  headline: string;
  bodyCopy: string;
  imagePrompt: string;
  conversionLogic?: string;
  comparisonData?: any[];
}

export interface APlusContentResult {
  targetAudience: string;
  brandVoice: string;
  modules: APlusModule[];
  seoKeywords: string[];
  designTips: string[];
  mobileOptimizationTips: string[];
}

export interface ListingOptions {
  tone: string;
  useEmojis: boolean;
  seoFocus: boolean;
  inputMethod: 'image' | 'text' | 'url';
  inputValue: string;
  imageB64?: string;
  backImageB64?: string;
  isAPlusEligible?: boolean;
  pricingGoal?: string;
}

const cleanJsonResponse = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  
  // Find the first '{' and the last '}' to extract only the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
};

export const generateListing = async (
  platforms: string[],
  options: ListingOptions
): Promise<Record<string, ListingResult>> => {
  if (!isAiConfigured()) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your GitHub Repository Secrets to enable AI generation.");
  }
  console.log("Starting generation...");
  const results: Record<string, ListingResult> = {};

  // Step 1: Perform Market Research (HSN, GST, Pricing) once for all platforms
  console.log("Performing market research...");
  let marketResearch: any = null;
  try {
    const researchSearchPrompt = `
      Perform deep market research for the following product in the Indian marketplace (Amazon.in, Flipkart, Meesho):
      PRODUCT DATA: ${options.inputValue}
      INPUT METHOD: ${options.inputMethod}
      
      1. Find the most accurate 4, 6, or 8-digit HSN code for this product in India.
      2. Find the current GST rate (0%, 5%, 12%, 18%, or 28%) for this HSN code.
      3. CRITICAL: Find the ACTUAL current REALISTIC pricing landscape.
         - Search for at least 5-10 similar products on Amazon.in and Flipkart.
         - Identify the MEDIAN price (this is your Market Average).
         - Identify the 25th percentile price (this is your Budget/Aggressive entry point).
         - Identify the 75th percentile price (this is your Premium/High-end point).
         - List at least 5 specific competitor prices found.
         - Do NOT rely on high-end outliers or sponsored results that don't match the product quality.
      
      Provide a detailed report of your findings.
    `;

    const researchParts: any[] = [{ text: researchSearchPrompt }];
    if (options.imageB64) {
      researchParts.push({
        inlineData: { mimeType: "image/jpeg", data: options.imageB64 }
      });
    }

    // Step 1a: Get raw research data using Search
    const researchSearchResponse = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts: researchParts },
      config: {
        tools: [{ googleSearch: {} }]
      }
    }));

    const rawResearchData = researchSearchResponse.text;

    // Step 1b: Format the research data into JSON
    const researchFormatPrompt = `
      Convert the following market research data into a structured JSON format.
      
      RAW DATA:
      ${rawResearchData}
      
      Return the data in this JSON format:
      {
        "hsnCode": "string",
        "gstRate": "string",
        "gstReasoning": "string",
        "marketAveragePrice": number,
        "budgetPrice": number,
        "premiumPrice": number,
        "competitorPrices": [number],
        "productCategory": "string",
        "currency": "INR"
      }
    `;

    const researchFormatResponse = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts: [{ text: researchFormatPrompt }] },
      config: {
        responseMimeType: "application/json"
      }
    }));

    marketResearch = JSON.parse(cleanJsonResponse(researchFormatResponse.text));
    console.log("Market research completed:", marketResearch);
  } catch (error) {
    console.error("Market research failed, proceeding with estimates:", error);
    marketResearch = {
      hsnCode: "Pending Research",
      gstRate: "18% (Estimated)",
      gstReasoning: "Standard rate for most consumer goods.",
      marketAveragePrice: 500,
      budgetPrice: 299,
      premiumPrice: 999,
      competitorPrices: [299, 499, 599, 899, 999],
      productCategory: "Detected from input",
      currency: "INR"
    };
  }

  const promises = platforms.map(async (platform) => {
    const rules = PLATFORM_RULES[platform];
    if (!rules) return;

    const prompt = `
      You are an expert e-commerce strategist and listing optimizer. 
      Generate a platform-compliant product listing for ${rules.name.toUpperCase()}.
      IMPORTANT: If the platform is Amazon, strictly target Amazon.in (India).

      CRITICAL: The output MUST NOT sound like it was generated by an AI. 
      - Use a 100% human-written, natural, and persuasive tone.
      - Avoid generic AI clichés and repetitive structures.
      - Ensure the listing is highly SEO optimized for the specific platform's search algorithm.

      MARKET RESEARCH DATA (USE THIS AS THE SOURCE OF TRUTH):
      - HSN Code: ${marketResearch.hsnCode || 'N/A'}
      - GST Rate: ${marketResearch.gstRate || 'N/A'}
      - Market Average (Median): ₹${marketResearch.marketAveragePrice || 0}
      - Budget Entry (25th Percentile): ₹${marketResearch.budgetPrice || 0}
      - Premium Tier (75th Percentile): ₹${marketResearch.premiumPrice || 0}
      - Competitor Benchmarks: ${(marketResearch.competitorPrices || []).map((p: any) => "₹" + p).join(", ") || 'N/A'}

      PRICING STRATEGY CALCULATION RULES:
      1. Recommended/Balanced Price: Set this exactly at or slightly below the Market Average. Use psychological pricing (e.g., if average is 500, use 499 or 479).
      2. Aggressive Price: Set this near the Budget Entry point to undercut competition. Must end in 9 (e.g., 299, 349).
      3. Premium Price: Set this near the Premium Tier. Justify it with "Superior Quality" or "Brand Value". Must end in 9 or 99.
      4. Pricing Goal: ${options.pricingGoal || 'Balanced'}. If 'Aggressive', make the Recommended Price lean towards the Budget Entry.

      PLATFORM CONTEXT: ${rules.name}
      INPUT DATA: ${options.inputValue}
      TONE: ${options.tone}
      EMOJIS: ${options.useEmojis ? 'Allowed' : 'Disabled'}
      
      PLATFORM-SPECIFIC RULES:
      - Title Limit: ${rules.titleLimit || 'N/A'} characters
      - Description Limit: ${rules.descriptionLimit || 'N/A'} characters
      - Hard Rules: ${rules.hardRules.join('; ')}
      - Pricing Logic: ${rules.pricingLogic}

      GLOBAL RULES:
      ${GLOBAL_RULES.map(rule => `- ${rule}`).join('\n')}

      GENERATION FLOW:
      1. Generate Title (compliant with limits)
      2. Generate ONLY these output blocks: ${rules.outputBlocks.join(', ')}. Use standard markdown bullet points.
      3. Generate Description (compliant with limits)
      4. Generate Pricing Strategy (Aggressive, Balanced, Premium) using the CALCULATION RULES above.

      Return the response in JSON format:
      {
        "title": "string",
        "titleVariations": { "short": "string", "medium": "string", "long": "string" },
        "platformSpecificBlocks": [
          { "label": "string", "content": "string", "isCopyable": true }
        ],
        "description": "string",
        "pricingStrategy": {
          "mode": "Live Market Data",
          "averagePrice": "₹${marketResearch.marketAveragePrice}",
          "budgetPrice": "₹${marketResearch.budgetPrice}",
          "premiumPrice": "₹${marketResearch.premiumPrice}",
          "recommendedPrice": "₹[Value]",
          "aggressivePrice": "₹[Value]",
          "aggressiveReasoning": "string",
          "balancedPrice": "₹[Value]",
          "balancedReasoning": "string",
          "premiumPriceValue": "₹[Value]",
          "premiumReasoning": "string",
          "priceBand": "string",
          "confidence": "High",
          "whyItHelps": "string",
          "notes": ["string"]
        },
        "complianceWarnings": ["string"],
        "rankingTips": ["string"],
        "stepByStepWorkflow": ["string"],
        "whyThisHelps": "string",
        "hsnCode": "${marketResearch.hsnCode}",
        "productCategory": "${marketResearch.productCategory}",
        "gstRate": "${marketResearch.gstRate}",
        "gstReasoning": "${marketResearch.gstReasoning}",
        "keywords": ["string"],
        "bulletPoints": ["string"],
        "backendSearchTerms": "string",
        "seoAnalysis": {
          "score": 85,
          "scoreBreakdown": { "title": 20, "bullets": 20, "description": 25, "keywords": 20 },
          "readabilityScore": "string",
          "keywordDensity": "string",
          "targetAudience": "string",
          "rankingFactors": ["string"],
          "improvementSteps": ["string"],
          "competitorInsights": "string",
          "platformSpecificAdvice": "string",
          "keywordPerformance": [{ "keyword": "string", "searchVolume": "High", "competition": "Medium" }],
          "competitorAnalysis": [{ "strategy": "string", "advantage": "string" }]
        },
        "extractedFields": [{ "field": "string", "value": "string", "confidence": 0.95, "isInferred": true }],
        "category": { "main": "string", "sub": "string" },
        "aPlusContentIdeas": [{ "moduleName": "string", "layoutIdea": "string", "contentPrompt": "string", "suggestedContent": "string" }]
      }
    `;

    try {
      const parts: any[] = [{ text: prompt }];
      if (options.imageB64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: options.imageB64
          }
        });
      }
      if (options.backImageB64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: options.backImageB64
          }
        });
      }

      console.log(`Generating listing for ${platform}...`);
      
      const config: any = {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            titleVariations: {
              type: SchemaType.OBJECT,
              properties: {
                short: { type: SchemaType.STRING },
                medium: { type: SchemaType.STRING },
                long: { type: SchemaType.STRING }
              },
              required: ["short", "medium", "long"]
            },
            platformSpecificBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  content: { type: Type.STRING },
                  isCopyable: { type: Type.BOOLEAN }
                },
                required: ["label", "content", "isCopyable"]
              }
            },
            description: { type: Type.STRING },
            pricingStrategy: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING },
                averagePrice: { type: Type.STRING },
                budgetPrice: { type: Type.STRING },
                premiumPrice: { type: Type.STRING },
                recommendedPrice: { type: Type.STRING },
                aggressivePrice: { type: Type.STRING },
                aggressiveReasoning: { type: Type.STRING },
                balancedPrice: { type: Type.STRING },
                balancedReasoning: { type: Type.STRING },
                premiumPriceValue: { type: Type.STRING },
                premiumReasoning: { type: Type.STRING },
                priceBand: { type: Type.STRING },
                confidence: { type: Type.STRING },
                whyItHelps: { type: Type.STRING },
                notes: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["mode", "averagePrice", "recommendedPrice", "aggressivePrice", "aggressiveReasoning", "balancedPrice", "balancedReasoning", "premiumPriceValue", "premiumReasoning", "priceBand", "confidence", "whyItHelps", "notes"]
            },
            complianceWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            rankingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            stepByStepWorkflow: { type: Type.ARRAY, items: { type: Type.STRING } },
            whyThisHelps: { type: Type.STRING },
            hsnCode: { type: Type.STRING },
            productCategory: { type: Type.STRING },
            gstRate: { type: Type.STRING },
            gstReasoning: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            backendSearchTerms: { type: Type.STRING },
            seoAnalysis: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                scoreBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.NUMBER },
                    bullets: { type: Type.NUMBER },
                    description: { type: Type.NUMBER },
                    keywords: { type: Type.NUMBER }
                  },
                  required: ["title", "bullets", "description", "keywords"]
                },
                readabilityScore: { type: Type.STRING },
                keywordDensity: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
                rankingFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                competitorInsights: { type: Type.STRING },
                platformSpecificAdvice: { type: Type.STRING },
                keywordPerformance: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      keyword: { type: Type.STRING },
                      searchVolume: { type: Type.STRING },
                      competition: { type: Type.STRING }
                    },
                    required: ["keyword", "searchVolume", "competition"]
                  }
                },
                competitorAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      strategy: { type: Type.STRING },
                      advantage: { type: Type.STRING }
                    },
                    required: ["strategy", "advantage"]
                  }
                }
              },
                required: ["score", "scoreBreakdown", "readabilityScore", "keywordDensity", "targetAudience", "rankingFactors", "improvementSteps", "competitorInsights", "platformSpecificAdvice", "keywordPerformance", "competitorAnalysis"]
            },
            extractedFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  value: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  isInferred: { type: Type.BOOLEAN }
                },
                required: ["field", "value", "confidence", "isInferred"]
              }
            },
            category: {
              type: Type.OBJECT,
              properties: {
                main: { type: Type.STRING },
                sub: { type: Type.STRING }
              },
              required: ["main", "sub"]
            },
            aPlusContentIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  moduleName: { type: Type.STRING },
                  layoutIdea: { type: Type.STRING },
                  contentPrompt: { type: Type.STRING },
                  suggestedContent: { type: Type.STRING }
                },
                required: ["moduleName", "layoutIdea", "contentPrompt", "suggestedContent"]
              }
            }
          },
          required: ["title", "titleVariations", "platformSpecificBlocks", "description", "pricingStrategy", "complianceWarnings", "rankingTips", "stepByStepWorkflow", "whyThisHelps", "extractedFields", "category", "keywords", "bulletPoints", "backendSearchTerms", "seoAnalysis", "hsnCode", "productCategory", "gstRate", "gstReasoning"]
        }
      };

      const response = await withRetry(() => generateContent({
        model: "gemini-1.5-flash-latest",
        contents: { parts },
        config
      }));

      const result = JSON.parse(cleanJsonResponse(response.text));
      results[platform] = result;
    } catch (error) {
      console.error(`Error generating listing for ${platform}:`, error);
      throw error;
    }
  });

  await Promise.all(promises);

  return results;
};


export interface VirtualTryOnOptions {
  mode: 'apparel' | 'product' | 'mockup' | 'reimagine';
  productImageB64: string;
  modelImageB64?: string;
  designImageB64?: string; // For mockup mode
  category: string;
  pose?: string;
  background?: string;
  lighting?: string;
  expression?: string;
  focalLength?: string;
  environmentEffects?: string;
  realismBoost?: boolean;
  material?: string;
  transformation?: string;
  cameraAngle?: string;
  backgroundImageB64?: string;
}

export const generateVirtualTryOn = async (options: VirtualTryOnOptions): Promise<string> => {
  let prompt = "";

  if (options.mode === 'apparel') {
    prompt = `
      TASK: Professional AI Apparel Photoshoot (Model + Clothing).
      INSTRUCTIONS:
      1. Take the provided apparel item (garment) and realistically "wear" it on the human model.
      2. Extract the garment details (texture, fabric folds, color) and conform them to the model's body shape and pose.
      3. Pose/Shot Type: ${options.pose || 'Natural standing'}
      4. Model Expression: ${options.expression || 'Neutral/Professional'}
      5. Lighting: ${options.lighting || 'Studio Soft Light'}
      6. Focal Length: ${options.focalLength || '50mm'}
      7. Background: ${options.backgroundImageB64 ? 'Use the provided background image as the environment.' : (options.background || 'Professional Studio')}
      8. Material/Reflections: ${options.material || 'Natural'}
      9. Camera Angle: ${options.cameraAngle || 'Eye-Level'}
      10. Ensure "Fabric Simulation" is active: the garment should follow the model's movement and gravity naturally.
      ${options.realismBoost ? '11. REALISM BOOST: Enhance skin pores, fabric micro-textures, and high-fidelity rendering.' : ''}
    `;
  } else if (options.mode === 'product') {
    prompt = `
      TASK: Professional AI Product Photography Studio.
      INSTRUCTIONS:
      1. Place the provided product on a ${options.backgroundImageB64 ? 'the provided background image' : (options.background || 'Marble/Wood surface')}.
      2. Environment Effects: ${options.environmentEffects || 'Natural Shadows'}
      3. Lighting Quality: ${options.lighting || 'Cinematic'}
      4. Material/Reflections: ${options.material || 'Natural'}
      5. Camera Angle: ${options.cameraAngle || 'Eye-Level'}
      6. Artistic Transformation: ${options.transformation || 'None'}
      7. Time of Day: ${options.background?.includes('Outdoor') ? 'Golden Hour' : 'Studio Controlled'}
      8. Ensure realistic shadows and reflections on the surface.
      ${options.realismBoost ? '9. REALISM BOOST: Enhance material textures (metal, glass, wood) and high-fidelity rendering.' : ''}
    `;
  } else if (options.mode === 'mockup') {
    prompt = `
      TASK: AI Design & Mockup Studio.
      INSTRUCTIONS:
      1. Take the provided graphic design and place it on the blank mockup garment.
      2. WRINKLE CONFORM: The design MUST follow the fabric's folds, wrinkles, and shadows perfectly.
      3. Placement: Scale and rotate the design naturally on the chest/center.
      4. Lighting: Match the design's lighting to the mockup's environment.
      5. Background: ${options.backgroundImageB64 ? 'Use the provided background image' : (options.background || 'Clean Studio')}
    `;
  } else {
    prompt = `
      TASK: AI Reimagine (Magic Swap).
      INSTRUCTIONS:
      1. Use the reference photo and swap ${options.background ? 'the background to ' + options.background : 'the model/outfit'}.
      2. Keep the original pose and composition exactly the same.
      3. Ensure seamless blending between the swapped elements and the original structure.
      4. Background: ${options.backgroundImageB64 ? 'Use the provided background image' : (options.background || 'Clean Studio')}
    `;
  }

  prompt += `\nOUTPUT: Return ONLY the high-fidelity processed image.`;

  try {
    const parts: any[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: options.productImageB64
        }
      }
    ];

    if (options.modelImageB64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: options.modelImageB64
        }
      });
    }

    if (options.designImageB64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: options.designImageB64
        }
      });
    }

    if (options.backgroundImageB64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: options.backgroundImageB64
        }
      });
    }

    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts },
    }));

    for (const part of (response.candidates?.[0]?.content?.parts as any[]) || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Virtual Try-On failed:", error);
    throw error;
  }
};

export const generateBackgroundImage = async (prompt: string): Promise<string> => {
  const fullPrompt = `Generate a high-quality, professional photoshoot background image. 
  Description: ${prompt}
  Style: Photorealistic, high resolution, professional studio lighting.
  No people, no products, just the environment.`;

  try {
    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: {
        parts: [{ text: fullPrompt }]
      }
    }));

    for (const part of (response.candidates[0].content.parts as any[])) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Background generation failed:", error);
    throw error;
  }
};

export const analyzeProductImage = async (imageB64: string): Promise<string> => {
  try {
    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: {
        parts: [
          { text: "Analyze this product image and provide a concise, professional description (max 10 words) for an e-commerce listing. Focus on the item type, color, and key features." },
          { inlineData: { mimeType: "image/jpeg", data: imageB64 } }
        ]
      }
    }));

    return response.candidates?.[0]?.content?.parts?.[0]?.text || "Product analyzed";
  } catch (error) {
    console.error("Analysis failed:", error);
    return "Product analyzed";
  }
};

export const suggestPhotoshootSettings = async (imageB64: string, mode: string): Promise<any> => {
  const prompt = `
    Analyze this product image and suggest the best professional photoshoot settings for ${mode} mode.
    Return a JSON object with these fields:
    - background: A descriptive background name (e.g., "Minimalist Loft", "Luxury Marble Studio")
    - lighting: One of ["Studio Soft", "Cinematic", "Golden Hour", "Neon"]
    - pose: (Only if mode is apparel) A professional pose name
    - cameraAngle: One of ["Eye-Level", "Top-Down (Flat Lay)", "Hero Shot (Low Angle)", "45-Degree E-commerce"]
    - material: One of ["Matte", "Glossy", "Metallic", "Glass"]
    - colorGrade: A cinematic color grade name
    - focalLength: A camera lens focal length (e.g., "35mm", "50mm", "85mm")
    - environmentEffects: Suggested effects (e.g., "Soft Shadows", "Subtle Reflections")
    - bgPrompt: A detailed prompt for an AI background generator that matches the product's vibe.
  `;

  try {
    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: imageB64 } }
        ]
      },
      config: { responseMimeType: "application/json" }
    }));

    return JSON.parse(cleanJsonResponse(response.text));
  } catch (error) {
    console.error("AI Suggestion failed:", error);
    throw error;
  }
};

export const generateProductStudioImage = async (params: any): Promise<string> => {
  const promptParts = generateProductPrompt(params);
  
  try {
    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts: promptParts },
    }));

    for (const part of (response.candidates?.[0]?.content?.parts as any[]) || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Product Studio Generation failed:", error);
    throw error;
  }
};

export const removeBackground = async (imageB64: string): Promise<string> => {
  try {
    const response = await withRetry(() => generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageB64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: 'Remove the background of this image and replace it with a solid, pure white background. Keep only the main product in the center. The output should be just the edited image.',
          },
        ],
      },
    }));

    for (const part of (response.candidates?.[0]?.content?.parts as any[]) || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export interface LowShippingResult {
  image: string;
  advice: {
    recommendedDimensions: { l: number; b: number; h: number };
    weightSlab: string;
    packagingTip: string;
    meeshoSecretTrick: string;
  };
}

export const processLowShippingImage = async (imageB64: string): Promise<LowShippingResult> => {
  try {
    const imagePrompt = `
      Role: You are an advanced E-commerce Image Processing AI.
      Task: Process the uploaded product image:
      1. Remove background (Pure White #FFFFFF).
      2. Center the product.
      3. Add 40% Smart Padding (make the product look small in the frame).
      4. Output: 1:1 Square Aspect Ratio.
      OUTPUT: Return ONLY the processed high-fidelity image.
    `;

    const advicePrompt = `
      Role: You are an advanced E-commerce Shipping Optimization Expert for Meesho, Amazon, and Flipkart.
      Based on the product in the image, provide optimized shipping data for the Meesho/Amazon seller panel.
      - Recommended Dimensions (L, B, H in cm) that are safe but lower the volumetric weight.
      - Weight Slab advice (e.g., "Keep under 500g").
      - A specific packaging tip to reduce weight.
      - A "Secret Trick" for Meesho sellers to avoid weight penalties.

      Return the response in JSON format:
      {
        "advice": {
          "recommendedDimensions": { "l": 15, "b": 12, "h": 3 },
          "weightSlab": "string",
          "packagingTip": "string",
          "meeshoSecretTrick": "string"
        }
      }
    `;

    const [imageResponse, adviceResponse] = await Promise.all([
      withRetry(() => generateContent({
        model: 'gemini-1.5-flash',
        contents: {
          parts: [
            { inlineData: { data: imageB64, mimeType: 'image/jpeg' } },
            { text: imagePrompt },
          ],
        },
      })),
      withRetry(() => generateContent({
        model: 'gemini-1.5-flash',
        contents: {
          parts: [
            { inlineData: { data: imageB64, mimeType: 'image/jpeg' } },
            { text: advicePrompt },
          ],
        },
        config: {
          responseMimeType: "application/json"
        }
      }))
    ]);

    let processedImage = "";
    for (const part of (imageResponse.candidates?.[0]?.content?.parts as any[]) || []) {
      if (part.inlineData) {
        processedImage = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    const adviceResult = JSON.parse(cleanJsonResponse(adviceResponse.text));

    return {
      image: processedImage || `data:image/png;base64,${imageB64}`,
      advice: adviceResult.advice
    };
  } catch (error) {
    console.error('Error processing low shipping image:', error);
    throw error;
  }
};

export const regenerateSection = async (
  platform: string,
  section: 'title' | 'bulletPoints' | 'description' | 'keywords',
  options: ListingOptions
): Promise<any> => {
  const prompt = `
    Regenerate the ${section} for a product listing on ${platform}.
    
    Current Product Info: ${options.inputValue}
    Tone: ${options.tone}
    Include Emojis: ${options.useEmojis ? 'Yes' : 'No'}
    
    CRITICAL: The output MUST look like it was written by a human and NOT an AI.
    - Avoid AI clichés and generic phrases.
    - Use natural, direct, and persuasive language.
    - Ensure the content is SEO optimized for ${platform}.
    
    IMPORTANT: All information provided must use simple English words.
    ${section === 'keywords' ? 'CRITICAL: Provide a comprehensive list of 15-20 highly accurate, high-volume search keywords relevant to the product and platform.' : ''}
    ${section === 'bulletPoints' ? 'CRITICAL: Format information professionally using bullet points. When using bullet points, ALWAYS use standard markdown bullet points (e.g., `- Point 1`) and ensure each point is on a new line. Do NOT use custom symbols like arrows.' : ''}
    
    Return ONLY the regenerated ${section} in JSON format:
    {
      "${section}": ... (string for title/description, array for bulletPoints/keywords)
    }
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    if (options.imageB64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: options.imageB64
        }
      });
    }
    if (options.backImageB64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: options.backImageB64
        }
      });
    }

    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    }));

    const result = JSON.parse(cleanJsonResponse(response.text || "{}"));
    const data = result[section];
    
    if ((section === 'keywords' || section === 'bulletPoints') && typeof data === 'string') {
      return data.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    
    return data;
  } catch (error) {
    console.error(`Error regenerating ${section} for ${platform}:`, error);
    throw error;
  }
};

export const analyzeCompetitor = async (
  platform: string,
  productUrl: string
): Promise<CompetitorAnalysisResult> => {
  const prompt = `
    Perform a comprehensive competitor analysis for the product at this URL: ${productUrl}
    on the ${platform} marketplace.
    IMPORTANT: If the platform is Amazon, strictly target Amazon.in (India) and NOT Amazon.com. Use live search data from amazon.in for this analysis.
    
    CRITICAL INSTRUCTION: You have access to the Google Search tool. You MUST use it to search the web and find the ACTUAL current price of the product at the provided URL and its top competitors. Do NOT hallucinate or guess the prices. If you cannot find the exact price after searching, state 'Not available' instead of guessing.

    1. First, analyze the SPECIFIC product at the provided URL (${productUrl}).
    2. Then, identify the top 3 competitors for this product.
    
    For the target product AND each competitor, provide:
    1. Name of the product.
    2. Current price.
    3. Pricing strategy (e.g., Premium, Budget, Value-based).
    4. Customer review sentiment (Positive/Neutral/Negative) and a brief detail.
    5. Top 5 performing keywords.
    6. Key strengths and weaknesses.
    
    Also provide a brief market summary of the competition for this product category on ${platform}.
    Perform a gap analysis identifying what competitors are missing that the user's product can highlight.
    Finally, suggest a competitive pricing range for the user's product based on this analysis.
    
    IMPORTANT: All information provided must look like it was written by a human and use simple English words.
    Format information professionally using bullet points or numbered lists where appropriate to improve readability and structure.
    
    Return the data in the following JSON format:
    {
      "targetProduct": {
        "name": "string",
        "price": "string",
        "pricingStrategy": "string",
        "reviewSentiment": "Positive | Neutral | Negative",
        "sentimentDetails": "string",
        "topKeywords": ["string"],
        "strengths": ["string"],
        "weaknesses": ["string"]
      },
      "competitors": [
        {
          "name": "string",
          "price": "string",
          "pricingStrategy": "string",
          "reviewSentiment": "Positive | Neutral | Negative",
          "sentimentDetails": "string",
          "topKeywords": ["string"],
          "strengths": ["string"],
          "weaknesses": ["string"]
        }
      ],
      "marketSummary": "string",
      "gapAnalysis": [
        {
          "competitorMissing": "string",
          "ourOpportunity": "string"
        }
      ],
      "suggestedPricingRange": {
        "min": "string",
        "max": "string",
        "reasoning": "string"
      }
    }
  `;

  try {
    console.log(`Starting competitor analysis for ${platform} with URL: ${productUrl}`);
    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts: [{ text: prompt }] },
      config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetProduct: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.STRING },
              pricingStrategy: { type: Type.STRING },
              reviewSentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
              sentimentDetails: { type: Type.STRING },
              topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "price", "pricingStrategy", "reviewSentiment", "sentimentDetails", "topKeywords", "strengths", "weaknesses"]
          },
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.STRING },
                pricingStrategy: { type: Type.STRING },
                reviewSentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
                sentimentDetails: { type: Type.STRING },
                topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "price", "pricingStrategy", "reviewSentiment", "sentimentDetails", "topKeywords", "strengths", "weaknesses"]
            }
          },
          marketSummary: { type: Type.STRING },
          gapAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                competitorMissing: { type: Type.STRING },
                ourOpportunity: { type: Type.STRING }
              },
              required: ["competitorMissing", "ourOpportunity"]
            }
          },
          suggestedPricingRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.STRING },
              max: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["min", "max", "reasoning"]
          }
        },
        required: ["targetProduct", "competitors", "marketSummary", "gapAnalysis", "suggestedPricingRange"]
      },
      tools: [{ googleSearch: {} }],
    },
  }));

  const text = response.text || "{}";
  console.log("Competitor Analysis Raw Response:", text);
  
  const result = JSON.parse(cleanJsonResponse(text));
  
  // Ensure the result has the required structure to prevent crashes
  if (!result.targetProduct) {
    result.targetProduct = {
      name: "N/A",
      price: "N/A",
      pricingStrategy: "N/A",
      reviewSentiment: "Neutral",
      sentimentDetails: "N/A",
      topKeywords: [],
      strengths: [],
      weaknesses: []
    };
  }
  if (!result.competitors) result.competitors = [];
  if (!result.gapAnalysis) result.gapAnalysis = [];
  if (!result.suggestedPricingRange) {
    result.suggestedPricingRange = { min: "N/A", max: "N/A", reasoning: "N/A" };
  }

  return result;
} catch (error) {
    console.error(`Error analyzing competitor for ${platform}:`, error);
    throw error;
  }
};

export const generateAPlusContent = async (productDetails: string, imageB64?: string): Promise<APlusContentResult> => {
  const contents: any[] = [
    {
      text: `
    You are an expert Amazon A+ Content designer and copywriter specializing in high-conversion EBC (Enhanced Brand Content) for the Indian marketplace (Amazon.in).
    Create a comprehensive, "Advanced Version" of A+ Content strategy for the following product:
    
    Product Details: ${productDetails}
    
    Your goal is to create a visually stunning and persuasive layout that includes:
    1. A detailed Target Audience analysis (who they are, what they care about).
    2. A defined Brand Voice (tone, style, and emotional connection).
    3. 5-7 distinct A+ Content Modules (e.g., Standard Image Header, Standard Four Image & Text, Standard Comparison Chart, Standard Single Left Image, etc.).
    4. For each module, provide:
       - Module Type (e.g., "Standard Image Header")
       - Headline (Catchy and benefit-driven)
       - Body Copy (Persuasive, using standard markdown bullet points where appropriate)
       - Image Prompt (Detailed description for an AI image generator)
       - Conversion Logic (Why this module helps sell the product)
       - ComparisonData (If the module is a comparison chart, provide an array of objects with "productName", "feature1", "feature2", etc.)
    5. A list of SEO-optimized keywords to include in the alt-text.
    6. Professional design and layout tips to maximize conversion, specifically for mobile users.

    CRITICAL: Use "Advanced" modules like comparison charts and technical specification grids.
    The content must be persuasive, highlighting benefits over features.
    
    IMPORTANT: Use simple Indian English words that are easy to understand. Avoid heavy jargon. 
    The content MUST look like it was written by a real person, not a machine. 
    Use a warm, helpful, and honest tone that builds trust with Indian buyers.
    Focus on "Value for Money", "Durability", and "Daily Use" benefits.
    Format information professionally using bullet points or numbered lists where appropriate to improve readability and structure.

    Return the response in JSON format:
    {
      "targetAudience": "...",
      "brandVoice": "...",
      "modules": [
        { 
          "type": "...", 
          "headline": "...", 
          "bodyCopy": "...", 
          "imagePrompt": "...", 
          "conversionLogic": "...",
          "comparisonData": [ { "productName": "...", "feature1": "...", "feature2": "..." } ]
        }
      ],
      "seoKeywords": ["..."],
      "designTips": ["..."],
      "mobileOptimizationTips": ["..."]
    }
  `
    }
  ];

  if (imageB64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageB64
      }
    });
    contents[0].text += "\n\nI have also provided an image of the product. Please use it to better understand the product's features, design, and branding to create more accurate and visually aligned A+ content.";
  }

  try {
    const response = await withRetry(() => generateContent({
      model: "gemini-1.5-flash-latest",
      contents: { parts: contents },
      config: { responseMimeType: "application/json" }
    }));

    return JSON.parse(cleanJsonResponse(response.text));
  } catch (error) {
    console.error('Error generating A+ Content:', error);
    throw error;
  }
};
