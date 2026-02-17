import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const agentId = searchParams.get('state'); // We passed agentId as state

  if (!code || !agentId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/agents?error=oauth_failed`
    );
  }

  try {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;

    if (!appId || !appSecret) {
      throw new Error('META_APP_ID or META_APP_SECRET not configured');
    }

    // Step 1: Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );

    const longLivedData = await longLivedResponse.json();
    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days

    // Step 3: Get user's Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    // Use first page by default (agent can have multiple pages, but we'll use the first one)
    const pageToken = pages[0]?.access_token || longLivedToken;
    const pageId = pages[0]?.id || null;

    // Step 4: Get Instagram Business Account connected to the Page
    let instagramUserId = null;
    let instagramToken = pageToken; // Instagram uses Page token

    if (pageId) {
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
      );

      const igData = await igResponse.json();
      instagramUserId = igData.instagram_business_account?.id || null;
    }

    // Step 5: Store tokens in database
    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        facebookToken: pageToken,
        facebookPageId: pageId,
        instagramToken: instagramToken,
        instagramUserId: instagramUserId,
        tokenExpires: expiryDate,
      },
    });

    // Redirect back to agents page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/agents?success=connected`
    );
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/agents?error=oauth_failed`
    );
  }
}
