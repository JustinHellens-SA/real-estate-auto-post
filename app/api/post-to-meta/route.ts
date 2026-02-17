import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postToMetaHybrid } from '@/lib/meta-api-hybrid';

export async function POST(request: NextRequest) {
  try {
    const { 
      postId, 
      caption, 
      coverImage, 
      selectedImages,
      postingMode,
      agentId,
    } = await request.json();

    if (!postId || !caption || !selectedImages || selectedImages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields (postId, caption, or selectedImages)' },
        { status: 400 }
      );
    }

    // Combine cover image + selected property images
    const imageUrls = coverImage ? [coverImage, ...selectedImages] : selectedImages;

    // Post to Meta using hybrid approach
    const result = await postToMetaHybrid({
      message: caption,
      imageUrls,
      postingMode: postingMode || 'company',
      agentId: agentId,
    });

    // Update post status in database
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'posted',
        postedTo: postingMode || 'company',
        postedAt: new Date(),
        selectedCaption: caption,
        metaPostId: JSON.stringify(result.results),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Posted successfully!',
      results: result.results,
    });
  } catch (error: any) {
    console.error('Post to Meta error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to post to Meta',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
