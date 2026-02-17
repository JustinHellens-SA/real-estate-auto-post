/**
 * Enhanced AI Caption Generator - LRE Marketing OS
 * 
 * Combines:
 * - Local Real Estate SA brand guidelines
 * - Agent personality preferences
 * - Content memory / historical performance
 * - Suburb/price/property-type learnings
 */

import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PropertyData {
  address: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  description?: string;
  propertyType?: string; // apartment, house, townhouse, etc.
  suburb?: string;
  propertyFeatures?: string[];
  listingId?: string;
  heroImageUrl?: string;
}

export interface AgentPersonality {
  name: string;
  phone?: string;
  tonePreference: 'professional' | 'casual' | 'warm' | 'luxury' | 'energetic';
  emojiLevel: 'none' | 'minimal' | 'moderate' | 'enthusiastic';
  hashtagPack?: string[]; // Preferred hashtags
  platformPriority?: 'instagram' | 'facebook' | 'both';
  callToActionStyle?: string; // Custom CTA signature
}

export interface ContentInsights {
  topPerformingHookStyle?: string; // e.g., "lifestyle", "investment", "urgency"
  avgEngagementForArea?: number;
  recommendation?: string;
}

/**
 * Generate AI captions with agent personality + historical learnings
 */
export async function generateEnhancedCaptions(
  propertyData: PropertyData,
  agentPersonality: AgentPersonality,
  includeInsights: boolean = true
): Promise<Array<{ caption: string; hashtags: string; hookStyle: string }>> {
  
  // Fetch content insights if available
  let insights: ContentInsights | null = null;
  if (includeInsights && propertyData.suburb) {
    insights = await getContentInsights(
      propertyData.suburb,
      propertyData.propertyType,
      getPriceRange(propertyData.price)
    );
  }

  const systemPrompt = buildSystemPrompt(agentPersonality, insights);
  const userPrompt = buildUserPrompt(propertyData, agentPersonality);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.85,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content generated');

    const parsed = JSON.parse(content);
    return parsed.captions || generateFallbackCaptions(propertyData, agentPersonality);
  } catch (error) {
    console.error('OpenAI caption generation error:', error);
    return generateFallbackCaptions(propertyData, agentPersonality);
  }
}

/**
 * Build system prompt that incorporates agent personality
 */
function buildSystemPrompt(
  agent: AgentPersonality,
  insights: ContentInsights | null
): string {
  const emojiGuidance = {
    none: 'Do NOT use any emojis.',
    minimal: 'Use 1-2 emojis maximum, only in bullet points.',
    moderate: 'Use emojis strategically in bullet points and sparingly in text.',
    enthusiastic: 'Use emojis liberally to create energy and visual appeal.',
  };

  const toneGuidance = {
    professional: 'sophisticated, elegant, and corporate tone',
    casual: 'friendly, approachable, conversational tone',
    warm: 'personal, heartfelt, and inviting tone',
    luxury: 'premium, exclusive, high-end tone',
    energetic: 'exciting, dynamic, and enthusiastic tone',
  };

  let systemPrompt = `You are an expert real estate social media copywriter for Local Real Estate SA, a premium South African real estate agency.

BRAND VOICE GUIDELINES:
- Always include "EXCLUSIVE TO LOCAL REAL ESTATE! ✨" near the start
- End with the tagline: "𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽"
- Sign off with "Connecting. You."
- Use bold Unicode for property titles: 𝐏𝐫𝐨𝐩𝐞𝐫𝐭𝐲 𝐍𝐚𝐦𝐞
- Focus on lifestyle, space, and integrated living
- Highlight views, outdoor areas, entertaining spaces

AGENT PERSONALITY (${agent.name}):
- Tone: ${toneGuidance[agent.tonePreference]}
- Emoji usage: ${emojiGuidance[agent.emojiLevel]}
${agent.callToActionStyle ? `- Signature CTA: ${agent.callToActionStyle}` : '- CTA: Standard "Contact [name] for viewing"'}
${agent.platformPriority === 'instagram' ? '- Optimize for Instagram: Visual storytelling, lifestyle hooks' : ''}
${agent.platformPriority === 'facebook' ? '- Optimize for Facebook: Detailed information, family focus' : ''}`;

  if (insights?.recommendation) {
    systemPrompt += `\n\n📊 PERFORMANCE INSIGHT:\n${insights.recommendation}\nApply this learning to your caption strategy.`;
  }

  return systemPrompt;
}

/**
 * Build user prompt with property details
 */
function buildUserPrompt(
  property: PropertyData,
  agent: AgentPersonality
): string {
  const {
    address,
    price,
    bedrooms,
    bathrooms,
    sqft,
    description,
    propertyType,
    suburb,
    propertyFeatures,
  } = property;

  const location = suburb || address.split(',')[0];
  const formattedPrice = price || 'Contact for pricing';

  return `Generate 3 distinct Instagram/Facebook caption variations for this property.

PROPERTY DETAILS:
- Location: ${address}
- Suburb: ${location}
- Type: ${propertyType || 'Property'}
- Price: ${formattedPrice}
- Bedrooms: ${bedrooms || 'TBD'}
- Bathrooms: ${bathrooms || 'TBD'}
- Floor Size: ${sqft || 'Spacious'}
${propertyFeatures?.length ? `- Features: ${propertyFeatures.join(', ')}` : ''}
${description ? `- Description: ${description.substring(0, 300)}` : ''}

REQUIRED FORMAT FOR EACH CAPTION:
𝐏𝐫𝐨𝐩𝐞𝐫𝐭𝐲 𝐓𝐢𝐭𝐥𝐞 | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

[2-3 paragraphs of compelling property description matching agent's tone]

🛌 ${bedrooms || 'X'} Bedrooms
🛁 ${bathrooms || 'X'} Bathrooms
🏠 ${sqft || 'XXX'} m² Floor Size
[2-3 additional feature bullets with emojis based on property features]

👉 View full listing: Contact ${agent.name} ${agent.phone ? `on ${agent.phone}` : 'for details'}

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.

GENERATE 3 VARIATIONS WITH DIFFERENT HOOK STYLES:
1. Lifestyle Hook - Emphasize how it feels to live there, emotional appeal
2. Investment Hook - Focus on value, location benefits, growth potential  
3. Feature Hook - Lead with standout property features and quality

Return as JSON:
{
  "captions": [
    {
      "caption": "full formatted post text",
      "hashtags": "#LiveLocal #${location.replace(/\s+/g, '')} ${agent.hashtagPack?.slice(0, 3).map(h => h.startsWith('#') ? h : `#${h}`).join(' ') || ''}",
      "hookStyle": "lifestyle"
    },
    { ... }
  ]
}`;
}

/**
 * Get content insights from historical performance
 */
async function getContentInsights(
  suburb?: string,
  propertyType?: string,
  priceRange?: string
): Promise<ContentInsights | null> {
  try {
    // Look for insights pattern matching this property context
    const pattern = await prisma.insightPattern.findFirst({
      where: {
        suburb: suburb || undefined,
        propertyType: propertyType || undefined,
        priceRange: priceRange || undefined,
      },
      orderBy: {
        confidence: 'desc',
      },
    });

    if (pattern) {
      return {
        topPerformingHookStyle: pattern.hookStyle || undefined,
        avgEngagementForArea: pattern.avgEngagementScore,
        recommendation: pattern.recommendation,
      };
    }

    // Fallback: Get general performance for this suburb
    const memories = await prisma.contentMemory.findMany({
      where: {
        suburb: suburb || undefined,
      },
      orderBy: {
        engagementScore: 'desc',
      },
      take: 5,
    });

    if (memories.length > 0) {
      const avgEngagement =
        memories.reduce((sum, m) => sum + m.engagementScore, 0) / memories.length;
      const topHook = memories[0].hookStyle || undefined;

      return {
        topPerformingHookStyle: topHook,
        avgEngagementForArea: avgEngagement,
        recommendation: topHook
          ? `In ${suburb}, ${topHook} hooks have performed well recently.`
          : undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching content insights:', error);
    return null;
  }
}

/**
 * Categorize price into ranges for pattern analysis
 */
function getPriceRange(price?: string): string | undefined {
  if (!price) return undefined;

  // Extract numeric value from price string
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  
  if (isNaN(numericPrice)) return undefined;

  // Assuming South African Rand (R)
  if (numericPrice < 1000000) return 'under_1m';
  if (numericPrice < 3500000) return '1m_3.5m';
  if (numericPrice < 5000000) return '3.5m_5m';
  return 'over_5m';
}

/**
 * Fallback captions if AI fails
 */
function generateFallbackCaptions(
  property: PropertyData,
  agent: AgentPersonality
): Array<{ caption: string; hashtags: string; hookStyle: string }> {
  const { address, price, bedrooms, bathrooms, sqft, propertyType } = property;
  const location = property.suburb || address.split(',')[0];
  const formattedPrice = price || 'Contact for pricing';

  const baseHashtags = `#LiveLocal #${location.replace(/\s+/g, '')} #RealEstate`;

  return [
    {
      caption: `𝐄𝐥𝐞𝐠𝐚𝐧𝐭 ${propertyType || 'Property'} | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

Experience refined living in this beautiful ${location} residence. Spacious interiors, quality finishes, and thoughtful design create the perfect sanctuary for modern family living.

🛌 ${bedrooms || 'Multiple'} Bedrooms
🛁 ${bathrooms || 'Multiple'} Bathrooms
🏠 ${sqft || 'Spacious'} m²
🌟 Premium Finishes

👉 View full listing: Contact ${agent.name} ${agent.phone ? `on ${agent.phone}` : 'for details'}

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.`,
      hashtags: baseHashtags,
      hookStyle: 'lifestyle',
    },
    {
      caption: `𝐏𝐫𝐢𝐦𝐞 ${location} 𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭 | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

Smart investors know value when they see it. This ${bedrooms}-bed property in sought-after ${location} offers exceptional returns and lifestyle benefits in one of the area's most desirable locations.

🛌 ${bedrooms || 'Multiple'} Bedrooms  
🛁 ${bathrooms || 'Multiple'} Bathrooms
🏠 ${sqft || 'Spacious'} m²
📈 Strong Growth Area

👉 View full listing: Contact ${agent.name} ${agent.phone ? `on ${agent.phone}` : 'for details'}

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.`,
      hashtags: baseHashtags,
      hookStyle: 'investment',
    },
    {
      caption: `𝐒𝐭𝐮𝐧𝐧𝐢𝐧𝐠 ${bedrooms}-𝐁𝐞𝐝 ${propertyType || 'Home'} | ${formattedPrice}

EXCLUSIVE TO LOCAL REAL ESTATE! ✨

Discover this exceptional ${location} property featuring spacious living areas, modern finishes, and premium fixtures throughout. Every detail has been carefully considered to create the ultimate living experience.

🛌 ${bedrooms || 'Multiple'} Bedrooms
🛁 ${bathrooms || 'Multiple'} Bathrooms
🏠 ${sqft || 'Generous'} m² Floor Size
✨ Move-in Ready

👉 View full listing: Contact ${agent.name} ${agent.phone ? `on ${agent.phone}` : 'for details'}

𝙈𝘼𝙆𝙀 𝙔𝙊𝙐𝙍 𝙉𝙀𝙓𝙏 𝙈𝙊𝙑𝙀 𝘼 𝙇𝙊𝘾𝘼𝙇 𝙊𝙉𝙀 🤙🏽

Connecting. You.`,
      hashtags: baseHashtags,
      hookStyle: 'feature',
    },
  ];
}

/**
 * Helper to fetch agent personality from database
 */
export async function getAgentPersonality(agentId: string): Promise<AgentPersonality> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  return {
    name: agent.name,
    phone: agent.phone,
    tonePreference: agent.tonePreference as any,
    emojiLevel: agent.emojiLevel as any,
    hashtagPack: agent.hashtagPack ? JSON.parse(agent.hashtagPack) : undefined,
    platformPriority: agent.platformPriority as any,
    callToActionStyle: agent.callToActionStyle || undefined,
  };
}
