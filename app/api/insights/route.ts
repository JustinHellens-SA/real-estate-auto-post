/**
 * API Route: /api/insights
 * 
 * Get learning insights and performance patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTopInsights, getAgentPerformance } from '@/lib/content-memory';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/insights
 * Returns top performing patterns and recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (agentId) {
      // Get agent-specific performance
      const performance = await getAgentPerformance(agentId);
      return NextResponse.json(performance);
    }

    // Get top insights across all posts
    const insights = await getTopInsights(limit);

    // Get overall stats
    const totalPosts = await prisma.post.count({
      where: { status: 'POSTED' },
    });

    const totalMemories = await prisma.contentMemory.count();

    const avgEngagement = await prisma.contentMemory.aggregate({
      _avg: {
        engagementScore: true,
      },
    });

    return NextResponse.json({
      insights,
      stats: {
        totalPosts,
        totalMemories,
        avgEngagement: Math.round(avgEngagement._avg.engagementScore || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
