import { GoogleGenerativeAI } from "@google/generative-ai";
import { Platform, ProductMasterInput, ProductImageInput, PlatformOutput, PricingStrategy } from "../types";
import { PLATFORM_RULES } from "../constants/platforms";

const getApiKey = () => {
  try {
    const key = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || "";
    return typeof key === 'string' ? key.trim() : "";
  } catch (e) {
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  }
};

const apiKey = getApiKey();
let genAI: GoogleGenerativeAI | null = null;
if (apiKey && apiKey.length > 10) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    // Silent catch
  }
}

export async function analyzeAndGenerate(
  platform: Platform,
  image: ProductImageInput,
  userInput: ProductMasterInput
): Promise<PlatformOutput> {
  const rules = PLATFORM_RULES[platform];

  const prompt = `
    You are an expert e-commerce listing specialist.
    Analyze the provided product image and generate a high-converting, compliant listing for the ${rules.name} platform.

    PLATFORM RULES:
    ${JSON.stringify(rules, null, 2)}

    USER INPUT:
    ${JSON.stringify(userInput, null, 2)}

    GENERATION FLOW:
    1. Detect category and subcategory.
    2. Extract visible product data (materials, quality, features).
    3. Generate only supported blocks for ${platform}.
    4. Generate pricing strategy (Aggressive, Balanced, Premium) based on category and quality.
    5. Run compliance validation and remove unsupported content (no emojis/HTML if restricted).

    OUTPUT FORMAT:
    Return a JSON object matching this structure:
    {
      "blocks": [
        { "id": "title", "label": "Product Title", "content": "...", "supported": true },
        ...
      ],
      "pricing": {
        "mode": "ESTIMATED",
        "confidence": "MEDIUM",
        "sourceLabel": "Estimated from Image + Category",
        "marketRange": { "min": 0, "max": 0, "average": 0 },
        "recommendedPrice": 0,
        "bands": {
          "aggressive": { "label": "Aggressive", "price": 0, "description": "...", "strategy": "..." },
          "balanced": { "label": "Balanced", "price": 0, "description": "...", "strategy": "..." },
          "premium": { "label": "Premium", "price": 0, "description": "...", "strategy": "..." }
        },
        "explanation": "...",
        "notes": ["..."]
      },
      "compliance": {
        "status": "COMPLIANT",
        "issues": []
      },
      "rankingSuggestions": ["..."],
      "whyItHelps": "..."
    }

    IMPORTANT:
    - No false guarantees (rank #1, sales).
    - Use language like "improve discoverability", "improve conversion potential".
    - Plain text only unless HTML is supported.
    - No emojis unless supported.
    - Pricing must be realistic based on the product type.
  `;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        data: image.base64!,
        mimeType: image.mimeType!
      }
    }
  ];

  if (!genAI) {
    throw new Error("Gemini AI is not initialized. Please check your API key.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts }] as any,
    generationConfig: {
      responseMimeType: "application/json",
    }
  } as any);

  const response = await result.response;
  const responseText = response.text() || "{}";
  return JSON.parse(responseText) as PlatformOutput;
}
