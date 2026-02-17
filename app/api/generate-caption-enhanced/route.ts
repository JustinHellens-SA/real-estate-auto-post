/**
 * API Route: /api/generate-caption-enhanced
 * 
 * Generate AI captions with agent personality + historical learnings
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateEnhancedCaptions,
  getAgentPersonality,
  PropertyData,
} from '@/lib/ai-caption-enhanced';
import { PostWorkflow } from '@/lib/post-state-machine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, agentId, propertyData } = body;

    if (!agentId || !propertyData) {
      return NextResponse.json(
        { error: 'agentId and propertyData are required' },
        { status: 400 }
      );
    }

    // Fetch agent personality
    const agentPersonality = await getAgentPersonality(agentId);

    // Generate enhanced captions
    const captions = await generateEnhancedCaptions(
      propertyData as PropertyData,
      agentPersonality,
      true // Include insights
    );

    // If postId provided, update the post and transition state
    if (postId) {
      const { prisma } = await import('@/lib/prisma');
      
      await prisma.post.update({
        where: { id: postId },
        data: {
          captions: JSON.stringify(captions),
          // Optionally set first caption as selected by default
          selectedCaption: captions[0].caption,
          hashtags: captions[0].hashtags,
        },
      });

      // Transition to AI_GENERATED state
      await PostWorkflow.markAIGenerated(postId);
    }

    return NextResponse.json({
      success: true,
      captions,
    });
  } catch (error) {
    console.error('Error generating enhanced captions:', error);
    return NextResponse.json(
      { error: 'Failed to generate captions', details: (error as Error).message },
      { status: 500 }
    );
  }
}
