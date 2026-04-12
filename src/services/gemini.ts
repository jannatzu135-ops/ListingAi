import { GoogleGenAI, Type } from "@google/genai";
import { Platform, ProductMasterInput, ProductImageInput, PlatformOutput, PricingStrategy } from "../types";
import { PLATFORM_RULES } from "../constants/platforms";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

  const parts = [
    { text: prompt },
    {
      inlineData: {
        data: image.base64!,
        mimeType: image.mimeType!
      }
    }
  ];

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
    }
  });

  const responseText = result.text || "{}";
  return JSON.parse(responseText) as PlatformOutput;
}
