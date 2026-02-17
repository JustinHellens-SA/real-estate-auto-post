import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the first (and should be only) branding settings record
    let settings = await prisma.brandingSettings.findFirst();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.brandingSettings.create({
        data: {
          companyName: 'Local Real Estate SA',
          tagline: 'MAKE YOUR NEXT MOVE A LOCAL ONE',
          primaryColor: '#f9b32d',    // Brand Orange
          secondaryColor: '#003d51',  // Brand Dark Teal
          accentColor1: '#ea4b8b',    // Brand Pink
          accentColor2: '#5dc2e8',    // Brand Cyan
          accentColor3: '#92c679',    // Brand Green
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branding settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get or create settings
    let settings = await prisma.brandingSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.brandingSettings.create({ data });
    } else {
      settings = await prisma.brandingSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { error: 'Failed to update branding settings' },
      { status: 500 }
    );
  }
}
