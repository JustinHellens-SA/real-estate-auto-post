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

export async function POST(request: NextRequest) {
  try {
    const { postId, caption, coverImage } = await request.json();

    if (!postId || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get post from database
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Prepare images (cover image first, then property images)
    const propertyImages = JSON.parse(post.propertyImages);
    const allImages = coverImage 
      ? [coverImage, ...propertyImages]
      : propertyImages;

    // Check for required env variables
    const accessToken = process.env.META_ACCESS_TOKEN;
    const pageId = process.env.META_PAGE_ID;

    if (!accessToken || !pageId) {
      return NextResponse.json(
        { 
          error: 'Meta API credentials not configured',
          message: 'Please set META_ACCESS_TOKEN and META_PAGE_ID in .env file'
        },
        { status: 500 }
      );
    }

    const results = [];

    // Post to Facebook
    try {
      const fbResult = await postToFacebook({
        pageId,
        accessToken,
        message: caption,
        imageUrls: allImages,
      });
      results.push(fbResult);
    } catch (error: any) {
      console.error('Facebook error:', error);
      results.push({ success: false, platform: 'facebook', error: error.message });
    }

    // Post to Instagram
    try {
      const igResult = await postToInstagram({
        pageId,
        accessToken,
        message: caption,
        imageUrls: allImages,
      });
      results.push(igResult);
    } catch (error: any) {
      console.error('Instagram error:', error);
      results.push({ success: false, platform: 'instagram', error: error.message });
    }

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'posted',
        selectedCaption: caption,
        coverImageUrl: coverImage,
        postedAt: new Date(),
        metadata: JSON.stringify({ postResults: results }),
      },
    });

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      results,
      message: `Posted to ${successCount} platform(s)`,
    });
  } catch (error: any) {
    console.error('Post to Meta error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post to social media' },
      { status: 500 }
    );
  }
}
