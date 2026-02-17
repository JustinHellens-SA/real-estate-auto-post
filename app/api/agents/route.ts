import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const agents = await prisma.agent.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      phone,
      email,
      headshotUrl,
      tonePreference,
      emojiLevel,
      hashtagPack,
      platformPriority,
      callToActionStyle,
    } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        phone,
        email,
        headshotUrl,
        tonePreference: tonePreference || 'professional',
        emojiLevel: emojiLevel || 'moderate',
        hashtagPack: hashtagPack ? JSON.stringify(hashtagPack) : null,
        platformPriority: platformPriority || 'both',
        callToActionStyle: callToActionStyle || null,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
