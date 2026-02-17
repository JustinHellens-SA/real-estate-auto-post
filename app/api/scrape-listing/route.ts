import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeListing } from '@/lib/scraper';
import { generateCaptions } from '@/lib/openai';
import { generateBrandedCoverImage } from '@/lib/image-generator';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { url, agentId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Step 1: Get agent details if provided
    let agent = null;
    if (agentId) {
      agent = await prisma.agent.findUnique({
        where: { id: agentId },
      });
    }

    // Step 2: Scrape the listing
    const listingData = await scrapeListing(url);

    // Step 3: Generate AI captions
    const captions = await generateCaptions({
      address: listingData.address || '',
      price: listingData.price,
      bedrooms: listingData.bedrooms,
      bathrooms: listingData.bathrooms,
      sqft: listingData.sqft,
      description: listingData.description,
      agentName: agent?.name,
      agentPhone: agent?.phone,
    });

    // Step 4: Generate branded cover image automatically
    let coverImageUrl = null;
    if (listingData.images && listingData.images.length > 0) {
      try {
        // Get branding settings
        const brandingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/branding`);
        const branding = brandingResponse.ok ? await brandingResponse.json() : null;

        const imageBuffer = await generateBrandedCoverImage({
          propertyImageUrl: listingData.images[0], // Use first property image
          address: listingData.address || 'Property Listing',
          price: listingData.price,
          bedrooms: listingData.bedrooms,
          bathrooms: listingData.bathrooms,
          sqft: listingData.sqft,
          agentName: agent?.name,
          agentPhone: agent?.phone,
          agentHeadshotUrl: agent?.headshotUrl,
          branding: branding,
        });

        // Save to public folder
        const fileName = `cover-${Date.now()}.jpg`;
        const filePath = path.join(process.cwd(), 'public', 'generated', fileName);
        
        // Ensure directory exists
        const fs = require('fs');
        const dir = path.join(process.cwd(), 'public', 'generated');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        await writeFile(filePath, imageBuffer);
        coverImageUrl = `/generated/${fileName}`;
      } catch (imageError) {
        console.error('Error generating cover image:', imageError);
        // Continue without cover image - not a critical failure
      }
    }

    // Step 5: Save to database
    const post = await prisma.post.create({
      data: {
        listingUrl: url,
        address: listingData.address || 'Unknown Address',
        price: listingData.price,
        bedrooms: listingData.bedrooms,
        bathrooms: listingData.bathrooms,
        sqft: listingData.sqft,
        description: listingData.description,
        propertyImages: JSON.stringify(listingData.images),
        coverImageUrl: coverImageUrl, // Auto-generated cover
        captions: JSON.stringify(captions),
        agentId: agentId,
        agentName: agent?.name,
        agentPhone: agent?.phone,
        agentPhoto: agent?.headshotUrl,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      postId: post.id,
      preview: {
        address: listingData.address,
        price: listingData.price,
        images: listingData.images.slice(0, 3),
        captions: captions,
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process listing' },
      { status: 500 }
    );
  }
}
