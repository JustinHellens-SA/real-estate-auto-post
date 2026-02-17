import axios from 'axios';
import { prisma } from './prisma';

const META_API_VERSION = 'v18.0';

interface PostingCredentials {
  facebookPageId: string;
  facebookToken: string;
  instagramUserId?: string;
  instagramToken?: string;
}

interface HybridPostParams {
  message: string;
  imageUrls: string[];
  postingMode: 'company' | 'personal' | 'both';
  agentId?: string;
}

async function getCompanyCredentials(): Promise<PostingCredentials> {
  const pageId = process.env.META_PAGE_ID;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const instagramId = process.env.META_INSTAGRAM_ACCOUNT_ID;

  if (!pageId || !pageToken) {
    throw new Error('Company Meta credentials not configured. Add META_PAGE_ID and META_PAGE_ACCESS_TOKEN to .env');
  }

  return {
    facebookPageId: pageId,
    facebookToken: pageToken,
    instagramUserId: instagramId,
    instagramToken: pageToken, // Instagram uses same token as Facebook
  };
}

async function getAgentCredentials(agentId: string): Promise<PostingCredentials> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      facebookToken: true,
      facebookPageId: true,
      instagramToken: true,
      instagramUserId: true,
      tokenExpires: true,
    },
  });

  if (!agent?.facebookToken || !agent.facebookPageId) {
    throw new Error('Agent has not connected their Facebook account');
  }

  // Check token expiry
  if (agent.tokenExpires && new Date(agent.tokenExpires) < new Date()) {
    throw new Error('Agent Facebook token has expired. Please reconnect in Agent Settings.');
  }

  return {
    facebookPageId: agent.facebookPageId,
    facebookToken: agent.facebookToken,
    instagramUserId: agent.instagramUserId || undefined,
    instagramToken: agent.instagramToken || agent.facebookToken,
  };
}

async function postToSingleAccount(
  credentials: PostingCredentials,
  message: string,
  imageUrls: string[]
): Promise<{ facebook?: string; instagram?: string }> {
  const results: { facebook?: string; instagram?: string } = {};

  // Post to Facebook
  try {
    const photoIds: string[] = [];

    // Upload photos
    for (const imageUrl of imageUrls.slice(0, 10)) {
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/${META_API_VERSION}/${credentials.facebookPageId}/photos`,
        {
          url: imageUrl,
          published: false,
          access_token: credentials.facebookToken,
        }
      );

      if (uploadResponse.data.id) {
        photoIds.push(uploadResponse.data.id);
      }
    }

    // Create post with photos
    const postResponse = await axios.post(
      `https://graph.facebook.com/${META_API_VERSION}/${credentials.facebookPageId}/feed`,
      {
        message,
        attached_media: photoIds.map((id) => ({ media_fbid: id })),
        access_token: credentials.facebookToken,
      }
    );

    results.facebook = postResponse.data.id;
  } catch (error: any) {
    console.error('Facebook posting error:', error.response?.data || error.message);
    throw new Error(
      `Facebook: ${error.response?.data?.error?.message || error.message}`
    );
  }

  // Post to Instagram if available
  if (credentials.instagramUserId && credentials.instagramToken) {
    try {
      if (imageUrls.length === 1) {
        // Single image post
        const containerResponse = await axios.post(
          `https://graph.facebook.com/${META_API_VERSION}/${credentials.instagramUserId}/media`,
          {
            image_url: imageUrls[0],
            caption: message,
            access_token: credentials.instagramToken,
          }
        );

        const containerId = containerResponse.data.id;

        // Publish the post
        const publishResponse = await axios.post(
          `https://graph.facebook.com/${META_API_VERSION}/${credentials.instagramUserId}/media_publish`,
          {
            creation_id: containerId,
            access_token: credentials.instagramToken,
          }
        );

        results.instagram = publishResponse.data.id;
      } else {
        // Carousel post for multiple images
        const itemIds: string[] = [];

        for (const imageUrl of imageUrls.slice(0, 10)) {
          const itemResponse = await axios.post(
            `https://graph.facebook.com/${META_API_VERSION}/${credentials.instagramUserId}/media`,
            {
              image_url: imageUrl,
              is_carousel_item: true,
              access_token: credentials.instagramToken,
            }
          );

          if (itemResponse.data.id) {
            itemIds.push(itemResponse.data.id);
          }
        }

        // Create carousel container
        const carouselResponse = await axios.post(
          `https://graph.facebook.com/${META_API_VERSION}/${credentials.instagramUserId}/media`,
          {
            media_type: 'CAROUSEL',
            caption: message,
            children: itemIds,
            access_token: credentials.instagramToken,
          }
        );

        const carouselId = carouselResponse.data.id;

        // Publish carousel
        const publishResponse = await axios.post(
          `https://graph.facebook.com/${META_API_VERSION}/${credentials.instagramUserId}/media_publish`,
          {
            creation_id: carouselId,
            access_token: credentials.instagramToken,
          }
        );

        results.instagram = publishResponse.data.id;
      }
    } catch (error: any) {
      console.error('Instagram posting error:', error.response?.data || error.message);
      // Don't throw - Instagram is optional
      console.warn(
        `Instagram post skipped: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  return results;
}

export async function postToMetaHybrid({
  message,
  imageUrls,
  postingMode,
  agentId,
}: HybridPostParams) {
  const results: {
    company?: { facebook?: string; instagram?: string };
    personal?: { facebook?: string; instagram?: string };
  } = {};

  try {
    // Post to company account
    if (postingMode === 'company' || postingMode === 'both') {
      const companyCredentials = await getCompanyCredentials();
      results.company = await postToSingleAccount(
        companyCredentials,
        message,
        imageUrls
      );
    }

    // Post to personal account
    if ((postingMode === 'personal' || postingMode === 'both') && agentId) {
      const agentCredentials = await getAgentCredentials(agentId);
      results.personal = await postToSingleAccount(
        agentCredentials,
        message,
        imageUrls
      );
    }

    return {
      success: true,
      results,
    };
  } catch (error: any) {
    console.error('Hybrid posting error:', error);
    throw error;
  }
}
