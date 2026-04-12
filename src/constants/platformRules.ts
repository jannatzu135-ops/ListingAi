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

export const PLATFORM_RULES: Record<string, PlatformRule> = {
  amazon_in: {
    id: 'amazon_in',
    name: 'Amazon.in',
    outputBlocks: [
      'Bullet Points (up to 5)',
      'Backend Search Terms',
      'Image Brief',
      'Variation Suggestions',
      'A+ Content',
      'Key Highlights',
      'Attributes Summary',
      'Compliance Fields Checklist'
    ],
    hardRules: [
      'Title max default 200 characters (configurable by category)',
      'Recommend shorter mobile-friendly title guidance',
      'Do not allow repeated words more than twice in title except common stop words',
      'Block characters: ! $ ? _ { } ^ ¬ ¦',
      'No HTML, JavaScript, contact info, ads, or promotional spam',
      'No review requests or misleading claims',
      'Bullets should focus on feature + benefit (up to 5). For better readability, start each bullet point with a clear, concise sub-heading in ALL CAPS followed by a colon (e.g., "- DURABILITY: Made with high-quality materials...").',
      'Minimum 1 image required, recommend additional gallery images and video',
      'Key Highlights: Focus on top 3-5 unique selling points for quick scanning',
      'Attributes Summary: Technical specifications, materials, and product dimensions',
      'Compliance Fields Checklist: Mandatory fields for Indian e-commerce (Country of Origin, Manufacturer, Packer, Importer info)'
    ],
    pricingLogic: 'Show estimated or live market average. Recommend aggressive, balanced, premium price points. Prioritize CTR + conversion + competitiveness. Show warning if price confidence is low.',
    unsupported: ['Emojis', 'Decorative symbols', 'HTML formatting'],
    titleLimit: 200,
    descriptionLimit: 2000
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart',
    outputBlocks: [
      'Key Highlights',
      'Attributes Summary',
      'Image Brief',
      'Compliance Fields Checklist',
      'Search Keywords'
    ],
    hardRules: [
      'Treat listing attributes as dynamic and config-driven',
      'HSN is required',
      'Include legal-metrology related fields when applicable',
      'No unsupported rich-enhanced content modules',
      'Validate missing package data, category attributes, and compliance fields',
      'Generate a comprehensive list of 15-20 highly accurate, high-volume search keywords relevant to the Indian market',
      'CRITICAL: For "Key Highlights", "Attributes Summary", and "Compliance Fields Checklist", each attribute MUST be on its own line using a standard markdown bullet point (e.g., "- Attribute: Value"). Do NOT join them with dashes or put them on the same line.'
    ],
    pricingLogic: 'Show platform-specific average or estimated price band. Favor value positioning and conversion pricing. Include discount-friendly recommendation. Show best sweet spot price for visibility and orders.',
    unsupported: ['A+ content', 'Etsy-style tags', 'Website SEO meta title blocks'],
    titleLimit: 150,
    descriptionLimit: 2000
  },
  ebay: {
    id: 'ebay',
    name: 'eBay',
    outputBlocks: [
      'Condition Summary',
      'Item Specifics',
      'Shipping Summary',
      'Returns Summary',
      'Photo Checklist'
    ],
    hardRules: [
      'Title max 80 characters',
      'Condition must match title, specifics, and description',
      'Fill item specifics completely',
      'Require photo reminder: at least one image, minimum size guidance, no borders/text/watermarks'
    ],
    pricingLogic: 'Show average/estimated listing price. Compare fixed-price competitiveness. Recommend price with shipping awareness. Highlight value if offering returns or faster handling.',
    unsupported: ['Amazon bullets as a required structure', 'A+ content', 'Website SEO meta fields'],
    titleLimit: 80,
    descriptionLimit: 5000
  },
  etsy: {
    id: 'etsy',
    name: 'Etsy',
    outputBlocks: [
      '13 Tags',
      'Attributes',
      'First Photo Brief'
    ],
    hardRules: [
      'Generate readable titles, not keyword-stuffed',
      'Generate all 13 tags (varied and relevant)',
      'Fill all relevant attributes',
      'Use most specific category possible',
      'Lead title with clearest description',
      'First photo matters significantly'
    ],
    pricingLogic: 'Show estimated or live average handmade/fashion/gift positioning price. Recommend pricing based on uniqueness, quality cues, and perceived value. Include aggressive, balanced, premium pricing.',
    unsupported: ['A+ content', 'Backend search terms block', 'Meta title / meta description block', 'Emoji stuffing'],
    titleLimit: 140,
    descriptionLimit: 5000
  },
  meesho: {
    id: 'meesho',
    name: 'Meesho',
    outputBlocks: [
      'Product Attributes Checklist',
      'Size & Fit Details',
      'Material & Care',
      'Price Positioning Note',
      'Image Brief',
      'Search Keywords'
    ],
    hardRules: [
      'Keep output plain, simple, and easy to read for a broad audience.',
      'Prioritize clarity and value-for-money messaging.',
      'No unsupported premium-content modules or HTML.',
      'CRITICAL: For "Product Attributes Checklist", include mandatory Meesho fields: Fabric, Color, Pattern, Net Quantity (N), Occasion, and Print Type.',
      'For Fashion: Include Sleeve Length, Neck, Length, Waistband, and Closure if applicable.',
      'For Home/Other: Include Material, Dimensions, and Usage instructions.',
      'Size & Fit: List all available sizes (e.g., S, M, L, XL) and their corresponding measurements if possible.',
      'Material & Care: Provide clear washing or maintenance instructions.',
      'Each attribute MUST be on its own line using a standard markdown bullet point (e.g., "- Fabric: Cotton").'
    ],
    pricingLogic: 'Emphasize value pricing. Show competitive low-to-mid price band. Include order-focused price suggestion. Show bundle/pack-value suggestion if relevant. Meesho users are highly price-sensitive.',
    unsupported: ['A+ content', 'Meta title/meta description', 'Etsy tags block', 'eBay item specifics block format', 'HTML formatting'],
    titleLimit: 100,
    descriptionLimit: 1000
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    outputBlocks: [
      'SEO Title',
      'Meta Description',
      'Image Alt Text',
      'Collection Blurb',
      'Internal Link Suggestions',
      'URL Handle Suggestion'
    ],
    hardRules: [
      'SEO title target around 60 characters',
      'Meta description target around 160 characters',
      'Product title and H1 should be unique and readable',
      'Alt text should be concise and descriptive',
      'Clean URL handle',
      'Support internal linking suggestions'
    ],
    pricingLogic: 'Show price architecture for D2C. Include compare-at pricing suggestion if enabled. Show entry, balanced, premium price options. Explain perceived value and margin positioning.',
    unsupported: ['Amazon backend search terms', 'Etsy 13 tags', 'eBay condition block', 'Amazon A+ content block'],
    titleLimit: 70,
    descriptionLimit: 2000
  },
  myntra: {
    id: 'myntra',
    name: 'Myntra',
    outputBlocks: [
      'Attribute Grid',
      'Variant Naming',
      'Size / Measurement Summary',
      'Wash Care',
      'Image Brief',
      'Pricing / Discount Validation Notes'
    ],
    hardRules: [
      'Treat Myntra as structured fashion catalog mode',
      'Prioritize attributes and variant data',
      'Short clean product copy',
      'Validate price / discount format',
      'Validate variant completeness',
      'Validate structured fashion fields'
    ],
    pricingLogic: 'Show fashion-platform price positioning. Recommend MRP, selling price, and discount-friendly price logic. Support style-level competitive pricing.',
    unsupported: ['Amazon A+ content', 'Etsy tags', 'Website meta description block'],
    titleLimit: 150,
    descriptionLimit: 2000
  },
  website: {
    id: 'website',
    name: 'Website / Google SEO',
    outputBlocks: [
      'Key Highlights',
      'Attributes Summary'
    ],
    hardRules: [
      'Focus on keyword-rich but readable titles',
      'Key Highlights: Focus on top 3-5 unique selling points',
      'Attributes Summary: Technical specifications and product dimensions',
      'Product Description: Detailed, persuasive, and SEO-optimized. IMPORTANT: Do NOT include this in platformSpecificBlocks as it is handled separately.',
      'Structured data (Schema.org) is recommended'
    ],
    pricingLogic: 'Focus on market competitiveness and psychological pricing. Recommend price points based on search intent and competitor landscape.',
    unsupported: ['Amazon backend search terms', 'Etsy tags', 'eBay condition block', 'Product Description in blocks'],
    titleLimit: 70,
    descriptionLimit: 5000
  }
};

export const GLOBAL_RULES = [
  'HUMAN-WRITTEN STYLE: All information provided must look 100% like it was written by a professional human copywriter. Avoid typical AI patterns, repetitive sentence structures, and generic "AI-sounding" phrases (e.g., "In the fast-paced world", "Unlock your potential", "Elevate your experience"). Use simple, direct, and persuasive English.',
  'SEO OPTIMIZATION: Every listing must be highly SEO optimized. Naturally integrate high-volume search keywords into the title, bullet points, and description without keyword stuffing. Focus on search intent and ranking factors relevant to the specific platform.',
  'Format information professionally using bullet points or numbered lists where appropriate to improve readability and structure.',
  'When using bullet points, ALWAYS use standard markdown bullet points (e.g., `- Point 1`). Do NOT use custom symbols like arrows. The system will automatically style them as arrows.',
  'CRITICAL: Ensure every new point in a list starts on its own new line. Never join multiple points or attributes with dashes or separators on the same line.',
  'Default to plain, readable text',
  'Do not use emojis by default',
  'Do not generate decorative symbols by default',
  'Do not generate HTML unless explicitly supported',
  'Do not mix SEO metadata from website into marketplace listings',
  'Do not mix Etsy tags logic into Amazon or eBay',
  'Category accuracy comes before copy quality',
  'Structured fields come before long-form copy',
  'Output must be practical, copy-ready, and compliant',
  'ALWAYS generate a comprehensive list of 15-20 highly accurate, high-volume search keywords in the `keywords` array for every platform.'
];

export const STEP_BY_STEP_WORKFLOW = [
  'Step 5: Add platform-supported identifiers',
  'Step 6: Create title according to that platform’s rules',
  'Step 7: Add structured blocks required by that platform',
  'Step 8: Add description according to platform style',
  'Step 9: Check image requirements',
  'Step 10: Review pricing strategy',
  'Step 11: Check pricing, stock, shipping, returns where relevant',
  'Step 12: Run compliance validation',
  'Step 13: Copy and publish after final review in seller dashboard'
];
