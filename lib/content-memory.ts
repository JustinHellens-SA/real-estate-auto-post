/**
 * Content Memory & Learning System - LRE Marketing OS
 * 
 * Tracks post performance and builds learnings about:
 * - What hook styles work best per suburb/price/property type
 * - Agent-specific performance patterns
 * - Engagement trends over time
 */

import { prisma } from './prisma';

export interface EngagementData {
  likes: number;
  comments: number;
  shares: number;
  reach?: number;
  clicks?: number;
  inquiries?: number;
}

export interface ContentAnalysis {
  hookStyle?: 'lifestyle' | 'investment' | 'feature' | 'urgency' | 'question';
  captionLength?: number;
  emojiCount?: number;
  hashtagCount?: number;
}

/**
 * Calculate engagement score from raw metrics
 * Weighted formula:
 * - Comments are worth more than likes (indicate deeper engagement)
 * - Shares are valuable (organic reach)
 * - Inquiries are gold (actual leads)
 */
export function calculateEngagementScore(data: EngagementData): number {
  const {
    likes = 0,
    comments = 0,
    shares = 0,
    clicks = 0,
    inquiries = 0,
  } = data;

  return (
    likes * 1 +
    comments * 3 +
    shares * 5 +
    clicks * 2 +
    inquiries * 50
  );
}

/**
 * Analyze caption to extract characteristics
 */
export function analyzeCaptionContent(caption: string): ContentAnalysis {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const hashtagRegex = /#\w+/g;

  const emojiCount = (caption.match(emojiRegex) || []).length;
  const hashtagCount = (caption.match(hashtagRegex) || []).length;
  const captionLength = caption.length;

  // Detect hook style (simple keyword detection - could be enhanced with AI)
  let hookStyle: ContentAnalysis['hookStyle'];
  const lowerCaption = caption.toLowerCase();

  if (
    lowerCaption.includes('lifestyle') ||
    lowerCaption.includes('imagine') ||
    lowerCaption.includes('experience')
  ) {
    hookStyle = 'lifestyle';
  } else if (
    lowerCaption.includes('investment') ||
    lowerCaption.includes('value') ||
    lowerCaption.includes('growth')
  ) {
    hookStyle = 'investment';
  } else if (lowerCaption.includes('?')) {
    hookStyle = 'question';
  } else if (
    lowerCaption.includes('just listed') ||
    lowerCaption.includes('new listing') ||
    lowerCaption.includes('exclusive')
  ) {
    hookStyle = 'urgency';
  } else {
    hookStyle = 'feature';
  }

  return {
    hookStyle,
    captionLength,
    emojiCount,
    hashtagCount,
  };
}

/**
 * Create or update content memory for a post
 */
export async function recordContentMemory(
  postId: string,
  engagementData: EngagementData,
  contentAnalysis?: ContentAnalysis
): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { agent: true },
  });

  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }

  const engagementScore = calculateEngagementScore(engagementData);

  // Auto-analyze caption if not provided
  let analysis = contentAnalysis;
  if (!analysis && post.selectedCaption) {
    analysis = analyzeCaptionContent(post.selectedCaption);
  }

  // Upsert content memory
  await prisma.contentMemory.upsert({
    where: { postId },
    create: {
      postId,
      agentId: post.agentId || undefined,
      listingId: post.listingId || undefined,
      suburb: post.suburb || undefined,
      propertyType: post.propertyType || undefined,
      priceRange: post.priceRange || undefined,
      engagementScore,
      likes: engagementData.likes,
      comments: engagementData.comments,
      shares: engagementData.shares,
      reach: engagementData.reach,
      clicks: engagementData.clicks,
      inquiries: engagementData.inquiries || 0,
      hookStyle: analysis?.hookStyle,
      captionLength: analysis?.captionLength,
      emojiCount: analysis?.emojiCount,
      hashtagCount: analysis?.hashtagCount,
    },
    update: {
      engagementScore,
      likes: engagementData.likes,
      comments: engagementData.comments,
      shares: engagementData.shares,
      reach: engagementData.reach,
      clicks: engagementData.clicks,
      inquiries: engagementData.inquiries || 0,
      hookStyle: analysis?.hookStyle,
      captionLength: analysis?.captionLength,
      emojiCount: analysis?.emojiCount,
      hashtagCount: analysis?.hashtagCount,
    },
  });

  // Trigger learning pattern update (async, non-blocking)
  updateLearningPatterns(post.suburb, post.propertyType, post.priceRange).catch(
    (err) => console.error('Failed to update learning patterns:', err)
  );
}

/**
 * Update or create insight patterns based on accumulated data
 */
async function updateLearningPatterns(
  suburb?: string | null,
  propertyType?: string | null,
  priceRange?: string | null
): Promise<void> {
  if (!suburb && !propertyType && !priceRange) return;

  // Get all content memories matching this context
  const memories = await prisma.contentMemory.findMany({
    where: {
      suburb: suburb || undefined,
      propertyType: propertyType || undefined,
      priceRange: priceRange || undefined,
    },
    orderBy: {
      engagementScore: 'desc',
    },
  });

  if (memories.length < 3) {
    // Need at least 3 samples to establish a pattern
    return;
  }

  // Calculate average engagement
  const avgEngagement =
    memories.reduce((sum, m) => sum + m.engagementScore, 0) / memories.length;

  // Find the most common high-performing hook style
  const hookStylePerformance: Record<string, { count: number; avgScore: number }> = {};

  memories.forEach((memory) => {
    if (memory.hookStyle) {
      if (!hookStylePerformance[memory.hookStyle]) {
        hookStylePerformance[memory.hookStyle] = { count: 0, avgScore: 0 };
      }
      hookStylePerformance[memory.hookStyle].count += 1;
      hookStylePerformance[memory.hookStyle].avgScore += memory.engagementScore;
    }
  });

  // Calculate averages and find best performer
  let bestHookStyle: string | undefined;
  let bestScore = 0;

  Object.entries(hookStylePerformance).forEach(([style, data]) => {
    const avg = data.avgScore / data.count;
    if (avg > bestScore && data.count >= 2) {
      bestScore = avg;
      bestHookStyle = style;
    }
  });

  const bestPost = memories[0];

  // Calculate confidence based on sample size and consistency
  const confidence = Math.min(
    (memories.length / 10) * 0.5 + // More samples = higher confidence
      (bestScore > avgEngagement * 1.2 ? 0.3 : 0.1) + // Strong performer = higher confidence
      (hookStylePerformance[bestHookStyle!]?.count / memories.length) * 0.2, // Consistency = higher confidence
    1.0
  );

  const recommendation = generateRecommendation(
    suburb,
    propertyType,
    priceRange,
    bestHookStyle,
    avgEngagement
  );

  // Upsert insight pattern
  await prisma.insightPattern.upsert({
    where: {
      suburb_priceRange_propertyType_hookStyle: {
        suburb: suburb || '',
        priceRange: priceRange || '',
        propertyType: propertyType || '',
        hookStyle: bestHookStyle || '',
      },
    },
    create: {
      suburb: suburb ?? undefined,
      propertyType: propertyType ?? undefined,
      priceRange: priceRange ?? undefined,
      hookStyle: bestHookStyle ?? undefined,
      avgEngagementScore: avgEngagement,
      sampleSize: memories.length,
      bestPerformingExample: bestPost.postId,
      recommendation,
      confidence,
    },
    update: {
      avgEngagementScore: avgEngagement,
      sampleSize: memories.length,
      bestPerformingExample: bestPost.postId,
      recommendation,
      confidence,
      updatedAt: new Date(),
    },
  });
}

/**
 * Generate human-readable recommendation
 */
function generateRecommendation(
  suburb?: string | null,
  propertyType?: string | null,
  priceRange?: string | null,
  hookStyle?: string,
  avgEngagement?: number
): string {
  const parts: string[] = [];

  if (suburb) parts.push(`In ${suburb}`);
  if (propertyType) parts.push(propertyType + 's');
  if (priceRange) {
    const priceLabel = priceRange.replace('_', '-').replace('m', 'M');
    parts.push(`(${priceLabel})`);
  }

  const context = parts.join(' ') || 'For these properties';

  if (hookStyle) {
    return `${context}, "${hookStyle}" hooks are performing best with an avg engagement score of ${Math.round(avgEngagement || 0)}.`;
  }

  return `${context} have an average engagement score of ${Math.round(avgEngagement || 0)}.`;
}

/**
 * Get top insights for display/reporting
 */
export async function getTopInsights(limit: number = 10) {
  return prisma.insightPattern.findMany({
    where: {
      confidence: { gte: 0.5 }, // Only show patterns we're confident about
    },
    orderBy: [
      { confidence: 'desc' },
      { avgEngagementScore: 'desc' },
    ],
    take: limit,
  });
}

/**
 * Get performance comparison by agent
 */
export async function getAgentPerformance(agentId: string) {
  const memories = await prisma.contentMemory.findMany({
    where: { agentId },
    include: {
      post: {
        select: {
          address: true,
          suburb: true,
          price: true,
          createdAt: true,
        },
      },
    },
    orderBy: { engagementScore: 'desc' },
  });

  const totalPosts = memories.length;
  const avgEngagement =
    totalPosts > 0
      ? memories.reduce((sum, m) => sum + m.engagementScore, 0) / totalPosts
      : 0;

  const topPerformer = memories[0];

  return {
    agentId,
    totalPosts,
    avgEngagement: Math.round(avgEngagement),
    topPerformer: topPerformer
      ? {
          suburb: topPerformer.suburb,
          hookStyle: topPerformer.hookStyle,
          engagementScore: topPerformer.engagementScore,
          address: topPerformer.post.address,
        }
      : null,
  };
}

/**
 * Manually record an inquiry (lead) for a post
 */
export async function recordInquiry(postId: string): Promise<void> {
  const memory = await prisma.contentMemory.findUnique({
    where: { postId },
  });

  if (memory) {
    await prisma.contentMemory.update({
      where: { postId },
      data: {
        inquiries: memory.inquiries + 1,
        engagementScore: calculateEngagementScore({
          likes: memory.likes,
          comments: memory.comments,
          shares: memory.shares,
          clicks: memory.clicks || 0,
          inquiries: memory.inquiries + 1,
        }),
      },
    });
  }
}
