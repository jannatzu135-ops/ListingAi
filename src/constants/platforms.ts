import { PlatformRuleConfig } from "../types";

export const PLATFORM_RULES: Record<string, PlatformRuleConfig> = {
  AMAZON: {
    id: 'AMAZON',
    name: 'Amazon.in',
    icon: 'ShoppingCart',
    supportedBlocks: [
      'Bullet Points',
      'Backend Search Terms',
      'Image Brief',
      'Variation Suggestions',
      'A+ Content'
    ],
    hardRules: {
      titleMaxLen: 200,
      prohibitedChars: ['!', '$', '?', '_', '{', '}', '^', '¬', '¦'],
      noHtml: true,
      noEmoji: true,
      descriptionRules: 'No HTML, no contact info, no ads, no review requests.',
      imageRules: 'Minimum 1 image required, recommend white background for main image.'
    },
    pricingLogic: 'Prioritize CTR + conversion + competitiveness. Show aggressive, balanced, premium points.',
    unsupported: ['Emojis', 'Decorative Symbols', 'HTML Formatting'],
    rankingTips: [
      'Improves listing completeness',
      'Improves search matching',
      'Improves buyer clarity'
    ],
    workflow: [
      'Add platform-supported identifiers',
      'Create title (max 200 chars)',
      'Add up to 5 bullet points (Feature + Benefit)',
      'Add backend search terms',
      'Review pricing strategy'
    ]
  },
  FLIPKART: {
    id: 'FLIPKART',
    name: 'Flipkart',
    icon: 'ShoppingBag',
    supportedBlocks: [
      'Key Highlights',
      'Attributes Summary',
      'Image Brief',
      'Compliance Fields Checklist'
    ],
    hardRules: {
      titleMaxLen: 150,
      noHtml: true,
      noEmoji: true,
      descriptionRules: 'Focus on value and utility.',
    },
    pricingLogic: 'Favor value positioning and conversion pricing. Include discount-friendly recommendation.',
    unsupported: ['A+ Content', 'Etsy-style tags', 'Website SEO meta titles'],
    rankingTips: [
      'Improves structured relevance',
      'Improves conversion readiness'
    ],
    workflow: [
      'HSN is required',
      'Include legal-metrology fields',
      'Validate package data',
      'Check Flipkart-specific attributes'
    ]
  },
  EBAY: {
    id: 'EBAY',
    name: 'eBay',
    icon: 'Tag',
    supportedBlocks: [
      'Condition Summary',
      'Item Specifics',
      'Shipping Summary',
      'Returns Summary',
      'Photo Checklist'
    ],
    hardRules: {
      titleMaxLen: 80,
      noHtml: false,
      noEmoji: true,
      descriptionRules: 'Condition must match title and specifics.',
      imageRules: 'At least one image, no borders/text/watermarks.'
    },
    pricingLogic: 'Compare fixed-price competitiveness. Recommend price with shipping awareness.',
    unsupported: ['Amazon Bullets', 'A+ Content', 'Website SEO meta fields'],
    rankingTips: [
      'Improves listing quality',
      'Reduces platform-format mistakes'
    ],
    workflow: [
      'Title max 80 characters',
      'Fill item specifics completely',
      'Condition must be accurate',
      'Review shipping and returns'
    ]
  },
  ETSY: {
    id: 'ETSY',
    name: 'Etsy',
    icon: 'Heart',
    supportedBlocks: [
      '13 Tags',
      'Attributes Summary',
      'First Photo Brief'
    ],
    hardRules: {
      titleMaxLen: 140,
      noHtml: true,
      noEmoji: true,
      descriptionRules: 'Lead with the clearest description.',
    },
    pricingLogic: 'Recommend based on uniqueness and perceived value. Handmade positioning notes.',
    unsupported: ['A+ Content', 'Backend search terms', 'Meta title/description', 'Emoji stuffing'],
    rankingTips: [
      'Improves discoverability',
      'Improves buyer clarity'
    ],
    workflow: [
      'Generate readable title',
      'Generate all 13 varied tags',
      'Fill all relevant attributes',
      'Use most specific category'
    ]
  },
  MEESHO: {
    id: 'MEESHO',
    name: 'Meesho',
    icon: 'Package',
    supportedBlocks: [
      'Attributes Summary',
      'Price Positioning Note',
      'Image Brief'
    ],
    hardRules: {
      titleMaxLen: 100,
      noHtml: true,
      noEmoji: true,
    },
    pricingLogic: 'Emphasize value pricing. Low-to-mid price band focus.',
    unsupported: ['A+ Content', 'Meta title/description', 'Etsy tags', 'eBay item specifics'],
    rankingTips: [
      'Improves price competitiveness',
      'Improves conversion potential'
    ],
    workflow: [
      'Keep output plain and simple',
      'Check GSTIN and PAN requirements',
      'Focus on value for money'
    ]
  },
  SHOPIFY: {
    id: 'SHOPIFY',
    name: 'Shopify',
    icon: 'Store',
    supportedBlocks: [
      'SEO Title',
      'Meta Description',
      'Image Alt Text',
      'Collection Blurb',
      'Internal Link Suggestions',
      'URL Handle Suggestion'
    ],
    hardRules: {
      titleMaxLen: 70,
      noHtml: false,
      noEmoji: false,
      descriptionRules: 'Unique and readable description.',
    },
    pricingLogic: 'Price architecture for D2C. Include compare-at pricing suggestion.',
    unsupported: ['Amazon backend search terms', 'Etsy 13 tags', 'eBay condition block', 'Amazon A+ content'],
    rankingTips: [
      'Improves search matching',
      'Improves conversion potential'
    ],
    workflow: [
      'SEO title target ~60 chars',
      'Meta description ~160 chars',
      'Clean URL handle',
      'Descriptive alt text'
    ]
  },
  MYNTRA: {
    id: 'MYNTRA',
    name: 'Myntra',
    icon: 'Shirt',
    supportedBlocks: [
      'Attribute Grid',
      'Variant Naming',
      'Size / Measurement Summary',
      'Wash Care',
      'Image Brief'
    ],
    hardRules: {
      titleMaxLen: 100,
      noHtml: true,
      noEmoji: true,
    },
    pricingLogic: 'Fashion-platform price positioning. MRP vs Selling Price logic.',
    unsupported: ['Amazon A+ content', 'Etsy tags', 'Website meta description'],
    rankingTips: [
      'Improves structured relevance',
      'Improves listing completeness'
    ],
    workflow: [
      'Prioritize attributes and variant data',
      'Validate wash care instructions',
      'Check size measurement summary'
    ]
  },
  GOOGLE_SEO: {
    id: 'GOOGLE_SEO',
    name: 'Google SEO',
    icon: 'Search',
    supportedBlocks: [
      'Key Highlights',
      'Attributes Summary'
    ],
    hardRules: {
      titleMaxLen: 60,
      noHtml: true,
      noEmoji: false,
      descriptionRules: 'Detailed, persuasive, and SEO-optimized.',
    },
    pricingLogic: 'Competitive price bands for Google Shopping.',
    unsupported: ['Marketplace-specific blocks'],
    rankingTips: [
      'Improves search matching',
      'Improves discoverability'
    ],
    workflow: [
      'Target 60 chars for SEO title',
      'Add structured data (JSON-LD)',
      'Optimize for Merchant Center'
    ]
  }
};
