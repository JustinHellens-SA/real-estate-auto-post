import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
  }

  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;

  if (!appId) {
    return NextResponse.json(
      { error: 'META_APP_ID not configured in environment variables' },
      { status: 500 }
    );
  }

  // Facebook OAuth URL with required permissions
  const scope = [
    'pages_manage_posts',        // Post to Facebook Pages
    'pages_read_engagement',     // Read Page data
    'instagram_basic',           // Access Instagram account
    'instagram_content_publish', // Post to Instagram
    'business_management',       // Access Business accounts
  ].join(',');

  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&state=${agentId}&response_type=code`;

  // Redirect to Facebook OAuth
  return NextResponse.redirect(facebookAuthUrl);
}
