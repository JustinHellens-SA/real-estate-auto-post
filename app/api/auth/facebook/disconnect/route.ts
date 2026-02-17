import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    // Remove tokens from database
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        facebookToken: null,
        facebookPageId: null,
        instagramToken: null,
        instagramUserId: null,
        tokenExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Facebook:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Facebook' },
      { status: 500 }
    );
  }
}
