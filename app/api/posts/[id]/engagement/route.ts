/**
 * API Route: /api/posts/[id]/engagement
 * 
 * Record engagement metrics for a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordContentMemory, recordInquiry } from '@/lib/content-memory';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const body = await request.json();
    const { likes, comments, shares, reach, clicks, inquiries } = body;

    // Record engagement data
    await recordContentMemory(postId, {
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      reach,
      clicks,
      inquiries,
    });

    return NextResponse.json({
      success: true,
      message: 'Engagement recorded successfully',
    });
  } catch (error) {
    console.error('Error recording engagement:', error);
    return NextResponse.json(
      { error: 'Failed to record engagement' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[id]/engagement
 * Record an inquiry (lead) for this post
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    await recordInquiry(postId);

    return NextResponse.json({
      success: true,
      message: 'Inquiry recorded',
    });
  } catch (error) {
    console.error('Error recording inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to record inquiry' },
      { status: 500 }
    );
  }
}
